import RichTextEditor from '@/components/textEditor/RichTextEditor';
import { showAppAlert } from '@/context/AppAlertContext';
import { useUser } from '@/context/UserContext';
import {
    parsePositiveInt,
    parsePositiveNumber,
    plainTextFromHtml,
    removeProductStoragePaths,
    storagePathFromPublicUrl,
    uploadProductImage,
} from '@/lib/productMedia';
import { supabase } from '@/lib/supabase';
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
    db_size_id?: string;
}

type Variant = {
    color: string;
    sizes: SizeEntry[];
    db_variant_id?: string;
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

const EditProduct = () => {
    const { profile } = useUser();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const sizesRequestIdRef = useRef(0);

    const accountBlocked = !!(profile?.status && profile.status !== 'active');

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [availableSizes, setAvailableSizes] = useState<DbSize[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

    const [mainImage, setMainImage] = useState<string | null>(null);
    const [originalMainImageUrl, setOriginalMainImageUrl] = useState<string | null>(null);
    const [mainImageIsNew, setMainImageIsNew] = useState(false);
    const [images, setImages] = useState<{ uri: string; isNew: boolean; dbId?: string }[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
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
    const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);

    useEffect(() => {
        Promise.all([fetchCategories(), fetchAllSubcategories()]).then(() => {
            fetchProduct();
        });
    }, []);

    useEffect(() => {
        if (parentCategoryId && allSubcategories.length > 0) {
            setFilteredSubcategories(
                allSubcategories.filter(s => String(s.category_id) === String(parentCategoryId))
            );
        } else {
            setFilteredSubcategories([]);
        }
    }, [parentCategoryId, allSubcategories]);

    useEffect(() => {
        if (!parentCategory) {
            setAvailableSizes([]);
            return;
        }

        const requestId = ++sizesRequestIdRef.current;

        const run = async () => {
            const { data, error } = await supabase
                .from('sizes')
                .select('id, label, category')
                .eq('category', parentCategory.toLowerCase())
                .order('sort_order', { ascending: true });

            if (requestId !== sizesRequestIdRef.current) return;
            if (!error && data) setAvailableSizes(data as DbSize[]);
            else setAvailableSizes([]);
        };

        run();
    }, [parentCategory]);

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        if (!error && data) setCategories(data);
    };

    const fetchAllSubcategories = async () => {
        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .order('name', { ascending: true });
        if (!error && data) setAllSubcategories(data);
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);

            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (productError || !product) {
                showAppAlert('সমস্যা', 'প্রোডাক্ট লোড করা যায়নি।');
                navigation.goBack();
                return;
            }

            setName(product.name || '');
            setPrice(String(product.price || ''));
            setMoq(String(product.moq || ''));
            setDescription(product.description || '');
            setCategory(product.selected_category || '');
            setSubCategoryId(product.subcategory_id || null);
            setParentCategoryId(product.category_id || null);

            const { data: imgData } = await supabase
                .from('product_images')
                .select('*')
                .eq('product_id', id)
                .order('sort_order', { ascending: true });

            if (imgData) {
                const main = imgData.find(i => i.is_main);
                if (main) {
                    setMainImage(main.image_url);
                    setOriginalMainImageUrl(main.image_url);
                }

                const additional = imgData
                    .filter(i => !i.is_main)
                    .map(i => ({ uri: i.image_url, isNew: false, dbId: i.id }));
                setImages(additional);
            }

            const { data: variantData } = await supabase
                .from('product_variants')
                .select('*, product_sizes(*)')
                .eq('product_id', id);

            if (variantData) {
                const mapped: Variant[] = variantData.map(v => ({
                    db_variant_id: v.id,
                    color: v.color,
                    sizes: (v.product_sizes || []).map((s: any) => ({
                        db_size_id: s.id,
                        size_id: s.size_id,
                        label: s.size,
                        stock: String(s.stock),
                    }))
                }));
                setVariants(mapped);
            }

            if (product.category_id) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('id', product.category_id)
                    .single();
                if (catData) setParentCategory(catData.name);
            }

        } catch (err) {
            showAppAlert('সমস্যা', 'অপ্রত্যাশিত সমস্যা হয়েছে: ' + String(err));
        } finally {
            setLoading(false);
        }
    };

    const pickMainImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setMainImage(result.assets[0].uri);
            setMainImageIsNew(true);
        }
    };

    const pickAdditionalImages = async () => {
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
        if (!result.canceled) {
            const newImgs = result.assets.map(a => ({ uri: a.uri, isNew: true }));
            setImages(prev => [...prev, ...newImgs].slice(0, MAX_ADDITIONAL_IMAGES));
        }
    };

    const removeAdditionalImage = (index: number) => {
        const img = images[index];
        if (img.dbId) setRemovedImageIds(prev => [...prev, img.dbId!]);
        if (!img.isNew) setRemovedImageUrls(prev => [...prev, img.uri]);
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSelectSubcategory = (subcatId: string | null) => {
        setSubCategoryId(subcatId);
        const selected = filteredSubcategories.find(s => s.id === subcatId);
        setCategory(selected?.name || '');
    };

    const handleParentCategoryChange = (item: Category) => {
        const existingIds = variants
            .map(v => v.db_variant_id)
            .filter((vid): vid is string => !!vid);

        if (existingIds.length) {
            setRemovedVariantIds(prev => [...new Set([...prev, ...existingIds])]);
        }

        setParentCategory(item.name);
        setParentCategoryId(item.id);
        setCategory('');
        setSubCategoryId(null);
        setVariants([]);
    };

    const addColorVariant = () => {
        setVariants(prev => [...prev, { color: '', sizes: [] }]);
    };

    const removeColorVariant = (index: number) => {
        showAppAlert('ভ্যারিয়েন্ট ডিলিট করবেন?', 'এই রঙ ও এর সাইজগুলো ডিলিট হয়ে যাবে।', [
            { text: 'বাতিল', style: 'cancel' },
            {
                text: 'ডিলিট করুন', style: 'destructive', onPress: () => {
                    const v = variants[index];
                    if (v.db_variant_id) {
                        setRemovedVariantIds(prev => [...prev, v.db_variant_id!]);
                    }
                    setVariants(prev => prev.filter((_, i) => i !== index));
                }
            }
        ]);
    };

    const toggleSizeSelection = (variantIndex: number, size: DbSize) => {
        setVariants(prev => {
            const updated = [...prev];
            const variant = updated[variantIndex];
            if (!variant) return prev;

            const existingIndex = variant.sizes.findIndex(s => s.size_id === size.id);

            if (existingIndex > -1) {
                variant.sizes.splice(existingIndex, 1);
            } else {
                variant.sizes.push({
                    size_id: size.id,
                    label: size.label,
                    stock: ''
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

            const { error: productError } = await supabase
                .from('products')
                .update({
                    name: name.trim(),
                    description: description.trim(),
                    category_id: parentCategoryId,
                    selected_category: category.trim(),
                    subcategory_id: subCategoryId,
                    price: parsedPrice,
                    moq: parsedMoq,
                })
                .eq('id', id);

            if (productError) {
                showAppAlert('সমস্যা', 'প্রোডাক্ট আপডেট হয়নি: ' + productError.message);
                return;
            }

            if (mainImageIsNew && mainImage) {
                const uploaded = await uploadProductImage(mainImage, `products/${id}/main`);
                newlyUploadedPaths.push(uploaded.path);

                const { error: deleteMainError } = await supabase
                    .from('product_images')
                    .delete()
                    .eq('product_id', id)
                    .eq('is_main', true);

                if (deleteMainError) {
                    throw new Error(deleteMainError.message || 'Failed to replace main image');
                }

                const { error: insertMainError } = await supabase
                    .from('product_images')
                    .insert({
                        product_id: id,
                        image_url: uploaded.publicUrl,
                        is_main: true,
                        sort_order: 0,
                    });

                if (insertMainError) {
                    throw new Error(insertMainError.message || 'Failed to save main image');
                }

                const oldMainPath = originalMainImageUrl
                    ? storagePathFromPublicUrl(originalMainImageUrl)
                    : null;
                if (oldMainPath) {
                    await removeProductStoragePaths([oldMainPath]);
                }
            }

            if (removedImageIds.length > 0) {
                const { error: removeImgError } = await supabase
                    .from('product_images')
                    .delete()
                    .in('id', removedImageIds);

                if (removeImgError) {
                    throw new Error(removeImgError.message || 'Failed to remove images');
                }

                const paths = removedImageUrls
                    .map(storagePathFromPublicUrl)
                    .filter((p): p is string => !!p);
                await removeProductStoragePaths(paths);
            }

            const newAdditional = images.filter(i => i.isNew);
            for (let i = 0; i < newAdditional.length; i++) {
                const uploaded = await uploadProductImage(
                    newAdditional[i].uri,
                    `products/${id}/additional`
                );
                newlyUploadedPaths.push(uploaded.path);

                const { error: insertAdditionalError } = await supabase
                    .from('product_images')
                    .insert({
                        product_id: id,
                        image_url: uploaded.publicUrl,
                        is_main: false,
                        sort_order: 99 + i,
                    });

                if (insertAdditionalError) {
                    throw new Error(
                        insertAdditionalError.message || 'Failed to save additional image'
                    );
                }
            }

            if (removedVariantIds.length > 0) {
                const { error: removeVariantError } = await supabase
                    .from('product_variants')
                    .delete()
                    .in('id', removedVariantIds);

                if (removeVariantError) {
                    throw new Error(
                        removeVariantError.message || 'Failed to remove old variants'
                    );
                }
            }

            for (const variant of variants) {
                let variantId = variant.db_variant_id;

                if (variantId) {
                    const { error: updateVariantError } = await supabase
                        .from('product_variants')
                        .update({ color: variant.color.trim() })
                        .eq('id', variantId);

                    if (updateVariantError) {
                        throw new Error(
                            updateVariantError.message || `Failed to update ${variant.color}`
                        );
                    }
                } else {
                    const { data: newVariant, error: vErr } = await supabase
                        .from('product_variants')
                        .insert({
                            product_id: id,
                            color: variant.color.trim()
                        })
                        .select('id')
                        .single();

                    if (vErr || !newVariant) {
                        throw new Error(
                            vErr?.message || `Failed to create color ${variant.color}`
                        );
                    }

                    variantId = newVariant.id;
                }

                const { data: existingSizes, error: existingSizesError } = await supabase
                    .from('product_sizes')
                    .select('id')
                    .eq('variant_id', variantId);

                if (existingSizesError) {
                    throw new Error(existingSizesError.message || 'Failed to load sizes');
                }

                const existingIds = new Set(existingSizes?.map(s => s.id) || []);
                const incomingIds = new Set<string>();

                for (const size of variant.sizes) {
                    const stock = parsePositiveInt(size.stock)!;

                    if (size.db_size_id) {
                        incomingIds.add(size.db_size_id);

                        const { error: sizeUpdateError } = await supabase
                            .from('product_sizes')
                            .update({
                                size: size.label,
                                size_id: size.size_id,
                                stock,
                            })
                            .eq('id', size.db_size_id);

                        if (sizeUpdateError) {
                            throw new Error(
                                sizeUpdateError.message ||
                                `Failed to update size ${size.label}`
                            );
                        }
                    } else {
                        const { data: newSize, error: sizeInsertError } = await supabase
                            .from('product_sizes')
                            .insert({
                                variant_id: variantId,
                                size: size.label,
                                size_id: size.size_id,
                                stock,
                            })
                            .select('id')
                            .single();

                        if (sizeInsertError || !newSize) {
                            throw new Error(
                                sizeInsertError?.message ||
                                `Failed to add size ${size.label}`
                            );
                        }

                        incomingIds.add(newSize.id);
                    }
                }

                for (const existingId of existingIds) {
                    if (!incomingIds.has(existingId)) {
                        const { error: sizeDeleteError } = await supabase
                            .from('product_sizes')
                            .delete()
                            .eq('id', existingId);

                        if (sizeDeleteError) {
                            throw new Error(
                                sizeDeleteError.message || 'Failed to remove a size'
                            );
                        }
                    }
                }
            }

            showAppAlert('সফল', 'প্রোডাক্ট আপডেট হয়েছে।', [
                { text: 'ঠিক আছে', onPress: () => navigation.goBack() }
            ]);

        } catch (err) {
            if (newlyUploadedPaths.length) {
                await removeProductStoragePaths(newlyUploadedPaths);
            }
            showAppAlert(
                'সমস্যা',
                err instanceof Error ? err.message : 'অপ্রত্যাশিত সমস্যা হয়েছে: ' + String(err)
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
                    <Pressable style={styles.mainImageBox} onPress={pickMainImage}>
                        {mainImage
                            ? <Image source={{ uri: mainImage }} style={styles.mainImage} />
                            : <Text style={styles.addImageText}>Upload Main Image</Text>}
                    </Pressable>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                        {images.map((img, i) => (
                            <View key={img.dbId ?? `${img.uri}-${i}`} style={{ position: 'relative', marginRight: 8 }}>
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
                            <Pressable style={styles.thumb} onPress={pickAdditionalImages}>
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
                        <View key={variant.db_variant_id ?? `new-${vIdx}`} style={styles.variantBox}>
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
