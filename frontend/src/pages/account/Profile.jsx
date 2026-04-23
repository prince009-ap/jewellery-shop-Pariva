import { useState, useEffect } from "react";
import DatePicker from "../../components/common/DatePicker";
import SelectDropdown from "../../components/common/SelectDropdown";
import API from "../../services/api";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    dob: "",
    gender: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
        dob: res.data.dob ? new Date(res.data.dob).toISOString().split("T")[0] : "",
        gender: res.data.gender || "",
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
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        gender: user.gender || "",
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
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
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
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
  };

  if (loading) {
    return (
      <div className="profile-page-state">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-state">
        <div>Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card-header">
          <h2 className="profile-title">My Profile</h2>
          {!isEditing && (
            <button onClick={handleEditClick} className="profile-btn profile-btn-primary profile-header-btn">
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className={`profile-message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-grid">
            <div>
              <label className="profile-label">Full Name</label>
              {isEditing ? (
                <input type="text" name="name" value={editForm.name} onChange={handleInputChange} style={profileInputStyle} />
              ) : (
                <div className="profile-readonly">{user.name || "N/A"}</div>
              )}
            </div>

            <div>
              <label className="profile-label">Email Address</label>
              <div className="profile-readonly profile-readonly-disabled">{user.email || "N/A"}</div>
              <div className="profile-note">Email cannot be changed</div>
            </div>

            <div>
              <label className="profile-label">Mobile Number</label>
              {isEditing ? (
                <input type="tel" name="mobile" value={editForm.mobile} onChange={handleInputChange} style={profileInputStyle} />
              ) : (
                <div className="profile-readonly">{user.mobile || "N/A"}</div>
              )}
            </div>

            <div>
              <label className="profile-label">Gender</label>
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
                <div className="profile-readonly">
                  {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "N/A"}
                </div>
              )}
            </div>

            <div>
              <label className="profile-label">Date of Birth</label>
              {isEditing ? (
                <div style={{ width: "100%" }}>
                  <DatePicker name="dob" value={editForm.dob} onChange={handleInputChange} />
                </div>
              ) : (
                <div className="profile-readonly">{formatDate(user.dob)}</div>
              )}
            </div>
          </div>

          <div className="profile-info-card">
            <h3 className="profile-subtitle">Account Information</h3>
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span className="profile-info-label">Account Type:</span>
                <span className="profile-info-value">
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                </span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Member Since:</span>
                <span className="profile-info-value">{formatDate(user.createdAt)}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Account Status:</span>
                <span className={`profile-info-value ${user.isBlocked ? "blocked" : "active"}`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="profile-actions">
            <button onClick={handleSaveProfile} className="profile-btn profile-btn-primary">
              Save Changes
            </button>
            <button onClick={handleCancelEdit} className="profile-btn profile-btn-secondary">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-card profile-password-card">
        <div className="profile-password-header">
          <h3 className="profile-password-title">Change Password</h3>
          <button onClick={() => setShowPasswordSection(!showPasswordSection)} className="profile-btn profile-btn-secondary profile-toggle-btn">
            {showPasswordSection ? "Hide" : "Show"}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="profile-password-form">
            {passwordMessage && (
              <div className={`profile-message ${passwordMessage.includes("success") ? "success" : "error"}`}>
                {passwordMessage}
              </div>
            )}

            <div>
              <label className="profile-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInputChange}
                required
                className="profile-password-input"
              />
            </div>

            <div>
              <label className="profile-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                required
                minLength="6"
                className="profile-password-input"
              />
            </div>

            <div>
              <label className="profile-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                required
                minLength="6"
                className="profile-password-input"
              />
            </div>

            <div className="profile-actions profile-password-actions">
              <button type="submit" className="profile-btn profile-btn-primary">
                Change Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordMessage("");
                }}
                className="profile-btn profile-btn-secondary"
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
