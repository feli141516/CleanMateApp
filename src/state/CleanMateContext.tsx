import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "customer" | "cleaner" | "admin";

export type AppUser = {
  role: UserRole;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
};

export type ServiceSelection = {
  key: string;
  name: string;
  image: string;
  duration: string;
  price: number;
  propertyType: string;
};

export type CleanerSelection = {
  name: string;
  photo: string;
};

export type ScheduleSelection = {
  day: number;
  month: string;
  year: number;
  time: string;
};

export type Address = {
  id: string;
  label: "Rumah" | "Kos" | "Apartemen";
  fullAddress: string;
  detail?: string;
  recipient?: string;
  phone?: string;
};

export type PetSelection = {
  hasPet: boolean;
  type: string;
  count: number;
};

export type BookingDraft = {
  service: ServiceSelection;
  cleaner: CleanerSelection;
  schedule: ScheduleSelection;
  selectedAddressId: string;
  pet: PetSelection;
  paymentMethod: string;
  notes?: string;
};

export type OrderStatus = "upcoming" | "traveling" | "in_progress" | "completed" | "cancelled";

export type PaymentStatus = "prototype_paid" | "pending";
export type PayoutStatus = "not_eligible" | "eligible" | "paid";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  booking: BookingDraft;
  address: Address;
  customer: AppUser;
  paymentStatus: PaymentStatus;
  revenueSharePercent: number | null;
  payoutStatus: PayoutStatus;
  draftKey: string;
};

type StoredState = {
  addresses: Address[];
  draft: BookingDraft;
  orders: Order[];
  currentUser: AppUser | null;
  cleanerAvailability: Record<string, boolean>;
  revenueSharePercent: number | null;
};

type CleanMateContextValue = StoredState & {
  selectedAddress: Address;
  latestOrder?: Order;
  login: (role: UserRole, identifier: string) => void;
  logout: () => void;
  updateProfile: (changes: Partial<AppUser>) => void;
  updateDraft: (changes: Partial<BookingDraft>) => void;
  addAddress: (address: Omit<Address, "id">) => Address;
  removeAddress: (id: string) => void;
  confirmBooking: () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  assignCleaner: (id: string, cleaner: CleanerSelection) => void;
  setCleanerAvailability: (name: string, available: boolean) => void;
  setRevenueSharePercent: (percent: number | null) => void;
};

const STORAGE_KEY = "cleanmate-prototype-state-v2";
const LEGACY_STORAGE_KEY = "cleanmate-prototype-state-v1";

const customerProfile: AppUser = {
  role: "customer",
  name: "Jenni",
  email: "jenni@gmail.com",
  photo: "87e2c.png",
  phone: "08547897719",
};

const cleanerProfile: AppUser = {
  role: "cleaner",
  name: "Sinta",
  email: "sinta.cleaner@gmail.com",
  photo: "01a2c.png",
  phone: "0812 3456 7890",
};

const adminProfile: AppUser = {
  role: "admin",
  name: "Admin CleanMate",
  email: "admin@cleanmate.local",
};

const initialAddresses: Address[] = [
  {
    id: "kos-soekarno-hatta",
    label: "Kos",
    recipient: "Jenni",
    phone: "08547897719",
    fullAddress: "Jl. Soekarno Hatta No. 12, Malang",
    detail: "Pagar putih, dekat minimarket.",
  },
  {
    id: "apartemen-taman-melati",
    label: "Apartemen",
    recipient: "Jenni",
    phone: "08547897719",
    fullAddress: "Jl. Taman Melati No. 8, Malang",
  },
  {
    id: "rumah-ijen",
    label: "Rumah",
    recipient: "Jenni",
    phone: "08547897719",
    fullAddress: "Jl. Ijen No. 5, Malang",
    detail: "Rumah warna putih, dekat taman.",
  },
];

const initialDraft: BookingDraft = {
  service: {
    key: "room",
    name: "Room Cleaning",
    image: "8a793.png",
    duration: "2–3 jam",
    price: 50_000,
    propertyType: "Rumah",
  },
  cleaner: { name: "Sinta", photo: "01a2c.png" },
  schedule: { day: 16, month: "Oktober", year: 2026, time: "13.00" },
  selectedAddressId: initialAddresses[0].id,
  pet: { hasPet: true, type: "Kucing", count: 2 },
  paymentMethod: "GoPay",
};

const initialState: StoredState = {
  addresses: initialAddresses,
  draft: initialDraft,
  orders: [],
  currentUser: null,
  cleanerAvailability: { Sinta: true },
  revenueSharePercent: null,
};

const CleanMateContext = createContext<CleanMateContextValue | null>(null);

function readStoredState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return initialState;
    const value = JSON.parse(raw) as Partial<StoredState>;
    const addresses = (value.addresses ?? initialAddresses)
      .filter((address) => address.label !== ("Lainnya" as Address["label"]))
      .map((address) => ({ ...address, label: address.label as Address["label"] }));
    const orders = (value.orders ?? []).map((order) => ({
      ...order,
      customer: order.customer ?? customerProfile,
      paymentStatus: order.paymentStatus ?? "prototype_paid",
      revenueSharePercent: order.revenueSharePercent ?? null,
      payoutStatus: order.payoutStatus ?? "not_eligible",
      status:
        (order.status as string) === "processing"
          ? ("in_progress" as const)
          : (order.status as OrderStatus),
    }));
    return {
      ...initialState,
      ...value,
      addresses: addresses.length ? addresses : initialAddresses,
      draft: { ...initialDraft, ...value.draft },
      orders,
    };
  } catch {
    return initialState;
  }
}

function bookingKey(draft: BookingDraft) {
  return JSON.stringify(draft);
}

export function CleanMateProvider({ children }: { children: ReactNode }) {
  const stored = useMemo(readStoredState, []);
  const [addresses, setAddresses] = useState(stored.addresses);
  const [draft, setDraft] = useState(stored.draft);
  const [orders, setOrders] = useState(stored.orders);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(stored.currentUser);
  const [cleanerAvailability, setAvailability] = useState(stored.cleanerAvailability);
  const [revenueSharePercent, setSharePercent] = useState<number | null>(
    stored.revenueSharePercent,
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        addresses,
        draft,
        orders,
        currentUser,
        cleanerAvailability,
        revenueSharePercent,
      }),
    );
  }, [addresses, draft, orders, currentUser, cleanerAvailability, revenueSharePercent]);

  const selectedAddress =
    addresses.find((address) => address.id === draft.selectedAddressId) ?? addresses[0];

  const login = (role: UserRole, identifier: string) => {
    let profile =
      role === "customer" ? customerProfile : role === "cleaner" ? cleanerProfile : adminProfile;
    if (role === "cleaner") {
      const knownCleaners = [
        { name: "Andi", photo: "033c5.png" },
        { name: "Sinta", photo: "01a2c.png" },
        { name: "Bagos", photo: "1b17d.png" },
        { name: "Tiara", photo: "4af8a.png" },
      ];
      const match = knownCleaners.find((cleaner) =>
        identifier.toLowerCase().includes(cleaner.name.toLowerCase()),
      );
      if (match && match.name !== "Sinta") {
        profile = { role: "cleaner", name: match.name, photo: match.photo, email: identifier };
      }
    }
    setCurrentUser({ ...profile, email: identifier.includes("@") ? identifier : profile.email });
  };

  const logout = () => setCurrentUser(null);
  const updateProfile = (changes: Partial<AppUser>) => {
    setCurrentUser((current) => {
      if (!current) return current;
      if (current.role === "cleaner" && changes.name && changes.name !== current.name) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.booking.cleaner.name === current.name
              ? {
                  ...order,
                  booking: {
                    ...order.booking,
                    cleaner: { ...order.booking.cleaner, name: changes.name! },
                  },
                }
              : order,
          ),
        );
        setAvailability((availability) => ({
          ...availability,
          [changes.name!]: availability[current.name] ?? true,
        }));
      }
      return { ...current, ...changes, role: current.role };
    });
  };

  const updateDraft = (changes: Partial<BookingDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  const addAddress = (input: Omit<Address, "id">) => {
    const address = {
      ...input,
      id: `alamat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setAddresses((current) => [...current, address]);
    setDraft((current) => ({ ...current, selectedAddressId: address.id }));
    return address;
  };

  const removeAddress = (id: string) => {
    setAddresses((current) => {
      if (current.length === 1) return current;
      const next = current.filter((address) => address.id !== id);
      if (draft.selectedAddressId === id) {
        setDraft((currentDraft) => ({ ...currentDraft, selectedAddressId: next[0].id }));
      }
      return next;
    });
  };

  const confirmBooking = () => {
    const draftKey = bookingKey(draft);
    setOrders((current) => {
      if (current.some((order) => order.draftKey === draftKey && order.status !== "cancelled")) {
        return current;
      }
      const stamp = Date.now();
      const order: Order = {
        id: `CM${draft.schedule.year}${String(draft.schedule.day).padStart(2, "0")}-${String(
          stamp,
        ).slice(-4)}`,
        createdAt: new Date(stamp).toISOString(),
        status: "upcoming",
        booking: structuredClone(draft),
        address: structuredClone(selectedAddress),
        customer: structuredClone(currentUser?.role === "customer" ? currentUser : customerProfile),
        paymentStatus: "prototype_paid",
        revenueSharePercent,
        payoutStatus: "not_eligible",
        draftKey,
      };
      return [order, ...current];
    });
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
              revenueSharePercent:
                status === "completed" && order.revenueSharePercent === null
                  ? revenueSharePercent
                  : order.revenueSharePercent,
              payoutStatus:
                status === "completed" &&
                (order.revenueSharePercent ?? revenueSharePercent) !== null
                  ? "eligible"
                  : order.payoutStatus,
            }
          : order,
      ),
    );
  };

  const assignCleaner = (id: string, cleaner: CleanerSelection) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? { ...order, booking: { ...order.booking, cleaner }, draftKey: `${order.draftKey}-edit` }
          : order,
      ),
    );
  };

  const setCleanerAvailability = (name: string, available: boolean) => {
    setAvailability((current) => ({ ...current, [name]: available }));
  };

  const setRevenueSharePercent = (percent: number | null) => {
    const normalized = percent === null ? null : Math.min(100, Math.max(0, percent));
    setSharePercent(normalized);
    if (normalized !== null) {
      setOrders((current) =>
        current.map((order) =>
          order.revenueSharePercent === null && order.status !== "cancelled"
            ? {
                ...order,
                revenueSharePercent: normalized,
                payoutStatus: order.status === "completed" ? "eligible" : order.payoutStatus,
              }
            : order,
        ),
      );
    }
  };

  const value = useMemo(
    () => ({
      addresses,
      draft,
      orders,
      currentUser,
      cleanerAvailability,
      revenueSharePercent,
      selectedAddress,
      latestOrder: orders[0],
      login,
      logout,
      updateProfile,
      updateDraft,
      addAddress,
      removeAddress,
      confirmBooking,
      updateOrderStatus,
      assignCleaner,
      setCleanerAvailability,
      setRevenueSharePercent,
    }),
    [
      addresses,
      draft,
      orders,
      currentUser,
      cleanerAvailability,
      revenueSharePercent,
      selectedAddress,
    ],
  );

  return <CleanMateContext value={value}>{children}</CleanMateContext>;
}

export function useCleanMate() {
  const context = useContext(CleanMateContext);
  if (!context) throw new Error("useCleanMate must be used inside CleanMateProvider");
  return context;
}

export function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

export function formatSchedule(schedule: ScheduleSelection, includeRange = true) {
  const start = Number(schedule.time.replace(".", ""));
  const durationEnd = String(start + 200).padStart(4, "0");
  const end = `${durationEnd.slice(0, 2)}.${durationEnd.slice(2)}`;
  return `${schedule.day} ${schedule.month.slice(0, 3)} ${schedule.year}, ${schedule.time}${
    includeRange ? ` – ${end}` : ""
  }`;
}

export function orderStatusLabel(status: OrderStatus) {
  return {
    upcoming: "Akan Datang",
    traveling: "Dalam Perjalanan",
    in_progress: "Sedang Dikerjakan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  }[status];
}

export function customerStatus(status: OrderStatus) {
  if (status === "upcoming") return "upcoming";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "processing";
}

export function cleanerShare(order: Order) {
  return order.revenueSharePercent === null
    ? null
    : Math.round((order.booking.service.price * order.revenueSharePercent) / 100);
}
