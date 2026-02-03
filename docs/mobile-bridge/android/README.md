# Android 브릿지 파일 배치 가이드

## 📁 파일 위치

Android Studio 프로젝트에서 다음 위치에 파일을 생성하세요:

```
app/
  src/
    main/
      java/  또는 kotlin/  ← 이 폴더를 확장하세요
        com/
          example/
            jiraapp/  ← 여기가 패키지 루트
              MainActivity.kt  ← 기존 파일
              WebAppInterface.kt  ← 새로 생성!
```

## 🔍 패키지명 확인 방법

1. **Android Studio에서 확인**
   - `app/src/main/java/` 또는 `app/src/main/kotlin/` 폴더를 확장
   - 가장 상위 폴더 구조 확인 (예: `com/example/jiraapp/`)

2. **AndroidManifest.xml에서 확인**
   ```xml
   <manifest package="com.example.jiraapp">
   ```

3. **기존 MainActivity.kt 파일 상단 확인**
   ```kotlin
   package com.example.jiraapp  // ← 이것이 패키지명입니다
   ```

## 📝 단계별 설정

### 1단계: WebAppInterface.kt 파일 생성

1. Android Studio에서 `app/src/main/java/[패키지명]/` 또는 `app/src/main/kotlin/[패키지명]/` 폴더를 우클릭
2. `New` → `Kotlin Class/File` 선택
3. 파일명: `WebAppInterface`
4. `docs/mobile-bridge/android/WebAppInterface.kt` 파일의 내용을 복사하여 붙여넣기
5. **중요**: 파일 상단의 패키지명을 실제 프로젝트 패키지명으로 수정
   ```kotlin
   package com.example.jiraapp  // ← 실제 패키지명으로 변경!
   ```

### 2단계: MainActivity.kt 수정

기존 `MainActivity.kt` 파일을 열고, `docs/mobile-bridge/android/MainActivity-example.kt` 파일의 내용을 참고하여 WebView 설정을 추가하세요.

**필수 추가 코드:**
```kotlin
// WebView 설정
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
}

// JavaScript 인터페이스 추가
webView.addJavascriptInterface(
    WebAppInterface(this, webView),
    "Android"
)
```

### 3단계: AndroidManifest.xml 권한 추가

`app/manifests/AndroidManifest.xml` 파일에 권한 추가:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 인터넷 권한 (필수) -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- 위치 권한 (getLocation 사용 시) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- 진동 권한 (vibrate 사용 시) -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <application>
        <!-- ... -->
    </application>
</manifest>
```

### 4단계: activity_main.xml 레이아웃 확인

`app/res/layout/activity_main.xml`에 WebView가 있는지 확인:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

## ✅ 확인 사항

- [ ] `WebAppInterface.kt` 파일이 패키지 폴더에 생성됨
- [ ] 패키지명이 실제 프로젝트 패키지명으로 수정됨
- [ ] `MainActivity.kt`에 WebView 설정 코드 추가됨
- [ ] `AndroidManifest.xml`에 필요한 권한 추가됨
- [ ] `activity_main.xml`에 WebView가 있음

## 🚀 테스트

1. 앱을 빌드하고 실행
2. WebView가 웹 앱을 로드하는지 확인
3. 웹 앱에서 브릿지 메서드 호출 테스트
4. Logcat에서 로그 확인: `adb logcat | grep WebAppInterface`

## ❓ 문제 해결

### JavaScript 인터페이스가 작동하지 않는 경우
- `javaScriptEnabled = true` 확인
- `addJavascriptInterface`가 `onCreate`에서 호출되었는지 확인
- WebView가 완전히 로드된 후 호출하는지 확인

### 권한 오류
- `AndroidManifest.xml`에 필요한 권한이 추가되었는지 확인
- Android 6.0+ 에서는 런타임 권한 요청 코드 추가 필요
