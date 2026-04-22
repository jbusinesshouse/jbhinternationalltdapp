import { supabase } from "@/lib/supabase";
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CategoryProps = {
  id: string;
  name: string;
};

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderItem = ({ item }: { item: CategoryProps }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/categoryProducts/[query]",
          params: { query: item.id, name: item.name }
        })
      }
    >
      <Text style={styles.categoryText}>{item.name}</Text>
      {/* Simple Arrow using Text */}
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>All Categories</Text>

        {loading ? (
          <ActivityIndicator color="#000" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#1A1A1A",
  },
  list: {
    paddingBottom: 40,
  },
  categoryItem: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    // Subtle shadow for iOS/Android
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textTransform: "capitalize",
  },
  arrow: {
    fontSize: 18,
    color: "#AAA",
  },
});