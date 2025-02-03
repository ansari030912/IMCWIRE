import type React from "react"

export const CustomTag: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    style={{
      width: "16px",
      height: "16px",
      fill: "none",
      stroke: "#6d28d9",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

export const CustomGift: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    style={{
      width: "14px",
      height: "14px",
      fill: "none",
      stroke: "#6d28d9",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
)

export const CustomClock: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    style={{
      width: "14px",
      height: "14px",
      fill: "none",
      stroke: "#6d28d9",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const CustomSparkles: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    style={{
      width: "24px",
      height: "24px",
      fill: "none",
      stroke: "#ffffff",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
  >
    <path d="M12 3v1m0 16v1m-8-8h1m16 0h1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7" />
  </svg>
)

