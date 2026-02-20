import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COI Vault — Vendor Certificate of Insurance Tracking",
  description:
    "Track vendor certificates of insurance, expirations, and compliance in one place — with reminders and audit logs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
