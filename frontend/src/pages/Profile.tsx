// This page allows the user to view and update their profile information (name, email, password).
// It manages form state, handles profile update requests, and displays success/error messages.

import React, { useState } from "react";
import { useMutation } from "react-query";
import { userApi } from "../services/api";
import { useNavigate } from "react-router-dom";

// Helper to get the current user from localStorage
const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

// Profile page component
const Profile: React.FC = () => {
  // Get user info from localStorage
  const user = getUserFromStorage();
  // State for form fields
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  // State for success and error messages
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  // React Router navigation
  const navigate = useNavigate();

  // Mutation for updating the user profile
  const mutation = useMutation(userApi.updateProfile, {
    onSuccess: (res) => {
      setSuccess("Profile updated successfully.");
      setError("");
      // Update user info in localStorage
      localStorage.setItem("user", JSON.stringify(res.data));
      setFormData((prev) => ({ ...prev, password: "" }));
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
      setSuccess("");
    },
  });

  // Handle input changes for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for profile update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Email is required.");
      return;
    }
    // Send update request
    mutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
    });
  };

  // Render profile form UI
  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-md border border-gray-200">
      {/* Back to dashboard button */}
      <button
        type="button"
        onClick={() => {
          window.location.href = "/dashboard";
        }}
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
      >
        <span className="inline-block align-middle mr-2">
          <svg width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L4.414 9H16a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        Back to Tasks
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>
      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4 text-center">
          {success}
        </div>
      )}
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}
      {/* Profile update form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Leave blank to keep current password"
            minLength={6}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-semibold text-lg transition-colors disabled:opacity-50"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
