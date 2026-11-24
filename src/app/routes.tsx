import { createBrowserRouter, Navigate, Outlet } from "react-router";
import * as Pages from "../pages";
import { type UserRole, useCleanMate } from "../state/CleanMateContext";

function RoleGuard({ role }: { role: UserRole }) {
  const { currentUser } = useCleanMate();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) {
    const destination =
      currentUser.role === "customer"
        ? "/home"
        : currentUser.role === "cleaner"
          ? "/cleaner"
          : "/admin";
    return <Navigate to={destination} replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/", Component: Pages.SplashScreen },
  { path: "/onboarding", Component: Pages.OnboardingPage },
  { path: "/login", Component: Pages.LoginPage },
  { path: "/cleaner/login", Component: Pages.CleanerLoginPage },
  {
    element: <RoleGuard role="customer" />,
    children: [
      { path: "/home", Component: Pages.HomePage },
      { path: "/layanan/:type", Component: Pages.ServicesPage },
      { path: "/detail/:service", Component: Pages.ServiceDetailPage },
      { path: "/pilih-cleaner", Component: Pages.CleanerSelectPage },
      { path: "/pilih-jadwal", Component: Pages.SchedulePage },
      { path: "/alamat-layanan", Component: Pages.AddressPage },
      { path: "/tambah-alamat", Component: Pages.AddAddressPage },
      { path: "/hewan-peliharaan", Component: Pages.PetPage },
      { path: "/ringkasan", Component: Pages.OrderSummaryPage },
      { path: "/pembayaran", Component: Pages.PaymentPage },
      { path: "/pesanan-berhasil", Component: Pages.SuccessPage },
      { path: "/pesanan", Component: Pages.OrdersPage },
      { path: "/tracking/:orderId?", Component: Pages.TrackingPage },
      { path: "/profil", Component: Pages.ProfilePage },
      { path: "/profil/informasi-akun", Component: Pages.AccountInfoPage },
      { path: "/profil/alamat", Component: Pages.SavedAddressesPage },
      { path: "/profil/help-center", Component: Pages.HelpCenterPage },
      { path: "/profil/cleanmate-center", Component: Pages.CleanMateCenterPage },
      { path: "/profil/pengaturan", Component: Pages.SettingsPage },
      { path: "/profil/pengaturan/bahasa", Component: Pages.LanguagePage },
      { path: "/profil/pengaturan/ubah-sandi", Component: Pages.PasswordPage },
    ],
  },
  {
    element: <RoleGuard role="cleaner" />,
    children: [
      { path: "/cleaner", Component: Pages.CleanerDashboardPage },
      { path: "/cleaner/pesanan", Component: Pages.CleanerOrdersPage },
      { path: "/cleaner/pesanan/:orderId", Component: Pages.CleanerOrderPage },
      { path: "/cleaner/jadwal", Component: Pages.CleanerCalendarPage },
      { path: "/cleaner/menuju-lokasi/:orderId", Component: Pages.CleanerRoutePage },
      { path: "/cleaner/chat/:orderId", Component: Pages.CleanerCustomerChatPage },
      { path: "/cleaner/pendapatan", Component: Pages.CleanerIncomePage },
      { path: "/cleaner/profil", Component: Pages.CleanerProfilePage },
    ],
  },
  {
    element: <RoleGuard role="admin" />,
    children: [
      { path: "/admin", Component: Pages.AdminDashboardPage },
      { path: "/admin/pesanan", Component: Pages.AdminOrdersPage },
      { path: "/admin/pesanan/:orderId", Component: Pages.AdminOrderDetailPage },
      { path: "/admin/pengguna", Component: Pages.AdminUsersPage },
      { path: "/admin/jadwal", Component: Pages.AdminSchedulePage },
      { path: "/admin/pendapatan", Component: Pages.AdminIncomePage },
      { path: "/admin/profil", Component: Pages.AdminProfilePage },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
