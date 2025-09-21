import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input, Checkbox } from "../../components/common/Inputs";
import { Form } from "../../components/common/Form";
import { Button } from "../../components/common/Button";
import {
  loginUser,
  forgotPassword,
  clearError,
  clearMessage,
  clearNotifications,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectAuthMessage,
  selectIsAuthenticated,
} from "../../store/slices/authSlice";
import { EyeOff } from 'lucide-react'
const validationSchema = Yup.object().shape({
  email: Yup.string().required("Email or username is required").trim(),
  password: Yup.string()
    .required("Password is required")
    .min(1, "Password cannot be empty"),
});
const initialValues = {
  email: "",
  password: "",
};

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' is 640px
    };

    handleResize(); // Set on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: useCallback(
      (values) => {
        const loginData = {
          ...values,
          rememberMe,
        };
        console.log(loginData)
        dispatch(loginUser(loginData));
      },
      [dispatch, rememberMe]
    ),
  });
  const handleForgotPassword = useCallback(() => {
    const email = formik.values.email.trim();
    if (!email) {
      formik.setFieldError("email", "Please enter your email address first");
      return;
    }

    setIsForgotMode(true);
    dispatch(forgotPassword({ email }));
  }, [formik, dispatch]);
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role || "user";
      navigate(`/dashboard`);
    }
  }, [isAuthenticated, user, navigate]);
  useEffect(() => {
    let errorTimer, messageTimer;

    if (error) {
      errorTimer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }

    if (message) {
      messageTimer = setTimeout(() => {
        dispatch(clearMessage());
        setIsForgotMode(false);
      }, 5000);
    }
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
      if (messageTimer) clearTimeout(messageTimer);
    };
  }, [error, message, dispatch]);
  useEffect(() => {
    return () => {
      dispatch(clearNotifications());
    };
  }, [dispatch]);

  return (
    <>
      <div
        className="relative border-2 border-white flex items-center justify-end text-white sm:p-8 py-8 px-4 bg-center bg-cover bg-black"

      >
        {/* Overlay */}
        {/* <div className="absolute inset-0 bg-black/70 z-10" /> */}
        <div className="sm:block hidden absolute inset-0 bg-black opacity-10" />
        <div className="relative w-full max-w-md sm:p-8 mx-3  rounded-lg  bg-[#00390f00] backdrop-blur-md sm:mx-0">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center">
              <h2 className="mt-6 text-4xl  text-white font-bold leading-9 tracking-tight">
                {isForgotMode ? "Forgot Password" : "Login"}
              </h2>
              <p className="mt-2 text-gray-300">
                {isForgotMode
                  ? "Enter your email to reset password"
                  : "Have an account?"}
              </p>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}
            {message && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md">
                <p className="text-green-300 text-sm text-center">{message}</p>
              </div>
            )}
            <div className="mt-8 t">
              <Form onSubmit={formik.handleSubmit}>
                <Input
                  type="text"
                  label="Email or Username"
                  placeholder="Enter email..."
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && formik.errors.email}
                  required
                  name="email"
                />
                {!isForgotMode && (
                  <Input
                    type="password"
                    label="Password"
                    placeholder="Password..."
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && formik.errors.password}
                    required
                    name="password"
                  />
                )}
                {!isForgotMode && (
                  <div className="flex items-center justify-between">
                    <Checkbox
                      label="Remember Me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#7db65e] hover:underline hover:text-[#64a242] transition-colors"
                      disabled={loading}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
                <Button
                  type="submit"
                  variant="success"
                  size="md"
                  loading={loading}
                  disabled={!formik.isValid || loading}
                  fullWidth
                  className="mt-4"
                >
                  {isForgotMode ? "Send Reset Link" : "Sign In"}
                </Button>
                {isForgotMode && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setIsForgotMode(false);
                      dispatch(clearNotifications());
                    }}
                    fullWidth
                    className="mt-3"
                  >
                    Back to Login
                  </Button>
                )}
              </Form>
              {!isForgotMode && (
                <p className="mt-4 text-base text-center text-white">
                  Not a member?{" "}
                  <Link
                    to="/registration"
                    className="font-semibold text-[#7db65e] hover:text-[#64a242] hover:underline"
                  >
                    Register Here
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
