"use client";

import { authService } from "@/services/auth.service";
import { meService } from "@/services/me.service";
import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

export function PresenceHeartbeat() {
  useEffect(() => {
    const sendHeartbeat = () => {
      meService
        .heartbeat()
        .then(() => authService.updateOnlineStatus(true))
        .catch(() => undefined);
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return null;
}
