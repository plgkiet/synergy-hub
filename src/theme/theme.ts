const synergyTheme = {
  palette: {
    primary: {
      main: "#123EA4",
      light: "#1E4ED8",
      dark: "#0B2A78",
    },
    accent: {
      sky: "#1EA5E0",
      teal: "#00B4A5",
      green: "#10B981",
      greenDeep: "#059669",
    },
    brandGradient: {
      value: "linear-gradient(135deg, #21D48F 0%, #1EA5E0 45%, #3758D5 100%)",
    },

    neutral: {
      white: "#FFFFFF",
      gray100: "#F3F4F6",
      gray200: "#E5E7EB",
      gray300: "#D1D5DB",
      gray400: "#9CA3AF",
      gray500: "#6B7280",
      gray600: "#4B5563",
      gray700: "#374151",
      gray800: "#1F2933",
    },
  },

  background: {
    app: "linear-gradient(to bottom, #FFFFFF 48%, #1EA5E0 100%)",
    glassBase:
      "linear-gradient(180deg, rgba(210,210,210,0.96) 0%, rgba(195,195,195,0.92) 40%, rgba(180,180,180,0.88) 60%, rgba(110,150,180,0.78) 100%)",
  },

  text: {
    primary: "#0B1120",
    heading: "#1D4ED8",
    muted: "#6B7280",
    onPrimary: "#FFFFFF",
  },

  border: {
    soft: "rgba(255, 255, 255, 0.38)",
    input: "rgba(255, 255, 255, 0.35)",
  },

  radius: {
    glassCard: 50,
    pill: 999,
    md: 12,
  },

  shadow: {
    glassCard:
      "-11px -10px 48px -12px rgba(0, 0, 0, 0.18), " +
      "-2px -2px 12px -8px rgba(0, 0, 0, 0.16), " +
      "inset 2px 2px 11px rgba(255, 255, 255, 0.18), " +
      "inset 1px 1px 5px rgba(255, 255, 255, 0.16)",
    primaryButton: "0 12px 24px rgba(15, 23, 42, 0.5)",
  },

  glass: {
    card: {
      border: "1px solid rgba(255,255,255,0.38)",
      background:
        "linear-gradient(180deg, rgba(210,210,210,0.96) 0%, rgba(195,195,195,0.92) 40%, rgba(180,180,180,0.88) 60%, rgba(110,150,180,0.78) 100%)",
      blur: "14.6px",
    },
    input: {
      background: "rgba(255,255,255,0.12)",
      backgroundFocus: "rgba(255,255,255,0.22)",
      border: "1px solid rgba(255,255,255,0.35)",
      shadow:
        "inset 1px 1px 6px rgba(255,255,255,0.25), inset -1px -1px 4px rgba(0,0,0,0.05)",
      shadowFocus:
        "inset 1px 1px 8px rgba(255,255,255,0.35), inset -1px -1px 6px rgba(0,0,0,0.08)",
    },
  },

  button: {
    primary: {
      background: "#123EA4",
      backgroundHover: "#1E40AF",
      text: "#FFFFFF",
    },
  },

  typography: {
    fontFamily:
      "'JUST Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    headingSize: "22px",
    bodySize: "14px",
    smallSize: "13px",
  },
};

export default synergyTheme;
