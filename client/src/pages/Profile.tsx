import { useState } from "react";
import { UserRound, ShieldCheck, Save } from "lucide-react";
import { api, errorMessage } from "../api";
import type { User } from "../api";
import { Button, Card, Toast } from "../components/UI";

export default function Profile({
  user,
  onUserChange
}: {
  user: User;
  onUserChange: (user: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastKind, setToastKind] = useState<"success" | "error">("success");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setToast("");

    if (!name.trim()) {
      setToastKind("error");
      setToast("Name is required");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setToastKind("error");
      setToast("New password must be at least 8 characters");
      return;
    }
    if (newPassword && !currentPassword) {
      setToastKind("error");
      setToast("Enter your current password to change it");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put("/users/me", {
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
        ...(newPassword ? { currentPassword, newPassword } : {})
      });

      onUserChange(response.data.user);
      setCurrentPassword("");
      setNewPassword("");
      setToastKind("success");
      setToast("Profile updated successfully");
    } catch (err) {
      setToastKind("error");
      setToast(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="text-sm text-slate-400">Workspace / Profile</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-800">My profile</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your account details and security.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <Card className="h-fit text-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile avatar" className="mx-auto h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-blue-100 text-3xl font-extrabold text-blue-700">
              {name.charAt(0).toUpperCase() || <UserRound size={32} />}
            </div>
          )}
          <h2 className="mt-4 text-lg font-bold text-slate-800">{name || user.name}</h2>
          <p className="mt-1 break-all text-sm text-slate-400">{user.email}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck size={15} /> Authenticated account
          </div>
        </Card>

        <Card>
          <form onSubmit={save} className="space-y-6">
            <div>
              <h2 className="font-bold text-slate-800">Personal information</h2>
              <p className="mt-1 text-sm text-slate-400">Update the name and profile image shown in ShopDesk.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Full name *</label>
              <input className="field" value={name} required maxLength={80} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Email address</label>
              <input className="field bg-slate-50" value={user.email} readOnly />
              <p className="mt-1 text-xs text-slate-400">Email changes are not enabled in this version.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Avatar URL (optional)</label>
              <input className="field" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" />
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="font-bold text-slate-800">Change password</h2>
              <p className="mt-1 text-sm text-slate-400">Leave both password fields empty to keep your current password.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Current password</label>
              <input className="field" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">New password</label>
              <input className="field" type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save size={16} /> {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {toast && <Toast message={toast} kind={toastKind} close={() => setToast("")} />}
    </div>
  );
}