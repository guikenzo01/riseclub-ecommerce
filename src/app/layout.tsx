import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Rise Club Store",
  description: "E-commerce oficial da Rise Club para produtos de corrida e comunidade."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="min-h-dvh text-zinc-50 antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
