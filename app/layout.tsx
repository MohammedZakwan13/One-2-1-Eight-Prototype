import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/store-context';

export const metadata: Metadata = {
  metadataBase: new URL('https://one2oneight.example'),
  title: 'ONE 2 1 EIGHT — Elevated everyday menswear',
  description: 'Discover premium everyday menswear with elevated fits, refined textures and considered detail. Shop T-shirts, drop shoulders, sweatshirts, hoodies, polos, track pants and joggers.',
  applicationName: 'ONE 2 1 EIGHT',
  keywords: ['premium menswear', 'oversized t-shirts', 'drop shoulder t-shirts', 'premium hoodies', 'menswear India', 'luxe streetwear'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', title: 'ONE 2 1 EIGHT — Elevated everyday menswear',
    description: 'Wear your own standard. Explore elevated everyday essentials and the Luxe edit.',
    siteName: 'ONE 2 1 EIGHT', url: 'https://one2oneight.example',
  },
  twitter: { card: 'summary_large_image', title: 'ONE 2 1 EIGHT', description: 'Elevated everyday menswear.' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8f7f4' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'ONE 2 1 EIGHT', url: 'https://one2oneight.example',
    description: 'Premium everyday menswear with elevated fits and refined detail.', email: 'care@one2oneight.example',
  };
  const websiteSchema = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'ONE 2 1 EIGHT', url: 'https://one2oneight.example', potentialAction: { '@type': 'SearchAction', target: 'https://one2oneight.example/search?q={search_term_string}', 'query-input': 'required name=search_term_string' } };
  return (
    <html lang="en-IN">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
