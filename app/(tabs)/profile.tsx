import ConfirmModal from '@/components/modal/ConfirmModal'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import { type Href, useNavigation, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native'

const APPEAL_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScGFD5Rbyao72nTABzxEuQd8UVU97W5CP2eHwnQEeBsG_oLrw/viewform?usp=dialog'

/* ================= INCOMPLETE PROFILE SCREEN ================= */

const DISTRICTS = ['Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga', 'Cumilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon']
const UPAZILA = [
    { district: 'Bagerhat', upazila: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
    { district: 'Bandarban', upazila: ['Ali Kadam', 'Bandarban Sadar', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'] },
    { district: 'Barguna', upazila: ['Amtali', 'Bamna', 'Barguna Sadar', 'Betagi', 'Patharghata', 'Taltali'] },
    { district: 'Barishal', upazila: ['Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Barishal Sadar', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur', 'Airport Thana', 'Kotwali Thana', 'Kawnia Thana', 'Bandar Thana'] },
    { district: 'Bhola', upazila: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
    { district: 'Bogra', upazila: ['Adamdighi', 'Bogra Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatola'] },
    { district: 'Brahmanbaria', upazila: ['Akhaura', 'Ashuganj', 'Bancharampur', 'Brahmanbaria Sadar', 'Bijoynagar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'] },
    { district: 'Chandpur', upazila: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'] },
    { district: 'Chapainawabganj', upazila: ['Bholahat', 'Gomastapur', 'Nachole', 'Nawabganj Sadar', 'Shibganj'] },
    { district: 'Chattogram', upazila: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Karnaphuli', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda', 'Akbarshah Thana', 'Bakalia Thana', 'Bayazid Thana', 'Chandgaon Thana', 'Double Mooring Thana', 'EPZ Thana', 'Halishahar Thana', 'Khulshi Thana', 'Kotwali Thana', 'Pahartali Thana', 'Panchlaish Thana', 'Patenga Thana'] },
    { district: 'Chuadanga', upazila: ['Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jibannagar'] },
    { district: 'Cumilla', upazila: ['Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Cumilla Adarsha Sadar', 'Cumilla Sadar Dakshin', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Lalmai', 'Meghna', 'Monohargonj', 'Muradnagar', 'Nangalkot', 'Titas'] },
    { district: 'Cox\'s Bazar', upazila: ['Chakaria', 'Cox\'s Bazar Sadar', 'Eidgaon', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'] },
    { district: 'Dhaka', upazila: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar', 'Adabor Thana', 'Badda Thana', 'Banani Thana', 'Bangsal Thana', 'Cantonment Thana', 'Chalkbazar Thana', 'Dakshinkhan Thana', 'Darus Salam Thana', 'Demra Thana', 'Dhanmondi Thana', 'Gendaria Thana', 'Gulshan Thana', 'Hazaribagh Thana', 'Jatrabari Thana', 'Kadamtali Thana', 'Kafrul Thana', 'Kalabagan Thana', 'Kamrangirchar Thana', 'Khilgaon Thana', 'Khilkhet Thana', 'Kotwali Thana', 'Lalbagh Thana', 'Mirpur Thana', 'Mohammadpur Thana', 'Motijheel Thana', 'Mughda Thana', 'New Market Thana', 'Pallabi Thana', 'Paltan Thana', 'Ramna Thana', 'Rampura Thana', 'Sabujbagh Thana', 'Shah Ali Thana', 'Shahbagh Thana', 'Sher-e-Bangla Nagar Thana', 'Shyampur Thana', 'Sutrapur Thana', 'Tejgaon Thana', 'Tejgaon Industrial Area Thana', 'Turag Thana', 'Uttara East Thana', 'Uttara West Thana', 'Uttarkhan Thana', 'Vatara Thana', 'Wari Thana'] },
    { district: 'Dinajpur', upazila: ['Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Dinajpur Sadar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur', 'Phulbari'] },
    { district: 'Faridpur', upazila: ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'] },
    { district: 'Feni', upazila: ['Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Fulgazi', 'Parshuram', 'Sonagazi'] },
    { district: 'Gaibandha', upazila: ['Fullchhari', 'Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'] },
    { district: 'Gazipur', upazila: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Gacha Thana', 'Pubail Thana', 'Konabari Thana', 'Basan Thana', 'Tongi East Thana', 'Tongi West Thana'] },
    { district: 'Gopalganj', upazila: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
    { district: 'Habiganj', upazila: ['Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj'] },
    { district: 'Jamalpur', upazila: ['Baksiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj', 'Melandaha', 'Sarishabari'] },
    { district: 'Jessore', upazila: ['Abhaynagar', 'Bagherpara', 'Chougacha', 'Jessore Sadar', 'Jhikargacha', 'Keshabpur', 'Manirampur', 'Sharsha'] },
    { district: 'Jhalokati', upazila: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },
    { district: 'Jhenaidah', upazila: ['Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
    { district: 'Joypurhat', upazila: ['Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'] },
    { district: 'Khagrachari', upazila: ['Dighinala', 'Guimara', 'Khagrachari Sadar', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'] },
    { district: 'Khulna', upazila: ['Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgacha', 'Phultala', 'Rupsha', 'Terokhada', 'Daulatpur Thana', 'Khalishpur Thana', 'Khan Jahan Ali Thana', 'Khulna Sadar Thana', 'Sonadanga Thana', 'Harintana Thana'] },
    { district: 'Kishoreganj', upazila: ['Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kishoreganj Sadar', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'] },
    { district: 'Kurigram', upazila: ['Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Kurigram Sadar', 'Nageshwari', 'Phulbari', 'Rajarhat', 'Raumari', 'Ulipur'] },
    { district: 'Kushtia', upazila: ['Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar', 'Mirpur'] },
    { district: 'Lakshmipur', upazila: ['Kamalnagar', 'Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati'] },
    { district: 'Lalmonirhat', upazila: ['Aditmari', 'Hatibandha', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram'] },
    { district: 'Madaripur', upazila: ['Dasar', 'Kalkini', 'Madaripur Sadar', 'Rajoir', 'Shibchar'] },
    { district: 'Magura', upazila: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'] },
    { district: 'Manikganj', upazila: ['Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia', 'Shivalaya', 'Singair'] },
    { district: 'Meherpur', upazila: ['Gangni', 'Meherpur Sadar', 'Mujibnagar'] },
    { district: 'Moulvibazar', upazila: ['Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar', 'Rajnagar', 'Sreemangal'] },
    { district: 'Munshiganj', upazila: ['Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Sreenagar', 'Tongibari'] },
    { district: 'Mymensingh', upazila: ['Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Mymensingh Sadar', 'Muktagacha', 'Nandail', 'Phulpur', 'Tarakanda', 'Trishal'] },
    { district: 'Naogaon', upazila: ['Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mahadebpur', 'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'] },
    { district: 'Narail', upazila: ['Kalia', 'Lohagara', 'Narail Sadar'] },
    { district: 'Narayanganj', upazila: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon', 'Siddhirganj Thana', 'Fatullah Thana'] },
    { district: 'Narsingdi', upazila: ['Belabo', 'Monohardi', 'Narsingdi Sadar', 'Palash', 'Raipura', 'Shibpur'] },
    { district: 'Natore', upazila: ['Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Naldanga', 'Natore Sadar', 'Singra'] },
    { district: 'Netrokona', upazila: ['Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Kendua', 'Khaliajuri', 'Madan', 'Mohanganj', 'Netrokona Sadar', 'Purbadhala'] },
    { district: 'Nilphamari', upazila: ['Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Nilphamari Sadar', 'Saidpur'] },
    { district: 'Noakhali', upazila: ['Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Kabirhat', 'Noakhali Sadar', 'Senbagh', 'Sonaimuri', 'Subarnachar'] },
    { district: 'Pabna', upazila: ['Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Pabna Sadar', 'Santhia', 'Sujanagar'] },
    { district: 'Panchagarh', upazila: ['Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tetulia'] },
    { district: 'Patuakhali', upazila: ['Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Patuakhali Sadar', 'Rangabali'] },
    { district: 'Pirojpur', upazila: ['Bhandaria', 'Indurkani', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkati)', 'Pirojpur Sadar'] },
    { district: 'Rajbari', upazila: ['Baliakandi', 'Goalanda', 'Kalukhali', 'Pangsha', 'Rajbari Sadar'] },
    { district: 'Rajshahi', upazila: ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore', 'Boalia Thana', 'Motihar Thana', 'Rajpari Thana', 'Shah Makdum Thana'] },
    { district: 'Rangamati', upazila: ['Bagaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniyachar', 'Rajasthali', 'Rangamati Sadar'] },
    { district: 'Rangpur', upazila: ['Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Rangpur Sadar', 'Taraganj', 'Kotwali Thana', 'Parshuram Thana', 'Haragach Thana'] },
    { district: 'Satkhira', upazila: ['Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar', 'Shyamnagar', 'Tala'] },
    { district: 'Shariatpur', upazila: ['Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar', 'Zajira'] },
    { district: 'Sherpur', upazila: ['Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi'] },
    { district: 'Sirajganj', upazila: ['Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullahpara'] },
    { district: 'Sunamganj', upazila: ['Bishwamarpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Madhyanagar', 'Shantiganj', 'Sullah', 'Sunamganj Sadar', 'Tahirpur'] },
    { district: 'Sylhet', upazila: ['Balaganj', 'Beanibazar', 'Bishwanath', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'South Surma', 'Sylhet Sadar', 'Zakiganj', 'Companiganj', 'Shahparan Thana', 'Moglabazar Thana', 'Airport Thana'] },
    { district: 'Tangail', upazila: ['Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar'] },
    { district: 'Thakurgaon', upazila: ['Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar'] }
];

const IncompleteProfile = ({ onSaved }: { onSaved: () => void }) => {
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        store_name: '',
        store_type: 'retail' as 'wholesale' | 'retail',
        address: '',
        district: '',
        upazila: '',
    })

    const availableUpazilas = useMemo(() => {
        const districtObj = UPAZILA.find(d => d.district === form.district)
        return districtObj ? districtObj.upazila : []
    }, [form.district])

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const handleDistrict = (value: string) => {
        setForm(prev => ({ ...prev, district: value, upazila: '' }))
    }

    const handleSave = async () => {
        const { full_name, phone, store_name, store_type, address, district, upazila } = form

        if (!full_name || !phone || !store_name || !address || !district || !upazila) {
            Alert.alert('Missing Info', 'Please fill all required fields')
            return
        }

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name,
                    phone,
                    store_name,
                    store_type,
                    address,
                    district,
                    upazila,
                })
                .eq('id', user.id)

            if (error) throw error

            Alert.alert('Success', 'Profile completed!')
            onSaved()
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save profile')
        } finally {
            setSaving(false)
        }
    }

    const inputStyle = {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 14,
    }

    const pickerStyle = {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 14,
        marginBottom: 10,
    }

    return (
        <ScrollView style={{ flex: 1, padding: 20, paddingTop: 50, }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 6 }}>
                Complete Your Profile
            </Text>
            <Text style={{ color: '#888', marginBottom: 20 }}>
                Your profile setup was incomplete. Please fill in the details below to continue.
            </Text>

            <TextInput
                placeholder="Full Name *"
                value={form.full_name}
                onChangeText={v => handleChange('full_name', v)}
                style={inputStyle}
            />
            <TextInput
                placeholder="Phone *"
                value={form.phone}
                onChangeText={v => handleChange('phone', v)}
                style={inputStyle}
                keyboardType="phone-pad"
            />
            <TextInput
                placeholder="Store Name *"
                value={form.store_name}
                onChangeText={v => handleChange('store_name', v)}
                style={inputStyle}
            />

            {/* STORE TYPE */}
            <View style={pickerStyle}>
                <Picker
                    selectedValue={form.store_type}
                    onValueChange={v => handleChange('store_type', v)}
                >
                    <Picker.Item label="Retail" value="retail" />
                    <Picker.Item label="Wholesale" value="wholesale" />
                </Picker>
            </View>

            <TextInput
                placeholder="Address *"
                value={form.address}
                onChangeText={v => handleChange('address', v)}
                style={inputStyle}
            />

            {/* DISTRICT */}
            <View style={pickerStyle}>
                <Picker
                    selectedValue={form.district}
                    onValueChange={handleDistrict}
                >
                    <Picker.Item label="Select District *" value="" />
                    {DISTRICTS.map(d => (
                        <Picker.Item key={d} label={d} value={d} />
                    ))}
                </Picker>
            </View>

            {/* UPAZILA */}
            <View style={[pickerStyle, !form.district && { opacity: 0.4 }]}>
                <Picker
                    selectedValue={form.upazila}
                    onValueChange={v => handleChange('upazila', v)}
                    enabled={!!form.district}
                >
                    <Picker.Item label="Select Upazila *" value="" />
                    {availableUpazilas.map(u => (
                        <Picker.Item key={u} label={u} value={u} />
                    ))}
                </Picker>
            </View>

            <Pressable
                onPress={handleSave}
                disabled={saving}
                style={{
                    backgroundColor: saving ? '#ccc' : '#f5832b',
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center' as const,
                    marginTop: 10,
                    marginBottom: 40,
                }}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Save & Continue</Text>
                )}
            </Pressable>
        </ScrollView>
    )
}

/* ================= HELPERS ================= */

const isProfileComplete = (profile: any): boolean => {
    return !!(
        profile.full_name &&
        profile.phone &&
        profile.store_name &&
        profile.store_type &&
        profile.address &&
        profile.district &&
        profile.upazila
    )
}

/* ================= MAIN PROFILE SCREEN ================= */

const Profile = () => {
    const navigation = useNavigation()
    const router = useRouter()

    const { profile, loading, updateName, refetch } = useProfile()
    const { signOut } = useAuth()

    const [editMode, setEditMode] = useState(false)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState('')

    const [showCloseModal, setShowCloseModal] = useState(false)
    const [showSignoutModal, setShowSignoutModal] = useState(false)

    const [localImage, setLocalImage] = useState<string | null>(null)

    // 🔹 LOADING STATE
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    // 🔹 SAFETY CHECK
    if (!profile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Failed to load profile</Text>
            </View>
        )
    }

    // 🔹 INCOMPLETE PROFILE — show completion screen instead
    if (!isProfileComplete(profile)) {
        return <IncompleteProfile onSaved={refetch} />
    }

    const isSeller = profile.store_type === 'wholesale'
    const isBuyer = profile.store_type === 'retail'

    const handleSave = async () => {
        if (!name.trim() || saving) return
        try {
            setSaving(true)
            await updateName(name)
            setEditMode(false)
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        if (saving) return
        setName(profile.full_name)
        setEditMode(false)
    }

    const uploadAvatar = async (uri: string) => {
        try {
            setSaving(true)

            const userId = profile.id
            const filePath = `${userId}.jpg`

            // 🔹 Convert to ArrayBuffer (same as signup)
            const response = await fetch(uri)
            const arrayBuffer = await response.arrayBuffer()

            // 🔹 Upload (overwrite old image)
            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(filePath, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                })

            if (uploadError) throw uploadError

            // 🔹 Get public URL
            const { data } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath)

            const publicUrl = `${data.publicUrl}?t=${Date.now()}`

            // 🔹 Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId)

            if (updateError) throw updateError

            // 🔹 Refresh UI
            await refetch()
        } catch (err) {
            if (__DEV__) {
                console.error('Avatar update failed:', err)
            }
            alert('Failed to update profile image')
        } finally {
            setSaving(false)
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        })

        if (!result.canceled) {
            const uri = result.assets[0].uri

            setLocalImage(uri)
            setSaving(true)

            await uploadAvatar(uri)

            await refetch()
            setLocalImage(null)
        }
    }

    const handleSignout = async () => {
        await signOut()
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 🔹 USER CARD */}
                <View style={styles.userCard}>
                    <Pressable onPress={pickImage}>
                        <View style={styles.avatarWrapper}>
                            {
                                localImage ? (
                                    <Image
                                        source={{ uri: localImage }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : profile.avatar_url ? (
                                    <Image
                                        key={profile.avatar_url} // 🔥 important for refresh
                                        source={{ uri: profile.avatar_url }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Image
                                        source={require('@/assets/images/icons/default-avatar.png')}
                                        style={{ width: '60%', height: '60%', objectFit: 'contain' }}
                                    />
                                )
                            }

                            {/* 🔥 loading overlay */}
                            {saving && (
                                <View style={styles.avatarOverlay}>
                                    <ActivityIndicator color="#fff" />
                                </View>
                            )}
                        </View>
                    </Pressable>

                    {!editMode ? (
                        <>
                            <Text style={styles.name}>{profile.full_name}</Text>
                            <Text style={styles.email}>{profile.email}</Text>
                            <Pressable
                                style={styles.editBtn}
                                onPress={() => {
                                    setName(profile.full_name)
                                    setEditMode(true)
                                }}
                            >
                                <Text style={styles.editText}>Edit Name</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                placeholder="Your name"
                            />
                            <View style={styles.editActions}>
                                <Pressable
                                    style={styles.cancelEditBtn}
                                    onPress={handleCancelEdit}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelEditText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveText}>Save</Text>
                                    )}
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>

                {/* 🔹 MAIN ACTIONS */}
                <View style={styles.section}>
                    <ProfileLink title="My Account" link="/account" />
                </View>

                <View style={styles.section}>
                    {isSeller && <ProductUpComp title="Upload Product" />}
                    {isSeller && <ProfileLink title="Sales Orders" link="/sales" />}
                    {isBuyer && <ProfileLink title="My Orders" link="/orders" />}
                </View>

                {/* 🔹 GENERAL SETTINGS */}
                <View style={styles.section}>
                    <ProfileLink title="Privacy Policy" link="/privacyPolicy" />
                    <ProfileLink title="Terms & Conditions" link="/termsAndConditions" />
                    <ProfileLink title="About App" link="/aboutApp" />
                    <ProfileLink title="Support" link="/support" />

                    <Pressable
                        style={styles.linkRow}
                        onPress={() => setShowSignoutModal(true)}
                    >
                        <Text style={styles.linkText}>Logout</Text>
                        <Image
                            source={require('@/assets/images/icons/chevron-right.png')}
                            style={styles.linkIcon}
                        />
                    </Pressable>
                </View>

                {/* 🔹 CLOSE ACCOUNT */}
                <View style={styles.section}>
                    <Pressable
                        style={styles.dangerBtn}
                        onPress={() => setShowCloseModal(true)}
                    >
                        <Text style={styles.dangerText}>Request Account Deletion</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* 🔹 MODALS */}
            <ConfirmModal
                visible={showCloseModal}
                title="Close Account"
                description="Are you sure you want to close your account? You will be redirected to submit an appeal request."
                confirmText="Proceed"
                cancelText="Cancel"
                danger
                onCancel={() => setShowCloseModal(false)}
                onConfirm={() => {
                    setShowCloseModal(false)
                    Linking.openURL(APPEAL_URL)
                }}
            />

            <ConfirmModal
                visible={showSignoutModal}
                title="Sign out"
                description="Are you sure you want to sign out of your account?"
                confirmText="Sign out"
                cancelText="Cancel"
                onCancel={() => setShowSignoutModal(false)}
                onConfirm={() => {
                    setShowSignoutModal(false)
                    handleSignout()
                }}
            />
        </View>
    )
}

/* ================= SUB COMPONENTS ================= */

const ProductUpComp = ({ title }: { title: string }) => {
    const router = useRouter()
    return (
        <Pressable style={styles.linkRow} onPress={() => router.push('/productUpload')}>
            <Text style={styles.linkText}>{title}</Text>
            <Image
                source={require('@/assets/images/icons/plus.png')}
                style={styles.linkIcon}
            />
        </Pressable>
    )
}

const ProfileLink = ({ title, link }: { title: string; link: Href }) => {
    const router = useRouter()
    return (
        <Pressable style={styles.linkRow} onPress={() => router.push(link)}>
            <Text style={styles.linkText}>{title}</Text>
            <Image
                source={require('@/assets/images/icons/chevron-right.png')}
                style={styles.linkIcon}
            />
        </Pressable>
    )
}

export default Profile