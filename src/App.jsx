import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

/* ================= CORE PAGES ================= */
import RoleSelection from "./pages/RoleSelection.jsx";
import Signup from "./pages/Signup.jsx";
import TrainerSignup from "./pages/TrainerSignup.jsx";
import InstituteSignup from "./pages/InstituteSignup.jsx";
import Login from "./pages/Login.jsx";
import Landing from "./pages/Landing.jsx";

/* ================= NAVBAR ================= */
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer";
import About from "./pages/About.jsx";
import Career from "./pages/Career.jsx";
import Contact from "./pages/Contact.jsx";
/* ================= SHOP ================= */
import ShopPage from "./components/ShopPage.jsx";
import ProductsGridPage from "./components/ProductsGridPage.jsx";
import AddAddressPage from "./components/AddAddressPage.jsx";
import PaymentPage from "./components/PaymentPage.jsx";
import CartPage from "./components/CartPage.jsx";
import WishlistPage from "./components/WishlistPage.jsx";

/* ================= DASHBOARDS (index.jsx based) ================= */
import InstituteDashboard from "./components/InstituteDashboard";
import TrainersDashboard from "./components/TrainersDashboard";
import UserDashboard from "./components/UserDashboard";

/* ================= LIST & DETAILS ================= */
import ViewInstitutes from "./pages/ViewInstitutes.jsx";
import ViewTrainers from "./pages/ViewTrainers.jsx";
import InstituteDetailsPage from "./pages/InstituteDetailsPage.jsx";
import TrainerDetailsPage from "./pages/TrainerDetailsPage.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import PaymentPolicy from "./pages/PaymentPolicy.jsx";
import CustomerCentricPolicies from "./pages/CustomerCentricPolicies.jsx";
import DeliveryAndShippingPolicy from "./pages/DeliveryAndShippingPolicy.jsx";


/* ================= SELL FLOW ================= */
import SellSportsMaterial from "./components/InstituteDashboard/SellSportsMaterial.jsx";
import UploadProductDetails from "./components/InstituteDashboard/UploadProductDetails.jsx";

/* ================= SERVICES ================= */
import MartialArts from "./pages/Services/MartialArts.jsx";
import TeamBallSports from "./pages/Services/TeamBallSports.jsx";
import RacketSports from "./pages/Services/RacketSports.jsx";
import Fitness from "./pages/Services/Fitness.jsx";
import TargetPrecisionSports from "./pages/Services/TargetPrecisionSports.jsx";
import EquestrianSports from "./pages/Services/EquestrianSports.jsx";
import AdventureOutdoorSports from "./pages/Services/AdventureOutdoorSports.jsx";
import IceSports from "./pages/Services/IceSports.jsx";
import Wellness from "./pages/Services/Wellness.jsx";
import Dance from "./pages/Services/Dance.jsx";
import AvailableDemoClasses from "./pages/AvailableDemoClasses.jsx";
import "./index.css";
import Plans from "./pages/Plans.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
function App() {
  const location = useLocation();

  const hideNavbarPaths = [
    "/RoleSelection",
    "/login",
    "/signup",
    "/trainer-signup",
    "/institute-signup",
  ];
  const hideFooterPaths = [
    "/RoleSelection", // Welcome to Kridana page
  ];

  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  const showFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="bg-white text-black min-h-screen">
            {showNavbar && <Navbar />}
            <ScrollToTop />

            <Routes>
              {/* AUTH */}
              <Route path="/about" element={<About />} />
              <Route path="/career" element={<Career />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/trainer-signup" element={<TrainerSignup />} />
              <Route path="/institute-signup" element={<InstituteSignup />} />

              {/* LANDING */}
              <Route path="/RoleSelection" element={<RoleSelection />} />

              {/* DASHBOARDS */}
              <Route
                path="/trainers/dashboard"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainersDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/institutes/dashboard"
                element={
                  <ProtectedRoute role="institute">
                    <InstituteDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/user/dashboard" element={<UserDashboard />} />

              {/* SELL */}
              <Route
                path="/sell-sports-material"
                element={<SellSportsMaterial />}
              />
              <Route
                path="/upload-product-details"
                element={<UploadProductDetails />}
              />

              {/* SHOP */}
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:category" element={<ProductsGridPage />} />
              <Route path="/addresspage" element={<AddAddressPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />

              {/* LIST & DETAILS */}
              <Route path="/trainers" element={<ViewTrainers />} />
              <Route path="/institutes" element={<ViewInstitutes />} />
              <Route path="/trainers/:id" element={<TrainerDetailsPage />} />
              <Route
                path="/institutes/:id"
                element={<InstituteDetailsPage />}
              />
              <Route path="/viewTrainers" element={<ViewTrainers />} />
              <Route path="/viewInstitutes" element={<ViewInstitutes />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/paymentpolicy" element={<PaymentPolicy />} />
              <Route path="/customer-policies" element={<CustomerCentricPolicies />} />
              <Route path="/delivery-shipping-policy" element={<DeliveryAndShippingPolicy />} />



              {/* SERVICES */}
              <Route path="/services/martial-arts" element={<MartialArts />} />
              <Route path="/services/teamball" element={<TeamBallSports />} />
              <Route path="/services/racketsports" element={<RacketSports />} />
              <Route path="/services/fitness" element={<Fitness />} />
              <Route
                path="/services/target-precision-sports"
                element={<TargetPrecisionSports />}
              />
              <Route
                path="/services/equestrian-sports"
                element={<EquestrianSports />}
              />
              <Route
                path="/services/adventure-outdoor-sports"
                element={<AdventureOutdoorSports />}
              />
              <Route path="/services/ice-sports" element={<IceSports />} />
              <Route path="/services/wellness" element={<Wellness />} />
              <Route path="/services/dance" element={<Dance />} />
              
              <Route path="/plans" element={<Plans />} />
              <Route
                path="/book-demo/:instituteId"
                element={<AvailableDemoClasses />}
              />
            </Routes>
            {showFooter && <Footer />}
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
