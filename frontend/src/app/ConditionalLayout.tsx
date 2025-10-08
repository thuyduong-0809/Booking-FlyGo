'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from "./(client-components)/(Header)/SiteHeader";
import Footer from "@/components/Footer";
import FooterNav from "@/components/FooterNav";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Kiểm tra nếu là trang dashboard thì không hiển thị header và footer
  if (pathname === '/dashboard') {
    return <>{children}</>;
  }
  
  // Các trang khác hiển thị đầy đủ layout
  return (
    <>
      <SiteHeader />
      {children}
      <FooterNav />
      <Footer />
    </>
  );
}
