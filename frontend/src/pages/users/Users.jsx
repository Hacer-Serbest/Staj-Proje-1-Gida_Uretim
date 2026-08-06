import { useEffect, useState } from 'react';
import { UserPlus, Power } from 'lucide-react';
import * as authApi from '../../api/auth.api';
import * as userApi from '../../api/user.api';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import { ROLES, ROLE_LABELS } from '../../utils/roles';

const emptyForm = { fullName: '', email: '', password: '', role: 'satis', phone: '', employeeId: '' };

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingUserId, setPendingUserId] = useState(null);

  const loadUsers = () => {
    setIsLoading(true);
    setListError('');
    userApi
      .listUsers()
      .then((res) => setUsers(res.data.data.users))
      .catch((err) => setListError(err.response?.data?.message || 'Kullanıcılar yüklenemedi.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadUsers, []);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormErrors({});
    setIsSubmitting(true);

    try {
      await authApi.register(form);
      setForm(emptyForm);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        setFormErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      }
      setFormError(err.response?.data?.message || 'Kullanıcı oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    setPendingUserId(id);
    try {
      const res = await userApi.updateUser(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data.data.user : u)));
    } catch (err) {
      setListError(err.response?.data?.message || 'Rol güncellenemedi.');
    } finally {
      setPendingUserId(null);
    }
  };

  const handleToggleActive = async (targetUser) => {
    setPendingUserId(targetUser.id);
    try {
      const res = await userApi.updateUser(targetUser.id, { isActive: !targetUser.is_active });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? res.data.data.user : u)));
    } catch (err) {
      setListError(err.response?.data?.message || 'Durum güncellenemedi.');
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Kullanıcılar</h1>
          <p className="mt-1 text-sm text-slate-600">Ekip üyelerini ekle, rol ve durumlarını yönet.</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)} className="gap-1.5">
          {!showForm && <UserPlus size={16} />}
          {showForm ? 'Vazgeç' : 'Yeni Kullanıcı'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="mb-6 grid animate-fade-slide-up grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-soft-md sm:grid-cols-2 lg:grid-cols-4"
        >
          <Input
            id="fullName"
            label="Ad Soyad"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            error={formErrors.fullName}
          />
          <Input
            id="email"
            label="E-posta"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={formErrors.email}
          />
          <Input
            id="password"
            label="Şifre"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={formErrors.password}
            placeholder="En az 8 karakter"
          />
          <Select
            id="role"
            label="Rol"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
          <Input
            id="phone"
            label="Telefon (opsiyonel)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={formErrors.phone}
            placeholder="0532 000 00 00"
          />
          <Input
            id="employeeId"
            label="Çalışan Kimlik No (opsiyonel)"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            error={formErrors.employeeId}
            placeholder="EMP-0001"
          />

          {formError && <p className="col-span-full text-sm text-red-600">{formError}</p>}

          <div className="col-span-full">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : listError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{listError}</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-primary/10 text-xs uppercase tracking-wide text-brand-primary/70">
              <tr>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Kimlik No</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-brand-primary/5 transition-colors last:border-0 hover:bg-brand-primary/[0.03]"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.employee_id || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={pendingUserId === u.id || u.id === currentUser.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="rounded-lg border border-brand-primary/20 px-2.5 py-1.5 text-xs outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(8,89,124,0.12)] disabled:opacity-50"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.is_active ? 'success' : 'danger'}>
                      {u.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      className="gap-1 px-3 py-1.5 text-xs"
                      disabled={pendingUserId === u.id || u.id === currentUser.id}
                      onClick={() => handleToggleActive(u)}
                    >
                      <Power size={13} />
                      {u.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Users;
