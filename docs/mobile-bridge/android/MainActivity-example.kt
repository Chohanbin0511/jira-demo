/**
 * MainActivity 사용 예제
 * 
 * 이 파일은 참고용입니다. 실제 MainActivity.kt 파일에 아래 코드를 추가하세요.
 * 
 * 위치: app/src/main/java/[패키지명]/MainActivity.kt
 */

package com.example.jiraapp  // ← 실제 패키지명으로 변경하세요!

import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

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
        // "Android"는 웹에서 호출할 때 사용하는 이름입니다
        webView.addJavascriptInterface(
            WebAppInterface(this, webView),
            "Android"
        )

        // 웹 앱 로드
        webView.loadUrl("https://your-app.com")
        // 또는 로컬 파일: webView.loadUrl("file:///android_asset/www/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
