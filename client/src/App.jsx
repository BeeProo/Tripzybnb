import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import HostLogin from './pages/HostLogin';
import HostRegister from './pages/HostRegister';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import Messages from './pages/Messages';
import BecomeHost from './pages/BecomeHost';
import HostDashboard from './pages/HostDashboard';
import HostListingView from './pages/HostListingView';

function AppContent() {
  const location = useLocation();

  // Hide footer on admin and host pages
  const hideFooterPaths = ['/admin', '/host-dashboard', '/host/', '/become-host'];
  const shouldHideFooter = hideFooterPaths.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        {/* User Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Host Auth */}
        <Route path="/host/login" element={<HostLogin />} />
        <Route path="/host/register" element={<HostRegister />} />
        {/* User Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/become-host" element={<BecomeHost />} />
        {/* Host Pages */}
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/host/listing/:id" element={<HostListingView />} />
        {/* Admin */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!shouldHideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
