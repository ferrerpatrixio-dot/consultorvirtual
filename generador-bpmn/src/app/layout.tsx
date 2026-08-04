import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generador BPMN",
  description: "Generador de diagramas de proceso — CONSULTORAVIRTUAL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
