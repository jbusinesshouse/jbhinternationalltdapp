import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // 1. Only use AsyncStorage on Mobile. 
        // On Web, Supabase will automatically use standard localStorage.
        storage: Platform.OS !== 'web' ? AsyncStorage : undefined,

        persistSession: true,
        autoRefreshToken: true,

        // 2. Disable this to prevent Supabase from looking for 'window.location' 
        // during the initial server-side render phase of Expo Router.
        detectSessionInUrl: false,
    },
});