package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.LogType
import com.example.model.NmapLogLine
import com.example.model.ScanProfile
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

@Composable
fun NmapScannerControl(
  selectedProfile: ScanProfile,
  onProfileSelected: (ScanProfile) -> Unit,
  selectedSubnet: String,
  onSubnetSelected: (String) -> Unit,
  isScanning: Boolean,
  scanProgress: Float,
  logs: List<NmapLogLine>,
  onStartScan: () -> Unit,
  onStopScan: () -> Unit,
  modifier: Modifier = Modifier
) {
  var isConsoleExpanded by remember { mutableStateOf(false) }
  var profileMenuExpanded by remember { mutableStateOf(false) }
  var subnetMenuExpanded by remember { mutableStateOf(false) }
  val consoleListState = rememberLazyListState()

  // Auto scroll console to bottom as logs stream in
  LaunchedEffect(logs.size) {
    if (logs.isNotEmpty()) {
      consoleListState.animateScrollToItem(logs.size - 1)
    }
  }

  Surface(
    modifier = modifier.fillMaxWidth(),
    color = CyberSurface.copy(alpha = 0.95f),
    tonalElevation = 8.dp,
    border = androidx.compose.foundation.BorderStroke(1.dp, CyberCardBorder),
    shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
      // Top Control Bar: Subnet & Profile Pickers + Scan Button
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Subnet Selector Dropdown
        Box {
          Surface(
            modifier = Modifier
              .clickable { subnetMenuExpanded = true }
              .border(1.dp, CyberCardBorder, RoundedCornerShape(8.dp))
              .testTag("dropdown_subnet"),
            color = CyberSurfaceVariant,
            shape = RoundedCornerShape(8.dp)
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = selectedSubnet,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = NeonCyan
              )
              Icon(
                imageVector = Icons.Default.ArrowDropDown,
                contentDescription = null,
                tint = TextSecondary,
                modifier = Modifier.size(16.dp)
              )
            }
          }

          DropdownMenu(
            expanded = subnetMenuExpanded,
            onDismissRequest = { subnetMenuExpanded = false },
            modifier = Modifier.background(CyberSurface)
          ) {
            listOf("192.168.1.0/24", "10.0.0.0/24", "172.16.10.0/24").forEach { subnet ->
              DropdownMenuItem(
                text = {
                  Text(
                    text = subnet,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    color = TextPrimary
                  )
                },
                onClick = {
                  onSubnetSelected(subnet)
                  subnetMenuExpanded = false
                }
              )
            }
          }
        }

        Spacer(modifier = Modifier.width(8.dp))

        // Profile Selector Dropdown
        Box(modifier = Modifier.weight(1f)) {
          Surface(
            modifier = Modifier
              .fillMaxWidth()
              .clickable { profileMenuExpanded = true }
              .border(1.dp, CyberCardBorder, RoundedCornerShape(8.dp))
              .testTag("dropdown_profile"),
            color = CyberSurfaceVariant,
            shape = RoundedCornerShape(8.dp)
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text(
                text = selectedProfile.title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary,
                maxLines = 1
              )
              Icon(
                imageVector = Icons.Default.ArrowDropDown,
                contentDescription = null,
                tint = TextSecondary,
                modifier = Modifier.size(16.dp)
              )
            }
          }

          DropdownMenu(
            expanded = profileMenuExpanded,
            onDismissRequest = { profileMenuExpanded = false },
            modifier = Modifier.background(CyberSurface)
          ) {
            ScanProfile.values().forEach { profile ->
              DropdownMenuItem(
                text = {
                  Column {
                    Text(
                      text = profile.title,
                      fontSize = 12.sp,
                      fontWeight = FontWeight.Bold,
                      color = TextPrimary
                    )
                    Text(
                      text = profile.description,
                      fontSize = 10.sp,
                      color = TextMuted
                    )
                  }
                },
                onClick = {
                  onProfileSelected(profile)
                  profileMenuExpanded = false
                }
              )
            }
          }
        }

        Spacer(modifier = Modifier.width(8.dp))

        // Action Trigger Button
        if (isScanning) {
          Button(
            onClick = onStopScan,
            colors = ButtonDefaults.buttonColors(containerColor = StatusCritical),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
            modifier = Modifier.height(36.dp).testTag("btn_stop_scan")
          ) {
            Icon(Icons.Default.Stop, contentDescription = "Stop", modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("Abort", fontSize = 11.sp, fontWeight = FontWeight.Bold)
          }
        } else {
          Button(
            onClick = onStartScan,
            colors = ButtonDefaults.buttonColors(containerColor = NeonCyan, contentColor = Color(0xFF00363D)),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
            modifier = Modifier.height(36.dp).testTag("btn_start_scan")
          ) {
            Icon(Icons.Default.PlayArrow, contentDescription = "Scan", modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("Nmap Scan", fontSize = 11.sp, fontWeight = FontWeight.Bold)
          }
        }
      }

      // Progress bar when scanning
      if (isScanning) {
        Spacer(modifier = Modifier.height(8.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          verticalAlignment = Alignment.CenterVertically
        ) {
          LinearProgressIndicator(
            progress = { scanProgress },
            modifier = Modifier.weight(1f).height(4.dp),
            color = NeonCyan,
            trackColor = CyberCardBorder
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "${(scanProgress * 100).toInt()}%",
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            color = NeonCyan,
            fontWeight = FontWeight.Bold
          )
        }
      }

      Spacer(modifier = Modifier.height(6.dp))

      // Terminal Console Toggle Bar
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .clickable { isConsoleExpanded = !isConsoleExpanded }
          .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Terminal,
            contentDescription = null,
            tint = if (isScanning) NeonCyan else TextMuted,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = if (isScanning) "NMAP AUDIT RUNNING..." else "RAW SCAN CONSOLE LOG",
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.SemiBold,
            color = if (isScanning) NeonCyan else TextSecondary
          )
          if (logs.isNotEmpty()) {
            Spacer(modifier = Modifier.width(6.dp))
            Surface(
              color = CyberSurfaceVariant,
              shape = RoundedCornerShape(4.dp)
            ) {
              Text(
                text = "${logs.size} lines",
                fontSize = 9.sp,
                fontFamily = FontFamily.Monospace,
                color = TextMuted,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
              )
            }
          }
        }

        Icon(
          imageVector = if (isConsoleExpanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
          contentDescription = if (isConsoleExpanded) "Collapse Console" else "Expand Console",
          tint = TextSecondary,
          modifier = Modifier.size(20.dp)
        )
      }

      // Expandable Terminal Log Console
      AnimatedVisibility(
        visible = isConsoleExpanded,
        enter = expandVertically(),
        exit = shrinkVertically()
      ) {
        Surface(
          modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 180.dp)
            .padding(top = 6.dp)
            .border(1.dp, CyberCardBorder, RoundedCornerShape(8.dp)),
          color = CyberBackground,
          shape = RoundedCornerShape(8.dp)
        ) {
          LazyColumn(
            state = consoleListState,
            modifier = Modifier.padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
          ) {
            items(logs) { line ->
              val logColor = when (line.type) {
                LogType.COMMAND -> NeonCyan
                LogType.SUCCESS -> StatusSecure
                LogType.WARNING -> StatusWarning
                LogType.CRITICAL -> StatusCritical
                LogType.INFO -> TextSecondary
              }
              Row(modifier = Modifier.fillMaxWidth()) {
                Text(
                  text = line.timestamp,
                  fontFamily = FontFamily.Monospace,
                  fontSize = 9.sp,
                  color = TextMuted,
                  modifier = Modifier.width(55.dp)
                )
                Text(
                  text = line.text,
                  fontFamily = FontFamily.Monospace,
                  fontSize = 10.sp,
                  color = logColor,
                  lineHeight = 13.sp
                )
              }
            }
          }
        }
      }
    }
  }
}
