import QueryProvider from "@/components/providers";
import "@/styles/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  );
}
