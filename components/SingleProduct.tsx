import type { GridColumns } from "@/hooks/useCatalogPrefs";
import { Link } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type ProductProps = {
  productImg: ImageSourcePropType;
  title: string;
  price: string;
  moq: number;
  productId: string;
  sponsored?: boolean;
  columns?: GridColumns;
  contentInset?: number;
  columnGap?: number;
};

function resolveGap(columns: GridColumns, override?: number) {
  if (typeof override === "number") return override;
  if (columns === 4) return 6;
  if (columns === 3) return 8;
  return 12;
}

const SingleProduct = ({
  productImg,
  title,
  price,
  moq,
  productId,
  sponsored = false,
  columns = 2,
  contentInset = 24,
  columnGap,
}: ProductProps) => {
  const { width } = useWindowDimensions();
  const gap = resolveGap(columns, columnGap);
  const available = Math.max(width - contentInset, 0);
  const calculatedWidth = (available - gap * (columns - 1)) / columns;
  const dense = columns >= 3;

  return (
    <Link
      href={{
        pathname: "/product/[id]",
        params: { id: productId },
      }}
      style={{ ...styles.container, width: calculatedWidth }}
    >
      <View
        style={{
          ...styles.productImgWrapper,
          height: Math.max(calculatedWidth, 72),
        }}
      >
        <Image source={productImg} style={styles.productImg} />
        {sponsored ? (
          <View
            style={[styles.promotedBadge, dense && styles.promotedBadgeDense]}
          >
            <View style={styles.promotedDot} />
            {!dense ? (
              <Text style={styles.promotedText}>Promoted</Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <View
        style={[styles.productTextWrap, dense && styles.productTextWrapDense]}
      >
        {sponsored && !dense ? (
          <Text style={styles.promotedCaption}>Promoted</Text>
        ) : null}
        <Text
          style={[styles.productTitle, dense && styles.productTitleDense]}
          numberOfLines={dense ? 1 : sponsored ? 1 : 2}
        >
          {title}
        </Text>
        <Text
          style={[styles.productPrice, dense && styles.productPriceDense]}
        >
          BDT {price}
        </Text>
        <Text style={[styles.moq, dense && styles.moqDense]}>MOQ {moq}</Text>
      </View>
    </Link>
  );
};

export default SingleProduct;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF0F3",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productImgWrapper: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  promotedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245, 131, 43, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promotedBadgeDense: {
    top: 6,
    left: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  promotedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ffffff",
  },
  promotedText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  promotedCaption: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f5832b",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  productTextWrap: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  productTextWrapDense: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 8,
  },
  productTitle: {
    fontSize: 13,
    marginBottom: 5,
    color: "#111827",
    fontWeight: "500",
    lineHeight: 17,
    minHeight: 18,
  },
  productTitleDense: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 3,
    minHeight: 14,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
    color: "#111827",
  },
  productPriceDense: {
    fontSize: 12,
    marginBottom: 2,
  },
  moq: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  moqDense: {
    fontSize: 10,
  },
});
