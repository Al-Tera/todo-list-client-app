import Image from "next/image";
import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { Nav } from "./components/Nav";

import "./styles/globals.css";
import styles from "./styles/layout.module.css";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body>
          <section className="flex">
            <Nav />
            <main className="w-full h-full">{children}</main>
          </section>
        </body>
      </html>
    </StoreProvider>
  );
}
