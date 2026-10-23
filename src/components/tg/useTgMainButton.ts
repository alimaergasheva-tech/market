"use client";

import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { useTg } from "@/components/tg/TgProvider";

/** MainButton Telegram: текст + колбэк. Скрывается при размонтировании. */
export function useTgMainButton(
  text: string | null,
  onClick: (() => void) | null,
  options?: { enabled?: boolean; loading?: boolean },
) {
  const { isTelegram } = useTg();
  const enabled = options?.enabled ?? true;
  const loading = options?.loading ?? false;

  useEffect(() => {
    if (!isTelegram || !text || !onClick) {
      if (isTelegram) WebApp.MainButton.hide();
      return;
    }

    WebApp.MainButton.setText(text);
    if (enabled) WebApp.MainButton.enable();
    else WebApp.MainButton.disable();
    if (loading) WebApp.MainButton.showProgress();
    else WebApp.MainButton.hideProgress();
    WebApp.MainButton.show();

    const handler = () => onClick();
    WebApp.MainButton.onClick(handler);
    return () => {
      WebApp.MainButton.offClick(handler);
      WebApp.MainButton.hide();
      WebApp.MainButton.hideProgress();
    };
  }, [isTelegram, text, onClick, enabled, loading]);
}
