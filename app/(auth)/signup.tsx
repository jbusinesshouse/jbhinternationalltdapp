import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'


const DISTRICTS = ['Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga', 'Cumilla', 'Cox\'s Bazar', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'];
const UPAZILA = [
    { district: 'Bagerhat', upazila: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
    { district: 'Bandarban', upazila: ['Ali Kadam', 'Bandarban Sadar', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'] },
    { district: 'Barguna', upazila: ['Amtali', 'Bamna', 'Barguna Sadar', 'Betagi', 'Patharghata', 'Taltali'] },
    { district: 'Barishal', upazila: ['Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Barishal Sadar', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'] },
    { district: 'Bhola', upazila: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
    { district: 'Bogra', upazila: ['Adamdighi', 'Bogra Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatola'] },
    { district: 'Brahmanbaria', upazila: ['Akhaura', 'Ashuganj', 'Bancharampur', 'Brahmanbaria Sadar', 'Bijoynagar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'] },
    { district: 'Chandpur', upazila: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'] },
    { district: 'Chapainawabganj', upazila: ['Bholahat', 'Gomastapur', 'Nachole', 'Nawabganj Sadar', 'Shibganj'] },
    { district: 'Chattogram', upazila: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Karnaphuli', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'] },
    { district: 'Chuadanga', upazila: ['Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jibannagar'] },
    { district: 'Cumilla', upazila: ['Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Cumilla Adarsha Sadar', 'Cumilla Sadar Dakshin', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Lalmai', 'Meghna', 'Monohargonj', 'Muradnagar', 'Nangalkot', 'Titas'] },
    { district: 'Cox\'s Bazar', upazila: ['Chakaria', 'Cox\'s Bazar Sadar', 'Eidgaon', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'] },
    { district: 'Dhaka', upazila: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar'] },
    { district: 'Dinajpur', upazila: ['Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Dinajpur Sadar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur', 'Phulbari'] },
    { district: 'Faridpur', upazila: ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'] },
    { district: 'Feni', upazila: ['Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Fulgazi', 'Parshuram', 'Sonagazi'] },
    { district: 'Gaibandha', upazila: ['Fullchhari', 'Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'] },
    { district: 'Gazipur', upazila: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'] },
    { district: 'Gopalganj', upazila: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
    { district: 'Habiganj', upazila: ['Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj'] },
    { district: 'Jamalpur', upazila: ['Baksiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj', 'Melandaha', 'Sarishabari'] },
    { district: 'Jessore', upazila: ['Abhaynagar', 'Bagherpara', 'Chougacha', 'Jessore Sadar', 'Jhikargacha', 'Keshabpur', 'Manirampur', 'Sharsha'] },
    { district: 'Jhalokati', upazila: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },
    { district: 'Jhenaidah', upazila: ['Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
    { district: 'Joypurhat', upazila: ['Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'] },
    { district: 'Khagrachari', upazila: ['Dighinala', 'Guimara', 'Khagrachari Sadar', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'] },
    { district: 'Khulna', upazila: ['Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgacha', 'Phultala', 'Rupsha', 'Terokhada'] },
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
    { district: 'Narayanganj', upazila: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'] },
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
    { district: 'Rajshahi', upazila: ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'] },
    { district: 'Rangamati', upazila: ['Bagaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniyachar', 'Rajasthali', 'Rangamati Sadar'] },
    { district: 'Rangpur', upazila: ['Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Rangpur Sadar', 'Taraganj'] },
    { district: 'Satkhira', upazila: ['Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar', 'Shyamnagar', 'Tala'] },
    { district: 'Shariatpur', upazila: ['Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar', 'Zajira'] },
    { district: 'Sherpur', upazila: ['Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi'] },
    { district: 'Sirajganj', upazila: ['Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullahpara'] },
    { district: 'Sunamganj', upazila: ['Bishwamarpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Madhyanagar', 'Shantiganj', 'Sullah', 'Sunamganj Sadar', 'Tahirpur'] },
    { district: 'Sylhet', upazila: ['Balaganj', 'Beanibazar', 'Bishwanath', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'South Surma', 'Sylhet Sadar', 'Zakiganj', 'Companiganj'] },
    { district: 'Tangail', upazila: ['Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar'] },
    { district: 'Thakurgaon', upazila: ['Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar'] }
];


const Signup = () => {
    const [loading, setLoading] = useState(false)

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [storeName, setStoreName] = useState('')
    const [storeType, setStoreType] = useState<'wholesale' | 'retail'>('retail')
    const [address, setAddress] = useState('')
    const [district, setDistrict] = useState('')
    // const []
    // const [upazila, setUpazila] = useState([])
    const [selectedUpazila, setSelectedUpazila] = useState('')
    const [image, setImage] = useState<string | null>(null)

    const { setIsSettingUp } = useAuth();


    // ---- PICK IMAGE ----
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    // ---- URI → BLOB ----
    const uriToBlob = async (uri: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.onload = function () {
                resolve(xhr.response)
            }
            xhr.onerror = function () {
                reject(new Error('uriToBlob failed'))
            }
            xhr.responseType = 'blob'
            xhr.open('GET', uri, true)
            xhr.send(null)
        })
    }

    // FILTERING UPAZILA BASED ON DISTRICT
    const availableUpazilas = useMemo(() => {
        const districtObj = UPAZILA.find(d => d.district === district);
        return districtObj ? districtObj.upazila : [];
    }, [district]);

    const handleDistrict = (value: string) => {
        setDistrict(value)
        setSelectedUpazila('')
    }

    // ---- SIGNUP ----
    const handleSignup = async () => {
        if (
            !fullName ||
            !email ||
            !phone ||
            !password ||
            !storeName ||
            !address ||
            !district ||
            !selectedUpazila
        ) {
            Alert.alert('Error', 'All required fields must be filled')
            return
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match')
            return
        }

        try {
            setLoading(true)
            setIsSettingUp(true);

            // Sign up the user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            console.log('Signup response:', { data, error })

            if (error) throw error
            if (!data.user) throw new Error('User not created')

            const userId = data.user.id
            console.log('User ID:', userId)

            let avatarUrl = null

            // Try to upload image using ArrayBuffer instead of Blob
            if (image) {
                try {
                    // Fetch the image as arrayBuffer
                    const response = await fetch(image)
                    const arrayBuffer = await response.arrayBuffer()
                    const filePath = `${userId}.jpg`

                    console.log('Uploading image...')

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('profile-images')
                        .upload(filePath, arrayBuffer, {
                            contentType: 'image/jpeg',
                            upsert: true,
                        })

                    console.log('Upload result:', { uploadData, uploadError })

                    if (uploadError) {
                        console.error('Upload error:', uploadError)
                        // Don't throw - continue without image
                    } else {
                        const { data: publicData } = supabase.storage
                            .from('profile-images')
                            .getPublicUrl(filePath)
                        avatarUrl = publicData.publicUrl
                        console.log('Avatar URL:', avatarUrl)
                    }
                } catch (uploadErr) {
                    console.error('Image upload failed:', uploadErr)
                    // Continue without image
                }
            }


            // Insert profile (with or without avatar)
            console.log('Inserting profile...')
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: fullName,
                    phone,
                    store_name: storeName,
                    store_type: storeType,
                    address,
                    district: district,
                    upazila: selectedUpazila,
                    avatar_url: avatarUrl,
                })
                .select()

            console.log('Profile insert result:', { profileData, profileError })

            if (profileError) {
                console.error('Profile error:', JSON.stringify(profileError, null, 2))
                throw profileError
            }

            Alert.alert('Success', 'Account created successfully 🎉')
            setIsSettingUp(false);
            // setTimeout(() => {
            //     router.replace('/signin')
            // }, 1000);
        } catch (err: any) {
            console.error('Full signup error:', err)
            setIsSettingUp(false);
            Alert.alert('Signup failed', err.message || err.hint || 'Please try again later')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Create Account</Text>

                <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <Text style={styles.imageText}>Pick Profile Image</Text>
                    )}
                </TouchableOpacity>

                <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
                <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
                <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                <TextInput style={styles.input} placeholder="Store/Warehouse Name" value={storeName} onChangeText={setStoreName} />
                <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
                <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, marginBottom: 10 }}>
                    <Picker
                        selectedValue={district}
                        onValueChange={(value: string) => handleDistrict(value)}
                    >
                        <Picker.Item label="Select District" value="" />
                        {DISTRICTS.map((d) => (
                            <Picker.Item key={d} label={d} value={d} />
                        ))}
                    </Picker>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, marginBottom: 10 }}>
                    <Picker
                        selectedValue={selectedUpazila}
                        onValueChange={(value: string) => setSelectedUpazila(value)}
                    >
                        <Picker.Item label="Select Upazila" value="" />
                        {availableUpazilas.map((d) => (
                            <Picker.Item key={d} label={d} value={d} />
                        ))}
                    </Picker>
                </View>

                {/* Store Type Toggle */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, storeType === 'retail' && styles.activeToggle]}
                        onPress={() => setStoreType('retail')}
                    >
                        <Text style={[styles.toggleText, storeType === 'retail' && styles.activeStoreText]}>
                            Retail
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleBtn, storeType === 'wholesale' && styles.activeToggle]}
                        onPress={() => setStoreType('wholesale')}
                    >
                        <Text style={[styles.toggleText, storeType === 'wholesale' && styles.activeStoreText]}>
                            Wholesale
                        </Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/(auth)/signin')}
                >
                    <Text style={styles.secondaryButton}>
                        Already have an account? <Text style={styles.bold}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )

}

export default Signup

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 26,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
    },
    imageBox: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f2f2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageText: {
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
        fontSize: 15,
    },
    toggleRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    toggleBtn: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    activeToggle: {
        backgroundColor: '#000',
    },
    toggleText: {
        // color: '#000000',
        fontWeight: '600',
    },
    activeStoreText: {
        color: '#ffffff'
    },
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 32,
    },
    secondaryButton: {
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 15,
    },
    bold: {
        fontWeight: '600',
        color: '#000',
    },
})
