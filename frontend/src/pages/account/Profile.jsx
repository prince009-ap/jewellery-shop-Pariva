import { useState, useEffect } from "react";
import DatePicker from "../../components/common/DatePicker";
import SelectDropdown from "../../components/common/SelectDropdown";
import API from "../../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    dob: "",
    gender: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
      setEditForm({
        name: res.data.name || "",
        mobile: res.data.mobile || "",
        dob: res.data.dob ? new Date(res.data.dob).toISOString().split('T')[0] : "",
        gender: res.data.gender || ""
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        name: user.name || "",
        mobile: user.mobile || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        gender: user.gender || ""
      });
    }
    setMessage("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.put("/auth/update-profile", editForm);
      setUser({ ...user, ...editForm });
      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      await API.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordSection(false);
      setPasswordMessage("Password changed successfully!");
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || "Failed to change password");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const profileInputStyle = {
    width: "100%",
    minHeight: "52px",
    padding: "0.95rem 1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    fontSize: "0.95rem",
    color: "#334155",
    background: "linear-gradient(180deg, #ffffff 0%, #fffdfa 100%)",
    outline: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)"
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Failed to load profile</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: 0, color: "#111827", fontSize: "1.5rem" }}>My Profile</h2>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              style={{
                background: "#d4af37",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            background: message.includes("success") ? "#d1fae5" : "#fee2e2",
            color: message.includes("success") ? "#065f46" : "#991b1b",
            border: `1px solid ${message.includes("success") ? "#a7f3d0" : "#fca5a5"}`
          }}>
            {message}
          </div>
        )}

        {/* Profile Information */}
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {/* Name */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  style={profileInputStyle}
                />
              ) : (
                <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "6px", color: "#111827" }}>
                  {user.name || "N/A"}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                Email Address
              </label>
              <div style={{ padding: "0.5rem", background: "#f3f4f6", borderRadius: "6px", color: "#6b7280" }}>
                {user.email || "N/A"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                Email cannot be changed
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                Mobile Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={editForm.mobile}
                  onChange={handleInputChange}
                  style={profileInputStyle}
                />
              ) : (
                <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "6px", color: "#111827" }}>
                  {user.mobile || "N/A"}
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                Gender
              </label>
              {isEditing ? (
                <SelectDropdown
                  name="gender"
                  value={editForm.gender}
                  onChange={handleInputChange}
                  options={[
                    { value: "", label: "Select Gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                  placeholder="Select Gender"
                />
              ) : (
                <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "6px", color: "#111827" }}>
                  {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "N/A"}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                Date of Birth
              </label>
              {isEditing ? (
                <div style={{ width: "100%" }}>
                  <DatePicker
                    name="dob"
                    value={editForm.dob}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "6px", color: "#111827" }}>
                  {formatDate(user.dob)}
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div style={{
            background: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#111827", fontSize: "1.125rem" }}>Account Information</h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "#6b7280" }}>Account Type:</span>
                <span style={{ color: "#111827", fontWeight: "500" }}>
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "#6b7280" }}>Member Since:</span>
                <span style={{ color: "#111827", fontWeight: "500" }}>
                  {formatDate(user.createdAt)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "#6b7280" }}>Account Status:</span>
                <span style={{
                  color: user.isBlocked ? "#dc2626" : "#059669",
                  fontWeight: "500"
                }}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
            <button
              onClick={handleSaveProfile}
              style={{
                background: "#d4af37",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                background: "white",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
        marginTop: "2rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, color: "#111827", fontSize: "1.25rem" }}>Change Password</h3>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            style={{
              background: "white",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
          >
            {showPasswordSection ? "Hide" : "Show"}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: "1rem" }}>
            {passwordMessage && (
              <div style={{
                padding: "0.75rem",
                borderRadius: "6px",
                background: passwordMessage.includes("success") ? "#d1fae5" : "#fee2e2",
                color: passwordMessage.includes("success") ? "#065f46" : "#991b1b",
                border: `1px solid ${passwordMessage.includes("success") ? "#a7f3d0" : "#fca5a5"}`
              }}>
                {passwordMessage}
              </div>
            )}

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInputChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                required
                minLength="6"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                required
                minLength="6"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="submit"
                style={{
                  background: "#d4af37",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500"
                }}
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                  });
                  setPasswordMessage("");
                }}
                style={{
                  background: "white",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
