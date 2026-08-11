import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker uchun: `next build` minimal server bundle'ini `.next/standalone`
  // ga yig'adi, shunda konteynerga butun `node_modules` ko'chirilmaydi.
  output: "standalone",

  images: {
    // Dars muqovalari va o'yin variantlari ixtiyoriy manzildan kelishi mumkin
    // (admin URL kiritadi), shuning uchun oddiy `<img>` ishlatilgan —
    // bu ro'yxat kelajakda `next/image` ga o'tilsa kerak bo'ladi.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
