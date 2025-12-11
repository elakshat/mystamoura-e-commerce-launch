import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminGuard } from "@/components/admin/AdminGuard";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CollectionPage from "./pages/CollectionPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import ShippingPage from "./pages/ShippingPage";
import RefundPage from "./pages/RefundPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import WishlistPage from "./pages/WishlistPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReviews from "./pages/admin/AdminReviews";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/collections/:slug" element={<CollectionPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/refund" element={<RefundPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminGuard>
                      <AdminProducts />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/products/new"
                  element={
                    <AdminGuard>
                      <AdminProductForm />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/products/:id/edit"
                  element={
                    <AdminGuard>
                      <AdminProductForm />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminGuard>
                      <AdminOrders />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/orders/:id"
                  element={
                    <AdminGuard>
                      <AdminOrderDetail />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/coupons"
                  element={
                    <AdminGuard>
                      <AdminCoupons />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminGuard>
                      <AdminSettings />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <AdminGuard>
                      <AdminCustomers />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <AdminGuard>
                      <AdminReviews />
                    </AdminGuard>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
