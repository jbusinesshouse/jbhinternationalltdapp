import SingleProduct from '@/components/SingleProduct';
import { supabase } from '@/lib/supabase';
import { styles as prodStyles } from '@/styles/product';
import { styles } from '@/styles/search';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

type Product = {
    id: string;
    name: string;
    price: string;
    moq: number;
    productImg: string | null;
};

const Search = () => {
    const { width, height } = useWindowDimensions();
    const navigation = useNavigation();
    const { query } = useLocalSearchParams<{ query?: string }>();

    const [searchVal, setSearchVal] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const calculatedWidth = width - 30 - 50;
    const calculatedHeight = height - 50;

    // ✅ sync query from route
    useEffect(() => {
        if (query) {
            const decoded = decodeURIComponent(query);
            setSearchVal(decoded);
            fetchProducts(decoded);
        }
    }, [query]);

    const handleBackPress = () => {
        navigation.goBack();
    };

    // ✅ smart search builder
    const buildSearchTerms = (text: string) => {
        const clean = text.toLowerCase().trim();
        const parts = clean.split(/\s+/);
        const compact = clean.replace(/\s/g, '');

        return [...parts, clean, compact];
    };

    // ✅ fetch from DB
    const fetchProducts = async (search: string) => {
        if (!search.trim()) return;

        setLoading(true);

        try {
            const terms = buildSearchTerms(search);

            let queryBuilder = supabase
                .from('products')
                .select(`
                    id,
                    name,
                    price,
                    moq,
                    product_images (
                        image_url,
                        is_main
                    )
                `)
                .eq('is_deleted', false);

            const orQuery = terms
                .map(t => `name.ilike.%${t}%`)
                .join(',');

            const { data, error } = await queryBuilder.or(orQuery);

            if (error) {
                console.log('Search error:', error);
                setProducts([]);
                return;
            }

            const formatted: Product[] = (data || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                moq: p.moq,
                productImg:
                    p.product_images?.find((img: any) => img.is_main)?.image_url ||
                    null
            }));

            setProducts(formatted);
        } catch (err) {
            console.log('Search exception:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchProducts(searchVal);
    };

    const renderItem = ({ item }: { item: Product }) => (
        <SingleProduct
            productImg={
                item.productImg
                    ? { uri: item.productImg }
                    : require('@/assets/images/product1.png')
            }
            title={item.name}
            price={item.price}
            moq={item.moq}
            productId={item.id}
        />
    );

    const header = () => (
        <Text style={styles.searchForText}>
            Showing Results For{' '}
            <Text style={{ fontWeight: '600' }}>'{searchVal}'</Text>
        </Text>
    );

    return (
        <View>
            {/* HEADER */}
            <View style={prodStyles.productHead}>
                <Pressable onPress={handleBackPress}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={prodStyles.backIcon}
                    />
                </Pressable>

                <View style={{ ...prodStyles.searchWrapper, width: calculatedWidth }}>
                    <TextInput
                        value={searchVal}
                        onChangeText={setSearchVal}
                        style={prodStyles.searchInp}
                        placeholder="Search For Products"
                    />

                    <TouchableOpacity
                        style={prodStyles.searchBtn}
                        onPress={handleSearch}
                    >
                        <Image
                            source={require('@/assets/images/icons/search.png')}
                            style={prodStyles.searchImg}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* BODY */}
            <View style={{ height: calculatedHeight }}>
                <View style={styles.container}>
                    {loading ? (
                        <ActivityIndicator size="large" />
                    ) : (
                        <FlatList
                            data={products}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            ListHeaderComponent={header}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            columnWrapperStyle={styles.productWrap}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginTop: 50 }}>
                                    No products found
                                </Text>
                            }
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

export default Search;