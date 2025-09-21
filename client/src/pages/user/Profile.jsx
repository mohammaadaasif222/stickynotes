import { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Shield, Code, Edit2, Save, X, Check, AlertCircle } from "lucide-react";
import { useProfile } from "../../hooks/useUserApi";



export default function UserProfile() {
  const { profile, fetchProfile, updateProfileData, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateStatus(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      date_of_birth: profile?.date_of_birth || "",
    });
  };

  const handleSave = async () => {
    try {
      const result = await updateProfileData(editData);
      if (result.success) {
        setUpdateStatus('success');
        setIsEditing(false);
        setTimeout(() => setUpdateStatus(null), 3000);
      }
    } catch (error) {
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'inactive': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden py-10 px-4">
      {/* Animated Background Elements */}
      <div className="absolute w-[500px] h-[500px] bg-[#7c3aed]/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-[#0ea5e9]/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-1000"></div>
      <div className="absolute w-[300px] h-[300px] bg-[#10b981]/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-2000"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 mx-auto shadow-lg">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.username.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{profile.full_name || profile.username}</h1>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile.status)}`}>
            <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
            {profile.status?.charAt(0).toUpperCase() + profile.status?.slice(1)}
          </div>
        </div>

        {/* Status Message */}
        {updateStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            updateStatus === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {updateStatus === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>
              {updateStatus === 'success' 
                ? 'Profile updated successfully!' 
                : 'Failed to update profile. Please try again.'}
            </span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Personal Information Card */}
          <div className="lg:col-span-2 bg-[#1e2a3a]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <User className="w-6 h-6 text-blue-400" />
                Personal Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full p-3 bg-[#2a3b4c] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-[#2a3b4c] text-gray-100 rounded-lg border border-gray-600">
                    {profile.full_name || "-"}
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="p-3 bg-[#2a3b4c] text-gray-100 rounded-lg border border-gray-600 flex items-center justify-between">
                  <span>{profile.email}</span>
                  {!profile.email_verified_at && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Unverified</span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-3 bg-[#2a3b4c] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="p-3 bg-[#2a3b4c] text-gray-100 rounded-lg border border-gray-600 flex items-center justify-between">
                    <span>{profile.phone || "-"}</span>
                    {!profile.phone_verified_at && profile.phone && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Unverified</span>
                    )}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full p-3 bg-[#2a3b4c] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-[#2a3b4c] text-gray-100 rounded-lg border border-gray-600">
                    {profile.date_of_birth ? formatDate(profile.date_of_birth) : "-"}
                  </div>
                )}
              </div>

              {/* Username (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div className="p-3 bg-[#2a3b4c] text-gray-100 rounded-lg border border-gray-600">
                  {profile.username}
                </div>
              </div>

              {/* Country Code (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country Code</label>
                <div className="p-3 bg-[#2a3b4c] text-gray-100 rounded-lg border border-gray-600">
                  {profile.country_code}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Sidebar */}
          <div className="space-y-6">
            
            {/* Account Status Card */}
            <div className="bg-[#1e2a3a]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                Account Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Role</span>
                  <span className="text-blue-400 font-medium capitalize">{profile.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">User ID</span>
                  <span className="text-gray-100 font-mono text-sm">{profile.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Referrered By</span>
                  <span className="text-gray-100">{profile.reffered_by || "-"}</span>
                </div>
              </div>
            </div>

            {/* Referral Code Card */}
            <div className="bg-[#1e2a3a]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Code className="w-5 h-5 text-purple-400" />
                Referral Code
              </h3>
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-lg border border-purple-500/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">{profile.referral_code}</div>
                  <div className="text-sm text-gray-300">Share this code with friends</div>
                </div>
              </div>
            </div>

            {/* Activity Timeline Card */}
            <div className="bg-[#1e2a3a]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Activity Timeline
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-300 mb-1">Account Created</div>
                  <div className="text-gray-100 text-sm">{formatDate(profile.created_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-300 mb-1">Last Updated</div>
                  <div className="text-gray-100 text-sm">{formatDate(profile.updated_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-300 mb-1">Last Login</div>
                  <div className="text-gray-100 text-sm">{formatDate(profile.last_login_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}