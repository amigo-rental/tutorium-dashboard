import { Fira_Code as FontMono } from "next/font/google";
import localFont from "next/font/local";

// Primary sans font: Gilroy (local) - Only Medium and Semibold weights
export const fontSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    {
      path: "../public/fonts/Gilroy-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Gilroy-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
