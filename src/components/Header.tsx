'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Menu, Search, Heart, X, ChevronDown, ChevronRight, ChevronLeft, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

import {
  DropdownMenu as MobileDropdown,
  DropdownMenuContent as MobileDropdownContent,
  DropdownMenuItem as MobileDropdownItem,
  DropdownMenuTrigger as MobileDropdownTrigger,
} from '@/components/ui/dropdown-menu';
import SearchSidebar from './SearchSidebar';
import { useCategories, useCategoryTree } from '@/hooks/useCategories';
import Image from 'next/image';
import logo from '@/assets/logo.png';


interface HeaderProps {
  isAdminRoute?: boolean;
}

const FIVE_MAIN_CATEGORIES = [
  { name: 'Sweets', slug: 'sweets' },
  { name: 'Namkeen', slug: 'namkeen' },
  { name: 'Dry Fruits', slug: 'dry-fruits' },
  { name: 'Gifting', slug: 'gifting' },
  { name: 'Festive', slug: 'festive' },
];

interface DeliveryCategoryDropdownProps {
  label: string;
  mode: 'lucknow' | 'pan-india';
  categories: { name: string; slug: string }[];
  onSelectCategory: (slug: string, mode: 'lucknow' | 'pan-india') => void;
  onViewAll: (mode: 'lucknow' | 'pan-india') => void;
}

const DeliveryCategoryDropdown: React.FC<DeliveryCategoryDropdownProps> = ({
  label,
  mode,
  categories,
  onSelectCategory,
  onViewAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative group py-2"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => onViewAll(mode)}
        className="flex items-center gap-1 text-[11px] xl:text-xs font-orange-avenue font-normal tracking-[0.14em] uppercase text-[#2C1810] group-hover:text-[#B38B46] transition-colors outline-none cursor-pointer whitespace-nowrap"
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#B38B46] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <span className="absolute bottom-1 left-0 w-0 h-[1.5px] bg-[#B38B46] transition-all duration-300 ease-out group-hover:w-full" />

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 pt-2 w-52 z-50 pointer-events-auto"
          >
            <div className="bg-[#FFFDF7] border border-[#D4B6A2]/40 shadow-[0_10px_30px_rgba(44,24,16,0.12)] rounded-md py-2 overflow-hidden">
              <div className="px-4 py-1.5 border-b border-[#D4B6A2]/20 mb-1">
                <span className="text-[9px] font-orange-avenue uppercase tracking-[0.2em] text-[#B38B46] block">
                  {mode === 'lucknow' ? 'Same-Day in Lucknow' : 'Pan-India Delivery'}
                </span>
              </div>

              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    onSelectCategory(cat.slug, mode);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[11.5px] font-orange-avenue uppercase tracking-wider text-[#2C1810] hover:text-[#8B2131] hover:bg-[#FAF6F0] transition-colors flex items-center justify-between group/item cursor-pointer"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-3 h-3 text-[#B38B46] opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                </button>
              ))}

              <div className="border-t border-[#D4B6A2]/20 mt-1 pt-1">
                <button
                  onClick={() => {
                    onViewAll(mode);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-[10.5px] font-orange-avenue uppercase tracking-widest text-[#B38B46] hover:text-[#8B2131] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                >
                  View All Products →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ isAdminRoute = false }) => {
  if (isAdminRoute) return null;

  const router = useRouter();
  const { cartItems, toggleCart, setDeliveryMode } = useStore();
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Data States — categories & root categories for navigation
  const { categories } = useCategories();
  const { rootCategories } = useCategoryTree();

  const MAIN_CATEGORY_ORDER = ['sweets', 'namkeen', 'dry-fruits', 'gifting', 'festive'];

  const displayMainCategories = React.useMemo(() => {
    const list = rootCategories.length > 0 ? rootCategories : categories;
    const primary = list.filter(c => MAIN_CATEGORY_ORDER.includes(c.slug?.toLowerCase() || ''));
    if (primary.length > 0) {
      return primary.sort((a, b) => {
        const idxA = MAIN_CATEGORY_ORDER.indexOf(a.slug?.toLowerCase() || '');
        const idxB = MAIN_CATEGORY_ORDER.indexOf(b.slug?.toLowerCase() || '');
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
    }
    return list;
  }, [rootCategories, categories]);

  const [collections, setCollections] = useState<any[]>([]);
  const [celebrateCategories, setCelebrateCategories] = useState<any[]>([]);

  // Scroll handling
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], ["auto", "auto"]);

  // Logo scale animation
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    const celebrateCatNames = ["Wedding Special", "Corporate Gifting", "Festive Hampers"];
    setCelebrateCategories(celebrateCatNames.map(name => ({ name, slug: name })));
    const mockCollections = [
      { id: 'c1', name: "New Arrivals", slug: 'new-arrivals' },
      { id: 'c2', name: "Bestsellers", slug: 'bestsellers' },
    ];
    setCollections(mockCollections);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSelectDeliveryCategory = (slug: string, mode: 'lucknow' | 'pan-india') => {
    setDeliveryMode(mode);
    router.push(`/category/${slug}?delivery=${mode}`);
  };

  const handleViewAllDelivery = (mode: 'lucknow' | 'pan-india') => {
    setDeliveryMode(mode);
    router.push(`/products?delivery=${mode}`);
  };

  const MobileMenuItem = ({ label, path, onClick, subItems }: { label: string; path?: string; onClick?: () => void, subItems?: any[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <div className="border-b border-[#D4B6A2]/20 last:border-0 bg-[#FAF9F6] bg-opacity-100">
        <button
          onClick={() => {
            if (subItems && subItems.length > 0) setIsExpanded(!isExpanded);
            else {
              if (path) router.push(path);
              if (onClick) onClick();
              setIsMobileMenuOpen(false);
            }
          }}
          className="flex items-center justify-between w-full py-4 px-6 text-left group"
        >
          <span className={`text-xs font-orange-avenue uppercase tracking-wider transition-colors ${isExpanded ? 'text-[#B38B46]' : 'text-[#2C1810]'}`}>
            {label}
          </span>
          {subItems && subItems.length > 0 ? (
            <ChevronDown className={`w-4 h-4 text-[#D4B6A2] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#D4B6A2] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && subItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#E5D8C6]/15"
            >
              {subItems.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (sub.onClick) {
                      sub.onClick();
                    } else if (sub.path) {
                      router.push(sub.path);
                    } else {
                      router.push(`/category/${sub.slug || sub.name}`);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-10 text-[11.5px] font-orange-avenue tracking-wider uppercase text-[#5C4638] hover:text-[#B38B46] border-b border-[#D4B6A2]/10 last:border-0"
                >
                  {sub.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      <motion.header
        className={`
          z-40 transition-all duration-300 
          sticky top-0
          ${isHome && !isScrolled ? 'bg-[#F9F3EA] border-transparent py-1.5' : ''}
          ${isHome && isScrolled ? 'bg-[#FFFDF7]/95 backdrop-blur-md shadow-sm border-b border-[#D4B6A2]/30 py-1' : ''}
          ${!isHome ? 'bg-[#FFFDF7] border-b border-[#D4B6A2]/30' : ''}
          ${!isHome && isScrolled ? 'shadow-sm py-1' : ''}
          ${!isHome && !isScrolled ? 'py-1.5' : ''}
        `}
        style={{ height: headerHeight }}
      >
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 sm:h-16 relative">

            {/* MOBILE ONLY: Menu Toggle & Logo on Left */}
            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-[#2C1810] hover:text-[#B38B46] transition-colors p-1 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 stroke-[1.5px]" />
              </button>
              <Link href="/" className="block">
                <div className="relative h-9 w-24 sm:h-10 sm:w-28">
                  <Image
                    src={logo}
                    alt="Raj Luxmi"
                    fill
                    priority
                    className="object-contain drop-shadow-xs"
                    sizes="120px"
                  />
                </div>
              </Link>
            </div>

            {/* DESKTOP ONLY: Logo on Top Left */}
            <div className="hidden lg:flex items-center flex-shrink-0">
              <Link href="/" className="block group">
                <motion.div
                  className="relative h-11 sm:h-12 lg:h-13 w-28 sm:w-34 lg:w-40 transition-transform duration-300 group-hover:scale-105"
                  style={{ scale: logoScale }}
                >
                  <Image
                    src={logo}
                    alt="Raj Luxmi"
                    fill
                    priority
                    className="object-contain drop-shadow-xs"
                    sizes="(max-width: 1024px) 140px, 160px"
                  />
                </motion.div>
              </Link>
            </div>

            {/* DESKTOP ONLY: All 4 Categories Center-Aligned */}
            <nav className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-5 xl:gap-8 pointer-events-auto">
              {/* 1. Shop in Lucknow */}
              <DeliveryCategoryDropdown
                label="Shop in Lucknow"
                mode="lucknow"
                categories={FIVE_MAIN_CATEGORIES}
                onSelectCategory={handleSelectDeliveryCategory}
                onViewAll={handleViewAllDelivery}
              />

              {/* 2. Shop Pan India */}
              <DeliveryCategoryDropdown
                label="Shop Pan India"
                mode="pan-india"
                categories={FIVE_MAIN_CATEGORIES}
                onSelectCategory={handleSelectDeliveryCategory}
                onViewAll={handleViewAllDelivery}
              />

              {/* 3. Our Gift Hampers */}
              <Link
                href="/category/gifting"
                className="relative group py-2"
              >
                <span className="text-[11px] xl:text-xs font-orange-avenue font-normal tracking-[0.14em] uppercase text-[#2C1810] group-hover:text-[#B38B46] transition-colors whitespace-nowrap">
                  Our Gift Hampers
                </span>
                <span className="absolute bottom-1 left-0 w-0 h-[1.5px] bg-[#B38B46] transition-all duration-300 ease-out group-hover:w-full" />
              </Link>

              {/* 4. Bulk Orders */}
              <Link
                href="/celebrate-with-rajluxmi"
                className="relative group py-2"
              >
                <span className="text-[11px] xl:text-xs font-orange-avenue font-normal tracking-[0.14em] uppercase text-[#2C1810] group-hover:text-[#B38B46] transition-colors whitespace-nowrap">
                  Bulk Orders
                </span>
                <span className="absolute bottom-1 left-0 w-0 h-[1.5px] bg-[#B38B46] transition-all duration-300 ease-out group-hover:w-full" />
              </Link>
            </nav>

            {/* FAR RIGHT: Action Icons (Search, Heart, User, Cart) */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 justify-end">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsSearchOpen(true)}
                className="text-[#2C1810] hover:text-[#B38B46] transition-colors p-1"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[1.5px]" />
              </motion.button>

              {/* Heart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/profile')}
                className="hidden md:block text-[#2C1810] hover:text-[#B38B46] transition-colors p-1"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.5px]" />
              </motion.button>

              {/* User */}
              {user ? (
                <MobileDropdown>
                  <MobileDropdownTrigger className="outline-none">
                    <motion.div whileHover={{ scale: 1.05 }} className="text-[#2C1810] hover:text-[#B38B46] transition-colors hidden md:block cursor-pointer p-1">
                      <User className="w-5 h-5 stroke-[1.5px]" />
                    </motion.div>
                    <div className="md:hidden text-[#2C1810] p-1">
                      <User className="w-5 h-5 stroke-[1.5px]" onClick={() => router.push('/profile')} />
                    </div>
                  </MobileDropdownTrigger>
                  <MobileDropdownContent align="end" className="hidden md:block w-60 bg-[#FFFDF7] border border-[#D4B6A2]/25 shadow-xl rounded-sm p-2 z-[60]">
                    {isAdmin && (
                      <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#2C1810] cursor-pointer font-orange-avenue text-xs uppercase py-2.5" onClick={() => router.push('/admin')}>
                        Admin Dashboard
                      </MobileDropdownItem>
                    )}
                    <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#2C1810] cursor-pointer font-orange-avenue text-xs uppercase py-2.5" onClick={() => router.push('/profile')}>
                      Profile
                    </MobileDropdownItem>
                    <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#2C1810] cursor-pointer font-orange-avenue text-xs uppercase py-2.5" onClick={signOut}>
                      Sign Out
                    </MobileDropdownItem>
                  </MobileDropdownContent>
                </MobileDropdown>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => router.push('/auth')}
                  className="text-[#2C1810] hover:text-[#B38B46] transition-colors hidden md:block p-1"
                  aria-label="Account"
                >
                  <User className="w-5 h-5 stroke-[1.5px]" />
                </motion.button>
              )}

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={toggleCart}
                className="relative text-[#2C1810] hover:text-[#B38B46] transition-colors p-1"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 stroke-[1.5px]" />
                {mounted && cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8B2131] text-[#FAF9F6] text-[9.5px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs font-orange-avenue font-normal">
                    {cartItemsCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#4A1C1F]/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-[#FFFDF7] z-50 shadow-2xl overflow-y-auto border-r border-[#D4B6A2]/20"
            >
              <div className="p-6 flex items-center justify-between border-b border-[#D4B6A2]/20 bg-[#FFFDF7]">
                <div className="relative h-20 w-32">
                  <Image src={logo} alt="Raj Luxmi" fill className="object-contain" sizes="128px" />
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#5C4638] hover:bg-[#E5D8C6]/20 rounded-full">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="py-2">
                {/* Primary Navigation Links with Delivery Subcategories */}
                <div className="border-b border-[#D4B6A2]/20 pb-2 mb-2">
                  <MobileMenuItem
                    label="Shop in Lucknow"
                    subItems={[
                      ...FIVE_MAIN_CATEGORIES.map((cat) => ({
                        name: cat.name,
                        path: `/category/${cat.slug}?delivery=lucknow`,
                        onClick: () => setDeliveryMode('lucknow'),
                      })),
                      {
                        name: 'All Lucknow Products →',
                        path: '/products?delivery=lucknow',
                        onClick: () => setDeliveryMode('lucknow'),
                      },
                    ]}
                  />

                  <MobileMenuItem
                    label="Shop Pan India"
                    subItems={[
                      ...FIVE_MAIN_CATEGORIES.map((cat) => ({
                        name: cat.name,
                        path: `/category/${cat.slug}?delivery=pan-india`,
                        onClick: () => setDeliveryMode('pan-india'),
                      })),
                      {
                        name: 'All Pan-India Products →',
                        path: '/products?delivery=pan-india',
                        onClick: () => setDeliveryMode('pan-india'),
                      },
                    ]}
                  />

                  <MobileMenuItem
                    label="Our Gift Hampers"
                    path="/category/gifting"
                  />

                  <MobileMenuItem
                    label="Bulk Orders"
                    path="/celebrate-with-rajluxmi"
                  />
                </div>

                {/* Main Categories Mobile Links */}
                <div className="px-6 pt-2 pb-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#B38B46] font-orange-avenue font-medium block">
                    Browse Categories
                  </span>
                </div>
                {displayMainCategories.map((cat) => (
                  <MobileMenuItem
                    key={cat.id}
                    label={cat.name}
                    path={`/category/${cat.slug || cat.id}`}
                  />
                ))}

                {user ? (
                  <div className="mt-8 px-6 pt-6 border-t border-[#D4B6A2]/20">
                    <button onClick={() => { router.push('/profile'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-[#4A1C1F] font-kugile font-normal tracking-widest text-xs uppercase">
                      <User className="w-4 h-4" /> <span>Profile</span>
                    </button>
                    {isAdmin && (
                      <button onClick={() => { router.push('/admin'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-[#B38B46] font-kugile font-normal tracking-widest text-xs uppercase">
                        <User className="w-4 h-4" /> <span>Admin</span>
                      </button>
                    )}
                    <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-[#5C4638] font-kugile font-normal tracking-widest text-xs uppercase">
                      <LogOut className="w-4 h-4" /> <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 mt-4">
                    <button
                      onClick={() => { router.push('/auth'); setIsMobileMenuOpen(false); }}
                      className="w-full bg-[#4A1C1F] text-[#FAF9F6] py-4 rounded-sm uppercase tracking-[0.2em] font-kugile font-normal text-xs hover:bg-[#5C4638] transition-colors shadow-lg"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
