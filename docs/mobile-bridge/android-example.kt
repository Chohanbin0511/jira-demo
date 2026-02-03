/**
 * Android 네이티브 브릿지 구현 예제
 * 
 * 이 파일은 Android 앱에서 WebView와 통신하기 위한 예제 코드입니다.
 * 실제 프로젝트에 맞게 수정하여 사용하세요.
 */

package com.example.jiraapp

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.core.content.ContextCompat
import org.json.JSONObject

/**
 * WebView와 통신하는 JavaScript 인터페이스
 */
class WebAppInterface(private val context: Context, private val webView: WebView) {
    private val handler = Handler(Looper.getMainLooper())
    private val tag = "WebAppInterface"

    /**
     * 네이티브 메서드 호출 진입점
     * 웹에서 Android.callNative(JSON.stringify(request)) 형태로 호출
     */
    @JavascriptInterface
    fun callNative(requestJson: String): String? {
        return try {
            val request = JSONObject(requestJson)
            val method = request.getString("method")
            val requestId = request.getString("id")
            val params = request.optJSONObject("params") ?: JSONObject()

            Log.d(tag, "Method called: $method, RequestId: $requestId")

            val result = when (method) {
                "getDeviceInfo" -> handleGetDeviceInfo(requestId)
                "showToast" -> handleShowToast(requestId, params)
                "openNativeScreen" -> handleOpenNativeScreen(requestId, params)
                "share" -> handleShare(requestId, params)
                "getLocation" -> handleGetLocation(requestId)
                "requestPermission" -> handleRequestPermission(requestId, params)
                "vibrate" -> handleVibrate(requestId, params)
                "copyToClipboard" -> handleCopyToClipboard(requestId, params)
                "getAppVersion" -> handleGetAppVersion(requestId)
                "closeApp" -> handleCloseApp(requestId)
                "custom" -> handleCustomMethod(requestId, params)
                else -> createErrorResponse(requestId, "UNKNOWN_METHOD", "Unknown method: $method")
            }

            // 비동기 응답인 경우 null 반환 (나중에 sendToWeb으로 전송)
            if (result == null) {
                null
            } else {
                result
            }
        } catch (e: Exception) {
            Log.e(tag, "Error handling native call", e)
            createErrorResponse("", "EXCEPTION", e.message ?: "Unknown error")
        }
    }

    /**
     * 디바이스 정보 조회
     */
    private fun handleGetDeviceInfo(requestId: String): String {
        val deviceInfo = JSONObject().apply {
            put("platform", "android")
            put("osVersion", Build.VERSION.RELEASE)
            put("appVersion", getAppVersion())
            put("deviceModel", Build.MODEL)
            put("screenWidth", getScreenWidth())
            put("screenHeight", getScreenHeight())
            put("isTablet", isTablet())
        }

        return createSuccessResponse(requestId, deviceInfo)
    }

    /**
     * 토스트 메시지 표시
     */
    private fun handleShowToast(requestId: String, params: JSONObject): String? {
        val message = params.getString("message")
        val duration = params.optInt("duration", 2000)

        handler.post {
            val toastDuration = if (duration > 2000) Toast.LENGTH_LONG else Toast.LENGTH_SHORT
            Toast.makeText(context, message, toastDuration).show()
        }

        // 비동기 작업이므로 즉시 응답
        sendToWeb(requestId, true, null)
        return null
    }

    /**
     * 네이티브 화면 열기
     */
    private fun handleOpenNativeScreen(requestId: String, params: JSONObject): String? {
        val screenName = params.getString("screenName")
        val screenParams = params.optJSONObject("params")

        handler.post {
            // 실제 네비게이션 로직 구현
            // 예: (context as Activity).startActivity(Intent(...))
            Log.d(tag, "Opening native screen: $screenName")
        }

        sendToWeb(requestId, true, null)
        return null
    }

    /**
     * 공유 기능
     */
    private fun handleShare(requestId: String, params: JSONObject): String? {
        val title = params.optString("title", "")
        val text = params.optString("text", "")
        val url = params.optString("url", "")

        handler.post {
            val intent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(android.content.Intent.EXTRA_SUBJECT, title)
                putExtra(android.content.Intent.EXTRA_TEXT, "$text\n$url")
            }
            context.startActivity(android.content.Intent.createChooser(intent, "공유하기"))
        }

        sendToWeb(requestId, true, null)
        return null
    }

    /**
     * 위치 정보 조회
     */
    private fun handleGetLocation(requestId: String): String? {
        // 위치 권한 확인
        if (ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            sendToWeb(
                requestId,
                false,
                null,
                JSONObject().apply {
                    put("code", "PERMISSION_DENIED")
                    put("message", "Location permission not granted")
                }
            )
            return null
        }

        // 실제 위치 서비스 사용 (예: FusedLocationProviderClient)
        // 여기서는 예제로 더미 데이터 반환
        handler.post {
            val location = JSONObject().apply {
                put("latitude", 37.5665)
                put("longitude", 126.9780)
                put("accuracy", 10.0)
            }
            sendToWeb(requestId, true, location)
        }

        return null
    }

    /**
     * 권한 요청
     */
    private fun handleRequestPermission(requestId: String, params: JSONObject): String? {
        val permissionType = params.getString("permission")
        val permission = when (permissionType) {
            "location" -> android.Manifest.permission.ACCESS_FINE_LOCATION
            "camera" -> android.Manifest.permission.CAMERA
            "storage" -> android.Manifest.permission.READ_EXTERNAL_STORAGE
            "contacts" -> android.Manifest.permission.READ_CONTACTS
            "microphone" -> android.Manifest.permission.RECORD_AUDIO
            "notifications" -> if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                android.Manifest.permission.POST_NOTIFICATIONS
            } else {
                null
            }
            else -> null
        }

        if (permission == null) {
            sendToWeb(
                requestId,
                false,
                null,
                JSONObject().apply {
                    put("code", "INVALID_PERMISSION")
                    put("message", "Invalid permission type: $permissionType")
                }
            )
            return null
        }

        val status = when {
            ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED -> "granted"
            else -> "denied"
        }

        val statusJson = JSONObject().apply {
            put("status", status)
        }
        sendToWeb(requestId, true, statusJson)
        return null
    }

    /**
     * 진동
     */
    private fun handleVibrate(requestId: String, params: JSONObject): String? {
        val duration = params.optLong("duration", 200)

        handler.post {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager =
                    context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(duration)
            }
        }

        sendToWeb(requestId, true, null)
        return null
    }

    /**
     * 클립보드 복사
     */
    private fun handleCopyToClipboard(requestId: String, params: JSONObject): String? {
        val text = params.getString("text")

        handler.post {
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("label", text)
            clipboard.setPrimaryClip(clip)
        }

        sendToWeb(requestId, true, null)
        return null
    }

    /**
     * 앱 버전 조회
     */
    private fun handleGetAppVersion(requestId: String): String {
        return createSuccessResponse(requestId, getAppVersion())
    }

    /**
     * 앱 종료
     */
    private fun handleCloseApp(requestId: String): String? {
        handler.post {
            (context as? android.app.Activity)?.finishAffinity()
        }
        sendToWeb(requestId, true, null)
        return null
    }

    /**
     * 커스텀 메서드 처리
     */
    private fun handleCustomMethod(requestId: String, params: JSONObject): String? {
        val methodName = params.getString("methodName")
        val customParams = params.optJSONObject("params")

        Log.d(tag, "Custom method called: $methodName")

        // 커스텀 메서드 로직 구현
        val result = JSONObject().apply {
            put("method", methodName)
            put("executed", true)
        }

        sendToWeb(requestId, true, result)
        return null
    }

    /**
     * 웹으로 응답 전송
     */
    private fun sendToWeb(requestId: String, success: Boolean, data: JSONObject?, error: JSONObject? = null) {
        handler.post {
            val response = JSONObject().apply {
                put("id", requestId)
                put("success", success)
                put("timestamp", System.currentTimeMillis())
                if (data != null) put("data", data)
                if (error != null) put("error", error)
            }

            val jsCode = "window.bridgeResponse($response);"
            webView.evaluateJavascript(jsCode, null)
        }
    }

    /**
     * 성공 응답 생성
     */
    private fun createSuccessResponse(requestId: String, data: Any): String {
        val response = JSONObject().apply {
            put("id", requestId)
            put("success", true)
            put("timestamp", System.currentTimeMillis())
            when (data) {
                is JSONObject -> put("data", data)
                is String -> put("data", data)
                is Number -> put("data", data)
                is Boolean -> put("data", data)
            }
        }
        return response.toString()
    }

    /**
     * 에러 응답 생성
     */
    private fun createErrorResponse(requestId: String, code: String, message: String): String {
        val response = JSONObject().apply {
            put("id", requestId)
            put("success", false)
            put("timestamp", System.currentTimeMillis())
            put("error", JSONObject().apply {
                put("code", code)
                put("message", message)
            })
        }
        return response.toString()
    }

    // 헬퍼 메서드들
    private fun getAppVersion(): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            packageInfo.versionName ?: "1.0.0"
        } catch (e: Exception) {
            "1.0.0"
        }
    }

    private fun getScreenWidth(): Int {
        return context.resources.displayMetrics.widthPixels
    }

    private fun getScreenHeight(): Int {
        return context.resources.displayMetrics.heightPixels
    }

    private fun isTablet(): Boolean {
        return context.resources.configuration.smallestScreenWidthDp >= 600
    }
}

/**
 * MainActivity에서 사용 예제
 */
/*
class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        // WebView 설정
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            setSupportZoom(true)
            builtInZoomControls = false
            displayZoomControls = false
        }

        // JavaScript 인터페이스 추가
        webView.addJavascriptInterface(
            WebAppInterface(this, webView),
            "Android"
        )

        // 웹 앱 로드
        webView.loadUrl("https://your-app.com")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
*/
