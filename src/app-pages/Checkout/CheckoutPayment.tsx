import { CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { validatePaymentMethod } from '@/utils/validation';

interface CheckoutPaymentProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  settings: any;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

const CheckoutPayment = ({
  paymentMethod,
  setPaymentMethod,
  settings,
  total,
  onNext,
  onPrev
}: CheckoutPaymentProps) => {

  const handleNext = () => {
    const paymentValidation = validatePaymentMethod(paymentMethod, total, settings);
    if (!paymentValidation.isValid) {
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl text-[#783838] uppercase font-instrument font-normal tracking-wide border-b border-[#E6D5B8] pb-4 mb-6">
        Select Payment Method
      </h2>

      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Online Payment Card */}
        {settings.cashfree_enabled && (
          <Label
            htmlFor="online"
            className={`relative flex flex-col p-6 cursor-pointer border rounded-lg transition-all duration-300 ${paymentMethod === 'online'
              ? 'border-[#8B2131] bg-[#FFF8F0] ring-1 ring-[#8B2131]'
              : 'border-[#E6D5B8] bg-white hover:border-[#8B2131]/50 hover:bg-[#FFFDF7]'
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-full ${paymentMethod === 'online' ? 'bg-[#8B2131] text-white' : 'bg-[#F5F5F5] text-[#5D4037]'}`}>
                <CreditCard className="h-6 w-6" />
              </div>
              <RadioGroupItem value="online" id="online" className="text-[#8B2131] border-[#8B2131]" />
            </div>

            <div>
              <h3 className="text-base text-[#783838] uppercase font-instrument font-normal tracking-wide mb-1">Pay Online</h3>
              <p className="text-sm text-[#5D4037] leading-relaxed">
                Credit Card, Debit Card, UPI, Net Banking.
              </p>
            </div>

            <div className="mt-4 flex items-center text-xs text-[#2C1810] font-medium bg-white/50 w-fit px-2 py-1 rounded border border-[#E6D5B8]">
              <ShieldCheck className="h-3 w-3 mr-1 text-green-600" />
              Secured by Cashfree
            </div>
          </Label>
        )}

        {/* COD Card */}
        {settings.cod_enabled && total <= Number(settings.cod_threshold) && (
          <Label
            htmlFor="cod"
            className={`relative flex flex-col p-6 cursor-pointer border rounded-lg transition-all duration-300 ${paymentMethod === 'cod'
              ? 'border-[#8B2131] bg-[#FFF8F0] ring-1 ring-[#8B2131]'
              : 'border-[#E6D5B8] bg-white hover:border-[#8B2131]/50 hover:bg-[#FFFDF7]'
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-full ${paymentMethod === 'cod' ? 'bg-[#8B2131] text-white' : 'bg-[#F5F5F5] text-[#5D4037]'}`}>
                <Banknote className="h-6 w-6" />
              </div>
              <RadioGroupItem value="cod" id="cod" className="text-[#8B2131] border-[#8B2131]" />
            </div>

            <div>
              <h3 className="text-base text-[#783838] uppercase font-instrument font-normal tracking-wide mb-1">Cash on Delivery</h3>
              <p className="text-sm text-[#5D4037] leading-relaxed">
                Pay comfortably with cash when your order arrives.
              </p>
              {Number(settings.cod_charge) > 0 && (
                <p className="text-xs text-[#8B2131] mt-2 font-medium">
                  + {settings.currency_symbol}{Number(settings.cod_charge).toFixed(2)} COD Convenience Fee
                </p>
              )}
            </div>
          </Label>
        )}

        {/* COD Disabled Only Message */}
        {settings.cod_enabled && total > Number(settings.cod_threshold) && (
          <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-100 rounded-md flex items-start">
            <span className="text-orange-500 mr-2 text-lg">⚠️</span>
            <p className="text-sm text-orange-800">
              Cash on Delivery is not available for orders above {settings.currency_symbol}{Number(settings.cod_threshold).toFixed(2)}. Please use online payment.
            </p>
          </div>
        )}

      </RadioGroup>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          className="px-8 py-6 h-auto border-[#E6D5B8] text-[#5D4037] hover:bg-[#FFF8F0] hover:text-[#2C1810]"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="px-8 py-6 h-auto bg-[#8B2131] hover:bg-[#701a26] text-white font-medium text-lg shadow-md hover:shadow-lg transition-all"
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPayment;