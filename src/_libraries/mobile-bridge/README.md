# 모바일 네이티브 브릿지

Android/iOS WebView와 Next.js 웹 앱 간 통신을 위한 JavaScript Bridge 라이브러리입니다.

## 개요

이 라이브러리는 웹 앱이 모바일 네이티브 앱의 기능을 호출하고, 네이티브 앱이 웹 앱에 콜백을 전달할 수 있도록 하는 브릿지를 제공합니다.

## 지원 플랫폼

- **Android**: WebView의 `JavaScriptInterface`를 통한 통신
- **iOS**: WKWebView의 `messageHandlers`를 통한 통신
- **Web**: 개발 환경에서의 폴백 (에러 처리)

## 설치 및 설정

### 1. 웹 앱 설정

이 라이브러리는 이미 프로젝트에 포함되어 있습니다. 추가 설치가 필요하지 않습니다.

### 2. Android 네이티브 설정

Android 앱의 WebView에 JavaScript 인터페이스를 추가해야 합니다:

```kotlin
// MainActivity.kt
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = findViewById(R.id.webview)
        webView.settings.javaScriptEnabled = true
        
        // JavaScript 인터페이스 추가
        webView.addJavascriptInterface(WebAppInterface(this), "Android")
        
        // 웹 앱 로드
        webView.loadUrl("https://your-app.com")
    }
}

class WebAppInterface(private val context: Context) {
    @JavascriptInterface
    fun callNative(method: String, params: String?): String? {
        return when (method) {
            "getDeviceInfo" -> {
                val deviceInfo = JSONObject().apply {
                    put("platform", "android")
                    put("osVersion", android.os.Build.VERSION.RELEASE)
                    put("appVersion", getAppVersion())
                    put("deviceModel", android.os.Build.MODEL)
                    put("screenWidth", getScreenWidth())
                    put("screenHeight", getScreenHeight())
                    put("isTablet", isTablet())
                }
                createResponse(true, deviceInfo.toString())
            }
            "showToast" -> {
                val paramsObj = JSONObject(params ?: "{}")
                val message = paramsObj.getString("message")
                val duration = paramsObj.optInt("duration", 2000)
                showToast(message, duration)
                createResponse(true, null)
            }
            // 다른 메서드들...
            else -> createResponse(false, "Unknown method: $method")
        }
    }
    
    private fun createResponse(success: Boolean, data: String?): String {
        val response = JSONObject().apply {
            put("success", success)
            if (data != null) put("data", JSONObject(data))
        }
        return response.toString()
    }
    
    private fun showToast(message: String, duration: Int) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(context, message, duration).show()
        }
    }
    
    // 기타 헬퍼 메서드들...
}
```

### 3. iOS 네이티브 설정

iOS 앱의 WKWebView에 메시지 핸들러를 추가해야 합니다:

```swift
// ViewController.swift
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let config = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        
        // 브릿지 메시지 핸들러 추가
        contentController.add(self, name: "bridge")
        
        config.userContentController = contentController
        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.navigationDelegate = self
        view.addSubview(webView)
        
        // 웹 앱 로드
        if let url = URL(string: "https://your-app.com") {
            webView.load(URLRequest(url: url))
        }
    }
}

extension ViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, 
                               didReceive message: WKScriptMessage) {
        guard message.name == "bridge",
              let body = message.body as? [String: Any],
              let method = body["method"] as? String,
              let requestId = body["id"] as? String else {
            return
        }
        
        let params = body["params"] as? [String: Any] ?? [:]
        
        switch method {
        case "getDeviceInfo":
            let deviceInfo: [String: Any] = [
                "platform": "ios",
                "osVersion": UIDevice.current.systemVersion,
                "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] ?? "",
                "deviceModel": UIDevice.current.model,
                "screenWidth": UIScreen.main.bounds.width,
                "screenHeight": UIScreen.main.bounds.height,
                "isTablet": UIDevice.current.userInterfaceIdiom == .pad
            ]
            sendResponse(requestId: requestId, success: true, data: deviceInfo)
            
        case "showToast":
            if let message = params["message"] as? String {
                DispatchQueue.main.async {
                    // 토스트 표시 로직
                }
                sendResponse(requestId: requestId, success: true, data: nil)
            }
            
        // 다른 메서드들...
        default:
            sendResponse(requestId: requestId, success: false, 
                        error: ["code": "UNKNOWN_METHOD", "message": "Unknown method"])
        }
    }
    
    private func sendResponse(requestId: String, success: Bool, 
                            data: Any? = nil, error: [String: String]? = nil) {
        let response: [String: Any] = [
            "id": requestId,
            "success": success,
            "timestamp": Date().timeIntervalSince1970 * 1000
        ]
        
        if let data = data {
            response["data"] = data
        }
        if let error = error {
            response["error"] = error
        }
        
        let jsonString = try! JSONSerialization.data(withJSONObject: response)
        let json = String(data: jsonString, encoding: .utf8)!
        
        webView.evaluateJavaScript("window.bridgeResponse(\(json))") { _, error in
            if let error = error {
                print("Failed to send response: \(error)")
            }
        }
    }
}
```

## 사용법

### 기본 사용법

```typescript
import { useNativeBridge, showToast, getDeviceInfo } from "@/_libraries/mobile-bridge";

function MyComponent() {
  const { isAvailable, platform, deviceInfo } = useNativeBridge();

  const handleShowToast = async () => {
    if (isAvailable) {
      await showToast("안녕하세요!", 2000);
    }
  };

  return (
    <div>
      <p>브릿지 사용 가능: {isAvailable ? "예" : "아니오"}</p>
      <p>플랫폼: {platform}</p>
      {deviceInfo && (
        <p>앱 버전: {deviceInfo.appVersion}</p>
      )}
      <button onClick={handleShowToast}>토스트 표시</button>
    </div>
  );
}
```

### 직접 메서드 호출

```typescript
import { callNativeMethod } from "@/_libraries/mobile-bridge";

async function customAction() {
  try {
    const result = await callNativeMethod("custom", {
      methodName: "myCustomMethod",
      params: { key: "value" }
    });
    console.log("결과:", result);
  } catch (error) {
    console.error("에러:", error);
  }
}
```

### 디바이스 정보 조회

```typescript
import { useDeviceInfo } from "@/_features/common/hooks/useNativeBridge";

function DeviceInfoComponent() {
  const { deviceInfo, isLoading, error } = useDeviceInfo();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!deviceInfo) return <div>디바이스 정보 없음</div>;

  return (
    <div>
      <p>플랫폼: {deviceInfo.platform}</p>
      <p>OS 버전: {deviceInfo.osVersion}</p>
      <p>디바이스 모델: {deviceInfo.deviceModel}</p>
      <p>화면 크기: {deviceInfo.screenWidth} x {deviceInfo.screenHeight}</p>
    </div>
  );
}
```

## 제공되는 메서드

### 디바이스 정보
- `getDeviceInfo()`: 디바이스 정보 조회
- `getAppVersion()`: 앱 버전 조회

### UI 기능
- `showToast(message, duration)`: 토스트 메시지 표시
- `openNativeScreen(screenName, params)`: 네이티브 화면 열기
- `share(options)`: 공유 기능

### 시스템 기능
- `getLocation()`: 위치 정보 조회
- `requestPermission(permission)`: 권한 요청
- `vibrate(duration)`: 진동
- `copyToClipboard(text)`: 클립보드 복사
- `closeApp()`: 앱 종료

### 커스텀
- `callCustomMethod(methodName, params)`: 커스텀 메서드 호출

## 타입 정의

모든 타입은 `src/_libraries/mobile-bridge/types.ts`에 정의되어 있습니다.

## 주의사항

1. **비동기 처리**: 모든 네이티브 호출은 비동기로 처리됩니다.
2. **에러 처리**: 네이티브 브릿지가 사용 불가능한 경우 에러가 발생할 수 있습니다.
3. **타임아웃**: 각 호출은 30초 후 자동으로 타임아웃됩니다.
4. **보안**: 프로덕션 환경에서는 네이티브 메서드 호출에 적절한 권한 검증을 추가하세요.

## 개발 팁

1. 개발 환경에서는 `isBridgeAvailable()`을 체크하여 웹 환경에서도 동작하도록 처리하세요.
2. 네이티브 메서드 호출 전에 항상 `isBridgeAvailable()`을 확인하세요.
3. 에러 처리를 위해 try-catch를 사용하세요.
