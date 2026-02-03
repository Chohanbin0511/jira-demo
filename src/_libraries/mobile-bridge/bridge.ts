/**
 * 모바일 네이티브 브릿지 구현
 * Android/iOS WebView와 통신하는 유틸리티
 */

import type {
  BridgeRequest,
  BridgeResponse,
  BridgeCallback,
  NativeMethod,
  DeviceInfo,
  LocationInfo,
  ShareOptions,
  PermissionType,
  PermissionStatus,
} from "./types";

/**
 * 브릿지 사용 가능 여부 확인
 */
export function isBridgeAvailable(): boolean {
  if (typeof window === "undefined") return false;

  // Android WebView
  if (window.Android) return true;

  // iOS WebView
  if (window.webkit?.messageHandlers) return true;

  // 커스텀 브릿지
  if (window.NativeBridge?.isAvailable()) return true;

  return false;
}

/**
 * 현재 플랫폼 감지
 */
export function getPlatform(): "android" | "ios" | "web" {
  if (typeof window === "undefined") return "web";

  if (window.Android) return "android";
  if (window.webkit?.messageHandlers) return "ios";

  return "web";
}

/**
 * 요청 ID 생성기
 */
let requestIdCounter = 0;
function generateRequestId(): string {
  return `bridge_${Date.now()}_${++requestIdCounter}`;
}

/**
 * 대기 중인 콜백 저장소
 */
const pendingCallbacks = new Map<string, BridgeCallback>();

/**
 * 네이티브 메서드 호출 (Promise 기반)
 */
export async function callNativeMethod<T = unknown>(
  method: NativeMethod,
  params?: Record<string, unknown>
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!isBridgeAvailable()) {
      reject(new Error("Native bridge is not available"));
      return;
    }

    const requestId = generateRequestId();
    const request: BridgeRequest = {
      id: requestId,
      type: "native_call",
      method,
      params,
      timestamp: Date.now(),
    };

    // 콜백 등록
    pendingCallbacks.set(requestId, (response: BridgeResponse) => {
      pendingCallbacks.delete(requestId);
      if (response.success) {
        resolve(response.data as T);
      } else {
        reject(
          new Error(response.error?.message || "Unknown error", {
            cause: response.error,
          })
        );
      }
    });

    try {
      const platform = getPlatform();

      if (platform === "android" && window.Android) {
        // Android WebView 통신
        const androidMethod = window.Android[method as string];
        if (androidMethod) {
          const result = androidMethod(JSON.stringify(request));
          // Android는 동기적으로 결과를 반환할 수 있음
          if (result) {
            try {
              const response: BridgeResponse = JSON.parse(result);
              handleBridgeResponse(response);
            } catch {
              // 비동기 응답을 기다림
            }
          }
        } else {
          // 일반 메서드 호출
          window.Android.callNative?.(JSON.stringify(request));
        }
      } else if (platform === "ios" && window.webkit?.messageHandlers) {
        // iOS WebView 통신
        const handler = window.webkit.messageHandlers[method as string];
        if (handler) {
          handler.postMessage(request);
        } else {
          // 일반 핸들러 사용
          window.webkit.messageHandlers.bridge?.postMessage(request);
        }
      } else if (window.NativeBridge) {
        // 커스텀 브릿지 사용
        window.NativeBridge.callNative(method as string, params).then(
          (data) => {
            const response: BridgeResponse = {
              id: requestId,
              success: true,
              data,
              timestamp: Date.now(),
            };
            handleBridgeResponse(response);
          },
          (error) => {
            const response: BridgeResponse = {
              id: requestId,
              success: false,
              error: {
                code: "CUSTOM_ERROR",
                message:
                  error instanceof Error
                    ? error.message
                    : typeof error === "string"
                      ? error
                      : "Unknown error",
              },
              timestamp: Date.now(),
            };
            handleBridgeResponse(response);
          }
        );
      } else {
        reject(new Error("No available bridge method"));
      }

      // 타임아웃 설정 (30초)
      setTimeout(() => {
        if (pendingCallbacks.has(requestId)) {
          pendingCallbacks.delete(requestId);
          reject(new Error("Bridge call timeout"));
        }
      }, 30000);
    } catch (error) {
      pendingCallbacks.delete(requestId);
      reject(error);
    }
  });
}

/**
 * 브릿지 응답 처리
 * 네이티브에서 호출되는 전역 함수
 */
export function handleBridgeResponse(response: BridgeResponse): void {
  const callback = pendingCallbacks.get(response.id);
  if (callback) {
    callback(response);
  } else {
    console.warn("[Bridge] No callback found for response:", response.id);
  }
}

/**
 * 전역 브릿지 응답 핸들러 등록
 * 네이티브에서 window.bridgeResponse()로 호출할 수 있도록 설정
 */
if (typeof window !== "undefined") {
  (window as Window & { bridgeResponse?: (response: BridgeResponse) => void }).bridgeResponse =
    handleBridgeResponse;
}

/**
 * 디바이스 정보 조회
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  return callNativeMethod<DeviceInfo>("getDeviceInfo");
}

/**
 * 토스트 메시지 표시
 */
export async function showToast(message: string, duration: number = 2000): Promise<void> {
  return callNativeMethod<void>("showToast", { message, duration });
}

/**
 * 네이티브 화면 열기
 */
export async function openNativeScreen(
  screenName: string,
  params?: Record<string, unknown>
): Promise<void> {
  return callNativeMethod<void>("openNativeScreen", { screenName, params });
}

/**
 * 공유 기능
 */
export async function share(options: ShareOptions): Promise<void> {
  return callNativeMethod<void>("share", options as Record<string, unknown>);
}

/**
 * 위치 정보 조회
 */
export async function getLocation(): Promise<LocationInfo> {
  return callNativeMethod<LocationInfo>("getLocation");
}

/**
 * 권한 요청
 */
export async function requestPermission(
  permission: PermissionType
): Promise<PermissionStatus> {
  return callNativeMethod<PermissionStatus>("requestPermission", { permission });
}

/**
 * 진동
 */
export async function vibrate(duration: number = 200): Promise<void> {
  return callNativeMethod<void>("vibrate", { duration });
}

/**
 * 클립보드에 복사
 */
export async function copyToClipboard(text: string): Promise<void> {
  return callNativeMethod<void>("copyToClipboard", { text });
}

/**
 * 앱 버전 조회
 */
export async function getAppVersion(): Promise<string> {
  return callNativeMethod<string>("getAppVersion");
}

/**
 * 앱 종료
 */
export async function closeApp(): Promise<void> {
  return callNativeMethod<void>("closeApp");
}

/**
 * 커스텀 메서드 호출
 */
export async function callCustomMethod<T = unknown>(
  methodName: string,
  params?: Record<string, unknown>
): Promise<T> {
  return callNativeMethod<T>("custom", { methodName, params });
}
