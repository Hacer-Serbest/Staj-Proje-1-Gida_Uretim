import { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, KeyRound, Mail, Phone, IdCard, ShieldCheck } from 'lucide-react';
import * as authApi from '../../api/auth.api';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { ROLE_LABELS } from '../../utils/roles';

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

const getInitials = (fullName = '') =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
      <Icon size={16} />
    </span>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
    </div>
  </div>
);

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
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-soft-sm"
          style={{ background: 'linear-gradient(135deg, #0f2438 0%, #0f2438 60%, #b7ab8c 100%)' }}
        >
          {getInitials(user?.full_name)}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Hesabım</h1>
          <p className="mt-0.5 text-sm text-slate-600">
            {user?.full_name} — {ROLE_LABELS[user?.role] || user?.role}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-5 p-5">
          <h2 className="text-sm font-semibold text-slate-700">Profil Bilgileri</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileField icon={IdCard} label="Ad Soyad" value={user?.full_name} />
            <ProfileField icon={ShieldCheck} label="Rol" value={ROLE_LABELS[user?.role] || user?.role} />
            <ProfileField icon={Mail} label="E-posta" value={user?.email} />
            <ProfileField icon={Phone} label="Telefon" value={user?.phone} />
            <ProfileField icon={IdCard} label="Çalışan Kimlik No" value={user?.employee_id} />
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-brand-primary/60" />
            <h2 className="text-sm font-semibold text-slate-700">Şifre Değiştir</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="currentPassword"
              label="Mevcut Şifre"
              type="password"
              icon={Lock}
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
            <Input
              id="newPassword"
              label="Yeni Şifre"
              type="password"
              icon={Lock}
              required
              minLength={8}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            <Input
              id="confirmPassword"
              label="Yeni Şifre (Tekrar)"
              type="password"
              icon={Lock}
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />

            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </p>
            )}
            {successMessage && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                <CheckCircle2 size={16} className="shrink-0" />
                {successMessage}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
