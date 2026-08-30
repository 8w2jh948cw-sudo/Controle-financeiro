import type { ReactNode } from "react";

export type IconName =
  | "home" | "receipt" | "plus" | "target" | "chart" | "homeTab" | "receiptTab" | "plusTab" | "planTab" | "analysisTab" | "eye" | "eyeOff"
  | "settings" | "arrowUp" | "arrowDown" | "import" | "transfer" | "sparkles"
  | "wallet" | "card" | "bank" | "search" | "close" | "check" | "edit"
  | "trash" | "chevron" | "food" | "basket" | "car" | "heart" | "smile"
  | "repeat" | "briefcase" | "income" | "alert" | "trend" | "down" | "up"
  | "coins" | "file" | "info" | "calendar" | "download" | "upload" | "rule"
  | "clock" | "filter" | "more";

export function Icon({ name, size = 22, stroke = 2 }: { name: IconName; size?: number; stroke?: number }) {
  if (name === "homeTab") return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>;
  if (name === "receiptTab") return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>;
  if (name === "plusTab") return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>;
  if (name === "planTab") return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7.904 17.563a1.2 1.2 0 0 0 2.228 .308l2.09 -3.093l4.907 4.907a1.067 1.067 0 0 0 1.509 0l1.047 -1.047a1.067 1.067 0 0 0 0 -1.509l-4.907 -4.907l3.113 -2.09a1.2 1.2 0 0 0 -.309 -2.228l-13.582 -3.904l3.904 13.563" /></svg>;
  if (name === "analysisTab") return <svg viewBox="0 0 75.517578125 70.619140625" width={size} height={size} fill="currentColor" stroke="none" aria-hidden="true">
    <g fillRule="nonzero" transform="scale(1,-1) translate(0,-70.619140625)"><path d="M 9.41015625,20.32421875 L 9.41015625,34.181640625 Q 9.41015625,35.27734375 10.076171875,35.921875 Q 10.7421875,36.56640625 11.90234375,36.56640625 L 18.60546875,36.56640625 Q 19.72265625,36.56640625 20.3994140625,35.921875 Q 21.076171875,35.27734375 21.076171875,34.181640625 L 21.076171875,20.32421875 Q 21.076171875,19.20703125 20.3994140625,18.583984375 Q 19.72265625,17.9609375 18.60546875,17.9609375 L 11.90234375,17.9609375 Q 10.7421875,17.9609375 10.076171875,18.583984375 Q 9.41015625,19.20703125 9.41015625,20.32421875 Z M 24.40625,20.32421875 L 24.40625,42.23828125 Q 24.40625,43.3125 25.072265625,43.95703125 Q 25.73828125,44.6015625 26.876953125,44.6015625 L 33.580078125,44.6015625 Q 34.71875,44.6015625 35.3955078125,43.95703125 Q 36.072265625,43.3125 36.072265625,42.23828125 L 36.072265625,20.32421875 Q 36.072265625,19.20703125 35.3955078125,18.583984375 Q 34.71875,17.9609375 33.580078125,17.9609375 L 26.876953125,17.9609375 Q 25.73828125,17.9609375 25.072265625,18.583984375 Q 24.40625,19.20703125 24.40625,20.32421875 Z M 39.423828125,20.32421875 L 39.423828125,50.294921875 Q 39.423828125,51.412109375 40.1005859375,52.0458984375 Q 40.77734375,52.6796875 41.916015625,52.6796875 L 48.59765625,52.6796875 Q 49.736328125,52.6796875 50.4130859375,52.0458984375 Q 51.08984375,51.412109375 51.08984375,50.294921875 L 51.08984375,20.32421875 Q 51.08984375,19.20703125 50.4130859375,18.583984375 Q 49.736328125,17.9609375 48.59765625,17.9609375 L 41.916015625,17.9609375 Q 40.77734375,17.9609375 40.1005859375,18.583984375 Q 39.423828125,19.20703125 39.423828125,20.32421875 Z M 54.44140625,20.32421875 L 54.44140625,58.3515625 Q 54.44140625,59.447265625 55.1181640625,60.0810546875 Q 55.794921875,60.71484375 56.912109375,60.71484375 L 63.615234375,60.71484375 Q 64.75390625,60.71484375 65.4306640625,60.0810546875 Q 66.107421875,59.447265625 66.107421875,58.3515625 L 66.107421875,20.32421875 Q 66.107421875,19.20703125 65.4306640625,18.583984375 Q 64.75390625,17.9609375 63.615234375,17.9609375 L 56.912109375,17.9609375 Q 55.794921875,17.9609375 55.1181640625,18.583984375 Q 54.44140625,19.20703125 54.44140625,20.32421875 Z M 8.98046875,9.904296875 Q 8.20703125,9.904296875 7.6376953125,10.4521484375 Q 7.068359375,11 7.068359375,11.794921875 Q 7.068359375,12.58984375 7.6376953125,13.1376953125 Q 8.20703125,13.685546875 8.98046875,13.685546875 L 66.537109375,13.685546875 Q 67.310546875,13.685546875 67.8798828125,13.1376953125 Q 68.44921875,12.58984375 68.44921875,11.794921875 Q 68.44921875,11 67.8798828125,10.4521484375 Q 67.310546875,9.904296875 66.537109375,9.904296875 Z" /></g>
  </svg>;
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    receipt: <><path d="M6 3v18l3-2 3 2 3-2 3 2V3l-3 2-3-2-3 2-3-2Z"/><path d="M9 9h6M9 13h6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></>,
    homeTab: null,
    receiptTab: null,
    plusTab: null,
    planTab: null,
    analysisTab: null,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="M3 3l18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6.5 0 10 6 10 6a17.6 17.6 0 0 1-2.2 3M6.6 6.6C3.7 8.4 2 12 2 12s3.5 6 10 6c1 0 2-.2 2.8-.5M9.8 9.8a3 3 0 0 0 4.4 4.4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    arrowUp: <><path d="M7 17 17 7M8 7h9v9"/></>,
    arrowDown: <><path d="m7 7 10 10M17 8v9H8"/></>,
    import: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
    transfer: <><path d="M7 7h11l-3-3M17 17H6l3 3"/></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 13l.7 2.3L8 16l-2.3.7L5 19l-.7-2.3L2 16l2.3-.7L5 13Z"/></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12"/><path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    bank: <><path d="m3 9 9-5 9 5M5 10v7M9 10v7M15 10v7M19 10v7M3 20h18"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    food: <><path d="M6 3v8M3 3v5a3 3 0 0 0 6 0V3M6 11v10M15 3v18M15 3c4 2 5 7 0 10"/></>,
    basket: <><path d="m5 10 2-5M19 10l-2-5M3 10h18l-2 10H5L3 10Z"/><path d="M8 14v2M12 14v2M16 14v2"/></>,
    car: <><path d="m5 16-1 2v2M19 16l1 2v2M3 15h18l-2-7H5l-2 7Z"/><circle cx="7" cy="16" r="1.5"/><circle cx="17" cy="16" r="1.5"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>,
    smile: <><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></>,
    repeat: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/></>,
    income: <><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></>,
    alert: <><path d="M10.3 3.6 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>,
    down: <path d="m7 10 5 5 5-5"/>,
    up: <path d="m7 14 5-5 5 5"/>,
    coins: <><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v5c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 10v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></>,
    file: <><path d="M6 2h8l4 4v16H6Z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
    upload: <><path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/></>,
    rule: <><path d="M4 5h16M4 12h10M4 19h16"/><circle cx="17" cy="12" r="3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
