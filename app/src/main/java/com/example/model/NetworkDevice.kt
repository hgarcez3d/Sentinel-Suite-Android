package com.example.model

enum class DeviceType(val label: String, val iconName: String) {
  GATEWAY("Core Gateway / Router", "router"),
  ACCESS_POINT("Wi-Fi Access Point", "wifi"),
  SECURITY_CAMERA("IP Security Camera", "videocam"),
  SERVER_NAS("Server / NAS Storage", "dns"),
  WORKSTATION("Workstation / PC", "computer"),
  MOBILE("Smartphone / Tablet", "smartphone"),
  IOT_DEVICE("Smart Home / IoT", "devices_other"),
  ROGUE_UNKNOWN("Unidentified / Rogue Device", "warning")
}

enum class SecurityStatus(val label: String) {
  SECURE("Hardened / Low Risk"),
  WARNING("Suspicious / Audit Needed"),
  CRITICAL("Critical Vulnerability"),
  SCANNING("Fingerprinting in Progress")
}

enum class ConnectionType(val label: String, val speed: String) {
  ETHERNET_10G("10G Fiber Uplink", "10 Gbps"),
  ETHERNET_1G("Gigabit Ethernet", "1 Gbps"),
  WIFI_5GHZ("Wi-Fi 6 (5GHz)", "866 Mbps"),
  WIFI_2_4GHZ("Wi-Fi 4 (2.4GHz)", "150 Mbps"),
  MESH_BACKHAUL("Mesh Wireless Backhaul", "1.2 Gbps")
}

data class PortInfo(
  val port: Int,
  val protocol: String = "tcp",
  val service: String,
  val state: String = "open",
  val version: String = "",
  val isHighRisk: Boolean = false,
  val riskNotes: String = ""
)

data class Vulnerability(
  val cveId: String,
  val severity: String, // "CRITICAL", "HIGH", "MEDIUM"
  val cvssScore: Float,
  val title: String,
  val description: String,
  val remediation: String
)

data class NetworkDevice(
  val id: String,
  val ip: String,
  val mac: String,
  val hostname: String,
  val deviceType: DeviceType,
  val vendor: String,
  val osFingerprint: String,
  val securityStatus: SecurityStatus,
  val connectedToId: String? = null,
  val connectionType: ConnectionType = ConnectionType.WIFI_5GHZ,
  val openPorts: List<PortInfo> = emptyList(),
  val vulnerabilities: List<Vulnerability> = emptyList(),
  val latencyMs: Int = 4,
  val rssiSignalDbm: Int = -52,
  val rxRateKbps: Float = 120f,
  val txRateKbps: Float = 340f,
  val lastScanned: String = "Just now",
  val isIsolated: Boolean = false,
  val customNotes: String = ""
)

data class NetworkLink(
  val id: String,
  val sourceId: String,
  val targetId: String,
  val connectionType: ConnectionType,
  val isActive: Boolean = true,
  val bandwidthUtilization: Float = 0.35f
)
