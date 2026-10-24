import type { Metadata } from 'next';
import StoreApp from '@/components/store-app';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '@/lib/data';

type PageProps = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const path = slug.join('/');
  if (path.startsWith('products/')) {
    const productSlug = path.slice('products/'.length);
    const product = INITIAL_PRODUCTS.find(item => item.slug === productSlug);
    if (product) return {
      title: `${product.name} | ONE 2 1 EIGHT`,
      description: `${product.description} Shop ${product.name} online from ONE 2 1 EIGHT. Price ₹${product.price}.`,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: { title: `${product.name} | ONE 2 1 EIGHT`, description: product.description, images: [{ url: product.images[0] }] },
    };
  }
  const pretty = path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
  if (path.startsWith('collections/')) {
    const collectionName = path === 'collections/one-2-1-eight-luxe' ? 'ONE 2 1 EIGHT LUXE' : (pretty || 'Shop all').replace(/\b\w/g, letter => letter.toUpperCase());
    return { title: `${collectionName} | ONE 2 1 EIGHT`, description: `Shop ${collectionName.toLowerCase()} from ONE 2 1 EIGHT. Premium fits, refined textures and considered everyday menswear.`, alternates: { canonical: `/${path}` } };
  }
  if (path.startsWith('admin')) return { title: 'Store CMS | ONE 2 1 EIGHT', robots: { index: false, follow: false } };
  const titles: Record<string, string> = {
    '': INITIAL_SETTINGS.seoTitle, bag: 'Your Bag | ONE 2 1 EIGHT', wishlist: 'Your Wishlist | ONE 2 1 EIGHT',
    login: 'Sign in | ONE 2 1 EIGHT', search: 'Discover Your Style | ONE 2 1 EIGHT', checkout: 'Checkout | ONE 2 1 EIGHT',
    'order-confirmation': 'Order confirmed | ONE 2 1 EIGHT',
  };
  return { title: titles[path] || `${pretty ? pretty.replace(/\b\w/g, letter => letter.toUpperCase()) : 'Shop'} | ONE 2 1 EIGHT`, description: INITIAL_SETTINGS.seoDescription };
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const initialPath = `/${slug.join('/')}`;
  const productSlug = slug[0] === 'products' ? slug[1] : undefined;
  const product = productSlug ? INITIAL_PRODUCTS.find(item => item.slug === productSlug) : undefined;
  const productSchema = product ? {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    description: product.description, image: product.images,
    brand: { '@type': 'Brand', name: INITIAL_SETTINGS.brandName }, category: product.category,
    sku: product.id, color: product.color, material: product.material,
    offers: { '@type': 'Offer', url: `https://one2oneight.example/products/${product.slug}`, priceCurrency: 'INR', price: product.price, availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', itemCondition: 'https://schema.org/NewCondition' },
  } : null;
  const breadcrumbSchema = slug.length ? {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://one2oneight.example/' },
      { '@type': 'ListItem', position: 2, name: slug[0]?.replace(/-/g, ' '), item: `https://one2oneight.example/${slug[0]}` },
      ...(slug[1] ? [{ '@type': 'ListItem', position: 3, name: product?.name || slug[1].replace(/-/g, ' '), item: `https://one2oneight.example/${slug.join('/')}` }] : []),
    ],
  } : null;
  return <>
    {productSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />}
    {breadcrumbSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />}
    <StoreApp initialPath={initialPath === '/' ? '/' : initialPath} />
  </>;
}
