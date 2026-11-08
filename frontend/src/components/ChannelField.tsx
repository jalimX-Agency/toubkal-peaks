"use client";

import { useEffect, useRef } from "react";
import { currentChannel } from "@/lib/channel";

/** Hidden `channel` field of the booking forms: where the visitor came from (Google Ads, search, social...). */
export function ChannelField() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.value = currentChannel();
  }, []);
  return <input ref={ref} type="hidden" name="channel" defaultValue="" />;
}
