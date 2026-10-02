package com.example.ui

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.gestures.transformable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CenterFocusStrong
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.example.graph.ForceSimulation
import com.example.graph.SimNode
import com.example.model.ConnectionType
import com.example.model.DeviceType
import com.example.model.NetworkDevice
import com.example.model.NetworkLink
import com.example.model.SecurityStatus
import com.example.ui.theme.CyberBackground
import com.example.ui.theme.CyberCardBorder
import com.example.ui.theme.LinkEthernet
import com.example.ui.theme.LinkMesh
import com.example.ui.theme.LinkWifi2G
import com.example.ui.theme.LinkWifi5G
import com.example.ui.theme.NeonBlue
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.StatusCritical
import com.example.ui.theme.StatusScanning
import com.example.ui.theme.StatusSecure
import com.example.ui.theme.StatusWarning
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun NetworkTopologyGraphView(
  simulation: ForceSimulation,
  devices: List<NetworkDevice>,
  links: List<NetworkLink>,
  selectedDeviceId: String?,
  filterStatus: SecurityStatus?,
  filterDeviceType: DeviceType?,
  searchQuery: String,
  isSimulationActive: Boolean,
  onDeviceSelected: (NetworkDevice) -> Unit,
  onClearSelection: () -> Unit,
  onToggleSimulation: () -> Unit,
  modifier: Modifier = Modifier
) {
  var zoomScale by remember { mutableFloatStateOf(1.0f) }
  var panOffset by remember { mutableStateOf(Offset.Zero) }
  var draggingNodeId by remember { mutableStateOf<String?>(null) }
  var tickCount by remember { mutableLongStateOf(0L) }

  // Infinite animations for pulsing alerts & traffic packet flow
  val infiniteTransition = rememberInfiniteTransition(label = "pulse_and_traffic")
  val pulseAnim by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(1500, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "pulse"
  )
  val trafficPacketProgress by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(2200, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "traffic_flow"
  )

  // Simulation physics frame ticker
  LaunchedEffect(isSimulationActive) {
    if (isSimulationActive) {
      while (true) {
        withFrameMillis {
          simulation.tick()
          tickCount++
        }
      }
    }
  }

  // Two-finger transformable for pinch zoom & pan
  val transformableState = rememberTransformableState { zoomChange, offsetChange, _ ->
    zoomScale = (zoomScale * zoomChange).coerceIn(0.4f, 3.2f)
    panOffset += offsetChange
  }

  Box(
    modifier = modifier
      .fillMaxSize()
      .background(CyberBackground)
      .transformable(state = transformableState)
  ) {
    Canvas(
      modifier = Modifier
        .fillMaxSize()
        .testTag("network_topology_canvas")
        // Tap detector
        .pointerInput(simulation, devices, zoomScale, panOffset) {
          detectTapGestures(
            onTap = { tapOffset ->
              val graphX = (tapOffset.x - panOffset.x) / zoomScale
              val graphY = (tapOffset.y - panOffset.y) / zoomScale
              val hit = simulation.findNodeAt(graphX, graphY)
              if (hit != null) {
                val dev = devices.find { it.id == hit.id }
                if (dev != null) onDeviceSelected(dev)
              } else {
                onClearSelection()
              }
            }
          )
        }
        // Node drag detector
        .pointerInput(simulation, zoomScale, panOffset) {
          detectDragGestures(
            onDragStart = { startOffset ->
              val graphX = (startOffset.x - panOffset.x) / zoomScale
              val graphY = (startOffset.y - panOffset.y) / zoomScale
              val hit = simulation.findNodeAt(graphX, graphY)
              if (hit != null) {
                draggingNodeId = hit.id
                simulation.onDragStart(hit.id, graphX, graphY)
              }
            },
            onDrag = { change, dragAmount ->
              change.consume()
              val currentDragging = draggingNodeId
              if (currentDragging != null) {
                val node = simulation.nodeList.find { it.id == currentDragging }
                if (node != null) {
                  val newX = node.x + dragAmount.x / zoomScale
                  val newY = node.y + dragAmount.y / zoomScale
                  simulation.onDragMove(currentDragging, newX, newY)
                }
              } else {
                panOffset += dragAmount
              }
            },
            onDragEnd = {
              draggingNodeId?.let { simulation.onDragEnd(it) }
              draggingNodeId = null
            },
            onDragCancel = {
              draggingNodeId?.let { simulation.onDragEnd(it) }
              draggingNodeId = null
            }
          )
        }
    ) {
      // Re-center simulation if bounds changed
      if (simulation.centerX != size.width / 2f || simulation.centerY != size.height / 2f) {
        simulation.centerX = size.width / 2f
        simulation.centerY = size.height / 2f
      }

      val deviceMap = devices.associateBy { it.id }
      val nodeMap = simulation.nodeList.associateBy { it.id }

      // 1. Draw Cyberpunk Background Grid & Radar circles
      drawCyberGrid(panOffset, zoomScale)

      // Transform coordinate system for pan & zoom
      val toScreenX: (Float) -> Float = { x -> x * zoomScale + panOffset.x }
      val toScreenY: (Float) -> Float = { y -> y * zoomScale + panOffset.y }

      // 2. Draw Links (Edges) between connected devices
      for (link in links) {
        val sNode = nodeMap[link.sourceId] ?: continue
        val tNode = nodeMap[link.targetId] ?: continue
        val sDev = deviceMap[link.sourceId]
        val tDev = deviceMap[link.targetId]

        val sx = toScreenX(sNode.x)
        val sy = toScreenY(sNode.y)
        val tx = toScreenX(tNode.x)
        val ty = toScreenY(tNode.y)

        // Dim link if search or filter excludes either node
        val isHighlighted = isNodeMatching(sDev, filterStatus, filterDeviceType, searchQuery) &&
          isNodeMatching(tDev, filterStatus, filterDeviceType, searchQuery)
        val alphaMultiplier = if (isHighlighted) 1.0f else 0.25f

        val linkColor = when (link.connectionType) {
          ConnectionType.ETHERNET_10G, ConnectionType.ETHERNET_1G -> LinkEthernet
          ConnectionType.WIFI_5GHZ -> LinkWifi5G
          ConnectionType.WIFI_2_4GHZ -> LinkWifi2G
          ConnectionType.MESH_BACKHAUL -> LinkMesh
        }

        val strokeWidth = when (link.connectionType) {
          ConnectionType.ETHERNET_10G -> 3.5f * zoomScale
          ConnectionType.ETHERNET_1G -> 2.5f * zoomScale
          else -> 1.8f * zoomScale
        }

        // Draw connection line
        if (link.connectionType == ConnectionType.WIFI_5GHZ || link.connectionType == ConnectionType.WIFI_2_4GHZ) {
          drawLine(
            color = linkColor.copy(alpha = 0.65f * alphaMultiplier),
            start = Offset(sx, sy),
            end = Offset(tx, ty),
            strokeWidth = strokeWidth,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f * zoomScale, 8f * zoomScale), 0f),
            cap = StrokeCap.Round
          )
        } else {
          drawLine(
            color = linkColor.copy(alpha = 0.85f * alphaMultiplier),
            start = Offset(sx, sy),
            end = Offset(tx, ty),
            strokeWidth = strokeWidth,
            cap = StrokeCap.Round
          )
        }

        // Draw animated glowing traffic packet traversing the link
        if (isHighlighted && link.isActive) {
          val packetPhase = (trafficPacketProgress + (link.id.hashCode() % 1000) / 1000f) % 1.0f
          val px = sx + (tx - sx) * packetPhase
          val py = sy + (ty - sy) * packetPhase

          drawCircle(
            color = linkColor.copy(alpha = 0.9f),
            radius = (3.5f * zoomScale).coerceIn(2.5f, 6.5f),
            center = Offset(px, py)
          )
        }
      }

      // 3. Draw Nodes (Vertices)
      for (simNode in simulation.nodeList) {
        val dev = deviceMap[simNode.id] ?: continue
        val nx = toScreenX(simNode.x)
        val ny = toScreenY(simNode.y)
        val nRadius = simNode.radius * zoomScale
        val isSelected = simNode.id == selectedDeviceId
        val isMatching = isNodeMatching(dev, filterStatus, filterDeviceType, searchQuery)
        val nodeAlpha = if (isMatching) 1.0f else 0.35f

        drawDeviceNode(
          dev = dev,
          center = Offset(nx, ny),
          radius = nRadius,
          isSelected = isSelected,
          pulseProgress = pulseAnim,
          alpha = nodeAlpha,
          zoom = zoomScale,
          isDragging = simNode.id == draggingNodeId
        )
      }
    }

    // Floating overlay buttons for Pan/Zoom/Simulation controls
    FloatingControls(
      isSimulationActive = isSimulationActive,
      onToggleSimulation = onToggleSimulation,
      onZoomIn = { zoomScale = (zoomScale * 1.25f).coerceAtMost(3.2f) },
      onZoomOut = { zoomScale = (zoomScale / 1.25f).coerceAtLeast(0.4f) },
      onResetCenter = {
        zoomScale = 1.0f
        panOffset = Offset.Zero
        simulation.reheat(0.8f)
      },
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(bottom = 80.dp, end = 16.dp)
    )
  }
}

private fun DrawScope.drawCyberGrid(pan: Offset, zoom: Float) {
  val gridSize = 64f * zoom
  val startX = (pan.x % gridSize + gridSize) % gridSize
  val startY = (pan.y % gridSize + gridSize) % gridSize

  val gridColor = CyberCardBorder.copy(alpha = 0.25f)
  val dotColor = NeonCyan.copy(alpha = 0.18f)

  // Minor grid lines
  var x = startX
  while (x < size.width) {
    drawLine(
      color = gridColor,
      start = Offset(x, 0f),
      end = Offset(x, size.height),
      strokeWidth = 0.8f
    )
    x += gridSize
  }

  var y = startY
  while (y < size.height) {
    drawLine(
      color = gridColor,
      start = Offset(0f, y),
      end = Offset(size.width, y),
      strokeWidth = 0.8f
    )
    y += gridSize
  }

  // Cross dots at intersections
  x = startX
  while (x < size.width) {
    y = startY
    while (y < size.height) {
      drawCircle(
        color = dotColor,
        radius = 1.2f,
        center = Offset(x, y)
      )
      y += gridSize
    }
    x += gridSize
  }
}

private fun DrawScope.drawDeviceNode(
  dev: NetworkDevice,
  center: Offset,
  radius: Float,
  isSelected: Boolean,
  pulseProgress: Float,
  alpha: Float,
  zoom: Float,
  isDragging: Boolean
) {
  val statusColor = when (dev.securityStatus) {
    SecurityStatus.CRITICAL -> StatusCritical
    SecurityStatus.WARNING -> StatusWarning
    SecurityStatus.SECURE -> StatusSecure
    SecurityStatus.SCANNING -> StatusScanning
  }

  // 1. Pulsing warning halo ring for CRITICAL and WARNING
  if (dev.securityStatus == SecurityStatus.CRITICAL) {
    val haloRadius = radius + (14f * zoom * pulseProgress)
    drawCircle(
      color = StatusCritical.copy(alpha = (0.45f * (1f - pulseProgress) * alpha)),
      radius = haloRadius,
      center = center
    )
    drawCircle(
      color = StatusCritical.copy(alpha = 0.25f * alpha),
      radius = radius + 6f * zoom,
      center = center
    )
  } else if (dev.securityStatus == SecurityStatus.WARNING) {
    val haloRadius = radius + (8f * zoom * pulseProgress)
    drawCircle(
      color = StatusWarning.copy(alpha = (0.35f * (1f - pulseProgress) * alpha)),
      radius = haloRadius,
      center = center
    )
  }

  // 2. Gateway outer hexagon/ring
  if (dev.deviceType == DeviceType.GATEWAY) {
    drawCircle(
      color = NeonCyan.copy(alpha = 0.25f * alpha),
      radius = radius + 8f * zoom,
      center = center
    )
    drawCircle(
      color = NeonCyan.copy(alpha = 0.75f * alpha),
      radius = radius + 8f * zoom,
      center = center,
      style = Stroke(width = 1.5f * zoom, pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f)))
    )
  }

  // 3. Selection Reticle [  ]
  if (isSelected) {
    val selBoxSize = radius * 1.55f
    val cornerLen = 14f * zoom
    val selColor = NeonCyan

    // 4 Corner brackets
    val path = Path().apply {
      // Top-Left
      moveTo(center.x - selBoxSize, center.y - selBoxSize + cornerLen)
      lineTo(center.x - selBoxSize, center.y - selBoxSize)
      lineTo(center.x - selBoxSize + cornerLen, center.y - selBoxSize)

      // Top-Right
      moveTo(center.x + selBoxSize - cornerLen, center.y - selBoxSize)
      lineTo(center.x + selBoxSize, center.y - selBoxSize)
      lineTo(center.x + selBoxSize, center.y - selBoxSize + cornerLen)

      // Bottom-Right
      moveTo(center.x + selBoxSize, center.y + selBoxSize - cornerLen)
      lineTo(center.x + selBoxSize, center.y + selBoxSize)
      lineTo(center.x + selBoxSize - cornerLen, center.y + selBoxSize)

      // Bottom-Left
      moveTo(center.x - selBoxSize + cornerLen, center.y + selBoxSize)
      lineTo(center.x - selBoxSize, center.y + selBoxSize)
      lineTo(center.x - selBoxSize, center.y + selBoxSize - cornerLen)
    }

    drawPath(
      path = path,
      color = selColor,
      style = Stroke(width = 2.5f * zoom)
    )
  }

  // 4. Node Inner Solid Disc
  val bodyColor = if (isDragging) Color(0xFF1E293B) else Color(0xFF0F172A)
  drawCircle(
    color = bodyColor.copy(alpha = alpha),
    radius = radius,
    center = center
  )

  // 5. Node Outer Ring with Status Color
  drawCircle(
    color = statusColor.copy(alpha = alpha),
    radius = radius,
    center = center,
    style = Stroke(width = (if (dev.deviceType == DeviceType.GATEWAY) 3.5f else 2.5f) * zoom)
  )

  // 6. Draw Device Glyph / Icon inside the node
  drawDeviceGlyph(dev.deviceType, center, radius * 0.52f, statusColor, alpha, zoom)

  // 7. Security Alert Count Badge (if vulnerabilities exist)
  if (dev.vulnerabilities.isNotEmpty()) {
    val badgeCenter = Offset(center.x + radius * 0.72f, center.y - radius * 0.72f)
    val badgeRadius = 8.5f * zoom
    drawCircle(
      color = StatusCritical.copy(alpha = alpha),
      radius = badgeRadius,
      center = badgeCenter
    )
    drawContext.canvas.nativeCanvas.apply {
      val textPaint = Paint().apply {
        color = android.graphics.Color.WHITE
        textSize = 10f * zoom
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
        isAntiAlias = true
      }
      drawText(
        "${dev.vulnerabilities.size}",
        badgeCenter.x,
        badgeCenter.y + (3.5f * zoom),
        textPaint
      )
    }
  }

  // 8. Labels below node: IP and Hostname
  if (zoom >= 0.65f) {
    val labelY = center.y + radius + (14f * zoom)
    drawContext.canvas.nativeCanvas.apply {
      val ipPaint = Paint().apply {
        color = if (isSelected) NeonCyan.toArgb() else android.graphics.Color.WHITE
        textSize = (11f * zoom).coerceIn(9f, 15f)
        typeface = Typeface.MONOSPACE
        textAlign = Paint.Align.CENTER
        this.alpha = (255 * alpha).toInt()
        isAntiAlias = true
      }
      drawText(dev.ip, center.x, labelY, ipPaint)

      if (zoom >= 0.9f) {
        val hostPaint = Paint().apply {
          color = android.graphics.Color.argb((180 * alpha).toInt(), 148, 163, 184)
          textSize = (9.5f * zoom).coerceIn(8f, 13f)
          typeface = Typeface.DEFAULT
          textAlign = Paint.Align.CENTER
          isAntiAlias = true
        }
        val cleanHost = if (dev.hostname.length > 18) dev.hostname.take(16) + "…" else dev.hostname
        drawText(cleanHost, center.x, labelY + (12f * zoom), hostPaint)
      }
    }
  }
}

private fun DrawScope.drawDeviceGlyph(
  deviceType: DeviceType,
  center: Offset,
  size: Float,
  color: Color,
  alpha: Float,
  zoom: Float
) {
  val stroke = Stroke(width = 1.8f * zoom, cap = StrokeCap.Round)
  val paintColor = color.copy(alpha = alpha)

  when (deviceType) {
    DeviceType.GATEWAY -> {
      // Concentric signal arcs + center dot
      drawCircle(color = paintColor, radius = 3f * zoom, center = center)
      drawArc(
        color = paintColor,
        startAngle = 200f,
        sweepAngle = 140f,
        useCenter = false,
        topLeft = Offset(center.x - size * 0.7f, center.y - size * 0.7f),
        size = Size(size * 1.4f, size * 1.4f),
        style = stroke
      )
      drawArc(
        color = paintColor,
        startAngle = 210f,
        sweepAngle = 120f,
        useCenter = false,
        topLeft = Offset(center.x - size, center.y - size),
        size = Size(size * 2f, size * 2f),
        style = stroke
      )
    }

    DeviceType.SECURITY_CAMERA -> {
      // Camera cylinder + lens eye
      val camRect = Size(size * 1.3f, size * 0.85f)
      drawRoundRect(
        color = paintColor,
        topLeft = Offset(center.x - camRect.width / 2f - 2f * zoom, center.y - camRect.height / 2f),
        size = camRect,
        cornerRadius = CornerRadius(3f * zoom, 3f * zoom),
        style = stroke
      )
      // Lens circle
      drawCircle(
        color = paintColor,
        radius = size * 0.35f,
        center = Offset(center.x - 2f * zoom, center.y),
        style = stroke
      )
      // Stand leg
      drawLine(
        color = paintColor,
        start = Offset(center.x - 2f * zoom, center.y + camRect.height / 2f),
        end = Offset(center.x - 2f * zoom, center.y + camRect.height / 2f + 4f * zoom),
        strokeWidth = 2f * zoom
      )
    }

    DeviceType.SERVER_NAS -> {
      // Three stacked server shelves
      val shelfW = size * 1.4f
      val shelfH = size * 0.45f
      for (i in -1..1) {
        val sy = center.y + (i * (shelfH + 2.5f * zoom)) - shelfH / 2f
        drawRoundRect(
          color = paintColor,
          topLeft = Offset(center.x - shelfW / 2f, sy),
          size = Size(shelfW, shelfH),
          cornerRadius = CornerRadius(2f * zoom, 2f * zoom),
          style = stroke
        )
        // Indicator LED
        drawCircle(
          color = paintColor,
          radius = 1.2f * zoom,
          center = Offset(center.x + shelfW / 2f - 4f * zoom, sy + shelfH / 2f)
        )
      }
    }

    DeviceType.WORKSTATION -> {
      // Monitor rectangle + base
      val monW = size * 1.5f
      val monH = size * 1.0f
      drawRoundRect(
        color = paintColor,
        topLeft = Offset(center.x - monW / 2f, center.y - monH / 2f - 2f * zoom),
        size = Size(monW, monH),
        cornerRadius = CornerRadius(2.5f * zoom, 2.5f * zoom),
        style = stroke
      )
      // Stand stem & base
      drawLine(
        color = paintColor,
        start = Offset(center.x, center.y + monH / 2f - 2f * zoom),
        end = Offset(center.x, center.y + monH / 2f + 4f * zoom),
        strokeWidth = 2f * zoom
      )
      drawLine(
        color = paintColor,
        start = Offset(center.x - 5f * zoom, center.y + monH / 2f + 4f * zoom),
        end = Offset(center.x + 5f * zoom, center.y + monH / 2f + 4f * zoom),
        strokeWidth = 2f * zoom
      )
    }

    DeviceType.MOBILE -> {
      // Phone vertical rect + home notch
      val phoneW = size * 0.9f
      val phoneH = size * 1.5f
      drawRoundRect(
        color = paintColor,
        topLeft = Offset(center.x - phoneW / 2f, center.y - phoneH / 2f),
        size = Size(phoneW, phoneH),
        cornerRadius = CornerRadius(3f * zoom, 3f * zoom),
        style = stroke
      )
      drawCircle(
        color = paintColor,
        radius = 1f * zoom,
        center = Offset(center.x, center.y + phoneH / 2f - 3f * zoom)
      )
    }

    DeviceType.ACCESS_POINT -> {
      // Dome AP with radial broadcast waves
      drawCircle(color = paintColor, radius = 3.5f * zoom, center = center)
      for (i in 0 until 4) {
        val angle = i * 90f + 45f
        val rad = Math.toRadians(angle.toDouble())
        val ex = center.x + (cos(rad) * size * 0.8f).toFloat()
        val ey = center.y + (sin(rad) * size * 0.8f).toFloat()
        drawLine(
          color = paintColor,
          start = center,
          end = Offset(ex, ey),
          strokeWidth = 1.5f * zoom
        )
      }
    }

    DeviceType.ROGUE_UNKNOWN -> {
      // Exclamation diamond / hazard
      val diamond = Path().apply {
        moveTo(center.x, center.y - size * 0.9f)
        lineTo(center.x + size * 0.8f, center.y)
        lineTo(center.x, center.y + size * 0.9f)
        lineTo(center.x - size * 0.8f, center.y)
        close()
      }
      drawPath(path = diamond, color = paintColor, style = stroke)
      // Exclamation mark
      drawLine(
        color = paintColor,
        start = Offset(center.x, center.y - size * 0.4f),
        end = Offset(center.x, center.y + size * 0.1f),
        strokeWidth = 2f * zoom
      )
      drawCircle(color = paintColor, radius = 1.3f * zoom, center = Offset(center.x, center.y + size * 0.45f))
    }

    DeviceType.IOT_DEVICE -> {
      // Smart node / chip
      drawCircle(color = paintColor, radius = size * 0.45f, center = center, style = stroke)
      drawCircle(color = paintColor, radius = 2f * zoom, center = center)
      // 4 pin connectors
      drawLine(Offset(center.x, center.y - size * 0.8f), Offset(center.x, center.y - size * 0.45f), color = paintColor, strokeWidth = 1.5f * zoom)
      drawLine(Offset(center.x, center.y + size * 0.45f), Offset(center.x, center.y + size * 0.8f), color = paintColor, strokeWidth = 1.5f * zoom)
      drawLine(Offset(center.x - size * 0.8f, center.y), Offset(center.x - size * 0.45f, center.y), color = paintColor, strokeWidth = 1.5f * zoom)
      drawLine(Offset(center.x + size * 0.45f, center.y), Offset(center.x + size * 0.8f, center.y), color = paintColor, strokeWidth = 1.5f * zoom)
    }
  }
}

private fun isNodeMatching(
  dev: NetworkDevice?,
  filterStatus: SecurityStatus?,
  filterType: DeviceType?,
  query: String
): Boolean {
  if (dev == null) return true
  if (filterStatus != null && dev.securityStatus != filterStatus) return false
  if (filterType != null && dev.deviceType != filterType) return false
  if (query.isNotBlank()) {
    val q = query.trim().lowercase()
    val matchesIp = dev.ip.contains(q)
    val matchesHost = dev.hostname.lowercase().contains(q)
    val matchesVendor = dev.vendor.lowercase().contains(q)
    val matchesPort = dev.openPorts.any { it.port.toString().contains(q) || it.service.lowercase().contains(q) }
    return matchesIp || matchesHost || matchesVendor || matchesPort
  }
  return true
}

@Composable
private fun FloatingControls(
  isSimulationActive: Boolean,
  onToggleSimulation: () -> Unit,
  onZoomIn: () -> Unit,
  onZoomOut: () -> Unit,
  onResetCenter: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier,
    shape = CircleShape,
    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.85f),
    tonalElevation = 6.dp,
    shadowElevation = 8.dp
  ) {
    androidx.compose.foundation.layout.Column(
      modifier = Modifier.padding(4.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      IconButton(
        onClick = onResetCenter,
        modifier = Modifier.size(40.dp).testTag("btn_center_view")
      ) {
        Icon(
          imageVector = Icons.Default.CenterFocusStrong,
          contentDescription = "Center View",
          tint = NeonCyan,
          modifier = Modifier.size(20.dp)
        )
      }
      IconButton(
        onClick = onZoomIn,
        modifier = Modifier.size(40.dp).testTag("btn_zoom_in")
      ) {
        Icon(
          imageVector = Icons.Default.ZoomIn,
          contentDescription = "Zoom In",
          tint = Color.White,
          modifier = Modifier.size(22.dp)
        )
      }
      IconButton(
        onClick = onZoomOut,
        modifier = Modifier.size(40.dp).testTag("btn_zoom_out")
      ) {
        Icon(
          imageVector = Icons.Default.ZoomOut,
          contentDescription = "Zoom Out",
          tint = Color.White,
          modifier = Modifier.size(22.dp)
        )
      }
      IconButton(
        onClick = onToggleSimulation,
        modifier = Modifier.size(40.dp).testTag("btn_toggle_physics")
      ) {
        Icon(
          imageVector = if (isSimulationActive) Icons.Default.Pause else Icons.Default.PlayArrow,
          contentDescription = if (isSimulationActive) "Pause Physics" else "Resume Physics",
          tint = if (isSimulationActive) StatusSecure else StatusWarning,
          modifier = Modifier.size(22.dp)
        )
      }
    }
  }
}
