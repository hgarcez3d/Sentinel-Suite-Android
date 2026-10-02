package com.example.model

enum class ScanProfile(val command: String, val title: String, val description: String) {
  QUICK_SWEEP("nmap -sn 192.168.1.0/24", "Quick Ping Sweep", "Fast ICMP & ARP discovery of active hosts"),
  FULL_AUDIT("nmap -sS -sV -O -T4 192.168.1.0/24", "SYN Stealth & OS Detect", "Port scan, service banner grab & OS fingerprinting"),
  VULN_SCAN("nmap --script vuln -p- 192.168.1.0/24", "NSE Vulnerability Audit", "Deep CVE scan on all 65,535 ports"),
  CAMERA_IOT("nmap -p 80,554,1935,8000,8080,37777 --script rtsp-* 192.168.1.0/24", "Camera & IoT Probe", "Detect open RTSP, ONVIF, and unauthenticated video feeds")
}

data class NmapLogLine(
  val timestamp: String,
  val text: String,
  val type: LogType = LogType.INFO
)

enum class LogType {
  INFO,
  SUCCESS,
  WARNING,
  CRITICAL,
  COMMAND
}
