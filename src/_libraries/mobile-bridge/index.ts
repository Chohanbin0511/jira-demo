/**
 * 모바일 네이티브 브릿지 라이브러리
 * Android/iOS WebView와 통신하기 위한 유틸리티 및 훅
 */

export * from "./types";
export * from "./bridge";

// 편의 함수들도 export
export {
  isBridgeAvailable,
  getPlatform,
  callNativeMethod,
  getDeviceInfo,
  showToast,
  openNativeScreen,
  share,
  getLocation,
  requestPermission,
  vibrate,
  copyToClipboard,
  getAppVersion,
  closeApp,
  callCustomMethod,
} from "./bridge";
