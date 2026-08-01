import { useState } from 'react';
import * as authApi from '../../api/auth.api';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ROLE_LABELS } from '../../utils/roles';

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

const ChangePassword = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Yeni şifre ile şifre tekrarı eşleşmiyor.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(emptyForm);
      setSuccessMessage('Şifreniz başarıyla güncellendi.');
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre güncellenemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-primary">Hesabım</h1>
      <p className="mt-1 text-sm text-slate-600">
        {user?.full_name} — {ROLE_LABELS[user?.role] || user?.role}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex max-w-sm flex-col gap-4 rounded-xl bg-white/70 p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-700">Şifre Değiştir</h2>

        <Input
          id="currentPassword"
          label="Mevcut Şifre"
          type="password"
          required
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        <Input
          id="newPassword"
          label="Yeni Şifre"
          type="password"
          required
          minLength={8}
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <Input
          id="confirmPassword"
          label="Yeni Şifre (Tekrar)"
          type="password"
          required
          minLength={8}
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
