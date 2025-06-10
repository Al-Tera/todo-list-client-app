"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col w-[10%] pl-2 pt-2 border-r-3 border-gray-300">
      <Link href="/" className={`${pathname === "/" ? "underline" : ""}`}>
        Task
      </Link>
      <Link
        href="/history"
        className={`${pathname === "/history" ? "underline" : ""}`}
      >
        History
      </Link>
    </nav>
  );
};
