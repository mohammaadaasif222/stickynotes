import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  signupUser,
  clearError,
  clearMessage,
  selectAuthLoading,
  selectAuthError,
  selectAuthMessage,
  selectIsAuthenticated,
} from "../../../store/slices/authSlice";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Inputs";

const SignupForm = ({ onSuccess, redirectPath = "/dashboard" }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};


    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Full name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "Full name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "Full name must be at least 2 characters";
    }
    // Full name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Full name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Full name must be at least 2 characters";
    }


    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setFormErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the form errors");
      return;
    }

    // Prepare data for submission (exclude confirmPassword)
    const { confirmPassword, ...submitData } = formData;
 
    

    try {
      console.log("hii")
      
      const result = await dispatch(signupUser(submitData));
      console.log(result)

      if (signupUser.fulfilled.match(result)) {
        // Handle successful signup
        toast.success(result.payload.message || "Registration successful!");

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.payload);
        }

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      // Error handling is done in the slice
      console.error("Signup error:", err);
    }
  };

  // Handle success/error messages from Redux
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (message && !error) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [message, error, dispatch]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && onSuccess) {
      // Redirect or handle success
    }
  }, [isAuthenticated, onSuccess]);

  return (
    <div className="lg:max-w-md text-white lg:mx-auto rounded-lg px-4 py-6 ">
      <h2 className="text-2xl font-semibold text-gray-300">
        Create Account
      </h2>
      <p className=" text-sm text-gray-400 mb-6">
        Sign up to manage your trades and access your dashboard.
      </p>


      <form onSubmit={handleSubmit} className="space-y-4 text-white">
        {/* Username */}
        <Input
          type="text"
          name="firstName"
          placeholder="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={formErrors.firstName}
          disabled={loading}
          required
        />
        <Input
          type="text"
          name="lastName"
          placeholder="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={formErrors.lastName}
          disabled={loading}
          required
        />

        {/* Email */}
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2 ">
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            disabled={loading}
            required
          />


        </div>

        {/* Password */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
            disabled={loading}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>



        {/* Submit Button */}
        <Button
          variant="success"
          type="submit"
          disabled={loading}
          className="w-full b text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center mt-4 text-sm text-gray-300">
        Already have an account?{" "}
        <a
          href="/"
          className="text-blue-300 hover:text-blue-400 font-semibold"
        >
          Sign in here
        </a>
      </p>
    </div>
  );
};

export default SignupForm;
