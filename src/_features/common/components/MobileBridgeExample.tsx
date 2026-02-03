/**
 * 모바일 브릿지 사용 예제 컴포넌트
 * 실제 사용 시 참고할 수 있는 예제
 */

"use client";

import { useState } from "react";
import { useNativeBridge, useDeviceInfo } from "@/_features/common/hooks/useNativeBridge";
import {
  showToast,
  getLocation,
  share,
  vibrate,
  copyToClipboard,
  requestPermission,
  getAppVersion,
} from "@/_libraries/mobile-bridge";
import { Button } from "@/_features/common/components/ui/button";

export function MobileBridgeExample() {
  const { isAvailable, platform, callMethod } = useNativeBridge();
  const { deviceInfo, isLoading: deviceLoading } = useDeviceInfo();
  const [status, setStatus] = useState<string>("");

  const handleShowToast = async () => {
    try {
      await showToast("안녕하세요! 브릿지가 작동합니다.", 2000);
      setStatus("토스트 메시지 표시됨");
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  const handleGetLocation = async () => {
    try {
      const location = await getLocation();
      setStatus(`위치: ${location.latitude}, ${location.longitude}`);
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  const handleShare = async () => {
    try {
      await share({
        title: "Jira Demo",
        text: "이 앱을 확인해보세요!",
        url: window.location.href,
      });
      setStatus("공유 완료");
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  const handleVibrate = async () => {
    try {
      await vibrate(200);
      setStatus("진동 실행됨");
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await copyToClipboard("복사된 텍스트입니다!");
      setStatus("클립보드에 복사됨");
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission("location");
      setStatus(`권한 상태: ${result}`);
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  const handleGetAppVersion = async () => {
    try {
      const version = await getAppVersion();
      setStatus(`앱 버전: ${version}`);
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  const handleCustomMethod = async () => {
    try {
      const result = await callMethod("custom", {
        methodName: "myCustomMethod",
        params: { test: "value" },
      });
      setStatus(`커스텀 메서드 결과: ${JSON.stringify(result)}`);
    } catch (error) {
      setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
    }
  };

  if (!isAvailable) {
    return (
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">모바일 브릿지 예제</h2>
        <p className="text-muted-foreground">
          네이티브 브릿지가 사용 불가능합니다. 모바일 앱 환경에서만 사용할 수 있습니다.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          현재 플랫폼: {platform}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">모바일 브릿지 예제</h2>
        <p className="text-sm text-muted-foreground">
          플랫폼: <span className="font-medium">{platform}</span>
        </p>
        {deviceLoading ? (
          <p className="text-sm text-muted-foreground">디바이스 정보 로딩 중...</p>
        ) : deviceInfo ? (
          <div className="text-sm text-muted-foreground mt-2 space-y-1">
            <p>OS 버전: {deviceInfo.osVersion}</p>
            <p>앱 버전: {deviceInfo.appVersion}</p>
            <p>디바이스 모델: {deviceInfo.deviceModel}</p>
            <p>화면 크기: {deviceInfo.screenWidth} x {deviceInfo.screenHeight}</p>
            <p>태블릿: {deviceInfo.isTablet ? "예" : "아니오"}</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={handleShowToast} variant="outline" size="sm">
          토스트 표시
        </Button>
        <Button onClick={handleGetLocation} variant="outline" size="sm">
          위치 조회
        </Button>
        <Button onClick={handleShare} variant="outline" size="sm">
          공유
        </Button>
        <Button onClick={handleVibrate} variant="outline" size="sm">
          진동
        </Button>
        <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
          클립보드 복사
        </Button>
        <Button onClick={handleRequestPermission} variant="outline" size="sm">
          권한 요청
        </Button>
        <Button onClick={handleGetAppVersion} variant="outline" size="sm">
          앱 버전 조회
        </Button>
        <Button onClick={handleCustomMethod} variant="outline" size="sm">
          커스텀 메서드
        </Button>
      </div>

      {status && (
        <div className="p-2 bg-muted rounded text-sm">
          <p className="font-medium">상태:</p>
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
