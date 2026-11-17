import {
  CourierArea,
  CourierCity,
  CourierLocation,
  CourierZone,
  fetchCourierAreas,
  fetchCourierCities,
  fetchCourierZones,
} from '@/lib/courier'
import { Picker } from '@react-native-picker/picker'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/** Pathao city → zone → area pickers. `mode="pickup"` hides areas without pickup. */
export default function CourierLocationPickers({
  value,
  onChange,
  mode = 'delivery',
  requireArea = false,
}: {
  value: CourierLocation
  onChange: (next: CourierLocation) => void
  mode?: 'delivery' | 'pickup'
  requireArea?: boolean
}) {
  const [cities, setCities] = useState<CourierCity[]>([])
  // Lists remember which parent they belong to so stale lists never show.
  const [zonesFor, setZonesFor] = useState<{ cityId: number; list: CourierZone[] } | null>(null)
  const [areasFor, setAreasFor] = useState<{ zoneId: number; list: CourierArea[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourierCities()
      .then(setCities)
      .catch(() => setError('শহরের তালিকা লোড করা যায়নি।'))
  }, [])

  useEffect(() => {
    const cityId = value.city_id
    if (!cityId) return
    let cancelled = false
    fetchCourierZones(cityId)
      .then((list) => !cancelled && setZonesFor({ cityId, list }))
      .catch(() => !cancelled && setError('জোনের তালিকা লোড করা যায়নি।'))
    return () => {
      cancelled = true
    }
  }, [value.city_id])

  useEffect(() => {
    const zoneId = value.zone_id
    if (!zoneId) return
    let cancelled = false
    fetchCourierAreas(zoneId)
      .then((rows) => {
        if (cancelled) return
        setAreasFor({
          zoneId,
          list: rows.filter((a) => (mode === 'pickup' ? a.pickup_available : a.home_delivery_available)),
        })
      })
      .catch(() => !cancelled && setError('এরিয়ার তালিকা লোড করা যায়নি।'))
    return () => {
      cancelled = true
    }
  }, [value.zone_id, mode])

  const zones = zonesFor && zonesFor.cityId === value.city_id ? zonesFor.list : []
  const areas = areasFor && areasFor.zoneId === value.zone_id ? areasFor.list : []
  const num = (v: unknown) => (v ? Number(v) : null)

  return (
    <View>
      <View style={s.pickerWrap}>
        <Picker
          selectedValue={value.city_id ?? ''}
          onValueChange={(v) => onChange({ city_id: num(v), zone_id: null, area_id: null })}
          style={s.picker}
        >
          <Picker.Item label="শহর বাছাই করুন *" value="" color="#9CA3AF" />
          {cities.map((c) => (
            <Picker.Item key={c.city_id} label={c.city_name} value={c.city_id} />
          ))}
        </Picker>
      </View>
      <View style={s.pickerWrap}>
        <Picker
          selectedValue={value.zone_id ?? ''}
          enabled={!!value.city_id}
          onValueChange={(v) => onChange({ ...value, zone_id: num(v), area_id: null })}
          style={s.picker}
        >
          <Picker.Item label="জোন / থানা বাছাই করুন *" value="" color="#9CA3AF" />
          {zones.map((z) => (
            <Picker.Item key={z.zone_id} label={z.zone_name} value={z.zone_id} />
          ))}
        </Picker>
      </View>
      <View style={s.pickerWrap}>
        <Picker
          selectedValue={value.area_id ?? ''}
          enabled={!!value.zone_id}
          onValueChange={(v) => onChange({ ...value, area_id: num(v) })}
          style={s.picker}
        >
          <Picker.Item
            label={requireArea ? 'এরিয়া বাছাই করুন *' : 'এরিয়া (ঐচ্ছিক)'}
            value=""
            color="#9CA3AF"
          />
          {areas.map((a) => (
            <Picker.Item key={a.area_id} label={a.area_name} value={a.area_id} />
          ))}
        </Picker>
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  )
}

const s = StyleSheet.create({
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: { height: 52 },
  error: { color: '#B42318', fontSize: 12, marginBottom: 8 },
})
