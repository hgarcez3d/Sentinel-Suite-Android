package com.example.ui

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.PinDrop
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SheetState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.NetworkDevice
import com.example.model.PortInfo
import com.example.model.SecurityStatus
import com.example.model.Vulnerability
import com.example.ui.theme.CyberBackground
import com.example.ui.theme.CyberCardBorder
import com.example.ui.theme.CyberSurface
import com.example.ui.theme.CyberSurfaceVariant
import com.example.ui.theme.NeonBlue
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.StatusCritical
import com.example.ui.theme.StatusSecure
import com.example.ui.theme.StatusWarning
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeviceDetailSheet(
  device: NetworkDevice,
  sheetState: SheetState,
  isPinned: Boolean,
  onDismiss: () -> Unit,
  onTogglePin: (String) -> Unit,
  onToggleIsolation: (String) -> Unit,
  onRescanDevice: (NetworkDevice) -> Unit
) {
  val context = LocalContext.current
  val clipboardManager = LocalClipboardManager.current

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = CyberSurface,
    contentColor = TextPrimary,
    dragHandle = null
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 16.dp)
        .testTag("device_detail_sheet")
    ) {
      // Header: Hostname, Device Type, Close button
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Text(
            text = device.hostname,
            style = MaterialTheme.typography.titleLarge.copy(
              fontWeight = FontWeight.Bold,
              fontSize = 20.sp,
              color = TextPrimary
            )
          )
          Text(
            text = "${device.deviceType.label} • ${device.vendor}",
            style = MaterialTheme.typography.bodyMedium.copy(
              color = NeonCyan,
              fontSize = 13.sp
            )
          )
        }

        IconButton(
          onClick = onDismiss,
          modifier = Modifier
            .size(36.dp)
            .background(CyberSurfaceVariant, CircleShape)
            .testTag("btn_close_sheet")
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close sheet",
            tint = TextSecondary,
            modifier = Modifier.size(20.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Security Status Badge Card
      SecurityStatusBar(device)

      Spacer(modifier = Modifier.height(14.dp))

      // Core Hardware & Network Specs Grid
      HardwareSpecsRow(device)

      Spacer(modifier = Modifier.height(16.dp))

      // Action Buttons (Isolate, Rescan, Pin, Copy Nmap)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        Button(
          onClick = { onToggleIsolation(device.id) },
          colors = ButtonDefaults.buttonColors(
            containerColor = if (device.isIsolated) StatusSecure else StatusCritical
          ),
          modifier = Modifier.weight(1f).testTag("btn_isolate_device")
        ) {
          Icon(
            imageVector = if (device.isIsolated) Icons.Default.LockOpen else Icons.Default.Lock,
            contentDescription = null,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = if (device.isIsolated) "Reconnect" else "Isolate",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
          )
        }

        OutlinedButton(
          onClick = { onRescanDevice(device) },
          colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonCyan),
          modifier = Modifier.weight(1f).testTag("btn_rescan_device")
        ) {
          Icon(
            imageVector = Icons.Default.Refresh,
            contentDescription = null,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text("Rescan", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        }

        IconButton(
          onClick = { onTogglePin(device.id) },
          modifier = Modifier
            .size(40.dp)
            .background(if (isPinned) NeonCyan.copy(alpha = 0.2f) else CyberSurfaceVariant, CircleShape)
            .testTag("btn_pin_node")
        ) {
          Icon(
            imageVector = Icons.Default.PinDrop,
            contentDescription = if (isPinned) "Unpin Node" else "Pin Node",
            tint = if (isPinned) NeonCyan else TextSecondary,
            modifier = Modifier.size(18.dp)
          )
        }

        IconButton(
          onClick = {
            val cmd = "nmap -sS -sV -O -p- ${device.ip}"
            clipboardManager.setText(AnnotatedString(cmd))
            Toast.makeText(context, "Copied: $cmd", Toast.LENGTH_SHORT).show()
          },
          modifier = Modifier
            .size(40.dp)
            .background(CyberSurfaceVariant, CircleShape)
            .testTag("btn_copy_nmap")
        ) {
          Icon(
            imageVector = Icons.Default.ContentCopy,
            contentDescription = "Copy Nmap command",
            tint = TextSecondary,
            modifier = Modifier.size(18.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Tabs / Scrollable Sections: Vulnerabilities & Open Ports
      LazyColumn(
        modifier = Modifier.fillMaxWidth().weight(1f, fill = false),
        verticalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        // Vulnerabilities Section
        if (device.vulnerabilities.isNotEmpty()) {
          item {
            Text(
              text = "DETECTED VULNERABILITIES (${device.vulnerabilities.size})",
              style = MaterialTheme.typography.labelMedium.copy(
                color = StatusCritical,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
              )
            )
          }

          items(device.vulnerabilities) { vuln ->
            VulnerabilityCard(vuln)
          }
        }

        // Open Ports Matrix
        item {
          Text(
            text = "NMAP OPEN PORTS & SERVICES (${device.openPorts.size})",
            style = MaterialTheme.typography.labelMedium.copy(
              color = NeonCyan,
              fontWeight = FontWeight.Bold,
              letterSpacing = 1.sp
            )
          )
        }

        if (device.openPorts.isEmpty()) {
          item {
            Surface(
              modifier = Modifier.fillMaxWidth(),
              color = CyberSurfaceVariant.copy(alpha = 0.5f),
              shape = RoundedCornerShape(8.dp)
            ) {
              Text(
                text = "No open TCP/UDP ports detected (Strict host firewall or stealth mode active).",
                style = MaterialTheme.typography.bodySmall.copy(color = TextMuted),
                modifier = Modifier.padding(12.dp)
              )
            }
          }
        } else {
          items(device.openPorts) { port ->
            PortInfoRow(port)
          }
        }

        // OS Fingerprint & Scan Info Card
        item {
          Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CyberSurfaceVariant.copy(alpha = 0.4f)),
            border = androidx.compose.foundation.BorderStroke(1.dp, CyberCardBorder)
          ) {
            Column(modifier = Modifier.padding(12.dp)) {
              Text(
                text = "NMAP OS FINGERPRINT",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = TextMuted,
                letterSpacing = 1.sp
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = device.osFingerprint,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                color = TextPrimary
              )
              Spacer(modifier = Modifier.height(8.dp))
              Text(
                text = "LAST SCANNED: ${device.lastScanned}",
                fontSize = 10.sp,
                color = NeonCyan.copy(alpha = 0.8f)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

@Composable
private fun SecurityStatusBar(device: NetworkDevice) {
  val (bgColor, borderColor, icon, title, desc) = when (device.securityStatus) {
    SecurityStatus.CRITICAL -> Tuple5(
      StatusCritical.copy(alpha = 0.12f),
      StatusCritical,
      Icons.Default.Warning,
      "CRITICAL SECURITY RISK",
      "Immediate action required. Vulnerabilities or exposed unauthenticated feeds detected."
    )
    SecurityStatus.WARNING -> Tuple5(
      StatusWarning.copy(alpha = 0.12f),
      StatusWarning,
      Icons.Default.Security,
      "SECURITY WARNING / AUDIT REQUIRED",
      "Potentially insecure services, default ports, or expired certificates found."
    )
    SecurityStatus.SECURE -> Tuple5(
      StatusSecure.copy(alpha = 0.12f),
      StatusSecure,
      Icons.Default.Shield,
      "HARDENED & PROTECTED",
      "No critical ports exposed. Cryptographic handshakes and firewalls verified."
    )
    SecurityStatus.SCANNING -> Tuple5(
      NeonBlue.copy(alpha = 0.12f),
      NeonBlue,
      Icons.Default.Refresh,
      "ACTIVE NMAP PROBE IN PROGRESS",
      "Sending SYN packets, inspecting TCP banners and fingerprinting OS."
    )
  }

  Surface(
    modifier = Modifier
      .fillMaxWidth()
      .border(1.dp, borderColor, RoundedCornerShape(10.dp)),
    color = bgColor,
    shape = RoundedCornerShape(10.dp)
  ) {
    Row(
      modifier = Modifier.padding(12.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        tint = borderColor,
        modifier = Modifier.size(28.dp)
      )
      Spacer(modifier = Modifier.width(12.dp))
      Column {
        Text(
          text = title,
          fontWeight = FontWeight.Bold,
          fontSize = 12.sp,
          color = borderColor
        )
        Text(
          text = desc,
          fontSize = 11.sp,
          color = TextSecondary
        )
      }
    }
  }
}

@Composable
private fun HardwareSpecsRow(device: NetworkDevice) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(8.dp)
  ) {
    SpecCard(label = "IP ADDRESS", value = device.ip, isMono = true, modifier = Modifier.weight(1f))
    SpecCard(label = "MAC ADDRESS", value = device.mac, isMono = true, modifier = Modifier.weight(1f))
    SpecCard(label = "LATENCY", value = "${device.latencyMs} ms", isMono = false, modifier = Modifier.weight(0.7f))
  }
}

@Composable
private fun SpecCard(label: String, value: String, isMono: Boolean, modifier: Modifier = Modifier) {
  Surface(
    modifier = modifier,
    color = CyberSurfaceVariant.copy(alpha = 0.6f),
    shape = RoundedCornerShape(8.dp)
  ) {
    Column(modifier = Modifier.padding(8.dp)) {
      Text(text = label, fontSize = 9.sp, color = TextMuted, fontWeight = FontWeight.SemiBold)
      Spacer(modifier = Modifier.height(2.dp))
      Text(
        text = value,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = if (isMono) FontFamily.Monospace else FontFamily.Default,
        color = TextPrimary,
        maxLines = 1
      )
    }
  }
}

@Composable
private fun VulnerabilityCard(vuln: Vulnerability) {
  Card(
    modifier = Modifier.fillMaxWidth(),
    colors = CardDefaults.cardColors(containerColor = StatusCritical.copy(alpha = 0.08f)),
    border = androidx.compose.foundation.BorderStroke(1.dp, StatusCritical.copy(alpha = 0.4f))
  ) {
    Column(modifier = Modifier.padding(12.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = vuln.cveId,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 13.sp,
          color = StatusCritical
        )
        Surface(
          color = StatusCritical,
          shape = RoundedCornerShape(4.dp)
        ) {
          Text(
            text = "CVSS ${vuln.cvssScore} ${vuln.severity}",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(6.dp))
      Text(text = vuln.title, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = TextPrimary)
      Spacer(modifier = Modifier.height(4.dp))
      Text(text = vuln.description, fontSize = 11.sp, color = TextSecondary)
      Spacer(modifier = Modifier.height(8.dp))
      Text(
        text = "Remediation: ${vuln.remediation}",
        fontSize = 11.sp,
        color = NeonCyan,
        fontWeight = FontWeight.Medium
      )
    }
  }
}

@Composable
private fun PortInfoRow(port: PortInfo) {
  Surface(
    modifier = Modifier.fillMaxWidth(),
    color = if (port.isHighRisk) StatusCritical.copy(alpha = 0.1f) else CyberSurfaceVariant.copy(alpha = 0.4f),
    shape = RoundedCornerShape(6.dp),
    border = if (port.isHighRisk) androidx.compose.foundation.BorderStroke(1.dp, StatusCritical.copy(alpha = 0.35f)) else null
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 12.dp, vertical = 8.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
          text = "${port.port}/${port.protocol}",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 12.sp,
          color = if (port.isHighRisk) StatusCritical else NeonCyan
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column {
          Text(
            text = port.service,
            fontWeight = FontWeight.SemiBold,
            fontSize = 12.sp,
            color = TextPrimary
          )
          if (port.version.isNotBlank()) {
            Text(
              text = port.version,
              fontSize = 10.sp,
              color = TextMuted
            )
          }
          if (port.riskNotes.isNotBlank()) {
            Text(
              text = port.riskNotes,
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = StatusCritical
            )
          }
        }
      }

      Surface(
        color = if (port.isHighRisk) StatusCritical.copy(alpha = 0.2f) else StatusSecure.copy(alpha = 0.2f),
        shape = RoundedCornerShape(4.dp)
      ) {
        Text(
          text = port.state.uppercase(),
          fontSize = 9.sp,
          fontWeight = FontWeight.Bold,
          color = if (port.isHighRisk) StatusCritical else StatusSecure,
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
      }
    }
  }
}

private data class Tuple5<A, B, C, D, E>(
  val first: A,
  val second: B,
  val third: C,
  val fourth: D,
  val fifth: E
)
