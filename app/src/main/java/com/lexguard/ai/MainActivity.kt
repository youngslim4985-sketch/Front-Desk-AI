package com.lexguard.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lexguard.ai.api.LexGuardApi
import com.lexguard.ai.api.LogEntry
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// Obsidian Theme Colors
val Obsidian = Color(0xFF0B0E14)
val ObsidianLight = Color(0xFF161B22)
val Gold = Color(0xFFD4AF37)

class MainViewModel : ViewModel() {
    private val _logs = MutableStateFlow<List<LogEntry>>(emptyList())
    val logs: StateFlow<List<LogEntry>> = _logs

    private val api = Retrofit.Builder()
        .baseUrl("http://10.0.2.2:3000") // Point to local host in emulator
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(LexGuardApi::class.java)

    init {
        pollLogs()
    }

    private fun pollLogs() {
        viewModelScope.launch {
            while (true) {
                try {
                    val result = api.getLogs("tf-invest-123")
                    _logs.value = result
                } catch (e: Exception) {
                    _logs.value = listOf(LogEntry("", "Error connecting to backend: ${e.message}", "ERROR"))
                }
                delay(3000)
            }
        }
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val viewModel = MainViewModel()

        setContent {
            LexGuardTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Obsidian
                ) {
                    LexGuardApp(viewModel)
                }
            }
        }
    }
}

@Composable
fun LexGuardApp(viewModel: MainViewModel) {
    val logs by viewModel.logs.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Header()
        Spacer(modifier = Modifier.height(32.dp))
        StatsRow()
        Spacer(modifier = Modifier.height(24.dp))
        LiveConsole(logs)
    }
}

@Composable
fun Header() {
    // ... existing Header (keeping for context but implementation stays same)
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(
                text = "LexGuard AI",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "AUTONOMOUS RECEPTIONIST",
                fontSize = 10.sp,
                letterSpacing = 2.sp,
                fontWeight = FontWeight.Black,
                color = Gold
            )
        }
        Box(
            modifier = Modifier
                .background(Gold.copy(alpha = 0.1f))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(text = "LIVE", color = Color.Green, fontSize = 10.sp)
        }
    }
}

@Composable
fun StatsRow() {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        StatCard("Calls", "24", Modifier.weight(1f))
        StatCard("Leads", "8", Modifier.weight(1f))
        StatCard("Bookings", "3", Modifier.weight(1f))
    }
}

@Composable
fun StatCard(label: String, value: String, modifier: Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = ObsidianLight)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = label, fontSize = 10.sp, color = Color.White.copy(alpha = 0.4f))
            Text(text = value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Gold)
        }
    }
}

@Composable
fun LiveConsole(logs: List<LogEntry>) {
    Card(
        modifier = Modifier.fillMaxWidth().fillMaxHeight(),
        colors = CardDefaults.cardColors(containerColor = ObsidianLight)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "ORCHESTRATION LOGS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Gold)
            Spacer(modifier = Modifier.height(12.dp))
            if (logs.isEmpty()) {
                LogItem("Waiting for logs...")
            } else {
                logs.forEach { log ->
                    LogItem(log.message)
                }
            }
        }
    }
}

@Composable
fun LogItem(text: String) {
    Text(
        text = "> $text",
        fontSize = 11.sp,
        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
        color = Color.White.copy(alpha = 0.6f),
        modifier = Modifier.padding(vertical = 2.dp)
    )
}
