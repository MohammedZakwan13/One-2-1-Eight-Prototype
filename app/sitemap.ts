import type { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS } from '@/lib/data';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://one2oneight.example';
  const paths = ['', 'collections/all', 'collections/best-sellers', 'collections/new-arrivals', 'collections/one-2-1-eight-luxe', 'search'];
  return [
    ...paths.map(path => ({ url: `${base}/${path}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: path === '' ? 1 : 0.7 })),
    ...INITIAL_PRODUCTS.map(product => ({ url: `${base}/products/${product.slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.65 })),
  ];
}
