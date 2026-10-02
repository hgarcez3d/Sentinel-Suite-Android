import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { NetworkDevice, NetworkLink, SecurityStatus, DeviceType, HeatmapMode, SubnetThreatMetrics } from '../types/network';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Flame,
  Radio
} from 'lucide-react';
import {
  calculateDeviceThreat,
  computeSubnetMetrics,
  generateSubnetHullPath
} from '../utils/threatHeatmap';
import {
  TracerPacket,
  generateTracerPackets,
  updateTracerPackets
} from '../utils/packetTracer';
import { ThreatHeatmapControls } from './ThreatHeatmapControls';

interface NetworkGraphProps {
  devices: NetworkDevice[];
  links: NetworkLink[];
  selectedDevice: NetworkDevice | null;
  onSelectDevice: (device: NetworkDevice) => void;
  onClearSelection: () => void;
  filterStatus: SecurityStatus | null;
  filterType: DeviceType | null;
  searchQuery: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  devices,
  links,
  selectedDevice,
  onSelectDevice,
  onClearSelection,
  filterStatus,
  filterType,
  searchQuery
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkDevice, NetworkLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [isSimRunning, setIsSimRunning] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<NetworkDevice | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredLink, setHoveredLink] = useState<NetworkLink | null>(null);
  const [hoveredLinkPos, setHoveredLinkPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPacket, setHoveredPacket] = useState<TracerPacket | null>(null);
  const [hoveredPacketPos, setHoveredPacketPos] = useState<{ x: number; y: number } | null>(null);

  // Heatmap Overlay State (Clean mode: off by default, can be toggled on)
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('threat_index');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.45);
  const [selectedSubnetId, setSelectedSubnetId] = useState<string | null>(null);

  // Subnet threat metrics calculated dynamically based on current devices & mode
  const subnetMetrics = useMemo(() => {
    return computeSubnetMetrics(devices, heatmapMode);
  }, [devices, heatmapMode]);

  // Compute matched node IDs based on filters, search query, and subnet selection
  const matchingNodeIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const set = new Set<string>();

    const activeSubnet = selectedSubnetId ? subnetMetrics.find(s => s.subnetId === selectedSubnetId) : null;
    const subnetDeviceSet = activeSubnet ? new Set(activeSubnet.deviceIds) : null;

    devices.forEach(d => {
      let match = true;
      if (filterStatus && d.securityStatus !== filterStatus) match = false;
      if (filterType && d.deviceType !== filterType) match = false;
      if (subnetDeviceSet && !subnetDeviceSet.has(d.id)) match = false;
      if (q) {
        const inIp = d.ip.toLowerCase().includes(q);
        const inHost = d.hostname.toLowerCase().includes(q);
        const inVendor = d.vendor.toLowerCase().includes(q);
        const inPort = d.openPorts.some(p => p.port.toString().includes(q) || p.service.toLowerCase().includes(q));
        if (!inIp && !inHost && !inVendor && !inPort) match = false;
      }
      if (match) set.add(d.id);
    });

    return set;
  }, [devices, filterStatus, filterType, searchQuery, selectedSubnetId, subnetMetrics]);

  // Main D3 Simulation effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 700;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions: Filters, Markers, Patterns, Gradients
    const defs = svg.append('defs');

    // Glow filter for critical nodes
    const critGlow = defs.append('filter').attr('id', 'glow-critical').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    critGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const critMerge = critGlow.append('feMerge');
    critMerge.append('feMergeNode').attr('in', 'coloredBlur');
    critMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Glow filter for cyan / gateway
    const cyanGlow = defs.append('filter').attr('id', 'glow-cyan').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    cyanGlow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const cyanMerge = cyanGlow.append('feMerge');
    cyanMerge.append('feMergeNode').attr('in', 'coloredBlur');
    cyanMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Packet Tracer Glow Filter
    const pktGlow = defs.append('filter').attr('id', 'packet-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    pktGlow.append('feGaussianBlur').attr('stdDeviation', '2.8').attr('result', 'coloredBlur');
    const pktMerge = pktGlow.append('feMerge');
    pktMerge.append('feMergeNode').attr('in', 'coloredBlur');
    pktMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Subnet Contour Glow Filter
    const heatGlow = defs.append('filter').attr('id', 'heat-contour-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    heatGlow.append('feGaussianBlur').attr('stdDeviation', '10').attr('result', 'blur');
    const heatMerge = heatGlow.append('feMerge');
    heatMerge.append('feMergeNode').attr('in', 'blur');
    heatMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Heatmap Multi-stop Radial Gradients
    const heatGradients = [
      { id: 'heat-grad-critical', c1: 'rgba(239, 68, 68, 0.75)', c2: 'rgba(244, 63, 94, 0.38)', c3: 'rgba(239, 68, 68, 0)' },
      { id: 'heat-grad-high', c1: 'rgba(249, 115, 22, 0.7)', c2: 'rgba(251, 146, 60, 0.32)', c3: 'rgba(249, 115, 22, 0)' },
      { id: 'heat-grad-moderate', c1: 'rgba(234, 179, 8, 0.6)', c2: 'rgba(250, 204, 21, 0.28)', c3: 'rgba(234, 179, 8, 0)' },
      { id: 'heat-grad-low', c1: 'rgba(6, 182, 212, 0.5)', c2: 'rgba(34, 211, 238, 0.22)', c3: 'rgba(6, 182, 212, 0)' },
      { id: 'heat-grad-nominal', c1: 'rgba(16, 185, 129, 0.45)', c2: 'rgba(52, 211, 153, 0.18)', c3: 'rgba(16, 185, 129, 0)' }
    ];

    heatGradients.forEach(hg => {
      const radGrad = defs.append('radialGradient')
        .attr('id', hg.id)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      radGrad.append('stop').attr('offset', '0%').attr('stop-color', hg.c1);
      radGrad.append('stop').attr('offset', '45%').attr('stop-color', hg.c2);
      radGrad.append('stop').attr('offset', '100%').attr('stop-color', hg.c3);
    });

    // Background Grid Pattern
    const pattern = defs.append('pattern')
      .attr('id', 'cyber-grid')
      .attr('width', 60)
      .attr('height', 60)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('path')
      .attr('d', 'M 60 0 L 0 0 0 60')
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.5);

    pattern.append('circle')
      .attr('cx', 60)
      .attr('cy', 60)
      .attr('r', 1.2)
      .attr('fill', '#00e5ff')
      .attr('fill-opacity', 0.35);

    // Root Group for Zoom/Pan
    const g = svg.append('g').attr('class', 'graph-root');

    // Background Grid Rect inside zoom group
    g.append('rect')
      .attr('x', -3000)
      .attr('y', -3000)
      .attr('width', 6000)
      .attr('height', 6000)
      .attr('fill', 'url(#cyber-grid)')
      .attr('pointer-events', 'all')
      .on('click', () => {
        onClearSelection();
        if (selectedSubnetId) setSelectedSubnetId(null);
      });

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Initial transform centered
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));

    // Prepare Node data with radii
    const nodesData: NetworkDevice[] = devices.map(d => {
      const radius = d.deviceType === 'gateway' ? 44 : d.deviceType === 'access_point' ? 38 : d.deviceType === 'camera' || d.deviceType === 'server' ? 34 : 28;
      return {
        ...d,
        radius,
        x: d.x ?? width / 2 + (Math.random() - 0.5) * 350,
        y: d.y ?? height / 2 + (Math.random() - 0.5) * 350
      };
    });

    // Deep clone links so D3 can mutate source/target
    const linksData: NetworkLink[] = links.map(l => ({ ...l }));

    // Force Simulation Setup: spacious link distances and strong collision margins to prevent overlap
    const simulation = d3.forceSimulation<NetworkDevice>(nodesData)
      .force(
        'link',
        d3.forceLink<NetworkDevice, NetworkLink>(linksData)
          .id(d => d.id)
          .distance(d => {
            switch (d.connectionType) {
              case 'ethernet_10g': return 160;
              case 'ethernet_1g': return 210;
              case 'wifi_5g': return 260;
              case 'wifi_2g': return 310;
              default: return 230;
            }
          })
          .strength(0.65)
      )
      .force('charge', d3.forceManyBody().strength(d => (d as NetworkDevice).deviceType === 'gateway' ? -1800 : -1100).distanceMax(900))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<NetworkDevice>().radius(d => (d.radius || 30) + 55).strength(0.95))
      .alphaDecay(0.025);

    simulationRef.current = simulation;

    // Layer groups for proper z-indexing:
    // Heatmap Layer (Floor) -> Links -> Traffic -> Nodes
    const heatmapGroup = g.append('g')
      .attr('class', 'heatmap-layer')
      .attr('opacity', showHeatmap ? heatmapOpacity : 0)
      .style('display', showHeatmap ? 'inline' : 'none');

    const subnetHullsGroup = heatmapGroup.append('g').attr('class', 'subnet-hulls');
    const heatBlobsGroup = heatmapGroup.append('g').attr('class', 'node-heat-blobs');
    const epicentersGroup = heatmapGroup.append('g').attr('class', 'threat-epicenters');
    const subnetHudGroup = heatmapGroup.append('g').attr('class', 'subnet-hud-labels');

    const linkGroup = g.append('g').attr('class', 'links-layer');
    const trafficGroup = g.append('g').attr('class', 'traffic-layer');
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    // 1. Draw Heatmap Elements
    // 1a. Node Heat Blobs
    const heatBlobSelection = heatBlobsGroup.selectAll<SVGCircleElement, NetworkDevice>('circle.heat-blob')
      .data(nodesData, d => d.id)
      .join('circle')
      .attr('class', 'heat-blob pointer-events-none')
      .attr('r', d => {
        const threat = calculateDeviceThreat(d, heatmapMode);
        return threat.heatRadius;
      })
      .attr('fill', d => {
        const threat = calculateDeviceThreat(d, heatmapMode);
        if (threat.threatScore >= 75) return 'url(#heat-grad-critical)';
        if (threat.threatScore >= 50) return 'url(#heat-grad-high)';
        if (threat.threatScore >= 25) return 'url(#heat-grad-moderate)';
        if (threat.threatScore >= 10) return 'url(#heat-grad-low)';
        return 'url(#heat-grad-nominal)';
      })
      .attr('opacity', d => {
        const isDimmed = selectedSubnetId && d.subnet && !selectedSubnetId.includes(d.subnet.replace(/[^a-zA-Z0-9]/g, '_'));
        return isDimmed ? 0.15 : 1;
      });

    // 1b. Threat Epicenter Radar Rings (for highest-risk devices)
    const epicentersData = nodesData.filter(d => {
      const threat = calculateDeviceThreat(d, heatmapMode);
      return threat.threatScore >= 75;
    });

    const epicenterSelection = epicentersGroup.selectAll<SVGGElement, NetworkDevice>('g.epicenter')
      .data(epicentersData, d => d.id)
      .join('g')
      .attr('class', 'epicenter pointer-events-none');

    epicenterSelection.each(function () {
      const el = d3.select(this);
      el.selectAll('*').remove();
      [0, 1.2].forEach(delaySec => {
        el.append('circle')
          .attr('r', 25)
          .attr('fill', 'none')
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.8)
          .html(`
            <animate attributeName="r" values="30;120" dur="2.4s" begin="${delaySec}s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.8;0" dur="2.4s" begin="${delaySec}s" repeatCount="indefinite" />
          `);
      });
    });

    // 1c. Subnet Hulls (boundaries enclosing subnet devices)
    const subnetHullSelection = subnetHullsGroup.selectAll<SVGPathElement, SubnetThreatMetrics>('path.subnet-hull')
      .data(subnetMetrics, s => s.subnetId)
      .join('path')
      .attr('class', 'subnet-hull cursor-pointer transition-all duration-200')
      .attr('fill', s => s.color)
      .attr('fill-opacity', s => {
        const isSelected = selectedSubnetId === s.subnetId;
        if (selectedSubnetId && !isSelected) return 0.03;
        return s.threatLevel === 'critical' ? 0.15 : s.threatLevel === 'high' ? 0.11 : 0.08;
      })
      .attr('stroke', s => s.color)
      .attr('stroke-width', s => selectedSubnetId === s.subnetId ? 3.0 : 1.8)
      .attr('stroke-dasharray', '8,5')
      .attr('stroke-opacity', s => {
        if (selectedSubnetId && selectedSubnetId !== s.subnetId) return 0.2;
        return 0.85;
      })
      .on('click', (event, s) => {
        event.stopPropagation();
        setSelectedSubnetId(prev => prev === s.subnetId ? null : s.subnetId);
      });

    // 1d. Subnet HUD Badges
    const subnetHudSelection = subnetHudGroup.selectAll<SVGGElement, SubnetThreatMetrics>('g.subnet-hud-badge')
      .data(subnetMetrics, s => s.subnetId)
      .join('g')
      .attr('class', 'subnet-hud-badge cursor-pointer')
      .attr('opacity', s => {
        if (selectedSubnetId && selectedSubnetId !== s.subnetId) return 0.35;
        return 1;
      })
      .on('click', (event, s) => {
        event.stopPropagation();
        setSelectedSubnetId(prev => prev === s.subnetId ? null : s.subnetId);
      });

    subnetHudSelection.each(function (s) {
      const el = d3.select(this);
      el.selectAll('*').remove();

      const boxWidth = 200;
      const boxHeight = 44;

      el.append('rect')
        .attr('x', -boxWidth / 2)
        .attr('y', -boxHeight / 2)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('rx', 8)
        .attr('fill', '#09101f')
        .attr('fill-opacity', 0.94)
        .attr('stroke', s.color)
        .attr('stroke-width', selectedSubnetId === s.subnetId ? 2.2 : 1.2)
        .attr('stroke-opacity', 0.9);

      // Subnet CIDR
      el.append('text')
        .attr('x', -boxWidth / 2 + 10)
        .attr('y', -4)
        .attr('fill', '#ffffff')
        .attr('font-size', '11.5px')
        .attr('font-weight', '700')
        .attr('font-family', 'monospace')
        .text(s.cidr);

      // Threat Level Badge text
      el.append('text')
        .attr('x', boxWidth / 2 - 10)
        .attr('y', -4)
        .attr('text-anchor', 'end')
        .attr('fill', s.color)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'sans-serif')
        .text(s.threatLevel.toUpperCase());

      // VLAN Name & Host count
      el.append('text')
        .attr('x', -boxWidth / 2 + 10)
        .attr('y', 13)
        .attr('fill', '#94a3b8')
        .attr('font-size', '9.5px')
        .attr('font-family', 'sans-serif')
        .text(`${s.vlanName.length > 18 ? s.vlanName.slice(0, 16) + '…' : s.vlanName} · ${s.totalDevices}h`);

      // Threat score
      el.append('text')
        .attr('x', boxWidth / 2 - 10)
        .attr('y', 13)
        .attr('text-anchor', 'end')
        .attr('fill', s.color)
        .attr('font-size', '9.5px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'monospace')
        .text(`${s.compositeThreatScore}% Threat`);
    });

    // 2. Draw Links (Two Layers: Base Physical Track + Bandwidth-Intensified Animated Data Streams)
    // 2a. Underlying Base Track Lines
    const trackLinkSelection = linkGroup.selectAll<SVGLineElement, NetworkLink>('line.link-track')
      .data(linksData, d => `track-${d.id}`)
      .join('line')
      .attr('class', 'link-track pointer-events-none')
      .attr('stroke', d => {
        switch (d.connectionType) {
          case 'ethernet_10g':
          case 'ethernet_1g': return '#00e5ff';
          case 'wifi_5g': return '#10b981';
          case 'wifi_2g': return '#f59e0b';
          default: return '#a855f7';
        }
      })
      .attr('stroke-width', d => d.connectionType === 'ethernet_10g' ? 3.0 : d.connectionType === 'ethernet_1g' ? 2.2 : 1.6)
      .attr('stroke-opacity', d => {
        const sId = typeof d.source === 'object' ? d.source.id : d.source;
        const tId = typeof d.target === 'object' ? d.target.id : d.target;
        const match = matchingNodeIds.has(sId) && matchingNodeIds.has(tId);
        return match ? (d.isActive ? 0.22 : 0.08) : 0.04;
      });

    // 2b. Animated Data Stream Lines with Bandwidth-Intensified Stroke-Dasharray & Luminescence
    const streamLinkSelection = linkGroup.selectAll<SVGLineElement, NetworkLink>('line.link-stream')
      .data(linksData, d => `stream-${d.id}`)
      .join('line')
      .attr('class', 'link-stream cursor-pointer transition-all duration-150')
      .attr('stroke', d => {
        const util = Math.max(0.04, Math.min(1.0, d.bandwidthUtilization || 0.1));
        // Under extreme saturation (>0.65), illuminate to high-energy electric spectrum
        if (util >= 0.65) {
          return d.connectionType.startsWith('wifi') ? '#34d399' : '#e0f2fe';
        }
        switch (d.connectionType) {
          case 'ethernet_10g':
          case 'ethernet_1g': return '#00e5ff';
          case 'wifi_5g': return '#10b981';
          case 'wifi_2g': return '#f59e0b';
          default: return '#a855f7';
        }
      })
      .attr('stroke-width', d => {
        const util = Math.max(0.04, Math.min(1.0, d.bandwidthUtilization || 0.1));
        const baseWidth = d.connectionType === 'ethernet_10g' ? 2.6 : d.connectionType === 'ethernet_1g' ? 2.0 : 1.6;
        // Stroke width grows noticeably wider with heavy bandwidth utilization
        return (baseWidth + util * 3.6).toFixed(1);
      })
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', d => {
        const util = Math.max(0.04, Math.min(1.0, d.bandwidthUtilization || 0.1));
        // High utilization: dense, rapid packet bursts (long dash, small gap)
        // Low utilization: calm, widely spaced pulses (small dash, wide gap)
        const dashLen = Math.round(4 + util * 16);
        const gapLen = Math.max(3, Math.round(14 - util * 10));
        return `${dashLen},${gapLen}`;
      })
      .attr('stroke-opacity', d => {
        const sId = typeof d.source === 'object' ? d.source.id : d.source;
        const tId = typeof d.target === 'object' ? d.target.id : d.target;
        const match = matchingNodeIds.has(sId) && matchingNodeIds.has(tId);
        const util = Math.max(0.04, Math.min(1.0, d.bandwidthUtilization || 0.1));
        if (!match) return 0.08;
        return d.isActive ? Math.min(1.0, 0.42 + util * 0.58) : 0.12;
      })
      .attr('filter', d => {
        const util = Math.max(0.04, Math.min(1.0, d.bandwidthUtilization || 0.1));
        return util >= 0.55 ? 'url(#glow-cyan)' : null;
      })
      .on('mouseenter', (event, d) => {
        setHoveredLink(d);
        setHoveredLinkPos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', () => {
        setHoveredLink(null);
      });

    // 3. Draw Nodes
    const nodeSelection = nodeGroup.selectAll<SVGGElement, NetworkDevice>('g.node')
      .data(nodesData, d => d.id)
      .join('g')
      .attr('class', 'node cursor-pointer')
      .attr('opacity', d => matchingNodeIds.has(d.id) ? 1 : 0.2)
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectDevice(d);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        setHoverPos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .call(
        d3.drag<SVGGElement, NetworkDevice>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (!d.isPinned) {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    // Node Render Helpers: Halos, Circles, Icons, Badges
    nodeSelection.each(function (d) {
      const el = d3.select(this);
      const r = d.radius || 30;
      const isSelected = selectedDevice?.id === d.id;

      // Outer Pulsing Glow for Critical / Warning
      if (d.securityStatus === 'critical') {
        el.append('circle')
          .attr('class', 'pulse-halo-critical')
          .attr('r', r + 14)
          .attr('fill', '#ef4444')
          .attr('fill-opacity', 0.22)
          .attr('filter', 'url(#glow-critical)');

        el.append('circle')
          .attr('r', r + 6)
          .attr('fill', 'none')
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.65);
      } else if (d.securityStatus === 'warning') {
        el.append('circle')
          .attr('class', 'pulse-halo-warning')
          .attr('r', r + 10)
          .attr('fill', '#f59e0b')
          .attr('fill-opacity', 0.18);
      }

      // Gateway Outer Hexagon / Dash Ring
      if (d.deviceType === 'gateway') {
        el.append('circle')
          .attr('r', r + 8)
          .attr('fill', 'none')
          .attr('stroke', '#00e5ff')
          .attr('stroke-width', 1.8)
          .attr('stroke-dasharray', '8,4')
          .attr('stroke-opacity', 0.8)
          .attr('filter', 'url(#glow-cyan)');
      }

      // Selection Reticle Corners
      if (isSelected) {
        const box = r * 1.5;
        const corner = 12;
        const pathData = `
          M ${-box},${-box + corner} L ${-box},${-box} L ${-box + corner},${-box}
          M ${box - corner},${-box} L ${box},${-box} L ${box},${-box + corner}
          M ${box},${box - corner} L ${box},${box} L ${box - corner},${box}
          M ${-box + corner},${box} L ${-box},${box} L ${-box},${box - corner}
        `;
        el.append('path')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', '#00e5ff')
          .attr('stroke-width', 2.5);
      }

      // Node Base Body Circle
      el.append('circle')
        .attr('r', r)
        .attr('fill', d.isIsolated ? '#1f1315' : '#0f172a')
        .attr('stroke', () => {
          if (d.isIsolated) return '#6b7280';
          switch (d.securityStatus) {
            case 'critical': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'secure': return '#10b981';
            default: return '#00e5ff';
          }
        })
        .attr('stroke-width', d.deviceType === 'gateway' ? 3.5 : 2.5);

      // Device Type Icon Glyphs
      const iconGroup = el.append('g').attr('class', 'device-icon');
      const iconColor = d.securityStatus === 'critical' ? '#ef4444' : d.securityStatus === 'warning' ? '#f59e0b' : '#38bdf8';

      if (d.deviceType === 'gateway') {
        iconGroup.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 4).attr('fill', iconColor);
        iconGroup.append('path').attr('d', 'M -14 -6 A 16 16 0 0 1 14 -6').attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 2).attr('stroke-linecap', 'round');
        iconGroup.append('path').attr('d', 'M -10 -1 A 11 11 0 0 1 10 -1').attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 2).attr('stroke-linecap', 'round');
      } else if (d.deviceType === 'camera') {
        iconGroup.append('rect').attr('x', -14).attr('y', -8).attr('width', 22).attr('height', 16).attr('rx', 3).attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 2);
        iconGroup.append('circle').attr('cx', -3).attr('cy', 0).attr('r', 4).attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 1.8);
        iconGroup.append('path').attr('d', 'M 8 -4 L 14 -8 L 14 8 L 8 4 Z').attr('fill', iconColor);
      } else if (d.deviceType === 'server') {
        [-7, 0, 7].forEach(y => {
          iconGroup.append('rect').attr('x', -12).attr('y', y - 2.5).attr('width', 24).attr('height', 5).attr('rx', 1.5).attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 1.6);
          iconGroup.append('circle').attr('cx', 8).attr('cy', y).attr('r', 1.2).attr('fill', iconColor);
        });
      } else if (d.deviceType === 'workstation') {
        iconGroup.append('rect').attr('x', -12).attr('y', -10).attr('width', 24).attr('height', 15).attr('rx', 2).attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 1.8);
        iconGroup.append('line').attr('x1', 0).attr('y1', 5).attr('x2', 0).attr('y2', 10).attr('stroke', iconColor).attr('stroke-width', 2);
        iconGroup.append('line').attr('x1', -6).attr('y1', 10).attr('x2', 6).attr('y2', 10).attr('stroke', iconColor).attr('stroke-width', 2);
      } else if (d.deviceType === 'mobile') {
        iconGroup.append('rect').attr('x', -7).attr('y', -12).attr('width', 14).attr('height', 24).attr('rx', 3).attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 1.8);
        iconGroup.append('circle').attr('cx', 0).attr('cy', 7).attr('r', 1.2).attr('fill', iconColor);
      } else if (d.deviceType === 'rogue') {
        iconGroup.append('path').attr('d', 'M 0 -13 L 13 0 L 0 13 L -13 0 Z').attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2);
        iconGroup.append('line').attr('x1', 0).attr('y1', -6).attr('x2', 0).attr('y2', 1).attr('stroke', '#ef4444').attr('stroke-width', 2).attr('stroke-linecap', 'round');
        iconGroup.append('circle').attr('cx', 0).attr('cy', 5).attr('r', 1.3).attr('fill', '#ef4444');
      } else if (d.deviceType === 'access_point') {
        iconGroup.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 4).attr('fill', iconColor);
        [-60, 60, 180].forEach(deg => {
          const rad = (deg * Math.PI) / 180;
          iconGroup.append('line').attr('x1', 0).attr('y1', 0).attr('x2', Math.cos(rad) * 11).attr('y2', Math.sin(rad) * 11).attr('stroke', iconColor).attr('stroke-width', 1.8);
        });
      } else {
        iconGroup.append('rect').attr('x', -8).attr('y', -8).attr('width', 16).attr('height', 16).attr('rx', 2).attr('fill', 'none').attr('stroke', iconColor).attr('stroke-width', 1.8);
        iconGroup.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 3).attr('fill', iconColor);
      }

      // Vulnerability Alert Pill Badge (Top Right)
      if (d.vulnerabilities.length > 0) {
        const badgeG = el.append('g').attr('transform', `translate(${r * 0.72}, ${-r * 0.72})`);
        badgeG.append('circle').attr('r', 9).attr('fill', '#ef4444').attr('stroke', '#080c14').attr('stroke-width', 1.5);
        badgeG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '3.5px')
          .attr('fill', '#ffffff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'sans-serif')
          .text(d.vulnerabilities.length);
      }

      // IP & Hostname Label Badge with crisp readable background pill
      if (showLabels) {
        const labelG = el.append('g').attr('transform', `translate(0, ${r + 14})`);

        const ipText = d.ip;
        const hostText = d.hostname.length > 16 ? d.hostname.slice(0, 14) + '…' : d.hostname;
        const pillWidth = Math.max(90, ipText.length * 8 + 16);

        // Readable pill background to prevent overlap with links/heatmaps
        labelG.append('rect')
          .attr('x', -pillWidth / 2)
          .attr('y', -10)
          .attr('width', pillWidth)
          .attr('height', 28)
          .attr('rx', 6)
          .attr('fill', '#090e1a')
          .attr('fill-opacity', 0.92)
          .attr('stroke', isSelected ? '#00e5ff' : '#1e293b')
          .attr('stroke-width', 1);

        labelG.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 2)
          .attr('fill', isSelected ? '#00e5ff' : '#f8fafc')
          .attr('font-size', '10.5px')
          .attr('font-weight', '700')
          .attr('font-family', 'monospace')
          .text(ipText);

        labelG.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 14)
          .attr('fill', '#94a3b8')
          .attr('font-size', '9px')
          .attr('font-family', 'sans-serif')
          .text(hostText);
      }
    });

    // 4. Packet Tracer & Traffic Stream Engine
    // Generate tracer packets with count, route, and velocity strictly proportional to link bandwidth
    const tracerPackets = generateTracerPackets(linksData, nodesData);

    const packetSelection = trafficGroup.selectAll<SVGGElement, TracerPacket>('g.tracer-packet')
      .data(tracerPackets, p => p.id)
      .join('g')
      .attr('class', 'tracer-packet cursor-pointer')
      .on('mouseenter', (event, p) => {
        setHoveredPacket(p);
        setHoveredPacketPos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', () => {
        setHoveredPacket(null);
      });

    packetSelection.each(function (p) {
      const el = d3.select(this);
      el.selectAll('*').remove();

      // Motion comet tail behind the packet
      el.append('line')
        .attr('class', 'packet-tail')
        .attr('stroke', p.color)
        .attr('stroke-width', Math.max(1.4, p.size * 0.7))
        .attr('stroke-linecap', 'round')
        .attr('stroke-opacity', 0.65);

      // Warning pulse aura on flagged / high-risk connection packets
      if (p.isHighRisk) {
        el.append('circle')
          .attr('class', 'packet-aura')
          .attr('r', p.size + 4)
          .attr('fill', '#ef4444')
          .attr('fill-opacity', 0.35)
          .attr('filter', 'url(#glow-critical)');
      }

      // Packet core particle
      el.append('circle')
        .attr('class', 'packet-core')
        .attr('r', p.size)
        .attr('fill', p.coreColor)
        .attr('stroke', p.color)
        .attr('stroke-width', 1.4)
        .attr('filter', p.utilization >= 0.5 ? 'url(#packet-glow)' : null);
    });

    let trafficTimer: number;
    let lastTime = performance.now();
    const linkOffsets: { [id: string]: number } = {};
    linksData.forEach(l => {
      linkOffsets[l.id] = Math.random() * 100;
    });

    const renderTraffic = (currentTime: number) => {
      const dt = Math.min(60, currentTime - lastTime);
      lastTime = currentTime;

      if (showTraffic) {
        trafficGroup.attr('display', 'inline');

        // Dynamic SVG stroke-dasharray animation:
        // Intensifies velocity and pulse cadence based on bandwidth utilization
        streamLinkSelection.each(function (d) {
          if (!d.isActive) return;
          const util = Math.max(0.04, Math.min(1.0, d.bandwidthUtilization || 0.1));
          // Flow speed intensifies directly with bandwidth:
          // Low bandwidth (~22px/s) to Heavy saturation (~175px/s)
          const speedPxPerSec = 22 + Math.pow(util, 1.2) * 155;
          linkOffsets[d.id] = ((linkOffsets[d.id] || 0) - (speedPxPerSec * (dt / 1000))) % 2000;
          d3.select(this).attr('stroke-dashoffset', linkOffsets[d.id]);
        });

        // Fast node coordinate map for 60 FPS interpolation
        const nodePosMap = new Map<string, { x: number; y: number }>();
        nodesData.forEach(n => {
          if (typeof n.x === 'number' && typeof n.y === 'number') {
            nodePosMap.set(n.id, { x: n.x, y: n.y });
          }
        });

        // Advance packet particles at velocity strictly proportional to link bandwidth
        const dtSec = dt / 1000;
        const packetPositions = updateTracerPackets(tracerPackets, dtSec, id => nodePosMap.get(id) || null);

        const posById = new Map<string, typeof packetPositions[0]>();
        packetPositions.forEach(pos => posById.set(pos.id, pos));

        packetSelection.each(function (p) {
          const pos = posById.get(p.id);
          if (!pos) {
            d3.select(this).attr('opacity', 0);
            return;
          }

          const el = d3.select(this);
          el.attr('opacity', 1);

          el.select('line.packet-tail')
            .attr('x1', pos.tailX)
            .attr('y1', pos.tailY)
            .attr('x2', pos.cx)
            .attr('y2', pos.cy);

          el.select('circle.packet-core')
            .attr('cx', pos.cx)
            .attr('cy', pos.cy);

          if (p.isHighRisk) {
            el.select('circle.packet-aura')
              .attr('cx', pos.cx)
              .attr('cy', pos.cy);
          }
        });
      } else {
        trafficGroup.attr('display', 'none');
      }

      trafficTimer = requestAnimationFrame(renderTraffic);
    };

    trafficTimer = requestAnimationFrame(renderTraffic);

    // Tick update loop
    simulation.on('tick', () => {
      // 1. Update Heatmap positions
      if (showHeatmap) {
        heatBlobSelection
          .attr('cx', d => d.x || 0)
          .attr('cy', d => d.y || 0);

        epicenterSelection
          .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);

        subnetHullSelection.attr('d', s => {
          const sNodes = nodesData.filter(n => s.deviceIds.includes(n.id));
          const geom = generateSubnetHullPath(sNodes, 85);
          return geom ? geom.pathData : '';
        });

        subnetHudSelection.attr('transform', s => {
          // Only show floating HUD badge if the user has selected or focused this subnet, avoiding clutter
          if (!selectedSubnetId || selectedSubnetId !== s.subnetId) {
            return 'translate(-9999, -9999)';
          }
          const sNodes = nodesData.filter(n => s.deviceIds.includes(n.id));
          const geom = generateSubnetHullPath(sNodes, 85);
          if (!geom) return 'translate(-9999, -9999)';
          return `translate(${geom.centroid.x}, ${geom.centroid.y - 85})`;
        });
      }

      // 2. Update Links positions (both base tracks and animated stream lines)
      trackLinkSelection
        .attr('x1', d => (d.source as NetworkDevice).x || 0)
        .attr('y1', d => (d.source as NetworkDevice).y || 0)
        .attr('x2', d => (d.target as NetworkDevice).x || 0)
        .attr('y2', d => (d.target as NetworkDevice).y || 0);

      streamLinkSelection
        .attr('x1', d => (d.source as NetworkDevice).x || 0)
        .attr('y1', d => (d.source as NetworkDevice).y || 0)
        .attr('x2', d => (d.target as NetworkDevice).x || 0)
        .attr('y2', d => (d.target as NetworkDevice).y || 0);

      // 3. Update Nodes positions
      nodeSelection.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
      if (trafficTimer) cancelAnimationFrame(trafficTimer);
    };
  }, [devices, links, selectedDevice, matchingNodeIds, showLabels, showTraffic, showHeatmap, heatmapMode, heatmapOpacity, selectedSubnetId, subnetMetrics]);

  // Pause / Resume simulation handler
  const toggleSimulation = () => {
    if (!simulationRef.current) return;
    if (isSimRunning) {
      simulationRef.current.stop();
      setIsSimRunning(false);
    } else {
      simulationRef.current.alpha(0.5).restart();
      setIsSimRunning(true);
    }
  };

  // Reheat / Reorganize
  const reheatSimulation = () => {
    if (!simulationRef.current) return;
    simulationRef.current.alpha(0.8).restart();
    setIsSimRunning(true);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.77);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(500).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    reheatSimulation();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#080c14] overflow-hidden select-none">
      <svg
        ref={svgRef}
        className="w-full h-full block"
        style={{ minHeight: '500px' }}
      />

      {/* Floating Subnet Threat Heatmap Controls (Top-Left) */}
      <ThreatHeatmapControls
        enabled={showHeatmap}
        onToggleEnabled={() => setShowHeatmap(prev => !prev)}
        mode={heatmapMode}
        onSelectMode={setHeatmapMode}
        opacity={heatmapOpacity}
        onChangeOpacity={setHeatmapOpacity}
        subnets={subnetMetrics}
        selectedSubnetId={selectedSubnetId}
        onSelectSubnet={setSelectedSubnetId}
      />

      {/* Floating Canvas Controls Toolbar (Bottom-Right, offset to leave clear margin above bottom nav) */}
      <div className="absolute bottom-6 right-3 sm:bottom-8 sm:right-6 flex flex-col gap-1.5 sm:gap-2 bg-[#0f172a]/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-700/60 shadow-2xl z-20">
        <button
          onClick={handleResetZoom}
          title="Reset View & Center"
          className="p-2 sm:p-2.5 rounded-lg text-slate-300 hover:text-[#00e5ff] hover:bg-slate-800 transition-colors"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 sm:p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 sm:p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomOut size={16} />
        </button>
        <div className="h-px bg-slate-700/60 my-0.5" />
        <button
          onClick={() => setShowHeatmap(prev => !prev)}
          title={showHeatmap ? 'Hide Threat Heatmap Overlay' : 'Show Threat Heatmap Overlay'}
          className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
            showHeatmap ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' : 'text-slate-500 hover:bg-slate-800'
          }`}
        >
          <Flame size={16} className={showHeatmap ? 'animate-pulse' : ''} />
        </button>
        <button
          onClick={toggleSimulation}
          title={isSimRunning ? 'Pause Physics' : 'Resume Physics'}
          className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
            isSimRunning ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          {isSimRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={reheatSimulation}
          title="Re-shake / Layout Equilibrium"
          className="p-2 sm:p-2.5 rounded-lg text-slate-300 hover:text-[#00e5ff] hover:bg-slate-800 transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setShowTraffic(prev => !prev)}
          title={showTraffic ? 'Pause Packet Tracer (Speed ∝ Bandwidth)' : 'Enable Packet Tracer (Speed ∝ Bandwidth)'}
          className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
            showTraffic ? 'text-[#00e5ff] bg-cyan-500/15 border border-cyan-500/30' : 'text-slate-500 hover:bg-slate-800'
          }`}
        >
          <Radio size={16} className={showTraffic ? 'animate-pulse' : ''} />
        </button>
      </div>

      {/* Floating Topology Legend in Bottom-Left */}
      <div className="hidden sm:flex absolute bottom-6 left-6 bg-[#0f172a]/90 backdrop-blur-md px-3.5 py-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 z-10 pointer-events-none flex-col gap-2.5 shadow-2xl">
        {/* Link Protocol Section */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Link Protocol</div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-[#00e5ff] rounded-full inline-block" />
            <span>Gigabit Ethernet / Fiber</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-emerald-500 border-dashed rounded-full inline-block" />
            <span>Wi-Fi 6 (5GHz)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-amber-500 rounded-full inline-block" />
            <span>Wi-Fi 4 (2.4GHz)</span>
          </div>
          <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Animated Stream:</span>
            <span className="font-mono text-[#00e5ff] font-semibold">Dash Speed ∝ Bandwidth</span>
          </div>

          {/* Packet Tracer Section in Legend */}
          <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex flex-col gap-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Radio size={12} className={showTraffic ? 'text-[#00e5ff] animate-pulse' : 'text-slate-500'} />
                <span>Packet Tracer:</span>
              </span>
              <span className={`font-mono font-semibold ${showTraffic ? 'text-[#00e5ff]' : 'text-slate-500'}`}>
                {showTraffic ? 'Active (Speed ∝ Bandwidth)' : 'Paused'}
              </span>
            </div>
            {showTraffic && (
              <div className="flex items-center justify-between text-[9.5px] text-slate-400">
                <span>Velocity Scale:</span>
                <span className="font-mono text-cyan-300">38 px/s (Idle) → 308 px/s (Max)</span>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap Spectrum Section */}
        {showHeatmap && (
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Threat Density</span>
              <span className="text-[9.5px] font-mono text-cyan-400 uppercase">{heatmapMode.replace('_', ' ')}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                <span className="text-[10px] text-red-300 font-semibold">Critical (&gt;70)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] text-orange-300">High (45-70)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] text-amber-300">Mod (25-45)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-300">Nominal (&lt;25)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredNode && hoverPos && (
        <div
          className="fixed pointer-events-none z-50 bg-[#0f172a]/95 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-2xl text-xs max-w-xs transition-opacity duration-150"
          style={{
            left: `${hoverPos.x + 16}px`,
            top: `${hoverPos.y - 20}px`
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-white text-sm">{hoveredNode.hostname}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                hoveredNode.securityStatus === 'critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : hoveredNode.securityStatus === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {hoveredNode.securityStatus}
            </span>
          </div>
          <div className="font-mono text-cyan-400 mb-1">{hoveredNode.ip}</div>
          <div className="text-slate-400 text-[11px] mb-1.5">{hoveredNode.vendor}</div>
          {hoveredNode.subnet && (
            <div className="text-slate-400 text-[10.5px] mb-1.5 font-mono">
              Subnet: <span className="text-slate-200">{hoveredNode.subnet}</span> ({hoveredNode.vlanName || 'LAN'})
            </div>
          )}
          <div className="text-slate-300 text-[11px] flex items-center justify-between border-t border-slate-800 pt-1.5">
            <span>Ports: <strong className="text-white">{hoveredNode.openPorts.length} open</strong></span>
            <span>Latency: <strong className="text-white">{hoveredNode.latencyMs}ms</strong></span>
          </div>
          {hoveredNode.vulnerabilities.length > 0 && (
            <div className="mt-1.5 text-red-400 font-semibold flex items-center gap-1 text-[11px]">
              <ShieldAlert size={13} />
              <span>{hoveredNode.vulnerabilities.length} Vulnerability Detected</span>
            </div>
          )}
          {showHeatmap && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10.5px]">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Flame size={12} />
                <span>Threat Weight:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {calculateDeviceThreat(hoveredNode, heatmapMode).threatScore}/100
              </span>
            </div>
          )}
        </div>
      )}

      {/* Link Bandwidth Stream Tooltip */}
      {hoveredLink && hoveredLinkPos && (
        <div
          className="fixed pointer-events-none z-50 bg-[#0f172a]/95 backdrop-blur-md border border-cyan-500/50 p-3 rounded-xl shadow-2xl text-xs max-w-xs transition-opacity duration-150 animate-in fade-in"
          style={{
            left: `${hoveredLinkPos.x + 16}px`,
            top: `${hoveredLinkPos.y - 20}px`
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={13} className="text-[#00e5ff]" />
              {hoveredLink.connectionType.replace('_', ' ').toUpperCase()}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                hoveredLink.isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {hoveredLink.isActive ? 'Active Stream' : 'Quarantined'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono mb-2 flex items-center gap-1.5 truncate">
            <span className="text-white truncate">
              {typeof hoveredLink.source === 'object' ? (hoveredLink.source as NetworkDevice).hostname : hoveredLink.source}
            </span>
            <span className="text-[#00e5ff] font-bold">⇄</span>
            <span className="text-white truncate">
              {typeof hoveredLink.target === 'object' ? (hoveredLink.target as NetworkDevice).hostname : hoveredLink.target}
            </span>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Bandwidth Utilization:</span>
              <span className="font-mono font-bold text-[#00e5ff]">
                {Math.round((hoveredLink.bandwidthUtilization || 0.1) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((hoveredLink.bandwidthUtilization || 0.1) * 100)}%`,
                  backgroundColor:
                    hoveredLink.bandwidthUtilization >= 0.7
                      ? '#ef4444'
                      : hoveredLink.bandwidthUtilization >= 0.4
                      ? '#f59e0b'
                      : '#00e5ff'
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Dynamic Dash Speed:</span>
              <span className="font-mono text-cyan-300">
                {Math.round(22 + Math.pow(Math.max(0.04, Math.min(1.0, hoveredLink.bandwidthUtilization || 0.1)), 1.2) * 155)} px/s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Packet Tracer Telemetry Tooltip */}
      {hoveredPacket && hoveredPacketPos && (
        <div
          className="fixed pointer-events-none z-50 bg-[#0f172a]/95 backdrop-blur-md border border-cyan-500/70 p-3.5 rounded-xl shadow-2xl text-xs max-w-xs transition-opacity duration-150 animate-in fade-in"
          style={{
            left: `${hoveredPacketPos.x + 16}px`,
            top: `${hoveredPacketPos.y - 20}px`
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={13} className="text-[#00e5ff] animate-pulse" />
              <span>{hoveredPacket.packetType.replace('_', ' ')}</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                hoveredPacket.isHighRisk
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {hoveredPacket.isHighRisk ? 'Flagged Payload' : 'Verified Transit'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono mb-2 flex items-center gap-1.5 truncate">
            <span className="text-white truncate font-semibold">{hoveredPacket.sourceName}</span>
            <span className="text-[#00e5ff] font-bold">➔</span>
            <span className="text-white truncate font-semibold">{hoveredPacket.targetName}</span>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Packet Velocity:</span>
              <span className="font-mono font-bold text-[#00e5ff]">
                {hoveredPacket.speedPxPerSec} px/s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Link Bandwidth:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {Math.round(hoveredPacket.utilization * 100)}% Saturation
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Direction:</span>
              <span className="font-mono text-slate-300">
                {hoveredPacket.direction === 'forward' ? 'TX (Outbound Data)' : 'RX (Inbound Response)'}
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10.5px] text-slate-300">
              <span className="text-slate-400 block mb-0.5 font-sans">Payload Inspection:</span>
              <span className={`font-mono ${hoveredPacket.isHighRisk ? 'text-red-300' : 'text-cyan-200'}`}>
                {hoveredPacket.payloadSummary}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
