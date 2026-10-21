import StoreTypeFilter from '@/components/home/StoreTypeFilter';
import SingleProduct from '@/components/SingleProduct';
import {
    type CatalogStoreType,
    useCatalogPrefs,
} from '@/hooks/useCatalogPrefs';
import { searchProducts } from '@/lib/catalogApi';
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
    View,
} from 'react-native';

type Product = {
    id: string;
    name: string;
    price: string;
    moq: number;
    productImg: string | null;
};

function mapSearchProduct(p: any): Product {
    return {
        id: p.id,
        name: p.name,
        price: p.price,
        moq: p.moq,
        productImg:
            p.productImg ??
            p.product_images?.find((img: any) => img.is_main)?.image_url ??
            p.product_images?.[0]?.image_url ??
            null,
    };
}

const Search = () => {
    const { width, height } = useWindowDimensions();
    const navigation = useNavigation();
    const { query } = useLocalSearchParams<{ query?: string }>();
    const { storeType, setStoreType } = useCatalogPrefs();

    const [searchVal, setSearchVal] = useState('');
    /** Query actually sent to the API (route param or last Search tap). */
    const [activeQuery, setActiveQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const calculatedWidth = width - 30 - 50;
    const calculatedHeight = height - 50;

    useEffect(() => {
        if (!query) return;
        const decoded = decodeURIComponent(query);
        setSearchVal(decoded);
        setActiveQuery(decoded);
    }, [query]);

    useEffect(() => {
        const term = activeQuery.trim();
        if (!term) return;

        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const data = await searchProducts(term, { storeType });
                if (!cancelled) {
                    setProducts((data || []).map(mapSearchProduct));
                }
            } catch (err) {
                if (__DEV__) {
                    console.log('Search exception:', err);
                }
                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [activeQuery, storeType]);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleSearch = () => {
        setActiveQuery(searchVal.trim());
    };

    const handleStoreTypeChange = (next: CatalogStoreType) => {
        setStoreType(next);
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
        <View>
            <Text style={styles.searchForText}>
                Showing Results For{' '}
                <Text style={{ fontWeight: '600' }}>'{activeQuery || searchVal}'</Text>
            </Text>
            <View style={{ marginTop: 12, marginBottom: 4 }}>
                <StoreTypeFilter
                    value={storeType}
                    onChange={handleStoreTypeChange}
                />
            </View>
        </View>
    );

    return (
        <View>
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
                        placeholderTextColor="#9CA3AF"
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
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
