import { Routes, Route } from "react-router-dom";
import { PharmacyLayout } from "./components/pharmacy/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Medicines from "./pages/Medicines.jsx";
import MedicineDetails from "./pages/MedicineDetails.jsx";
import Categories from "./pages/Categories.jsx";
import Stock from "./pages/Stock.jsx";
import Expired from "./pages/Expired.jsx";
import LowStock from "./pages/LowStock.jsx";
import Sales from "./pages/Sales.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <PharmacyLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/medicines/:medicineId" element={<MedicineDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/expired" element={<Expired />} />
        <Route path="/low-stock" element={<LowStock />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </PharmacyLayout>
  );
}
