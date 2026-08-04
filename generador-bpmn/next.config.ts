import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del workspace a esta app (evita que Turbopack infiera otra
  // por lockfiles vecinos en carpetas superiores, ej. package.json de la raíz
  // de CONSULTORAVIRTUAL).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
