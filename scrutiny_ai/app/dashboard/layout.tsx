import { ReactNode } from "react";
import Header from "@/components/Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <main>{children}</main>
      </div>
    </div>
  );
}
