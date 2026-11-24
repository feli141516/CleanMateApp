import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { A, AppPage, Icon, PageHeader, PrimaryButton, Tag } from "../components/ui";
import {
  cleanerShare,
  formatRupiah,
  formatSchedule,
  orderStatusLabel,
  type CleanerSelection,
  type Order,
  type OrderStatus,
  useCleanMate,
} from "../state/CleanMateContext";

const cleaners: CleanerSelection[] = [
  { name: "Andi", photo: "033c5.png" },
  { name: "Sinta", photo: "01a2c.png" },
  { name: "Bagos", photo: "1b17d.png" },
  { name: "Tiara", photo: "4af8a.png" },
];

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

function AdminNav({ active }: { active: string }) {
  const items = [
    ["Dashboard", "/admin", "22060.svg"],
    ["Pesanan", "/admin/pesanan", "72b08.svg"],
    ["Operasional", "/admin/jadwal", "1b180.svg"],
    ["Pendapatan", "/admin/pendapatan", "43388.svg"],
  ];
  return (
    <nav className="bottom-nav admin-nav" aria-label="Navigasi Admin">
      {items.map(([label, to, icon]) => (
        <Link className={active === label ? "active" : ""} to={to} key={label}>
          <Icon name={icon} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Empty({ children }: { children: string }) {
  return <p className="cleaner-empty">{children}</p>;
}

function AdminOrderCard({ order }: { order: Order }) {
  return (
    <Link className="admin-order-card" to={`/admin/pesanan/${order.id}`}>
      <img src={`${A}/${order.booking.service.image}`} alt={order.booking.service.name} />
      <div>
        <b>{order.booking.service.name}</b>
        <span>
          {order.customer.name} · {order.booking.cleaner.name}
        </span>
        <span>{formatSchedule(order.booking.schedule)}</span>
        <small>{order.address.fullAddress}</small>
      </div>
      <Tag blue={order.status === "upcoming"}>{orderStatusLabel(order.status)}</Tag>
    </Link>
  );
}

export function AdminDashboardPage() {
  const { orders, revenueSharePercent } = useCleanMate();
  const totalTransactions = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.booking.service.price, 0);
  const cleanerTotal = orders
    .filter((order) => order.status === "completed")
    .map(cleanerShare)
    .filter((value): value is number => value !== null)
    .reduce((sum, value) => sum + value, 0);
  const completedConfigured = orders
    .filter((order) => order.status === "completed")
    .every((order) => cleanerShare(order) !== null);
  const completedTransactionTotal = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.booking.service.price, 0);
  const today = new Date();
  const todayOrders = orders.filter(
    (order) =>
      order.booking.schedule.day === today.getDate() &&
      months.indexOf(order.booking.schedule.month) === today.getMonth() &&
      order.booking.schedule.year === today.getFullYear(),
  );
  return (
    <AppPage bottomNav={<AdminNav active="Dashboard" />} className="admin-page">
      <header className="admin-heading">
        <div>
          <small>Operasional CleanMate</small>
          <h1>Dashboard Admin</h1>
        </div>
        <Link to="/admin/profil" aria-label="Profil Admin">
          A
        </Link>
      </header>
      <p className="prototype-banner">
        Prototipe lokal: data tersimpan pada perangkat ini dan belum tersinkron antarperangkat.
      </p>
      <div className="admin-stats">
        <Link to="/admin/pesanan">
          <b>{todayOrders.length}</b>
          <span>Pesanan Hari Ini</span>
        </Link>
        <Link to="/admin/pesanan">
          <b>{orders.filter((order) => order.status === "upcoming").length}</b>
          <span>Akan Datang</span>
        </Link>
        <Link to="/admin/pesanan">
          <b>
            {orders.filter((order) => ["traveling", "in_progress"].includes(order.status)).length}
          </b>
          <span>Diproses</span>
        </Link>
        <Link to="/admin/pesanan">
          <b>{orders.filter((order) => order.status === "completed").length}</b>
          <span>Selesai</span>
        </Link>
      </div>
      <h2>Ringkasan Keuangan</h2>
      <div className="admin-finance">
        <div>
          <span>Total transaksi Customer</span>
          <b>{formatRupiah(totalTransactions)}</b>
        </div>
        <div>
          <span>Bagian seluruh Cleaner</span>
          <b>{completedConfigured ? formatRupiah(cleanerTotal) : "Belum ditentukan"}</b>
        </div>
        <div>
          <span>Bagian CleanMate</span>
          <b>
            {completedConfigured
              ? formatRupiah(completedTransactionTotal - cleanerTotal)
              : "Belum ditentukan"}
          </b>
        </div>
      </div>
      {revenueSharePercent === null && (
        <Link className="admin-alert" to="/admin/pendapatan">
          Persentase pembagian pendapatan belum diatur.
        </Link>
      )}
      <div className="section-heading">
        <h2>Pesanan Terbaru</h2>
        <Link to="/admin/pesanan">Lihat Semua</Link>
      </div>
      {orders.length ? (
        orders.slice(0, 3).map((order) => <AdminOrderCard order={order} key={order.id} />)
      ) : (
        <Empty>Belum ada pesanan Customer.</Empty>
      )}
      <div className="admin-shortcuts">
        <Link to="/admin/pengguna">Kelola Cleaner & Customer</Link>
        <Link to="/admin/jadwal">Jadwal Operasional</Link>
      </div>
    </AppPage>
  );
}

export function AdminOrdersPage() {
  const { orders } = useCleanMate();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const visible = orders.filter((order) => filter === "all" || order.status === filter);
  return (
    <AppPage bottomNav={<AdminNav active="Pesanan" />} className="admin-page">
      <PageHeader title="Pengelolaan Pesanan" />
      <div className="filter-scroll">
        {[
          ["all", "Semua"],
          ["upcoming", "Akan Datang"],
          ["traveling", "Perjalanan"],
          ["in_progress", "Dikerjakan"],
          ["completed", "Selesai"],
          ["cancelled", "Dibatalkan"],
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
      <div className="admin-order-list">
        {visible.length ? (
          visible.map((order) => <AdminOrderCard order={order} key={order.id} />)
        ) : (
          <Empty>Tidak ada pesanan pada filter ini.</Empty>
        )}
      </div>
    </AppPage>
  );
}

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const { assignCleaner, orders, updateOrderStatus } = useCleanMate();
  const order = orders.find((item) => item.id === orderId);
  if (!order) return <Navigate to="/admin/pesanan" replace />;
  const share = cleanerShare(order);
  return (
    <AppPage className="admin-page admin-order-detail">
      <PageHeader title="Detail Pesanan Admin" />
      <AdminOrderCard order={order} />
      <section>
        <h2>Customer</h2>
        <p>{order.customer.name}</p>
        <small>{order.customer.email}</small>
      </section>
      <section>
        <h2>Alamat Layanan</h2>
        <p>{order.address.fullAddress}</p>
        {order.address.detail && <small>{order.address.detail}</small>}
      </section>
      <section>
        <h2>Penugasan Cleaner</h2>
        <select
          value={order.booking.cleaner.name}
          onChange={(event) => {
            const cleaner = cleaners.find((item) => item.name === event.target.value);
            if (cleaner) assignCleaner(order.id, cleaner);
          }}
        >
          {cleaners.map((cleaner) => (
            <option
              value={cleaner.name}
              disabled={orders.some(
                (other) =>
                  other.id !== order.id &&
                  other.status !== "cancelled" &&
                  other.booking.cleaner.name === cleaner.name &&
                  other.booking.schedule.day === order.booking.schedule.day &&
                  other.booking.schedule.month === order.booking.schedule.month &&
                  other.booking.schedule.year === order.booking.schedule.year &&
                  other.booking.schedule.time === order.booking.schedule.time,
              )}
              key={cleaner.name}
            >
              {cleaner.name}
            </option>
          ))}
        </select>
      </section>
      <section>
        <h2>Status Pesanan</h2>
        <select
          value={order.status}
          onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)}
        >
          <option value="upcoming">Akan Datang</option>
          <option value="traveling">Dalam Perjalanan</option>
          <option value="in_progress">Sedang Dikerjakan</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </section>
      <section>
        <h2>Rincian Transaksi</h2>
        <p>
          Total pembayaran <b>{formatRupiah(order.booking.service.price)}</b>
        </p>
        <p>
          Status pembayaran{" "}
          <b>{order.paymentStatus === "prototype_paid" ? "Simulasi pembayaran" : "Menunggu"}</b>
        </p>
        <p>
          Bagian Cleaner <b>{share === null ? "Belum ditentukan" : formatRupiah(share)}</b>
        </p>
        <p>
          Bagian CleanMate{" "}
          <b>
            {share === null
              ? "Belum ditentukan"
              : formatRupiah(order.booking.service.price - share)}
          </b>
        </p>
      </section>
    </AppPage>
  );
}

export function AdminUsersPage() {
  const { orders } = useCleanMate();
  const customerMap = new Map(orders.map((order) => [order.customer.email, order.customer]));
  const usedCleaners = cleaners.filter(
    (cleaner) =>
      cleaner.name === "Sinta" ||
      orders.some((order) => order.booking.cleaner.name === cleaner.name),
  );
  return (
    <AppPage className="admin-page">
      <PageHeader title="Cleaner & Customer" />
      <h2>Cleaner</h2>
      <div className="admin-user-list">
        {usedCleaners.map((cleaner) => {
          const cleanerOrders = orders.filter(
            (order) => order.booking.cleaner.name === cleaner.name,
          );
          return (
            <article key={cleaner.name}>
              <img src={`${A}/${cleaner.photo}`} alt={cleaner.name} />
              <div>
                <b>{cleaner.name}</b>
                <span>{cleanerOrders.length} pesanan</span>
                <small>
                  {cleanerOrders.filter((order) => order.status === "completed").length} selesai
                </small>
              </div>
            </article>
          );
        })}
      </div>
      <h2>Customer</h2>
      <div className="admin-user-list">
        {[...customerMap.values()].map((customer) => (
          <article key={customer.email}>
            <img src={`${A}/${customer.photo ?? "87e2c.png"}`} alt={customer.name} />
            <div>
              <b>{customer.name}</b>
              <span>{customer.email}</span>
              <small>
                {orders.filter((order) => order.customer.email === customer.email).length} pesanan
              </small>
            </div>
          </article>
        ))}
        {!customerMap.size && <Empty>Belum ada Customer dengan riwayat pemesanan.</Empty>}
      </div>
    </AppPage>
  );
}

export function AdminSchedulePage() {
  const { orders } = useCleanMate();
  const [day, setDay] = useState(16);
  const [cleaner, setCleaner] = useState("Semua");
  const [monthIndex, setMonthIndex] = useState(9);
  const [year, setYear] = useState(2026);
  const monthOrders = orders.filter(
    (order) =>
      order.booking.schedule.month === months[monthIndex] &&
      order.booking.schedule.year === year &&
      order.status !== "cancelled" &&
      (cleaner === "Semua" || order.booking.cleaner.name === cleaner),
  );
  const selected = monthOrders.filter((order) => order.booking.schedule.day === day);
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const move = (amount: number) => {
    const next = monthIndex + amount;
    if (next < 0) {
      setMonthIndex(11);
      setYear(year - 1);
    } else if (next > 11) {
      setMonthIndex(0);
      setYear(year + 1);
    } else setMonthIndex(next);
    setDay(1);
  };
  return (
    <AppPage bottomNav={<AdminNav active="Operasional" />} className="admin-page">
      <PageHeader title="Jadwal Operasional" />
      <select
        className="admin-cleaner-filter"
        value={cleaner}
        onChange={(event) => setCleaner(event.target.value)}
      >
        <option>Semua</option>
        {cleaners.map((item) => (
          <option key={item.name}>{item.name}</option>
        ))}
      </select>
      <h2 className="month-title">
        <button onClick={() => move(-1)}>‹</button>
        <span>
          {months[monthIndex]} {year}
        </span>
        <button onClick={() => move(1)}>›</button>
      </h2>
      <div className="calendar compact">
        <div className="week">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="days">
          {Array.from({ length: offset }, (_, index) => (
            <i key={index} />
          ))}
          {Array.from({ length: count }, (_, index) => index + 1).map((item) => (
            <button
              className={`${day === item ? "active" : ""} ${monthOrders.some((order) => order.booking.schedule.day === item) ? "has-job" : ""}`}
              onClick={() => setDay(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <h2>
        Jadwal {day} {months[monthIndex]} {year}
      </h2>
      {selected.length ? (
        selected.map((order) => <AdminOrderCard order={order} key={order.id} />)
      ) : (
        <Empty>Tidak ada pekerjaan pada tanggal ini.</Empty>
      )}
    </AppPage>
  );
}

export function AdminIncomePage() {
  const { orders, revenueSharePercent, setRevenueSharePercent } = useCleanMate();
  const [input, setInput] = useState(revenueSharePercent?.toString() ?? "");
  const completed = orders.filter((order) => order.status === "completed");
  const totalTransactions = completed.reduce((sum, order) => sum + order.booking.service.price, 0);
  const cleanerTotal = completed
    .map(cleanerShare)
    .filter((value): value is number => value !== null)
    .reduce((sum, value) => sum + value, 0);
  const configured = completed.every((order) => cleanerShare(order) !== null);
  return (
    <AppPage bottomNav={<AdminNav active="Pendapatan" />} className="admin-page">
      <PageHeader title="Pendapatan CleanMate" />
      <section className="revenue-setting">
        <h2>Pengaturan Pembagian</h2>
        <p>
          Masukkan persentase bagian Cleaner. Nilai disimpan pada transaksi dan tidak mengubah
          riwayat sebelumnya.
        </p>
        <div>
          <input
            type="number"
            min="0"
            max="100"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Belum ditentukan"
          />
          <span>% untuk Cleaner</span>
        </div>
        <PrimaryButton onClick={() => setRevenueSharePercent(input === "" ? null : Number(input))}>
          Simpan Pengaturan
        </PrimaryButton>
      </section>
      <div className="admin-finance large">
        <div>
          <span>Total transaksi selesai</span>
          <b>{formatRupiah(totalTransactions)}</b>
        </div>
        <div>
          <span>Total bagian Cleaner</span>
          <b>{configured ? formatRupiah(cleanerTotal) : "Belum ditentukan"}</b>
        </div>
        <div>
          <span>Total bagian CleanMate</span>
          <b>{configured ? formatRupiah(totalTransactions - cleanerTotal) : "Belum ditentukan"}</b>
        </div>
      </div>
      <h2>Riwayat Transaksi</h2>
      {completed.length ? (
        completed.map((order) => <AdminOrderCard order={order} key={order.id} />)
      ) : (
        <Empty>Belum ada transaksi pekerjaan selesai.</Empty>
      )}
    </AppPage>
  );
}

export function AdminProfilePage() {
  const { currentUser, logout } = useCleanMate();
  const navigate = useNavigate();
  return (
    <AppPage className="admin-page">
      <PageHeader title="Profil Admin" />
      <div className="admin-profile">
        <span>A</span>
        <h2>{currentUser?.name}</h2>
        <p>{currentUser?.email}</p>
      </div>
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
