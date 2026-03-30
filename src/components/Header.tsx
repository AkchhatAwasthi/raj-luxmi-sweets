'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, Search, Heart, X, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import Image from 'next/image';
import logo from '@/assets/logo.png';


interface HeaderProps {
  isAdminRoute?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdminRoute = false }) => {
  if (isAdminRoute) return null;

  const router = useRouter();
  const { cartItems, toggleCart } = useStore();
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Data States
  const [categories, setCategories] = useState<any[]>([]);
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
    fetchNavigationData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNavigationData = async () => {
    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (catData) setCategories(catData);

      // Define celebrate categories to be excluded from main sections
      const celebrateCatNames = ["Wedding Special", "Corporate Gifting", "Festive Hampers"];
      setCelebrateCategories(celebrateCatNames.map(name => ({ name, slug: name })));

      // 2. Mock Collections (Adapted for Rajluxmi Sweets)
      const mockCollections = [
        { id: 'c1', name: "New Arrivals", slug: 'new-arrivals' },
        { id: 'c2', name: "Bestsellers", slug: 'bestsellers' },
        // {
        //   id: 'c4',
        //   name: "Gifting",
        //   slug: 'gifting',
        //   subcategories: [
        //     { name: "Wedding Boxes", slug: "wedding-boxes" },
        //     { name: "Corporate", slug: "corporate" },
        //     { name: "Festival Packs", slug: "festival-packs" },
        //     { name: "Custom Hampers", slug: "custom-hampers" }
        //   ]
        // }
      ];
      setCollections(mockCollections);
    } catch (error) {
      console.error("Error fetching nav data:", error);
    }
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Desktop Hover Dropdown Component
  const DesktopNavDropdown = ({ title, items, onSelect }: { title: string, items: any[], onSelect: (slug: string) => void }) => {
    return (
      <div className="relative group px-1 h-full flex items-center cursor-pointer">
        <button className="flex items-center gap-0.5 lg:gap-1 text-[10px] lg:text-xs font-kugile font-normal tracking-[0.15em] uppercase text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors outline-none bg-transparent border-none p-0">
          {title} <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
        </button>

        {/* Dropdown Content - Show on hover */}
        <div className="absolute top-full left-0 pt-4 hidden group-hover:block w-64 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="bg-[#FFFDF7] border border-[#D4B6A2]/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-sm py-2 relative">
            {/* Arrow pointer */}
            <div className="absolute -top-2 left-6 w-4 h-4 bg-[#FFFDF7] border-t border-l border-[#D4B6A2]/30 rotate-45"></div>

            {items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelect(item.slug || item.name)}
                className="px-6 py-3 text-xs font-kugile font-normal tracking-widest uppercase transition-colors cursor-pointer relative z-10 text-[#5C4638] hover:text-[#783838] hover:bg-[#E5D8C6]/20"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
          className="flex items-center justify-between w-full py-5 px-6 text-left group"
        >
          <span className={`text-sm font-kugile font-normal tracking-widest uppercase transition-colors ${isExpanded ? 'text-[#B38B46]' : 'text-[#4A1C1F]'}`}>
            {label}
          </span>
          {subItems && subItems.length > 0 ? (
            <ChevronDown className={`w-5 h-5 text-[#D4B6A2] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#D4B6A2] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && subItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#E5D8C6]/10"
            >
              {subItems.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(`/products?category=${sub.slug || sub.name}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-4 px-10 text-xs font-kugile font-normal tracking-widest uppercase text-[#5C4638] hover:text-[#B38B46] border-b border-[#D4B6A2]/10 last:border-0"
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
          z-40 transition-all duration-500 
          sticky top-0
          ${isHome && !isScrolled ? 'bg-[#F9F3EA] border-transparent py-3' : ''}
          ${isHome && isScrolled ? 'bg-[#FFFDF7]/95 backdrop-blur-md shadow-sm border-b border-[#D4B6A2]/30 py-1' : ''}
          ${!isHome ? 'bg-[#FFFDF7] border-b border-[#D4B6A2]/30' : ''}
          ${!isHome && isScrolled ? 'shadow-lg py-1' : ''}
          ${!isHome && !isScrolled ? 'py-3' : ''}
        `}
        style={{ height: headerHeight }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20 lg:h-24 relative">

            {/* LEFT: Logo */}
            <div className="flex-shrink-0 relative z-10 group mr-8">
              <Link href="/">
                <motion.div
                  className="relative h-16 md:h-20 lg:h-24 w-40 md:w-48 lg:w-56 transition-transform duration-500 group-hover:scale-105"
                  style={{ scale: logoScale }}
                >
                  <Image
                    src={logo}
                    alt="Raj Luxmi"
                    fill
                    priority
                    className="object-contain drop-shadow-sm"
                    sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                  />
                </motion.div>
              </Link>
            </div>

            {/* CENTER: Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-4 lg:gap-8 xl:gap-10 flex-1 justify-center">

              {/* New Arrivals - Mapped to Sort */}
              <Link
                href="/products?sort=newest"
                className="relative group px-0.5 lg:px-1 py-1"
              >
                <span className="text-[10px] lg:text-xs font-kugile font-normal tracking-[0.15em] uppercase text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors">
                  New Arrivals
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#B38B46] transition-all duration-500 ease-out -translate-x-1/2 group-hover:w-full" />
              </Link>

              {/* Bestsellers - Mapped to Sort */}
              <Link
                href="/products?sort=bestseller"
                className="relative group px-0.5 lg:px-1 py-1"
              >
                <span className="text-[10px] lg:text-xs font-kugile font-normal tracking-[0.15em] uppercase text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors">
                  Bestsellers
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#B38B46] transition-all duration-500 ease-out -translate-x-1/2 group-hover:w-full" />
              </Link>

              {/* Gifting Dropdown - Hidden as per request */}
              {/* {collections[2] && (
                <DesktopNavDropdown
                  title={collections[2].name}
                  items={collections[2].subcategories || []}
                  onSelect={(slug) => router.push(`/products?tag=${slug}`)}
                />
              )} */}

              {/* Shop In Lucknow Dropdown */}
              <DesktopNavDropdown
                title="Shop In Lucknow"
                items={categories.filter(c => !celebrateCategories.some(cc => cc.name === c.name))}
                onSelect={(slug) => router.push(`/products?category=${slug}`)}
              />

              {/* Shop Pan India Dropdown */}
              <DesktopNavDropdown
                title="Shop Pan India"
                items={categories.filter(c => {
                  const name = c.name.toLowerCase();
                  const isCelebrate = celebrateCategories.some(cc => cc.name === c.name);
                  return !isCelebrate && name !== "bengali sweets" && name !== "khoya sweets";
                })}
                onSelect={(slug) => router.push(`/products?category=${slug}`)}
              />

              {/* Celebrate with Rajluxmi Dropdown */}
              <DesktopNavDropdown
                title="Celebrate with Rajluxmi"
                items={celebrateCategories}
                onSelect={(slug) => router.push(`/products?category=${slug}`)}
              />
            </nav>

            {/* ... Right Actions ... */}
            <div className="flex items-center gap-4 lg:gap-6 justify-end">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsSearchOpen(true)}
                className="text-[#4A1C1F] hover:text-[#B38B46] transition-colors flex items-center gap-2 group"
              >
                <Search className="w-5 h-5 lg:w-6 lg:h-6 stroke-[1.5px]" />
              </motion.button>

              <div className="h-6 w-[1px] bg-[#D4B6A2]/40 hidden md:block"></div>

              {/* Heart */}
              <motion.button className="hidden md:block text-[#4A1C1F] hover:text-[#B38B46] transition-colors">
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 stroke-[1.5px]" />
              </motion.button>

              {/* User */}
              {user ? (
                <MobileDropdown>
                  <MobileDropdownTrigger className="outline-none">
                    <motion.div whileHover={{ scale: 1.05 }} className="text-[#4A1C1F] hover:text-[#B38B46] transition-colors hidden md:block cursor-pointer">
                      <User className="w-5 h-5 lg:w-6 lg:h-6 stroke-[1.5px]" />
                    </motion.div>
                    <div className="md:hidden text-[#4A1C1F]">
                      <User className="w-6 h-6 stroke-[1.5px]" onClick={() => router.push('/profile')} />
                    </div>
                  </MobileDropdownTrigger>
                  <MobileDropdownContent align="end" className="hidden md:block w-64 bg-[#FFFDF7] border border-[#D4B6A2]/20 shadow-xl rounded-sm p-2 z-[60]">
                    {isAdmin && (
                      <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#4A1C1F] cursor-pointer font-kugile font-normal tracking-wide text-xs uppercase py-3" onClick={() => router.push('/admin')}>
                        Admin Dashboard
                      </MobileDropdownItem>
                    )}
                    <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#4A1C1F] cursor-pointer font-kugile font-normal tracking-wide text-xs uppercase py-3" onClick={() => router.push('/profile')}>
                      Profile
                    </MobileDropdownItem>
                    <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#4A1C1F] cursor-pointer font-kugile font-normal tracking-wide text-xs uppercase py-3" onClick={signOut}>
                      Sign Out
                    </MobileDropdownItem>
                  </MobileDropdownContent>
                </MobileDropdown>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => router.push('/auth')}
                  className="text-[#4A1C1F] hover:text-[#B38B46] transition-colors hidden md:block"
                >
                  <User className="w-5 h-5 lg:w-6 lg:h-6 stroke-[1.5px]" />
                </motion.button>
              )}

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={toggleCart}
                className="relative text-[#4A1C1F] hover:text-[#B38B46] transition-colors p-1"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 stroke-[1.5px]" />
                {mounted && cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#783838] text-[#FFFDF7] text-xs w-4 h-4 rounded-full flex items-center justify-center shadow-sm font-kugile font-normal">
                    {cartItemsCount}
                  </span>
                )}
              </motion.button>

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden ml-2">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-[#4A1C1F] hover:text-[#B38B46] transition-colors">
                  <Menu className="w-7 h-7 stroke-[1.5px]" />
                </button>
              </div>
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
                {/* Manual Links for Collections */}
                <MobileMenuItem
                  label="New Arrivals"
                  path="/products?sort=newest"
                />
                <MobileMenuItem
                  label="Bestsellers"
                  path="/products?sort=bestseller"
                />
                {/* Gifting - Hidden as per request */}
                {/* {collections[2] && (
                  <MobileMenuItem
                    label={collections[2].name}
                    subItems={collections[2].subcategories}
                  />
                )} */}

                <MobileMenuItem
                  label="Shop in Lucknow"
                  subItems={categories
                    .filter(c => !celebrateCategories.some(cc => cc.name === c.name))
                    .map(c => ({ name: c.name, slug: c.name }))
                  }
                />

                <MobileMenuItem
                  label="Shop all over India"
                  subItems={categories
                    .filter(c => {
                      const name = c.name.toLowerCase();
                      const isCelebrate = celebrateCategories.some(cc => cc.name === c.name);
                      return !isCelebrate && name !== "bengali sweets" && name !== "khoya mithai";
                    })
                    .map(c => ({ name: c.name, slug: c.name }))
                  }
                />

                <MobileMenuItem
                  label="Celebrate with Rajluxmi"
                  subItems={celebrateCategories}
                />

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
