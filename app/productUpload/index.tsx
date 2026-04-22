import RichTextEditor from '@/components/textEditor/RichTextEditor';
import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/productUpload';
import Feather from '@expo/vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
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

const ProductUpload = () => {
    const navigation = useNavigation();

    const [availableSizes, setAvailableSizes] = useState<DbSize[]>([]);

    const [mainImage, setMainImage] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState<string | null>(null);
    const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
    const [category, setCategory] = useState('');
    const [subCategoryId, setSubCategoryId] = useState<string | null>('');
    const [price, setPrice] = useState('');
    const [moq, setMoq] = useState('');
    const [description, setDescription] = useState('');
    const [variants, setVariants] = useState<Variant[]>([]);

    // States for categories and subcategories
    const [categories, setCategories] = useState<Category[]>([]);
    const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch categories and subcategories from Supabase on mount
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
                console.error('Error fetching categories:', error);
                Alert.alert('Error', 'Failed to load categories: ' + error.message);
                return;
            }

            if (data && data.length > 0) {
                setCategories(data);
            } else {
                console.log('No categories found in database');
                Alert.alert('Notice', 'No categories found. Please add categories to the database.');
            }
        } catch (error) {
            console.error('Exception fetching categories:', error);
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
                console.error('Error fetching subcategories:', error);
                Alert.alert('Error', 'Failed to load subcategories: ' + error.message);
                return;
            }

            if (data && data.length > 0) {
                setAllSubcategories(data);
            } else {
                console.log('No subcategories found in database');
                setAllSubcategories([]);
            }
        } catch (error) {
            console.error('Exception fetching subcategories:', error);
            Alert.alert('Error', 'An unexpected error occurred: ' + String(error));
        } finally {
            setLoadingSubcategories(false);
        }
    };

    // Filter subcategories when parent category changes
    useEffect(() => {
        if (parentCategoryId && allSubcategories.length > 0) {
            const filtered = allSubcategories.filter(subcat => {
                const match = subcat.category_id == parentCategoryId ||
                    subcat.category_id === parentCategoryId ||
                    String(subcat.category_id) === String(parentCategoryId);
                return match;
            });

            setFilteredSubcategories(filtered);
        } else {
            setFilteredSubcategories([]);
        }
    }, [parentCategoryId, allSubcategories]);

    const pickMainImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            // aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) setMainImage(result.assets[0].uri);
    };

    const pickAdditionalImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
        }
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
        if (!parentCategory) return;
        fetchSizes();
    }, [parentCategory]);

    const fetchSizes = async (): Promise<void> => {
        if (!parentCategory) return;

        const { data, error } = await supabase
            .from('sizes')
            .select('id, label, category')
            .eq('category', parentCategory.toLowerCase())
            .order('sort_order', { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        setAvailableSizes((data as DbSize[]) ?? []);
    };

    // Upload image to Supabase Storage
    const uploadImage = async (uri: string, path: string): Promise<string | null> => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const fileExt = uri.split('.').pop() || 'jpg';
            const fileName = `${path}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, arrayBuffer, {
                    contentType: `image/${fileExt}`,
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                return null;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Exception uploading image:', error);
            return null;
        }
    };

    // Validation function
    const validateForm = (): string | null => {
        if (!mainImage) return 'Please upload a main image';
        if (!name.trim()) return 'Please enter product name';
        if (!parentCategoryId) return 'Please select a target category';
        if (!category.trim()) return 'Please select a specific category';
        if (!price.trim() || parseFloat(price) <= 0) return 'Please enter a valid price';
        if (!moq.trim() || parseInt(moq) <= 0) return 'Please enter a valid MOQ';
        if (!description.trim()) return 'Please enter product description';
        if (variants.length === 0) return 'Please add at least one color variant';

        // Validate each variant
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            if (!variant.color.trim()) {
                return `Please enter color name for variant ${i + 1}`;
            }
            if (variant.sizes.length === 0) {
                return `Please select at least one size for ${variant.color}`;
            }
            for (let j = 0; j < variant.sizes.length; j++) {
                const size = variant.sizes[j];
                if (!size.stock.trim() || parseInt(size.stock) <= 0) {
                    return `Please enter valid stock for ${variant.color} - ${size.label}`;
                }
            }
        }

        return null;
    };

    // Submit handler
    const handleSubmit = async () => {
        // Validate form
        const validationError = validateForm();
        if (validationError) {
            Alert.alert('Validation Error', validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            // Get current user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                Alert.alert('Error', 'You must be logged in to upload products');
                setIsSubmitting(false);
                return;
            }

            const sellerId = userData.user.id;

            // Step 1: Upload main image
            const mainImageUrl = await uploadImage(mainImage!, 'main');
            if (!mainImageUrl) {
                Alert.alert('Error', 'Failed to upload main image');
                setIsSubmitting(false);
                return;
            }

            // Step 2: Upload additional images
            const additionalImageUrls: string[] = [];
            for (const img of images) {
                const url = await uploadImage(img, 'additional');
                if (url) additionalImageUrls.push(url);
            }

            // Step 3: Insert product
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert({
                    seller_id: sellerId,
                    name: name.trim(),
                    description: description.trim(),
                    category_id: parentCategoryId,
                    selected_category: category.trim(),
                    subcategory_id: subCategoryId,
                    price: parseFloat(price),
                    moq: parseInt(moq),
                    active: true
                })
                .select()
                .single();

            if (productError || !productData) {
                console.error('Product insert error:', productError);
                Alert.alert('Error', 'Failed to create product: ' + (productError?.message || 'Unknown error'));
                setIsSubmitting(false);
                return;
            }

            const productId = productData.id;

            // Step 4: Insert main image
            const { error: mainImageError } = await supabase
                .from('product_images')
                .insert({
                    product_id: productId,
                    image_url: mainImageUrl,
                    is_main: true,
                    sort_order: 0
                });

            if (mainImageError) {
                console.error('Main image insert error:', mainImageError);
            }

            // Step 5: Insert additional images
            const additionalImagesData = additionalImageUrls.map((url, index) => ({
                product_id: productId,
                image_url: url,
                is_main: false,
                sort_order: index + 1
            }));

            if (additionalImagesData.length > 0) {
                const { error: additionalImagesError } = await supabase
                    .from('product_images')
                    .insert(additionalImagesData);

                if (additionalImagesError) {
                    console.error('Additional images insert error:', additionalImagesError);
                }
            }

            // Step 6: Insert variants and sizes
            for (const variant of variants) {
                // Insert variant
                const { data: variantData, error: variantError } = await supabase
                    .from('product_variants')
                    .insert({
                        product_id: productId,
                        color: variant.color.trim()
                    })
                    .select()
                    .single();

                if (variantError || !variantData) {
                    console.error('Variant insert error:', variantError);
                    continue;
                }

                const variantId = variantData.id;

                // Insert sizes for this variant
                const sizesData = variant.sizes.map(size => ({
                    variant_id: variantId,
                    size_id: size.size_id,
                    size: size.label,
                    stock: parseInt(size.stock)
                }));

                const { error: sizesError } = await supabase
                    .from('product_sizes')
                    .insert(sizesData);

                if (sizesError) {
                    console.error('Sizes insert error:', sizesError);
                }
            }

            Alert.alert(
                'Success',
                'Product uploaded successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );

        } catch (error) {
            console.error('Exception during submission:', error);
            Alert.alert('Error', 'An unexpected error occurred: ' + String(error));
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <Pressable style={styles.mainImageBox} onPress={pickMainImage}>
                        {mainImage ? <Image source={{ uri: mainImage }} style={styles.mainImage} /> : <Text style={styles.addImageText}>Upload Main Image</Text>}
                    </Pressable>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                        {images.map((img, i) => <Image key={i} source={{ uri: img }} style={styles.thumb} />)}
                        <Pressable style={styles.thumb} onPress={pickAdditionalImages}><Text style={styles.addImageTextPlus}>+</Text></Pressable>
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
                                        setSubCategoryId('')
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
                                >
                                    <Picker.Item label="Select sub-category" value={null} />
                                    {filteredSubcategories.map(subcat => (
                                        <Picker.Item
                                            key={subcat.id}
                                            label={subcat.name}
                                            value={subcat.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.section}>
                    <TextInput placeholder="Product Name" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput placeholder="Price (BDT) Per Item" keyboardType="numeric" value={price} onChangeText={setPrice} style={styles.input} />
                    <TextInput placeholder="MOQ" keyboardType="numeric" value={moq} onChangeText={setMoq} style={styles.input} />
                    {/* <TextInput placeholder="Description" multiline value={description} onChangeText={setDescription} style={styles.textarea} /> */}
                    <RichTextEditor value={description} onChange={setDescription} />
                </View>

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
                                <View key={sEntry.label} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <View style={{ width: 60 }}><Text style={{ fontWeight: '600' }}>{sEntry.label}:</Text></View>
                                    <TextInput
                                        placeholder="Quantity"
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
                        style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>Upload Product</Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default ProductUpload;