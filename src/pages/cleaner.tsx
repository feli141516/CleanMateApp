import { useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { A, AppPage, BottomNav, Icon, PageHeader, PrimaryButton, Tag } from "../components/ui";
import {
  cleanerShare,
  formatRupiah,
  formatSchedule,
  orderStatusLabel,
  type Order,
  type OrderStatus,
  useCleanMate,
} from "../state/CleanMateContext";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function Nav({ active }: { active: string }) {
  return <BottomNav cleaner active={active} />;
}

function orderSort(a: Order, b: Order) {
  const aMonth = months.indexOf(a.booking.schedule.month);
  const bMonth = months.indexOf(b.booking.schedule.month);
  return (
    new Date(
      a.booking.schedule.year,
      aMonth,
      a.booking.schedule.day,
      Number(a.booking.schedule.time.slice(0, 2)),
    ).getTime() -
    new Date(
      b.booking.schedule.year,
      bMonth,
      b.booking.schedule.day,
      Number(b.booking.schedule.time.slice(0, 2)),
    ).getTime()
  );
}

function useCleanerOrders() {
  const { currentUser, orders } = useCleanMate();
  return useMemo(
    () => orders.filter((order) => order.booking.cleaner.name === currentUser?.name),
    [currentUser?.name, orders],
  );
}

function OrderCard({ order, compact = false }: { order: Order; compact?: boolean }) {
  return (
    <Link
      className={`cleaner-job ${compact ? "compact-job" : ""}`}
      to={`/cleaner/pesanan/${order.id}`}
    >
      <img src={`${A}/${order.booking.service.image}`} alt={order.booking.service.name} />
      <div>
        <b>{order.booking.service.name}</b>
        <span>{formatSchedule(order.booking.schedule)}</span>
        <span>{order.customer.name}</span>
        {!compact && <small>{order.address.fullAddress}</small>}
      </div>
      <Tag blue={order.status === "upcoming"}>{orderStatusLabel(order.status)}</Tag>
    </Link>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="cleaner-empty">{children}</p>;
}

export function CleanerLoginPage() {
  return <Navigate to="/login?akses=operasional" replace />;
}

export function CleanerDashboardPage() {
  const { currentUser, cleanerAvailability, setCleanerAvailability } = useCleanMate();
  const orders = useCleanerOrders();
  const now = new Date();
  const today = orders.filter(
    (order) =>
      order.booking.schedule.day === now.getDate() &&
      months.indexOf(order.booking.schedule.month) === now.getMonth() &&
      order.booking.schedule.year === now.getFullYear(),
  );
  const completed = orders.filter((order) => order.status === "completed");
  const completedThisWeek = completed.filter((order) => {
    const date = new Date(
      order.booking.schedule.year,
      months.indexOf(order.booking.schedule.month),
      order.booking.schedule.day,
    );
    return now.getTime() - date.getTime() >= 0 && now.getTime() - date.getTime() < 7 * 86400000;
  });
  const todayIncome = today
    .filter((order) => order.status === "completed")
    .map(cleanerShare)
    .filter((value): value is number => value !== null)
    .reduce((sum, value) => sum + value, 0);
  const incomeConfigured = today
    .filter((order) => order.status === "completed")
    .every((order) => cleanerShare(order) !== null);
  const nextOrder = orders
    .filter((order) => !["completed", "cancelled"].includes(order.status))
    .sort(orderSort)[0];
  const available = cleanerAvailability[currentUser?.name ?? ""] ?? true;
  const profilePhoto = currentUser?.photo?.startsWith("data:")
    ? currentUser.photo
    : `${A}/${currentUser?.photo ?? "01a2c.png"}`;

  return (
    <AppPage bottomNav={<Nav active="Beranda" />} className="cleaner-page">
      <div className="cleaner-welcome">
        <img src={profilePhoto} alt={currentUser?.name ?? "Cleaner"} />
        <div>
          Selamat datang,
          <h1>{currentUser?.name ?? "Cleaner"}!</h1>
          <button
            className={`availability ${available ? "online" : ""}`}
            onClick={() => setCleanerAvailability(currentUser?.name ?? "", !available)}
          >
            {available ? "Online" : "Offline"}
          </button>
        </div>
        <span aria-label="Notifikasi">♧</span>
      </div>
      <div className="stats">
        <div>
          <b>{today.length}</b>
          <span>Pesanan Hari Ini</span>
        </div>
        <div>
          <b>{completedThisWeek.length}</b>
          <span>Selesai Minggu Ini</span>
        </div>
        <div>
          <b>{incomeConfigured ? formatRupiah(todayIncome) : "Belum diatur"}</b>
          <span>Pendapatan Bersih Hari Ini</span>
        </div>
      </div>
      <h2>
        Pesanan Berikutnya <Link to="/cleaner/pesanan">Lihat Semua</Link>
      </h2>
      {nextOrder ? (
        <>
          <OrderCard order={nextOrder} />
          <PrimaryButton to={`/cleaner/pesanan/${nextOrder.id}`}>Lihat Detail</PrimaryButton>
        </>
      ) : (
        <EmptyState>Belum ada pesanan berikutnya.</EmptyState>
      )}
      <h2>
        Jadwal Hari Ini <Link to="/cleaner/jadwal">Lihat Semua</Link>
      </h2>
      {today.length ? (
        today.sort(orderSort).map((order) => <OrderCard order={order} compact key={order.id} />)
      ) : (
        <EmptyState>Belum ada jadwal hari ini.</EmptyState>
      )}
    </AppPage>
  );
}

export function CleanerOrdersPage() {
  const orders = useCleanerOrders();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const visible = orders.filter((order) => filter === "all" || order.status === filter);
  const filters: { value: "all" | OrderStatus; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "upcoming", label: "Akan Datang" },
    { value: "traveling", label: "Perjalanan" },
    { value: "in_progress", label: "Dikerjakan" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
  ];
  return (
    <AppPage className="cleaner-page cleaner-orders-page">
      <PageHeader title="Daftar Pesanan" />
      <div className="filter-scroll">
        {filters.map((item) => (
          <button
            className={filter === item.value ? "active" : ""}
            onClick={() => setFilter(item.value)}
            key={item.value}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="cleaner-order-list">
        {visible.length ? (
          visible.sort(orderSort).map((order) => <OrderCard order={order} key={order.id} />)
        ) : (
          <EmptyState>Tidak ada pesanan pada status ini.</EmptyState>
        )}
      </div>
    </AppPage>
  );
}

function Info({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="info-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export function CleanerOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currentUser, orders, updateOrderStatus } = useCleanMate();
  const order = orders.find(
    (item) => item.id === orderId && item.booking.cleaner.name === currentUser?.name,
  );
  if (!order) return <Navigate to="/cleaner/pesanan" replace />;
  const { booking, address, customer } = order;
  const nextAction =
    order.status === "upcoming"
      ? { label: "Mulai Perjalanan", status: "traveling" as const }
      : order.status === "traveling"
        ? { label: "Mulai Pekerjaan", status: "in_progress" as const }
        : order.status === "in_progress"
          ? { label: "Selesaikan Pekerjaan", status: "completed" as const }
          : null;
  const advance = () => {
    if (!nextAction) return;
    updateOrderStatus(order.id, nextAction.status);
    if (nextAction.status === "traveling") {
      navigate(
        `/cleaner/jadwal?day=${booking.schedule.day}&month=${booking.schedule.month}&year=${booking.schedule.year}`,
      );
    }
  };
  return (
    <AppPage className="cleaner-page cleaner-order-page">
      <PageHeader title="Detail Pesanan" />
      <div className="order-overview">
        <img src={`${A}/${booking.service.image}`} alt={booking.service.name} />
        <div>
          <h2>{booking.service.name}</h2>
          <span>▣ &nbsp;{formatSchedule(booking.schedule, false)}</span>
          <span>
            ◉ &nbsp;{booking.schedule.time} · {booking.service.duration}
          </span>
        </div>
        <Tag blue={order.status === "upcoming"}>{orderStatusLabel(order.status)}</Tag>
      </div>
      <h2>Informasi Pelanggan</h2>
      <div className="customer-row">
        <img src={`${A}/${customer.photo ?? "87e2c.png"}`} alt={customer.name} />
        <b>{customer.name}</b>
        {customer.phone ? (
          <a href={`tel:${customer.phone}`} aria-label={`Telepon ${customer.name}`}>
            ☎
          </a>
        ) : (
          <span />
        )}
        <Link to={`/cleaner/chat/${order.id}`} aria-label={`Chat dengan ${customer.name}`}>
          ◌
        </Link>
      </div>
      <Info title="Alamat">
        {address.fullAddress}
        {address.detail && (
          <>
            <br />
            <small>{address.detail}</small>
          </>
        )}
      </Info>
      <Info title="Detail Layanan">
        <b>{booking.service.name}</b>
        <br />
        Estimasi {booking.service.duration}
        <br />
        {formatRupiah(booking.service.price)}
      </Info>
      {booking.pet.hasPet && (
        <Info title="Informasi Hewan Peliharaan">
          {booking.pet.count} {booking.pet.type}
        </Info>
      )}
      <Info title="Catatan dari Pelanggan">{booking.notes || "Tidak ada catatan pelanggan."}</Info>
      <div className="dual-actions">
        <PrimaryButton secondary to={`/cleaner/menuju-lokasi/${order.id}`}>
          Lihat Lokasi
        </PrimaryButton>
        {nextAction && <PrimaryButton onClick={advance}>{nextAction.label}</PrimaryButton>}
      </div>
    </AppPage>
  );
}

function Calendar({
  selectedDay,
  monthIndex,
  year,
  markedDays,
  onSelect,
  onMonth,
}: {
  selectedDay: number;
  monthIndex: number;
  year: number;
  markedDays: number[];
  onSelect: (day: number) => void;
  onMonth: (direction: -1 | 1) => void;
}) {
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  return (
    <>
      <h2 className="month-title">
        <button onClick={() => onMonth(-1)}>‹</button>
        <span>
          {months[monthIndex]} {year}
        </span>
        <button onClick={() => onMonth(1)}>›</button>
      </h2>
      <div className="calendar compact">
        <div className="week">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="days">
          {Array.from({ length: offset }, (_, index) => (
            <i key={`empty-${index}`} />
          ))}
          {Array.from({ length: count }, (_, index) => index + 1).map((day) => (
            <button
              className={`${selectedDay === day ? "active" : ""} ${markedDays.includes(day) ? "has-job" : ""}`}
              onClick={() => onSelect(day)}
              key={day}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function CleanerCalendarPage() {
  const orders = useCleanerOrders();
  const [searchParams] = useSearchParams();
  const initialMonth = months.indexOf(searchParams.get("month") ?? "Oktober");
  const [monthIndex, setMonthIndex] = useState(initialMonth < 0 ? 9 : initialMonth);
  const [year, setYear] = useState(Number(searchParams.get("year")) || 2026);
  const [selectedDay, setSelectedDay] = useState(Number(searchParams.get("day")) || 16);
  const matchingMonth = orders.filter(
    (order) =>
      order.booking.schedule.month === months[monthIndex] &&
      order.booking.schedule.year === year &&
      order.status !== "cancelled",
  );
  const selectedOrders = matchingMonth
    .filter((order) => order.booking.schedule.day === selectedDay)
    .sort(orderSort);
  const moveMonth = (direction: -1 | 1) => {
    const next = monthIndex + direction;
    if (next < 0) {
      setMonthIndex(11);
      setYear((current) => current - 1);
    } else if (next > 11) {
      setMonthIndex(0);
      setYear((current) => current + 1);
    } else {
      setMonthIndex(next);
    }
    setSelectedDay(1);
  };
  return (
    <AppPage bottomNav={<Nav active="Jadwal" />} className="cleaner-page">
      <PageHeader title="Jadwal Kerja" />
      <Calendar
        selectedDay={selectedDay}
        monthIndex={monthIndex}
        year={year}
        markedDays={[...new Set(matchingMonth.map((order) => order.booking.schedule.day))]}
        onSelect={setSelectedDay}
        onMonth={moveMonth}
      />
      <h2>
        Jadwal {selectedDay} {months[monthIndex]} {year}
      </h2>
      {selectedOrders.length ? (
        selectedOrders.map((order) => <OrderCard order={order} key={order.id} />)
      ) : (
        <EmptyState>Tidak ada jadwal pekerjaan pada tanggal ini.</EmptyState>
      )}
    </AppPage>
  );
}

export function CleanerRoutePage() {
  const { orderId } = useParams();
  const { currentUser, orders } = useCleanMate();
  const order = orders.find(
    (item) => item.id === orderId && item.booking.cleaner.name === currentUser?.name,
  );
  if (!order) return <Navigate to="/cleaner/pesanan" replace />;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address.fullAddress)}`;
  return (
    <AppPage className="cleaner-page route-page">
      <PageHeader title="Menuju Lokasi" />
      {order.status === "traveling" && <Tag>Dalam Perjalanan</Tag>}
      <div className="route-map route-placeholder">
        <Icon name="40763.svg" />
        <p>Pratinjau peta bukan navigasi real-time.</p>
      </div>
      <p>◉ &nbsp; {order.address.fullAddress}</p>
      {order.address.detail && <small className="route-detail">{order.address.detail}</small>}
      <a className="primary-button" href={mapsUrl} target="_blank" rel="noreferrer">
        Buka Navigasi
      </a>
      <div className="contact-actions">
        {order.customer.phone ? (
          <a href={`tel:${order.customer.phone}`}>
            ☎<span>Hubungi Customer</span>
          </a>
        ) : (
          <span>Nomor tidak tersedia</span>
        )}
        <Link to={`/cleaner/chat/${order.id}`}>
          ◌<span>Chat</span>
        </Link>
      </div>
      <h2>Informasi Pesanan</h2>
      <OrderCard order={order} compact />
    </AppPage>
  );
}

export function CleanerCustomerChatPage() {
  const { orderId } = useParams();
  const { currentUser, orders } = useCleanMate();
  const order = orders.find(
    (item) => item.id === orderId && item.booking.cleaner.name === currentUser?.name,
  );
  if (!order) return <Navigate to="/cleaner/pesanan" replace />;
  return (
    <AppPage className="cleaner-page operational-chat">
      <PageHeader title={`Chat dengan ${order.customer.name}`} />
      <div className="integration-notice">
        <h2>Ruang percakapan pesanan {order.id}</h2>
        <p>
          Integrasi chat antar akun memerlukan backend. Pada prototipe lokal ini, pesan tidak
          dikirim dan tidak ada riwayat percakapan yang dibuat-buat.
        </p>
      </div>
    </AppPage>
  );
}

export function CleanerIncomePage() {
  const orders = useCleanerOrders();
  const [filter, setFilter] = useState<"completed" | "cancelled" | "all">("completed");
  const completed = orders.filter((order) => order.status === "completed");
  const visible = orders.filter((order) => filter === "all" || order.status === filter);
  const now = new Date();
  const datedCompleted = completed.map((order) => ({
    order,
    date: new Date(
      order.booking.schedule.year,
      months.indexOf(order.booking.schedule.month),
      order.booking.schedule.day,
    ),
  }));
  const periodTotal = (predicate: (date: Date) => boolean) => {
    const periodOrders = datedCompleted
      .filter(({ date }) => predicate(date))
      .map(({ order }) => order);
    const configured = periodOrders.every((order) => cleanerShare(order) !== null);
    const total = periodOrders
      .map(cleanerShare)
      .filter((value): value is number => value !== null)
      .reduce((sum, value) => sum + value, 0);
    return { configured, total };
  };
  const dayIncome = periodTotal(
    (date) =>
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear(),
  );
  const weekIncome = periodTotal(
    (date) => now.getTime() - date.getTime() >= 0 && now.getTime() - date.getTime() < 7 * 86400000,
  );
  const monthIncome = periodTotal(
    (date) => date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(),
  );
  const configured = completed.every((order) => cleanerShare(order) !== null);
  const total = completed
    .map(cleanerShare)
    .filter((value): value is number => value !== null)
    .reduce((sum, value) => sum + value, 0);
  const weekly = [0, 1, 2, 3].map((week) =>
    completed
      .filter((order) => Math.floor((order.booking.schedule.day - 1) / 7) === week)
      .map(cleanerShare)
      .filter((value): value is number => value !== null)
      .reduce((sum, value) => sum + value, 0),
  );
  const max = Math.max(...weekly, 1);
  return (
    <AppPage bottomNav={<Nav active="Pendapatan" />} className="cleaner-page">
      <PageHeader title="Pendapatan & Riwayat" />
      <div className="income-summary-grid">
        {[
          ["Hari Ini", dayIncome],
          ["Minggu Ini", weekIncome],
          ["Bulan Ini", monthIncome],
        ].map(([label, value]) => (
          <div key={label as string}>
            <span>Pendapatan Bersih {label as string}</span>
            <b>
              {(value as typeof dayIncome).configured
                ? formatRupiah((value as typeof dayIncome).total)
                : "Belum diatur"}
            </b>
          </div>
        ))}
      </div>
      <section className="income-card">
        <b>Pendapatan Bulan Ini</b>
        <h1>{configured ? formatRupiah(total) : "Persentase belum diatur"}</h1>
        {configured && completed.length ? (
          <div className="bars">
            {weekly.map((value, index) => (
              <span key={index} style={{ height: `${Math.max(8, (value / max) * 100)}%` }}>
                <small>Minggu {index + 1}</small>
              </span>
            ))}
          </div>
        ) : (
          <EmptyState>
            Grafik tersedia setelah Admin mengatur pembagian dan pekerjaan selesai.
          </EmptyState>
        )}
      </section>
      <p>Riwayat Pesanan</p>
      <div className="segment">
        {[
          ["completed", "Selesai"],
          ["cancelled", "Dibatalkan"],
          ["all", "Semua"],
        ].map(([value, label]) => (
          <button
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value as typeof filter)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      {visible.length ? (
        visible.map((order) => {
          const share = cleanerShare(order);
          return (
            <details className="income-row" key={order.id}>
              <summary>
                <img src={`${A}/${order.booking.service.image}`} alt="" />
                <div>
                  <b>{order.booking.service.name}</b>
                  <span>{formatSchedule(order.booking.schedule)}</span>
                </div>
                <strong>{share === null ? "Belum diatur" : formatRupiah(share)}</strong>
                <Tag>{orderStatusLabel(order.status)}</Tag>
              </summary>
              <div className="transaction-breakdown">
                <span>
                  Total pembayaran Customer <b>{formatRupiah(order.booking.service.price)}</b>
                </span>
                <span>
                  Bagian Cleaner <b>{share === null ? "Belum ditentukan" : formatRupiah(share)}</b>
                </span>
                <span>
                  Bagian CleanMate{" "}
                  <b>
                    {share === null
                      ? "Belum ditentukan"
                      : formatRupiah(order.booking.service.price - share)}
                  </b>
                </span>
                <small>
                  Status pencairan:{" "}
                  {order.payoutStatus === "paid" ? "Sudah dicairkan" : "Belum dicairkan"}
                </small>
              </div>
            </details>
          );
        })
      ) : (
        <EmptyState>Belum ada riwayat pada filter ini.</EmptyState>
      )}
    </AppPage>
  );
}

export function CleanerProfilePage() {
  const { currentUser, logout, updateProfile } = useCleanMate();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [photoNotice, setPhotoNotice] = useState("");
  const profilePhoto = currentUser?.photo?.startsWith("data:")
    ? currentUser.photo
    : `${A}/${currentUser?.photo ?? "01a2c.png"}`;
  const save = () => {
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    setEditing(false);
  };
  return (
    <AppPage bottomNav={<Nav active="Profil" />} className="cleaner-page cleaner-profile-page">
      <PageHeader title="Profil" />
      <div className="cleaner-profile-avatar">
        <img src={profilePhoto} alt={currentUser?.name ?? "Cleaner"} />
        <button onClick={() => setEditing(!editing)}>✎</button>
      </div>
      {editing ? (
        <div className="profile-edit-form">
          <label className="photo-upload">
            Foto Profil
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 500_000) {
                  setPhotoNotice("Ukuran foto maksimal 500 KB untuk prototipe lokal.");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    updateProfile({ photo: reader.result });
                    setPhotoNotice("Foto profil diperbarui pada perangkat ini.");
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {photoNotice && <small>{photoNotice}</small>}
          <label>
            Nama
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Nomor Telepon
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <PrimaryButton onClick={save}>Simpan Profil</PrimaryButton>
        </div>
      ) : (
        <div className="cleaner-fields">
          {[
            ["34292.svg", "Nama", currentUser?.name ?? "Belum tersedia"],
            [
              "0bf58.svg",
              "Tanggal Lahir",
              currentUser?.name === "Sinta" ? "12 Februari 1999" : "Belum tersedia",
            ],
            ["be33a.svg", "Email", currentUser?.email ?? "Belum tersedia"],
            ["06899.svg", "Nomor Telepon", currentUser?.phone ?? "Belum tersedia"],
          ].map(([icon, label, value]) => (
            <div key={label}>
              <Icon name={icon} />
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </div>
      )}
      <PrimaryButton
        secondary
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Keluar
      </PrimaryButton>
    </AppPage>
  );
}
