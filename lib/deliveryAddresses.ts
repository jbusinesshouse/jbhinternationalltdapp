import { supabase } from '@/lib/supabase'

export type DeliveryAddress = {
  id: string
  user_id: string
  label: string | null
  district: string
  upazila: string | null
  address: string
  created_at: string
}

export type DeliveryAddressInput = {
  label?: string | null
  district: string
  upazila?: string | null
  address: string
}

/** Format for orders.city / orders.delivery_address snapshot */
export function toOrderDeliverySnapshot(parts: {
  district: string
  upazila?: string | null
  address: string
}) {
  const city = parts.district.trim()
  const delivery_address = [parts.upazila?.trim(), parts.address.trim()]
    .filter(Boolean)
    .join(', ')
  return { city, delivery_address }
}

export function formatDeliveryAddressLine(parts: {
  district?: string | null
  upazila?: string | null
  address?: string | null
}) {
  return [parts.address, parts.upazila, parts.district]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(', ')
}

export async function listDeliveryAddresses(userId: string) {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as DeliveryAddress[]
}

export async function createDeliveryAddress(
  userId: string,
  input: DeliveryAddressInput
) {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .insert({
      user_id: userId,
      label: input.label?.trim() || null,
      district: input.district.trim(),
      upazila: input.upazila?.trim() || null,
      address: input.address.trim(),
    })
    .select('*')
    .single()

  if (error) throw error
  return data as DeliveryAddress
}

export async function updateDeliveryAddress(
  id: string,
  userId: string,
  input: DeliveryAddressInput
) {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .update({
      label: input.label?.trim() || null,
      district: input.district.trim(),
      upazila: input.upazila?.trim() || null,
      address: input.address.trim(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data as DeliveryAddress
}

export async function deleteDeliveryAddress(id: string, userId: string) {
  const { error } = await supabase
    .from('delivery_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

/** Pass null to default to the user's store address. */
export async function setDefaultDeliveryAddress(
  userId: string,
  addressId: string | null
) {
  const { error } = await supabase
    .from('profiles')
    .update({ default_delivery_address_id: addressId })
    .eq('id', userId)

  if (error) throw error
}
