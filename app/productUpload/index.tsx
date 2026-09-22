import RichTextEditor from '@/components/textEditor/RichTextEditor';
import { showAppAlert } from '@/context/AppAlertContext';
import { useUser } from '@/context/UserContext';
import {
    createProduct,
    fetchCategories as fetchCategoriesApi,
    fetchSizes as fetchSizesApi,
    fetchSubcategories,
} from '@/lib/catalogApi';
import {
    deleteLocalImageUris,
    formatImageProcessingError,
    formatUploadError,
    isPreparedImageUri,
    preparePickedProductImage,
    preparePickedProductImages,
} from '@/lib/pickedImage';
import {
    parsePositiveInt,
    parsePositiveNumber,
    plainTextFromHtml,
    removeProductStoragePaths,
    softDeleteProduct,
    uploadProductImage,
} from '@/lib/productMedia';
import { fetchSellerUploadEligibility } from '@/lib/sellerGuards';
import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/productUpload';
import Feather from '@expo/vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';

type SizeEntry = {
    size_id: string;
    label: string;
    stock: string;
}

type Variant = {
    color: string;
    sizes: SizeEntry[];
}

type DbSize = {
    id: string;
    label: string;
    category?: string | null;
}

type Category = {
    id: string;
    name: string;
}

type Subcategory = {
    id: string;
    name: string;
    category_id?: string;
}

const MAX_ADDITIONAL_IMAGES = 8;

const ProductUpload = () => {
    const { profile } = useUser();
    const navigation = useNavigation();
    const router = useRouter();
    const sizesRequestIdRef = useRef(0);

    const storeType = (profile as { store_type?: string } | null)?.store_type;
    const isWholesale = storeType === 'wholesale';
    const accountBlocked = !!(profile?.status && profile.status !== 'active');
    const canUseUploadForm = !!profile && isWholesale && !accountBlocked;

    const [availableSizes, setAvailableSizes] = useState<DbSize[]>([]);

    const [mainImage, setMainImage] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState<string | null>(null);
    const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
    const [category, setCategory] = useState('');
    const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
    const [price, setPrice] = useState('');
    const [moq, setMoq] = useState('');
    const [description, setDescription] = useState('');
    const [variants, setVariants] = useState<Variant[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pickingImages, setPickingImages] = useState(false);
    const localImageUrisRef = useRef<string[]>([]);

    useEffect(() => {
        if (!canUseUploadForm) return;
        loadCategories();
    }, [canUseUploadForm]);

    // Kick retailers / blocked accounts off this route (deep links still land here briefly).
    useEffect(() => {
        if (!profile) return;
        if (canUseUploadForm) return;
        const t = setTimeout(() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/profile');
        }, 1200);
        return () => clearTimeout(t);
    }, [profile, canUseUploadForm, router]);

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);
            const data = await fetchCategoriesApi();

            if (data.length > 0) {
                setCategories(data);
            } else {
                showAppAlert('নোটিশ', 'কোনো ক্যাটাগরি পাওয়া যায়নি। ডাটাবেসে ক্যাটাগরি যোগ করুন।');
            }
        } catch (error) {
            if (__DEV__) console.error('Exception fetching categories:', error);
            showAppAlert(
                'সমস্যা',
                formatUploadError(error, 'ক্যাটাগরি লোড করা যায়নি')
            );
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        if (!parentCategoryId) {
            setFilteredSubcategories([]);
            return;
        }

        let cancelled = false;

        const loadSubcategories = async () => {
            try {
                setLoadingSubcategories(true);
                const data = await fetchSubcategories(parentCategoryId);
                if (!cancelled) setFilteredSubcategories(data);
            } catch (error) {
                if (__DEV__) console.error('Exception fetching subcategories:', error);
                if (!cancelled) {
                    setFilteredSubcategories([]);
                    showAppAlert(
                        'সমস্যা',
                        formatUploadError(error, 'সাবক্যাটাগরি লোড করা যায়নি')
                    );
                }
            } finally {
                if (!cancelled) setLoadingSubcategories(false);
            }
        };

        loadSubcategories();
        return () => {
            cancelled = true;
        };
    }, [parentCategoryId]);

    useEffect(() => {
        localImageUrisRef.current = [mainImage, ...images].filter(
            (uri): uri is string => !!uri && isPreparedImageUri(uri)
        );
    }, [mainImage, images]);

    useEffect(() => {
        return () => {
            void deleteLocalImageUris(localImageUrisRef.current);
        };
    }, []);

    const pickMainImage = async () => {
        if (pickingImages || isSubmitting) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (result.canceled) return;

        setPickingImages(true);
        try {
            const prepared = await preparePickedProductImage(result.assets[0].uri);
            if (mainImage && isPreparedImageUri(mainImage)) {
                await deleteLocalImageUris([mainImage]);
            }
            setMainImage(prepared.uri);
        } catch (error) {
            showAppAlert('সমস্যা', formatImageProcessingError(error));
        } finally {
            setPickingImages(false);
        }
    };

    const pickAdditionalImages = async () => {
        if (pickingImages || isSubmitting) return;

        const remaining = MAX_ADDITIONAL_IMAGES - images.length;
        if (remaining <= 0) {
            showAppAlert('সীমা পূর্ণ', `আপনি সর্বোচ্চ ${MAX_ADDITIONAL_IMAGES}টি অতিরিক্ত ছবি যোগ করতে পারবেন।`);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.7,
            selectionLimit: remaining,
        });
        if (result.canceled) return;

        setPickingImages(true);
        try {
            const prepared = await preparePickedProductImages(
                result.assets.map((asset) => asset.uri)
            );
            setImages((prev) =>
                [...prev, ...prepared.map((image) => image.uri)].slice(0, MAX_ADDITIONAL_IMAGES)
            );
        } catch (error) {
            showAppAlert('সমস্যা', formatImageProcessingError(error));
        } finally {
            setPickingImages(false);
        }
    };

    const removeAdditionalImage = (index: number) => {
        const uri = images[index];
        if (uri && isPreparedImageUri(uri)) {
            void deleteLocalImageUris([uri]);
        }
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSelectCategory = (subcatId: string | null) => {
        setSubCategoryId(subcatId);
        const selected = filteredSubcategories.find(s => s.id === subcatId);
        setCategory(selected?.name || '');
    };

    const addColorVariant = () => {
        setVariants(prev => [...prev, { color: '', sizes: [] }]);
    };

    const removeColorVariant = (index: number) => {
        showAppAlert('ভ্যারিয়েন্ট ডিলিট করবেন?', 'এই রঙ ও এর সাইজগুলো ডিলিট হয়ে যাবে।', [
            { text: 'বাতিল', style: 'cancel' },
            { text: 'ডিলিট করুন', style: 'destructive', onPress: () => setVariants(prev => prev.filter((_, i) => i !== index)) }
        ]);
    };

    const toggleSizeSelection = (variantIndex: number, size: DbSize): void => {
        const updatedVariants = [...variants];
        const variant = updatedVariants[variantIndex];
        if (!variant) return;

        const exists = variant.sizes.find(s => s.size_id === size.id);
        if (exists) {
            variant.sizes = variant.sizes.filter(s => s.size_id !== size.id);
        } else {
            variant.sizes.push({
                size_id: size.id,
                label: size.label,
                stock: ''
            });
        }
        setVariants(updatedVariants);
    };

    const updateStock = (variantIndex: number, sizeIndex: number, stockValue: string) => {
        const newVariants = [...variants];
        newVariants[variantIndex].sizes[sizeIndex].stock = stockValue.replace(/[^0-9]/g, '');
        setVariants(newVariants);
    };

    useEffect(() => {
        if (!parentCategory) {
            setAvailableSizes([]);
            return;
        }

        const requestId = ++sizesRequestIdRef.current;

        const loadSizes = async (): Promise<void> => {
            try {
                const data = await fetchSizesApi(parentCategory.toLowerCase());
                if (requestId !== sizesRequestIdRef.current) return;
                setAvailableSizes(data as DbSize[]);
            } catch (error) {
                if (__DEV__) console.error(error);
                if (requestId !== sizesRequestIdRef.current) return;
                setAvailableSizes([]);
            }
        };

        loadSizes();
    }, [parentCategory]);

    const resetForm = () => {
        void deleteLocalImageUris([mainImage, ...images]);
        setMainImage(null);
        setImages([]);
        setName('');
        setParentCategory(null);
        setParentCategoryId(null);
        setCategory('');
        setSubCategoryId(null);
        setPrice('');
        setMoq('');
        setDescription('');
        setVariants([]);
        setAvailableSizes([]);
    };

    const validateForm = (): string | null => {
        if (!isWholesale) return 'শুধুমাত্র হোলসেল বিক্রেতারা প্রোডাক্ট আপলোড করতে পারবেন।';
        if (!profile) return 'প্রোফাইল লোড হচ্ছে। একটু পর আবার চেষ্টা করুন।';
        if (accountBlocked) {
            const statusBn =
                profile.status === 'freeze'
                    ? 'স্থগিত'
                    : profile.status === 'restricted'
                      ? 'সীমিত'
                      : profile.status;
            return `আপনার অ্যাকাউন্ট এখন ${statusBn}। প্রোডাক্ট আপলোড করা যাবে না।`;
        }
        if (!mainImage) return 'প্রধান ছবি আপলোড করুন।';
        if (!name.trim()) return 'প্রোডাক্টের নাম লিখুন।';
        if (!parentCategoryId) return 'মূল ক্যাটাগরি বাছুন।';
        if (!subCategoryId || !category.trim()) return 'নির্দিষ্ট ক্যাটাগরি বাছুন।';

        const parsedPrice = parsePositiveNumber(price);
        if (parsedPrice == null) return 'সঠিক দাম লিখুন।';

        const parsedMoq = parsePositiveInt(moq);
        if (parsedMoq == null) return 'সঠিক ন্যূনতম অর্ডার পরিমাণ (MOQ) লিখুন।';

        if (plainTextFromHtml(description).length === 0) {
            return 'প্রোডাক্টের বিবরণ লিখুন।';
        }
        if (variants.length === 0) return 'অন্তত একটি রঙের ভ্যারিয়েন্ট যোগ করুন।';

        const colorKeys = new Set<string>();
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            if (!variant.color.trim()) {
                return `ভ্যারিয়েন্ট ${i + 1} এর রঙের নাম লিখুন।`;
            }
            const colorKey = variant.color.trim().toLowerCase();
            if (colorKeys.has(colorKey)) {
                return 'একই রঙ দুবার দেওয়া যায় না। প্রতিটি রঙ আলাদা হতে হবে।';
            }
            colorKeys.add(colorKey);

            if (variant.sizes.length === 0) {
                return `${variant.color} এর জন্য অন্তত একটি সাইজ বাছুন।`;
            }
            for (let j = 0; j < variant.sizes.length; j++) {
                const size = variant.sizes[j];
                if (parsePositiveInt(size.stock) == null) {
                    return `${variant.color} - ${size.label} এর স্টক সঠিকভাবে লিখুন।`;
                }
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            showAppAlert('যাচাই ব্যর্থ', validationError);
            return;
        }

        setIsSubmitting(true);

        let createdProductId: string | null = null;
        const uploadedPaths: string[] = [];

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                showAppAlert('সাইন ইন প্রয়োজন', 'প্রোডাক্ট আপলোড করতে সাইন ইন করুন।');
                return;
            }

            // Fresh DB check — context can be stale or spoofed in a patched client.
            const eligibility = await fetchSellerUploadEligibility(userData.user.id);
            if (!eligibility.allowed) {
                showAppAlert('অনুমতি নেই', eligibility.reason || 'প্রোডাক্ট আপলোড করা যাবে না।');
                return;
            }

            const parsedPrice = parsePositiveNumber(price)!;
            const parsedMoq = parsePositiveInt(moq)!;

            // 1) Upload all images first (no product id required)
            const mainUpload = await uploadProductImage(mainImage!);
            uploadedPaths.push(mainUpload.path);

            const imagePayload: {
                image_url: string;
                is_main: boolean;
                sort_order: number;
            }[] = [
                {
                    image_url: mainUpload.publicUrl,
                    is_main: true,
                    sort_order: 0,
                },
            ];

            for (let i = 0; i < images.length; i++) {
                try {
                    const uploaded = await uploadProductImage(images[i]);
                    uploadedPaths.push(uploaded.path);
                    imagePayload.push({
                        image_url: uploaded.publicUrl,
                        is_main: false,
                        sort_order: i + 1,
                    });
                } catch (imgErr) {
                    const apiErr = imgErr as {
                        status?: number;
                        code?: string;
                        message?: string;
                    };
                    throw Object.assign(
                        new Error(
                            apiErr?.message ||
                                `Image ${i + 2} upload failed`
                        ),
                        {
                            status: apiErr?.status,
                            code: apiErr?.code || 'IMAGE_UPLOAD_FAILED',
                            message:
                                apiErr?.message ||
                                `অতিরিক্ত ছবি #${i + 2} আপলোড ব্যর্থ হয়েছে।`,
                        }
                    );
                }
            }

            const variantPayload = variants.map((variant) => ({
                color: variant.color.trim(),
                sizes: variant.sizes.map((size) => ({
                    size_id: size.size_id,
                    size: size.label,
                    stock: parsePositiveInt(size.stock)!,
                })),
            }));

            // 2) Create product with images + variants in one request
            const created = await createProduct({
                name: name.trim(),
                description: description.trim(),
                category_id: parentCategoryId,
                subcategory_id: subCategoryId,
                selected_category: category.trim(),
                price: parsedPrice,
                moq: parsedMoq,
                images: imagePayload,
                variants: variantPayload,
            });

            createdProductId = created.id;

            resetForm();
            showAppAlert(
                'সফল',
                'প্রোডাক্ট সফলভাবে আপলোড হয়েছে।',
                [{ text: 'ঠিক আছে', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            const apiErr = error as { status?: number; code?: string; message?: string };
            const detail = [
              apiErr?.code ? `code=${apiErr.code}` : null,
              apiErr?.status ? `status=${apiErr.status}` : null,
              apiErr?.message || (error instanceof Error ? error.message : null),
              `images=${1 + images.length}`,
              `uploadedOk=${uploadedPaths.length}`,
              profile?.store_type ? `store_type=${profile.store_type}` : null,
              profile?.status ? `status=${profile.status}` : null,
            ]
              .filter(Boolean)
              .join(' | ');

            if (__DEV__) {
              console.error('Exception during submission:', detail, error);
            } else {
              console.error('[productUpload] failed:', detail);
            }

            if (createdProductId) {
                await softDeleteProduct(createdProductId);
            }
            if (uploadedPaths.length) {
                await removeProductStoragePaths(uploadedPaths);
            }

            const userMessage = formatUploadError(
              error,
              'অপ্রত্যাশিত সমস্যা হয়েছে'
            );
            showAppAlert(
              'সমস্যা',
              __DEV__ ? `${userMessage}\n\n(${detail})` : userMessage
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitDisabled =
        isSubmitting || accountBlocked || !isWholesale || !profile;

    if (profile && !canUseUploadForm) {
        const blockedMessage = !isWholesale
            ? 'Only wholesale seller accounts can upload products.'
            : accountBlocked
              ? profile.status === 'freeze'
                ? 'Your account is frozen. Product upload is disabled.'
                : 'Your account is restricted. Product upload is disabled.'
              : 'Product upload is not available for this account.';

        return (
            <View style={styles.page}>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Image source={require('@/assets/images/icons/chevron-right.png')} style={styles.backIcon} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Upload Product</Text>
                    <View style={{ width: 30 }} />
                </View>
                <View style={[styles.section, { paddingTop: 24 }]}>
                    <Text style={{ color: '#b91c1c', lineHeight: 20 }}>{blockedMessage}</Text>
                    <Text style={{ color: '#6b7280', marginTop: 8, lineHeight: 20 }}>
                        Returning to your profile…
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image source={require('@/assets/images/icons/chevron-right.png')} style={styles.backIcon} />
                </Pressable>
                <Text style={styles.headerTitle}>Upload Product</Text>
                <View style={{ width: 30 }} />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Media</Text>
                    {pickingImages ? (
                        <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#111827" />
                            <Text style={{ marginTop: 8, color: '#6b7280' }}>ছবি প্রস্তুত করা হচ্ছে...</Text>
                        </View>
                    ) : null}
                    <Pressable
                        style={styles.mainImageBox}
                        onPress={pickMainImage}
                        disabled={pickingImages || isSubmitting}
                    >
                        {mainImage ? <Image source={{ uri: mainImage }} style={styles.mainImage} /> : <Text style={styles.addImageText}>Upload Main Image</Text>}
                    </Pressable>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                        {images.map((img, i) => (
                            <View key={`${img}-${i}`} style={{ position: 'relative', marginRight: 8 }}>
                                <Image source={{ uri: img }} style={styles.thumb} />
                                <Pressable
                                    onPress={() => removeAdditionalImage(i)}
                                    style={{
                                        position: 'absolute', top: -6, right: -6,
                                        backgroundColor: '#ef4444', borderRadius: 10,
                                        width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
                                    }}
                                >
                                    <Feather name="x" size={12} color="#fff" />
                                </Pressable>
                            </View>
                        ))}
                        {images.length < MAX_ADDITIONAL_IMAGES ? (
                            <Pressable
                                style={styles.thumb}
                                onPress={pickAdditionalImages}
                                disabled={pickingImages || isSubmitting}
                            >
                                <Text style={styles.addImageTextPlus}>+</Text>
                            </Pressable>
                        ) : null}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Target Category</Text>
                    {loadingCategories ? (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#111827" />
                            <Text style={{ marginTop: 8, color: '#6b7280' }}>Loading categories...</Text>
                        </View>
                    ) : categories.length === 0 ? (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#ef4444' }}>No categories available</Text>
                            <Pressable onPress={loadCategories} style={{ marginTop: 10 }}>
                                <Text style={{ color: '#3b82f6', textDecorationLine: 'underline' }}>Retry</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.categoryRow}>
                            {categories.map(item => (
                                <Pressable
                                    key={item.id}
                                    style={[
                                        styles.thumb,
                                        { width: 90, justifyContent: 'center', alignItems: 'center' },
                                        parentCategory === item.name && styles.activeCat
                                    ]}
                                    onPress={() => {
                                        setParentCategory(item.name);
                                        setParentCategoryId(item.id);
                                        setCategory('');
                                        setSubCategoryId(null);
                                        setVariants([]);
                                    }}
                                >
                                    <Text style={[
                                        styles.tarCatText,
                                        parentCategory === item.name && styles.tarCatTextAct
                                    ]}>
                                        {item.name.toUpperCase()}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {parentCategoryId && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sub Category</Text>
                        {loadingSubcategories ? (
                            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#111827" />
                                <Text style={{ marginTop: 8, color: '#6b7280' }}>Loading subcategories...</Text>
                            </View>
                        ) : filteredSubcategories.length === 0 ? (
                            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#6b7280' }}>No subcategories available for this category</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={subCategoryId}
                                    onValueChange={(val) => handleSelectCategory(val)}
                                    style={{ color: '#111827' }}
                                    dropdownIconColor="#111827"
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Select sub-category" value={null} color="#9CA3AF" style={{ color: '#9CA3AF' }} />
                                    {filteredSubcategories.map(subcat => (
                                        <Picker.Item
                                            key={subcat.id}
                                            label={subcat.name}
                                            value={subcat.id}
                                            color="#9CA3AF"
                                            style={{ color: '#9CA3AF' }}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.section}>
                    <TextInput placeholder="Product Name" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput placeholder="Price (BDT) Per Item" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={price} onChangeText={setPrice} style={styles.input} />
                    <TextInput placeholder="MOQ" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={moq} onChangeText={setMoq} style={styles.input} />
                    <RichTextEditor value={description} onChange={setDescription} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory Variants</Text>
                    {variants.map((variant, vIdx) => (
                        <View key={vIdx} style={styles.variantBox}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <TextInput
                                    placeholder="Color (e.g. Red)"
                                    placeholderTextColor="#9CA3AF"
                                    value={variant.color}
                                    onChangeText={(t) => {
                                        const v = [...variants]; v[vIdx].color = t; setVariants(v);
                                    }}
                                    style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
                                />
                                <Pressable onPress={() => removeColorVariant(vIdx)}>
                                    <Feather name="trash-2" size={20} color="#ef4444" />
                                </Pressable>
                            </View>

                            <Text style={[styles.sectionTitle, { fontSize: 12 }]}>Select Sizes:</Text>
                            <View style={styles.sizesRow}>
                                {availableSizes.map(size => {
                                    const isSelected = variant.sizes.some(s => s.size_id === size.id);
                                    return (
                                        <Pressable
                                            key={size.id}
                                            onPress={() => toggleSizeSelection(vIdx, size)}
                                            style={[styles.sizeChip, isSelected && { backgroundColor: '#111827' }]}
                                        >
                                            <Text style={[styles.sizeText, isSelected && { color: '#fff' }]}>
                                                {size.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            {variant.sizes.map((sEntry, sIdx) => (
                                <View key={sEntry.size_id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <View style={{ width: 60 }}><Text style={{ fontWeight: '600' }}>{sEntry.label}:</Text></View>
                                    <TextInput
                                        placeholder="Quantity"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="number-pad"
                                        value={sEntry.stock}
                                        scrollEnabled={false}
                                        onChangeText={(val) => updateStock(vIdx, sIdx, val)}
                                        style={[styles.input, { flex: 1, marginBottom: 0, height: 40 }]}
                                    />
                                </View>
                            ))}
                        </View>
                    ))}

                    {parentCategory && (
                        <Pressable style={styles.addBtn} onPress={addColorVariant}>
                            <Text style={styles.addBtnText}>+ Add Color Variant</Text>
                        </Pressable>
                    )}
                </View>

                <View style={styles.submitWrapper}>
                    <Pressable
                        style={[
                            styles.submitBtn,
                            submitDisabled && { opacity: 0.6, backgroundColor: '#9ca3af' }
                        ]}
                        onPress={handleSubmit}
                        disabled={submitDisabled}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>
                                {profile?.status === 'freeze'
                                    ? "Account Frozen"
                                    : profile?.status === 'restricted'
                                        ? "Upload Restricted"
                                        : "Upload Product"}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default ProductUpload;
