import "@portaljs/components/styles.css";
import "@/styles/globals.scss";
import "@/styles/tabs.scss";

import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { useRouter } from "next/router";

import SEO from "../next-seo.config";

import Loader from "../components/_shared/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/_shared/Breadcrumbs";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Determine breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = router.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) return [];
    
    const breadcrumbs = [];
    
    if (segments[0] === 'datasets') {
      breadcrumbs.push({ label: 'Datasets', href: '/datasets' });
      
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
      breadcrumbs.push({ label: 'Organizations', href: '/organizations' });
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
