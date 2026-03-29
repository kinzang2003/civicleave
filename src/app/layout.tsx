import type { Metadata } from "next";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export const metadata: Metadata = {
  title: "CivicLeave",
  description: "E-sign platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Theme
          appearance="light"
          accentColor="gray"
          grayColor="gray"
          radius="medium"
          scaling="100%"
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
