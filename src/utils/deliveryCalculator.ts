// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY CALCULATOR — Raj Luxmi Sweets
// Zero external APIs. Pure math + browser GPS.
// ─────────────────────────────────────────────────────────────────────────────

// Shop location: Brej Palace, Near Ashiyana Power House Chauraha, Lucknow-226012
export const SHOP_LAT = 26.799559;
export const SHOP_LNG = 80.917397;

// Delivery fee constants
export const LUCKNOW_FLAT_FEE = 150;           // ₹150 flat (7–20 km zone)
export const OUTSIDE_PER_KG_FEE = 100;         // ₹100 per kg outside Lucknow
export const FREE_DELIVERY_WEIGHT_KG = 10;     // ≥ 10 kg = free delivery (Lucknow)
export const FREE_DELIVERY_DISTANCE_KM = 6;    // ≤ 6 km = free delivery
export const LUCKNOW_RADIUS_KM = 20;           // Lucknow service radius
export const ROAD_FACTOR = 1.3;                // Straight-line → road distance multiplier

// Minimum order weights (in kg)
export const MOQ_LUCKNOW_KG = 1;               // Min 1 kg within Lucknow
export const MOQ_OUTSIDE_KG = 5;               // Min 5 kg outside Lucknow

// Bengali Sweets category name (exact match from DB)
export const BENGALI_SWEETS_CATEGORY = 'Bengali Sweets';

// ─── Delivery Zones ───────────────────────────────────────────────────────────
export type DeliveryZone =
    | 'lucknow_free'      // ≤ 6 km → free
    | 'lucknow_flat'      // 7–20 km → ₹150 flat (free if ≥ 10 kg)
    | 'outside'           // > 20 km → ₹100/kg, MOQ 5 kg, no Bengali sweets
    | 'unknown';          // pincode entered but no live location yet

// ─── Haversine Distance (straight-line, in km) ───────────────────────────────
export function haversineKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// ─── Road distance estimate ───────────────────────────────────────────────────
export function estimatedRoadKm(lat: number, lng: number): number {
    const straight = haversineKm(SHOP_LAT, SHOP_LNG, lat, lng);
    return straight * ROAD_FACTOR;
}

// ─── Zone from GPS ────────────────────────────────────────────────────────────
export function zoneFromGPS(lat: number, lng: number): DeliveryZone {
    const road = estimatedRoadKm(lat, lng);
    if (road <= FREE_DELIVERY_DISTANCE_KM) return 'lucknow_free';
    if (road <= LUCKNOW_RADIUS_KM) return 'lucknow_flat';
    return 'outside';
}

// ─── Zone from pincode (fallback when no GPS) ─────────────────────────────────
// Lucknow pincodes are 226001–226030 range (all start with "226")
export function zoneFromPincode(pincode: string): DeliveryZone {
    const clean = pincode.replace(/\s+/g, '');
    if (clean.startsWith('226')) return 'lucknow_flat'; // Inside Lucknow, assume flat fee
    if (clean.length === 6) return 'outside';
    return 'unknown';
}

// ─── Parse product weight string → kg ────────────────────────────────────────
// Handles: "2kg", "500gm", "500g", "1.5 kg", "250 g", "1 Kg", etc.
export function parseWeightToKg(weightStr: string): number {
    if (!weightStr) return 0;
    const s = weightStr.toLowerCase().trim();

    // Match number + unit
    const match = s.match(/^([\d.]+)\s*(kg|gm|gram|grams|g)$/);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const unit = match[2];

    if (unit === 'kg') return num;
    // gm / g / gram / grams → kg
    return num / 1000;
}

// ─── Total cart weight in kg ──────────────────────────────────────────────────
export function totalCartWeightKg(cartItems: Array<{ weight: string; quantity: number }>): number {
    return cartItems.reduce((sum, item) => {
        const itemWeightKg = parseWeightToKg(item.weight);
        return sum + itemWeightKg * item.quantity;
    }, 0);
}

// ─── Bengali sweets check ─────────────────────────────────────────────────────
export function hasBengaliSweets(cartItems: Array<{ category?: string }>): boolean {
    return cartItems.some(
        (item) => item.category?.toLowerCase() === BENGALI_SWEETS_CATEGORY.toLowerCase()
    );
}

// ─── Main delivery fee calculator ─────────────────────────────────────────────
export interface DeliveryResult {
    zone: DeliveryZone;
    deliveryFee: number;
    isFree: boolean;
    totalWeightKg: number;
    moqKg: number;
    isAboveMoq: boolean;
    bengaliSweetsBlocked: boolean;
    distanceKm?: number;             // Available only when GPS used
    message: string;                 // Human-readable explanation
}

export function calculateDelivery(
    cartItems: Array<{ weight: string; quantity: number; category?: string }>,
    zone: DeliveryZone,
    distanceKm?: number
): DeliveryResult {
    const totalWeightKg = totalCartWeightKg(cartItems);
    const bengaliSweetsBlocked = zone === 'outside' && hasBengaliSweets(cartItems);

    const moqKg = zone === 'outside' ? MOQ_OUTSIDE_KG : MOQ_LUCKNOW_KG;
    const isAboveMoq = totalWeightKg >= moqKg;

    let deliveryFee = 0;
    let isFree = false;
    let message = '';

    switch (zone) {
        case 'lucknow_free':
            deliveryFee = 0;
            isFree = true;
            message = distanceKm
                ? `You're ${distanceKm.toFixed(1)} km from our shop — free delivery! 🎉`
                : 'Free delivery within 6 km of our shop! 🎉';
            break;

        case 'lucknow_flat':
            if (totalWeightKg >= FREE_DELIVERY_WEIGHT_KG) {
                deliveryFee = 0;
                isFree = true;
                message = `Order weight ${totalWeightKg.toFixed(2)} kg ≥ 10 kg — free delivery! 🎉`;
            } else {
                deliveryFee = LUCKNOW_FLAT_FEE;
                isFree = false;
                const remaining = FREE_DELIVERY_WEIGHT_KG - totalWeightKg;
                message = distanceKm
                    ? `Flat ₹150 delivery (${distanceKm.toFixed(1)} km away). Add ${remaining.toFixed(2)} kg more for free delivery!`
                    : `Flat ₹150 delivery (within Lucknow). Add ${remaining.toFixed(2)} kg more for free delivery!`;
            }
            break;

        case 'outside':
            deliveryFee = Math.round(totalWeightKg * OUTSIDE_PER_KG_FEE);
            isFree = false;
            message = `Outside Lucknow: ₹100 × ${totalWeightKg.toFixed(2)} kg = ₹${deliveryFee}`;
            break;

        case 'unknown':
        default:
            deliveryFee = 0;
            isFree = false;
            message = 'Enter your pincode or share location to calculate delivery.';
            break;
    }

    return {
        zone,
        deliveryFee,
        isFree,
        totalWeightKg,
        moqKg,
        isAboveMoq,
        bengaliSweetsBlocked,
        distanceKm,
        message,
    };
}
