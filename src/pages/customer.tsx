import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  A,
  AppPage,
  BottomNav,
  Field,
  Icon,
  PageHeader,
  PrimaryButton,
  StatusBar,
  Tag,
} from "../components/ui";
import {
  customerStatus,
  formatRupiah,
  formatSchedule,
  type UserRole,
  useCleanMate,
} from "../state/CleanMateContext";

function Crop({ className, imageClass }: { className: string; imageClass: string }) {
  return (
    <div className={className} aria-hidden="true">
      <img className={imageClass} src={`${A}/9147d.png`} alt="" />
    </div>
  );
}

export function SplashScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate("/onboarding"), 1800);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <main className="splash-screen" onClick={() => navigate("/onboarding")}>
      <StatusBar />
      <Crop className="curtain-background" imageClass="curtain-image" />
      <Crop className="living-room" imageClass="living-room-image" />
      <div className="cleanmate-brand">
        <img className="cleanmate-symbol" src={`${A}/6add8.svg`} alt="" />
        <h1>CleanMate</h1>
        <p>Rumah Bersih, Semua Bahagia</p>
      </div>
      <div className="loading-track">
        <span className="loading-progress" />
      </div>
    </main>
  );
}

export function OnboardingPage() {
  return (
    <AppPage className="onboarding-page">
      <section className="onboarding-copy">
        <h1>Bersih Tanpa Ribet, Tetap Ramah untuk Hewan</h1>
        <p>Layanan cleaning yang praktis dan nyaman untuk Anda dan hewan peliharaan.</p>
      </section>
      <div className="onboarding-photo">
        <img src={`${A}/9147d.png`} alt="Ruang keluarga yang bersih" />
      </div>
      <div className="dots">
        <b />
        <i />
        <i />
      </div>
      <div className="bottom-action">
        <PrimaryButton to="/login">Lanjut</PrimaryButton>
      </div>
    </AppPage>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useCleanMate();
  const [visible, setVisible] = useState(false);
  const [access, setAccess] = useState<"customer" | "operational">(
    searchParams.get("akses") === "operasional" ? "operational" : "customer",
  );
  const [operationalRole, setOperationalRole] = useState<"cleaner" | "admin">("cleaner");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const role: UserRole = access === "customer" ? "customer" : operationalRole;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    login(role, identifier.trim());
    navigate(role === "customer" ? "/home" : role === "cleaner" ? "/cleaner" : "/admin");
  };
  return (
    <AppPage className="login-page new-login-page">
      <button className="bare-back" onClick={() => navigate(-1)} aria-label="Kembali">
        ‹
      </button>
      <section className="login-brand">
        <Icon name="228ca.svg" />
        <h1>CleanMate</h1>
        <p>Kerja Rapi, Pelanggan Happy</p>
      </section>
      <section className="login-heading">
        <h2>Masuk ke CleanMate</h2>
        <p>Selamat datang! Silakan masuk untuk melanjutkan.</p>
      </section>
      <b className="access-label">Masuk sebagai</b>
      <div className="access-choice">
        <button
          className={access === "customer" ? "active" : ""}
          onClick={() => {
            setAccess("customer");
            navigate("/login", { replace: true });
          }}
          type="button"
        >
          <span>♙</span>
          Customer
        </button>
        <button
          className={access === "operational" ? "active" : ""}
          onClick={() => {
            setAccess("operational");
            navigate("/login?akses=operasional", { replace: true });
          }}
          type="button"
        >
          <span>♧</span>
          Cleaner & Admin
        </button>
      </div>
      {access === "operational" && (
        <div className="operational-role" aria-label="Jenis akun operasional">
          <button
            className={operationalRole === "cleaner" ? "active" : ""}
            onClick={() => setOperationalRole("cleaner")}
            type="button"
          >
            Cleaner
          </button>
          <button
            className={operationalRole === "admin" ? "active" : ""}
            onClick={() => setOperationalRole("admin")}
            type="button"
          >
            Admin
          </button>
        </div>
      )}
      <form onSubmit={submit}>
        <Field
          icon="43af5.svg"
          placeholder="Email atau nomor telepon"
          value={identifier}
          onChange={setIdentifier}
        />
        <div className="password-field">
          <Field
            icon="395f6.svg"
            type={visible ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={setPassword}
          />
          <button type="button" onClick={() => setVisible(!visible)}>
            <Icon name="8ec5d.svg" />
          </button>
        </div>
        <button
          type="button"
          className="forgot"
          onClick={() =>
            setAuthNotice("Pemulihan password memerlukan layanan autentikasi yang belum terhubung.")
          }
        >
          Lupa password?
        </button>
        <PrimaryButton type="submit">Masuk</PrimaryButton>
      </form>
      {access === "customer" && (
        <>
          <p className="separator">atau lanjut dengan</p>
          <button
            className="social-button"
            type="button"
            onClick={() => setAuthNotice("Login Google belum terhubung pada prototipe lokal.")}
          >
            <Icon name="8fdd7.svg" />
            Google
          </button>
          <button
            className="social-button"
            type="button"
            onClick={() => setAuthNotice("Login Apple belum terhubung pada prototipe lokal.")}
          >
            <Icon name="0128f.svg" />
            Apple
          </button>
          <p className="register">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() =>
                setAuthNotice(
                  "Pendaftaran akun memerlukan backend autentikasi yang belum terhubung.",
                )
              }
            >
              Daftar
            </button>
          </p>
        </>
      )}
      {authNotice && (
        <p className="auth-notice" role="status">
          {authNotice}
        </p>
      )}
      <small className="prototype-note">
        Mode demonstrasi lokal. Email dan password tidak wajib diisi. Autentikasi pihak ketiga dan
        sinkronisasi antarperangkat belum terhubung.
      </small>
    </AppPage>
  );
}

const categories = [
  ["Kos", "498b3.svg", "/layanan/kos"],
  ["Rumah", "3e1c9.svg", "/layanan/rumah"],
  ["Apartemen", "e7982.svg", "/layanan/apartemen"],
];
export function HomePage() {
  return (
    <AppPage bottomNav={<BottomNav active="Home" />} className="home-page">
      <header className="location-header">
        <div>
          <Icon name="cdb6e.svg" />
          <b>Malang, Jawa Timur</b>
        </div>
        <span className="notification-icon">
          <Icon name="5732d.svg" />
          <Icon name="eec70.svg" />
        </span>
      </header>
      <div className="search">
        <Icon name="8b5b3.svg" />
        <span>Cari layanan atau lokasi...</span>
      </div>
      <section className="hero-card">
        <div>
          <h1>
            Rumah Bersih,
            <br />
            Aktivitas Lebih Fokus
          </h1>
          <p>
            Jasa cleaning profesional
            <br />
            yang pet-friendly.
          </p>
          <Link to="/layanan/rumah">Book Now</Link>
        </div>
        <div className="hero-photo" aria-hidden="true">
          <img src={`${A}/9147d.png`} alt="" />
        </div>
        <div className="hero-blend" />
      </section>
      <div className="dots small">
        <b />
        <i />
        <i />
      </div>
      <h2>Kategori Layanan</h2>
      <div className="category-grid">
        {categories.map(([label, icon, to]) => (
          <Link to={to} key={label}>
            <Icon name={icon} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <h2>Promo</h2>
      <section className="promo-card">
        <div>
          <b>Diskon 20%</b>
          <span>untuk booking pertama</span>
        </div>
        <div className="promo-photo" aria-hidden="true">
          <img src={`${A}/9147d.png`} alt="" />
        </div>
      </section>
    </AppPage>
  );
}

type Service = { key: string; name: string; image: string; duration: string; pet?: boolean };
const services: Service[] = [
  { key: "room", name: "Room Cleaning", image: "8a793.png", duration: "2–3 jam" },
  { key: "deep", name: "Deep Cleaning", image: "ae6d8.png", duration: "3–4 jam", pet: true },
  { key: "bathroom", name: "Bathroom Cleaning", image: "b7d5e.png", duration: "1–2 jam" },
  { key: "kitchen", name: "Kitchen Cleaning", image: "33d21.png", duration: "1–2 jam" },
  {
    key: "pet-area",
    name: "Pet Area Cleaning",
    image: "b48a4.png",
    duration: "2–4 jam",
    pet: true,
  },
];
const prices: Record<string, string[]> = {
  kos: ["Rp 30.000", "Rp 75.000", "Rp 20.000", "Rp 35.000"],
  rumah: ["Rp 50.000", "Rp 200.000", "Rp 40.000", "Rp 75.000", "Rp 60.000"],
  apartemen: ["Rp 45.000", "Rp 150.000", "Rp 35.000", "Rp 60.000", "Rp 50.000"],
};
const priceValues: Record<string, number[]> = {
  kos: [30_000, 75_000, 20_000, 35_000],
  rumah: [50_000, 200_000, 40_000, 75_000, 60_000],
  apartemen: [45_000, 150_000, 35_000, 60_000, 50_000],
};

export function ServicesPage() {
  const { type = "rumah" } = useParams();
  const list = type === "kos" ? services.filter((s) => s.key !== "kitchen") : services;
  return (
    <AppPage bottomNav={<BottomNav active="Layanan" />} className="services-page">
      <PageHeader title={`Layanan - ${type[0].toUpperCase()}${type.slice(1)}`} />
      <div className="search">
        <Icon name="74496.svg" />
        <span>Cari layanan...</span>
      </div>
      <div className="segment">
        {["kos", "rumah", "apartemen"].map((item) => (
          <Link className={type === item ? "active" : ""} to={`/layanan/${item}`} key={item}>
            {item[0].toUpperCase() + item.slice(1)}
          </Link>
        ))}
      </div>
      <div className="service-list">
        {list.map((service, index) => (
          <Link
            to={`/detail/${service.key}?type=${type}`}
            className="service-row"
            key={service.key}
          >
            <img src={`${A}/${service.image}`} alt="" />
            <div>
              <h3>{service.name}</h3>
              <b>{prices[type]?.[index]}</b>
              <span>{service.duration}</span>
            </div>
            {service.pet && <Tag>Pet-Friendly</Tag>}
          </Link>
        ))}
      </div>
    </AppPage>
  );
}

const details: Record<
  string,
  {
    name: string;
    image: string;
    duration: string;
    price: string;
    description: string;
    items: string[];
    note: string;
    sub: string;
  }
> = {
  room: {
    name: "Room Cleaning",
    image: "8a793.png",
    duration: "2–3 jam",
    price: "Rp 50.000",
    description:
      "Pembersihan kamar secara menyeluruh, termasuk lantai, meja, tempat tidur, lemari, debu, dan area umum.",
    items: ["Lantai", "Meja & kursi", "Tempat tidur", "Lemari & rak", "Debu & area umum"],
    note: "Aman untuk rumah dengan hewan peliharaan",
    sub: "Cleaner kami terbiasa bekerja di lingkungan yang memiliki hewan peliharaan.",
  },
  bathroom: {
    name: "Bathroom Cleaning",
    image: "b7d5e.png",
    duration: "1–2 jam",
    price: "Rp 40.000",
    description:
      "Pembersihan kamar mandi, termasuk kloset, wastafel, lantai, dinding, dan kaca untuk mengangkat noda sabun serta kerak.",
    items: ["Kloset", "Wastafel", "Lantai & dinding", "Kaca & cermin", "Kerak & saluran air"],
    note: "Kamar mandi bersih, hewan terlindungi",
    sub: "Jauhkan hewan dari kamar mandi hingga lantai kering dan pembersihan selesai.",
  },
  kitchen: {
    name: "Kitchen Cleaning",
    image: "33d21.png",
    duration: "2–4 jam",
    price: "Rp 75.000",
    description:
      "Pembersihan dapur secara menyeluruh, termasuk kompor, meja dapur, bak cuci, lemari bagian luar, serta lantai berminyak.",
    items: ["Kompor", "Meja dapur", "Bak cuci", "Luar lemari", "Lantai & noda minyak"],
    note: "Dapur bersih, aman bersama hewan",
    sub: "Amankan makanan dan tempatkan hewan di luar dapur selama pembersihan.",
  },
  deep: {
    name: "Deep Cleaning",
    image: "ae6d8.png",
    duration: "3–4 jam",
    price: "Rp 200.000",
    description:
      "Pembersihan mendalam yang menggunakan disinfektan untuk membersihkan kotoran membandel, debu di sudut ruangan, serta noda pada lantai dan perabot.",
    items: [
      "Lantai & sudut",
      "Meja & kursi",
      "Kaca & jendela",
      "Lemari & rak",
      "Debu & noda membandel",
      "Disinfektan",
    ],
    note: "Bersih menyeluruh, hewan tetap nyaman",
    sub: "Tempatkan hewan di area terpisah selama pembersihan mendalam berlangsung.",
  },
  "pet-area": {
    name: "Pet Area Cleaning",
    image: "b48a4.png",
    duration: "2–4 jam",
    price: "Rp 60.000",
    description:
      "Pembersihan area hewan peliharaan, termasuk kandang, alas tidur, tempat makan, bulu yang rontok, serta noda dan bau.",
    items: ["Kandang", "Alas tidur", "Tempat makan", "Bulu rontok", "Lantai, noda & bau"],
    note: "Nyaman untuk hewan kesayangan",
    sub: "Petugas kami terbiasa dengan hewan. Informasikan jenis dan kebiasaannya.",
  },
};
export function ServiceDetailPage() {
  const navigate = useNavigate();
  const { service = "room" } = useParams();
  const [searchParams] = useSearchParams();
  const { updateDraft } = useCleanMate();
  const d = details[service] ?? details.room;
  const propertyType = searchParams.get("type") ?? "rumah";
  const availableServices =
    propertyType === "kos" ? services.filter((item) => item.key !== "kitchen") : services;
  const serviceIndex = Math.max(
    0,
    availableServices.findIndex((item) => item.key === service),
  );
  const price = priceValues[propertyType]?.[serviceIndex] ?? Number(d.price.replace(/\D/g, ""));
  const chooseService = () => {
    updateDraft({
      service: {
        key: service,
        name: d.name,
        image: d.image,
        duration: d.duration,
        price,
        propertyType: propertyType[0].toUpperCase() + propertyType.slice(1),
      },
    });
    navigate("/pilih-cleaner");
  };
  return (
    <AppPage className="detail-page">
      <div className="detail-hero">
        <img src={`${A}/${d.image}`} alt={d.name} />
        <button onClick={() => navigate(-1)}>‹</button>
        <span>♡</span>
      </div>
      <div className="title-tag">
        <h1>{d.name}</h1>
        <Tag>Pet-Friendly</Tag>
      </div>
      <p className="muted">{d.duration}</p>
      <h2 className="price">{formatRupiah(price)}</h2>
      <p className="detail-description">{d.description}</p>
      <h2>Yang Dibersihkan</h2>
      <div className="clean-grid">
        {d.items.map((item) => (
          <span key={item}>
            ⌂ <small>{item}</small>
          </span>
        ))}
      </div>
      <div className="pet-note">
        <Icon name="736c6.svg" />
        <div>
          <b>{d.note}</b>
          <small>{d.sub}</small>
        </div>
      </div>
      <div className="bottom-action">
        <PrimaryButton onClick={chooseService}>Pilih Cleaner</PrimaryButton>
      </div>
    </AppPage>
  );
}

const cleaners = [
  ["Andi", "033c5.png", "Spesialis: & Apartemen"],
  ["Sinta", "01a2c.png", "Spesialis: & Apartemen"],
  ["Bagos", "1b17d.png", "Spesialis: Deep Cleaning"],
  ["Tiara", "4af8a.png", "Spesialis: & Apartemen"],
];
export function CleanerSelectPage() {
  const navigate = useNavigate();
  const { updateDraft } = useCleanMate();
  return (
    <AppPage className="form-page">
      <PageHeader title="Pilih Cleaner" />
      <p className="lead">
        Pilih cleaner yang tersedia sesuai jadwal. Semua cleaner kami ramah terhadap hewan
        peliharaan.
      </p>
      <div className="cleaner-list">
        {cleaners.map(([name, photo, specialty], index) => (
          <div className="cleaner-row" key={name}>
            <img src={`${A}/${photo}`} alt={name} />
            <div>
              <h3>{name}</h3>
              <span>{specialty}</span>
            </div>
            {index < 2 && <Tag>Pet-Friendly</Tag>}
            <PrimaryButton
              onClick={() => {
                updateDraft({ cleaner: { name, photo } });
                navigate("/pilih-jadwal");
              }}
            >
              Pilih
            </PrimaryButton>
          </div>
        ))}
      </div>
    </AppPage>
  );
}

export const days = Array.from({ length: 31 }, (_, i) => i + 1);
export function SchedulePage() {
  const { draft, orders, updateDraft } = useCleanMate();
  const day = draft.schedule.day;
  const time = draft.schedule.time;
  const setSchedule = (changes: Partial<typeof draft.schedule>) =>
    updateDraft({ schedule: { ...draft.schedule, ...changes } });
  return (
    <AppPage className="form-page">
      <PageHeader title="Pilih Jadwal" />
      <h2>
        Oktober 2026 <span className="next">›</span>
      </h2>
      <div className="calendar">
        <div className="week">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="days">
          <i />
          <i />
          <i />
          {days.map((d) => (
            <button
              className={day === d ? "active" : ""}
              onClick={() => setSchedule({ day: d })}
              key={d}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <h2>Pilih Waktu</h2>
      <div className="time-grid">
        {["09.00", "11.00", "13.00", "15.00", "17.00", "19.00"].map((t) => {
          const unavailable = orders.some(
            (order) =>
              order.status !== "cancelled" &&
              order.booking.cleaner.name === draft.cleaner.name &&
              order.booking.schedule.day === day &&
              order.booking.schedule.month === draft.schedule.month &&
              order.booking.schedule.year === draft.schedule.year &&
              order.booking.schedule.time === t,
          );
          return (
            <button
              className={time === t ? "active" : ""}
              onClick={() => setSchedule({ time: t })}
              disabled={unavailable}
              key={t}
            >
              {t}
              {unavailable && <small>Tidak tersedia</small>}
            </button>
          );
        })}
      </div>
      <div className="bottom-action">
        <PrimaryButton to="/alamat-layanan">Lanjut</PrimaryButton>
      </div>
    </AppPage>
  );
}

export function AddressPage() {
  const { addresses, draft, updateDraft } = useCleanMate();
  return (
    <AppPage className="form-page">
      <PageHeader title="Alamat Layanan" />
      <p className="lead">Masukkan alamat lengkap untuk layanan cleaning.</p>
      <h2>Alamat Tersimpan</h2>
      <div className="radio-list">
        {addresses.map((address) => (
          <button onClick={() => updateDraft({ selectedAddressId: address.id })} key={address.id}>
            <i className={draft.selectedAddressId === address.id ? "selected" : ""} />
            <span>
              <b>{address.label}</b>
              <small>{address.fullAddress}</small>
              {(address.recipient || address.phone) && (
                <small>{[address.recipient, address.phone].filter(Boolean).join(" · ")}</small>
              )}
            </span>
          </button>
        ))}
      </div>
      <Link className="add-link" to="/tambah-alamat">
        ＋ Tambah Alamat Baru
      </Link>
      <div className="bottom-action">
        <PrimaryButton to="/hewan-peliharaan">Lanjut</PrimaryButton>
      </div>
    </AppPage>
  );
}

export function AddAddressPage() {
  const navigate = useNavigate();
  const { addAddress } = useCleanMate();
  const [label, setLabel] = useState<"Rumah" | "Kos" | "Apartemen">("Rumah");
  const [fullAddress, setFullAddress] = useState("");
  const [detail, setDetail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!fullAddress.trim()) nextErrors.fullAddress = "Alamat lengkap wajib diisi.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    addAddress({
      label,
      fullAddress: fullAddress.trim(),
      detail: detail.trim() || undefined,
    });
    navigate("/alamat-layanan");
  };

  return (
    <AppPage className="form-page add-address-page">
      <PageHeader title="Tambah Alamat Baru" />
      <form onSubmit={submit} noValidate>
        <fieldset>
          <legend>Label alamat</legend>
          <div className="address-labels">
            {(["Rumah", "Kos", "Apartemen"] as const).map((item) => (
              <button
                className={label === item ? "active" : ""}
                onClick={() => setLabel(item)}
                type="button"
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="text-field">
          <span>Alamat Baru</span>
          <textarea
            value={fullAddress}
            onChange={(event) => setFullAddress(event.target.value)}
            placeholder="Masukkan alamat lengkap"
          />
        </label>
        {errors.fullAddress && <small className="field-error">{errors.fullAddress}</small>}
        <label className="text-field">
          <span>
            Detail Alamat <small>(opsional)</small>
          </span>
          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="Tambahkan detail atau patokan alamat"
          />
        </label>
        <PrimaryButton type="submit">Simpan Alamat</PrimaryButton>
      </form>
    </AppPage>
  );
}

export function PetPage() {
  const { draft, updateDraft } = useCleanMate();
  const { hasPet, type: kind, count } = draft.pet;
  const setPet = (changes: Partial<typeof draft.pet>) =>
    updateDraft({ pet: { ...draft.pet, ...changes } });
  return (
    <AppPage className="form-page pet-page">
      <PageHeader title="Apakah ada Hewan peliharaan?" />
      <div className="choice-two">
        <button className={!hasPet ? "active" : ""} onClick={() => setPet({ hasPet: false })}>
          ○ &nbsp; Tidak ada
        </button>
        <button
          className={hasPet ? "active" : ""}
          onClick={() => setPet({ hasPet: true, count: Math.max(1, count) })}
        >
          ● &nbsp; Ada
        </button>
      </div>
      {hasPet && (
        <>
          <h2>Jenis Hewan</h2>
          <div className="pet-types">
            {[
              ["Kucing", "a68fa.svg"],
              ["Anjing", "906a9.svg"],
              ["Lainnya", "6e39c.svg"],
            ].map(([label, icon]) => (
              <button
                className={kind === label ? "active" : ""}
                onClick={() => setPet({ type: label })}
                key={label}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </div>
          <h2>Jumlah Hewan</h2>
          <div className="counter">
            <button onClick={() => setPet({ count: Math.max(1, count - 1) })}>−</button>
            <b>{count}</b>
            <button onClick={() => setPet({ count: count + 1 })}>＋</button>
          </div>
        </>
      )}
      <div className="pet-note">
        <Icon name="18121.svg" />
        <span>Informasi ini membantu cleaner mempersiapkan peralatan yang sesuai.</span>
      </div>
      <div className="bottom-action">
        <PrimaryButton to="/ringkasan">Lanjut</PrimaryButton>
      </div>
    </AppPage>
  );
}

export function OrderSummaryPage() {
  const { draft, selectedAddress } = useCleanMate();
  const info = [
    ["6d021.svg", "Tanggal & Waktu", formatSchedule(draft.schedule), "/pilih-jadwal"],
    ["fe518.svg", "Alamat", selectedAddress.fullAddress, "/alamat-layanan"],
    [
      "3bcf7.svg",
      "Hewan Peliharaan",
      draft.pet.hasPet ? `${draft.pet.count} ${draft.pet.type}` : "Tidak ada",
      "/hewan-peliharaan",
    ],
  ];
  return (
    <AppPage className="form-page summary-page">
      <PageHeader title="Ringkasan Pesanan" />
      <div className="summary-service">
        <img src={`${A}/${draft.service.image}`} alt={draft.service.name} />
        <div>
          <b>
            {draft.service.name} {draft.service.propertyType}
          </b>
          <strong>{formatRupiah(draft.service.price)}</strong>
          <span>Estimasi {draft.service.duration}</span>
        </div>
        <Link to={`/detail/${draft.service.key}?type=${draft.service.propertyType.toLowerCase()}`}>
          Ubah
        </Link>
      </div>
      <div className="summary-cleaner">
        <img src={`${A}/${draft.cleaner.photo}`} alt={draft.cleaner.name} />
        <b>{draft.cleaner.name}</b>
        <Link to="/pilih-cleaner">Ubah</Link>
      </div>
      <div className="summary-info">
        {info.map(([icon, title, sub, to]) => (
          <div key={title}>
            <Icon name={icon} />
            <span>
              <b>{title}</b>
              <small>{sub}</small>
            </span>
            <Link to={to}>Ubah</Link>
          </div>
        ))}
      </div>
      <div className="totals">
        <span>
          Subtotal <b>{formatRupiah(draft.service.price)}</b>
        </span>
        <strong>
          Total Pembayaran <b>{formatRupiah(draft.service.price)}</b>
        </strong>
      </div>
      <div className="bottom-action">
        <PrimaryButton to="/pembayaran">Lanjut ke Pembayaran</PrimaryButton>
      </div>
    </AppPage>
  );
}

export function PaymentPage() {
  const { draft, updateDraft } = useCleanMate();
  const method = draft.paymentMethod;
  const setMethod = (paymentMethod: string) => updateDraft({ paymentMethod });
  return (
    <AppPage className="form-page payment-page">
      <PageHeader title="Metode Pembayaran" />
      <h2>♢ &nbsp; E-wallet</h2>
      <div className="wallets">
        {["GoPay", "OVO", "DANA", "Shopee Pay"].map((m) => (
          <button className={method === m ? "active" : ""} onClick={() => setMethod(m)} key={m}>
            <span>▣</span>
            {m}
          </button>
        ))}
      </div>
      <h2>ⓢ &nbsp; Virtual Account</h2>
      <div className="banks">
        {["BCA", "BRI", "BNI", "mandiri"].map((m) => (
          <button className={method === m ? "active" : ""} onClick={() => setMethod(m)} key={m}>
            {m}
          </button>
        ))}
      </div>
      <button
        className={`payment-line ${method === "QRIS" ? "active" : ""}`}
        onClick={() => setMethod("QRIS")}
      >
        <Icon name="8f9b2.svg" />
        <span>
          <b>QRIS</b>
          <small>Bayar dengan semua e-wallet dan mobile banking</small>
        </span>
      </button>
      <button
        className={`payment-line ${method === "Cash" ? "active" : ""}`}
        onClick={() => setMethod("Cash")}
      >
        <Icon name="b711f.svg" />
        <span>
          <b>Cash</b>
          <small>Bayar langsung ke cleaner</small>
        </span>
      </button>
      <div className="bottom-action">
        <PrimaryButton to="/pesanan-berhasil">Bayar</PrimaryButton>
      </div>
    </AppPage>
  );
}

export function SuccessPage() {
  const { confirmBooking, orders, draft } = useCleanMate();
  useEffect(() => {
    confirmBooking();
  }, []);
  const order = orders.find((item) => item.draftKey === JSON.stringify(draft)) ?? orders[0];
  return (
    <AppPage className="success-page">
      <div className="success-mark">✓</div>
      <h1>Pesanan Berhasil!</h1>
      <p>ID Pesanan</p>
      <h2>{order?.id ?? "Menyiapkan ID pesanan..."}</h2>
      <div className="clipboard">
        ○ ───
        <br />○ ───
        <br />○ ───
      </div>
      <p>Cleaner akan segera dikonfirmasi dan menuju lokasi sesuai jadwal.</p>
      <div className="success-actions">
        <PrimaryButton to="/pesanan">Lihat Pesanan</PrimaryButton>
        <PrimaryButton secondary to="/home">
          Kembali ke Beranda
        </PrimaryButton>
      </div>
    </AppPage>
  );
}

export function OrdersPage() {
  type CustomerOrderTab = "upcoming" | "processing" | "completed" | "cancelled";
  const [active, setActive] = useState<CustomerOrderTab>("upcoming");
  const { orders } = useCleanMate();
  const tabs: { status: CustomerOrderTab; label: string }[] = [
    { status: "upcoming", label: "Akan Datang" },
    { status: "processing", label: "Sedang Diproses" },
    { status: "completed", label: "Selesai" },
    { status: "cancelled", label: "Dibatalkan" },
  ];
  const visibleOrders = orders.filter((order) => customerStatus(order.status) === active);
  const statusLabel = tabs.find((tab) => tab.status === active)?.label ?? "";
  return (
    <AppPage bottomNav={<BottomNav active="Pesanan" />} className="orders-page">
      <PageHeader title="Pesanan Saya" />
      <div className="order-tabs" role="tablist" aria-label="Status pesanan">
        {tabs.map((tab) => {
          const count = orders.filter(
            (order) => customerStatus(order.status) === tab.status,
          ).length;
          return (
            <button
              className={active === tab.status ? "active" : ""}
              onClick={() => setActive(tab.status)}
              role="tab"
              aria-selected={active === tab.status}
              key={tab.status}
            >
              {tab.label}
              {count ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>
      {visibleOrders.length ? (
        <div className="order-list">
          {visibleOrders.map((order) => (
            <Link to={`/tracking/${order.id}`} className="order-card" key={order.id}>
              <img src={`${A}/${order.booking.service.image}`} alt={order.booking.service.name} />
              <div>
                <h3>{order.booking.service.name}</h3>
                <span>{formatSchedule(order.booking.schedule, false)}</span>
                <span>
                  {order.address.label} · {order.address.fullAddress}
                </span>
                <b>{formatRupiah(order.booking.service.price)}</b>
              </div>
              <Tag blue={order.status === "upcoming"}>{statusLabel}</Tag>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-orders">
          <span aria-hidden="true">□</span>
          <h2>Belum ada pesanan</h2>
          <p>Tidak ada pesanan dengan status {statusLabel.toLowerCase()}.</p>
        </div>
      )}
    </AppPage>
  );
}

export function TrackingPage() {
  const { orderId } = useParams();
  const { latestOrder, orders } = useCleanMate();
  const trackedOrder = orders.find((order) => order.id === orderId) ?? latestOrder;
  const progressIndex = trackedOrder
    ? {
        upcoming: 1,
        traveling: 2,
        in_progress: 3,
        completed: 4,
        cancelled: 0,
      }[trackedOrder.status]
    : 0;
  const steps = [
    [
      "Pesanan Dikonfirmasi",
      trackedOrder ? new Date(trackedOrder.createdAt).toLocaleString("id-ID") : "",
    ],
    ["Cleaner Ditugaskan", trackedOrder?.booking.cleaner.name ?? ""],
    ["Dalam Perjalanan", ""],
    ["Pembersihan Berlangsung", ""],
    ["Pembersihan Selesai", ""],
  ];
  return (
    <AppPage className="tracking-page">
      <PageHeader title="Status Pesanan" />
      {trackedOrder && (
        <div className="tracking-order">
          <b>{trackedOrder.booking.service.name}</b>
          <span>{formatSchedule(trackedOrder.booking.schedule)}</span>
          <small>{trackedOrder.address.fullAddress}</small>
        </div>
      )}
      <div className="map-preview">
        <Icon name="3fe4e.svg" />
        <Icon name="a3bd7.svg" />
        <Icon name="59768.svg" />
      </div>
      <div className="timeline">
        {steps.map(([title, time], i) => (
          <div
            className={i < progressIndex ? "done" : i === progressIndex ? "current" : ""}
            key={title}
          >
            <i>{i < progressIndex ? "✓" : ""}</i>
            <span>
              <b>{title}</b>
              {time && <small>{time}</small>}
            </span>
          </div>
        ))}
      </div>
    </AppPage>
  );
}

const profileItems = [
  ["Informasi Akun", "/profil/informasi-akun", "fdaa3.svg"],
  ["Alamat Tersimpan", "/profil/alamat", "fe518.svg"],
  ["Riwayat Pesanan", "/pesanan", "61aa8.svg"],
  ["Help Center", "/profil/help-center", "7bc9f.svg"],
  ["Pengaturan", "/profil/pengaturan", "2cfbc.svg"],
  ["Keluar", "/login", "e0cf7.svg"],
];
export function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useCleanMate();
  return (
    <AppPage bottomNav={<BottomNav active="Profil" />} className="profile-page">
      <PageHeader title="Profil" />
      <div className="profile-head">
        <img src={`${A}/87e2c.png`} alt="Jenni" />
        <span>
          <h2>Jenni</h2>
          <p>jenni@gmail.com</p>
        </span>
      </div>
      <div className="menu-list">
        {profileItems.map(([label, to, icon]) =>
          label === "Keluar" ? (
            <button
              className="menu-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              key={label}
            >
              <Icon name={icon} />
              <span>{label}</span>
              <b>›</b>
            </button>
          ) : (
            <Link to={to} key={label}>
              <Icon name={icon} />
              <span>{label}</span>
              <b>›</b>
            </Link>
          ),
        )}
      </div>
    </AppPage>
  );
}
