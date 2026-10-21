import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type GridColumns = 2 | 3 | 4;
export type HomeMode = "products" | "manufacturers";
/** Product feed filter by seller store type. */
export type CatalogStoreType = "all" | "retail" | "wholesale";

type StoredCatalogPrefs = {
  gridColumns: GridColumns;
  /** true = category bar shows all rows wrapped */
  categoriesExpanded: boolean;
  storeType: CatalogStoreType;
};

type CatalogPrefs = StoredCatalogPrefs & {
  /** Session-only — always starts on Products at cold launch */
  homeMode: HomeMode;
};

const STORAGE_KEY = "@jbh/catalog_prefs_v6";

const DEFAULTS: CatalogPrefs = {
  gridColumns: 4,
  categoriesExpanded: false,
  storeType: "all",
  homeMode: "products",
};

function isCatalogStoreType(v: unknown): v is CatalogStoreType {
  return v === "all" || v === "retail" || v === "wholesale";
}

function isGridColumns(v: unknown): v is GridColumns {
  return v === 2 || v === 3 || v === 4;
}

async function readStoredPrefs(): Promise<StoredCatalogPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        gridColumns: DEFAULTS.gridColumns,
        categoriesExpanded: DEFAULTS.categoriesExpanded,
        storeType: DEFAULTS.storeType,
      };
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      gridColumns: isGridColumns(parsed.gridColumns)
        ? parsed.gridColumns
        : DEFAULTS.gridColumns,
      categoriesExpanded:
        typeof parsed.categoriesExpanded === "boolean"
          ? parsed.categoriesExpanded
          : DEFAULTS.categoriesExpanded,
      storeType: isCatalogStoreType(parsed.storeType)
        ? parsed.storeType
        : DEFAULTS.storeType,
    };
  } catch {
    return {
      gridColumns: DEFAULTS.gridColumns,
      categoriesExpanded: DEFAULTS.categoriesExpanded,
      storeType: DEFAULTS.storeType,
    };
  }
}

async function writeStoredPrefs(prefs: StoredCatalogPrefs) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // in-memory still works
  }
}

/**
 * Persists grid density + category expand.
 * homeMode is intentionally NOT persisted so cold start always opens Products.
 */
export function useCatalogPrefs() {
  const [prefs, setPrefs] = useState<CatalogPrefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readStoredPrefs();
      if (!cancelled) {
        setPrefs({
          ...stored,
          homeMode: "products",
        });
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLayout = useCallback((next: CatalogPrefs) => {
    void writeStoredPrefs({
      gridColumns: next.gridColumns,
      categoriesExpanded: next.categoriesExpanded,
      storeType: next.storeType,
    });
  }, []);

  const setGridColumns = useCallback(
    (gridColumns: GridColumns) => {
      setPrefs((prev) => {
        const next = { ...prev, gridColumns };
        persistLayout(next);
        return next;
      });
    },
    [persistLayout]
  );

  const setCategoriesExpanded = useCallback(
    (categoriesExpanded: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, categoriesExpanded };
        persistLayout(next);
        return next;
      });
    },
    [persistLayout]
  );

  const toggleCategoriesExpanded = useCallback(() => {
    setPrefs((prev) => {
      const next = {
        ...prev,
        categoriesExpanded: !prev.categoriesExpanded,
      };
      persistLayout(next);
      return next;
    });
  }, [persistLayout]);

  const setHomeMode = useCallback((homeMode: HomeMode) => {
    setPrefs((prev) => ({ ...prev, homeMode }));
  }, []);

  const setStoreType = useCallback(
    (storeType: CatalogStoreType) => {
      setPrefs((prev) => {
        const next = { ...prev, storeType };
        persistLayout(next);
        return next;
      });
    },
    [persistLayout]
  );

  return {
    ready,
    gridColumns: prefs.gridColumns,
    categoriesExpanded: prefs.categoriesExpanded,
    storeType: prefs.storeType,
    homeMode: prefs.homeMode,
    setGridColumns,
    setCategoriesExpanded,
    toggleCategoriesExpanded,
    setHomeMode,
    setStoreType,
  };
}
