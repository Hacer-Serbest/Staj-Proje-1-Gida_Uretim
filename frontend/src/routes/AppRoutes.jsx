import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Inventory from '../pages/inventory/Inventory';
import Production from '../pages/production/Production';
import Orders from '../pages/orders/Orders';
import Users from '../pages/users/Users';
import ChangePassword from '../pages/account/ChangePassword';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/production" element={<Production />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/account" element={<ChangePassword />} />

        <Route element={<RoleRoute allow={['admin']} />}>
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>
    </Route>

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
