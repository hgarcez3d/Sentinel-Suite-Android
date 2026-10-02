package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.SampleNetworkData
import com.example.graph.ForceSimulation
import com.example.graph.SimLink
import com.example.graph.SimNode
import com.example.model.ConnectionType
import com.example.model.DeviceType
import com.example.model.LogType
import com.example.model.NetworkDevice
import com.example.model.NetworkLink
import com.example.model.NmapLogLine
import com.example.model.PortInfo
import com.example.model.ScanProfile
import com.example.model.SecurityStatus
import com.example.model.Vulnerability
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.random.Random

class TopologyViewModel : ViewModel() {

  private val _devices = MutableStateFlow<List<NetworkDevice>>(emptyList())
  val devices: StateFlow<List<NetworkDevice>> = _devices.asStateFlow()

  private val _links = MutableStateFlow<List<NetworkLink>>(emptyList())
  val links: StateFlow<List<NetworkLink>> = _links.asStateFlow()

  private val _selectedDevice = MutableStateFlow<NetworkDevice?>(null)
  val selectedDevice: StateFlow<NetworkDevice?> = _selectedDevice.asStateFlow()

  private val _isDetailSheetOpen = MutableStateFlow(false)
  val isDetailSheetOpen: StateFlow<Boolean> = _isDetailSheetOpen.asStateFlow()

  private val _isSimulationActive = MutableStateFlow(true)
  val isSimulationActive: StateFlow<Boolean> = _isSimulationActive.asStateFlow()

  private val _searchQuery = MutableStateFlow("")
  val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

  private val _statusFilter = MutableStateFlow<SecurityStatus?>(null)
  val statusFilter: StateFlow<SecurityStatus?> = _statusFilter.asStateFlow()

  private val _typeFilter = MutableStateFlow<DeviceType?>(null)
  val typeFilter: StateFlow<DeviceType?> = _typeFilter.asStateFlow()

  private val _selectedScanProfile = MutableStateFlow(ScanProfile.FULL_AUDIT)
  val selectedScanProfile: StateFlow<ScanProfile> = _selectedScanProfile.asStateFlow()

  private val _selectedSubnet = MutableStateFlow("192.168.1.0/24")
  val selectedSubnet: StateFlow<String> = _selectedSubnet.asStateFlow()

  private val _isScanning = MutableStateFlow(false)
  val isScanning: StateFlow<Boolean> = _isScanning.asStateFlow()

  private val _scanProgress = MutableStateFlow(0f)
  val scanProgress: StateFlow<Float> = _scanProgress.asStateFlow()

  private val _scanLogs = MutableStateFlow<List<NmapLogLine>>(emptyList())
  val scanLogs: StateFlow<List<NmapLogLine>> = _scanLogs.asStateFlow()

  val simulation = ForceSimulation()

  private var scanJob: Job? = null

  init {
    loadInitialTopology()
  }

  private fun loadInitialTopology() {
    val initialDevs = SampleNetworkData.getInitialDevices()
    val initialLinks = SampleNetworkData.getInitialLinks()

    _devices.value = initialDevs
    _links.value = initialLinks

    syncSimulationData(initialDevs, initialLinks)
    addLog(
      "Nmap initialized: topology engine loaded 12 nodes across subnet 192.168.1.0/24",
      LogType.INFO
    )
  }

  private fun syncSimulationData(devs: List<NetworkDevice>, links: List<NetworkLink>) {
    val simNodes = devs.map { dev ->
      val radius = when (dev.deviceType) {
        DeviceType.GATEWAY -> 44f
        DeviceType.ACCESS_POINT -> 36f
        DeviceType.SERVER_NAS, DeviceType.WORKSTATION -> 32f
        DeviceType.SECURITY_CAMERA -> 30f
        DeviceType.ROGUE_UNKNOWN -> 30f
        else -> 26f
      }
      val mass = if (dev.deviceType == DeviceType.GATEWAY) 3.5f else 1.0f
      SimNode(
        id = dev.id,
        x = simulation.centerX + (Random.nextFloat() - 0.5f) * 300f,
        y = simulation.centerY + (Random.nextFloat() - 0.5f) * 300f,
        radius = radius,
        mass = mass,
        isGateway = dev.deviceType == DeviceType.GATEWAY
      )
    }

    val simLinks = links.map { link ->
      val dist = when (link.connectionType) {
        ConnectionType.ETHERNET_10G -> 110f
        ConnectionType.ETHERNET_1G -> 140f
        ConnectionType.WIFI_5GHZ -> 170f
        ConnectionType.WIFI_2_4GHZ -> 210f
        ConnectionType.MESH_BACKHAUL -> 150f
      }
      SimLink(
        sourceId = link.sourceId,
        targetId = link.targetId,
        targetDistance = dist,
        strength = 0.8f
      )
    }

    simulation.updateData(simNodes, simLinks)
  }

  fun selectDevice(device: NetworkDevice) {
    _selectedDevice.value = device
    _isDetailSheetOpen.value = true
  }

  fun closeDetailSheet() {
    _isDetailSheetOpen.value = false
    _selectedDevice.value = null
  }

  fun togglePin(deviceId: String) {
    simulation.togglePin(deviceId)
  }

  fun isNodePinned(deviceId: String): Boolean {
    return simulation.nodeList.find { it.id == deviceId }?.isPinned == true
  }

  fun toggleDeviceIsolation(deviceId: String) {
    _devices.value = _devices.value.map { dev ->
      if (dev.id == deviceId) {
        val isolated = !dev.isIsolated
        addLog(
          if (isolated) {
            "QUARANTINE ENFORCED: Device ${dev.ip} (${dev.hostname}) isolated from gateway routing."
          } else {
            "QUARANTINE LIFTED: Device ${dev.ip} restored to normal traffic."
          },
          if (isolated) LogType.WARNING else LogType.SUCCESS
        )
        dev.copy(isIsolated = isolated)
      } else {
        dev
      }
    }
    // Update selected device reference if active
    if (_selectedDevice.value?.id == deviceId) {
      _selectedDevice.value = _devices.value.find { it.id == deviceId }
    }
  }

  fun rescanSingleDevice(device: NetworkDevice) {
    viewModelScope.launch {
      addLog("Starting targeted Nmap scan on ${device.ip} (-sS -sV -O --script vuln)...", LogType.COMMAND)
      delay(600)
      addLog("Host ${device.ip} is up (latency: ${device.latencyMs}ms). Probing ${device.openPorts.size} ports...", LogType.INFO)
      delay(700)
      addLog("Scanned ${device.ip}: ${device.vulnerabilities.size} vulnerabilities re-verified.", if (device.vulnerabilities.isNotEmpty()) LogType.CRITICAL else LogType.SUCCESS)
      simulation.reheat(0.5f)
    }
  }

  fun setSearchQuery(query: String) {
    _searchQuery.value = query
  }

  fun setStatusFilter(status: SecurityStatus?) {
    _statusFilter.value = status
  }

  fun setTypeFilter(type: DeviceType?) {
    _typeFilter.value = type
  }

  fun setScanProfile(profile: ScanProfile) {
    _selectedScanProfile.value = profile
  }

  fun setSubnet(subnet: String) {
    _selectedSubnet.value = subnet
  }

  fun toggleSimulation() {
    _isSimulationActive.value = !_isSimulationActive.value
    if (_isSimulationActive.value) {
      simulation.reheat(0.6f)
    }
  }

  fun startNmapScan() {
    if (_isScanning.value) return
    scanJob?.cancel()

    scanJob = viewModelScope.launch {
      _isScanning.value = true
      _scanProgress.value = 0.05f

      val profile = _selectedScanProfile.value
      val subnet = _selectedSubnet.value

      addLog("Starting Nmap 7.94 ( https://nmap.org ) at ${getFormattedTimestamp()}", LogType.COMMAND)
      addLog("Initiating ${profile.title} on subnet $subnet", LogType.INFO)
      delay(400)

      _scanProgress.value = 0.20f
      addLog("ARP Ping Scan: Sending ARP requests across $subnet...", LogType.INFO)
      delay(500)

      addLog("Nmap scan report for 192.168.1.1 (cisco-rv340.gateway.lan) [UP]", LogType.SUCCESS)
      addLog("Nmap scan report for 192.168.1.2 (unifi-u6-pro.lan) [UP]", LogType.SUCCESS)
      _scanProgress.value = 0.40f
      delay(400)

      addLog("Probing ports 80, 554, 8000 on 192.168.1.104 (cam-backyard-ptz)...", LogType.INFO)
      delay(400)
      addLog("ALERT: Discovered open RTSP feed on 192.168.1.104:554 (No Auth Header required)", LogType.CRITICAL)
      addLog("CVE-2021-36260 match confirmed: Hikvision Command Injection signature found", LogType.CRITICAL)

      _scanProgress.value = 0.65f
      delay(500)
      addLog("Scanning wireless devices on UniFi AP (192.168.1.2)...", LogType.INFO)
      delay(400)
      addLog("WARNING: Discovered 192.168.1.199 with open unauthenticated Telnet shell (port 23)", LogType.CRITICAL)

      // Optionally discover a new stealth device during scan!
      val existingIds = _devices.value.map { it.id }.toSet()
      if (!existingIds.contains("dev-hidden-drone")) {
        delay(400)
        _scanProgress.value = 0.85f
        addLog("NEW HOST DETECTED: 192.168.1.210 (DJI Drone / Flight Controller AP)", LogType.WARNING)
        addLog("Fingerprint: DJI Core Flight System (Linux 4.14 embedded)", LogType.INFO)

        val newDroneDevice = NetworkDevice(
          id = "dev-hidden-drone",
          ip = "192.168.1.210",
          mac = "60:60:1F:B4:77:88",
          hostname = "dji-mavic-flight.lan",
          deviceType = DeviceType.ROGUE_UNKNOWN,
          vendor = "SZ DJI Technology",
          osFingerprint = "Linux 4.14 / DJI RTOS Embedded",
          securityStatus = SecurityStatus.WARNING,
          connectedToId = "dev-ap",
          connectionType = ConnectionType.WIFI_5GHZ,
          openPorts = listOf(
            PortInfo(2323, "tcp", "dji-telemetry", "open", "DJI Ground Link Protocol", true, "Unencrypted telemetry broadcast"),
            PortInfo(8080, "tcp", "http", "open", "Drone Flight WebAPI", false)
          ),
          vulnerabilities = listOf(
            Vulnerability(
              cveId = "AUDIT-DRONE-STREAM",
              severity = "MEDIUM",
              cvssScore = 6.4f,
              title = "Unencrypted Flight Telemetry Broadcast",
              description = "Flight telemetry stream is broadcasting GPS and compass vectors unencrypted over local Wi-Fi port 2323.",
              remediation = "Enable WPA3 Enterprise authentication and restrict telemetry port access via firewall."
            )
          ),
          latencyMs = 15,
          rxRateKbps = 240f,
          txRateKbps = 1800f,
          lastScanned = "Nmap Live Scan"
        )

        val updatedDevs = _devices.value + newDroneDevice
        val updatedLinks = _links.value + NetworkLink(
          id = "link-dev-ap-dev-hidden-drone",
          sourceId = "dev-ap",
          targetId = "dev-hidden-drone",
          connectionType = ConnectionType.WIFI_5GHZ
        )

        _devices.value = updatedDevs
        _links.value = updatedLinks
        syncSimulationData(updatedDevs, updatedLinks)
        simulation.reheat(0.8f)
      }

      _scanProgress.value = 1.0f
      delay(300)
      addLog("Nmap done: ${_devices.value.size} IP addresses (${_devices.value.size} hosts up) scanned in 2.84 seconds", LogType.SUCCESS)
      addLog("Topology graph updated with current security statuses.", LogType.INFO)
      _isScanning.value = false
    }
  }

  fun stopNmapScan() {
    scanJob?.cancel()
    _isScanning.value = false
    addLog("Nmap scan aborted by user.", LogType.WARNING)
  }

  private fun addLog(text: String, type: LogType) {
    val line = NmapLogLine(
      timestamp = getFormattedTimestamp(),
      text = text,
      type = type
    )
    _scanLogs.value = (_scanLogs.value + line).takeLast(100)
  }

  private fun getFormattedTimestamp(): String {
    val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    return sdf.format(Date())
  }
}
