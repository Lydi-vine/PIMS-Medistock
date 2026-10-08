import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  categories as seedCategories,
  medicines as seedMedicines,
  movements as seedMovements,
  sales as seedSales,
} from "./mockData.js";

const KEY = "pharmacy-inventory-v1";

export const nextId = (prefix, existing) => {
  const max = existing.reduce((acc, item) => {
    const n = parseInt(item.id.split("-")[1] ?? "0", 10);
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
};

const seed = () => ({
  medicines: seedMedicines,
  categories: seedCategories,
  movements: seedMovements,
  sales: seedSales,
});

const PharmacyContext = createContext(null);

export function PharmacyProvider({ children }) {
  const [data, setState] = useState(seed);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
      else localStorage.setItem(KEY, JSON.stringify(seed()));
    } catch {
      /* ignore corrupted storage */
    }
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const setData = useCallback((updater) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage full or unavailable */
      }
      return next;
    });
  }, []);

  const resetData = useCallback(() => {
    const fresh = seed();
    try {
      localStorage.setItem(KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
    setState(fresh);
  }, []);

  const saveMedicine = useCallback(
    (values, id) => {
      setData((prev) => {
        if (id) {
          return {
            ...prev,
            medicines: prev.medicines.map((m) => (m.id === id ? { ...m, ...values } : m)),
          };
        }
        const medicine = {
          ...values,
          id: nextId("MED", prev.medicines),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        return { ...prev, medicines: [medicine, ...prev.medicines] };
      });
    },
    [setData],
  );

  const deleteMedicine = useCallback(
    (id) => {
      setData((prev) => ({
        ...prev,
        medicines: prev.medicines.filter((m) => m.id !== id),
      }));
    },
    [setData],
  );

  const saveCategory = useCallback(
    (values, id) => {
      setData((prev) => {
        if (id) {
          return {
            ...prev,
            categories: prev.categories.map((c) => (c.id === id ? { ...c, ...values } : c)),
          };
        }
        const category = { ...values, id: nextId("CAT", prev.categories) };
        return { ...prev, categories: [...prev.categories, category] };
      });
    },
    [setData],
  );

  const deleteCategory = useCallback(
    (id) => {
      setData((prev) => {
        if (prev.medicines.some((m) => m.categoryId === id)) return prev;
        return { ...prev, categories: prev.categories.filter((c) => c.id !== id) };
      });
    },
    [setData],
  );

  const recordMovement = useCallback(
    (input) => {
      let result = { ok: true };
      setData((prev) => {
        const med = prev.medicines.find((m) => m.id === input.medicineId);
        if (!med) {
          result = { ok: false, error: "Medicine not found" };
          return prev;
        }
        if (input.quantity <= 0) {
          result = { ok: false, error: "Quantity must be greater than zero" };
          return prev;
        }
        const signed =
          input.type === "Stock In" || input.type === "Return" ? input.quantity : -input.quantity;
        const newStock = med.quantity + signed;
        if (newStock < 0) {
          result = { ok: false, error: "Not enough stock for this movement" };
          return prev;
        }
        const movement = {
          id: nextId("MOV", prev.movements),
          medicineId: med.id,
          batchNumber: med.batchNumber,
          type: input.type,
          quantity: input.quantity,
          previousStock: med.quantity,
          newStock,
          date: new Date().toISOString().slice(0, 10),
          user: input.user,
          reason: input.reason,
        };
        return {
          ...prev,
          medicines: prev.medicines.map((m) => (m.id === med.id ? { ...m, quantity: newStock } : m)),
          movements: [movement, ...prev.movements],
        };
      });
      return result;
    },
    [setData],
  );

  const recordSale = useCallback(
    (input) => {
      let result = { ok: true };
      setData((prev) => {
        const med = prev.medicines.find((m) => m.id === input.medicineId);
        if (!med) {
          result = { ok: false, error: "Medicine not found" };
          return prev;
        }
        if (input.quantity <= 0) {
          result = { ok: false, error: "Quantity must be greater than zero" };
          return prev;
        }
        if (input.quantity > med.quantity) {
          result = { ok: false, error: "Insufficient stock for this sale" };
          return prev;
        }
        const newStock = med.quantity - input.quantity;
        const sale = {
          id: nextId("SAL", prev.sales),
          date: input.date,
          medicineId: med.id,
          quantity: input.quantity,
          unitPrice: med.unitPrice,
          total: input.quantity * med.unitPrice,
          customer: input.customer,
          staff: input.staff,
          paymentMethod: input.paymentMethod,
        };
        const movement = {
          id: nextId("MOV", prev.movements),
          medicineId: med.id,
          batchNumber: med.batchNumber,
          type: "Stock Out",
          quantity: input.quantity,
          previousStock: med.quantity,
          newStock,
          date: input.date,
          user: input.staff,
          reason: `Sale ${sale.id}`,
        };
        return {
          ...prev,
          medicines: prev.medicines.map((m) => (m.id === med.id ? { ...m, quantity: newStock } : m)),
          sales: [sale, ...prev.sales],
          movements: [movement, ...prev.movements],
        };
      });
      return result;
    },
    [setData],
  );

  const value = useMemo(
    () => ({
      data,
      loading,
      setData,
      resetData,
      saveMedicine,
      deleteMedicine,
      saveCategory,
      deleteCategory,
      recordMovement,
      recordSale,
    }),
    [
      data,
      loading,
      setData,
      resetData,
      saveMedicine,
      deleteMedicine,
      saveCategory,
      deleteCategory,
      recordMovement,
      recordSale,
    ],
  );
  return <PharmacyContext.Provider value={value}>{children}</PharmacyContext.Provider>;
}

export function usePharmacy() {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be used inside PharmacyProvider");
  return ctx;
}

/* ---------- derived helpers ---------- */

export const DAY = 86400000;
export const today = () => new Date(new Date().toISOString().slice(0, 10)).getTime();

export const daysUntilExpiry = (m) =>
  Math.round((new Date(m.expirationDate).getTime() - today()) / DAY);

export const isExpired = (m) => daysUntilExpiry(m) < 0;
export const isNearExpiry = (m) => {
  const d = daysUntilExpiry(m);
  return d >= 0 && d <= 30;
};
export const isLowStock = (m) => m.quantity <= m.reorderLevel;

export function medicineStatus(m) {
  if (isExpired(m)) return "Expired";
  if (m.quantity === 0) return "Out of Stock";
  if (isLowStock(m)) return "Low Stock";
  if (isNearExpiry(m)) return "Near Expiry";
  return "Active";
}

export const formatRWF = (n) => `RWF ${Math.round(n).toLocaleString("en-US")}`;

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function useCategoryName() {
  const { data } = usePharmacy();
  return useCallback(
    (id) => data.categories.find((c) => c.id === id)?.name ?? "Uncategorised",
    [data.categories],
  );
}

export function useMedicineName() {
  const { data } = usePharmacy();
  return useCallback(
    (id) => data.medicines.find((m) => m.id === id)?.name ?? "Unknown medicine",
    [data.medicines],
  );
}
