import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Las Server Actions vienen limitadas a 1MB por defecto, insuficiente
    // para el formulario de KYC (4 documentos en un solo envío).
    // El techo real lo pone Vercel: ~4.5MB por petición a una función
    // serverless, y ese no se puede subir desde aquí — por eso las imágenes
    // se comprimen en el navegador antes de enviarse
    // (ver src/lib/image-compress.ts).
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
