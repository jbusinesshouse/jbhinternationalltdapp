import RichTextEditor from '@/components/textEditor/RichTextEditor';
import { useUser } from '@/context/UserContext';
import {
    parsePositiveInt,
    parsePositiveNumber,
    plainTextFromHtml,
    removeProductStoragePaths,
    softDeleteProduct,
    uploadProductImage,
} from '@/lib/productMedia';
import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/productUpload';
import Feather from '@expo/vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
    category: string;
}

type Category = {
    id: string;
    name: string;
}

type Subcategory = {
    id: string;
    name: string;
    category_id: string;
}

const MAX_ADDITIONAL_IMAGES = 8;

const ProductUpload = () => {
    const { profile } = useUser();
    const navigation = useNavigation();
    const sizesRequestIdRef = useRef(0);

    const storeType = (profile as { store_type?: string } | null)?.store_type;
    const isWholesale = storeType === 'wholesale';
    const accountBlocked = !!(profile?.status && profile.status !== 'active');

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
    const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchAllSubcategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                if (__DEV__) console.error('Error fetching categories:', error);
                Alert.alert('Error', 'Failed to load categories: ' + error.message);
                return;
            }

            if (data && data.length > 0) {
                setCategories(data);
            } else {
                Alert.alert('Notice', 'No categories found. Please add categories to the database.');
            }
        } catch (error) {
            if (__DEV__) console.error('Exception fetching categories:', error);
            Alert.alert('Error', 'An unexpected error occurred: ' + String(error));
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchAllSubcategories = async () => {
        try {
            setLoadingSubcategories(true);
            const { data, error } = await supabase
                .from('subcategories')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                if (__DEV__) console.error('Error fetching subcategories:', error);
                Alert.alert('Error', 'Failed to load subcategories: ' + error.message);
                return;
            }

            setAllSubcategories(data ?? []);
        } catch (error) {
            if (__DEV__) console.error('Exception fetching subcategories:', error);
            Alert.alert('Error', 'An unexpected error occurred: ' + String(error));
        } finally {
            setLoadingSubcategories(false);
        }
    };

    useEffect(() => {
        if (parentCategoryId && allSubcategories.length > 0) {
            const filtered = allSubcategories.filter(subcat =>
                String(subcat.category_id) === String(parentCategoryId)
            );
            setFilteredSubcategories(filtered);
        } else {
            setFilteredSubcategories([]);
        }
    }, [parentCategoryId, allSubcategories]);

    const pickMainImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) setMainImage(result.assets[0].uri);
    };

    const pickAdditionalImages = async () => {
        const remaining = MAX_ADDITIONAL_IMAGES - images.length;
        if (remaining <= 0) {
            Alert.alert('Limit reached', `You can add up to ${MAX_ADDITIONAL_IMAGES} additional images.`);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.7,
            selectionLimit: remaining,
        });
        if (!result.canceled) {
            setImages(prev =>
                [...prev, ...result.assets.map(a => a.uri)].slice(0, MAX_ADDITIONAL_IMAGES)
            );
        }
    };

    const removeAdditionalImage = (index: number) => {
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
        Alert.alert("Remove Variant", "Delete this color and its sizes?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => setVariants(prev => prev.filter((_, i) => i !== index)) }
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

        const fetchSizes = async (): Promise<void> => {
            const { data, error } = await supabase
                .from('sizes')
                .select('id, label, category')
                .eq('category', parentCategory.toLowerCase())
                .order('sort_order', { ascending: true });

            if (requestId !== sizesRequestIdRef.current) return;

            if (error) {
                if (__DEV__) console.error(error);
                setAvailableSizes([]);
                return;
            }

            setAvailableSizes((data as DbSize[]) ?? []);
        };

        fetchSizes();
    }, [parentCategory]);

    const resetForm = () => {
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
        if (!isWholesale) return 'Only wholesale sellers can upload products';
        if (!profile) return 'Profile is still loading. Please try again.';
        if (accountBlocked) {
            return `Your account is currently ${profile.status === 'freeze' ? 'frozen' : profile.status}. You cannot upload products.`;
        }
        if (!mainImage) return 'Please upload a main image';
        if (!name.trim()) return 'Please enter product name';
        if (!parentCategoryId) return 'Please select a target category';
        if (!subCategoryId || !category.trim()) return 'Please select a specific category';

        const parsedPrice = parsePositiveNumber(price);
        if (parsedPrice == null) return 'Please enter a valid price';

        const parsedMoq = parsePositiveInt(moq);
        if (parsedMoq == null) return 'Please enter a valid MOQ';

        if (plainTextFromHtml(description).length === 0) {
            return 'Please enter product description';
        }
        if (variants.length === 0) return 'Please add at least one color variant';

        const colorKeys = new Set<string>();
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            if (!variant.color.trim()) {
                return `Please enter color name for variant ${i + 1}`;
            }
            const colorKey = variant.color.trim().toLowerCase();
            if (colorKeys.has(colorKey)) {
                return `Duplicate color "${variant.color.trim()}". Each color must be unique.`;
            }
            colorKeys.add(colorKey);

            if (variant.sizes.length === 0) {
                return `Please select at least one size for ${variant.color}`;
            }
            for (let j = 0; j < variant.sizes.length; j++) {
                const size = variant.sizes[j];
                if (parsePositiveInt(size.stock) == null) {
                    return `Please enter valid stock for ${variant.color} - ${size.label}`;
                }
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            Alert.alert('Validation Error', validationError);
            return;
        }

        setIsSubmitting(true);

        let createdProductId: string | null = null;
        const uploadedPaths: string[] = [];

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                Alert.alert('Error', 'You must be logged in to upload products');
                return;
            }

            const sellerId = userData.user.id;
            const parsedPrice = parsePositiveNumber(price)!;
            const parsedMoq = parsePositiveInt(moq)!;

            // 1) Create product first (avoids orphan files if insert fails)
            // Explicit status matches live catalog behavior (DB samples are all "active").
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert({
                    seller_id: sellerId,
                    name: name.trim(),
                    description: description.trim(),
                    category_id: parentCategoryId,
                    selected_category: category.trim(),
                    subcategory_id: subCategoryId,
                    price: parsedPrice,
                    moq: parsedMoq,
                    active: true,
                    status: 'active',
                    is_deleted: false,
                })
                .select('id')
                .single();

            if (productError || !productData) {
                if (__DEV__) console.error('Product insert error:', productError);
                Alert.alert(
                    'Error',
                    'Failed to create product: ' + (productError?.message || 'Unknown error')
                );
                return;
            }

            createdProductId = productData.id;
            const productId = productData.id;
            const folder = `products/${productId}`;

            // 2) Upload + attach main image
            const mainUpload = await uploadProductImage(mainImage!, `${folder}/main`);
            uploadedPaths.push(mainUpload.path);

            const { error: mainImageError } = await supabase
                .from('product_images')
                .insert({
                    product_id: productId,
                    image_url: mainUpload.publicUrl,
                    is_main: true,
                    sort_order: 0
                });

            if (mainImageError) {
                throw new Error(mainImageError.message || 'Failed to save main image');
            }

            // 3) Upload + attach additional images (all must succeed)
            if (images.length > 0) {
                const additionalRows: {
                    product_id: string;
                    image_url: string;
                    is_main: boolean;
                    sort_order: number;
                }[] = [];

                for (let i = 0; i < images.length; i++) {
                    const uploaded = await uploadProductImage(images[i], `${folder}/additional`);
                    uploadedPaths.push(uploaded.path);
                    additionalRows.push({
                        product_id: productId,
                        image_url: uploaded.publicUrl,
                        is_main: false,
                        sort_order: i + 1,
                    });
                }

                const { error: additionalImagesError } = await supabase
                    .from('product_images')
                    .insert(additionalRows);

                if (additionalImagesError) {
                    throw new Error(
                        additionalImagesError.message || 'Failed to save additional images'
                    );
                }
            }

            // 4) Variants + sizes (hard-fail on any error)
            for (const variant of variants) {
                const { data: variantData, error: variantError } = await supabase
                    .from('product_variants')
                    .insert({
                        product_id: productId,
                        color: variant.color.trim()
                    })
                    .select('id')
                    .single();

                if (variantError || !variantData) {
                    throw new Error(
                        variantError?.message || `Failed to save color ${variant.color}`
                    );
                }

                const sizesData = variant.sizes.map(size => ({
                    variant_id: variantData.id,
                    size_id: size.size_id,
                    size: size.label,
                    stock: parsePositiveInt(size.stock)!,
                }));

                const { error: sizesError } = await supabase
                    .from('product_sizes')
                    .insert(sizesData);

                if (sizesError) {
                    throw new Error(
                        sizesError.message || `Failed to save sizes for ${variant.color}`
                    );
                }
            }

            resetForm();
            Alert.alert(
                'Success',
                'Product uploaded successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            if (__DEV__) console.error('Exception during submission:', error);

            if (createdProductId) {
                await softDeleteProduct(createdProductId);
            }
            if (uploadedPaths.length) {
                await removeProductStoragePaths(uploadedPaths);
            }

            Alert.alert(
                'Error',
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred: ' + String(error)
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitDisabled =
        isSubmitting || accountBlocked || !isWholesale || !profile;

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
                {!isWholesale && profile ? (
                    <View style={styles.section}>
                        <Text style={{ color: '#b91c1c', lineHeight: 20 }}>
                            Only wholesale seller accounts can upload products.
                        </Text>
                    </View>
                ) : null}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Media</Text>
                    <Pressable style={styles.mainImageBox} onPress={pickMainImage}>
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
                            <Pressable style={styles.thumb} onPress={pickAdditionalImages}>
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
                            <Pressable onPress={fetchCategories} style={{ marginTop: 10 }}>
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
                                {!isWholesale && profile
                                    ? "Sellers Only"
                                    : profile?.status === 'freeze'
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
