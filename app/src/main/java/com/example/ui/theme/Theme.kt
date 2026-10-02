package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val CyberColorScheme = darkColorScheme(
  primary = NeonCyan,
  onPrimary = Color(0xFF00363D),
  primaryContainer = Color(0xFF004F58),
  onPrimaryContainer = Color(0xFF80F2FF),
  secondary = NeonBlue,
  onSecondary = Color(0xFF00297B),
  secondaryContainer = Color(0xFF003C9E),
  onSecondaryContainer = Color(0xFFD9E2FF),
  tertiary = StatusSecure,
  onTertiary = Color(0xFF00391A),
  background = CyberBackground,
  onBackground = TextPrimary,
  surface = CyberSurface,
  onSurface = TextPrimary,
  surfaceVariant = CyberSurfaceVariant,
  onSurfaceVariant = TextSecondary,
  error = StatusCritical,
  onError = Color.White,
  outline = CyberCardBorder
)

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = true, // Force cyber dark theme for network NOC visualizer
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = CyberColorScheme,
    typography = Typography,
    content = content
  )
}

