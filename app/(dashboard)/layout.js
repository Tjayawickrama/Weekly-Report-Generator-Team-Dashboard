import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import ToastContainer from '@/components/Toast';

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}
