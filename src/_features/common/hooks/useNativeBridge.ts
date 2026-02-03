/**
 * 네이티브 브릿지 React Hook
 * 모바일 네이티브 기능을 React 컴포넌트에서 쉽게 사용할 수 있도록 하는 훅
 */

import { useEffect, useState, useCallback } from "react";
import {
  isBridgeAvailable,
  getPlatform,
  callNativeMethod,
  type DeviceInfo,
  type NativeMethod,
} from "@/_libraries/mobile-bridge";

/**
 * 브릿지 사용 가능 여부와 플랫폼 정보를 제공하는 훅
 */
export function useNativeBridge() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "web">("web");
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsAvailable(isBridgeAvailable());
    setPlatform(getPlatform());

    // 디바이스 정보 자동 로드
    if (isBridgeAvailable()) {
      setIsLoading(true);
      callNativeMethod<DeviceInfo>("getDeviceInfo")
        .then(setDeviceInfo)
        .catch((error) => {
          console.warn("[useNativeBridge] Failed to get device info:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  /**
   * 네이티브 메서드 호출
   */
  const callMethod = useCallback(
    async <T = unknown>(
      method: NativeMethod,
      params?: Record<string, unknown>
    ): Promise<T> => {
      return callNativeMethod<T>(method, params);
    },
    []
  );

  return {
    isAvailable,
    platform,
    deviceInfo,
    isLoading,
    callMethod,
  };
}

/**
 * 디바이스 정보만 가져오는 훅
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isBridgeAvailable()) {
      setIsLoading(false);
      return;
    }

    callNativeMethod<DeviceInfo>("getDeviceInfo")
      .then((info) => {
        setDeviceInfo(info);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setDeviceInfo(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { deviceInfo, isLoading, error };
}
