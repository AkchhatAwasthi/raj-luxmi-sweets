'use client';

import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, formatCurrency } from '@/utils/settingsHelpers';
import { totalCartWeightKg } from '@/utils/deliveryCalculator';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useStore();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();

  // Early return if settings are still loading
  if (settingsLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B2131] mx-auto"></div>
        <p className="mt-4 text-[#5D4037]">Loading royal experience...</p>
      </div>
    );
  }

  // Show error if settings failed to load
  if (settingsError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-500 mb-4">⚠️ Settings Error</div>
        <p className="text-muted-foreground mb-4">{settingsError}</p>
        <Button onClick={() => window.location.reload()} className="bg-[#8B2131] text-white hover:bg-[#701a26]">
          Refresh Page
        </Button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = 0; // Tax removed as per requirement

  // Delivery fee is dynamic (calculated at checkout based on location/weight)
  // Cart page shows a preview — actual fee set during checkout address step
  const deliveryFee = 0; // shown as 'calculated at checkout'
  const total = subtotal + tax + deliveryFee;

  // Weight-based MOQ: minimum 1 kg within Lucknow
  const totalWeightKg = totalCartWeightKg(cartItems);
  const MOQ_KG = 1; // minimum 1 kg (Lucknow default; 5 kg for outside shown at checkout)
  const isMinOrderMet = totalWeightKg >= MOQ_KG;
  const minOrderShortfallKg = Math.max(0, MOQ_KG - totalWeightKg);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 sm:py-24 bg-[#FFFDF7] min-h-[60vh]">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-[#FFF0DE] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingBag className="h-10 w-10 text-[#8B2131]" />
          </div>
          <h1 className="text-2xl text-[#783838] uppercase font-instrument font-normal tracking-wide mb-3">Your Cart is Empty</h1>
          <p className="text-[#5D4037] mb-8 text-lg font-light font-instrument">
            Indulge in our premium selection of sweets and treats.
          </p>
          <div className="space-y-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-[#8B2131] hover:bg-[#701a26] text-white uppercase tracking-widest px-8 font-instrument font-normal">
              <Link href="/products">Start Shopping</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto text-[#8B2131] hover:bg-[#FFF0DE] hover:text-[#701a26]">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E6D5B8]">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="sm:hidden text-[#8B2131]">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl text-[#783838] uppercase font-instrument font-normal tracking-wide">Shopping Cart</h1>
              <p className="text-sm text-[#5D4037] mt-1 tracking-wide font-instrument">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden sm:flex border-[#8B2131] text-[#8B2131] hover:bg-[#8B2131] hover:text-white uppercase tracking-wider text-xs font-instrument font-normal">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border border-[#E6D5B8] bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-[#FFF8F0]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl text-[#783838] uppercase font-instrument font-normal tracking-wide mb-1">{item.name}</h3>
                          <p className="text-sm text-[#5D4037] font-medium uppercase tracking-wide">
                            {item.weight}{item.pieces && ` • ${item.pieces}`}
                          </p>
                        </div>
                        <p className="font-instrument text-xl text-[#8B2131] font-normal">
                          {formatCurrency(item.price, settings.currency_symbol)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f7f3ed]">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#E6D5B8] rounded-sm bg-[#FFFDF7]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-9 w-9 p-0 hover:bg-[#FFF0DE] text-[#8B2131]"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-normal min-w-[2.5rem] text-center text-[#2C1810] text-sm font-instrument">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-9 w-9 p-0 hover:bg-[#FFF0DE] text-[#8B2131]"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-6">
                          <p className="font-normal text-[#2C1810] font-instrument">
                            Total: <span className="text-[#8B2131]">{formatCurrency(toNumber(item.price) * toNumber(item.quantity), settings.currency_symbol)}</span>
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#5D4037]/60 hover:text-[#C53030] hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border border-[#E6D5B8] bg-white shadow-lg">
              <CardHeader className="bg-[#FFF8F0] border-b border-[#E6D5B8] py-5">
                <CardTitle className="text-lg text-[#783838] uppercase font-instrument font-normal tracking-wide">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#5D4037]">
                    <span>Subtotal</span>
                    <span className="font-normal text-[#2C1810] font-instrument">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#5D4037]">
                    <span>Total Weight</span>
                    <span className="font-normal text-[#2C1810] font-instrument">{totalWeightKg.toFixed(2)} kg</span>
                  </div>

                  <div className="flex justify-between text-[#5D4037]">
                    <span>Delivery Fee</span>
                    <span className="font-normal text-[#8B2131] font-instrument text-xs italic">Calculated at checkout</span>
                  </div>
                </div>

                {deliveryFee > 0 && (
                  <div className="bg-[#F0FFF4] border border-[#C6F6D5] rounded-sm p-3 text-center">
                    <p className="text-sm text-[#22543D] font-medium">
                      Add {formatPrice(toNumber(settings.free_delivery_threshold) - subtotal)} more for <span className="font-bold">FREE DELIVERY</span>
                    </p>
                  </div>
                )}

                {/* COD Fee Information */}
                {settings.cod_enabled && (
                  <div className="bg-[#EBF8FF] border border-[#BEE3F8] rounded-sm p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#2C5282] font-medium">COD Available</span>
                    </div>
                    <p className="text-xs text-[#2B6CB0] mt-1">
                      Additional {formatCurrency(settings.cod_charge, settings.currency_symbol)} fee for Cash on Delivery.
                      {settings.cod_threshold && ` Valid up to ${formatCurrency(settings.cod_threshold, settings.currency_symbol)}.`}
                    </p>
                  </div>
                )}

                <div className="border-t border-[#E6D5B8] pt-4 mt-2">
                  <div className="flex justify-between font-instrument font-normal text-lg text-[#2C1810]">
                    <span>Total</span>
                    <span className="text-[#8B2131]">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-[#5D4037] mt-2 italic text-right">
                    Calculated at checkout based on location
                  </p>
                </div>

                {/* Weight-based Minimum Order Validation */}
                {!isMinOrderMet && (
                  <div className="bg-[#FFFAF0] border border-[#FEEBC8] rounded-sm p-4 animate-pulse">
                    <p className="text-sm text-[#C05621] font-bold text-center">
                      Minimum order: {MOQ_KG} kg
                    </p>
                    <p className="text-xs text-[#C05621] mt-1 text-center">
                      Your cart: {totalWeightKg.toFixed(2)} kg — add {minOrderShortfallKg.toFixed(2)} kg more.
                    </p>
                  </div>
                )}

                <Button
                  asChild
                  className="w-full bg-[#8B2131] hover:bg-[#701a26] text-white h-12 text-base uppercase tracking-widest font-normal shadow-md hover:shadow-lg transition-all font-instrument"
                  size="lg"
                  disabled={!isMinOrderMet}
                >
                  <Link href="/checkout">
                    {isMinOrderMet ? 'Proceed to Checkout' : 'Add More Items'}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full border-[#E6D5B8] text-[#5D4037] hover:bg-[#FFF0DE] hover:text-[#2C1810]">
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6D5B8] p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="container mx-auto">
            {!isMinOrderMet && (
              <div className="bg-[#FFFAF0] border border-[#FEEBC8] rounded-sm p-2 mb-3 text-center">
                <p className="text-xs text-[#C05621] font-medium">
                  Add {minOrderShortfallKg.toFixed(2)} kg more to checkout
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-[#5D4037] uppercase tracking-wide font-instrument">Total</p>
                <p className="font-instrument font-normal text-xl text-[#2C1810]">{formatPrice(total)}</p>
              </div>
              <Button
                asChild
                className="bg-[#8B2131] hover:bg-[#701a26] text-white px-8 uppercase tracking-widest text-sm font-normal font-instrument"
                disabled={!isMinOrderMet}
              >
                <Link href="/checkout">
                  {isMinOrderMet ? 'Checkout' : 'Add Items'}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Add bottom padding to prevent content from being hidden behind sticky bar */}
        <div className="lg:hidden h-32"></div>
      </div>
    </div>
  );
};

export default Cart;