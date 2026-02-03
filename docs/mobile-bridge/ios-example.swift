/**
 * iOS 네이티브 브릿지 구현 예제
 * 
 * 이 파일은 iOS 앱에서 WKWebView와 통신하기 위한 예제 코드입니다.
 * 실제 프로젝트에 맞게 수정하여 사용하세요.
 */

import UIKit
import WebKit
import CoreLocation
import AVFoundation
import Contacts

class ViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!
    private let locationManager = CLLocationManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupWebView()
        setupLocationManager()
        
        // 웹 앱 로드
        if let url = URL(string: "https://your-app.com") {
            webView.load(URLRequest(url: url))
        }
    }
    
    private func setupWebView() {
        let config = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        
        // 브릿지 메시지 핸들러 추가
        contentController.add(self, name: "bridge")
        
        config.userContentController = contentController
        config.preferences.javaScriptEnabled = true
        
        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.navigationDelegate = self
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)
    }
    
    private func setupLocationManager() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
}

// MARK: - WKScriptMessageHandler
extension ViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard message.name == "bridge",
              let body = message.body as? [String: Any],
              let method = body["method"] as? String,
              let requestId = body["id"] as? String else {
            print("Invalid bridge message format")
            return
        }
        
        let params = body["params"] as? [String: Any] ?? [:]
        
        print("Bridge method called: \(method), RequestId: \(requestId)")
        
        switch method {
        case "getDeviceInfo":
            handleGetDeviceInfo(requestId: requestId)
            
        case "showToast":
            handleShowToast(requestId: requestId, params: params)
            
        case "openNativeScreen":
            handleOpenNativeScreen(requestId: requestId, params: params)
            
        case "share":
            handleShare(requestId: requestId, params: params)
            
        case "getLocation":
            handleGetLocation(requestId: requestId)
            
        case "requestPermission":
            handleRequestPermission(requestId: requestId, params: params)
            
        case "vibrate":
            handleVibrate(requestId: requestId, params: params)
            
        case "copyToClipboard":
            handleCopyToClipboard(requestId: requestId, params: params)
            
        case "getAppVersion":
            handleGetAppVersion(requestId: requestId)
            
        case "closeApp":
            handleCloseApp(requestId: requestId)
            
        case "custom":
            handleCustomMethod(requestId: requestId, params: params)
            
        default:
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "UNKNOWN_METHOD", "message": "Unknown method: \(method)"])
        }
    }
    
    // MARK: - Handler Methods
    
    private func handleGetDeviceInfo(requestId: String) {
        let deviceInfo: [String: Any] = [
            "platform": "ios",
            "osVersion": UIDevice.current.systemVersion,
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0",
            "deviceModel": UIDevice.current.model,
            "screenWidth": UIScreen.main.bounds.width,
            "screenHeight": UIScreen.main.bounds.height,
            "isTablet": UIDevice.current.userInterfaceIdiom == .pad
        ]
        sendResponse(requestId: requestId, success: true, data: deviceInfo)
    }
    
    private func handleShowToast(requestId: String, params: [String: Any]) {
        guard let message = params["message"] as? String else {
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "INVALID_PARAMS", "message": "Message is required"])
            return
        }
        
        DispatchQueue.main.async {
            // iOS에서는 토스트가 없으므로 Alert나 커스텀 토스트 사용
            // 예제로는 간단한 Alert 사용
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            self.present(alert, animated: true) {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    alert.dismiss(animated: true)
                }
            }
        }
        
        sendResponse(requestId: requestId, success: true, data: nil)
    }
    
    private func handleOpenNativeScreen(requestId: String, params: [String: Any]) {
        guard let screenName = params["screenName"] as? String else {
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "INVALID_PARAMS", "message": "Screen name is required"])
            return
        }
        
        DispatchQueue.main.async {
            // 실제 네비게이션 로직 구현
            print("Opening native screen: \(screenName)")
            // 예: navigationController?.pushViewController(...)
        }
        
        sendResponse(requestId: requestId, success: true, data: nil)
    }
    
    private func handleShare(requestId: String, params: [String: Any]) {
        let title = params["title"] as? String ?? ""
        let text = params["text"] as? String ?? ""
        let urlString = params["url"] as? String
        
        var items: [Any] = []
        if !title.isEmpty { items.append(title) }
        if !text.isEmpty { items.append(text) }
        if let urlString = urlString, let url = URL(string: urlString) {
            items.append(url)
        }
        
        DispatchQueue.main.async {
            let activityVC = UIActivityViewController(activityItems: items, applicationActivities: nil)
            
            // iPad 지원
            if let popover = activityVC.popoverPresentationController {
                popover.sourceView = self.view
                popover.sourceRect = CGRect(x: self.view.bounds.midX, y: self.view.bounds.midY, width: 0, height: 0)
                popover.permittedArrowDirections = []
            }
            
            self.present(activityVC, animated: true)
        }
        
        sendResponse(requestId: requestId, success: true, data: nil)
    }
    
    private func handleGetLocation(requestId: String) {
        guard CLLocationManager.locationServicesEnabled() else {
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "SERVICE_DISABLED", "message": "Location services are disabled"])
            return
        }
        
        let status = locationManager.authorizationStatus
        guard status == .authorizedWhenInUse || status == .authorizedAlways else {
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "PERMISSION_DENIED", "message": "Location permission not granted"])
            return
        }
        
        locationManager.requestLocation()
        // 위치 업데이트는 CLLocationManagerDelegate에서 처리
        // 여기서는 예제로 더미 데이터 반환
        let location: [String: Any] = [
            "latitude": 37.5665,
            "longitude": 126.9780,
            "accuracy": 10.0
        ]
        sendResponse(requestId: requestId, success: true, data: location)
    }
    
    private func handleRequestPermission(requestId: String, params: [String: Any]) {
        guard let permissionType = params["permission"] as? String else {
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "INVALID_PARAMS", "message": "Permission type is required"])
            return
        }
        
        var status: String = "denied"
        
        switch permissionType {
        case "location":
            let authStatus = locationManager.authorizationStatus
            switch authStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                status = "granted"
            case .denied:
                status = "denied"
            case .notDetermined:
                locationManager.requestWhenInUseAuthorization()
                status = "denied" // 아직 결정되지 않음
            case .restricted:
                status = "denied"
            @unknown default:
                status = "denied"
            }
            
        case "camera":
            let authStatus = AVCaptureDevice.authorizationStatus(for: .video)
            switch authStatus {
            case .authorized:
                status = "granted"
            case .denied, .restricted:
                status = "denied"
            case .notDetermined:
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    let resultStatus = granted ? "granted" : "denied"
                    self.sendResponse(requestId: requestId, success: true,
                                    data: ["status": resultStatus])
                }
                return // 비동기 처리
            @unknown default:
                status = "denied"
            }
            
        case "contacts":
            let authStatus = CNContactStore.authorizationStatus(for: .contacts)
            switch authStatus {
            case .authorized:
                status = "granted"
            case .denied, .restricted:
                status = "denied"
            case .notDetermined:
                CNContactStore().requestAccess(for: .contacts) { granted, _ in
                    let resultStatus = granted ? "granted" : "denied"
                    self.sendResponse(requestId: requestId, success: true,
                                    data: ["status": resultStatus])
                }
                return // 비동기 처리
            @unknown default:
                status = "denied"
            }
            
        default:
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "INVALID_PERMISSION", "message": "Invalid permission type: \(permissionType)"])
            return
        }
        
        sendResponse(requestId: requestId, success: true, data: ["status": status])
    }
    
    private func handleVibrate(requestId: String, params: [String: Any]) {
        let duration = params["duration"] as? Double ?? 200.0
        
        // iOS에서는 UIImpactFeedbackGenerator 사용
        DispatchQueue.main.async {
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        }
        
        sendResponse(requestId: requestId, success: true, data: nil)
    }
    
    private func handleCopyToClipboard(requestId: String, params: [String: Any]) {
        guard let text = params["text"] as? String else {
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "INVALID_PARAMS", "message": "Text is required"])
            return
        }
        
        DispatchQueue.main.async {
            UIPasteboard.general.string = text
        }
        
        sendResponse(requestId: requestId, success: true, data: nil)
    }
    
    private func handleGetAppVersion(requestId: String) {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        sendResponse(requestId: requestId, success: true, data: version)
    }
    
    private func handleCloseApp(requestId: String) {
        DispatchQueue.main.async {
            exit(0)
        }
        sendResponse(requestId: requestId, success: true, data: nil)
    }
    
    private func handleCustomMethod(requestId: String, params: [String: Any]) {
        guard let methodName = params["methodName"] as? String else {
            sendResponse(requestId: requestId, success: false,
                        error: ["code": "INVALID_PARAMS", "message": "Method name is required"])
            return
        }
        
        print("Custom method called: \(methodName)")
        
        let result: [String: Any] = [
            "method": methodName,
            "executed": true
        ]
        
        sendResponse(requestId: requestId, success: true, data: result)
    }
    
    // MARK: - Helper Methods
    
    private func sendResponse(requestId: String, success: Bool,
                            data: Any? = nil, error: [String: String]? = nil) {
        var response: [String: Any] = [
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
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: response, options: [])
            let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
            let jsCode = "window.bridgeResponse(\(jsonString));"
            
            DispatchQueue.main.async {
                self.webView.evaluateJavaScript(jsCode) { result, error in
                    if let error = error {
                        print("Failed to send response to web: \(error)")
                    }
                }
            }
        } catch {
            print("Failed to serialize response: \(error)")
        }
    }
}

// MARK: - CLLocationManagerDelegate
extension ViewController: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else { return }
        
        let locationData: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "altitude": location.altitude
        ]
        
        // 위치 정보를 요청한 requestId를 추적해야 함 (실제 구현에서는 Map 사용)
        // sendResponse(requestId: locationRequestId, success: true, data: locationData)
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error)")
    }
}
