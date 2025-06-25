import "@portaljs/components/styles.css";
import "@/styles/globals.scss";
import "@/styles/tabs.scss";

import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";

import SEO from "../next-seo.config";

import Loader from "../components/_shared/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <DefaultSeo {...SEO} />
      <Loader />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
