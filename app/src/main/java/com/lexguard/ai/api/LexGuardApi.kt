package com.lexguard.ai.api

import retrofit2.http.GET
import retrofit2.http.Query

interface LexGuardApi {
    @GET("/api/orchestrate/logs")
    suspend fun getLogs(@Query("tenantId") tenantId: String): List<LogEntry>
}

data class LogEntry(
    val timestamp: String,
    val message: String,
    val severity: String
)
