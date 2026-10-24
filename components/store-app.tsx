'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, CreditCard, Filter, Heart, Instagram, LockKeyhole,
  LogOut, Mail, MapPin, Menu, MessageCircle, Minus, PackageCheck, Phone, Plus, Search, ShieldCheck, Shirt, ShoppingBag,
  SlidersHorizontal, Sparkles, Star, Truck, UserRound, X, Zap,
} from 'lucide-react';
import { Category, HeroSlide, Product } from '@/lib/data';
import { CartItem, Lead, Review, useStore } from '@/components/store-context';

const money = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;
const slugify = (text: string) => text.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const imageSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const isStorefrontCategory = (cat: Category) => {
  if (!cat.active) return false;
  const slug = cat.slug.toLowerCase().trim();
  const name = cat.name.toLowerCase().trim();
  const excluded = ['track-pant', 'track-pants', 'joggers', 'jogger'];
  return !excluded.includes(slug) && !excluded.includes(name);
};

function useToast() {
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2600);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return { toast, notify };
}

function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark ${small ? 'brand-mark-small' : ''}`} aria-label="One 2 1 Eight"><span>ONE 2 1 EIGHT</span><i /></span>;
}

function SmartImage({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <div className={`smart-image ${!src || failed ? 'smart-image-failed' : ''} ${className}`}>
      {src && !failed ? <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} /> : (
        <div className="image-fallback" aria-label={alt}><span className="fallback-monogram">1218</span><span>{alt}</span></div>
      )}
    </div>
  );
}

function RouteLink({ href, children, className, onClick, title, target }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void; title?: string; target?: '_self' | '_blank' | '_parent' | '_top' }) {
  return <Link href={href} className={className} title={title} target={target} onClick={onClick}>{children}</Link>;
}

function MovingLoader({ initial = false }: { initial?: boolean } = {}) {
  return <div className={`route-loader${initial ? ' initial-route-loader' : ''}`} role="status" aria-live="polite" aria-label={initial ? 'Loading ONE 2 1 EIGHT' : 'Loading next page'}><div className="loader-orbit"><span><Shirt size={20} /></span><span><ShoppingBag size={17} /></span><span><Sparkles size={16} /></span></div><p>ONE 2 1 EIGHT</p></div>;
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="toast-message" role="status"><CheckCircle2 size={17} />{message}</div>;
}

function StoreHeader({
  onSearch, onMenu, onTransition, cartCount, wishlistCount, settings,
}: {
  onSearch: () => void; onMenu: () => void; onTransition: () => void; cartCount: number; wishlistCount: number; settings: ReturnType<typeof useStore>['settings'];
}) {
  return <>
    {settings.announcementEnabled && <div className="announcement"><div className="announcement-track"><span>{settings.promoText}</span><span aria-hidden="true">{settings.promoText}</span><span aria-hidden="true">{settings.promoText}</span></div></div>}
    <header className="site-header">
      <div className="header-mobile-left"><button className="icon-button" onClick={onMenu} aria-label="Open menu"><Menu size={23} strokeWidth={1.7} /></button></div>
      <div className="header-desktop-left"><button className="icon-button" onClick={onMenu} aria-label="Open menu"><Menu size={22} strokeWidth={1.7} /></button><nav className="desktop-nav"><RouteLink href="/collections/new-arrivals" onClick={onTransition}>NEW IN</RouteLink><RouteLink href="/collections/all" onClick={onTransition}>SHOP ALL</RouteLink><RouteLink href="/collections/best-sellers" onClick={onTransition}>BEST SELLERS</RouteLink></nav></div>
      <RouteLink href="/" className="header-logo" onClick={onTransition}><BrandMark /></RouteLink>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search" onClick={onSearch}><Search size={23} strokeWidth={1.65} /></button>
        <RouteLink href="/collections/one-2-1-eight-luxe" className="luxe-nav-link" onClick={onTransition}><Sparkles size={14} /> LUXE</RouteLink>
        <RouteLink href="/wishlist" onClick={onTransition} className="icon-button counted-icon header-wishlist-action" aria-label="Wishlist"><Heart size={22} strokeWidth={1.55} />{wishlistCount > 0 && <span className="count-bubble">{wishlistCount}</span>}</RouteLink>
        <RouteLink href="/bag" onClick={onTransition} className="icon-button counted-icon" aria-label="Shopping bag"><ShoppingBag size={22} strokeWidth={1.55} />{cartCount > 0 && <span className="count-bubble">{cartCount}</span>}</RouteLink>
        <RouteLink href="/login" onClick={onTransition} className="icon-button account-action" aria-label="Account"><UserRound size={22} strokeWidth={1.6} /></RouteLink>
      </div>
    </header>
  </>;
}

function MobileBottomNav({ onTransition, cartCount, wishlistCount }: { onTransition: () => void; cartCount: number; wishlistCount: number }) {
  return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
    <RouteLink href="/" onClick={onTransition}><span className="nav-mini-icon"><Zap size={19} /></span><small>Home</small></RouteLink>
    <RouteLink href="/collections/all" onClick={onTransition}><span className="nav-mini-icon"><Menu size={19} /></span><small>Shop</small></RouteLink>
    <RouteLink href="/wishlist" onClick={onTransition} className="mini-count-wrap"><span className="nav-mini-icon"><Heart size={19} />{wishlistCount > 0 && <i>{wishlistCount}</i>}</span><small>Saved</small></RouteLink>
    <RouteLink href="/bag" onClick={onTransition} className="mini-count-wrap"><span className="nav-mini-icon"><ShoppingBag size={19} />{cartCount > 0 && <i>{cartCount}</i>}</span><small>Bag</small></RouteLink>
    <RouteLink href="/login" onClick={onTransition}><span className="nav-mini-icon"><UserRound size={19} /></span><small>You</small></RouteLink>
  </nav>;
}

function SideMenu({ open, close, categories, onTransition }: { open: boolean; close: () => void; categories: Category[]; onTransition: () => void }) {
  if (!open) return null;
  return <div className="overlay-layer" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
    <aside className="menu-drawer" aria-label="Shop navigation">
      <div className="drawer-top"><BrandMark small /><button className="icon-button" onClick={close} aria-label="Close menu"><X /></button></div>
      <div className="menu-intro"><span>THE 1218 EDIT</span><h2>Wear your own standard.</h2><p>Considered essentials, built for the everyday.</p></div>
      <div className="menu-group-title">DISCOVER</div>
      <RouteLink className="menu-link menu-link-feature" href="/collections/one-2-1-eight-luxe" onClick={() => { close(); onTransition(); }}><Sparkles size={17} /> ONE 2 1 EIGHT LUXE <ArrowUpRight size={17} /></RouteLink>
      <RouteLink className="menu-link" href="/collections/new-arrivals" onClick={() => { close(); onTransition(); }}>New arrivals <ArrowRight size={16} /></RouteLink>
      <RouteLink className="menu-link" href="/collections/best-sellers" onClick={() => { close(); onTransition(); }}>Best sellers <ArrowRight size={16} /></RouteLink>
      <RouteLink className="menu-link" href="/collections/all" onClick={() => { close(); onTransition(); }}>Shop all <ArrowRight size={16} /></RouteLink>
      <div className="menu-group-title menu-category-title">SHOP BY CATEGORY</div>
      <div className="menu-categories">{categories.filter(isStorefrontCategory).map(cat => <RouteLink href={`/collections/${cat.slug}`} key={cat.id} onClick={() => { close(); onTransition(); }}>{cat.name}<ArrowUpRight size={14} /></RouteLink>)}</div>
      <div className="menu-drawer-bottom"><span><Truck size={17} /> Complimentary shipping over ₹1,499</span><span><ShieldCheck size={17} /> 7-day easy returns</span></div>
    </aside>
  </div>;
}

function SearchOverlay({ open, close, onTransition }: { open: boolean; close: () => void; onTransition: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  useEffect(() => { if (open) setQuery(''); }, [open]);
  if (!open) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    try { window.sessionStorage.setItem('one218-last-search', query.trim()); } catch { /* demo can continue without storage */ }
    close(); onTransition(); router.push('/search');
  };
  return <div className="overlay-layer overlay-search" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
    <section className="search-panel" aria-label="Search products">
      <div className="search-panel-head"><BrandMark small /><button className="icon-button" onClick={close} aria-label="Close search"><X /></button></div>
      <form className="search-field-large" onSubmit={submit}><Search size={22} /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tees, layers, fits..." aria-label="Search products" /><button type="submit" aria-label="Submit search"><ArrowRight /></button></form>
      <div className="search-suggestions"><span className="eyebrow">TRENDING RIGHT NOW</span><div>{['Box fit T-shirts', 'Polo', 'Hoodie', 'Drop Shoulder', 'Luxe edit'].map(label => <button key={label} onClick={() => { setQuery(label); try { window.sessionStorage.setItem('one218-last-search', label); } catch { } close(); onTransition(); router.push('/search'); }}>{label}<ArrowUpRight size={14} /></button>)}</div></div>
    </section>
  </div>;
}

function Footer({ onTransition, settings }: { onTransition: () => void; settings: ReturnType<typeof useStore>['settings'] }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const contactNumber = settings.contactPhone.replace(/\D/g, '');
  return <footer className="site-footer">
    <div className="footer-top"><div className="footer-brand"><BrandMark /><p>Elevated everyday menswear.<br />Made for your own standard.</p><div className="social-links"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a><a href={`mailto:${settings.contactEmail}`} aria-label="Email us"><Mail size={18} /></a><a href={`https://wa.me/${contactNumber}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a><a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`} aria-label="Call us"><Phone size={17} /></a></div></div>
      <div className="footer-column"><h3>EXPLORE</h3><RouteLink href="/collections/new-arrivals" onClick={onTransition}>New arrivals</RouteLink><RouteLink href="/collections/best-sellers" onClick={onTransition}>Best sellers</RouteLink><RouteLink href="/collections/one-2-1-eight-luxe" onClick={onTransition}>One 2 1 Eight Luxe</RouteLink><RouteLink href="/collections/all" onClick={onTransition}>Shop all</RouteLink></div>
      <div className="footer-column"><h3>THE DETAILS</h3><RouteLink href="/policies/returns" onClick={onTransition}>Shipping & returns</RouteLink><RouteLink href="/size-guide" onClick={onTransition}>Size & fit guide</RouteLink><a href={`mailto:${settings.contactEmail}`}>Contact us</a><RouteLink href="/#home-seller" onClick={onTransition}>Bulk & custom orders</RouteLink></div>
      <div className="footer-newsletter"><h3>GOOD THINGS, OCCASIONALLY.</h3><p>New drops, considered edits and first access to what’s next.</p>{subscribed ? <div className="subscribed-state"><CheckCircle2 size={18} /> You're on the list. Welcome in.</div> : <form onSubmit={e => { e.preventDefault(); if (email.includes('@')) setSubscribed(true); }}><input type="email" required placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email for newsletter" /><button type="submit" aria-label="Subscribe"><ArrowRight /></button></form>}<small>By subscribing, you agree to receive occasional updates from us.</small></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</span><span>Designed with intention. Worn your way.</span><span className="payment-labels">UPI · VISA · MASTERCARD</span></div>
  </footer>;
}

function ProductCard({ product, isSaved, onToggleWishlist, onTransition }: { product: Product; isSaved: boolean; onToggleWishlist: (id: string) => void; onTransition: () => void }) {
  const discount = product.compareAt > product.price ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  return <article className="product-card">
    <div className="product-card-media"><RouteLink href={`/products/${product.slug}`} onClick={onTransition} className="product-image-link"><SmartImage src={product.images[0]} alt={product.name} /></RouteLink>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      {discount > 0 && <span className="discount-badge">-{discount}%</span>}
      <button className={`wishlist-float ${isSaved ? 'is-saved' : ''}`} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => onToggleWishlist(product.id)}><Heart size={19} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.65} /></button>
      <RouteLink href={`/products/${product.slug}`} className="quick-add" onClick={onTransition}>VIEW PRODUCT <ArrowUpRight size={15} /></RouteLink>
    </div>
    <div className="product-card-info"><div className="product-card-title-row"><RouteLink href={`/products/${product.slug}`} onClick={onTransition} className="product-card-name">{product.name}</RouteLink><span className="card-rating"><Star size={12} fill="currentColor" /> {product.rating.toFixed(1)}</span></div><div className="product-card-meta"><span>{product.color}</span><span>{product.sizes.length} sizes</span></div><div className="product-price-row"><strong>{money(product.price)}</strong>{product.compareAt > product.price && <del>{money(product.compareAt)}</del>}</div><div className="color-dot-row"><i style={{ background: product.colorHex }} /><span>+ curated colours</span></div></div>
  </article>;
}

function ProductGrid({ products, onToggleWishlist, wishlist, onTransition, emptyTitle = 'Nothing here just yet' }: { products: Product[]; onToggleWishlist: (id: string) => void; wishlist: string[]; onTransition: () => void; emptyTitle?: string }) {
  if (!products.length) return <div className="empty-products"><Sparkles size={25} /><h3>{emptyTitle}</h3><p>Try another category or clear your filters.</p><RouteLink href="/collections/all" onClick={onTransition} className="button button-dark">EXPLORE ALL PIECES <ArrowRight size={15} /></RouteLink></div>;
  return <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} isSaved={wishlist.includes(product.id)} onToggleWishlist={onToggleWishlist} onTransition={onTransition} />)}</div>;
}

function SectionHeading({ eyebrow, title, description, href, linkText = 'VIEW ALL', onTransition }: { eyebrow?: string; title: string; description?: string; href?: string; linkText?: string; onTransition?: () => void }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{href && <RouteLink href={href} className="text-link" onClick={onTransition}>{linkText} <ArrowUpRight size={17} /></RouteLink>}</div>;
}

function HomePage({ onTransition, onToggleWishlist, wishlist, notify }: { onTransition: () => void; onToggleWishlist: (id: string) => void; wishlist: string[]; notify: (message: string) => void }) {
  const { products, categories, heroSlides, settings, setLeads } = useStore();
  const activeSlides = heroSlides.filter(slide => slide.active);
  const [slideIndex, setSlideIndex] = useState(0);
  const [sellerForm, setSellerForm] = useState({ name: '', email: '', phone: '', type: 'Bulk purchase', quantity: '50–100 pieces', message: '' });
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { if (slideIndex >= activeSlides.length) setSlideIndex(0); }, [slideIndex, activeSlides.length]);
  useEffect(() => {
    if (activeSlides.length < 2) return;
    const id = window.setInterval(() => setSlideIndex(index => (index + 1) % activeSlides.length), 5400);
    return () => window.clearInterval(id);
  }, [activeSlides.length]);
  const featured = products.filter(product => product.bestSeller).slice(0, 4);
  const latest = products.filter(product => product.newArrival).slice(0, 4);
  const currentSlide = activeSlides[slideIndex];
  const submitLead = (event: FormEvent) => {
    event.preventDefault();
    const lead: Lead = { ...sellerForm, id: `LD-${Date.now().toString().slice(-6)}`, createdAt: new Date().toLocaleDateString('en-IN'), status: 'New' };
    setLeads(current => [lead, ...current]); setSubmitted(true); notify('Thanks — your enquiry is with our team.');
  };
  return <>
    <main className="home-main">
      <section className="hero-section" aria-label="Featured campaign">
        {currentSlide ? <Link href="/collections/all" className="hero-slide hero-slide-link" key={currentSlide.id} onClick={onTransition} aria-label="Shop all ONE 2 1 EIGHT menswear">
          <picture className="hero-picture"><source media="(max-width: 600px)" srcSet={currentSlide.mobileImage} /><img className="hero-photo" src={currentSlide.desktopImage} alt={`${currentSlide.title.replace(/\n/g, ' ')} — ONE 2 1 EIGHT menswear campaign`} fetchPriority="high" onError={event => { event.currentTarget.style.opacity = '0'; }} /></picture>
          <div className="hero-gradient" />
          <div className="hero-content"><h1>{currentSlide.title.split('\n').map((line, idx) => <React.Fragment key={`${line}-${idx}`}>{line}{idx === 0 && currentSlide.title.includes('\n') && <br />}</React.Fragment>)}</h1><p>{currentSlide.body}</p></div>
        </Link> : <div className="hero-empty"><BrandMark /><h1>{settings.brandLine}</h1></div>}
      </section>

      <section className="category-section section-shell"><SectionHeading eyebrow="START WITH YOUR STYLE" title="Shop by category" description="The pieces you'll reach for, on repeat." href="/collections/all" onTransition={onTransition} />
        <div className="category-grid">{categories.filter(isStorefrontCategory).map((category, index) => <RouteLink key={category.id} className={`category-card category-card-${index + 1}`} href={`/collections/${category.slug}`} onClick={onTransition}><SmartImage src={category.image} alt={category.name} /><div className="category-card-shade" /><span className="category-count">0{index + 1}</span><div className="category-card-copy"><h3>{category.name}</h3><span>EXPLORE <ArrowUpRight size={15} /></span></div></RouteLink>)}</div>
      </section>

      <section className="product-section section-shell"><SectionHeading eyebrow="THE PIECES THAT STAY IN ROTATION" title="Best sellers" description="The 1218 signatures. Chosen often, worn everywhere." href="/collections/best-sellers" onTransition={onTransition} /><ProductGrid products={featured} onToggleWishlist={onToggleWishlist} wishlist={wishlist} onTransition={onTransition} /></section>

      <section className="campaign-split section-shell"><div className="campaign-image"><SmartImage
        src="/images/campaign/hoodie-campaign.webp"
        alt="ONE 2 1 EIGHT men's hoodie editorial"
      /><div className="campaign-image-label"></div></div><div className="campaign-copy"><span className="eyebrow">LESS, BUT CONSIDERED</span><h2>Good style<br /><em>is in the details.</em></h2><p>Thoughtful fits. Better hand-feel. Pieces designed to earn their place in your wardrobe, season after season.</p><RouteLink href="/collections/one-2-1-eight-luxe" className="button button-dark" onClick={onTransition}>DISCOVER THE LUXE EDIT <ArrowRight size={16} /></RouteLink><div className="campaign-stats"><div><strong>01</strong><span>Considered fit</span></div><div><strong>02</strong><span>Better materials</span></div><div><strong>03</strong><span>Made to repeat</span></div></div></div></section>

      <section className="product-section section-shell arrivals-section"><SectionHeading eyebrow="JUST IN, JUST RIGHT" title="New arrivals" description="Fresh proportions. New favourites waiting to happen." href="/collections/new-arrivals" onTransition={onTransition} /><ProductGrid products={latest} onToggleWishlist={onToggleWishlist} wishlist={wishlist} onTransition={onTransition} /></section>

      <section className="luxe-feature"><SmartImage src={activeSlides[2]?.desktopImage || currentSlide?.desktopImage || ''} alt="One 2 1 Eight Luxe collection" /><div className="luxe-feature-overlay" /><div className="luxe-feature-content"><span className="eyebrow">THE PRIVATE EDIT</span><h2>ONE 2 1 EIGHT<br /><em>LUXE</em></h2><p>Elevated textures. Understated confidence.<br />A more considered kind of statement.</p><RouteLink href="/collections/one-2-1-eight-luxe" className="button button-ivory" onClick={onTransition}>ENTER THE LUXE EDIT <ArrowUpRight size={17} /></RouteLink></div><div className="luxe-feature-side">LIMITED / CURATED / ESSENTIAL</div></section>

      <section className="service-section section-shell" id="service"><SectionHeading eyebrow="THE STANDARD, BUILT IN" title="Considered from checkout to doorstep" description="The details should feel as good as the fit." /><div className="service-grid"><div className="service-card"><div className="service-icon"><Truck size={23} /></div><h3>Complimentary shipping</h3><p>Free shipping on orders over {money(settings.freeShippingThreshold)}. Clear delivery updates, from us to you.</p><span>01 / DELIVERY</span></div><div className="service-card"><div className="service-icon"><PackageCheck size={23} /></div><h3>7-day easy returns</h3><p>Try it on, find your fit. Eligible pieces can be returned within seven days of delivery.</p><span>02 / PEACE OF MIND</span></div><div className="service-card"><div className="service-icon"><CircleHelp size={23} /></div><h3>Real help, when needed</h3><p>Questions about fit, orders or bulk buying? Reach our team at {settings.contactEmail}.</p><span>03 / HERE TO HELP</span></div></div></section>

      <section className="home-seller-section section-shell" id="home-seller"><div className="seller-intro"><span className="eyebrow">FOR TEAMS, CREWS & GOOD IDEAS</span><h2>Make it<br /><em>your own.</em></h2><p>Looking to buy in bulk, create custom merchandise or work on a special run? Tell us a little about the project. We’ll take it from there.</p><div className="seller-contact-note"><Mail size={17} /><span>Prefer email? <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></span></div></div><div className="seller-form-card">{submitted ? <div className="form-success"><div className="success-mark"><Check size={24} /></div><span className="eyebrow">ENQUIRY RECEIVED</span><h3>Let's make something good.</h3><p>Thanks, {sellerForm.name.split(' ')[0] || 'there'}. Our team will follow up using the contact details you shared.</p><button className="button button-dark" onClick={() => { setSubmitted(false); setSellerForm({ name: '', email: '', phone: '', type: 'Bulk purchase', quantity: '50–100 pieces', message: '' }); }}>SEND ANOTHER ENQUIRY</button></div> : <form onSubmit={submitLead}><div className="seller-form-head"><div><span className="eyebrow">PROJECT ENQUIRY</span><h3>Tell us what you're planning.</h3></div><span className="form-step">01 — 03</span></div><div className="form-grid-two"><label>Your name<input required value={sellerForm.name} onChange={e => setSellerForm({ ...sellerForm, name: e.target.value })} placeholder="Full name" /></label><label>Work email<input required type="email" value={sellerForm.email} onChange={e => setSellerForm({ ...sellerForm, email: e.target.value })} placeholder="name@company.com" /></label><label>Phone number<input required type="tel" value={sellerForm.phone} onChange={e => setSellerForm({ ...sellerForm, phone: e.target.value })} placeholder="+91 90000 00000" /></label><label>What do you need?<select value={sellerForm.type} onChange={e => setSellerForm({ ...sellerForm, type: e.target.value })}><option>Bulk purchase</option><option>Custom merchandise</option><option>Corporate gifting</option><option>Collaboration</option><option>Other project</option></select></label></div><label>Approximate quantity<select value={sellerForm.quantity} onChange={e => setSellerForm({ ...sellerForm, quantity: e.target.value })}><option>25–50 pieces</option><option>50–100 pieces</option><option>100–250 pieces</option><option>250+ pieces</option><option>Not sure yet</option></select></label><label>Anything else we should know?<textarea rows={3} value={sellerForm.message} onChange={e => setSellerForm({ ...sellerForm, message: e.target.value })} placeholder="Timeline, designs, sizes, ideas..." /></label><button className="button button-dark seller-submit" type="submit">SEND PROJECT ENQUIRY <ArrowRight size={16} /></button><p className="form-privacy"><LockKeyhole size={12} /> Your details are only used to respond to this enquiry.</p></form>}</div></section>
    </main>
    <Footer onTransition={onTransition} settings={settings} />
  </>;
}

function CollectionPage({ slug, onTransition, onToggleWishlist, wishlist }: { slug: string; onTransition: () => void; onToggleWishlist: (id: string) => void; wishlist: string[] }) {
  const { products, categories, settings } = useStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');
  let title = 'Shop all';
  let base = products;
  const cat = categories.find(category => category.slug === slug);
  if (slug === 'best-sellers') { title = 'Best sellers'; base = products.filter(product => product.bestSeller); }
  else if (slug === 'new-arrivals') { title = 'New arrivals'; base = products.filter(product => product.newArrival); }
  else if (slug === 'one-2-1-eight-luxe') { title = 'ONE 2 1 EIGHT LUXE'; base = products.filter(product => product.luxe); }
  else if (slug === 'layering-edit') { title = 'The layering edit'; base = products.filter(product => ['Hoodie', 'Sweatshirt', 'Drop Shoulder'].includes(product.category)); }
  else if (cat) { title = cat.name; base = products.filter(product => product.category.toLowerCase() === cat.name.toLowerCase()); }
  else if (slug !== 'all') { title = slug.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()); base = products.filter(product => product.category.toLowerCase().includes(slug.replace(/-/g, ' ')) || product.name.toLowerCase().includes(slug.replace(/-/g, ' '))); }
  const colors = Array.from(new Set(base.map(p => p.color)));
  const filtered = base.filter(product => product.price <= maxPrice && (!selectedSizes.length || selectedSizes.some(size => product.sizes.includes(size))) && (!selectedColors.length || selectedColors.includes(product.color)) && (!search || `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(search.toLowerCase())));
  const sorted = [...filtered].sort((a, b) => sortBy === 'price-low' ? a.price - b.price : sortBy === 'price-high' ? b.price - a.price : sortBy === 'rating' ? b.rating - a.rating : sortBy === 'new' ? Number(b.newArrival) - Number(a.newArrival) : Number(b.bestSeller) - Number(a.bestSeller));
  const clearFilters = () => { setSelectedSizes([]); setSelectedColors([]); setMaxPrice(3000); setSearch(''); setSortBy('featured'); };
  const collectionDescription = slug === 'one-2-1-eight-luxe' ? 'A more considered wardrobe: elevated textures, refined details and quieter statements.' : slug === 'new-arrivals' ? 'The latest fits and fresh colour stories, selected for the season ahead.' : slug === 'best-sellers' ? 'The pieces customers come back for. Proven favourites, ready for your rotation.' : 'Find your next everyday favourite in our considered collection of modern essentials.';
  return <><main className={`collection-page ${slug === 'one-2-1-eight-luxe' ? 'collection-page-luxe' : ''}`}>
    <div className={`collection-masthead ${slug === 'one-2-1-eight-luxe' ? 'collection-masthead-luxe' : ''}`}><div className="breadcrumbs"><RouteLink href="/" onClick={onTransition}>Home</RouteLink><span>/</span><span>{title}</span></div><div className="collection-title-row"><div><span className="eyebrow">THE 1218 COLLECTION / {String(base.length).padStart(2, '0')} PIECES</span><h1>{title}</h1><p>{collectionDescription}</p></div>{slug === 'one-2-1-eight-luxe' && <div className="luxe-stamp"><Sparkles size={22} /><span>CURATED<br />EXCLUSIVES</span></div>}</div>
      {slug !== 'one-2-1-eight-luxe' && <div className="collection-category-chips"><RouteLink href="/collections/all" onClick={onTransition}>ALL PIECES</RouteLink>{categories.filter(isStorefrontCategory).map(category => <RouteLink href={`/collections/${category.slug}`} key={category.id} className={category.slug === slug ? 'active' : ''} onClick={onTransition}>{category.name.toUpperCase()}</RouteLink>)}</div>}
    </div>
    <div className="collection-toolbar"><span>{sorted.length} pieces to discover</span><div className="collection-toolbar-actions"><label className="collection-search"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search this edit" aria-label="Search this collection" /></label><label className="sort-select"><span>SORT BY</span><select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="new">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select><ChevronDown size={15} /></label><button className={`filter-button ${filtersOpen ? 'is-active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> FILTERS <span>{selectedSizes.length + selectedColors.length + (maxPrice < 3000 ? 1 : 0) || ''}</span></button></div></div>
    {filtersOpen && <div className="filter-panel"><div className="filter-panel-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h3>Filter & refine</h3></div><button className="icon-button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X /></button></div><div className="filter-groups"><div className="filter-group"><h4>SIZE</h4><div className="filter-size-options">{imageSizes.map(size => <button key={size} className={selectedSizes.includes(size) ? 'selected' : ''} onClick={() => setSelectedSizes(current => current.includes(size) ? current.filter(item => item !== size) : [...current, size])}>{size}</button>)}</div></div><div className="filter-group"><h4>COLOUR</h4><div className="filter-color-options">{colors.map(color => { const product = base.find(item => item.color === color); return <button key={color} className={selectedColors.includes(color) ? 'selected' : ''} onClick={() => setSelectedColors(current => current.includes(color) ? current.filter(item => item !== color) : [...current, color])}><i style={{ background: product?.colorHex }} />{color}</button>; })}</div></div><div className="filter-group price-filter-group"><h4>PRICE UP TO <strong>{money(maxPrice)}</strong></h4><input type="range" min="500" max="3000" step="100" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} aria-label="Maximum price" /><div className="range-labels"><span>₹500</span><span>₹3,000+</span></div></div></div><div className="filter-footer"><button className="text-link" onClick={clearFilters}>CLEAR ALL</button><button className="button button-dark" onClick={() => setFiltersOpen(false)}>SHOW {sorted.length} PIECES <ArrowRight size={15} /></button></div></div>}
    <section className="collection-products"><ProductGrid products={sorted} onToggleWishlist={onToggleWishlist} wishlist={wishlist} onTransition={onTransition} emptyTitle="No pieces match just yet" /></section>
    <div className="collection-endnote"><span className="eyebrow">GOOD THINGS TAKE YOU PLACES</span><p>Explore a little further. Your next favourite might be one click away.</p><RouteLink href="/collections/all" onClick={onTransition} className="text-link">DISCOVER ALL PIECES <ArrowUpRight size={16} /></RouteLink></div>
  </main><Footer onTransition={onTransition} settings={settings} /></>;
}

function ProductDetailPage({ slug, onTransition, onToggleWishlist, wishlist, notify }: { slug: string; onTransition: () => void; onToggleWishlist: (id: string) => void; wishlist: string[]; notify: (message: string) => void }) {
  const { products, settings, addToCart, reviews, setReviews } = useStore();
  const router = useRouter();
  const product = products.find(item => item.slug === slug) || products[0];
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeGuide, setSizeGuide] = useState(false);
  const [deliveryPin, setDeliveryPin] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [activeAccordion, setActiveAccordion] = useState('description');
  const [reviewSort, setReviewSort] = useState('recent');
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');
  const related = products.filter(item => item.id !== product.id && (item.category === product.category || (product.luxe && item.luxe))).slice(0, 4);
  const relevantSavedReviews = reviews.filter(review =>
    [product.id, product.slug, product.name].includes(review.product) && review.status === 'Published'
  );
  const submittedReviewCards = relevantSavedReviews.map(review => ({
    id: review.id, name: review.customer, rating: review.rating, date: review.date,
    title: review.title || 'A considered everyday piece.', text: review.text, isSample: false,
  }));
  const sampleReviewCards = [
    { id: 'sample-1', name: 'Karan M.', rating: 5, date: '2026-10-18', title: 'Better than the basics.', text: `The ${product.name.toLowerCase()} feels considered. Good weight, nice finish and the fit lands exactly where I wanted it.`, isSample: true },
    { id: 'sample-2', name: 'Dev A.', rating: 5, date: '2026-10-11', title: 'On repeat already.', text: 'A very easy piece to style. The product photos give a clear idea of the shape and the finishing feels premium.', isSample: true },
    { id: 'sample-3', name: 'Samar R.', rating: 4, date: '2026-10-02', title: 'Great colour and texture.', text: 'The quality feels considered for the price. A reliable piece for everyday wear.', isSample: true },
  ];
  const reviewCards = [...submittedReviewCards, ...sampleReviewCards].sort((a, b) =>
    reviewSort === 'high' ? b.rating - a.rating : reviewSort === 'low' ? a.rating - b.rating : Date.parse(b.date) - Date.parse(a.date)
  );
  const displayedReviewCount = product.reviewCount + relevantSavedReviews.length;
  const averageRating = ((product.rating * product.reviewCount + relevantSavedReviews.reduce((sum, item) => sum + item.rating, 0)) / Math.max(1, displayedReviewCount)).toFixed(1);
  const submitReview = (event: FormEvent) => {
    event.preventDefault();
    if (!reviewName.trim() || !reviewTitle.trim() || !reviewText.trim()) {
      setReviewNotice('Please complete your name, review title and review.');
      return;
    }
    const nextReview = {
      id: `review-${Date.now()}`, product: product.name, customer: reviewName.trim(), rating: reviewRating,
      title: reviewTitle.trim(), text: reviewText.trim(), date: new Date().toISOString().slice(0, 10), status: 'Published',
    };
    setReviews(current => [nextReview, ...current]);
    setReviewName(''); setReviewRating(5); setReviewTitle(''); setReviewText('');
    setReviewNotice('Thank you — your review is now visible in this prototype.');
    notify('Review submitted successfully.');
  };
  useEffect(() => {
    if (!sizeGuide) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSizeGuide(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', closeOnEscape); };
  }, [sizeGuide]);
  const discount = product.compareAt > product.price ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const add = (goToCheckout = false) => {
    if (!selectedSize) {
      notify('Choose your size to continue.');
      document.getElementById('size-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    addToCart(product.id, selectedSize);
    if (goToCheckout) {
      onTransition();
      router.push('/checkout');
      return;
    }
    notify(`${product.name} · ${selectedSize} added to your bag.`);
  };
  const checkDelivery = (event: FormEvent) => { event.preventDefault(); setDeliveryMessage(/^\d{6}$/.test(deliveryPin) ? `Good news — delivery available to ${deliveryPin}. Estimated 3–5 business days.` : 'Enter a valid 6-digit pincode to check delivery.'); };
  const galleryImages = product.images.length ? product.images : [product.images[0]];
  return <><main className="product-page">
    <div className="breadcrumbs product-breadcrumbs"><RouteLink href="/" onClick={onTransition}>Home</RouteLink><span>/</span><RouteLink href={`/collections/${slugify(product.category)}`} onClick={onTransition}>{product.category}</RouteLink><span>/</span><span>{product.name}</span></div>
    <div className="product-layout">
      <section className="product-gallery" aria-label="Product images"><div className="gallery-main"><SmartImage src={galleryImages[activeImage % galleryImages.length]} alt={`${product.name} view ${activeImage + 1}`} eager /><span className="gallery-image-number">0{activeImage + 1} <i>/</i> 0{galleryImages.length}</span><button className={`gallery-wishlist ${wishlist.includes(product.id) ? 'is-saved' : ''}`} onClick={() => onToggleWishlist(product.id)} aria-label="Save product"><Heart size={20} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} /></button></div><div className="gallery-thumbnails">{galleryImages.map((image, index) => <button key={`${image}-${index}`} className={activeImage === index ? 'active' : ''} onClick={() => setActiveImage(index)} aria-label={`View product image ${index + 1}`}><SmartImage src={image} alt={`${product.name}, view ${index + 1}`} /><span>{['FRONT', 'BACK', 'DETAIL', 'FIT'][index] || `VIEW ${index + 1}`}</span></button>)}</div><div className="gallery-mobile-dots">{galleryImages.map((_, idx) => <button key={idx} className={activeImage === idx ? 'active' : ''} aria-label={`View image ${idx + 1}`} onClick={() => setActiveImage(idx)} />)}</div></section>
      <section className="product-detail-panel"><div className="detail-label-row"><span className="eyebrow">{product.luxe ? 'ONE 2 1 EIGHT LUXE' : product.newArrival ? 'NEW SEASON / 1218' : 'THE 1218 ESSENTIALS'}</span>{product.badge && <span className="detail-badge">{product.badge}</span>}</div><h1>{product.name}</h1><div className="detail-rating-row"><span className="star-rating"><Star size={14} fill="currentColor" /> {averageRating}</span><span>{displayedReviewCount} reviews</span><button onClick={() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' })}>READ REVIEWS <ArrowDownRight size={13} /></button></div><div className="detail-price-row"><strong>{money(product.price)}</strong>{product.compareAt > product.price && <><del>{money(product.compareAt)}</del><span className="detail-discount">SAVE {discount}%</span></>}</div><p className="tax-note">Inclusive of all taxes</p><div className="detail-offer-strip"><span>WELCOME10</span><p>Enjoy 10% off your first order over ₹1,499.</p><button onClick={() => { try { navigator.clipboard?.writeText('WELCOME10'); notify('WELCOME10 copied. Use it in your bag.'); } catch { notify('Use code WELCOME10 in your bag.'); } }}>COPY</button></div>
        <div className="detail-colour-block"><div className="detail-section-label"><span>COLOUR</span><strong>{product.color}</strong></div><div className="detail-colour-swatch"><button className="active" style={{ background: product.colorHex }} aria-label={product.color} /><span>{product.color}</span></div></div>
        <div className="detail-size-block" id="size-picker"><div className="detail-section-label"><span>SELECT SIZE</span><button type="button" className="size-guide-link" onClick={() => setSizeGuide(true)}>SIZE GUIDE <ArrowUpRight size={14} /></button></div><div className="size-options">{product.sizes.map(size => <button key={size} className={`${selectedSize === size ? 'selected' : ''} ${product.stock < 10 && size === 'XL' ? 'low-stock' : ''}`} onClick={() => setSelectedSize(size)}>{size}</button>)}</div><div className="fit-suggestion"><Sparkles size={14} /><span>Designed for a {product.fit.toLowerCase()} silhouette</span></div></div>
        <button className="button button-dark add-to-bag-button" onClick={() => add()}>ADD TO BAG <span>{money(product.price)}</span><ArrowRight size={17} /></button>
        <button className="button buy-now-button" onClick={() => add(true)}>BUY NOW <span>{money(product.price)}</span><ArrowRight size={17} /></button>
        <p className="secure-note"><ShieldCheck size={14} /> Secure checkout · Easy 7-day returns</p>
        <form className="delivery-check" onSubmit={checkDelivery}><label htmlFor="delivery-pin"><MapPin size={15} /> DELIVERY CHECK</label><div className="pin-input-row"><input id="delivery-pin" inputMode="numeric" maxLength={6} value={deliveryPin} onChange={e => { setDeliveryPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setDeliveryMessage(''); }} placeholder="Enter 6-digit pincode" /><button type="submit">CHECK <ArrowRight size={14} /></button></div>{deliveryMessage && <p className={`delivery-response ${deliveryMessage.startsWith('Good') ? 'available' : 'unavailable'}`}>{deliveryMessage}</p>}</form>
        <div className="product-accordions">{[
          { id: 'description', title: 'DESCRIPTION & FIT', content: <><p>{product.description}</p><ul><li>Fit: {product.fit}</li><li>Material: {product.material}</li><li>Model is styled for an editorial look; use the size guide to select your preferred fit.</li></ul></> },
          { id: 'shipping', title: 'SHIPPING & RETURNS', content: <p>{settings.returnPolicy} Complimentary shipping over {money(settings.freeShippingThreshold)}. Delivery timelines shown after a valid pincode check are indicative for this demo.</p> },
          { id: 'care', title: 'CARE GUIDE', content: <p>Wash inside out with similar colours. Use a gentle cold wash, avoid bleach and tumble drying, and dry in shade to help preserve colour and shape.</p> },
        ].map(item => <div className={`product-accordion ${activeAccordion === item.id ? 'open' : ''}`} key={item.id}><button onClick={() => setActiveAccordion(current => current === item.id ? '' : item.id)}><span>{item.title}</span>{activeAccordion === item.id ? <Minus size={17} /> : <Plus size={17} />}</button>{activeAccordion === item.id && <div className="accordion-content">{item.content}</div>}</div>)}</div>
      </section>
    </div>
    <section className="reviews-section" id="product-reviews">
      <div className="reviews-heading">
        <div><span className="eyebrow">THE COMMUNITY SAYS</span><h2>Reviews &amp; ratings</h2><p className="reviews-intro">Honest feedback helps you choose your fit with confidence.</p></div>
        <div className="reviews-score"><strong>{averageRating}</strong><div><div className="stars-five">★★★★★</div><span>Based on {displayedReviewCount} reviews</span></div></div>
      </div>
      <div className="reviews-summary-bar">
        <div><strong>Fit feedback</strong><span>Most customers say it fits as expected.</span></div>
        <div className="review-rating-bars">{[5, 4, 3, 2, 1].map((num, index) => {
          const baseline = [78, 17, 4, 1, 0][index];
          const count = Math.round(baseline * product.reviewCount / 100) + relevantSavedReviews.filter(item => item.rating === num).length;
          const pct = Math.round(count / Math.max(1, displayedReviewCount) * 100);
          return <div key={num}><span>{num}★</span><i><b style={{ width: `${pct}%` }} /></i><em>{pct}%</em></div>;
        })}</div>
        <label>Sort by <select value={reviewSort} onChange={e => setReviewSort(e.target.value)}><option value="recent">Most recent</option><option value="high">Highest rating</option><option value="low">Lowest rating</option></select></label>
      </div>
      <section className="review-submission-panel" aria-labelledby="review-submit-title">
        <div className="review-submission-heading"><span className="eyebrow">YOUR EXPERIENCE MATTERS</span><h3 id="review-submit-title">Leave a review</h3><p>Tell other customers about the fit, feel and finish.</p></div>
        <form className="review-submit-form" onSubmit={submitReview}>
          <label className="review-name-field">YOUR NAME<input value={reviewName} onChange={e => setReviewName(e.target.value)} maxLength={70} required placeholder="Enter your name" /></label>
          <fieldset className="review-rating-field"><legend>YOUR RATING</legend><div className="review-star-picker" role="group" aria-label="Choose a rating">{[1, 2, 3, 4, 5].map(star => <button key={star} type="button" className={star <= reviewRating ? 'selected' : ''} aria-label={`${star} star${star === 1 ? '' : 's'}`} aria-pressed={reviewRating === star} onClick={() => setReviewRating(star)}>★</button>)}</div></fieldset>
          <label className="review-title-field">REVIEW TITLE<input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} maxLength={100} required placeholder="What stood out?" /></label>
          <label className="review-copy-field">YOUR REVIEW<textarea value={reviewText} onChange={e => setReviewText(e.target.value)} minLength={8} maxLength={1200} required rows={3} placeholder="Share your thoughts about this product..." /></label>
          <div className="review-submit-bottom"><span>Prototype demo · submitted reviews are saved to this browser and surfaced in the CMS.</span><button className="button button-dark" type="submit">SUBMIT REVIEW <ArrowRight size={15} /></button></div>
          {reviewNotice && <p className="review-submit-notice" role="status">{reviewNotice}</p>}
        </form>
      </section>
      <div className="review-list">{reviewCards.map(review => <article key={review.id} className="review-card"><div className="review-card-top"><span className="reviewer-initial">{review.name.charAt(0)}</span><div><strong>{review.name}</strong><span>{review.isSample ? 'Illustrative sample' : 'Customer review'} · {new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div><div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div></div><h3>{review.title}</h3><p>{review.text}</p><span className="review-helpful"><CheckCircle2 size={13} />{review.isSample ? 'Example review' : 'Submitted just now'}</span></article>)}</div>
      <p className="review-disclaimer">Sample reviews are illustrative and are not verified purchases. Customer submissions in this prototype are demo data, not connected to a live review service.</p>
    </section>
    <section className="related-products-section"><SectionHeading eyebrow="KEEP THE ROTATION GOING" title="You may also like" description="A few pieces that work well with this one." href={`/collections/${slugify(product.category)}`} onTransition={onTransition} /><ProductGrid products={related.length ? related : products.filter(item => item.id !== product.id).slice(0, 4)} onToggleWishlist={onToggleWishlist} wishlist={wishlist} onTransition={onTransition} /></section>
  </main>
    {sizeGuide && typeof document !== 'undefined' && createPortal(<div className="modal-layer size-guide-layer" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSizeGuide(false); }}><section className="size-guide-modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-title"><div className="modal-head"><div><span className="eyebrow">FIND YOUR FIT</span><h2 id="size-guide-title">Size guide</h2></div><button type="button" className="icon-button" onClick={() => setSizeGuide(false)} aria-label="Close size guide"><X /></button></div><p>Use these garment measurements as a guide. For a more relaxed silhouette, consider sizing up.</p><div className="size-guide-table-wrap"><table><thead><tr><th>Size</th><th>Chest</th><th>Shoulder</th><th>Length</th></tr></thead><tbody>{[['S', '36–38 in', '16.5 in', '27 in'], ['M', '38–40 in', '17.5 in', '28 in'], ['L', '40–42 in', '18.5 in', '29 in'], ['XL', '42–44 in', '19.5 in', '30 in'], ['XXL', '44–46 in', '20.5 in', '31 in']].map(row => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody></table></div><p className="size-guide-note"><CircleHelp size={15} /> Prototype guide only; replace measurements with your approved product specifications before launch.</p><button type="button" className="button button-dark" onClick={() => setSizeGuide(false)}>GOT IT <Check size={15} /></button></section></div>, document.body)}
    <div className="mobile-sticky-buy"><div><span>{money(product.price)}</span><small>{selectedSize ? `Size ${selectedSize}` : 'Choose your size'}</small></div><button onClick={() => add()}>ADD TO BAG <ArrowRight size={15} /></button></div>
    <Footer onTransition={onTransition} settings={settings} /></>;
}

function BagPage({ onTransition, notify }: { onTransition: () => void; notify: (message: string) => void }) {
  const { cart, products, updateCartQuantity, removeFromCart, cartSubtotal, settings } = useStore();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [checkoutError, setCheckoutError] = useState(false);
  const discount = appliedCoupon === 'WELCOME10' && cartSubtotal >= 1499 ? Math.round(cartSubtotal * .1) : appliedCoupon === 'LUXE15' && cart.some(item => products.find(p => p.id === item.productId)?.luxe) ? Math.round(cartSubtotal * .15) : 0;
  const shipping = cartSubtotal - discount >= settings.freeShippingThreshold || cartSubtotal === 0 ? 0 : 79;
  const total = Math.max(0, cartSubtotal - discount + shipping);
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'WELCOME10' && cartSubtotal >= 1499) { setAppliedCoupon(code); setCouponMessage('10% welcome discount applied.'); }
    else if (code === 'WELCOME10') setCouponMessage(`Add ${money(1499 - cartSubtotal)} more to use this code.`);
    else if (code === 'LUXE15' && cart.some(item => products.find(p => p.id === item.productId)?.luxe)) { setAppliedCoupon(code); setCouponMessage('15% Luxe edit discount applied.'); }
    else setCouponMessage('That code is not available for this bag. Try WELCOME10 or LUXE15.');
  };
  return <><main className="bag-page"><div className="bag-title-row"><div className="breadcrumbs"><RouteLink href="/" onClick={onTransition}>Home</RouteLink><span>/</span><span>Shopping bag</span></div><span className="eyebrow">THE GOOD STUFF, READY WHEN YOU ARE</span><h1>Your bag <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h1></div>
    {!cart.length ? <div className="empty-bag"><div className="empty-bag-art"><ShoppingBag size={43} strokeWidth={1} /><Sparkles size={18} /></div><span className="eyebrow">A LITTLE SPACE FOR SOMETHING GOOD</span><h2>Your bag is waiting.</h2><p>Looks like you haven't found your next favourite yet. Take another look around.</p><div className="empty-bag-actions"><RouteLink href="/collections/new-arrivals" className="button button-dark" onClick={onTransition}>SHOP NEW ARRIVALS <ArrowRight size={15} /></RouteLink><RouteLink href="/wishlist" className="button button-outline" onClick={onTransition}>VIEW WISHLIST <Heart size={15} /></RouteLink></div><div className="empty-bag-benefits"><span><Truck size={16} /> Free shipping over ₹1,499</span><span><ShieldCheck size={16} /> 7-day easy returns</span></div></div> : <div className="bag-layout"><section className="bag-items-column"><div className="bag-section-head"><h2>In your bag <span>{cart.length} styles</span></h2><RouteLink href="/collections/all" className="text-link" onClick={onTransition}>KEEP SHOPPING <ArrowRight size={15} /></RouteLink></div>{cart.map(item => { const product = products.find(p => p.id === item.productId); if (!product) return null; return <article className="bag-item" key={`${item.productId}-${item.size}`}><RouteLink href={`/products/${product.slug}`} onClick={onTransition} className="bag-item-image"><SmartImage src={product.images[0]} alt={product.name} /></RouteLink><div className="bag-item-detail"><RouteLink href={`/products/${product.slug}`} onClick={onTransition} className="bag-item-name">{product.name}</RouteLink><span className="bag-item-color">{product.color}</span><span className="bag-item-size">Size: {item.size}</span><div className="quantity-control"><button onClick={() => updateCartQuantity(item.productId, item.size, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => updateCartQuantity(item.productId, item.size, item.quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button></div><div className="bag-item-mobile-price">{money(product.price * item.quantity)}</div></div><div className="bag-item-right"><strong>{money(product.price * item.quantity)}</strong><button className="remove-item" onClick={() => { removeFromCart(item.productId, item.size); notify('Item removed from your bag.'); }}><X size={14} /> REMOVE</button></div></article>; })}<div className="bag-return-note"><PackageCheck size={19} /><div><strong>Not quite right? No worries.</strong><span>{settings.returnPolicy}</span></div></div></section>
      <aside className="order-summary"><span className="eyebrow">THE NUMBERS</span><h2>Order summary</h2><div className="summary-shipping-progress"><div className="shipping-progress-copy">{cartSubtotal >= settings.freeShippingThreshold ? <><CheckCircle2 size={15} /> You've unlocked complimentary shipping</> : <span>Add {money(settings.freeShippingThreshold - cartSubtotal)} more for free shipping</span>}</div><div className="shipping-progress-track"><i style={{ width: `${Math.min(100, (cartSubtotal / settings.freeShippingThreshold) * 100)}%` }} /></div></div><div className="coupon-field"><label htmlFor="coupon">PROMO CODE</label><div><input id="coupon" value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter code" /><button onClick={applyCoupon}>APPLY</button></div>{couponMessage && <p className={appliedCoupon ? 'coupon-success' : 'coupon-error'}>{couponMessage}</p>}</div>{appliedCoupon && <div className="applied-coupon"><span><CheckCircle2 size={15} /> {appliedCoupon}</span><button onClick={() => { setAppliedCoupon(''); setCouponMessage(''); }}>REMOVE</button></div>}<div className="summary-line"><span>Subtotal</span><strong>{money(cartSubtotal)}</strong></div><div className="summary-line"><span>Discount</span><strong className={discount ? 'positive-value' : ''}>{discount ? `−${money(discount)}` : '—'}</strong></div><div className="summary-line"><span>Shipping</span><strong>{shipping === 0 ? 'FREE' : money(shipping)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><small className="summary-tax">Inclusive of all taxes.</small><RouteLink href="/checkout" className="button button-dark checkout-button" onClick={() => { if (!cart.length) setCheckoutError(true); onTransition(); }}>CONTINUE TO CHECKOUT <ArrowRight size={17} /></RouteLink>{checkoutError && <p className="coupon-error">Add an item to your bag before checkout.</p>}<p className="secure-summary"><LockKeyhole size={13} /> Safe & secure checkout</p><div className="payment-methods">UPI <i /> VISA <i /> MASTERCARD <i /> COD</div></aside></div>}
  </main><Footer onTransition={onTransition} settings={settings} /></>;
}

function WishlistPage({ onTransition, onToggleWishlist, wishlist }: { onTransition: () => void; onToggleWishlist: (id: string) => void; wishlist: string[] }) {
  const { products, settings } = useStore();
  const saved = products.filter(product => wishlist.includes(product.id));
  return <><main className="wishlist-page"><div className="wishlist-title"><div className="breadcrumbs"><RouteLink href="/" onClick={onTransition}>Home</RouteLink><span>/</span><span>Wishlist</span></div><span className="eyebrow">YOUR PERSONAL EDIT</span><h1>Saved for later<span>.</span></h1><p>A little shortlist of things you love. They're right here when you're ready.</p></div>{saved.length ? <><div className="wishlist-toolbar"><span>{saved.length} {saved.length === 1 ? 'piece' : 'pieces'} saved</span><button className="text-link" onClick={() => { saved.forEach(product => onToggleWishlist(product.id)); }}>CLEAR WISHLIST <X size={14} /></button></div><ProductGrid products={saved} onToggleWishlist={onToggleWishlist} wishlist={wishlist} onTransition={onTransition} /></> : <div className="empty-wishlist"><div className="empty-heart"><Heart size={43} strokeWidth={1} /><Sparkles size={17} /></div><span className="eyebrow">GOOD TASTE, NO PRESSURE</span><h2>Keep the pieces you love close.</h2><p>Tap the heart on anything that catches your eye, and your personal edit will live here.</p><RouteLink href="/collections/all" className="button button-dark" onClick={onTransition}>DISCOVER YOUR NEXT FAVOURITE <ArrowRight size={16} /></RouteLink></div>}</main><Footer onTransition={onTransition} settings={settings} /></>;
}

function SearchPage({ onTransition, onToggleWishlist, wishlist }: { onTransition: () => void; onToggleWishlist: (id: string) => void; wishlist: string[] }) {
  const { products, settings, categories } = useStore();
  const [query, setQuery] = useState('');
  const [loadedQuery, setLoadedQuery] = useState(false);
  useEffect(() => { try { setQuery(window.sessionStorage.getItem('one218-last-search') || ''); } catch { } setLoadedQuery(true); }, []);
  const results = products.filter(product => !query || `${product.name} ${product.category} ${product.color} ${product.fit}`.toLowerCase().includes(query.toLowerCase()));
  return <><main className="search-page"><div className="search-page-head"><span className="eyebrow">A BETTER WAY TO FIND YOUR FIT</span><h1>Discover your style<span>.</span></h1><div className="search-page-input"><Search size={22} /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Try ‘box fit tee’ or ‘luxe polo’" aria-label="Search all products" /><button onClick={() => setQuery('')} aria-label="Clear search"><X size={18} /></button></div><div className="search-trending-label">{query ? `${results.length} RESULTS FOR “${query.toUpperCase()}”` : 'POPULAR CATEGORIES'}</div>{!query && <div className="search-category-chips">{categories.filter(isStorefrontCategory).map(cat => <RouteLink href={`/collections/${cat.slug}`} key={cat.id} onClick={onTransition}>{cat.name} <ArrowUpRight size={13} /></RouteLink>)}</div>}</div>{loadedQuery && <section className="search-results"><div className="search-results-heading"><h2>{query ? 'Search results' : 'Currently in rotation'}</h2><span>{results.length} pieces</span></div><ProductGrid products={results} onToggleWishlist={onToggleWishlist} wishlist={wishlist} onTransition={onTransition} emptyTitle="No matching pieces found" /></section>}</main><Footer onTransition={onTransition} settings={settings} /></>;
}

function LoginPage({ onTransition, notify }: { onTransition: () => void; notify: (message: string) => void }) {
  const { settings } = useStore();
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const sendOtp = (event: FormEvent) => { event.preventDefault(); if (phone.replace(/\D/g, '').length < 10) return; setOtpStep(true); notify('Demo OTP sent — enter any 6 digits to continue.'); };
  const verify = (event: FormEvent) => { event.preventDefault(); if (otp.every(digit => digit !== '')) { setVerified(true); notify('Demo sign-in successful.'); } else notify('Enter all 6 digits to continue.'); };
  return <><main className="login-page"><div className="login-editorial"><SmartImage src="/images/campaign/menswear-portrait-framed.webp" alt="Editorial campaign model wearing modern menswear" eager /><div className="login-editorial-shade" /><div className="login-editorial-copy"><span className="eyebrow">THE EVERYDAY, ELEVATED</span><h1>Wear what's<br /><em>next.</em></h1><p>Discover considered essentials and a more personal kind of style.</p><span className="editorial-bottom">ONE 2 1 EIGHT / 1218</span></div></div><div className="login-panel-wrap"><div className="login-panel">{verified ? <div className="login-success"><div className="success-mark"><Check size={24} /></div><span className="eyebrow">YOU'RE IN</span><h2>Welcome to 1218.</h2><p>Your demo sign-in is complete. Account history and OTP verification will connect to the production service.</p><RouteLink href="/collections/all" className="button button-dark" onClick={onTransition}>START EXPLORING <ArrowRight size={16} /></RouteLink></div> : <><div className="login-brand"><BrandMark /><span className="eyebrow">YOUR STYLE, YOUR SPACE</span></div><h2>{otpStep ? 'One last step.' : 'Good to have you here.'}</h2><p>{otpStep ? `Enter the 6-digit demo OTP sent to +91 ${phone}.` : 'Sign in or create an account to keep your favourites, orders and details in one place.'}</p>{!otpStep ? <form onSubmit={sendOtp}><label htmlFor="phone-number">MOBILE NUMBER</label><div className="mobile-number-field"><span>+91</span><input id="phone-number" autoComplete="tel-national" type="tel" inputMode="numeric" maxLength={10} required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter 10-digit number" /></div><button className="button button-dark login-submit" type="submit">SEND OTP <ArrowRight size={16} /></button><div className="login-terms">By continuing, you agree to our <a href="#terms">Terms & Conditions</a> and <a href="#privacy">Privacy Policy</a>.</div></form> : <form onSubmit={verify}><label>ENTER VERIFICATION CODE</label><div className="otp-fields">{otp.map((digit, index) => <input key={index} ref={el => { inputs.current[index] = el; }} value={digit} maxLength={1} inputMode="numeric" aria-label={`OTP digit ${index + 1}`} onChange={e => { const next = [...otp]; next[index] = e.target.value.replace(/\D/g, '').slice(-1); setOtp(next); if (next[index] && index < 5) inputs.current[index + 1]?.focus(); }} onKeyDown={e => { if (e.key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1]?.focus(); }} />)}</div><button className="button button-dark login-submit" type="submit">VERIFY & CONTINUE <ArrowRight size={16} /></button><button className="text-link otp-back" type="button" onClick={() => { setOtpStep(false); setOtp(['', '', '', '', '', '']); }}>CHANGE MOBILE NUMBER</button><button className="text-link otp-resend" type="button" onClick={() => notify('A new demo OTP is ready — enter any 6 digits.')}>RESEND CODE</button></form>}<div className="login-security"><ShieldCheck size={16} /><span>Your details stay private and secure.</span></div></>}</div><div className="login-back-link"><RouteLink href="/" onClick={onTransition}><ArrowLeft size={15} /> BACK TO SHOP</RouteLink></div></div></main><Footer onTransition={onTransition} settings={settings} /></>;
}

function CheckoutPage({ onTransition, notify }: { onTransition: () => void; notify: (message: string) => void }) {
  const { cart, products, cartSubtotal, cartCount, settings, setOrders, setCart } = useStore();
  const router = useRouter();
  const [address, setAddress] = useState({ name: '', phone: '', email: '', pin: '', line1: '', city: '', state: '' });
  const [payment, setPayment] = useState('UPI');
  const [accepted, setAccepted] = useState(true);
  const total = cartSubtotal + (cartSubtotal >= settings.freeShippingThreshold ? 0 : 79);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!cartCount) { notify('Your bag is empty.'); router.push('/collections/all'); return; }
    if (!/^\d{6}$/.test(address.pin)) { notify('Enter a valid 6-digit pincode.'); return; }
    if (!accepted) { notify('Please accept the demo checkout terms.'); return; }
    const orderId = `1218-${Math.floor(1100 + Math.random() * 8000)}`;
    setOrders(current => [{ id: orderId, customer: address.name || 'Demo customer', date: new Date().toISOString().slice(0, 10), amount: total, status: 'Processing', items: cartCount }, ...current]);
    setCart([]);
    try { window.sessionStorage.setItem('one218-last-order', JSON.stringify({ orderId, name: address.name, amount: total, payment })); } catch { }
    router.push('/order-confirmation');
  };
  return <><main className="checkout-page"><div className="checkout-title"><div className="breadcrumbs"><RouteLink href="/bag" onClick={onTransition}>Bag</RouteLink><span>/</span><span>Checkout</span></div><span className="eyebrow">ALMOST YOURS</span><h1>Let's get it<br /><em>to your door.</em></h1></div>{!cart.length ? <div className="empty-checkout"><ShoppingBag size={30} /><h2>Your bag is empty</h2><RouteLink href="/collections/all" onClick={onTransition} className="button button-dark">EXPLORE THE COLLECTION <ArrowRight size={16} /></RouteLink></div> : <form className="checkout-layout" onSubmit={submit}><div className="checkout-form-column"><section className="checkout-card"><span className="checkout-step">01</span><div className="checkout-card-heading"><h2>Delivery details</h2><p>Where should we send your order?</p></div><div className="form-grid-two"><label>Full name<input required value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="Name on delivery" /></label><label>Mobile number<input required type="tel" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="10-digit mobile" /></label><label>Email address<input required type="email" value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })} placeholder="For order updates" /></label><label>Pincode<input required inputMode="numeric" maxLength={6} value={address.pin} onChange={e => setAddress({ ...address, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="6-digit pincode" /></label></div><label>Address<input required value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} placeholder="House / flat, street, landmark" /></label><div className="form-grid-two"><label>City<input required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" /></label><label>State<input required value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="State" /></label></div></section><section className="checkout-card"><span className="checkout-step">02</span><div className="checkout-card-heading"><h2>Payment method</h2><p>Select a demo payment option.</p></div><div className="payment-options">{[{ name: 'UPI', desc: 'GPay, PhonePe, Paytm', icon: '↗' }, { name: 'Card', desc: 'Credit or debit card', icon: '▰' }, { name: 'Cash on delivery', desc: 'Pay when your order arrives', icon: '₹' }].map(option => <button type="button" key={option.name} onClick={() => setPayment(option.name)} className={payment === option.name ? 'selected' : ''}><span className="payment-option-icon">{option.icon}</span><span><strong>{option.name}</strong><small>{option.desc}</small></span><i>{payment === option.name ? <Check size={13} /> : null}</i></button>)}</div><label className="checkout-terms"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /><span>I understand this is a prototype checkout and no real payment will be collected.</span></label></section></div><aside className="checkout-summary"><span className="eyebrow">ORDER REVIEW</span><h2>Your pieces <span>({cartCount})</span></h2><div className="checkout-items">{cart.map(item => { const product = products.find(p => p.id === item.productId); if (!product) return null; return <div className="checkout-item" key={`${item.productId}-${item.size}`}><SmartImage src={product.images[0]} alt={product.name} /><div><strong>{product.name}</strong><span>Size {item.size} · Qty {item.quantity}</span></div><b>{money(product.price * item.quantity)}</b></div>; })}</div><div className="summary-line"><span>Subtotal</span><strong>{money(cartSubtotal)}</strong></div><div className="summary-line"><span>Shipping</span><strong>{cartSubtotal >= settings.freeShippingThreshold ? 'FREE' : money(79)}</strong></div><div className="summary-total"><span>To pay</span><strong>{money(total)}</strong></div><button className="button button-dark checkout-place-order" type="submit">PLACE DEMO ORDER <ArrowRight size={17} /></button><div className="checkout-safe"><ShieldCheck size={15} /> Secure demo flow · No payment is taken</div><p className="checkout-note">The order will appear in the CMS Orders area. Real payment, tax and fulfilment integrations are not connected in this prototype.</p></aside></form>}</main><Footer onTransition={onTransition} settings={settings} /></>;
}

function ReturnsPolicyPage({ onTransition }: { onTransition: () => void }) {
  const { settings } = useStore();
  return <><main className="policy-page"><div className="breadcrumbs"><RouteLink href="/" onClick={onTransition}>Home</RouteLink><span>/</span><span>Shipping & returns</span></div><span className="eyebrow">THE DETAILS MATTER</span><h1>Good service is<br /><em>part of the product.</em></h1><p className="policy-lede">Clear expectations, thoughtful support and no guesswork. Here’s how shipping and returns work in this prototype.</p><div className="policy-card-grid"><article><Truck size={22} /><span>01 / DELIVERY</span><h2>Shipping</h2><p>Complimentary shipping on orders over {money(settings.freeShippingThreshold)}. For this demo, delivery estimates are illustrative and no courier booking is created.</p></article><article><PackageCheck size={22} /><span>02 / RETURNS</span><h2>7-day easy returns</h2><p>{settings.returnPolicy}</p></article><article><CircleHelp size={22} /><span>03 / SUPPORT</span><h2>Need a hand?</h2><p>For order, fit or bulk enquiry questions, contact our demo support team. The address below can be replaced with your approved support channel.</p><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail} <ArrowUpRight size={14} /></a></article></div><div className="policy-disclaimer"><ShieldCheck size={17} /><p>This is placeholder policy copy for client approval. Before launch, confirm the final policy, fulfilment windows, applicable exclusions and refund timelines with the business owner.</p></div><RouteLink href="/collections/all" className="button button-dark" onClick={onTransition}>BACK TO SHOPPING <ArrowRight size={16} /></RouteLink></main><Footer onTransition={onTransition} settings={settings} /></>;
}

function SizeGuidePage({ onTransition }: { onTransition: () => void }) {
  const { settings } = useStore();
  return <><main className="size-guide-page"><div className="breadcrumbs"><RouteLink href="/" onClick={onTransition}>Home</RouteLink><span>/</span><span>Size & fit guide</span></div><span className="eyebrow">FIND YOUR OWN FIT</span><h1>Feel good<br /><em>in your size.</em></h1><p className="size-guide-lede">Use the measurement guide below as a starting point. Fit can vary slightly by garment style, so always check the product’s individual description.</p><div className="size-guide-page-layout"><div className="size-guide-table-wrap"><table className="size-guide-table"><thead><tr><th>SIZE</th><th>CHEST</th><th>SHOULDER</th><th>LENGTH</th></tr></thead><tbody>{[['S', '36–38 in', '16.5 in', '27 in'], ['M', '38–40 in', '17.5 in', '28 in'], ['L', '40–42 in', '18.5 in', '29 in'], ['XL', '42–44 in', '19.5 in', '30 in'], ['XXL', '44–46 in', '20.5 in', '31 in']].map(row => <tr key={row[0]}>{row.map((value, i) => <td key={i}>{value}</td>)}</tr>)}</tbody></table><small>Measurements shown are illustrative prototype data, not approved product specifications.</small></div><aside className="size-guide-tips"><span className="eyebrow">A FEW GOOD RULES</span><h2>Choose the feel, not just the label.</h2><div><strong>For a closer fit</strong><p>Start with your usual size and compare chest measurements.</p></div><div><strong>For more room</strong><p>Consider sizing up in oversized or drop-shoulder styles if you prefer additional drape.</p></div><div><strong>Still unsure?</strong><p>Contact <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> with the product name and your preferred fit.</p></div></aside></div><RouteLink href="/collections/all" className="button button-dark" onClick={onTransition}>SHOP ALL PIECES <ArrowRight size={16} /></RouteLink></main><Footer onTransition={onTransition} settings={settings} /></>;
}

function OrderConfirmation({ onTransition }: { onTransition: () => void }) {
  const [order, setOrder] = useState<{ orderId?: string; name?: string; amount?: number; payment?: string }>({});
  const { settings } = useStore();
  useEffect(() => { try { const raw = window.sessionStorage.getItem('one218-last-order'); if (raw) setOrder(JSON.parse(raw)); } catch { } }, []);
  return <><main className="order-confirmation"><div className="confirmation-mark"><Check size={35} /></div><span className="eyebrow">ORDER PLACED / PROTOTYPE</span><h1>Good choice.<br /><em>It's all yours.</em></h1><p>Thanks{order.name ? `, ${order.name.split(' ')[0]}` : ''}. Your demo order has been created successfully. No real payment was taken.</p><div className="confirmation-receipt"><div><span>ORDER NUMBER</span><strong>{order.orderId || '1218-DEMO'}</strong></div><div><span>ORDER TOTAL</span><strong>{money(order.amount || 0)}</strong></div><div><span>PAYMENT METHOD</span><strong>{order.payment || 'Demo checkout'}</strong></div></div><div className="confirmation-next"><PackageCheck size={20} /><div><strong>You're all set.</strong><span>This demo order is visible in the CMS under Orders. Production dispatch messages and tracking can be connected later.</span></div></div><div className="confirmation-actions"><RouteLink href="/collections/new-arrivals" className="button button-dark" onClick={onTransition}>KEEP EXPLORING <ArrowRight size={16} /></RouteLink><RouteLink href="/" className="button button-outline" onClick={onTransition}>BACK HOME</RouteLink></div></main><Footer onTransition={onTransition} settings={settings} /></>;
}

function AdminLogin({ notify }: { notify: (message: string) => void }) {
  const { setAdminAuthed } = useStore();
  const [email, setEmail] = useState('admin@one2oneight.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() === 'admin@one2oneight.com' && password === '1218admin') { setAdminAuthed(true); notify('CMS demo access granted.'); }
    else setError('That demo login did not match. Use the credentials shown below.');
  };
  return <main className="admin-login-page"><div className="admin-login-aside"><div className="admin-login-logo"><BrandMark /><span className="admin-pill">STORE OPERATIONS</span></div><div className="admin-aside-copy"><span className="eyebrow">ONE SYSTEM. EVERY DETAIL.</span><h1>Everything<br />behind the<br /><em>experience.</em></h1><p>Manage the storefront, merchandising and customer enquiries from one considered workspace.</p></div><div className="admin-aside-foot"><span>1218 / COMMERCE STUDIO</span><span>PROTOTYPE ENVIRONMENT</span></div></div><div className="admin-login-form-wrap"><div className="admin-login-form"><span className="eyebrow">RESTRICTED ACCESS</span><h2>Welcome back.</h2><p>Sign in to manage your storefront content.</p><form onSubmit={submit}><label>ADMIN EMAIL<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>PASSWORD<div className="password-input"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} required placeholder="Enter demo password" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'HIDE' : 'SHOW'}</button></div></label>{error && <p className="admin-login-error">{error}</p>}<button className="button button-dark admin-login-submit" type="submit">ENTER CMS <ArrowRight size={16} /></button></form><div className="demo-credentials"><span className="eyebrow">CLIENT DEMO CREDENTIALS</span><div><span>Email</span><button type="button" onClick={() => { setEmail('admin@one2oneight.com'); notify('Demo email filled.'); }}>admin@one2oneight.com</button></div><div><span>Password</span><button type="button" onClick={() => { setPassword('1218admin'); notify('Demo password filled.'); }}>1218admin</button></div><small>Front-end demo gate only — replace with server-side authentication before launch.</small></div></div></div></main>;
}

function AdminSidebar({ activeTab, setActiveTab, onLogout }: { activeTab: string; setActiveTab: (tab: string) => void; onLogout: () => void }) {
  const groups = [
    { title: 'OVERVIEW', items: [{ id: 'overview', label: 'Dashboard', icon: 'dashboard' }] },
    { title: 'SELLING', items: [{ id: 'products', label: 'Products', icon: 'products' }, { id: 'collections', label: 'Categories & edits', icon: 'collections' }, { id: 'orders', label: 'Orders', icon: 'orders' }] },
    { title: 'STOREFRONT', items: [{ id: 'content', label: 'Homepage & banners', icon: 'content' }, { id: 'reviews', label: 'Reviews', icon: 'reviews' }, { id: 'leads', label: 'Bulk enquiries', icon: 'leads' }] },
    { title: 'CONFIGURATION', items: [{ id: 'settings', label: 'Store & SEO', icon: 'settings' }] },
  ];
  const pickIcon = (name: string) => name === 'dashboard' ? <SlidersHorizontal size={17} /> : name === 'products' ? <Shirt size={17} /> : name === 'collections' ? <Filter size={17} /> : name === 'orders' ? <PackageCheck size={17} /> : name === 'content' ? <Sparkles size={17} /> : name === 'reviews' ? <Star size={17} /> : name === 'leads' ? <Mail size={17} /> : <ShieldCheck size={17} />;
  return <aside className="admin-sidebar"><div className="admin-sidebar-brand"><BrandMark small /><span className="admin-pill">CMS / 01</span></div><div className="admin-sidebar-store"><div className="store-avatar">1218</div><div><strong>1218 Commerce</strong><span>Store workspace</span></div><ChevronDown size={15} /></div><nav>{groups.map(group => <div className="admin-nav-group" key={group.title}><span className="admin-nav-label">{group.title}</span>{group.items.map(item => <button key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => setActiveTab(item.id)}>{pickIcon(item.icon)}<span>{item.label}</span>{item.id === 'leads' && <i className="nav-count">•</i>}</button>)}</div>)}</nav><div className="admin-sidebar-bottom"><div className="admin-help-card"><CircleHelp size={18} /><div><strong>Need a hand?</strong><span>Help centre & support</span></div><ArrowUpRight size={14} /></div><button className="admin-logout" onClick={onLogout}><LogOut size={16} /> Sign out</button><div className="admin-user"><span className="admin-user-avatar">A</span><div><strong>Store Admin</strong><span>Administrator</span></div><ChevronDown size={15} /></div></div></aside>;
}

function AdminOverview({ setTab }: { setTab: (tab: string) => void }) {
  const { products, orders, leads, reviews } = useStore();
  const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const lowStock = products.filter(product => product.stock < 12).length;
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">THURSDAY, 22 OCTOBER 2026</span><h1>Good evening, Admin <span>✳</span></h1><p>Here's what's happening across your store today.</p></div><button className="admin-primary-btn" onClick={() => setTab('content')}><Plus size={16} /> Update storefront</button></div><div className="admin-metric-grid"><div className="admin-metric-card"><span>Total orders <i>↗</i></span><strong>{orders.length.toString().padStart(2, '0')}</strong><small className="metric-positive">+12.8% <em>vs last 7 days</em></small><div className="metric-sparkline"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></div><div className="admin-metric-card"><span>Gross revenue <i>↗</i></span><strong>{money(revenue)}</strong><small className="metric-positive">+8.2% <em>vs last 7 days</em></small><div className="metric-sparkline sparkline-two"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></div><div className="admin-metric-card"><span>Active products <i>↗</i></span><strong>{products.length.toString().padStart(2, '0')}</strong><small><em>Across {new Set(products.map(p => p.category)).size} categories</em></small><div className="metric-sparkline sparkline-three"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></div><div className="admin-metric-card"><span>Low stock <i>!</i></span><strong>{lowStock.toString().padStart(2, '0')}</strong><small className={lowStock ? 'metric-warning' : ''}>{lowStock ? 'Needs a quick look' : 'Everything looks good'}</small><button className="metric-text-action" onClick={() => setTab('products')}>REVIEW STOCK <ArrowRight size={13} /></button></div></div><div className="admin-dashboard-grid"><section className="admin-card admin-revenue-card"><div className="admin-card-heading"><div><span className="eyebrow">STORE PERFORMANCE</span><h2>Revenue overview</h2></div><select aria-label="Revenue time range" defaultValue="7 days"><option>7 days</option><option>30 days</option><option>90 days</option></select></div><div className="revenue-total"><strong>{money(revenue)}</strong><span>Demo total across sample orders</span></div><div className="revenue-chart"><div className="chart-y-labels"><span>₹15k</span><span>₹10k</span><span>₹5k</span><span>₹0</span></div><svg viewBox="0 0 650 185" preserveAspectRatio="none" aria-label="Illustrative revenue chart"><defs><linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c6a06a" stopOpacity=".24" /><stop offset="1" stopColor="#c6a06a" stopOpacity="0" /></linearGradient></defs><path d="M0 150 C45 144 55 110 98 121 S154 87 195 104 S257 58 293 76 S340 116 383 70 S446 68 480 52 S536 80 574 34 S621 39 650 12 L650 185 L0 185 Z" fill="url(#revenueArea)" /><path d="M0 150 C45 144 55 110 98 121 S154 87 195 104 S257 58 293 76 S340 116 383 70 S446 68 480 52 S536 80 574 34 S621 39 650 12" fill="none" stroke="#a9793f" strokeWidth="2.7" vectorEffect="non-scaling-stroke" /><circle cx="574" cy="34" r="4.5" fill="#a9793f" stroke="#fff" strokeWidth="2" /></svg><div className="chart-x-labels"><span>16 OCT</span><span>17 OCT</span><span>18 OCT</span><span>19 OCT</span><span>20 OCT</span><span>21 OCT</span><span>22 OCT</span></div></div><div className="chart-footnote"><span><i /> Revenue / illustrative prototype chart</span><span>Live analytics connect after backend integration</span></div></section><section className="admin-card admin-quick-actions"><div className="admin-card-heading"><div><span className="eyebrow">KEEP THINGS MOVING</span><h2>Quick actions</h2></div><Sparkles size={18} /></div>{[{ id: 'content', title: 'Update homepage', desc: 'Hero slides, offer strip & links', icon: <Sparkles size={18} /> }, { id: 'products', title: 'Add a product', desc: 'Create a new piece or update stock', icon: <Shirt size={18} /> }, { id: 'collections', title: 'Manage categories', desc: 'Edit names, images and visibility', icon: <Filter size={18} /> }, { id: 'leads', title: 'Review enquiries', desc: `${leads.filter(lead => lead.status === 'New').length} new bulk / custom requests`, icon: <Mail size={18} /> }].map(action => <button key={action.id} className="admin-quick-action" onClick={() => setTab(action.id)}><span className="quick-action-icon">{action.icon}</span><span><strong>{action.title}</strong><small>{action.desc}</small></span><ArrowUpRight size={16} /></button>)}</section><section className="admin-card admin-orders-card"><div className="admin-card-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Latest orders</h2></div><button className="admin-quiet-btn" onClick={() => setTab('orders')}>VIEW ALL <ArrowRight size={13} /></button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>{orders.slice(0, 4).map(order => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.date}</small></td><td>{order.customer}</td><td>{money(order.amount)}</td><td><span className={`status-pill status-${slugify(order.status)}`}>{order.status}</span></td></tr>)}</tbody></table></div></section><section className="admin-card admin-insight-card"><span className="insight-icon"><Zap size={20} /></span><span className="eyebrow">A QUICK OBSERVATION</span><h2>Your edit is taking shape.</h2><p>{products.filter(p => p.newArrival).length} new arrivals are live in the storefront. Keep product imagery and fit information consistent before adding more products.</p><button className="admin-text-button" onClick={() => setTab('products')}>REVIEW MERCHANDISING <ArrowRight size={14} /></button><div className="insight-background-mark">1218</div></section></div><div className="admin-footnote"><LockKeyhole size={13} /> Sample order and revenue figures are illustrative demo data, not live transactions.</div></div>;
}

function AdminProducts({ notify }: { notify: (message: string) => void }) {
  const { products, setProducts } = useStore();
  const [selectedId, setSelectedId] = useState(products[0]?.id || '');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Partial<Product>>({});
  const selected = products.find(product => product.id === selectedId);
  useEffect(() => { if (selected && !showForm) setDraft({ ...selected }); }, [selectedId, products, showForm]);
  const filtered = products.filter(product => `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(query.toLowerCase()));
  const startNew = () => { setShowForm(true); setSelectedId(''); setDraft({ id: `p-${Date.now()}`, slug: '', name: '', category: 'T-Shirt', price: 999, compareAt: 1299, color: 'Black', colorHex: '#242424', sizes: ['S', 'M', 'L', 'XL'], rating: 0, reviewCount: 0, images: ['/images/products/black-tee-front.webp'], fit: 'Regular fit', material: '100% Cotton', description: '', stock: 20, bestSeller: false, newArrival: true, luxe: false }); };
  const save = (event: FormEvent) => { event.preventDefault(); const product = { ...draft, id: draft.id || `p-${Date.now()}`, slug: (draft.slug || slugify(draft.name || 'new-product')).trim(), sizes: (draft.sizes || ['S', 'M', 'L', 'XL']), images: (draft.images || []) } as Product; if (!product.name.trim()) { notify('Add a product name first.'); return; } setProducts(current => current.some(item => item.id === product.id) ? current.map(item => item.id === product.id ? product : item) : [product, ...current]); setSelectedId(product.id); setShowForm(false); notify('Product saved — storefront updated.'); };
  const remove = () => { if (!selected) return; if (!window.confirm(`Remove “${selected.name}” from the prototype catalogue?`)) return; setProducts(current => current.filter(item => item.id !== selected.id)); setSelectedId(''); notify('Product removed from the catalogue.'); };
  const patch = (key: keyof Product, value: unknown) => setDraft(current => ({ ...current, [key]: value } as Partial<Product>));
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">MERCHANDISE / CATALOGUE</span><h1>Products <span className="admin-count-chip">{products.length}</span></h1><p>Manage product details, imagery, pricing, availability and merchandising flags.</p></div><button className="admin-primary-btn" onClick={startNew}><Plus size={16} /> Add product</button></div><div className="admin-products-layout"><section className="admin-card admin-product-list-card"><div className="admin-list-toolbar"><div className="admin-input-icon"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search catalogue" aria-label="Search catalogue" /></div><span>{filtered.length} products</span></div><div className="admin-product-list">{filtered.map(product => <button key={product.id} className={`admin-product-list-row ${selectedId === product.id && !showForm ? 'active' : ''}`} onClick={() => { setShowForm(false); setSelectedId(product.id); }}><SmartImage src={product.images[0]} alt={product.name} /><span><strong>{product.name}</strong><small>{product.category} · {product.color}</small><em>{money(product.price)}</em></span><span className={`stock-indicator ${product.stock < 12 ? 'stock-low' : ''}`}>{product.stock} in stock</span></button>)}</div></section><section className="admin-card admin-product-editor"><div className="admin-card-heading"><div><span className="eyebrow">{showForm ? 'NEW PRODUCT' : 'PRODUCT EDITOR'}</span><h2>{showForm ? 'Create a piece' : selected?.name || 'Select a product'}</h2></div>{!showForm && selected && <button className="admin-danger-quiet" onClick={remove}>DELETE</button>}</div>{(selected || showForm) ? <form onSubmit={save} className="admin-edit-form"><label>Product name<input required value={String(draft.name || '')} onChange={e => patch('name', e.target.value)} placeholder="Product name" /></label><div className="admin-form-two"><label>URL slug<input value={String(draft.slug || '')} onChange={e => patch('slug', e.target.value)} placeholder="product-slug" /></label><label>Category<select value={String(draft.category || 'T-Shirt')} onChange={e => patch('category', e.target.value)}>{['T-Shirt', 'Drop Shoulder', 'Sweatshirt', 'Hoodie', 'Polo', 'Regular Fit', 'Track Pant', 'Joggers'].map(cat => <option key={cat}>{cat}</option>)}</select></label></div><div className="admin-form-three"><label>Price (₹)<input type="number" min="0" value={Number(draft.price || 0)} onChange={e => patch('price', Number(e.target.value))} /></label><label>Compare-at (₹)<input type="number" min="0" value={Number(draft.compareAt || 0)} onChange={e => patch('compareAt', Number(e.target.value))} /></label><label>Stock<input type="number" min="0" value={Number(draft.stock || 0)} onChange={e => patch('stock', Number(e.target.value))} /></label></div><div className="admin-form-two"><label>Colour name<input value={String(draft.color || '')} onChange={e => patch('color', e.target.value)} /></label><label>Colour swatch<input type="color" value={String(draft.colorHex || '#222222')} onChange={e => patch('colorHex', e.target.value)} /></label></div><label>Primary image URL<input value={(draft.images || [''])[0]} onChange={e => patch('images', [e.target.value, ...(draft.images || []).slice(1)])} placeholder="https://…" /></label><div className="admin-image-preview"><SmartImage src={(draft.images || [''])[0]} alt={String(draft.name || 'Product image preview')} /><span>Primary image preview <small>Use a portrait editorial image; CDN URL for prototype.</small></span></div><label>Description<textarea rows={4} value={String(draft.description || '')} onChange={e => patch('description', e.target.value)} placeholder="Product description" /></label><div className="admin-form-two"><label>Fit<input value={String(draft.fit || '')} onChange={e => patch('fit', e.target.value)} /></label><label>Material<input value={String(draft.material || '')} onChange={e => patch('material', e.target.value)} /></label></div><fieldset className="admin-feature-flags"><legend>Merchandising</legend>{[{ key: 'bestSeller', label: 'Best seller' }, { key: 'newArrival', label: 'New arrival' }, { key: 'luxe', label: 'Luxe collection' }].map(item => <label key={item.key}><input type="checkbox" checked={Boolean(draft[item.key as keyof Product])} onChange={e => patch(item.key as keyof Product, e.target.checked)} />{item.label}</label>)}</fieldset><button className="admin-primary-btn admin-save-btn" type="submit"><Check size={16} /> Save product & publish</button><p className="admin-field-note"><ShieldCheck size={13} /> Changes are saved to this browser and reflected in the storefront immediately.</p></form> : <div className="admin-editor-empty"><Shirt size={27} /><h3>Choose a product to edit</h3><p>Select a product from the catalogue, or create a new one to start merchandising.</p><button className="admin-primary-btn" onClick={startNew}><Plus size={15} /> Create product</button></div>}</section></div></div>;
}

function AdminContent({ notify }: { notify: (message: string) => void }) {
  const { heroSlides, setHeroSlides, settings, setSettings } = useStore();
  const [promoDraft, setPromoDraft] = useState(settings.promoText);
  const [savedSlide, setSavedSlide] = useState('');
  const updateSlide = (id: string, key: keyof HeroSlide, value: string | boolean) => setHeroSlides(current => current.map(slide => slide.id === id ? ({ ...slide, [key]: value } as HeroSlide) : slide));
  const savePromo = () => { setSettings(current => ({ ...current, promoText: promoDraft })); notify('Announcement strip updated on the storefront.'); };
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">STOREFRONT / MERCHANDISING</span><h1>Homepage & banners</h1><p>Shape the first impression. Edit campaign copy, imagery, destinations and the moving announcement strip.</p></div><RouteLink href="/" className="admin-secondary-btn" target="_blank"><ArrowUpRight size={15} /> Preview storefront</RouteLink></div><section className="admin-card announcement-editor-card"><div className="admin-card-heading"><div><span className="eyebrow">GLOBAL ANNOUNCEMENT</span><h2>Moving offer strip</h2><p>The message that travels across the top of each storefront page.</p></div><label className="admin-toggle"><input type="checkbox" checked={settings.announcementEnabled} onChange={e => setSettings(current => ({ ...current, announcementEnabled: e.target.checked }))} /><span /><em>{settings.announcementEnabled ? 'LIVE' : 'HIDDEN'}</em></label></div><label className="admin-full-label">ANNOUNCEMENT COPY<textarea rows={2} value={promoDraft} onChange={e => setPromoDraft(e.target.value)} placeholder="Free shipping..." /></label><div className="announcement-live-preview"><span className="eyebrow">LIVE PREVIEW</span><div>{promoDraft || 'Your offer will appear here'} <ArrowRight size={14} /></div></div><button className="admin-primary-btn" onClick={savePromo}><Check size={15} /> Save announcement</button></section><div className="admin-content-section-head"><div><span className="eyebrow">HOME / CAMPAIGN CAROUSEL</span><h2>Hero slides <span>{heroSlides.filter(slide => slide.active).length} live</span></h2><p>Slides move gently every 5.4 seconds. The full image links to Shop All; use wide campaign art for desktop and portrait crops for mobile.</p></div></div><div className="hero-editor-grid">{heroSlides.map((slide, index) => <section className="admin-card hero-editor-card" key={slide.id}><div className="hero-editor-preview"><SmartImage src={slide.desktopImage} alt={slide.title} /><span className="slide-number">0{index + 1}</span><label className="admin-toggle"><input type="checkbox" checked={slide.active} onChange={e => updateSlide(slide.id, 'active', e.target.checked)} /><span /><em>{slide.active ? 'LIVE' : 'HIDDEN'}</em></label></div><div className="hero-editor-fields"><p className="hero-clickthrough-note">Whole image links to <strong>Shop All</strong>. No overlay button is shown.</p><label>Headline <small>Use a line break to control visual rhythm.</small><textarea rows={2} value={slide.title} onChange={e => updateSlide(slide.id, 'title', e.target.value)} /></label><label>Supporting copy<input value={slide.body} onChange={e => updateSlide(slide.id, 'body', e.target.value)} /></label><label>Desktop image URL<input value={slide.desktopImage} onChange={e => updateSlide(slide.id, 'desktopImage', e.target.value)} /></label><label>Mobile image URL<input value={slide.mobileImage} onChange={e => updateSlide(slide.id, 'mobileImage', e.target.value)} /></label><button className="admin-primary-btn" onClick={() => { setSavedSlide(slide.id); notify(`Campaign ${index + 1} saved — homepage updated.`); }}><Check size={15} /> Save slide {savedSlide === slide.id ? '✓' : ''}</button></div></section>)}</div><div className="admin-callout"><Sparkles size={18} /><p><strong>Creative tip:</strong> Use portrait imagery for mobile and a wide campaign image for desktop. Keep text in the content layer, not baked into the image, for accessibility and responsive control.</p></div></div>;
}

function AdminCollections({ notify }: { notify: (message: string) => void }) {
  const { categories, setCategories, products, setProducts } = useStore();
  const [draft, setDraft] = useState<Category | null>(null);
  const save = (event: FormEvent) => { event.preventDefault(); if (!draft) return; const category = { ...draft, slug: slugify(draft.name) }; setCategories(current => current.map(item => item.id === category.id ? category : item)); setDraft(null); notify('Category saved — storefront updated.'); };
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">MERCHANDISING / NAVIGATION</span><h1>Categories & edits</h1><p>Manage the category tiles and curated collections displayed to shoppers.</p></div><button className="admin-secondary-btn" onClick={() => setProducts(current => current.map(product => product.luxe ? { ...product, luxe: false } : product))}>CLEAR LUXE FLAGS</button></div><div className="admin-category-manager"><section className="admin-card admin-category-list"><div className="admin-card-heading"><div><span className="eyebrow">SHOP BY CATEGORY</span><h2>Category tiles</h2></div><span className="admin-count-chip">{categories.length}</span></div><div className="admin-category-rows">{categories.map((category, index) => <div className="admin-category-row" key={category.id}><SmartImage src={category.image} alt={category.name} /><div><strong>{category.name}</strong><small>/collections/{category.slug}</small></div><label className="admin-toggle"><input type="checkbox" checked={category.active} onChange={e => setCategories(current => current.map(item => item.id === category.id ? { ...item, active: e.target.checked } : item))} /><span /><em>{category.active ? 'LIVE' : 'HIDDEN'}</em></label><button className="admin-icon-btn" onClick={() => setDraft({ ...category })} aria-label={`Edit ${category.name}`}><ArrowUpRight size={16} /></button></div>)}</div></section><section className="admin-card admin-edit-category"><div className="admin-card-heading"><div><span className="eyebrow">CATEGORY EDITOR</span><h2>{draft ? `Edit ${draft.name}` : 'Select a tile'}</h2></div>{draft && <button className="admin-icon-btn" onClick={() => setDraft(null)} aria-label="Cancel edit"><X size={17} /></button>}</div>{draft ? <form className="admin-edit-form" onSubmit={save}><label>Category name<input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required /></label><label>Category image URL<input value={draft.image} onChange={e => setDraft({ ...draft, image: e.target.value })} required /></label><div className="admin-category-preview"><SmartImage src={draft.image} alt={draft.name} /><span>Tile preview / portrait crop</span></div><label className="admin-checkbox-line"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Visible in storefront</label><button className="admin-primary-btn" type="submit"><Check size={15} /> Save category</button></form> : <div className="admin-editor-empty"><Filter size={28} /><h3>Choose a category</h3><p>Change the tile name, image or storefront visibility. The destination route is generated from the category name.</p></div>}</section></div><section className="admin-card collection-flags-card"><div className="admin-card-heading"><div><span className="eyebrow">CURATED EDITS</span><h2>Collection status</h2><p>Products enter these collections when their merchandising flags are enabled in the Product editor.</p></div></div><div className="collection-status-grid">{[{ title: 'Best sellers', key: 'bestSeller' as const }, { title: 'New arrivals', key: 'newArrival' as const }, { title: 'One 2 1 Eight Luxe', key: 'luxe' as const }].map(item => <div key={item.key}><strong>{item.title}</strong><b>{products.filter(p => p[item.key]).length.toString().padStart(2, '0')}</b><span>active pieces</span><small>{item.key === 'luxe' ? 'Premium capsule' : item.key === 'newArrival' ? 'Latest drops' : 'Top rotation'}</small></div>)}</div></section></div>;
}

function AdminOrders({ notify }: { notify: (message: string) => void }) {
  const { orders, setOrders } = useStore();
  const [search, setSearch] = useState('');
  const filtered = orders.filter(order => `${order.id} ${order.customer} ${order.status}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">SELLING / FULFILMENT</span><h1>Orders <span className="admin-count-chip">{orders.length}</span></h1><p>Review demo orders and update their status. Real fulfilment is not connected.</p></div><div className="admin-page-actions"><button className="admin-secondary-btn" onClick={() => notify('CSV export is a production integration item for this prototype.')}><ArrowDownRight size={15} /> Export</button></div></div><section className="admin-card admin-orders-full"><div className="admin-list-toolbar"><div className="admin-input-icon"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID or customer" /></div><span>{filtered.length} orders</span></div><div className="admin-table-wrap"><table className="admin-table admin-table-spacious"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th><th>UPDATE</th></tr></thead><tbody>{filtered.map(order => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td>{order.date}</td><td>{order.items}</td><td><strong>{money(order.amount)}</strong></td><td><span className={`status-pill status-${slugify(order.status)}`}>{order.status}</span></td><td><select value={order.status} onChange={e => { setOrders(current => current.map(item => item.id === order.id ? { ...item, status: e.target.value } : item)); notify(`Order ${order.id} status updated.`); }} aria-label={`Update status for ${order.id}`}><option>Processing</option><option>Packed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></td></tr>)}</tbody></table></div>{!filtered.length && <div className="admin-table-empty">No orders match your search.</div>}</section><div className="admin-callout"><PackageCheck size={18} /><p><strong>Order lifecycle:</strong> this prototype stores order records in browser state. Connect payment verification, inventory reservation, shipping provider webhooks and transactional messages before accepting real orders.</p></div></div>;
}

function AdminReviews({ notify }: { notify: (message: string) => void }) {
  const { reviews, setReviews } = useStore();
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">CUSTOMER VOICE / TRUST</span><h1>Reviews <span className="admin-count-chip">{reviews.length}</span></h1><p>Moderate what customers see. Published review examples are prototype content.</p></div><button className="admin-secondary-btn" onClick={() => notify('Review request automation is a production integration item.')}><Mail size={15} /> Request reviews</button></div><section className="admin-card admin-reviews-card"><div className="admin-card-heading"><div><span className="eyebrow">MODERATION QUEUE</span><h2>Customer feedback</h2></div><div className="review-admin-stats"><span>{reviews.filter(r => r.status === 'Published').length} published</span><span>{reviews.filter(r => r.status === 'Pending').length} pending</span></div></div><div className="admin-review-list">{reviews.map(review => <article key={review.id} className="admin-review-row"><div className="admin-review-avatar">{review.customer.charAt(0)}</div><div className="admin-review-copy"><div><strong>{review.customer}</strong><span>{review.date}</span></div><span className="admin-review-product">{review.product}</span><span className="admin-review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span><p>{review.text}</p></div><div className="admin-review-actions"><span className={`status-pill status-${slugify(review.status)}`}>{review.status}</span><select aria-label={`Moderate review by ${review.customer}`} value={review.status} onChange={e => { setReviews(current => current.map(item => item.id === review.id ? { ...item, status: e.target.value } : item)); notify(`Review status updated to ${e.target.value}.`); }}><option>Pending</option><option>Published</option><option>Hidden</option></select></div></article>)}</div></section><div className="admin-callout"><Star size={18} /><p><strong>Trust note:</strong> use verified-purchase labels only when backed by order data. Replace all sample reviews with real, consented customer feedback before launch.</p></div></div>;
}

function AdminLeads({ notify }: { notify: (message: string) => void }) {
  const { leads, setLeads } = useStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(leads[0]?.id || null);
  const filtered = leads.filter(lead => `${lead.name} ${lead.email} ${lead.phone} ${lead.type}`.toLowerCase().includes(query.toLowerCase()));
  const active = leads.find(lead => lead.id === selected);
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">CLIENT RELATIONS / B2B</span><h1>Bulk enquiries <span className="admin-count-chip">{leads.length}</span></h1><p>Every bulk, custom merchandise and corporate project enquiry submitted from the storefront.</p></div><button className="admin-secondary-btn" onClick={() => notify('Export leads as CSV when the production database is connected.')}><ArrowDownRight size={15} /> Export leads</button></div><div className="admin-leads-layout"><section className="admin-card admin-lead-list-card"><div className="admin-list-toolbar"><div className="admin-input-icon"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search enquiries" /></div><span>{filtered.length} requests</span></div>{filtered.length ? filtered.map(lead => <button className={`admin-lead-list-row ${selected === lead.id ? 'active' : ''}`} key={lead.id} onClick={() => setSelected(lead.id)}><span className="admin-lead-avatar">{lead.name.charAt(0)}</span><span><strong>{lead.name}</strong><small>{lead.type} · {lead.createdAt}</small><em>{lead.quantity}</em></span><span className={`status-pill status-${slugify(lead.status)}`}>{lead.status}</span></button>) : <div className="admin-table-empty">No enquiries yet. The next storefront form submission will show up here.</div>}</section><section className="admin-card admin-lead-detail"><div className="admin-card-heading"><div><span className="eyebrow">ENQUIRY DETAILS</span><h2>{active?.name || 'No enquiry selected'}</h2></div>{active && <span className={`status-pill status-${slugify(active.status)}`}>{active.status}</span>}</div>{active ? <><div className="lead-detail-grid"><div><span>CONTACT</span><strong>{active.email}</strong><strong>{active.phone}</strong></div><div><span>PROJECT TYPE</span><strong>{active.type}</strong><strong>{active.quantity}</strong></div><div><span>RECEIVED</span><strong>{active.createdAt}</strong><strong>{active.id}</strong></div></div><div className="lead-message"><span className="eyebrow">PROJECT NOTES</span><p>{active.message || 'No additional details were shared.'}</p></div><div className="lead-actions"><label>Status<select value={active.status} onChange={e => { setLeads(current => current.map(lead => lead.id === active.id ? { ...lead, status: e.target.value } : lead)); notify(`Enquiry marked ${e.target.value.toLowerCase()}.`); }}><option>New</option><option>Contacted</option><option>Qualified</option><option>Closed</option></select></label><a className="admin-primary-btn" href={`mailto:${active.email}?subject=${encodeURIComponent(`Re: ${active.type} enquiry — ONE 2 1 EIGHT`)}`}><Mail size={15} /> Reply by email</a></div></> : <div className="admin-editor-empty"><Mail size={26} /><h3>Your next good project starts here.</h3><p>Enquiries submitted through the home page appear here automatically in this browser.</p></div>}</section></div></div>;
}

function AdminSettings({ notify }: { notify: (message: string) => void }) {
  const { settings, setSettings } = useStore();
  const [draft, setDraft] = useState({ ...settings });
  useEffect(() => setDraft({ ...settings }), [settings]);
  const save = (event: FormEvent) => { event.preventDefault(); setSettings(draft); notify('Store settings saved.'); };
  return <div className="admin-tab-content"><div className="admin-page-heading"><div><span className="eyebrow">CONFIGURATION / SEARCH VISIBILITY</span><h1>Store & SEO</h1><p>Update brand details, service policy and search metadata. Production domain and legal copy still need to be approved.</p></div><span className="admin-save-state"><CheckCircle2 size={15} /> Browser-saved changes</span></div><form className="admin-settings-layout" onSubmit={save}><section className="admin-card admin-settings-card"><div className="admin-card-heading"><div><span className="eyebrow">BRAND SYSTEM</span><h2>Store identity</h2><p>Used in page titles, footer details and the service messaging.</p></div><span className="settings-section-icon"><Sparkles size={18} /></span></div><label>Brand name<input value={draft.brandName} onChange={e => setDraft({ ...draft, brandName: e.target.value })} required /></label><label>Brand line<input value={draft.brandLine} onChange={e => setDraft({ ...draft, brandLine: e.target.value })} /></label><label>Customer care email<input type="email" value={draft.contactEmail} onChange={e => setDraft({ ...draft, contactEmail: e.target.value })} /></label><label>Customer care phone<input value={draft.contactPhone} onChange={e => setDraft({ ...draft, contactPhone: e.target.value })} /></label><label>Free shipping threshold (₹)<input type="number" min="0" value={draft.freeShippingThreshold} onChange={e => setDraft({ ...draft, freeShippingThreshold: Number(e.target.value) })} /></label><label>Returns policy<textarea rows={4} value={draft.returnPolicy} onChange={e => setDraft({ ...draft, returnPolicy: e.target.value })} /></label></section><section className="admin-card admin-settings-card"><div className="admin-card-heading"><div><span className="eyebrow">SEO / GEO / AI DISCOVERY</span><h2>Search metadata</h2><p>Readable, specific metadata helps search engines and answer systems understand your offer.</p></div><span className="settings-section-icon"><Search size={18} /></span></div><label>Site title<input value={draft.seoTitle} onChange={e => setDraft({ ...draft, seoTitle: e.target.value })} /><small>Use the brand plus a clear product/category description.</small></label><label>Meta description<textarea rows={4} maxLength={320} value={draft.seoDescription} onChange={e => setDraft({ ...draft, seoDescription: e.target.value })} /><small>{draft.seoDescription.length}/320 characters</small></label><div className="seo-preview"><span className="eyebrow">SEARCH PREVIEW</span><strong>{draft.seoTitle}</strong><span>https://your-approved-domain.com/</span><p>{draft.seoDescription}</p></div><div className="seo-checklist"><h3>Prototype checklist</h3>{['Organization and WebSite structured data included', 'Product detail pages have descriptive metadata', 'Robots.txt and sitemap routes included', 'Admin path excluded from indexing', 'Replace placeholder domain and verify Search Console'].map(item => <span key={item}><CheckCircle2 size={15} />{item}</span>)}</div></section><div className="admin-settings-bottom"><p><ShieldCheck size={14} /> Changes are saved in this browser and reflect across the storefront prototype.</p><button className="admin-primary-btn" type="submit"><Check size={15} /> Save store settings</button></div></form></div>;
}

function AdminApp({ notify }: { notify: (message: string) => void }) {
  const { adminAuthed, setAdminAuthed } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const titleMap: Record<string, string> = { overview: 'Dashboard', products: 'Products', collections: 'Categories & edits', orders: 'Orders', content: 'Homepage & banners', reviews: 'Reviews', leads: 'Bulk enquiries', settings: 'Store & SEO' };
  const logout = () => { setAdminAuthed(false); notify('You have signed out of the demo CMS.'); };
  if (!adminAuthed) return <AdminLogin notify={notify} />;
  return <main className="admin-app"><div className={`admin-sidebar-wrap ${mobileSidebar ? 'is-open' : ''}`}><AdminSidebar activeTab={activeTab} setActiveTab={tab => { setActiveTab(tab); setMobileSidebar(false); }} onLogout={logout} /></div>{mobileSidebar && <button className="admin-mobile-backdrop" aria-label="Close admin menu" onClick={() => setMobileSidebar(false)} />}<section className="admin-main"><header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => setMobileSidebar(!mobileSidebar)} aria-label="Open admin menu"><Menu size={20} /></button><div className="admin-topbar-breadcrumb"><span>WORKSPACE</span><ChevronRight size={13} /><strong>{titleMap[activeTab]}</strong></div><div className="admin-topbar-right"><span className="admin-live-dot" /> <span>Storefront status: <strong>Prototype</strong></span><RouteLink href="/" target="_blank" className="admin-view-store"><ArrowUpRight size={15} /> View store</RouteLink><span className="admin-topbar-avatar">A</span></div></header>{activeTab === 'overview' && <AdminOverview setTab={setActiveTab} />} {activeTab === 'products' && <AdminProducts notify={notify} />} {activeTab === 'content' && <AdminContent notify={notify} />} {activeTab === 'collections' && <AdminCollections notify={notify} />} {activeTab === 'orders' && <AdminOrders notify={notify} />} {activeTab === 'reviews' && <AdminReviews notify={notify} />} {activeTab === 'leads' && <AdminLeads notify={notify} />} {activeTab === 'settings' && <AdminSettings notify={notify} />}<footer className="admin-app-footer"><span>ONE 2 1 EIGHT / COMMERCE STUDIO</span><span>CLIENT PREVIEW BUILD · 1.0.0</span><span>© 2026</span></footer></section></main>;
}

export default function StoreApp({ initialPath = '/' }: { initialPath?: string }) {
  const pathName = usePathname() || initialPath;
  const path = pathName === '' ? '/' : pathName;
  const isAdminPath = path.startsWith('/admin');
  const router = useRouter();
  const { toast, notify } = useToast();
  const store = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isAdminPath) {
      setSplashVisible(false);
      return;
    }
    const splashTimer = window.setTimeout(() => setSplashVisible(false), 450);
    return () => window.clearTimeout(splashTimer);
  }, [isAdminPath]);
  const transition = useCallback(() => {
    setTransitioning(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => setTransitioning(false), 230);
  }, []);
  const lastPath = useRef(path);
  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false);
    if (lastPath.current !== path) {
      setTransitioning(true);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      transitionTimer.current = setTimeout(() => setTransitioning(false), 230);
    }
    lastPath.current = path;
  }, [path]);
  useEffect(() => () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); }, []);
  useEffect(() => {
    if (splashVisible) return;
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isLuxePage = path === '/collections/one-2-1-eight-luxe';
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      '.home-main > section:not(.hero-section), .collection-masthead, .collection-toolbar, .collection-products .product-card, .collection-endnote, .product-layout, .reviews-section, .related-products-section, .bag-page > *, .wishlist-page > *, .search-page > *'
    ));
    if (!targets.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -46px 0px' });
    targets.forEach((element, index) => {
      element.classList.add('scroll-reveal-pending');
      if (element.classList.contains('product-card')) element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * (isLuxePage ? 115 : 65)}ms`);
      observer.observe(element);
    });
    return () => { observer.disconnect(); targets.forEach(element => { element.classList.remove('scroll-reveal-pending', 'scroll-reveal-visible'); element.style.removeProperty('--reveal-delay'); }); };
  }, [path, store.products.length, store.categories.length, splashVisible]);
  const toggleWishlist = useCallback((id: string) => {
    const alreadySaved = store.wishlist.includes(id);
    store.toggleWishlist(id);
    const product = store.products.find(item => item.id === id);
    notify(alreadySaved ? 'Removed from your wishlist.' : `${product?.name || 'Piece'} saved for later.`);
  }, [store, notify]);

  if (isAdminPath) return <><AdminApp notify={notify} /><Toast message={toast} /></>;
  const bagCount = store.cartCount;
  const wishlistCount = store.wishlist.length;
  const body = path === '/' ? <HomePage onTransition={transition} onToggleWishlist={toggleWishlist} wishlist={store.wishlist} notify={notify} /> :
    path.startsWith('/collections/') ? <CollectionPage slug={path.split('/').filter(Boolean)[1] || 'all'} onTransition={transition} onToggleWishlist={toggleWishlist} wishlist={store.wishlist} /> :
      path.startsWith('/products/') ? <ProductDetailPage slug={path.split('/').filter(Boolean)[1] || ''} onTransition={transition} onToggleWishlist={toggleWishlist} wishlist={store.wishlist} notify={notify} /> :
        path === '/bag' ? <BagPage onTransition={transition} notify={notify} /> :
          path === '/wishlist' ? <WishlistPage onTransition={transition} onToggleWishlist={toggleWishlist} wishlist={store.wishlist} /> :
            path === '/search' ? <SearchPage onTransition={transition} onToggleWishlist={toggleWishlist} wishlist={store.wishlist} /> :
              path === '/login' ? <LoginPage onTransition={transition} notify={notify} /> :
                path === '/checkout' ? <CheckoutPage onTransition={transition} notify={notify} /> :
                  path === '/order-confirmation' ? <OrderConfirmation onTransition={transition} /> :
                    path === '/policies/returns' ? <ReturnsPolicyPage onTransition={transition} /> :
                      path === '/size-guide' ? <SizeGuidePage onTransition={transition} /> :
                        <main className="not-found-page"><span className="eyebrow">404 / OFF THE MAP</span><h1>This page took<br /><em>a different route.</em></h1><RouteLink href="/" className="button button-dark" onClick={transition}>BACK TO THE STORE <ArrowRight size={16} /></RouteLink></main>;
  return <div className="storefront-app"><StoreHeader onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} onTransition={transition} cartCount={bagCount} wishlistCount={wishlistCount} settings={store.settings} /><div key={path} className={`route-screen ${path === '/collections/one-2-1-eight-luxe' ? 'route-screen-luxe' : ''}`}>{body}</div><MobileBottomNav onTransition={transition} cartCount={bagCount} wishlistCount={wishlistCount} /><SideMenu open={menuOpen} close={() => setMenuOpen(false)} categories={store.categories} onTransition={transition} /><SearchOverlay open={searchOpen} close={() => setSearchOpen(false)} onTransition={transition} />{transitioning && <MovingLoader />}{splashVisible && <MovingLoader initial />}<Toast message={toast} /></div>;
}
