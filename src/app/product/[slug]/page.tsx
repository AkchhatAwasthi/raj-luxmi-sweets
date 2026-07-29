import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://rajluxmisweets.com';

const DEFAULT_BRAND_FAQS = [
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
    answer: "We use food-grade, vacuum-sealed, tamper-evident box packaging protected by rigid outer boxes to ensure your sweets arrive fresh, soft, and unbroken."
  },
  {
    question: "What are the delivery timelines for Lucknow and across India?",
    answer: "Local Lucknow orders are delivered within 24 hours (same-day express option available). Pan-India shipments are dispatched fresh and delivered in 3 to 5 business days."
  },
  {
    question: "Can I order in bulk for weddings, corporate gifts, or special occasions?",
    answer: "Yes! We specialize in custom festive and wedding sweet hampers. Please contact our support team or visit our special order page for customized bulk orders."
  }
];

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  const supabase = await createClient();

  let { data: product } = await supabase
    .from('products')
    .select('name, description, images, meta_title, meta_description, meta_keywords')
    .eq('sku', slug)
    .single() as any;

  if (!product) {
    const { data: byId } = await supabase
      .from('products')
      .select('name, description, images, meta_title, meta_description, meta_keywords')
      .eq('id', slug)
      .single() as any;
    product = byId;
  }

  if (product) {
    // Use custom SEO fields if set, otherwise auto-generate from product data
    const title = (product as any).meta_title || `${product.name} | Raj Luxmi Sweets`;
    const description =
      (product as any).meta_description ||
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at Raj Luxmi Sweets.`;
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/logo.png';
    const keywords = (product as any).meta_keywords || undefined;

    return {
      title,
      description,
      ...(keywords && {
        keywords,
      }),
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }],
      },
    };
  }

  return {
    title: 'Product Not Found | Raj Luxmi Sweets',
  };
}

export default async function ProductDetailPage(props: Props) {
  const params = await props.params;
  const slug = params.slug;
  const supabase = await createClient();

  // Try by SKU first (preferred), fall back to ID
  let { data: product } = await supabase
    .from('products')
    .select('*, categories(name), faqs')
    .eq('sku', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    const { data: byId } = await supabase
      .from('products')
      .select('*, categories(name), faqs')
      .eq('id', slug)
      .eq('is_active', true)
      .single();
    product = byId;
  }

  // Product not found — render 404
  if (!product) {
    notFound();
  }

  // Fetch real reviews from database for Google Schema & Rich Snippets
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id);

  const reviewsList = reviewsData || [];
  const reviewCount = reviewsList.length;
  const avgRating = reviewCount > 0
    ? (reviewsList.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
    : undefined;

  // Prepare FAQs for Google FAQPage schema
  const displayFaqs = Array.isArray(product.faqs) && product.faqs.length > 0
    ? product.faqs
    : DEFAULT_BRAND_FAQS;

  // --- JSON-LD Product Schema for Google ---
  const today = new Date().toISOString().split('T')[0];
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Buy ${product.name} at Raj Luxmi Sweets.`,
    image: product.images && product.images.length > 0 ? product.images : [`${BASE_URL}/logo.png`],
    sku: product.sku || product.id,
    url: `${BASE_URL}/product/${product.sku || product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Raj Luxmi Sweets',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      validFrom: today,
      availability:
        (product.stock_quantity ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Raj Luxmi Sweets',
      },
      url: `${BASE_URL}/product/${product.sku || product.id}`,
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            name: 'Lucknow',
            addressCountry: 'IN',
            addressRegion: 'UP',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 0,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY',
            },
          },
          shippingRate: {
            '@type': 'MonetaryAmount',
            currency: 'INR',
          },
        },
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            name: 'Pan India',
            addressCountry: 'IN',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 3,
              maxValue: 5,
              unitCode: 'DAY',
            },
          },
          shippingRate: {
            '@type': 'MonetaryAmount',
            currency: 'INR',
          },
        },
      ],
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      merchantReturnDays: 0,
      returnMethod: 'https://schema.org/ReturnInStore',
      returnFees: 'https://schema.org/FreeReturn',
    },
    ...(product.categories?.name && {
      category: product.categories.name,
    }),
  };

  // Add real reviews & ratings to Google Product Schema if reviews exist
  if (reviewCount > 0 && avgRating) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    };

    jsonLd.review = reviewsList.map((r: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating || 5,
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: r.reviewer_name || 'Customer',
      },
      reviewBody: r.comment || '',
      datePublished: r.created_at ? r.created_at.split('T')[0] : today,
    }));
  }

  // FAQ Schema for Google Rich Search Snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (displayFaqs as any[]).map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* Product JSON-LD for Google Rich Results (Price, Stock, Star Ratings, Reviews) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* FAQ JSON-LD for Google Rich Accordion Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
