import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";

// Previous promotion banner (commented out for now):
// import { type Href, useRouter } from "expo-router";
// import { Pressable } from "react-native";
// const BANNER = require("@/assets/images/promotion-banner-fixed.png");
// const ASPECT = 1024 / 572;

const MARKET_IMAGES: ImageSourcePropType[] = [
  require("@/assets/images/market-img-1.jpg"),
  require("@/assets/images/market-img-2.jpg"),
  require("@/assets/images/market-img-3.jpg"),
  require("@/assets/images/market-img-4.jpg"),
];

/** ~1268×832 market images */
const ASPECT = 1268 / 832;
/** Home `mainContainer` uses paddingHorizontal: 12 on each side. */
const BANNER_WIDTH = Dimensions.get("window").width - 24;
const BANNER_HEIGHT = BANNER_WIDTH / ASPECT;

type Props = {
  /** Kept for API compatibility; promo link is disabled while market carousel is shown. */
  href?: string;
};

export default function WholesalePromoBanner(_props: Props) {
  const progress = useSharedValue(0);

  // Previous promotion pressable link (commented out for now):
  // const router = useRouter();
  // const { href = "/featuredRequest" } = _props;
  // return (
  //   <View style={styles.wrap}>
  //     <Pressable
  //       onPress={() => router.push(href as Href)}
  //       accessibilityRole="button"
  //       accessibilityLabel="প্রোডাক্ট প্রমোশন অফার — অ্যাপে জমা দিন"
  //       style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
  //     >
  //       <Image
  //         source={BANNER}
  //         style={styles.image}
  //         resizeMode="contain"
  //         accessibilityIgnoresInvertColors
  //       />
  //     </Pressable>
  //   </View>
  // );

  return (
    <View style={styles.wrap}>
      <View style={styles.carouselFrame}>
        <Carousel
          width={BANNER_WIDTH}
          height={BANNER_HEIGHT}
          data={MARKET_IMAGES}
          loop
          pagingEnabled
          snapEnabled
          autoPlay
          autoPlayInterval={4000}
          onProgressChange={progress}
          renderItem={({ item }) => (
            <Image
              source={item}
              style={styles.image}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          )}
        />
        <Pagination.Basic
          progress={progress}
          data={MARKET_IMAGES}
          size={8}
          dotStyle={styles.dot}
          activeDotStyle={styles.dotActive}
          containerStyle={styles.dots}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BANNER_WIDTH,
    marginBottom: 12,
    alignSelf: "center",
  },
  carouselFrame: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E8F4F8",
  },
  // pressable: {
  //   width: BANNER_WIDTH,
  //   height: BANNER_HEIGHT,
  //   borderRadius: 10,
  //   overflow: "hidden",
  //   backgroundColor: "#E8F4F8",
  // },
  // pressed: {
  //   opacity: 0.92,
  // },
  image: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  dots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
});
