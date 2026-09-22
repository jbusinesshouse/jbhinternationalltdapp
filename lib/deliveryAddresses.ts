import { apiRequest } from "@/lib/api";

export type DeliveryAddress = {
  id: string;
  user_id: string;
  label: string | null;
  district: string;
  upazila: string | null;
  address: string;
  created_at: string;
};

export type DeliveryAddressInput = {
  label?: string | null;
  district: string;
  upazila?: string | null;
  address: string;
};

/** Format for orders.city / orders.delivery_address snapshot */
export function toOrderDeliverySnapshot(parts: {
  district: string;
  upazila?: string | null;
  address: string;
}) {
  const city = parts.district.trim();
  const delivery_address = [parts.upazila?.trim(), parts.address.trim()]
    .filter(Boolean)
    .join(", ");
  return { city, delivery_address };
}

export function formatDeliveryAddressLine(parts: {
  district?: string | null;
  upazila?: string | null;
  address?: string | null;
}) {
  return [parts.address, parts.upazila, parts.district]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(", ");
}

/** @param _userId ignored — ownership comes from JWT */
export async function listDeliveryAddresses(_userId?: string) {
  const res = await apiRequest<{ addresses: DeliveryAddress[] }>(
    "/delivery-addresses"
  );
  return res.addresses ?? [];
}

export async function createDeliveryAddress(
  _userId: string | undefined,
  input: DeliveryAddressInput
) {
  const res = await apiRequest<{ address: DeliveryAddress }>(
    "/delivery-addresses",
    {
      method: "POST",
      body: {
        label: input.label?.trim() || null,
        district: input.district.trim(),
        upazila: input.upazila?.trim() || null,
        address: input.address.trim(),
      },
    }
  );
  return res.address;
}

export async function updateDeliveryAddress(
  id: string,
  _userId: string | undefined,
  input: DeliveryAddressInput
) {
  const res = await apiRequest<{ address: DeliveryAddress }>(
    `/delivery-addresses/${id}`,
    {
      method: "PATCH",
      body: {
        label: input.label?.trim() || null,
        district: input.district.trim(),
        upazila: input.upazila?.trim() || null,
        address: input.address.trim(),
      },
    }
  );
  return res.address;
}

export async function deleteDeliveryAddress(
  id: string,
  _userId?: string
) {
  await apiRequest(`/delivery-addresses/${id}`, { method: "DELETE" });
}

/** Pass null to clear default (fall back to store address). */
export async function setDefaultDeliveryAddress(
  _userId: string | undefined,
  addressId: string | null
) {
  await apiRequest("/delivery-addresses/default", {
    method: "POST",
    body: { addressId },
  });
}
