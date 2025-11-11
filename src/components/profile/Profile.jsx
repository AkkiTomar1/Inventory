// src/components/profile/Profile.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const DEFAULT_USER = {
  id: 1,
  name: "Admin User",
  email: "admin@example.com",
  contact: "9876543210",
  role: "Administrator",
  address: "Mall Road, Sitapur",
  avatar: "",
};

const Profile = () => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_USER });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const firstInputRef = useRef(null);

  // load from localStorage (if exists)
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser((u) => ({ ...u, ...parsed }));
        setForm((f) => ({ ...f, ...parsed }));
        setAvatarPreview(parsed.avatar || "");
      } catch {
        // ignore parse errors
      }
    } else {
      localStorage.setItem("user", JSON.stringify(DEFAULT_USER));
    }
  }, []);

  useEffect(() => {
    if (editing) {
      setTimeout(() => firstInputRef.current?.focus?.(), 80);
    }
  }, [editing]);

  const startEdit = () => {
    setForm({ ...user });
    setAvatarPreview(user.avatar || "");
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({ ...user });
    setAvatarPreview(user.avatar || "");
    setErrors({});
  };

  const validateProfile = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email is required";
    if (form.contact && !/^\d{7,15}$/.test(form.contact)) e.contact = "Enter a valid phone number (7–15 digits)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveProfile = () => {
    if (!validateProfile()) return;
    const updated = { ...user, ...form, avatar: avatarPreview };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    setEditing(false);
    setErrors({});
    // subtle success feedback
    try { window.toast?.success?.("Profile updated"); } catch(error) {
      console.log(error);
      
    }
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Password modal handling (demo)
  const openPasswordModal = () => {
    setPasswords({ current: "", newPass: "", confirm: "" });
    setErrors({});
    setShowPasswordModal(true);
  };

  const validatePassword = () => {
    const e = {};
    if (!passwords.current) e.current = "Enter current password";
    if (!passwords.newPass || passwords.newPass.length < 6) e.newPass = "New password must be at least 6 characters";
    if (passwords.newPass !== passwords.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = (ev) => {
    ev.preventDefault();
    if (!validatePassword()) return;
    // Demo: replace with API call in production
    alert("Password changed (demo). Implement API call to persist.");
    setShowPasswordModal(false);
    setPasswords({ current: "", newPass: "", confirm: "" });
    setErrors({});
  };

  // small helper for initials
  const initials = (fullName) =>
    fullName
      ? fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-linear-to-b from-white to-amber-50 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          {/* header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your account details and preferences</p>
            </div>

            <div className="flex items-center gap-3">
              {!editing ? (
                <>
                  <button
                    onClick={startEdit}
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-sm"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                  <button
                    onClick={openPasswordModal}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    <FaLock /> Change Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={saveProfile}
                    className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg shadow-sm"
                  >
                    <FaSave /> Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* main */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar column */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <div className="w-36 h-36 md:w-40 md:h-40 bg-linear-to-br from-amber-100 to-amber-50 rounded-full overflow-hidden flex items-center justify-center border border-gray-100">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl font-bold text-amber-700">{initials(user.name)}</div>
                  )}
                </div>

                {editing && (
                  <label
                    className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md cursor-pointer border border-gray-200"
                    title="Change avatar"
                  >
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                    <FaCamera className="text-gray-600" />
                  </label>
                )}
              </div>

              <div className="mt-4 text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
            </div>

            {/* Details column */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <FaUser /> <span>Full name</span>
                    </div>
                    {editing ? (
                      <input
                        ref={firstInputRef}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`mt-1 w-full p-2 rounded border ${errors.name ? "border-red-500" : "border-gray-200"}`}
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{user.name}</p>
                    )}
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </label>

                  <label className="block">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <FaEnvelope /> <span>Email</span>
                    </div>
                    {editing ? (
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`mt-1 w-full p-2 rounded border ${errors.email ? "border-red-500" : "border-gray-200"}`}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{user.email}</p>
                    )}
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </label>

                  <label className="block">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <FaPhone /> <span>Contact</span>
                    </div>
                    {editing ? (
                      <input
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                        className={`mt-1 w-full p-2 rounded border ${errors.contact ? "border-red-500" : "border-gray-200"}`}
                        inputMode="tel"
                        placeholder="9876543210"
                        autoComplete="tel"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{user.contact}</p>
                    )}
                    {errors.contact && <p className="text-sm text-red-600 mt-1">{errors.contact}</p>}
                  </label>

                  <label className="block">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <FaLock /> <span>Role</span>
                    </div>
                    {editing ? (
                      <input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="mt-1 w-full p-2 rounded border border-gray-200"
                        placeholder="Administrator"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{user.role}</p>
                    )}
                  </label>

                  <label className="sm:col-span-2 block">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <FaMapMarkerAlt /> <span>Address</span>
                    </div>
                    {editing ? (
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="mt-1 w-full p-2 rounded border border-gray-200"
                        rows="3"
                        placeholder="Your address"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{user.address}</p>
                    )}
                  </label>
                </div>
              </div>

              {/* small notes / actions */}
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  Tip: keep your contact and address updated so suppliers and notifications reach you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPasswordModal(false)} />
          <form onSubmit={handleChangePassword} className="relative z-10 bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button type="button" onClick={() => setShowPasswordModal(false)} className="text-gray-500">
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current password</label>
                <input
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  className={`mt-1 w-full p-2 rounded border ${errors.current ? "border-red-500" : "border-gray-200"}`}
                  type="password"
                  autoComplete="current-password"
                />
                {errors.current && <p className="text-sm text-red-600 mt-1">{errors.current}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  value={passwords.newPass}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                  className={`mt-1 w-full p-2 rounded border ${errors.newPass ? "border-red-500" : "border-gray-200"}`}
                  type="password"
                  autoComplete="new-password"
                />
                {errors.newPass && <p className="text-sm text-red-600 mt-1">{errors.newPass}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                <input
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  className={`mt-1 w-full p-2 rounded border ${errors.confirm ? "border-red-500" : "border-gray-200"}`}
                  type="password"
                  autoComplete="new-password"
                />
                {errors.confirm && <p className="text-sm text-red-600 mt-1">{errors.confirm}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700">Change</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
