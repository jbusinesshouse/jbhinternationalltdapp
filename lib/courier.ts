/**
 * Pathao courier delivery (via the Express API). Mirrors the website's lib/courier.ts.
 * When the API reports courier off / unavailable, screens behave exactly as before.
 */
import { apiRequest } from "@/lib/api";

export type CourierCity = { city_id: number; city_name: string };
export type CourierZone = { zone_id: number; zone_name: string };
export type CourierArea = {
  area_id: number;
  area_name: string;
  home_delivery_available: boolean;
  pickup_available: boolean;
};
export type CourierLocation = { city_id: number | null; zone_id: number | null; area_id: number | null };
export const emptyCourierLocation = (): CourierLocation => ({ city_id: null, zone_id: null, area_id: null });

export type CourierQuote =
  | { available: true; delivery_fee: number; parcel_weight_kg: number }
  | { available: false; reason: string; message: string };

export async function fetchCourierAvailable(productId: string): Promise<boolean> {
  try {
    const res = await apiRequest<{ available: boolean }>(
      `/delivery/availability/${encodeURIComponent(productId)}`,
      { auth: false }
    );
    return Boolean(res.available);
  } catch {
    return false;
  }
}

export async function fetchCourierCities() {
  return (await apiRequest<{ cities: CourierCity[] }>("/delivery/cities", { auth: false })).cities ?? [];
}
export async function fetchCourierZones(cityId: number) {
  return (await apiRequest<{ zones: CourierZone[] }>(`/delivery/cities/${cityId}/zones`, { auth: false })).zones ?? [];
}
export async function fetchCourierAreas(zoneId: number) {
  return (await apiRequest<{ areas: CourierArea[] }>(`/delivery/zones/${zoneId}/areas`, { auth: false })).areas ?? [];
}

export async function fetchCourierQuote(input: {
  product_id: string;
  quantity: number;
  city_id: number;
  zone_id: number;
  area_id?: number | null;
}) {
  return apiRequest<CourierQuote>("/delivery/quote", { method: "POST", body: input, auth: "optional" });
}

export type PickupStore = {
  id: string;
  contact_name: string;
  contact_number: string;
  secondary_contact: string | null;
  address: string;
  city_id: number;
  zone_id: number;
  area_id: number;
  status: "pending_review" | "rejected" | "approved" | "awaiting_pathao" | "active" | "failed" | "disabled";
  admin_note: string | null;
};

export async function fetchPickupStore() {
  return apiRequest<{ enabled: boolean; eligible: boolean; store: PickupStore | null }>("/delivery/pickup-store");
}

export async function savePickupStore(body: {
  contact_name: string;
  contact_number: string;
  secondary_contact?: string | null;
  address: string;
  city_id: number;
  zone_id: number;
  area_id: number;
}) {
  return apiRequest<{ store: PickupStore }>("/delivery/pickup-store", { method: "PUT", body });
}

export const PICKUP_STATUS_LABEL: Record<PickupStore["status"], string> = {
  pending_review: "যাচাই চলছে",
  rejected: "সংশোধন প্রয়োজন",
  approved: "অনুমোদিত — Pathao-তে পাঠানো হচ্ছে",
  awaiting_pathao: "Pathao-র অনুমোদনের অপেক্ষায়",
  active: "চালু আছে",
  failed: "সমস্যা হয়েছে — সাপোর্টে যোগাযোগ করুন",
  disabled: "বন্ধ",
};

export type PublicShipment = {
  id: string;
  status: string;
  pathao_status: string | null;
  merchant_order_id: string;
  consignment_id: string | null;
  amount_to_collect: number;
};

export const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  queued: "কুরিয়ার বুকিং হচ্ছে",
  submitting: "কুরিয়ার বুকিং হচ্ছে",
  unknown: "কুরিয়ার বুকিং যাচাই হচ্ছে",
  booked: "কুরিয়ার বুক হয়েছে",
  pickup: "পিকআপের অপেক্ষায়",
  in_transit: "পথে আছে",
  delivered: "ডেলিভারি সম্পন্ন",
  partial_delivered: "আংশিক ডেলিভারি",
  returned: "ফেরত এসেছে",
  failed: "কুরিয়ার বুকিং ব্যর্থ — আমাদের টিম দেখছে",
  cancelled: "কুরিয়ার বাতিল",
};

/** Courier owns shipped/completed while its parcel is active or delivered. */
export const COURIER_CONTROLLED = new Set([
  "queued",
  "submitting",
  "unknown",
  "booked",
  "pickup",
  "in_transit",
  "delivered",
  "partial_delivered",
]);
