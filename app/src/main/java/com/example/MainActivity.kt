package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.model.SecurityStatus
import com.example.ui.DeviceDetailSheet
import com.example.ui.NetworkTopologyGraphView
import com.example.ui.NmapScannerControl
import com.example.ui.TopologyToolbar
import com.example.ui.theme.CyberBackground
import com.example.ui.theme.MyApplicationTheme
import com.example.viewmodel.TopologyViewModel

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        TopologyScreen()
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopologyScreen(viewModel: TopologyViewModel = viewModel()) {
  val devices by viewModel.devices.collectAsState()
  val links by viewModel.links.collectAsState()
  val selectedDevice by viewModel.selectedDevice.collectAsState()
  val isDetailSheetOpen by viewModel.isDetailSheetOpen.collectAsState()
  val isSimulationActive by viewModel.isSimulationActive.collectAsState()
  val searchQuery by viewModel.searchQuery.collectAsState()
  val statusFilter by viewModel.statusFilter.collectAsState()
  val typeFilter by viewModel.typeFilter.collectAsState()
  val selectedProfile by viewModel.selectedScanProfile.collectAsState()
  val selectedSubnet by viewModel.selectedSubnet.collectAsState()
  val isScanning by viewModel.isScanning.collectAsState()
  val scanProgress by viewModel.scanProgress.collectAsState()
  val scanLogs by viewModel.scanLogs.collectAsState()

  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

  val criticalCount = devices.count { it.securityStatus == SecurityStatus.CRITICAL }
  val warningCount = devices.count { it.securityStatus == SecurityStatus.WARNING }

  // BackHandler to close bottom sheet or clear filters before exit
  BackHandler(enabled = isDetailSheetOpen || searchQuery.isNotEmpty() || statusFilter != null || typeFilter != null) {
    if (isDetailSheetOpen) {
      viewModel.closeDetailSheet()
    } else {
      viewModel.setSearchQuery("")
      viewModel.setStatusFilter(null)
      viewModel.setTypeFilter(null)
    }
  }

  Scaffold(
    modifier = Modifier
      .fillMaxSize()
      .background(CyberBackground),
    contentWindowInsets = WindowInsets(0, 0, 0, 0)
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(CyberBackground)
    ) {
      // 1. Full Screen D3 Force-Directed Canvas
      NetworkTopologyGraphView(
        simulation = viewModel.simulation,
        devices = devices,
        links = links,
        selectedDeviceId = selectedDevice?.id,
        filterStatus = statusFilter,
        filterDeviceType = typeFilter,
        searchQuery = searchQuery,
        isSimulationActive = isSimulationActive,
        onDeviceSelected = { device -> viewModel.selectDevice(device) },
        onClearSelection = { viewModel.closeDetailSheet() },
        onToggleSimulation = { viewModel.toggleSimulation() },
        modifier = Modifier.fillMaxSize()
      )

      // 2. Top HUD Toolbar & Search / Filters
      TopologyToolbar(
        totalHosts = devices.size,
        criticalCount = criticalCount,
        warningCount = warningCount,
        searchQuery = searchQuery,
        onSearchQueryChanged = { viewModel.setSearchQuery(it) },
        selectedStatusFilter = statusFilter,
        onStatusFilterChanged = { viewModel.setStatusFilter(it) },
        selectedTypeFilter = typeFilter,
        onTypeFilterChanged = { viewModel.setTypeFilter(it) },
        modifier = Modifier
          .align(Alignment.TopCenter)
          .statusBarsPadding()
      )

      // 3. Bottom Nmap Scanner Controls & Expandable Terminal Console
      NmapScannerControl(
        selectedProfile = selectedProfile,
        onProfileSelected = { viewModel.setScanProfile(it) },
        selectedSubnet = selectedSubnet,
        onSubnetSelected = { viewModel.setSubnet(it) },
        isScanning = isScanning,
        scanProgress = scanProgress,
        logs = scanLogs,
        onStartScan = { viewModel.startNmapScan() },
        onStopScan = { viewModel.stopNmapScan() },
        modifier = Modifier
          .align(Alignment.BottomCenter)
          .navigationBarsPadding()
      )

      // 4. Modal Detail Sheet for Selected Device Inspection
      if (isDetailSheetOpen && selectedDevice != null) {
        DeviceDetailSheet(
          device = selectedDevice!!,
          sheetState = sheetState,
          isPinned = viewModel.isNodePinned(selectedDevice!!.id),
          onDismiss = { viewModel.closeDetailSheet() },
          onTogglePin = { viewModel.togglePin(it) },
          onToggleIsolation = { viewModel.toggleDeviceIsolation(it) },
          onRescanDevice = { viewModel.rescanSingleDevice(it) }
        )
      }
    }
  }
}
