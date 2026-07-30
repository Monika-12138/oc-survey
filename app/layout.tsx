import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const metadataBase = new URL(host ? `${protocol}://${host}` : "http://localhost:3000");

  return {
    metadataBase,
    title: "关于原创角色与互动方式的小调查",
    description: "了解 OC 创作习惯、角色互动边界与早期测试意愿的匿名问卷。",
    openGraph: {
      title: "关于原创角色与互动方式的小调查",
      description: "你的角色如何被创作、陪伴，又适合怎样的互动方式？",
      images: [{ url: new URL("/og.png", metadataBase).toString(), width: 1792, height: 895 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "关于原创角色与互动方式的小调查",
      description: "一份约 4 分钟的 OC 用户调查",
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
