import ConfirmModal from '@/components/modal/ConfirmModal'
import DeliveryAddressFormFields, {
  AddressFormValues,
  emptyAddressForm,
} from '@/components/delivery/DeliveryAddressFormFields'
import {
  createDeliveryAddress,
  deleteDeliveryAddress,
  DeliveryAddress,
  formatDeliveryAddressLine,
  listDeliveryAddresses,
  setDefaultDeliveryAddress,
} from '@/lib/deliveryAddresses'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type ProfileLite = {
  id: string
  district?: string | null
  upazila?: string | null
  address?: string | null
  default_delivery_address_id?: string | null
}

type Props = {
  profile: ProfileLite
  onProfileDefaultChange?: (addressId: string | null) => void
}

export default function DeliveryAddressSection({
  profile,
  onProfileDefaultChange,
}: Props) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddressFormValues>(emptyAddressForm())
  const [defaultId, setDefaultId] = useState<string | null>(
    profile.default_delivery_address_id ?? null
  )
  const [deleteTarget, setDeleteTarget] = useState<DeliveryAddress | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await listDeliveryAddresses(profile.id)
      setAddresses(rows)
    } catch (e: any) {
      if (__DEV__) console.log(e)
      Alert.alert('Error', e?.message || 'Failed to load delivery addresses')
    } finally {
      setLoading(false)
    }
  }, [profile.id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setDefaultId(profile.default_delivery_address_id ?? null)
  }, [profile.default_delivery_address_id])

  const storeLine = formatDeliveryAddressLine({
    district: profile.district,
    upazila: profile.upazila,
    address: profile.address,
  })

  const handleSetDefaultStore = async () => {
    try {
      setSaving(true)
      await setDefaultDeliveryAddress(profile.id, null)
      setDefaultId(null)
      onProfileDefaultChange?.(null)
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update default')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefaultSaved = async (id: string) => {
    try {
      setSaving(true)
      await setDefaultDeliveryAddress(profile.id, id)
      setDefaultId(id)
      onProfileDefaultChange?.(id)
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update default')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!form.district.trim() || !form.address.trim()) {
      Alert.alert('Missing Info', 'District and address are required')
      return
    }
    try {
      setSaving(true)
      const created = await createDeliveryAddress(profile.id, form)
      setAddresses((prev) => [created, ...prev])
      setForm(emptyAddressForm())
      setShowForm(false)
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save address')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setSaving(true)
      await deleteDeliveryAddress(deleteTarget.id, profile.id)
      setAddresses((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      if (defaultId === deleteTarget.id) {
        setDefaultId(null)
        onProfileDefaultChange?.(null)
      }
      setDeleteTarget(null)
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not delete address')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={s.section}>
      <Text style={s.title}>Delivery Addresses</Text>
      <Text style={s.subtitle}>
        Choose where orders should be delivered. Your store address stays for
        your business profile.
      </Text>

      {/* Store as delivery option */}
      <View style={[s.card, defaultId == null && s.cardSelected]}>
        <View style={s.cardHead}>
          <Text style={s.cardLabel}>Store address</Text>
          {defaultId == null ? (
            <View style={s.defaultPill}>
              <Text style={s.defaultPillText}>Default</Text>
            </View>
          ) : null}
        </View>
        <Text style={s.cardBody}>{storeLine || 'No store address set'}</Text>
        {defaultId != null ? (
          <Pressable
            style={s.linkBtn}
            onPress={handleSetDefaultStore}
            disabled={saving}
          >
            <Text style={s.linkBtnText}>Set as default delivery</Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 16 }} />
      ) : (
        addresses.map((addr) => {
          const isDefault = defaultId === addr.id
          return (
            <View
              key={addr.id}
              style={[s.card, isDefault && s.cardSelected]}
            >
              <View style={s.cardHead}>
                <Text style={s.cardLabel}>
                  {addr.label?.trim() || 'Saved address'}
                </Text>
                {isDefault ? (
                  <View style={s.defaultPill}>
                    <Text style={s.defaultPillText}>Default</Text>
                  </View>
                ) : null}
              </View>
              <Text style={s.cardBody}>
                {formatDeliveryAddressLine(addr)}
              </Text>
              <View style={s.rowActions}>
                {!isDefault ? (
                  <Pressable
                    style={s.linkBtn}
                    onPress={() => handleSetDefaultSaved(addr.id)}
                    disabled={saving}
                  >
                    <Text style={s.linkBtnText}>Set as default</Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                <Pressable
                  style={s.dangerBtn}
                  onPress={() => setDeleteTarget(addr)}
                  disabled={saving}
                >
                  <Text style={s.dangerBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )
        })
      )}

      {showForm ? (
        <View style={s.formCard}>
          <Text style={s.formTitle}>New delivery address</Text>
          <DeliveryAddressFormFields values={form} onChange={setForm} />
          <View style={s.formActions}>
            <Pressable
              style={s.cancelBtn}
              onPress={() => {
                setShowForm(false)
                setForm(emptyAddressForm())
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
            <Pressable
              style={s.saveBtn}
              onPress={handleCreate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Save address</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={s.addBtn} onPress={() => setShowForm(true)}>
          <Text style={s.addBtnText}>+ Add delivery address</Text>
        </Pressable>
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete address?"
        description="This saved delivery address will be removed."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  )
}

const s = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  cardSelected: {
    borderColor: '#f5832b',
    backgroundColor: '#fff7ed',
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  cardBody: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 19,
  },
  defaultPill: {
    backgroundColor: '#f5832b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  defaultPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  linkBtn: {
    paddingVertical: 4,
  },
  linkBtnText: {
    color: '#f5832b',
    fontWeight: '600',
    fontSize: 13,
  },
  dangerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dangerBtnText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: '#f5832b',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    color: '#f5832b',
    fontWeight: '600',
  },
  formCard: {
    marginTop: 4,
    paddingTop: 4,
  },
  formTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5832b',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
})
