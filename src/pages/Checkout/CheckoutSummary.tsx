import { useState } from 'react';
import { User, MapPin, ShoppingBag, CreditCard, Shield, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/currency';
import { toNumber, formatCurrency } from '@/utils/settingsHelpers';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface AddressDetails {
  plotNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  saveAs: string;
}

interface CheckoutSummaryProps {
  customerInfo: ContactInfo;
  addressDetails: AddressDetails;
  paymentMethod: string;
  cartItems: any[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  codFee: number;
  discount: number;
  total: number;
  settings: any;
  isMinOrderMet: boolean;
  minOrderShortfall: number;
  isProcessingPayment: boolean;
  estimatedDeliveryFee: number | null;
  estimatedDeliveryTime: string | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  setAppliedCoupon: (coupon: any) => void;
  availableCoupons: any[];
  onPlaceOrder: () => void;
  onPrev: () => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  isPincodeServiceable: boolean;
}

const CheckoutSummary = ({
  customerInfo,
  addressDetails,
  paymentMethod,
  cartItems,
  subtotal,
  tax,
  deliveryFee,
  codFee,
  discount,
  total,
  settings,
  isMinOrderMet,
  minOrderShortfall,
  isProcessingPayment,
  estimatedDeliveryFee,
  estimatedDeliveryTime,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  availableCoupons,
  onPlaceOrder,
  onPrev,
  onApplyCoupon,
  onRemoveCoupon,
  isPincodeServiceable
}: CheckoutSummaryProps) => {
  const [showItems, setShowItems] = useState(true);

  return (
    <div className="space-y-6 font-sans text-[#2C1810]">
      {/* Header */}
      <h2 className="text-xl text-[#783838] uppercase font-instrument font-normal tracking-wide border-b border-[#E6D5B8] pb-4 mb-6">
        Review & Place Order
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Shipping & Contact */}
          <Card className="border-[#E6D5B8] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8]/50 py-4 px-6">
              <CardTitle className="flex items-center text-base text-[#783838] uppercase font-instrument font-normal tracking-wide">
                <MapPin className="h-5 w-5 mr-3 text-[#8B2131]" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#8B2131] uppercase tracking-wider mb-2">Deliver To</h4>
                  <p className="font-medium text-[#2C1810]">{customerInfo.name}</p>
                  <p className="text-[#5D4037] text-sm mt-1">{addressDetails.plotNumber}, {addressDetails.street}</p>
                  {addressDetails.landmark && <p className="text-[#5D4037] text-sm">Near {addressDetails.landmark}</p>}
                  <p className="text-[#5D4037] text-sm">{addressDetails.city}, {addressDetails.state} - {addressDetails.pincode}</p>
                  <p className="text-[#5D4037] text-sm mt-1 font-medium">Contact: {customerInfo.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#8B2131] uppercase tracking-wider mb-2">Delivery Estimate</h4>
                  <div className="bg-[#FFF8F0] p-4 rounded-md border border-[#E6D5B8]">
                    <p className="text-[#2C1810] text-sm font-medium flex items-center">
                      <User className="h-4 w-4 mr-2 text-[#8B2131]" />
                      Standard Delivery
                    </p>
                    <p className="text-[#5D4037] text-xs mt-1 ml-6">{estimatedDeliveryTime || '3-5 Business Days'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="border-[#E6D5B8] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8]/50 py-4 px-6">
              <CardTitle className="flex items-center text-base text-[#783838] uppercase font-instrument font-normal tracking-wide">
                <CreditCard className="h-5 w-5 mr-3 text-[#8B2131]" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-normal font-instrument text-[#2C1810] text-base">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
                <p className="text-sm text-[#5D4037]">
                  {paymentMethod === 'cod' ? 'Pay safely with cash upon delivery' : 'Secure payment via Razorpay'}
                </p>
              </div>
              <div className="text-[#8B2131]">
                {paymentMethod === 'cod' ? '💵' : '💳'}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-[#E6D5B8] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8]/50 py-4 px-6 cursor-pointer hover:bg-[#FFF8F0] transition-colors" onClick={() => setShowItems(!showItems)}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-base text-[#783838] uppercase font-instrument font-normal tracking-wide">
                  <ShoppingBag className="h-5 w-5 mr-3 text-[#8B2131]" />
                  Items in Order ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </CardTitle>
                {showItems ? <ChevronUp className="h-5 w-5 text-[#5D4037]" /> : <ChevronDown className="h-5 w-5 text-[#5D4037]" />}
              </div>
            </CardHeader>
            {showItems && (
              <CardContent className="p-0">
                <div className="divide-y divide-[#E6D5B8]/50">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex p-4 hover:bg-[#FFFDF7] transition-colors">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-[#E6D5B8]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-normal font-instrument text-[#2C1810]">
                            <h3 className="font-instrument font-normal tracking-wide uppercase">{item.name}</h3>
                            <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                          <p className="mt-1 text-sm text-[#5D4037]">{item.weight}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-[#5D4037]">Qty {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-[#E6D5B8] shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8] py-5 text-center">
                <h3 className="text-lg text-[#783838] uppercase font-instrument font-normal tracking-wide">Order Summary</h3>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Bill Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#5D4037]">
                    <span>Subtotal</span>
                    <span className="font-normal text-[#2C1810] font-instrument">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#5D4037]">
                    <span>Delivery</span>
                    <span className="font-normal text-[#2C1810] font-instrument">
                      {deliveryFee === 0 ? <span className="text-green-700">Free</span> : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-[#5D4037]">
                      <span>Tax</span>
                      <span className="font-normal text-[#2C1810] font-instrument">{formatPrice(tax)}</span>
                    </div>
                  )}
                  {paymentMethod === 'cod' && codFee > 0 && (
                    <div className="flex justify-between text-[#5D4037]">
                      <span>COD Fee</span>
                      <span className="font-normal text-[#2C1810] font-instrument">{formatPrice(codFee)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-[#E6D5B8]" />

                {/* Total */}
                <div className="flex justify-between items-end">
                  <span className="text-[#2C1810] font-medium text-lg font-instrument">Total</span>
                  <span className="text-[#8B2131] font-instrument font-normal text-2xl">{formatPrice(total)}</span>
                </div>

                {/* Coupon */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-[#F0FFF4] p-3 rounded-md border border-green-200">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-green-700 mr-2" />
                        <span className="text-green-800 font-bold text-xs">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={onRemoveCoupon} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-9 text-sm border-[#E6D5B8] bg-[#FFFDF7]"
                      />
                      <Button size="sm" onClick={onApplyCoupon} variant="outline" className="border-[#8B2131] text-[#8B2131] hover:bg-[#8B2131] hover:text-white">
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                {/* Error Messages */}
                {!isPincodeServiceable && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-xs text-center">
                    Delivery not available to this pincode.
                  </div>
                )}

                {/* Place Order Button */}
                <Button
                  className="w-full bg-[#8B2131] hover:bg-[#701a26] text-white font-instrument font-normal tracking-wider text-lg py-6 shadow-md hover:shadow-lg transition-all"
                  onClick={onPlaceOrder}
                  disabled={isProcessingPayment || !isMinOrderMet || !isPincodeServiceable}
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatPrice(total)}`
                  )}
                </Button>
                <div className="text-center">
                  <p className="text-[10px] text-[#5D4037]/70 flex items-center justify-center">
                    <Shield className="h-3 w-3 mr-1" /> Secure Checkout
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;