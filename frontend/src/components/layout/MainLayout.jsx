import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export default MainLayout;
