import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import { Toaster } from "react-hot-toast";
import Unauthorized from "./pages/shared/Unauthorized";
import NotFound from "./pages/shared/NotFound";


import ElectricLoader from "./components/common/ElectricLoader";
import Notes from "./pages/user/Notes";
import RealTimeNotesDashboard from "./pages/user/CollabNotes";


// Lazy load components
const PrivateRoute = React.lazy(() =>
  import("./components/common/PrivateRoutes")
);
const ErrorFallback = React.lazy(() =>
  import("./components/common/ErrorFallback")
);

const Login = React.lazy(() => import("./pages/auth/Login"));
const Signup = React.lazy(() => import("./pages/auth/Signup"));


function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to your error reporting service
        console.error("Application Error:", error, errorInfo);
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <div className="App">
          <Suspense fallback={<ElectricLoader />}>
            <Routes>


              {/* ******************** User Routes ********************* */}
              <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Notes/>} />

              </Route>

              <Route path="*" element={<NotFound />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<Login />} />
              <Route path="/registration" element={<Signup />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
