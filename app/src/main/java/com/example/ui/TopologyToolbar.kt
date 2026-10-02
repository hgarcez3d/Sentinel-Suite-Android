package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Hub
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.DeviceType
import com.example.model.SecurityStatus
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
fun TopologyToolbar(
  totalHosts: Int,
  criticalCount: Int,
  warningCount: Int,
  searchQuery: String,
  onSearchQueryChanged: (String) -> Unit,
  selectedStatusFilter: SecurityStatus?,
  onStatusFilterChanged: (SecurityStatus?) -> Unit,
  selectedTypeFilter: DeviceType?,
  onTypeFilterChanged: (DeviceType?) -> Unit,
  modifier: Modifier = Modifier
) {
  Column(
    modifier = modifier
      .fillMaxWidth()
      .background(CyberSurface.copy(alpha = 0.95f))
      .border(
        width = 1.dp,
        color = CyberCardBorder.copy(alpha = 0.5f)
      )
  ) {
    // 1. Top App Bar
    TopAppBar(
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(32.dp)
              .background(NeonCyan.copy(alpha = 0.15f), CircleShape)
              .border(1.dp, NeonCyan, CircleShape),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.Hub,
              contentDescription = null,
              tint = NeonCyan,
              modifier = Modifier.size(18.dp)
            )
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = "NETSCAN",
                style = MaterialTheme.typography.titleMedium.copy(
                  fontWeight = FontWeight.Black,
                  letterSpacing = 2.sp,
                  color = Color.White
                )
              )
              Text(
                text = " TOPOLOGY",
                style = MaterialTheme.typography.titleMedium.copy(
                  fontWeight = FontWeight.Bold,
                  letterSpacing = 1.sp,
                  color = NeonCyan
                )
              )
            }
            Text(
              text = "D3 Force-Directed Network Graph",
              style = MaterialTheme.typography.bodySmall.copy(
                fontSize = 10.sp,
                color = TextSecondary
              )
            )
          }
        }
      },
      actions = {
        // Critical alerts indicator badge
        if (criticalCount > 0) {
          Surface(
            color = StatusCritical.copy(alpha = 0.2f),
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, StatusCritical)
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = StatusCritical,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "$criticalCount ALERT${if (criticalCount > 1) "S" else ""}",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = StatusCritical
              )
            }
          }
        }
        Spacer(modifier = Modifier.width(12.dp))
      },
      colors = TopAppBarDefaults.topAppBarColors(
        containerColor = Color.Transparent
      )
    )

    // 2. HUD Metrics Strip
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 4.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      HudPill(label = "HOSTS", value = "$totalHosts Online", color = NeonCyan, modifier = Modifier.weight(1f))
      HudPill(label = "CRITICAL", value = "$criticalCount Vuln", color = if (criticalCount > 0) StatusCritical else StatusSecure, modifier = Modifier.weight(1f))
      HudPill(label = "AUDIT", value = "$warningCount Warning", color = if (warningCount > 0) StatusWarning else StatusSecure, modifier = Modifier.weight(1f))
    }

    // 3. Search Bar
    Surface(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 6.dp),
      color = CyberBackground,
      shape = RoundedCornerShape(8.dp),
      border = androidx.compose.foundation.BorderStroke(1.dp, CyberCardBorder)
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(
          imageVector = Icons.Default.Search,
          contentDescription = "Search",
          tint = TextSecondary,
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Box(modifier = Modifier.weight(1f)) {
          if (searchQuery.isEmpty()) {
            Text(
              text = "Filter by IP (192.168...), Hostname, Port (554), or Vendor...",
              color = TextMuted,
              fontSize = 12.sp
            )
          }
          BasicTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChanged,
            textStyle = TextStyle(
              color = TextPrimary,
              fontSize = 12.sp,
              fontFamily = FontFamily.Monospace
            ),
            cursorBrush = SolidColor(NeonCyan),
            singleLine = true,
            modifier = Modifier.fillMaxWidth().testTag("search_input")
          )
        }
        if (searchQuery.isNotEmpty()) {
          IconButton(
            onClick = { onSearchQueryChanged("") },
            modifier = Modifier.size(20.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Clear,
              contentDescription = "Clear search",
              tint = TextSecondary,
              modifier = Modifier.size(16.dp)
            )
          }
        }
      }
    }

    // 4. Horizontal Scrollable Filter Chips
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .horizontalScroll(rememberScrollState())
        .padding(horizontal = 16.dp, vertical = 4.dp),
      horizontalArrangement = Arrangement.spacedBy(6.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      // All
      FilterChip(
        selected = selectedStatusFilter == null && selectedTypeFilter == null,
        onClick = {
          onStatusFilterChanged(null)
          onTypeFilterChanged(null)
        },
        label = { Text("All ($totalHosts)", fontSize = 11.sp) },
        colors = FilterChipDefaults.filterChipColors(
          selectedContainerColor = NeonCyan.copy(alpha = 0.25f),
          selectedLabelColor = NeonCyan
        )
      )

      // Critical Only
      FilterChip(
        selected = selectedStatusFilter == SecurityStatus.CRITICAL,
        onClick = {
          onTypeFilterChanged(null)
          onStatusFilterChanged(
            if (selectedStatusFilter == SecurityStatus.CRITICAL) null else SecurityStatus.CRITICAL
          )
        },
        label = { Text("Critical ($criticalCount)", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
        colors = FilterChipDefaults.filterChipColors(
          selectedContainerColor = StatusCritical.copy(alpha = 0.25f),
          selectedLabelColor = StatusCritical,
          containerColor = CyberSurfaceVariant
        )
      )

      // Warning Only
      FilterChip(
        selected = selectedStatusFilter == SecurityStatus.WARNING,
        onClick = {
          onTypeFilterChanged(null)
          onStatusFilterChanged(
            if (selectedStatusFilter == SecurityStatus.WARNING) null else SecurityStatus.WARNING
          )
        },
        label = { Text("Warning ($warningCount)", fontSize = 11.sp) },
        colors = FilterChipDefaults.filterChipColors(
          selectedContainerColor = StatusWarning.copy(alpha = 0.25f),
          selectedLabelColor = StatusWarning
        )
      )

      // Secure Only
      FilterChip(
        selected = selectedStatusFilter == SecurityStatus.SECURE,
        onClick = {
          onTypeFilterChanged(null)
          onStatusFilterChanged(
            if (selectedStatusFilter == SecurityStatus.SECURE) null else SecurityStatus.SECURE
          )
        },
        label = { Text("Hardened", fontSize = 11.sp) },
        colors = FilterChipDefaults.filterChipColors(
          selectedContainerColor = StatusSecure.copy(alpha = 0.25f),
          selectedLabelColor = StatusSecure
        )
      )

      // Security Cameras
      FilterChip(
        selected = selectedTypeFilter == DeviceType.SECURITY_CAMERA,
        onClick = {
          onStatusFilterChanged(null)
          onTypeFilterChanged(
            if (selectedTypeFilter == DeviceType.SECURITY_CAMERA) null else DeviceType.SECURITY_CAMERA
          )
        },
        leadingIcon = {
          Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(14.dp))
        },
        label = { Text("Cameras", fontSize = 11.sp) },
        colors = FilterChipDefaults.filterChipColors(
          selectedContainerColor = NeonBlue.copy(alpha = 0.25f),
          selectedLabelColor = NeonCyan
        )
      )

      // Rogue / Unknown
      FilterChip(
        selected = selectedTypeFilter == DeviceType.ROGUE_UNKNOWN,
        onClick = {
          onStatusFilterChanged(null)
          onTypeFilterChanged(
            if (selectedTypeFilter == DeviceType.ROGUE_UNKNOWN) null else DeviceType.ROGUE_UNKNOWN
          )
        },
        label = { Text("Rogue / Untrusted", fontSize = 11.sp) },
        colors = FilterChipDefaults.filterChipColors(
          selectedContainerColor = StatusCritical.copy(alpha = 0.25f),
          selectedLabelColor = StatusCritical
        )
      )
    }

    Spacer(modifier = Modifier.height(4.dp))
  }
}

@Composable
private fun HudPill(
  label: String,
  value: String,
  color: Color,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier,
    color = CyberSurfaceVariant.copy(alpha = 0.7f),
    shape = RoundedCornerShape(6.dp),
    border = androidx.compose.foundation.BorderStroke(0.8.dp, color.copy(alpha = 0.35f))
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Text(
        text = label,
        fontSize = 9.sp,
        fontWeight = FontWeight.Bold,
        color = TextMuted,
        letterSpacing = 0.8.sp
      )
      Text(
        text = value,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Monospace,
        color = color
      )
    }
  }
}
