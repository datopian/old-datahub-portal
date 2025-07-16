import "@portaljs/components/styles.css";
import "@/styles/globals.scss";
import "@/styles/tabs.scss";

import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect } from "react";

import SEO from "../next-seo.config";

import Loader from "../components/_shared/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/_shared/Breadcrumbs";


const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID ?? "";

const handleRouteChange = (url: URL) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  useEffect(() => {
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // Determine breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = router.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) return [];
    
    const breadcrumbs = [];
    
    if (segments[0] === 'datasets') {
      breadcrumbs.push({ label: 'Datasets', href: '/dataset' });
      
      if (segments[1]) {
        // This is a single dataset page
        const datasetTitle = pageProps.dataset?.title || 'Dataset';
        breadcrumbs.push({ label: datasetTitle });
      }
    } else if (segments[0] === 'about') {
      breadcrumbs.push({ label: 'About' });
    } else if (segments[0] === 'groups') {
      breadcrumbs.push({ label: 'Groups', href: '/groups' });
      if (segments[1]) {
        breadcrumbs.push({ label: segments[1] });
      }
    } else if (segments[0] === 'organizations') {
      breadcrumbs.push({ label: 'Organizations', href: '/organization' });
      if (segments[1]) {
        // This is a single organization page
        const organizationTitle = pageProps.organization?.title || segments[1];
        breadcrumbs.push({ label: organizationTitle });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <Head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </Head>
      <Header />
      <DefaultSeo {...SEO} />
      <Loader />
      {breadcrumbs.length > 0 && (
        <div style={{ 
          background: '#f8fafc', 
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 0'
        }}>
          <div style={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            padding: '0 2rem'
          }}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      )}
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
