import { DISTRICTS, getUpazilasForDistrict } from '@/lib/bdLocations'
import { Picker } from '@react-native-picker/picker'
import React, { useMemo } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

export type AddressFormValues = {
  label: string
  district: string
  upazila: string
  address: string
}

type Props = {
  values: AddressFormValues
  onChange: (next: AddressFormValues) => void
  showLabel?: boolean
}

export const emptyAddressForm = (): AddressFormValues => ({
  label: '',
  district: '',
  upazila: '',
  address: '',
})

export default function DeliveryAddressFormFields({
  values,
  onChange,
  showLabel = true,
}: Props) {
  const upazilas = useMemo(
    () => getUpazilasForDistrict(values.district),
    [values.district]
  )

  const set = (key: keyof AddressFormValues, value: string) => {
    if (key === 'district') {
      onChange({ ...values, district: value, upazila: '' })
      return
    }
    onChange({ ...values, [key]: value })
  }

  return (
    <View>
      {showLabel ? (
        <TextInput
          placeholder="Label (optional) e.g. Home, Warehouse"
          placeholderTextColor="#9CA3AF"
          value={values.label}
          onChangeText={(v) => set('label', v)}
          style={s.input}
        />
      ) : null}

      <View style={s.pickerWrap}>
        <Picker
          selectedValue={values.district}
          onValueChange={(v) => set('district', v)}
          style={s.picker}
        >
          <Picker.Item label="Select district *" value="" color="#9CA3AF" />
          {DISTRICTS.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
      </View>

      <View style={s.pickerWrap}>
        <Picker
          selectedValue={values.upazila}
          onValueChange={(v) => set('upazila', v)}
          enabled={!!values.district}
          style={s.picker}
        >
          <Picker.Item label="Select upazila / thana" value="" color="#9CA3AF" />
          {upazilas.map((u) => (
            <Picker.Item key={u} label={u} value={u} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Street / detailed address *"
        placeholderTextColor="#9CA3AF"
        value={values.address}
        onChangeText={(v) => set('address', v)}
        style={[s.input, { height: 80, textAlignVertical: 'top' }]}
        multiline
      />

      {!values.district ? (
        <Text style={s.hint}>District is required.</Text>
      ) : null}
    </View>
  )
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  picker: {
    color: '#000000',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
})
