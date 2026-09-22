import { fetchMyOrders } from "@/lib/catalogApi";
import { useCallback, useEffect, useState } from "react";

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(data || []);
    } catch (err) {
      if (__DEV__) {
        console.log("Fetch orders error:", err);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    init();
  }, []);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  return { orders, loading, refreshing, refetch };
};
