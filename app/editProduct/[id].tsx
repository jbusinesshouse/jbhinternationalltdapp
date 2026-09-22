import RichTextEditor from '@/components/textEditor/RichTextEditor';
import { showAppAlert } from '@/context/AppAlertContext';
import { useUser } from '@/context/UserContext';
import {
    fetchCategories as fetchCategoriesApi,
    fetchProductDetail,
    fetchSizes as fetchSizesApi,
    fetchSubcategories,
    updateProduct,
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
    storagePathFromPublicUrl,
    uploadProductImage,
} from '@/lib/productMedia';
import { styles } from '@/styles/productUpload';
import Feather from '@expo/vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation } from 'expo-router';
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

const EditProduct = () => {
    const { profile } = useUser();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const sizesRequestIdRef = useRef(0);

    const accountBlocked = !!(profile?.status && profile.status !== 'active');

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pickingImages, setPickingImages] = useState(false);
    const localImageUrisRef = useRef<string[]>([]);

    const [availableSizes, setAvailableSizes] = useState<DbSize[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

    const [mainImage, setMainImage] = useState<string | null>(null);
    const [originalMainImageUrl, setOriginalMainImageUrl] = useState<string | null>(null);
    const [mainImageIsNew, setMainImageIsNew] = useState(false);
    const [images, setImages] = useState<{ uri: string; isNew: boolean }[]>([]);
    const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [moq, setMoq] = useState('');
    const [description, setDescription] = useState('');

    const [parentCategory, setParentCategory] = useState<string | null>(null);
    const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
    const [category, setCategory] = useState('');
    const [subCategoryId, setSubCategoryId] = useState<string | null>(null);

    const [variants, setVariants] = useState<Variant[]>([]);

    useEffect(() => {
        loadInitial();
    }, [id]);

    useEffect(() => {
        if (!parentCategoryId) {
            setFilteredSubcategories([]);
            return;
        }

        let cancelled = false;

        const loadSubs = async () => {
            try {
                const data = await fetchSubcategories(parentCategoryId);
                if (!cancelled) setFilteredSubcategories(data);
            } catch (error) {
                if (__DEV__) console.error(error);
                if (!cancelled) setFilteredSubcategories([]);
            }
        };

        loadSubs();
        return () => {
            cancelled = true;
        };
    }, [parentCategoryId]);

    useEffect(() => {
        if (!parentCategory) {
            setAvailableSizes([]);
            return;
        }

        const requestId = ++sizesRequestIdRef.current;

        const run = async () => {
            try {
                const data = await fetchSizesApi(parentCategory.toLowerCase());
                if (requestId !== sizesRequestIdRef.current) return;
                setAvailableSizes(data as DbSize[]);
            } catch {
                if (requestId !== sizesRequestIdRef.current) return;
                setAvailableSizes([]);
            }
        };

        run();
    }, [parentCategory]);

    useEffect(() => {
        localImageUrisRef.current = [
            mainImageIsNew && mainImage ? mainImage : null,
            ...images.filter((image) => image.isNew).map((image) => image.uri),
        ].filter((uri): uri is string => !!uri && isPreparedImageUri(uri));
    }, [mainImage, mainImageIsNew, images]);

    useEffect(() => {
        return () => {
            void deleteLocalImageUris(localImageUrisRef.current);
        };
    }, []);

    const loadInitial = async () => {
        if (!id) return;

        try {
            setLoading(true);

            const [cats, detail] = await Promise.all([
                fetchCategoriesApi(),
                fetchProductDetail(String(id)),
            ]);

            setCategories(cats);

            const product = detail.product;
            if (!product) {
                showAppAlert('সমস্যা', 'প্রোডাক্ট লোড করা যায়নি।');
                navigation.goBack();
                return;
            }

            setName(product.name || '');
            setPrice(String(product.price ?? ''));
            setMoq(String(product.moq ?? ''));
            setDescription(product.description || '');
            setCategory(product.selected_category || '');
            setSubCategoryId(product.subcategory_id || null);
            setParentCategoryId(product.category_id || null);

            const matchedCat = cats.find((c) => c.id === product.category_id);
            if (matchedCat) setParentCategory(matchedCat.name);

            const imgData = [...(product.product_images || [])].sort(
                (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
            );

            const main = imgData.find((i: any) => i.is_main);
            if (main) {
                setMainImage(main.image_url);
                setOriginalMainImageUrl(main.image_url);
            }

            setImages(
                imgData
                    .filter((i: any) => !i.is_main)
                    .map((i: any) => ({ uri: i.image_url, isNew: false }))
            );

            const variantData = product.product_variants || [];
            setVariants(
                variantData.map((v: any) => ({
                    color: v.color || '',
                    sizes: (v.product_sizes || []).map((s: any) => ({
                        size_id: s.size_id || s.sizes?.id || '',
                        label: s.size || s.sizes?.label || '',
                        stock: String(s.stock ?? ''),
                    })),
                }))
            );
        } catch (err) {
            showAppAlert(
                'সমস্যা',
                formatUploadError(err, 'অপ্রত্যাশিত সমস্যা হয়েছে')
            );
        } finally {
            setLoading(false);
        }
    };

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
            if (mainImageIsNew && mainImage && isPreparedImageUri(mainImage)) {
                await deleteLocalImageUris([mainImage]);
            }
            setMainImage(prepared.uri);
            setMainImageIsNew(true);
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
            const newImgs = prepared.map((image) => ({ uri: image.uri, isNew: true }));
            setImages((prev) => [...prev, ...newImgs].slice(0, MAX_ADDITIONAL_IMAGES));
        } catch (error) {
            showAppAlert('সমস্যা', formatImageProcessingError(error));
        } finally {
            setPickingImages(false);
        }
    };

    const removeAdditionalImage = (index: number) => {
        const img = images[index];
        if (img.isNew && isPreparedImageUri(img.uri)) {
            void deleteLocalImageUris([img.uri]);
        }
        if (!img.isNew) setRemovedImageUrls((prev) => [...prev, img.uri]);
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSelectSubcategory = (subcatId: string | null) => {
        setSubCategoryId(subcatId);
        const selected = filteredSubcategories.find((s) => s.id === subcatId);
        setCategory(selected?.name || '');
    };

    const handleParentCategoryChange = (item: Category) => {
        setParentCategory(item.name);
        setParentCategoryId(item.id);
        setCategory('');
        setSubCategoryId(null);
        setVariants([]);
    };

    const addColorVariant = () => {
        setVariants((prev) => [...prev, { color: '', sizes: [] }]);
    };

    const removeColorVariant = (index: number) => {
        showAppAlert('ভ্যারিয়েন্ট ডিলিট করবেন?', 'এই রঙ ও এর সাইজগুলো ডিলিট হয়ে যাবে।', [
            { text: 'বাতিল', style: 'cancel' },
            {
                text: 'ডিলিট করুন',
                style: 'destructive',
                onPress: () => setVariants((prev) => prev.filter((_, i) => i !== index)),
            },
        ]);
    };

    const toggleSizeSelection = (variantIndex: number, size: DbSize) => {
        setVariants((prev) => {
            const updated = [...prev];
            const variant = updated[variantIndex];
            if (!variant) return prev;

            const existingIndex = variant.sizes.findIndex((s) => s.size_id === size.id);

            if (existingIndex > -1) {
                variant.sizes.splice(existingIndex, 1);
            } else {
                variant.sizes.push({
                    size_id: size.id,
                    label: size.label,
                    stock: '',
                });
            }
            return updated;
        });
    };

    const updateStock = (variantIndex: number, sizeIndex: number, value: string) => {
        const updated = [...variants];
        updated[variantIndex].sizes[sizeIndex].stock = value.replace(/[^0-9]/g, '');
        setVariants(updated);
    };

    const validateForm = (): string | null => {
        if (!profile) return 'প্রোফাইল লোড হচ্ছে। একটু পর আবার চেষ্টা করুন।';
        if (accountBlocked) {
            const statusBn =
                profile.status === 'freeze'
                    ? 'স্থগিত'
                    : profile.status === 'restricted'
                      ? 'সীমিত'
                      : profile.status;
            return `আপনার অ্যাকাউন্ট এখন ${statusBn}। প্রোডাক্ট এডিট করা যাবে না।`;
        }
        if (!mainImage) return 'প্রধান ছবি আপলোড করুন।';
        if (!name.trim()) return 'প্রোডাক্টের নাম লিখুন।';
        if (!parentCategoryId) return 'মূল ক্যাটাগরি বাছুন।';
        if (!subCategoryId || !category.trim()) return 'নির্দিষ্ট ক্যাটাগরি বাছুন।';
        if (parsePositiveNumber(price) == null) return 'সঠিক দাম লিখুন।';
        if (parsePositiveInt(moq) == null) return 'সঠিক ন্যূনতম অর্ডার পরিমাণ (MOQ) লিখুন।';
        if (plainTextFromHtml(description).length === 0) return 'প্রোডাক্টের বিবরণ লিখুন।';
        if (variants.length === 0) return 'অন্তত একটি রঙের ভ্যারিয়েন্ট যোগ করুন।';

        const colorKeys = new Set<string>();
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.color.trim()) return `ভ্যারিয়েন্ট ${i + 1} এর রঙের নাম লিখুন।`;
            const colorKey = v.color.trim().toLowerCase();
            if (colorKeys.has(colorKey)) {
                return 'একই রঙ দুবার দেওয়া যায় না। প্রতিটি রঙ আলাদা হতে হবে।';
            }
            colorKeys.add(colorKey);
            if (v.sizes.length === 0) return `${v.color} এর জন্য অন্তত একটি সাইজ বাছুন।`;
            for (const s of v.sizes) {
                if (parsePositiveInt(s.stock) == null) {
                    return `${v.color} - ${s.label} এর স্টক সঠিকভাবে লিখুন।`;
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
        const newlyUploadedPaths: string[] = [];

        try {
            const parsedPrice = parsePositiveNumber(price)!;
            const parsedMoq = parsePositiveInt(moq)!;
            const productId = String(id);

            const imagePayload: {
                image_url: string;
                is_main: boolean;
                sort_order: number;
            }[] = [];

            if (mainImageIsNew && mainImage) {
                const uploaded = await uploadProductImage(
                    mainImage,
                    `products/${productId}/main`
                );
                newlyUploadedPaths.push(uploaded.path);
                imagePayload.push({
                    image_url: uploaded.publicUrl,
                    is_main: true,
                    sort_order: 0,
                });
            } else {
                imagePayload.push({
                    image_url: mainImage!,
                    is_main: true,
                    sort_order: 0,
                });
            }

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (img.isNew) {
                    const uploaded = await uploadProductImage(
                        img.uri,
                        `products/${productId}/additional`
                    );
                    newlyUploadedPaths.push(uploaded.path);
                    imagePayload.push({
                        image_url: uploaded.publicUrl,
                        is_main: false,
                        sort_order: i + 1,
                    });
                } else {
                    imagePayload.push({
                        image_url: img.uri,
                        is_main: false,
                        sort_order: i + 1,
                    });
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

            await updateProduct(productId, {
                name: name.trim(),
                description: description.trim(),
                category_id: parentCategoryId,
                selected_category: category.trim(),
                subcategory_id: subCategoryId,
                price: parsedPrice,
                moq: parsedMoq,
                images: imagePayload,
                variants: variantPayload,
            });

            const pathsToRemove: string[] = [];
            if (mainImageIsNew && originalMainImageUrl) {
                const oldMainPath = storagePathFromPublicUrl(originalMainImageUrl);
                if (oldMainPath) pathsToRemove.push(oldMainPath);
            }
            for (const url of removedImageUrls) {
                const path = storagePathFromPublicUrl(url);
                if (path) pathsToRemove.push(path);
            }
            if (pathsToRemove.length) {
                await removeProductStoragePaths(pathsToRemove);
            }

            showAppAlert('সফল', 'প্রোডাক্ট আপডেট হয়েছে।', [
                { text: 'ঠিক আছে', onPress: () => navigation.goBack() },
            ]);
            void deleteLocalImageUris(localImageUrisRef.current);
        } catch (err) {
            if (newlyUploadedPaths.length) {
                await removeProductStoragePaths(newlyUploadedPaths);
            }
            showAppAlert(
                'সমস্যা',
                formatUploadError(err, 'অপ্রত্যাশিত সমস্যা হয়েছে')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#111827" />
                <Text style={{ marginTop: 12, color: '#6b7280' }}>Loading product...</Text>
            </View>
        );
    }

    const submitDisabled = isSubmitting || accountBlocked || !profile;

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image source={require('@/assets/images/icons/chevron-right.png')} style={styles.backIcon} />
                </Pressable>
                <Text style={styles.headerTitle}>Edit Product</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
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
                        {mainImage
                            ? <Image source={{ uri: mainImage }} style={styles.mainImage} />
                            : <Text style={styles.addImageText}>Upload Main Image</Text>}
                    </Pressable>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                        {images.map((img, i) => (
                            <View key={`${img.uri}-${i}`} style={{ position: 'relative', marginRight: 8 }}>
                                <Image source={{ uri: img.uri }} style={styles.thumb} />
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
                    {categories.length === 0 ? (
                        <ActivityIndicator size="small" color="#111827" />
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
                                    onPress={() => handleParentCategoryChange(item)}
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
                        {filteredSubcategories.length === 0 ? (
                            <Text style={{ color: '#6b7280' }}>No subcategories for this category</Text>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={subCategoryId}
                                    onValueChange={handleSelectSubcategory}
                                >
                                    <Picker.Item label="Select sub-category" value={null} />
                                    {filteredSubcategories.map(s => (
                                        <Picker.Item key={s.id} label={s.name} value={s.id} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.section}>
                    <TextInput placeholder="Product Name" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput placeholder="Price (BDT) Per Item" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={price} onChangeText={setPrice} style={styles.input} />
                    <TextInput placeholder="MOQ" keyboardType="numeric" placeholderTextColor="#9CA3AF" value={moq} onChangeText={setMoq} style={styles.input} />
                    <RichTextEditor value={description} onChange={setDescription} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory Variants</Text>
                    {variants.map((variant, vIdx) => (
                        <View key={`variant-${vIdx}`} style={styles.variantBox}>
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
                                    <View style={{ width: 60 }}>
                                        <Text style={{ fontWeight: '600' }}>{sEntry.label}:</Text>
                                    </View>
                                    <TextInput
                                        placeholder="Quantity"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="number-pad"
                                        value={sEntry.stock}
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
                        {isSubmitting
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.submitText}>
                                {profile?.status === 'freeze'
                                    ? 'Account Frozen'
                                    : profile?.status === 'restricted'
                                        ? 'Edit Restricted'
                                        : 'Save Changes'}
                            </Text>}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default EditProduct;
