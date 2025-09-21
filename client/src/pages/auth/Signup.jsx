import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { selectIsAuthenticated } from "../../store/slices/authSlice";
import SignupForm from "../../components/features/auth/SignupForm";

import { useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Get referral code from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const referralCode = searchParams.get("ref") || searchParams.get("referral");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' is 640px
    };

    handleResize(); // Set on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle successful signup
  const handleSignupSuccess = (userData) => {
    navigate(`/dashboard`);
    // Show success message and redirect after a brief delay
    // setTimeout(() => {
    //   if (userData.user?.status === 'inactive') {
    //     // If user needs email verification
    //     navigate('/verify-email', {
    //       state: {
    //         email: userData.user.email,
    //         message: 'Please check your email to verify your account.'
    //       }
    //     });
    //   } else {
    //     // Direct login success
    //     navigate(`${userData?.role}/dashboard`);
    //   }
    // }, 1500);
  };

  return (
    <>
      <div
        className="relative flex items-center justify-end text-white sm:p-8 py-8 px-4 bg-center bg-cover bg-black"
      >
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="max-w-lg w-full  sm:mx-0 relative   sm:px-4 ">
          <div className=" items-center">


            <div className="">
              <div className="  bg-[#00390f00] backdrop-blur-md  border border-white/20 shadow-xl rounded-2xl ">
                <SignupForm
                  onSuccess={handleSignupSuccess}
                  initialReferralCode={referralCode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Signup;
