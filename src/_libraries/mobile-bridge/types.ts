/**
 * 모바일 네이티브 브릿지 타입 정의
 * Android/iOS WebView와 통신하기 위한 타입
 */

/**
 * 브릿지 메시지 타입
 */
export type BridgeMessageType =
  | "native_call" // 웹 -> 네이티브 호출
  | "web_callback"; // 네이티브 -> 웹 콜백

/**
 * 네이티브 기능 타입
 */
export type NativeMethod =
  | "getDeviceInfo" // 디바이스 정보 조회
  | "showToast" // 토스트 메시지 표시
  | "openNativeScreen" // 네이티브 화면 열기
  | "share" // 공유 기능
  | "getLocation" // 위치 정보 조회
  | "requestPermission" // 권한 요청
  | "vibrate" // 진동
  | "copyToClipboard" // 클립보드 복사
  | "getAppVersion" // 앱 버전 조회
  | "closeApp" // 앱 종료
  | "custom"; // 커스텀 메서드

/**
 * 브릿지 요청 메시지
 */
export interface BridgeRequest {
  id: string; // 요청 ID (콜백 식별용)
  type: BridgeMessageType;
  method: NativeMethod;
  params?: Record<string, unknown>; // 메서드 파라미터
  timestamp: number;
}

/**
 * 브릿지 응답 메시지
 */
export interface BridgeResponse {
  id: string; // 요청 ID와 매칭
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

/**
 * 디바이스 정보
 */
export interface DeviceInfo {
  platform: "android" | "ios" | "web";
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
}

/**
 * 위치 정보
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
}

/**
 * 공유 옵션
 */
export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  files?: string[]; // 파일 경로 배열
}

/**
 * 권한 타입
 */
export type PermissionType =
  | "camera"
  | "location"
  | "storage"
  | "contacts"
  | "microphone"
  | "notifications";

/**
 * 권한 상태
 */
export type PermissionStatus = "granted" | "denied" | "never_ask_again";

/**
 * 브릿지 콜백 함수 타입
 */
export type BridgeCallback = (response: BridgeResponse) => void;

/**
 * 네이티브 브릿지 인터페이스
 * window 객체에 주입되는 네이티브 브릿지
 */
export interface NativeBridge {
  /**
   * 웹에서 네이티브 메서드 호출
   */
  callNative: (method: string, params?: Record<string, unknown>) => Promise<unknown>;

  /**
   * 네이티브에서 웹으로 콜백 전송
   */
  sendToWeb: (response: BridgeResponse) => void;

  /**
   * 브릿지 사용 가능 여부
   */
  isAvailable: () => boolean;
}

/**
 * 전역 window 객체 확장
 */
declare global {
  interface Window {
    NativeBridge?: NativeBridge;
    webkit?: {
      messageHandlers?: {
        [key: string]: {
          postMessage: (message: unknown) => void;
        };
      };
    };
    Android?: {
      [method: string]: (params?: string) => string | void;
    };
  }
}
