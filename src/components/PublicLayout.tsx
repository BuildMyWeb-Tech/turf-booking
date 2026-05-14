import type { ReactNode } from "react";
import { PublicNav, Footer } from "./PublicNav";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
