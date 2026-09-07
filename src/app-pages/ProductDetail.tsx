// @ts-nocheck

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart,
  ChevronLeft, ChevronRight, Truck, Award, CheckCircle,
  Zap, Sparkles, Utensils, Gift, PhoneCall, RefreshCw, ShieldCheck, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { formatPrice, calculateDiscount } from '@/utils/currency';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import FaqAccordion from '@/components/FaqAccordion';
import ProductReviews from '@/components/ProductReviews';

const BULK_WHATSAPP_NUMBER = '918448447408';

// Helper to determine category type and provide tailored features, pillars, and FAQs
const getProductCategoryInfo = (product: any) => {
  const catName = (product?.categories?.name || product?.category || '').toLowerCase();
  const prodName = (product?.name || '').toLowerCase();

  // 1. Gift Boxes, Hampers & Festive Packs
  if (
    catName.includes('gift') ||
    catName.includes('thal') ||
    catName.includes('bhayana') ||
    catName.includes('festive') ||
    prodName.includes('gift box') ||
    prodName.includes('hamper') ||
    prodName.includes('gift pack') ||
    prodName.includes('thal')
  ) {
    return {
      type: 'gift',
      keyFeatures: [
        'Curated Selection of Royal Sweets & Savouries',
        'Elegant Gold-Embossed Presentation Keepsake Box',
        'Perfect for Festive Celebrations, Weddings & Corporate Gifting'
      ],
      promiseTitle: 'Royal Presentation & Curated Elegance',
      pillars: [
        {
          icon: Gift,
          title: 'Curated Royal Assortment',
          text: 'Handpicked selection of our finest signature delicacies, thoughtfully paired to create an unforgettable festive tasting experience.'
        },
        {
          icon: Award,
          title: 'Signature Luxury Presentation',
          text: 'Encased in rigid, gold-foil embossed keepsake packaging, designed to present royalty, elegance, and warmth for your celebrations.'
        },
        {
          icon: Sparkles,
          title: 'Fresh Daily Packing',
          text: 'Every gift box is packed fresh just prior to dispatch, ensuring authentic aroma, delicate texture, and peak quality upon arrival.'
        }
      ],
      faqs: [
        {
          question: "Can this gift box be customized for corporate or wedding orders?",
          answer: "Yes, absolutely! We specialize in custom festive and wedding sweet hampers with personalized ribbons, branding, and custom sweet or dry fruit combinations. Contact our support team for bulk inquiries."
        },
        {
          question: "What is the shelf life of items inside the gift box?",
          answer: "Each delicacy inside is individually sealed. Sweets remain fresh for 7 to 10 days, while savouries and dry fruits stay crisp and fresh for up to 30 days."
        },
        {
          question: "How are gift boxes packaged to prevent damage during shipping?",
          answer: "Every gift box is protected with shockproof inner cushioning and enclosed in a heavy-duty outer transit carton to ensure it arrives in pristine, gifting-ready condition."
        },
        {
          question: "What are the delivery timelines for Lucknow and across India?",
          answer: "Local Lucknow orders are delivered within 24 hours (same-day express option available). Pan-India shipments are dispatched fresh and delivered in 3 to 5 business days."
        }
      ]
    };
  }

  // 2. Namkeen & Savouries
  if (
    catName.includes('namkeen') ||
    prodName.includes('namkeen') ||
    prodName.includes('matthi') ||
    prodName.includes('bhujia') ||
    prodName.includes('sev') ||
    prodName.includes('mixture') ||
    prodName.includes('kachori') ||
    prodName.includes('samosa') ||
    prodName.includes('chips') ||
    prodName.includes('murukku')
  ) {
    return {
      type: 'namkeen',
      keyFeatures: [
        'Crisp & Crunchy Traditional Awadhi Savoury Snack',
        'Handcrafted with Authentic Secret Heritage Spices',
        'Zero Artificial Flavors, Chemical Preservatives or Synthetic Colors'
      ],
      promiseTitle: 'Authentic Crunch & Traditional Spices',
      pillars: [
        {
          icon: Utensils,
          title: 'Heritage Awadhi Spices',
          text: 'Infused with secret artisanal spice blends roasted in-house to deliver the authentic, bold flavors of classic Lucknow savory snacks.'
        },
        {
          icon: Award,
          title: 'Golden Crisp Frying',
          text: 'Prepared in small batches with pristine premium cooking oils to ensure a light, airy crunch that never feels heavy or oily.'
        },
        {
          icon: Sparkles,
          title: '100% Wholesome Ingredients',
          text: 'Made with stone-ground flours, fresh pulses, and natural seasonings with strictly zero artificial flavoring or coloring.'
        }
      ],
      faqs: [
        {
          question: "What cooking medium and spices are used in this namkeen?",
          answer: "We use pristine refined cooking oils and authentic stone-ground whole Awadhi spices roasted in-house, with zero synthetic colors or artificial flavor enhancers."
        },
        {
          question: "How long does the namkeen remain fresh and crunchy?",
          answer: "Our namkeens stay crunchy and fresh for up to 60 days when stored in an airtight container in a cool, dry place away from direct sunlight."
        },
        {
          question: "How is the snack packaged for shipping?",
          answer: "We seal our namkeens in food-grade, airtight barrier pouches protected by rigid outer boxes so they arrive fresh, aromatic, and unbroken."
        },
        {
          question: "What are the delivery timelines for Lucknow and across India?",
          answer: "Local Lucknow orders are delivered within 24 hours. Pan-India shipments are dispatched fresh and delivered in 3 to 5 business days."
        }
      ]
    };
  }

  // 3. Dry Fruits & Nuts
  const isSweetCategory =
    catName.includes('sweet') ||
    catName.includes('mithai') ||
    catName.includes('halwa') ||
    catName.includes('ghewar') ||
    catName.includes('laddu') ||
    catName.includes('chhena') ||
    catName.includes('khoya');

  if (
    !isSweetCategory &&
    (catName.includes('dry fruit') ||
      prodName.includes('almond') ||
      prodName.includes('cashew') ||
      prodName.includes('walnut') ||
      prodName.includes('raisin') ||
      prodName.includes('pistachio'))
  ) {
    return {
      type: 'dryfruit',
      keyFeatures: [
        '100% Handpicked Jumbo Grade Premium Nuts',
        'Naturally Rich in Plant Protein, Healthy Fats & Antioxidants',
        'Sealed in Moisture-Barrier Packaging for Peak Crunch'
      ],
      promiseTitle: 'Supreme Grade & Whole Natural Nutrition',
      pillars: [
        {
          icon: Award,
          title: 'Jumbo Grade Selection',
          text: 'Sourced from premier orchards, each nut is carefully graded for uniform size, plumpness, and rich natural crunch.'
        },
        {
          icon: Sparkles,
          title: 'Whole & Unprocessed',
          text: '100% pure raw or gently dry-roasted nuts with zero artificial glazing, chemical polish, or sulfur treatments.'
        },
        {
          icon: ShieldCheck,
          title: 'Aroma & Crunch Seal',
          text: 'Sealed in moisture-resistant barrier containers to maintain peak crunch and natural nutty aroma over time.'
        }
      ],
      faqs: [
        {
          question: "What grade and quality of dry fruits do you provide?",
          answer: "We source only premium, hand-sorted jumbo-grade dry fruits and nuts that undergo strict cleaning and visual sorting."
        },
        {
          question: "What is the recommended storage for dry fruits?",
          answer: "Stored in an airtight jar in a cool, dry place or refrigerated in warm weather, our dry fruits retain maximum crunch and nutrition for up to 6 months."
        },
        {
          question: "Are there any added preservatives, oils, or sulfur treatments?",
          answer: "None at all. Our dry fruits are 100% natural, unpolished, and completely free from chemical preservatives or artificial sulfur bleaching."
        },
        {
          question: "What are the delivery timelines?",
          answer: "Local Lucknow delivery within 24 hours, and Pan-India express delivery within 3 to 5 business days."
        }
      ]
    };
  }

  // 4. Baklava & Mewa Bites
  if (
    catName.includes('baklava') ||
    catName.includes('mewa bites') ||
    prodName.includes('baklava') ||
    prodName.includes('mewa bite')
  ) {
    return {
      type: 'baklava',
      keyFeatures: [
        'Loaded with Premium Whole Cashews, Almonds & Pistachios',
        'Artisanal Bite-Sized Layered Delicacy with Delicate Flakiness',
        'Naturally Sweetened with Zero Artificial Preservatives'
      ],
      promiseTitle: 'Artisanal Delicacy & Rich Nuts',
      pillars: [
        {
          icon: Sparkles,
          title: 'Rich Whole Dry Fruits',
          text: 'Abundantly loaded with premium California almonds, cashews, and roasted pistachios in every single bite.'
        },
        {
          icon: Utensils,
          title: 'Artisanal Layering',
          text: 'Expertly layered and baked to golden perfection, offering an irresistible flaky bite and delicate royal sweetness.'
        },
        {
          icon: Award,
          title: 'Zero Chemical Additives',
          text: 'Bound with pure honey or natural syrups, completely free from artificial sweeteners and synthetic stabilizers.'
        }
      ],
      faqs: [
        {
          question: "What dry fruits and sweeteners are used in Baklava & Mewa Bites?",
          answer: "We use premium whole roasted pistachios, almonds, and cashews bound in natural sweetness, strictly free of artificial syrups."
        },
        {
          question: "What is the shelf life of Mewa Bites & Baklava?",
          answer: "Because of their low moisture and high dry fruit content, they remain fresh and crisp for up to 20 days at room temperature."
        },
        {
          question: "How are they packaged for transit?",
          answer: "Packed in individual partitioned trays inside rigid luxury boxes to preserve their delicate shape and crisp flakiness."
        },
        {
          question: "What are the delivery timelines?",
          answer: "Local Lucknow delivery within 24 hours, Pan-India shipping in 3 to 5 business days."
        }
      ]
    };
  }

  // 5. Default: Traditional Sweets & Mithai (Ghee Sweets, Khoya, Chhena, Laddu, Ghewar)
  return {
    type: 'sweet',
    keyFeatures: [
      'Prepared in 100% Pure Desi Ghee',
      'Handcrafted Daily by Lucknow Master Halwais',
      'Zero Artificial Preservatives or Additives'
    ],
    promiseTitle: 'Purity & Heritage Craftsmanship',
    pillars: [
      {
        icon: Award,
        title: '100% Pure Desi Ghee',
        text: 'Prepared exclusively with slow-churned pure desi ghee for an authentic, rich aroma and unforgettable traditional taste.'
      },
      {
        icon: Utensils,
        title: 'Master Halwais of Lucknow',
        text: 'Handcrafted daily in small batches honoring century-old royal Awadhi confectionery recipes and artisanal techniques.'
      },
      {
        icon: Sparkles,
        title: 'Pure Natural Ingredients',
        text: 'Crafted using rich dry fruits, authentic saffron, and natural ingredients with zero artificial preservatives or colors.'
      }
    ],
    faqs: [
      {
        question: "Is this sweet freshly prepared with 100% Pure Desi Ghee?",
        answer: "Yes, absolutely! Every single batch of our sweets is handcrafted daily by master halwais in Lucknow using 100% pure desi ghee, premium grade dry fruits, and zero artificial preservatives."
      },
      {
        question: "What is the shelf life and storage recommendation?",
        answer: "Our sweets remain fresh for 7 to 10 days at room temperature when stored in a cool, dry place inside an airtight container. Refrigeration can extend freshness up to 20 days."
      },
      {
        question: "How are products packaged for shipping?",
        answer: "We use food-grade, airtight box packaging protected by rigid outer boxes to ensure your sweets arrive fresh, soft, and unbroken."
      },
      {
        question: "What are the delivery timelines for Lucknow and across India?",
        answer: "Local Lucknow orders are delivered within 24 hours (same-day express option available). Pan-India shipments are dispatched fresh and delivered in 3 to 5 business days."
      }
    ]
  };
};

const ProductDetail = ({ product }: { product: any }) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedCurrentIndex, setRelatedCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  const { addToCart } = useStore();

  useEffect(() => {
    scrollToTopInstant();
    if (product?.category_id) {
      fetchRelatedProducts(product.category_id, product.id);
    }
  }, [product?.id]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(1);
    } else if (window.innerWidth < 768) {
      setItemsPerView(2);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4);
    }
  };

  const fetchRelatedProducts = async (categoryId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', productId)
        .eq('is_active', true)
        .limit(12);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const nextRelatedSlide = () => {
    setRelatedCurrentIndex(prev => {
      const maxIndex = Math.max(0, relatedProducts.length - itemsPerView);
      return prev >= maxIndex ? maxIndex : prev + 1;
    });
  };

  const prevRelatedSlide = () => {
    setRelatedCurrentIndex(prev => {
      return prev <= 0 ? 0 : prev - 1;
    });
  };

  const maxRelatedIndex = Math.max(0, relatedProducts.length - itemsPerView);
  const canGoNextRelated = relatedCurrentIndex < maxRelatedIndex;
  const canGoPrevRelated = relatedCurrentIndex > 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        image: product.images?.[0] || '/placeholder.svg',
        slug: product.sku || product.id,
        category: product.categories?.name || 'Unknown',
        inStock: product.stock_quantity > 0
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const discountPercentage = product.original_price
    ? calculateDiscount(product.original_price, product.price)
    : 0;

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const productWeight = product.nutritional_info?.weight_per_unit || product.weight || '';

  // Get subcategory/category specific info
  const categoryInfo = getProductCategoryInfo(product);

  // If product has explicit features in DB, filter out mismatches (e.g. Desi Ghee on gift boxes / namkeen)
  const customFeatures = (Array.isArray(product.features) && product.features.length > 0)
    ? product.features
        .filter(f => !f.toLowerCase().includes('vacuum') && !f.toLowerCase().includes('vegetarian'))
        .filter(f => categoryInfo.type === 'sweet' || !f.toLowerCase().includes('desi ghee'))
    : [];

  const displayFeatures = customFeatures.length >= 2 ? customFeatures : categoryInfo.keyFeatures;

  return (
    <div className="min-h-screen bg-[#FFFDF7] pt-20 lg:pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pt-4 border-b border-[#E6D5B8]/60 pb-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-[#5D4037]">
            <Link href="/" className="hover:text-[#8B2131] transition-colors">
              Home
            </Link>
            <span className="text-[#E6D5B8]">/</span>
            <Link href="/products" className="hover:text-[#8B2131] transition-colors">
              Products
            </Link>
            <span className="text-[#E6D5B8]">/</span>
            <span className="text-[#8B2131] font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8B2131] hover:underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
        </div>

        {/* HERO SECTION: Gallery + Clean Luxury Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
          
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square bg-[#FAF6EE] rounded-sm overflow-hidden border border-[#E6D5B8] shadow-sm group">
              <img
                src={product.images?.[currentImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* ONLY Category Badge on Image — clean and uncluttered */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-[#8B2131] text-white hover:bg-[#6d1a26] border-none rounded-none px-3.5 py-1.5 font-orange-avenue font-normal tracking-wider uppercase text-xs shadow-sm">
                  {product.categories?.name || (categoryInfo.type === 'gift' ? 'Gift Boxes' : categoryInfo.type === 'namkeen' ? 'Namkeen' : categoryInfo.type === 'dryfruit' ? 'Dry Fruits' : 'Mithai')}
                </Badge>
              </div>

              {/* Image Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-[#8B2131] hover:text-white text-[#2C1810] flex items-center justify-center transition-colors shadow-md border border-[#E6D5B8]"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-[#8B2131] hover:text-white text-[#2C1810] flex items-center justify-center transition-colors shadow-md border border-[#E6D5B8]"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-20 bg-[#FAF6EE] border-2 transition-all duration-200 overflow-hidden ${
                      currentImageIndex === index
                        ? 'border-[#8B2131] opacity-100 scale-102'
                        : 'border-[#E6D5B8] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Clean, Elegant Buy Box */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Stock status & Rating Row */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                {product.stock_quantity > 0 ? (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span> In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-800">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span> Sold Out
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#5D4037]">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-semibold text-[#2C1810]">4.9</span>
                <span className="text-[#5D4037]/70">(120+ Reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810] leading-tight mb-3 uppercase tracking-wide">
              {product.name}
            </h1>

            {/* Net weight & SKU if available */}
            {(productWeight || product.sku) && (
              <div className="flex items-center gap-3 text-sm text-[#5D4037] mb-6">
                {productWeight && (
                  <span>Net Content: <strong className="text-[#2C1810] font-medium">{productWeight}</strong></span>
                )}
                {productWeight && product.sku && <span className="text-[#E6D5B8]">•</span>}
                {product.sku && (
                  <span className="text-xs text-[#5D4037]/70 font-mono">SKU: {product.sku}</span>
                )}
              </div>
            )}

            {/* Price Row */}
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-[#E6D5B8]">
              <span className="text-3xl sm:text-4xl font-orange-avenue font-normal text-[#8B2131]">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xl text-[#5D4037]/50 line-through font-orange-avenue">
                  {formatPrice(product.original_price)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="text-xs font-bold text-[#8B2131] border border-[#8B2131] px-2.5 py-0.5 uppercase tracking-wider">
                  Save {discountPercentage}%
                </span>
              )}
              <span className="text-xs text-[#5D4037]/70 block ml-auto">
                Inclusive of all taxes
              </span>
            </div>

            {/* Clean Description */}
            <div className="prose prose-brown max-w-none mb-8">
              <p className="text-[#5D4037] text-base leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Key Highlights (Category-Tailored Pointers) */}
            <div className="space-y-2 mb-8">
              {displayFeatures.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-[#5D4037]">
                  <CheckCircle className="w-4 h-4 text-[#8B2131] flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Purchase Controls */}
            {categoryInfo.type === 'gift' ? (
              <div className="space-y-3 bg-[#FAF6EE] border-2 border-[#E6D5B8] p-5 rounded-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8B2131] uppercase tracking-wider">
                  <Gift className="w-4 h-4" /> Bespoke Gift Box • WhatsApp Concierge
                </div>
                <p className="text-xs text-[#5D4037] font-light leading-relaxed">
                  Gift hampers are customized with bespoke sweet combinations, personal ribbons, and corporate branding. Orders are coordinated exclusively through our WhatsApp concierge.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <a
                    href={`https://wa.me/${BULK_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      `Hello Raj Luxmi Sweets, I am interested in ordering '${product.name}' (SKU: ${product.sku || product.id}). Please share bulk options, customization and catalogue.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#8B2131] hover:bg-[#6d1a26] text-white h-[52px] font-orange-avenue text-xs sm:text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Inquire &amp; Order on WhatsApp
                  </a>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    aria-label="Save to favorites"
                    className={`w-[52px] h-[52px] border border-[#E6D5B8] bg-white flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isFavorite
                        ? 'bg-[#8B2131] border-[#8B2131] text-white'
                        : 'text-[#2C1810] hover:border-[#8B2131] hover:text-[#8B2131]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-[#8B2131]' : ''}`} />
                  </button>
                </div>
                <div className="text-[11px] text-[#5D4037]/70 text-center sm:text-left">
                  No direct website checkout for gift boxes • We deliver pan-India
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Stepper */}
                  <div className="flex items-center border border-[#E6D5B8] bg-white p-1 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-12 h-12 flex items-center justify-center text-[#2C1810] hover:bg-[#FAF6EE] transition-colors disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-14 text-center font-orange-avenue font-normal text-xl text-[#2C1810]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.stock_quantity <= quantity}
                      aria-label="Increase quantity"
                      className="w-12 h-12 flex items-center justify-center text-[#2C1810] hover:bg-[#FAF6EE] transition-colors disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary CTA Buttons */}
                  <div className="flex flex-1 flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                      className="flex-1 bg-white hover:bg-[#FAF6EE] text-[#2C1810] border border-[#2C1810] h-[52px] rounded-none uppercase tracking-[0.2em] font-medium text-xs sm:text-sm transition-all duration-300 shadow-xs flex items-center justify-center gap-2 hover:border-[#8B2131] hover:text-[#8B2131]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>

                    <Button
                      onClick={handleBuyNow}
                      disabled={product.stock_quantity === 0}
                      className="flex-1 bg-[#8B2131] hover:bg-[#6d1a26] text-white h-[52px] rounded-none uppercase tracking-[0.2em] font-medium text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#E6D5B8]" />
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                    </Button>

                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      aria-label="Save to favorites"
                      className={`w-[52px] h-[52px] border border-[#E6D5B8] bg-white flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        isFavorite
                          ? 'bg-[#8B2131] border-[#8B2131] text-white'
                          : 'text-[#2C1810] hover:border-[#8B2131] hover:text-[#8B2131]'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-[#8B2131]' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* HORIZONTAL STRIP: DELIVERY & FRESHNESS COMMITMENT (Standalone section) */}
        <div className="bg-[#FFF8F0] border border-[#E6D5B8] rounded-sm p-6 sm:p-8 mb-16 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E6D5B8]/80 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#8B2131]" />
              <h2 className="text-base sm:text-lg font-orange-avenue font-normal text-[#8B2131] uppercase tracking-wide">
                Delivery & Freshness Commitment
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-900 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-sm">
              Direct Kitchen Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-[#5D4037]">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C1810] font-orange-avenue font-normal text-base block mb-0.5">
                  Lucknow Local Delivery
                </strong>
                <span className="text-xs leading-relaxed block text-[#5D4037]/90">
                  Delivered fresh in under 24 hours (Same-day available)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#8B2131] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C1810] font-orange-avenue font-normal text-base block mb-0.5">
                  Pan-India Air Express
                </strong>
                <span className="text-xs leading-relaxed block text-[#5D4037]/90">
                  Freshly dispatched, delivered in 3–5 business days
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C1810] font-orange-avenue font-normal text-base block mb-0.5">
                  Aroma-Lock Packaging
                </strong>
                <span className="text-xs leading-relaxed block text-[#5D4037]/90">
                  Sealed food-grade containers protect texture and purity
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#5D4037] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C1810] font-orange-avenue font-normal text-base block mb-0.5">
                  Quality Support Guarantee
                </strong>
                <span className="text-xs leading-relaxed block text-[#5D4037]/90">
                  Quality concern resolution within 24 hours of delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: 3 PILLARS OF HERITAGE & QUALITY (Category-Specific) */}
        <div className="border-t border-[#E6D5B8] pt-14 mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B2131] mb-2 block">
              The Raj Luxmi Promise
            </span>
            <h2 className="text-2xl sm:text-3xl font-orange-avenue font-normal uppercase text-[#2C1810]">
              {categoryInfo.promiseTitle}
            </h2>
            <div className="w-12 h-0.5 bg-[#8B2131] mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryInfo.pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              return (
                <div key={idx} className="bg-white border border-[#E6D5B8] p-6 rounded-sm shadow-xs hover:border-[#8B2131] transition-colors">
                  <div className="w-11 h-11 rounded-full bg-[#FAF6EE] border border-[#E6D5B8] flex items-center justify-center text-[#8B2131] mb-4">
                    <PillarIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] uppercase mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#5D4037] leading-relaxed font-light">
                    {pillar.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: FESTIVE & BULK GIFTING BANNER */}
        <div className="bg-gradient-to-r from-[#8B2131] via-[#6d1a26] to-[#50131d] text-white p-8 sm:p-10 rounded-sm mb-16 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-[#E6D5B8] uppercase tracking-wider mb-1">
                <Gift className="w-3.5 h-3.5" /> Wedding & Corporate Gifting
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-orange-avenue font-normal uppercase tracking-wide">
                Custom Festive Hampers & Bulk Orders
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl font-light">
                Looking for tailored sweet boxes for weddings, corporate milestones, or festive hampers? We offer custom presentation and dedicated concierge support.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`https://wa.me/${BULK_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello Raj Luxmi Sweets! I would like to inquire about a bulk/corporate order for "${product.name}" (SKU: ${product.sku || product.id || 'N/A'}). Please share bulk pricing, packaging customization, and delivery details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E6D5B8] hover:bg-[#d8c39f] text-[#2C1810] font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-none transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#8B2131]" />
                Inquire for Bulk Orders
              </a>
              <a
                href={`tel:+${BULK_WHATSAPP_NUMBER}`}
                className="border border-[#E6D5B8]/60 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-widest px-5 py-3.5 transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Concierge
              </a>
            </div>
          </div>
        </div>

        {/* SECTION: CUSTOMER REVIEWS */}
        <div className="border-t border-[#E6D5B8] pt-14 mb-16">
          <ProductReviews product={product} />
        </div>

        {/* SECTION: FAQ SECTION (Category-Tailored) */}
        {(() => {
          const displayFaqs = Array.isArray(product?.faqs) && product.faqs.length > 0
            ? product.faqs
            : categoryInfo.faqs;

          return (
            <div className="border-t border-[#E6D5B8] pt-14 mb-16">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B2131] mb-2 block">Support</span>
                <h2 className="text-2xl sm:text-3xl font-orange-avenue font-normal uppercase text-[#2C1810]">
                  Frequently Asked Questions
                </h2>
              </div>
              <FaqAccordion faqs={displayFaqs} />
            </div>
          );
        })()}

        {/* SECTION: CURATED SUGGESTIONS / RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#E6D5B8] pt-14">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B2131] mb-2 block">You May Also Like</span>
                <h2 className="text-2xl sm:text-3xl font-orange-avenue font-normal uppercase text-[#2C1810]">Curated Royal Suggestions</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={prevRelatedSlide}
                  disabled={!canGoPrevRelated}
                  className="w-12 h-12 border border-[#E6D5B8] flex items-center justify-center text-[#2C1810] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131] transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#2C1810]"
                  aria-label="Previous suggestions"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextRelatedSlide}
                  disabled={!canGoNextRelated}
                  className="w-12 h-12 border border-[#E6D5B8] flex items-center justify-center text-[#2C1810] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131] transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#2C1810]"
                  aria-label="Next suggestions"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${relatedCurrentIndex * (100 / relatedProducts.length)}%)`,
                  width: `${(relatedProducts.length / itemsPerView) * 100}%`
                }}
              >
                {relatedProducts.map((relatedProduct: any) => (
                  <div
                    key={relatedProduct.id}
                    className="px-2"
                    style={{ width: `${100 / relatedProducts.length}%` }}
                  >
                    <ProductCard
                      product={{
                        ...relatedProduct,
                        image: relatedProduct.images?.[0] || '/placeholder.svg',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
