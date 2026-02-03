# Android 브릿지 설정 가이드

## 1. 파일 위치 확인

Android Studio에서 프로젝트 구조를 확인하세요:

```
app/
  src/
    main/
      java/  또는 kotlin/
        [패키지명]/  ← 예: com/example/jiraapp/
          MainActivity.kt
          WebAppInterface.kt  ← 여기에 생성
```

## 2. 패키지명 확인 방법

1. Android Studio에서 `app/src/main/java/` 또는 `app/src/main/kotlin/` 폴더를 확장
2. 가장 상위 폴더 구조 확인 (예: `com/example/jiraapp/`)
3. `AndroidManifest.xml` 파일에서도 확인 가능:
   ```xml
   <manifest package="com.example.jiraapp">
   ```

## 3. 파일 생성 및 배치

### 3-1. WebAppInterface.kt 생성

1. `app/src/main/java/[패키지명]/` 또는 `app/src/main/kotlin/[패키지명]/` 폴더에서 우클릭
2. `New` → `Kotlin Class/File` 선택
3. 파일명: `WebAppInterface`
4. `android-example.kt` 파일의 `WebAppInterface` 클래스 내용을 복사

**중요**: 파일 상단의 패키지명을 실제 프로젝트 패키지명으로 수정하세요:
```kotlin
package com.example.jiraapp  // ← 실제 패키지명으로 변경
```

### 3-2. MainActivity.kt 수정

기존 `MainActivity.kt` 파일을 열고, `android-example.kt` 파일 하단의 주석 처리된 MainActivity 예제 코드를 참고하여 WebView 설정을 추가하세요.

## 4. AndroidManifest.xml 권한 추가

`app/manifests/AndroidManifest.xml` 파일에 필요한 권한을 추가하세요:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 위치 권한 (getLocation 사용 시) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- 인터넷 권한 (WebView 사용 시) -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- 진동 권한 (vibrate 사용 시) -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <application>
        <!-- ... -->
    </application>
</manifest>
```

## 5. build.gradle.kts (또는 build.gradle) 확인

WebView를 사용하기 위해 특별한 의존성은 필요 없지만, 최소 SDK 버전을 확인하세요:

```kotlin
android {
    defaultConfig {
        minSdk = 21  // 또는 그 이상
        // ...
    }
}
```

## 6. 실제 사용 예제

`MainActivity.kt`에서 다음과 같이 설정:

```kotlin
package com.example.jiraapp  // 실제 패키지명

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
        webView.addJavascriptInterface(
            WebAppInterface(this, webView),
            "Android"  // 웹에서 Android.callNative()로 호출 가능
        )

        // 웹 앱 로드
        webView.loadUrl("https://your-app.com")
        // 또는 로컬 파일: webView.loadUrl("file:///android_asset/www/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()우
        }
    }
}
```

## 7. activity_main.xml 레이아웃

`app/res/layout/activity_main.xml`에 WebView 추가:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

## 8. 테스트

1. 앱을 빌드하고 실행
2. WebView가 웹 앱을 로드
3. 웹 앱에서 브릿지 메서드 호출 테스트
4. Logcat에서 로그 확인: `adb logcat | grep WebAppInterface`

## 문제 해결

### JavaScript 인터페이스가 작동하지 않는 경우
- `javaScriptEnabled = true` 확인
- `addJavascriptInterface`가 `onCreate`에서 호출되었는지 확인
- WebView가 완전히 로드된 후 호출하는지 확인

### 권한 오류
- `AndroidManifest.xml`에 필요한 권한이 추가되었는지 확인
- 런타임 권한 요청 코드 추가 (Android 6.0+)
