import { type Href, useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const BANNER = require("@/assets/images/promotion-banner-final.png");
const ASPECT = 1024 / 572;
/** Home `mainContainer` uses paddingHorizontal: 12 on each side. */
const BANNER_WIDTH = Dimensions.get("window").width - 24;
const BANNER_HEIGHT = BANNER_WIDTH / ASPECT;

type Props = {
  href?: Href;
};

export default function WholesalePromoBanner({
  href = "/featuredRequest",
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => router.push(href)}
        accessibilityRole="button"
        accessibilityLabel="প্রোডাক্ট প্রমোশন অফার — অ্যাপে জমা দিন"
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <Image
          source={BANNER}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BANNER_WIDTH,
    marginBottom: 12,
    alignSelf: "center",
  },
  pressable: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E8F4F8",
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
});
