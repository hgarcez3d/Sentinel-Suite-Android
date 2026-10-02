package com.example.data

import com.example.model.ConnectionType
import com.example.model.DeviceType
import com.example.model.NetworkDevice
import com.example.model.NetworkLink
import com.example.model.PortInfo
import com.example.model.SecurityStatus
import com.example.model.Vulnerability

object SampleNetworkData {

  fun getInitialDevices(): List<NetworkDevice> {
    return listOf(
      // Central Gateway
      NetworkDevice(
        id = "dev-gw",
        ip = "192.168.1.1",
        mac = "00:1A:2B:6F:89:01",
        hostname = "cisco-rv340.gateway.lan",
        deviceType = DeviceType.GATEWAY,
        vendor = "Cisco Systems",
        osFingerprint = "Linux 4.1.52 / Cisco RV-OS v1.4",
        securityStatus = SecurityStatus.SECURE,
        connectedToId = null,
        connectionType = ConnectionType.ETHERNET_10G,
        openPorts = listOf(
          PortInfo(53, "udp", "domain", "open", "dnsmasq 2.85", false),
          PortInfo(80, "tcp", "http", "open", "nginx (redirects 301)", false),
          PortInfo(443, "tcp", "https", "open", "Cisco WebUI TLS 1.3", false),
          PortInfo(22, "tcp", "ssh", "open", "OpenSSH 8.4p1 (keys only)", false)
        ),
        vulnerabilities = emptyList(),
        latencyMs = 1,
        rssiSignalDbm = 0,
        rxRateKbps = 8400f,
        txRateKbps = 14200f,
        lastScanned = "Nmap -sS -sV -O: Completed 4m ago"
      ),

      // Core Access Point
      NetworkDevice(
        id = "dev-ap",
        ip = "192.168.1.2",
        mac = "74:83:C2:11:90:FE",
        hostname = "unifi-u6-pro.lan",
        deviceType = DeviceType.ACCESS_POINT,
        vendor = "Ubiquiti Networks",
        osFingerprint = "Linux 5.4.164 (UniFi Firmware 6.5.64)",
        securityStatus = SecurityStatus.SECURE,
        connectedToId = "dev-gw",
        connectionType = ConnectionType.ETHERNET_1G,
        openPorts = listOf(
          PortInfo(22, "tcp", "ssh", "open", "Dropbear SSH 2020.81", false),
          PortInfo(8080, "tcp", "http", "open", "UniFi Inform Protocol", false)
        ),
        latencyMs = 2,
        rxRateKbps = 4800f,
        txRateKbps = 6100f
      ),

      // Security Camera 1 - CRITICAL
      NetworkDevice(
        id = "dev-cam-backyard",
        ip = "192.168.1.104",
        mac = "44:19:B6:3E:99:A2",
        hostname = "cam-backyard-ptz.lan",
        deviceType = DeviceType.SECURITY_CAMERA,
        vendor = "Hikvision Digital Tech",
        osFingerprint = "Embedded Linux 3.10 (HikOS v4.2)",
        securityStatus = SecurityStatus.CRITICAL,
        connectedToId = "dev-ap",
        connectionType = ConnectionType.WIFI_5GHZ,
        openPorts = listOf(
          PortInfo(80, "tcp", "http", "open", "Hikvision Camera Web Server", true, "Default admin interface exposed"),
          PortInfo(554, "tcp", "rtsp", "open", "Real Time Streaming Protocol", true, "UNAUTHENTICATED LIVE RTSP FEED"),
          PortInfo(8000, "tcp", "hik-sdk", "open", "DVR/NVR Management Port", true, "Vulnerable to CVE-2021-36260 RCE")
        ),
        vulnerabilities = listOf(
          Vulnerability(
            cveId = "CVE-2021-36260",
            severity = "CRITICAL",
            cvssScore = 9.8f,
            title = "Hikvision Camera Command Injection Vulnerability",
            description = "A command injection vulnerability in the web server of some Hikvision cameras allows unauthenticated attackers to execute arbitrary shell commands via specially crafted input messages.",
            remediation = "Upgrade camera firmware to v5.5.800+ immediately, isolate camera in a dedicated IoT VLAN, and block port 8000 and 554 from external/untrusted access."
          ),
          Vulnerability(
            cveId = "AUDIT-RTSP-OPEN",
            severity = "HIGH",
            cvssScore = 7.5f,
            title = "Unauthenticated RTSP Video Stream Broadcast",
            description = "The camera's RTSP endpoint rtsp://192.168.1.104:554/Streaming/Channels/101 accepts connection without authentication headers.",
            remediation = "Enable digest authentication for RTSP in camera settings and rotate factory credentials."
          )
        ),
        latencyMs = 12,
        rssiSignalDbm = -64,
        rxRateKbps = 40f,
        txRateKbps = 2450f, // active video streaming
        lastScanned = "NSE Script Scan: 2 Critical CVEs"
      ),

      // Security Camera 2 - Doorbell WARNING
      NetworkDevice(
        id = "dev-cam-doorbell",
        ip = "192.168.1.105",
        mac = "EC:71:DB:44:81:05",
        hostname = "doorbell-front.lan",
        deviceType = DeviceType.SECURITY_CAMERA,
        vendor = "Reolink Video Corp",
        osFingerprint = "Linux 4.9 Embedded (Doorbell firmware v3.0)",
        securityStatus = SecurityStatus.WARNING,
        connectedToId = "dev-ap",
        connectionType = ConnectionType.WIFI_2_4GHZ,
        openPorts = listOf(
          PortInfo(80, "tcp", "http", "open", "Reolink Web Config", false),
          PortInfo(443, "tcp", "https", "open", "Self-signed SSL Cert", true, "Expired certificate 2024"),
          PortInfo(554, "tcp", "rtsp", "open", "RTSP stream (Digest auth)", false),
          PortInfo(9000, "tcp", "media", "open", "Reolink Private Protocol", false)
        ),
        vulnerabilities = listOf(
          Vulnerability(
            cveId = "AUDIT-SSL-EXPIRED",
            severity = "MEDIUM",
            cvssScore = 5.3f,
            title = "Expired Self-Signed TLS Certificate",
            description = "Web interface uses a factory self-signed SSL certificate expired since Jan 2024, prone to MiTM eavesdropping.",
            remediation = "Regenerate custom SSL cert or disable HTTP access in favor of encrypted cloud app."
          )
        ),
        latencyMs = 18,
        rssiSignalDbm = -72,
        rxRateKbps = 15f,
        txRateKbps = 820f
      ),

      // Synology NAS Server
      NetworkDevice(
        id = "dev-nas",
        ip = "192.168.1.10",
        mac = "00:11:32:9B:44:66",
        hostname = "synology-ds920.lan",
        deviceType = DeviceType.SERVER_NAS,
        vendor = "Synology Inc.",
        osFingerprint = "Linux 4.4.302+ (Synology DSM 7.2.1)",
        securityStatus = SecurityStatus.SECURE,
        connectedToId = "dev-gw",
        connectionType = ConnectionType.ETHERNET_1G,
        openPorts = listOf(
          PortInfo(22, "tcp", "ssh", "open", "OpenSSH 8.2p1", false),
          PortInfo(445, "tcp", "microsoft-ds", "open", "Samba smbd 4.15 (SMBv3)", false),
          PortInfo(5001, "tcp", "https", "open", "DSM Admin Portal (TLS 1.3)", false)
        ),
        latencyMs = 1,
        rxRateKbps = 1200f,
        txRateKbps = 2800f
      ),

      // MacBook Pro
      NetworkDevice(
        id = "dev-macbook",
        ip = "192.168.1.25",
        mac = "F0:18:98:C3:51:77",
        hostname = "macbook-pro-m2.lan",
        deviceType = DeviceType.WORKSTATION,
        vendor = "Apple Inc.",
        osFingerprint = "Darwin 23.5.0 (macOS Sonoma 14.5)",
        securityStatus = SecurityStatus.SECURE,
        connectedToId = "dev-ap",
        connectionType = ConnectionType.WIFI_5GHZ,
        openPorts = listOf(
          PortInfo(5000, "tcp", "airplay", "open", "AirPlay Receiver Server", false),
          PortInfo(7000, "tcp", "airplay-screen", "open", "AirPlay Screen Mirroring", false)
        ),
        latencyMs = 3,
        rssiSignalDbm = -48,
        rxRateKbps = 3200f,
        txRateKbps = 410f
      ),

      // Pixel 9 Pro
      NetworkDevice(
        id = "dev-pixel",
        ip = "192.168.1.42",
        mac = "5C:F9:38:88:21:0A",
        hostname = "pixel-9-pro.lan",
        deviceType = DeviceType.MOBILE,
        vendor = "Google LLC",
        osFingerprint = "Android 15 (Linux 6.1.75-android15)",
        securityStatus = SecurityStatus.SECURE,
        connectedToId = "dev-ap",
        connectionType = ConnectionType.WIFI_5GHZ,
        openPorts = emptyList(), // completely firewalled
        latencyMs = 5,
        rssiSignalDbm = -45,
        rxRateKbps = 850f,
        txRateKbps = 120f
      ),

      // Rogue / Suspicious Microcontroller - CRITICAL
      NetworkDevice(
        id = "dev-rogue-esp",
        ip = "192.168.1.199",
        mac = "5C:CF:7F:1A:00:23",
        hostname = "ESP_1A0023.unnamed",
        deviceType = DeviceType.ROGUE_UNKNOWN,
        vendor = "Espressif Inc.",
        osFingerprint = "FreeRTOS / NodeMCU Custom Firmware",
        securityStatus = SecurityStatus.CRITICAL,
        connectedToId = "dev-ap",
        connectionType = ConnectionType.WIFI_2_4GHZ,
        openPorts = listOf(
          PortInfo(23, "tcp", "telnet", "open", "Unencrypted Telnet Shell (No Password)", true, "Root shell open on port 23!"),
          PortInfo(80, "tcp", "http", "open", "ESP-Web-Console v1.0", true, "Unauthenticated control interface")
        ),
        vulnerabilities = listOf(
          Vulnerability(
            cveId = "ROGUE-DEVICE-ALERT",
            severity = "CRITICAL",
            cvssScore = 10.0f,
            title = "Unrecognized Rogue Hardware with Open Root Telnet",
            description = "Unknown ESP8266 Wi-Fi device detected broadcasting ad-hoc packets with open Telnet port 23 offering an unauthenticated root command prompt.",
            remediation = "Disconnect device immediately from Wi-Fi network, inspect physical premises for rogue Wi-Fi pineapple / keylogger hardware, and black-list MAC 5C:CF:7F:1A:00:23 on gateway."
          )
        ),
        latencyMs = 35,
        rssiSignalDbm = -78,
        rxRateKbps = 45f,
        txRateKbps = 180f
      ),

      // Smart TV - WARNING
      NetworkDevice(
        id = "dev-smart-tv",
        ip = "192.168.1.80",
        mac = "B8:27:EB:77:3A:99",
        hostname = "lg-webos-oled.lan",
        deviceType = DeviceType.IOT_DEVICE,
        vendor = "LG Electronics",
        osFingerprint = "webOS 24 (Linux 5.4.180)",
        securityStatus = SecurityStatus.WARNING,
        connectedToId = "dev-ap",
        connectionType = ConnectionType.WIFI_5GHZ,
        openPorts = listOf(
          PortInfo(3000, "tcp", "lg-remote", "open", "LG Connect Remote SDK", false),
          PortInfo(1900, "udp", "upnp", "open", "SSDP / UPnP Service Discovery", true, "UPnP enabled to LAN"),
          PortInfo(8080, "tcp", "http-alt", "open", "Second Screen protocol", false)
        ),
        vulnerabilities = listOf(
          Vulnerability(
            cveId = "AUDIT-UPNP-LAN",
            severity = "MEDIUM",
            cvssScore = 5.0f,
            title = "Exposed UPnP / SSDP Multicast Service",
            description = "Device advertises services via unauthenticated SSDP/UPnP, enabling potential amplification or unauthorized remote control on local subnet.",
            remediation = "Disable UPnP in TV advanced connection settings or move TV to isolated IoT VLAN."
          )
        ),
        latencyMs = 8,
        rssiSignalDbm = -58,
        rxRateKbps = 4100f,
        txRateKbps = 90f
      ),

      // Philips Hue Bridge
      NetworkDevice(
        id = "dev-hue",
        ip = "192.168.1.12",
        mac = "EC:B5:FA:21:40:99",
        hostname = "philips-hue-bridge.lan",
        deviceType = DeviceType.IOT_DEVICE,
        vendor = "Signify Netherlands B.V.",
        osFingerprint = "Linux 3.14.0 (Hue Bridge BSB002)",
        securityStatus = SecurityStatus.SECURE,
        connectedToId = "dev-gw",
        connectionType = ConnectionType.ETHERNET_1G,
        openPorts = listOf(
          PortInfo(80, "tcp", "http", "open", "Hue REST API v2", false),
          PortInfo(443, "tcp", "https", "open", "Hue TLS Bridge", false)
        ),
        latencyMs = 2,
        rxRateKbps = 35f,
        txRateKbps = 40f
      ),

      // Windows 11 Workstation - WARNING
      NetworkDevice(
        id = "dev-win11",
        ip = "192.168.1.55",
        mac = "A4:BB:6D:33:C1:22",
        hostname = "rig-gaming-w11.lan",
        deviceType = DeviceType.WORKSTATION,
        vendor = "ASUSTeK Computer Inc.",
        osFingerprint = "Microsoft Windows 11 Pro Build 26100",
        securityStatus = SecurityStatus.WARNING,
        connectedToId = "dev-gw",
        connectionType = ConnectionType.ETHERNET_1G,
        openPorts = listOf(
          PortInfo(135, "tcp", "msrpc", "open", "Microsoft Windows RPC", false),
          PortInfo(445, "tcp", "microsoft-ds", "open", "Windows SMB", false),
          PortInfo(3389, "tcp", "ms-wbt-server", "open", "Remote Desktop Protocol (RDP)", true, "RDP exposed without NLA requirement")
        ),
        vulnerabilities = listOf(
          Vulnerability(
            cveId = "AUDIT-RDP-NLA",
            severity = "HIGH",
            cvssScore = 7.2f,
            title = "RDP Service Without Network Level Authentication",
            description = "Remote Desktop Protocol (port 3389) is accepting incoming handshakes without enforcing pre-authentication NLA.",
            remediation = "In Windows System Properties > Remote, check 'Allow connections only from computers running Remote Desktop with Network Level Authentication'."
          )
        ),
        latencyMs = 2,
        rxRateKbps = 1450f,
        txRateKbps = 890f
      ),

      // Smart Thermostat
      NetworkDevice(
        id = "dev-thermostat",
        ip = "192.168.1.90",
        mac = "48:A9:D2:7C:10:E4",
        hostname = "ecobee-smart-thermo.lan",
        deviceType = DeviceType.IOT_DEVICE,
        vendor = "Ecobee Inc.",
        osFingerprint = "FreeRTOS Embedded Stack",
        securityStatus = SecurityStatus.SECURE,
        connectedToId = "dev-ap",
        connectionType = ConnectionType.WIFI_2_4GHZ,
        openPorts = listOf(
          PortInfo(443, "tcp", "https", "open", "Ecobee Cloud Relay (mTLS)", false)
        ),
        latencyMs = 14,
        rssiSignalDbm = -60,
        rxRateKbps = 10f,
        txRateKbps = 25f
      )
    )
  }

  fun getInitialLinks(): List<NetworkLink> {
    val devices = getInitialDevices()
    val links = mutableListOf<NetworkLink>()
    for (d in devices) {
      if (d.connectedToId != null) {
        links.add(
          NetworkLink(
            id = "link-${d.connectedToId}-${d.id}",
            sourceId = d.connectedToId,
            targetId = d.id,
            connectionType = d.connectionType,
            isActive = true,
            bandwidthUtilization = (d.txRateKbps + d.rxRateKbps) / 10000f
          )
        )
      }
    }
    return links
  }
}
