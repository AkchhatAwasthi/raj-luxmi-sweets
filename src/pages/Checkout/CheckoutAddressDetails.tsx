'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, AlertTriangle, CheckCircle, Package, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { validateAddressDetails } from '@/utils/validation';
import {
  zoneFromGPS,
  zoneFromPincode,
  calculateDelivery,
  totalCartWeightKg,
  hasBengaliSweets,
  estimatedRoadKm,
  MOQ_LUCKNOW_KG,
  MOQ_OUTSIDE_KG,
  type DeliveryZone,
  type DeliveryResult,
} from '@/utils/deliveryCalculator';

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

interface SavedAddress {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  type: string;
  is_default: boolean;
}

interface CheckoutAddressDetailsProps {
  addressDetails: AddressDetails;
  setAddressDetails: (details: AddressDetails) => void;
  savedAddresses: SavedAddress[];
  selectedAddress: SavedAddress | null;
  setSelectedAddress: (address: SavedAddress | null) => void;
  useExistingAddress: boolean;
  setUseExistingAddress: (use: boolean) => void;
  showAddressForm: boolean;
  setShowAddressForm: (show: boolean) => void;
  settings: any;
  subtotal: number;
  currentUser: any;
  onNext: () => void;
  onPrev: () => void;
  estimatedDeliveryFee: number | null;
  setEstimatedDeliveryFee: (fee: number | null) => void;
  estimatedDeliveryTime: string | null;
  setEstimatedDeliveryTime: (time: string | null) => void;
  cartItems: any[];
  isPincodeServiceable: boolean;
  setIsPincodeServiceable: (serviceable: boolean) => void;
  // New props for delivery system
  onDeliveryResult?: (result: DeliveryResult) => void;
  customerCoords?: { lat: number; lng: number } | null;
  setCustomerCoords?: (coords: { lat: number; lng: number } | null) => void;
}

const CheckoutAddressDetails = ({
  addressDetails,
  setAddressDetails,
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  useExistingAddress,
  setUseExistingAddress,
  showAddressForm,
  setShowAddressForm,
  settings,
  subtotal,
  currentUser,
  onNext,
  onPrev,
  cartItems,
  onDeliveryResult,
  customerCoords,
  setCustomerCoords,
}: CheckoutAddressDetailsProps) => {
  const [addressErrors, setAddressErrors] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [zone, setZone] = useState<DeliveryZone>('unknown');
  const [showLocationPopup, setShowLocationPopup] = useState(true); // auto-open on mount

  // Keep a ref so the async reverseGeocode can read the latest addressDetails
  const addressDetailsRef = React.useRef(addressDetails);
  useEffect(() => { addressDetailsRef.current = addressDetails; }, [addressDetails]);

  // Recalculate delivery whenever zone or cart changes
  useEffect(() => {
    if (zone === 'unknown') {
      setDeliveryResult(null);
      return;
    }
    const distKm = customerCoords
      ? estimatedRoadKm(customerCoords.lat, customerCoords.lng)
      : undefined;
    const result = calculateDelivery(cartItems, zone, distKm);
    setDeliveryResult(result);
    onDeliveryResult?.(result);
  }, [zone, cartItems, customerCoords]);

  // Auto-detect zone from pincode when pincode changes (fallback)
  useEffect(() => {
    if (addressDetails.pincode.length === 6 && !customerCoords) {
      const pincodeZone = zoneFromPincode(addressDetails.pincode);
      setZone(pincodeZone);
    }
  }, [addressDetails.pincode, customerCoords]);

  // ─── Nominatim Reverse Geocoding ────────────────────────────────────────────
  const reverseGeocode = async (lat: number, lng: number): Promise<void> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RajLuxmiSweets/1.0 (rajluxmisweets.com)',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const addr = data.address || {};

      // Build street/area from available OSM fields
      const streetParts = [
        addr.road,
        addr.neighbourhood || addr.suburb || addr.quarter,
      ].filter(Boolean);
      const street = streetParts.join(', ') || addr.county || '';

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.city_district ||
        '';

      const state = addr.state || '';
      const pincode = addr.postcode || '';

      // Auto-fill detected fields, preserve what user already entered
      const current = addressDetailsRef.current;
      setAddressDetails({
        ...current,
        street: street || current.street,
        city: city || current.city,
        state: state || current.state,
        pincode: pincode || current.pincode,
      });
    } catch (err) {
      console.warn('Reverse geocoding failed, user can fill manually:', err);
    }
  };

  // ─── Live Location Handler ──────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location access.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    // Immediately open the address form so auto-filled data is visible
    setShowAddressForm(true);
    setUseExistingAddress(false);
    setSelectedAddress(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const detectedZone = zoneFromGPS(lat, lng);

        setCustomerCoords?.({ lat, lng });
        setZone(detectedZone);

        // Reverse geocode to auto-fill address fields
        await reverseGeocode(lat, lng);

        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            'Location access denied. We\'ll use your pincode to estimate delivery. ' +
            'Note: You may not get the free delivery discount for being within 6 km.'
          );
        } else {
          setLocationError('Could not get your location. Please enter your pincode below.');
        }
        // Fallback to pincode zone
        if (addressDetails.pincode.length === 6) {
          setZone(zoneFromPincode(addressDetails.pincode));
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSavedAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);
    // Clear any previous GPS coords since this is a different address
    setCustomerCoords?.(null);
    setAddressDetails({
      plotNumber: address.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode,
      addressType: address.type as 'home' | 'work' | 'other',
      saveAs: address.type === 'other' ? address.name : '',
    });
    // Detect zone from saved address pincode (no GPS available)
    const pz = zoneFromPincode(address.pincode);
    setZone(pz);
  };

  const handleNext = () => {
    if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
      setAddressErrors(['Please complete all address fields.']);
      return;
    }

    if (!useExistingAddress) {
      const validation = validateAddressDetails(addressDetails);
      if (!validation.isValid) {
        setAddressErrors(validation.errors);
        return;
      }
    }

    // Block if Bengali sweets are in cart and zone is outside Lucknow
    if (deliveryResult?.bengaliSweetsBlocked) {
      setAddressErrors([
        'Bengali Sweets cannot be delivered outside Lucknow. Please remove them from your cart or choose a Lucknow delivery address.',
      ]);
      return;
    }

    // Block if below MOQ
    if (deliveryResult && !deliveryResult.isAboveMoq) {
      const moq = deliveryResult.moqKg;
      setAddressErrors([
        `Minimum order is ${moq} kg for your delivery zone. Your cart is ${deliveryResult.totalWeightKg.toFixed(2)} kg. Please add more items.`,
      ]);
      return;
    }

    setAddressErrors([]);
    onNext();
  };

  // Weight info
  const totalWeightKg = totalCartWeightKg(cartItems);
  const bengaliInCart = hasBengaliSweets(cartItems);

  const zoneLabel = {
    lucknow_free: 'Within 6 km — Free Delivery',
    lucknow_flat: 'Within Lucknow (7–20 km) — ₹150 Flat',
    outside: 'Outside Lucknow — ₹100/kg',
    unknown: 'Not detected yet',
  }[zone];

  const zoneBadgeColor = {
    lucknow_free: 'bg-green-100 text-green-800 border-green-300',
    lucknow_flat: 'bg-blue-100 text-blue-800 border-blue-300',
    outside: 'bg-amber-100 text-amber-800 border-amber-300',
    unknown: 'bg-gray-100 text-gray-600 border-gray-300',
  }[zone];

  return (
    <>
      {/* ── Live Location Prompt Popup ─────────────────────────────────── */}
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLocationPopup(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header band */}
            <div className="bg-gradient-to-r from-[#8B2131] to-[#C0392B] px-6 pt-6 pb-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">📍</span>
              </div>
              <h2 className="text-white text-xl font-semibold tracking-wide">Accurate Delivery Fee</h2>
              <p className="text-white/80 text-sm mt-1">Share your location for the best rate</p>
            </div>

            {/* Wave divider */}
            <div className="bg-[#8B2131] h-4 relative">
              <div className="absolute -bottom-px left-0 right-0">
                <svg viewBox="0 0 1440 20" className="w-full" preserveAspectRatio="none">
                  <path d="M0,20 C360,0 1080,0 1440,20 L1440,20 L0,20 Z" fill="white" />
                </svg>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-4 pb-6 space-y-4">
              {/* Fee zones at a glance */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 bg-green-50 border border-green-200 rounded-md">
                  <span className="text-lg">🎉</span>
                  <div className="text-sm">
                    <span className="font-semibold text-green-800">Within 6 km</span>
                    <span className="text-green-700"> — Free Delivery!</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-lg">🏙️</span>
                  <div className="text-sm">
                    <span className="font-semibold text-blue-800">Within Lucknow</span>
                    <span className="text-blue-700"> — ₹150 flat (free if ≥ 10 kg)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-amber-50 border border-amber-200 rounded-md">
                  <span className="text-lg">🚚</span>
                  <div className="text-sm">
                    <span className="font-semibold text-amber-800">Outside Lucknow</span>
                    <span className="text-amber-700"> — ₹100/kg</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-gray-500">
                We only use your location to calculate distance to our shop.
                It is never stored or shared.
              </p>

              {/* CTA buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationPopup(false);
                    handleGetLocation();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#8B2131] hover:bg-[#701a26] text-white font-semibold py-3 rounded-md transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Use My Live Location
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationPopup(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
                >
                  Skip — I'll enter address manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="border-[#E6D5B8] bg-[#FFFDF7] shadow-sm">
        <CardHeader className="border-b border-[#E6D5B8]">
          <CardTitle className="flex items-center text-lg text-[#783838] uppercase font-orange-avenue font-normal tracking-wide">
            <MapPin className="h-5 w-5 mr-2 text-[#8B2131]" />
            Delivery Address & Charges
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">

          {/* ── Cart Weight Summary ─────────────────────────────────────────── */}
          <div className="bg-[#FFF8F0] border border-[#E6D5B8] rounded-sm p-4 flex items-center gap-4">
            <Package className="h-5 w-5 text-[#8B2131] shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#2C1810]">
                Total order weight:{' '}
                <span className="text-[#8B2131] font-bold">{totalWeightKg.toFixed(2)} kg</span>
              </p>
              <p className="text-xs text-[#5D4037] mt-0.5">
                Min. order: {zone === 'outside' ? MOQ_OUTSIDE_KG : MOQ_LUCKNOW_KG} kg for your zone
              </p>
            </div>
            {bengaliInCart && (
              <div className="ml-auto text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded-sm font-medium">
                ⚠ Bengali Sweets in cart
              </div>
            )}
          </div>

          {/* ── Live Location Button ────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 bg-[#8B2131] hover:bg-[#701a26] text-white"
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {locationLoading ? 'Detecting & filling address...' : '📍 Use My Live Location'}
              </Button>

              {customerCoords && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-700 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Location detected — address auto-filled below
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="text-xs text-[#8B2131] underline flex items-center gap-1 hover:text-[#701a26]"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-[#5D4037]">
              📌 We'll auto-fill your <strong>street, city, state & pincode</strong> from GPS.
              You'll still need to enter your <strong>house/plot number</strong> and <strong>building name</strong>.
            </p>

            {/* Zone badge */}
            {zone !== 'unknown' && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-medium ${zoneBadgeColor}`}>
                <MapPin className="h-3 w-3" />
                {zoneLabel}
              </div>
            )}

            {/* Location error */}
            {locationError && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{locationError}</p>
              </div>
            )}
          </div>

          {/* ── Delivery Fee Preview ────────────────────────────────────────── */}
          {deliveryResult && (
            <div className={`p-4 rounded-sm border ${deliveryResult.isFree ? 'bg-green-50 border-green-200' : 'bg-[#F0F4FF] border-[#C3DAFE]'}`}>
              <div className="flex items-start gap-3">
                <Clock className={`h-5 w-5 shrink-0 mt-0.5 ${deliveryResult.isFree ? 'text-green-600' : 'text-[#3182CE]'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium text-sm ${deliveryResult.isFree ? 'text-green-800' : 'text-[#2A4365]'}`}>
                      Estimated Delivery Fee
                      {!customerCoords && (
                        <span className="ml-2 text-xs font-normal text-amber-600">(pincode estimate)</span>
                      )}
                    </h4>
                    <span className={`font-bold text-base ${deliveryResult.isFree ? 'text-green-700' : 'text-[#2C5282]'}`}>
                      {deliveryResult.isFree ? 'FREE 🎉' : `₹${deliveryResult.deliveryFee}`}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${deliveryResult.isFree ? 'text-green-700' : 'text-[#2B6CB0]'}`}>
                    {deliveryResult.message}
                  </p>

                  {/* Prompt to use live location when fee was estimated using pincode only */}
                  {!customerCoords && zone === 'lucknow_flat' && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                      <Navigation className="h-3 w-3 shrink-0" />
                      <span>
                        Fee estimated from pincode. If you're within 6 km of our shop, delivery could be{' '}
                        <strong>FREE</strong>!{' '}
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          className="underline font-semibold text-[#8B2131] hover:text-[#701a26]"
                        >
                          Click here to check with live location →
                        </button>
                      </span>
                    </div>
                  )}

                  {/* MOQ warning */}
                  {!deliveryResult.isAboveMoq && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      Minimum order is {deliveryResult.moqKg} kg.
                      Your cart: {deliveryResult.totalWeightKg.toFixed(2)} kg —
                      add {(deliveryResult.moqKg - deliveryResult.totalWeightKg).toFixed(2)} kg more.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bengali Sweets block warning */}
          {deliveryResult?.bengaliSweetsBlocked && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-sm">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Bengali Sweets Cannot Be Delivered Outside Lucknow</p>
                <p className="text-xs text-red-700 mt-1">
                  Please remove Bengali Sweets from your cart to proceed with this delivery address,
                  or choose a Lucknow delivery address.
                </p>
              </div>
            </div>
          )}

          {/* ── Saved Addresses ─────────────────────────────────────────────── */}
          {savedAddresses.length > 0 && !useExistingAddress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-[#2C1810]">Use Saved Address</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(true)}
                  className="border-[#8B2131] text-[#8B2131] hover:bg-[#8B2131] hover:text-white"
                >
                  Add New Address
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-sm cursor-pointer transition-all ${selectedAddress?.id === address.id
                      ? 'border-[#8B2131] bg-[#FFF0DE]'
                      : 'border-[#E6D5B8] hover:border-[#8B2131]/50'
                      }`}
                    onClick={() => handleSavedAddressSelect(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-[#2C1810]">{address.name}</span>
                          <span className="text-xs bg-[#E6D5B8]/30 text-[#5D4037] px-2 py-1 rounded-sm uppercase tracking-wide">
                            {address.type}
                          </span>
                          {address.is_default && (
                            <span className="text-xs bg-[#8B2131] text-white px-2 py-1 rounded-sm uppercase tracking-wide">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#5D4037]">
                          {address.address_line_1}
                          {address.address_line_2 && `, ${address.address_line_2}`}
                        </p>
                        <p className="text-sm text-[#5D4037]">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowAddressForm(true)}
                  className="text-[#8B2131] hover:text-[#701a26] hover:bg-[#FFF8F0]"
                >
                  + Add New Address Instead
                </Button>
              </div>
            </div>
          )}

          {/* ── Address Form ─────────────────────────────────────────────────── */}
          {(savedAddresses.length === 0 || showAddressForm || useExistingAddress) && (
            <>
              {useExistingAddress && (
                <div className="flex items-center justify-between p-3 bg-[#F0FFF4] border border-[#C6F6D5] rounded-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium text-[#22543D]">
                      Using saved address: {selectedAddress?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUseExistingAddress(false);
                      setSelectedAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="text-green-700 hover:text-green-800 hover:bg-[#C6F6D5]"
                  >
                    Change
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plotNumber" className="text-sm font-medium text-[#2C1810]">
                    Plot/House Number *
                  </Label>
                  <Input
                    id="plotNumber"
                    type="text"
                    placeholder="e.g., 123, A-45"
                    value={addressDetails.plotNumber}
                    onChange={(e) => setAddressDetails({ ...addressDetails, plotNumber: e.target.value })}
                    className="h-12 border-[#E6D5B8] focus:ring-[#8B2131] bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingName" className="text-sm font-medium text-[#2C1810]">
                    Building/Society Name
                  </Label>
                  <Input
                    id="buildingName"
                    type="text"
                    placeholder="e.g., Green Valley Apartments"
                    value={addressDetails.buildingName}
                    onChange={(e) => setAddressDetails({ ...addressDetails, buildingName: e.target.value })}
                    className="h-12 border-[#E6D5B8] focus:ring-[#8B2131] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="text-sm font-medium text-[#2C1810]">
                  Street/Area *
                </Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="e.g., MG Road, Sector 15"
                  value={addressDetails.street}
                  onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                  className="h-12 border-[#E6D5B8] focus:ring-[#8B2131] bg-white"
                  required
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-[#2C1810]">
                    City *
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                    value={addressDetails.city}
                    onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                    className="h-12 border-[#E6D5B8] focus:ring-[#8B2131] bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-[#2C1810]">
                    State *
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="Enter your state"
                    value={addressDetails.state}
                    onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                    className="h-12 border-[#E6D5B8] focus:ring-[#8B2131] bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-sm font-medium text-[#2C1810]">
                    Pincode *
                  </Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="6-digit pincode"
                    value={addressDetails.pincode}
                    onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                    className="h-12 border-[#E6D5B8] focus:ring-[#8B2131] bg-white"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark" className="text-sm font-medium text-[#2C1810]">
                  Nearby Landmark
                </Label>
                <Input
                  id="landmark"
                  type="text"
                  placeholder="e.g., Near Metro Station"
                  value={addressDetails.landmark}
                  onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                  className="h-12 border-[#E6D5B8] focus:ring-[#8B2131] bg-white"
                />
              </div>

              {/* Address type — only for logged-in users */}
              {currentUser && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-[#2C1810]">Save this address as</Label>
                  <RadioGroup
                    value={addressDetails.addressType}
                    onValueChange={(value: 'home' | 'work' | 'other') =>
                      setAddressDetails({ ...addressDetails, addressType: value })
                    }
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home" id="home" className="text-[#8B2131]" />
                      <Label htmlFor="home" className="cursor-pointer text-[#5D4037]">Home</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="work" id="work" className="text-[#8B2131]" />
                      <Label htmlFor="work" className="cursor-pointer text-[#5D4037]">Work</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" className="text-[#8B2131]" />
                      <Label htmlFor="other" className="cursor-pointer text-[#5D4037]">Other</Label>
                    </div>
                  </RadioGroup>

                  {addressDetails.addressType === 'other' && (
                    <Input
                      placeholder="Enter custom name (e.g., Friend's Place)"
                      value={addressDetails.saveAs}
                      onChange={(e) => setAddressDetails({ ...addressDetails, saveAs: e.target.value })}
                      className="h-12 mt-2 border-[#E6D5B8] focus:ring-[#8B2131]"
                    />
                  )}
                </div>
              )}

              {currentUser && !useExistingAddress && (
                <div className="flex items-center space-x-2 p-4 bg-[#F0F4FF] border border-[#C3DAFE] rounded-sm">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={true}
                    readOnly
                    className="rounded text-[#3182CE] focus:ring-[#3182CE]"
                  />
                  <Label htmlFor="saveAddress" className="text-sm text-[#2A4365]">
                    Save this address to your profile for future orders
                    {savedAddresses.length >= 3 && (
                      <span className="block text-xs text-orange-600 mt-1">
                        ⚠️ You have reached the maximum limit of 3 saved addresses
                      </span>
                    )}
                  </Label>
                </div>
              )}
            </>
          )}

          {/* Validation errors */}
          {addressErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-sm text-sm space-y-1">
              {addressErrors.map((error, i) => (
                <p key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onPrev}
              size="lg"
              className="px-8 border-[#E6D5B8] text-[#5D4037] hover:bg-[#FFF8F0]"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                useExistingAddress
                  ? !selectedAddress || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
                  : !addressDetails.plotNumber || !addressDetails.street || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
              }
              size="lg"
              className="px-8 bg-[#8B2131] hover:bg-[#701a26] text-white text-sm"
            >
              Continue to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default CheckoutAddressDetails;
