import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "EightyNine — Portfolio Diversification Engine",
  description: "A smart portfolio engine for active investors. Real-time prices, diversification rules, rebalance recommendations, and trade simulation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
