import RichTextEditor from '@/components/textEditor/RichTextEditor';
import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/productUpload';
import Feather from '@expo/vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    db_size_id?: string; // existing product_sizes row id
}

type Variant = {
    color: string;
    sizes: SizeEntry[];
    db_variant_id?: string; // existing product_variants row id
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

const EditProduct = () => {
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [availableSizes, setAvailableSizes] = useState<DbSize[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

    // Product fields
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [mainImageIsNew, setMainImageIsNew] = useState(false);
    const [images, setImages] = useState<{ uri: string; isNew: boolean; dbId?: string }[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

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

    // ─── Load everything on mount ──────────────────────────────────────────────
    useEffect(() => {
        Promise.all([fetchCategories(), fetchAllSubcategories()]).then(() => {
            fetchProduct();
        });
    }, []);

    // Filter subcategories when parent changes
    useEffect(() => {
        if (parentCategoryId && allSubcategories.length > 0) {
            setFilteredSubcategories(
                allSubcategories.filter(s => String(s.category_id) === String(parentCategoryId))
            );
        } else {
            setFilteredSubcategories([]);
        }
    }, [parentCategoryId, allSubcategories]);

    // Fetch sizes when parent category name changes
    useEffect(() => {
        if (parentCategory) fetchSizes();
    }, [parentCategory]);

    // ─── Fetchers ──────────────────────────────────────────────────────────────
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

    const fetchSizes = async () => {
        if (!parentCategory) return;
        const { data, error } = await supabase
            .from('sizes')
            .select('id, label, category')
            .eq('category', parentCategory.toLowerCase())
            .order('sort_order', { ascending: true });
        if (!error && data) setAvailableSizes(data as DbSize[]);
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);

            // Core product row
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (productError || !product) {
                Alert.alert('Error', 'Failed to load product');
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

            // Images
            const { data: imgData } = await supabase
                .from('product_images')
                .select('*')
                .eq('product_id', id)
                .order('sort_order', { ascending: true });

            if (imgData) {
                const main = imgData.find(i => i.is_main);
                if (main) setMainImage(main.image_url);

                const additional = imgData
                    .filter(i => !i.is_main)
                    .map(i => ({ uri: i.image_url, isNew: false, dbId: i.id }));
                setImages(additional);
            }

            // Variants + sizes
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

            // Set parent category name (triggers size fetch via useEffect)
            if (product.category_id) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('id', product.category_id)
                    .single();
                if (catData) setParentCategory(catData.name);
            }

        } catch (err) {
            Alert.alert('Error', 'Unexpected error: ' + String(err));
        } finally {
            setLoading(false);
        }
    };

    // ─── Image helpers ─────────────────────────────────────────────────────────
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
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            const newImgs = result.assets.map(a => ({ uri: a.uri, isNew: true }));
            setImages(prev => [...prev, ...newImgs]);
        }
    };

    const removeAdditionalImage = (index: number) => {
        const img = images[index];
        if (img.dbId) setRemovedImageIds(prev => [...prev, img.dbId!]);
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // ─── Category helpers ──────────────────────────────────────────────────────
    const handleSelectSubcategory = (subcatId: string | null) => {
        setSubCategoryId(subcatId);
        const selected = filteredSubcategories.find(s => s.id === subcatId);
        setCategory(selected?.name || '');
    };

    // ─── Variant helpers ───────────────────────────────────────────────────────
    const addColorVariant = () => {
        setVariants(prev => [...prev, { color: '', sizes: [] }]);
    };

    const removeColorVariant = (index: number) => {
        Alert.alert('Remove Variant', 'Delete this color and its sizes?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
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

            // Strictly check by size_id
            const existingIndex = variant.sizes.findIndex(s => s.size_id === size.id);

            if (existingIndex > -1) {
                // If it exists, remove it
                variant.sizes.splice(existingIndex, 1);
            } else {
                // If it doesn't exist, add it
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

    // ─── Upload helper ─────────────────────────────────────────────────────────
    const uploadImage = async (uri: string, path: string): Promise<string | null> => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const fileExt = uri.split('.').pop() || 'jpg';
            const fileName = `${path}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, arrayBuffer, { contentType: `image/${fileExt}`, upsert: false });

            if (error) return null;

            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch {
            return null;
        }
    };

    // ─── Validation ────────────────────────────────────────────────────────────
    const validateForm = (): string | null => {
        if (!mainImage) return 'Please upload a main image';
        if (!name.trim()) return 'Please enter product name';
        if (!parentCategoryId) return 'Please select a target category';
        if (!category.trim()) return 'Please select a specific category';
        if (!price.trim() || parseFloat(price) <= 0) return 'Please enter a valid price';
        if (!moq.trim() || parseInt(moq) <= 0) return 'Please enter a valid MOQ';
        if (!description.trim()) return 'Please enter product description';
        if (variants.length === 0) return 'Please add at least one color variant';

        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.color.trim()) return `Please enter color name for variant ${i + 1}`;
            if (v.sizes.length === 0) return `Please select at least one size for ${v.color}`;
            for (const s of v.sizes) {
                if (!s.stock.trim() || parseInt(s.stock) <= 0)
                    return `Please enter valid stock for ${v.color} - ${s.label}`;
            }
        }
        return null;
    };

    // ─── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            Alert.alert('Validation Error', validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Update core product row
            const { error: productError } = await supabase
                .from('products')
                .update({
                    name: name.trim(),
                    description: description.trim(),
                    category_id: parentCategoryId,
                    selected_category: category.trim(),
                    subcategory_id: subCategoryId,
                    price: parseFloat(price),
                    moq: parseInt(moq),
                })
                .eq('id', id);

            if (productError) {
                Alert.alert('Error', 'Failed to update product: ' + productError.message);
                return;
            }

            // 2. Replace main image if changed
            if (mainImageIsNew && mainImage) {
                const newUrl = await uploadImage(mainImage, 'main');
                if (newUrl) {
                    // Delete old main image record, insert new
                    await supabase
                        .from('product_images')
                        .delete()
                        .eq('product_id', id)
                        .eq('is_main', true);

                    await supabase
                        .from('product_images')
                        .insert({ product_id: id, image_url: newUrl, is_main: true, sort_order: 0 });
                }
            }

            // 3. Remove deleted additional images
            if (removedImageIds.length > 0) {
                await supabase
                    .from('product_images')
                    .delete()
                    .in('id', removedImageIds);
            }

            // 4. Upload new additional images
            const newAdditional = images.filter(i => i.isNew);
            for (const img of newAdditional) {
                const url = await uploadImage(img.uri, 'additional');
                if (url) {
                    await supabase
                        .from('product_images')
                        .insert({ product_id: id, image_url: url, is_main: false, sort_order: 99 });
                }
            }

            // 5. Delete removed variants (cascade deletes sizes)
            if (__DEV__) {
                console.log(removedVariantIds.length);
            }

            if (removedVariantIds.length > 0) {
                await supabase
                    .from('product_variants')
                    .delete()
                    .in('id', removedVariantIds);
            }

            // 6. Upsert variants and sizes
            for (const variant of variants) {
                let variantId = variant.db_variant_id;

                // ✅ UPDATE or CREATE VARIANT
                if (variantId) {
                    await supabase
                        .from('product_variants')
                        .update({ color: variant.color.trim() })
                        .eq('id', variantId);
                } else {
                    const { data: newVariant, error: vErr } = await supabase
                        .from('product_variants')
                        .insert({
                            product_id: id,
                            color: variant.color.trim()
                        })
                        .select()
                        .single();

                    if (vErr || !newVariant) {
                        if (__DEV__) {
                            console.error('Variant insert error:', vErr);
                        }
                        continue;
                    }

                    variantId = newVariant.id;
                }

                // ✅ GET existing sizes
                const { data: existingSizes } = await supabase
                    .from('product_sizes')
                    .select('id')
                    .eq('variant_id', variantId);

                const existingIds = new Set(existingSizes?.map(s => s.id) || []);
                const incomingIds = new Set<string>();

                // ✅ UPDATE or INSERT
                for (const size of variant.sizes) {
                    if (size.db_size_id) {
                        incomingIds.add(size.db_size_id);

                        await supabase
                            .from('product_sizes')
                            .update({
                                size: size.label,
                                size_id: size.size_id,
                                stock: parseInt(size.stock)
                            })
                            .eq('id', size.db_size_id);

                    } else {
                        const { data: newSize } = await supabase
                            .from('product_sizes')
                            .insert({
                                variant_id: variantId,
                                size: size.label,
                                size_id: size.size_id,
                                stock: parseInt(size.stock)
                            })
                            .select()
                            .single();

                        if (newSize) {
                            incomingIds.add(newSize.id);
                        }
                    }
                }

                // ✅ DELETE removed sizes
                for (const existingId of existingIds) {
                    if (!incomingIds.has(existingId)) {
                        await supabase
                            .from('product_sizes')
                            .delete()
                            .eq('id', existingId);
                    }
                }
            }

            Alert.alert('Success', 'Product updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (err) {
            Alert.alert('Error', 'Unexpected error: ' + String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#111827" />
                <Text style={{ marginTop: 12, color: '#6b7280' }}>Loading product...</Text>
            </View>
        );
    }

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
                {/* ── Media ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Media</Text>
                    <Pressable style={styles.mainImageBox} onPress={pickMainImage}>
                        {mainImage
                            ? <Image source={{ uri: mainImage }} style={styles.mainImage} />
                            : <Text style={styles.addImageText}>Upload Main Image</Text>}
                    </Pressable>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                        {images.map((img, i) => (
                            <View key={i} style={{ position: 'relative', marginRight: 8 }}>
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
                        <Pressable style={styles.thumb} onPress={pickAdditionalImages}>
                            <Text style={styles.addImageTextPlus}>+</Text>
                        </Pressable>
                    </ScrollView>
                </View>

                {/* ── Target Category ── */}
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

                {/* ── Subcategory ── */}
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

                {/* ── Basic Info ── */}
                <View style={styles.section}>
                    <TextInput placeholder="Product Name" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput placeholder="Price (BDT) Per Item" keyboardType="numeric" value={price} onChangeText={setPrice} style={styles.input} />
                    <TextInput placeholder="MOQ" keyboardType="numeric" value={moq} onChangeText={setMoq} style={styles.input} />
                    <RichTextEditor value={description} onChange={setDescription} />
                </View>

                {/* ── Variants ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory Variants</Text>
                    {variants.map((variant, vIdx) => (
                        <View key={vIdx} style={styles.variantBox}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <TextInput
                                    placeholder="Color (e.g. Red)"
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
                                    // FIX: Only compare by ID for consistency
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
                                // FIX: Use size_id for the key instead of label
                                <View key={sEntry.size_id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <View style={{ width: 60 }}>
                                        <Text style={{ fontWeight: '600' }}>{sEntry.label}:</Text>
                                    </View>
                                    <TextInput
                                        placeholder="Quantity"
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

                {/* ── Submit ── */}
                <View style={styles.submitWrapper}>
                    <Pressable
                        style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.submitText}>Save Changes</Text>}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default EditProduct;