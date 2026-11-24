import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { A, AppPage, Field, Icon, PageHeader, PrimaryButton, Tag } from "../components/ui";
import { useCleanMate } from "../state/CleanMateContext";

export function AccountInfoPage() {
  const [name, setName] = useState("Jenni");
  const [email, setEmail] = useState("jenni@gmail.com");
  const [phone, setPhone] = useState("08547897719");
  return (
    <AppPage className="account-page">
      <PageHeader title="Informasi Akun" />
      <div className="account-avatar">
        <img src={`${A}/87e2c.png`} alt="Jenni" />
        <span>▣</span>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <Field label="Nama Lengkap" value={name} onChange={setName} />
        <Field label="Tanggal Lahir" value="12 Mei 2004" />
        <Field label="Email" value={email} onChange={setEmail} />
        <Field label="Nomor Telepon" value={phone} onChange={setPhone} />
        <PrimaryButton type="submit">Simpan Perubahan</PrimaryButton>
      </form>
    </AppPage>
  );
}

export function SavedAddressesPage() {
  const { addresses, removeAddress } = useCleanMate();
  return (
    <AppPage className="form-page">
      <PageHeader title="Alamat Tersimpan" />
      <div className="address-cards">
        {addresses.map((address) => (
          <article key={address.id}>
            <Tag>{address.label}</Tag>
            <p>{address.fullAddress}</p>
            {(address.recipient || address.phone) && (
              <small>{[address.recipient, address.phone].filter(Boolean).join(" · ")}</small>
            )}
            {address.detail && <small>{address.detail}</small>}
            <div>
              <Link to="/tambah-alamat">＋ &nbsp; Tambah baru</Link>
              <button onClick={() => removeAddress(address.id)}>Hapus</button>
            </div>
          </article>
        ))}
      </div>
      <div className="bottom-action">
        <PrimaryButton to="/tambah-alamat">＋ &nbsp; Tambah Alamat Baru</PrimaryButton>
      </div>
    </AppPage>
  );
}

export function HelpCenterPage() {
  return (
    <AppPage className="help-page">
      <PageHeader title="Help Center" />
      <div className="help-content">
        <Icon name="df8a7.svg" />
        <h1>
          Hubungi CleanMate
          <br />
          melalui WhatsApp
        </h1>
        <b>08547897719</b>
        <p>
          Tim bantuan kami siap
          <br />
          membantu Anda.
        </p>
      </div>
      <div className="bottom-action">
        <Link className="primary-button" to="/profil/cleanmate-center">
          <Icon name="232f9.svg" />
          Chat via WhatsApp
        </Link>
      </div>
    </AppPage>
  );
}

export function CleanMateCenterPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; time: string }[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);
  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      {
        text,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessage("");
  };
  return (
    <AppPage className="chat-page">
      <header className="chat-header">
        <Link to="/profil/help-center" aria-label="Kembali ke Help Center">
          ‹
        </Link>
        <img src={`${A}/6add8.svg`} alt="" />
        <span>
          <b>CleanMate Center</b>
          <small>Online</small>
        </span>
        <div className="chat-actions">
          <button type="button" aria-label="Video call">
            ▻
          </button>
          <button type="button" aria-label="Telepon">
            ☎
          </button>
        </div>
      </header>
      <div className="chat-body" ref={bodyRef}>
        <span className="today">Hari ini</span>
        <div className="chat-bubble">
          Halo!
          <br />
          Terima kasih telah menghubungi
          <br />
          CleanMate Center.
          <br />
          <br />
          Tim kami siap membantu Anda mengenai:
          <br />• Informasi layanan
          <br />• Pemesanan dan jadwal
          <br />• Pembayaran
          <br />• Kendala aplikasi
          <br />• Dan pertanyaan lainnya
          <br />
          <br />
          Silakan ketik pesan Anda, ya!<small>09.41</small>
        </div>
        {messages.map((item, index) => (
          <div className="chat-bubble sent" key={`${item.time}-${index}`}>
            {item.text}
            <small>{item.time}</small>
          </div>
        ))}
      </div>
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div className="chat-compose">
          <button type="button" aria-label="Emoji">
            ☺
          </button>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
          />
          <button type="button" aria-label="Lampiran">
            ⌕
          </button>
          <button type="button" aria-label="Kamera">
            ▣
          </button>
        </div>
        <button type="submit" aria-label={message.trim() ? "Kirim pesan" : "Pesan suara"}>
          {message.trim() ? "➤" : "●"}
        </button>
      </form>
    </AppPage>
  );
}

export function SettingsPage() {
  return (
    <AppPage className="form-page">
      <PageHeader title="Pengaturan" />
      <div className="menu-list settings-list">
        <Link to="/profil/pengaturan/bahasa">
          <Icon name="b03c4.svg" />
          <span>
            Bahasa<small>Indonesia</small>
          </span>
          <b>›</b>
        </Link>
        <Link to="/profil/pengaturan/ubah-sandi">
          <Icon name="6f98a.svg" />
          <span>Ubah Sandi</span>
          <b>›</b>
        </Link>
      </div>
    </AppPage>
  );
}

export function LanguagePage() {
  const [language, setLanguage] = useState("Indonesia");
  return (
    <AppPage className="form-page">
      <PageHeader title="Bahasa" />
      <div className="language-list">
        {[
          ["Indonesia", "🇮🇩"],
          ["Inggris", "🇬🇧"],
        ].map(([label, flag]) => (
          <button onClick={() => setLanguage(label)} key={label}>
            <span>{flag}</span>
            <b>{label}</b>
            <i className={language === label ? "selected" : ""} />
          </button>
        ))}
      </div>
    </AppPage>
  );
}

export function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const rules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    matches: confirmation.length > 0 && confirmation === newPassword,
  };
  const valid =
    currentPassword.length > 0 &&
    rules.length &&
    rules.uppercase &&
    rules.lowercase &&
    rules.number &&
    rules.matches;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSuccess(false);
    if (!valid) return;
    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmation("");
  };
  return (
    <AppPage className="account-page password-page">
      <PageHeader title="Ubah Sandi" />
      <p className="lead">
        Masukkan sandi baru untuk akun Anda.
        <br />
        Pastikan sandi minimal 8 karakter.
      </p>
      <form onSubmit={submit} noValidate>
        <Field
          label="Sandi Saat Ini"
          type="password"
          icon="27025.svg"
          placeholder="Masukkan sandi saat ini"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <Field
          label="Sandi Baru"
          type="password"
          icon="27025.svg"
          placeholder="Masukkan sandi baru"
          value={newPassword}
          onChange={setNewPassword}
        />
        <Field
          label="Konfirmasi Sandi Baru"
          type="password"
          icon="27025.svg"
          placeholder="Masukkan kembali sandi baru"
          value={confirmation}
          onChange={setConfirmation}
        />
        <div className="requirements">
          <b>Sandi harus mengandung:</b>
          <span className={rules.length ? "valid" : ""}>✓ &nbsp; Minimal 8 karakter</span>
          <span className={rules.uppercase ? "valid" : ""}>✓ &nbsp; Huruf besar (A–Z)</span>
          <span className={rules.lowercase ? "valid" : ""}>✓ &nbsp; Huruf kecil (a–z)</span>
          <span className={rules.number ? "valid" : ""}>✓ &nbsp; Angka (0–9)</span>
          <span className={rules.matches ? "valid" : ""}>✓ &nbsp; Konfirmasi sesuai</span>
        </div>
        {submitted && !success && !valid && (
          <p className="form-feedback error" role="alert">
            Lengkapi semua kolom dan pastikan sandi baru memenuhi seluruh ketentuan.
          </p>
        )}
        {success && (
          <p className="form-feedback success" role="status">
            Simulasi berhasil. Sandi tidak disimpan atau dikirim ke server.
          </p>
        )}
        <PrimaryButton type="submit">Ubah Sandi</PrimaryButton>
      </form>
    </AppPage>
  );
}
