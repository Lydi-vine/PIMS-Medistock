// Mock data for the Pharmacy Inventory Management System.
// Dates are generated relative to today so expiry logic is always demonstrable.

const day = 86400000;
export const iso = (offsetDays) =>
  new Date(Date.now() + offsetDays * day).toISOString().slice(0, 10);

export const categories = [
  { id: "CAT-01", name: "Antibiotics", description: "Medicines that fight bacterial infections", status: "Active" },
  { id: "CAT-02", name: "Analgesics", description: "Pain relief medication", status: "Active" },
  { id: "CAT-03", name: "Antimalarials", description: "Treatment and prevention of malaria", status: "Active" },
  { id: "CAT-04", name: "Vitamins", description: "Supplements and micronutrients", status: "Active" },
  { id: "CAT-05", name: "Antiseptics", description: "Topical disinfectants and wound care", status: "Active" },
  { id: "CAT-06", name: "Cardiovascular", description: "Heart and blood pressure medication", status: "Active" },
  { id: "CAT-07", name: "Diabetes", description: "Blood sugar control medication", status: "Active" },
  { id: "CAT-08", name: "Respiratory", description: "Asthma and airway treatments", status: "Inactive" },
];

// name, generic, categoryId, manufacturer, batch, price, qty, reorder, expiryOffsetDays, supplier
const seeds = [
  ["Amoxil 500mg", "Amoxicillin", "CAT-01", "GSK", "BN-1001", 1200, 240, 50, 420, "Kigali Pharma Ltd"],
  ["Azithro 250mg", "Azithromycin", "CAT-01", "Pfizer", "BN-1002", 2500, 38, 40, 190, "MedSupply Rwanda"],
  ["Ciproxin 500mg", "Ciprofloxacin", "CAT-01", "Bayer", "BN-1003", 1800, 12, 30, -25, "Kigali Pharma Ltd"],
  ["Doxycap 100mg", "Doxycycline", "CAT-01", "Cipla", "BN-1004", 900, 310, 60, 610, "East Africa Meds"],
  ["Flagyl 400mg", "Metronidazole", "CAT-01", "Sanofi", "BN-1005", 700, 18, 45, 22, "MedSupply Rwanda"],
  ["Panadol 500mg", "Paracetamol", "CAT-02", "GSK", "BN-2001", 300, 900, 150, 540, "Kigali Pharma Ltd"],
  ["Brufen 400mg", "Ibuprofen", "CAT-02", "Abbott", "BN-2002", 450, 420, 100, 300, "East Africa Meds"],
  ["Diclomax 50mg", "Diclofenac", "CAT-02", "Cipla", "BN-2003", 600, 25, 60, -60, "MedSupply Rwanda"],
  ["Tramal 50mg", "Tramadol", "CAT-02", "Grunenthal", "BN-2004", 1500, 80, 40, 210, "Kigali Pharma Ltd"],
  ["Aspirin 75mg", "Acetylsalicylic acid", "CAT-02", "Bayer", "BN-2005", 250, 14, 50, 15, "East Africa Meds"],
  ["Coartem 20/120", "Artemether-Lumefantrine", "CAT-03", "Novartis", "BN-3001", 3200, 150, 60, 380, "Global Health Dist."],
  ["Quinine 300mg", "Quinine sulphate", "CAT-03", "Cipla", "BN-3002", 1100, 22, 40, -10, "MedSupply Rwanda"],
  ["Fansidar", "Sulfadoxine-Pyrimethamine", "CAT-03", "Roche", "BN-3003", 950, 9, 35, 26, "Global Health Dist."],
  ["Artesun Inj", "Artesunate", "CAT-03", "Guilin", "BN-3004", 5400, 70, 25, 460, "Global Health Dist."],
  ["Vitamin C 1000mg", "Ascorbic acid", "CAT-04", "Bayer", "BN-4001", 400, 600, 120, 700, "Kigali Pharma Ltd"],
  ["Vitamin D3", "Cholecalciferol", "CAT-04", "Nature's Best", "BN-4002", 800, 45, 50, 250, "Nutri Supplies"],
  ["Ferrous Sulphate", "Iron", "CAT-04", "Cipla", "BN-4003", 350, 15, 40, -95, "Nutri Supplies"],
  ["Multivite Syrup", "Multivitamin", "CAT-04", "Abbott", "BN-4004", 2200, 130, 30, 340, "Nutri Supplies"],
  ["Zinc 20mg", "Zinc sulphate", "CAT-04", "Cipla", "BN-4005", 300, 8, 30, 18, "Nutri Supplies"],
  ["Betadine 100ml", "Povidone Iodine", "CAT-05", "Mundipharma", "BN-5001", 2600, 90, 25, 500, "East Africa Meds"],
  ["Hydrogen Peroxide", "H2O2 3%", "CAT-05", "LocalLab", "BN-5002", 900, 7, 20, -40, "East Africa Meds"],
  ["Surgical Spirit", "Ethanol 70%", "CAT-05", "LocalLab", "BN-5003", 1200, 160, 40, 620, "East Africa Meds"],
  ["Amlodip 5mg", "Amlodipine", "CAT-06", "Pfizer", "BN-6001", 1000, 210, 50, 430, "Kigali Pharma Ltd"],
  ["Losartan 50mg", "Losartan potassium", "CAT-06", "Merck", "BN-6002", 1400, 19, 45, 28, "MedSupply Rwanda"],
  ["Atenolol 50mg", "Atenolol", "CAT-06", "Cipla", "BN-6003", 850, 11, 40, -5, "MedSupply Rwanda"],
  ["Simvastatin 20mg", "Simvastatin", "CAT-06", "Teva", "BN-6004", 1600, 120, 35, 360, "Kigali Pharma Ltd"],
  ["Metformin 500mg", "Metformin HCl", "CAT-07", "Merck", "BN-7001", 750, 380, 80, 520, "Kigali Pharma Ltd"],
  ["Glibenclamide 5mg", "Glibenclamide", "CAT-07", "Sanofi", "BN-7002", 650, 16, 40, 12, "MedSupply Rwanda"],
  ["Insulin Mixtard", "Human insulin", "CAT-07", "Novo Nordisk", "BN-7003", 12000, 24, 30, -15, "Global Health Dist."],
  ["Ventolin Inhaler", "Salbutamol", "CAT-08", "GSK", "BN-8001", 6500, 6, 20, 29, "East Africa Meds"],
  ["Prednisolone 5mg", "Prednisolone", "CAT-08", "Cipla", "BN-8002", 500, 240, 60, 410, "East Africa Meds"],
  ["Cetirizine 10mg", "Cetirizine", "CAT-08", "Teva", "BN-8003", 400, 13, 45, -70, "MedSupply Rwanda"],
];

export const medicines = seeds.map((s, i) => ({
  id: `MED-${String(i + 1).padStart(3, "0")}`,
  name: s[0],
  genericName: s[1],
  categoryId: s[2],
  manufacturer: s[3],
  batchNumber: s[4],
  unitPrice: s[5],
  quantity: s[6],
  reorderLevel: s[7],
  expirationDate: iso(s[8]),
  supplier: s[9],
  description: `${s[0]} supplied by ${s[9]}. Store in a cool, dry place.`,
  createdAt: iso(-(i * 3 + 1)),
}));

const movementTypes = ["Stock In", "Stock Out", "Adjustment", "Return"];
const staffNames = ["J. Uwase", "C. Mugisha", "A. Keza", "P. Niyonzima"];
const reasons = ["Supplier delivery", "Dispensed to customer", "Stock count correction", "Customer return", "Damaged units"];

export const movements = Array.from({ length: 20 }, (_, i) => {
  const med = medicines[(i * 3) % medicines.length];
  const type = movementTypes[i % 4];
  const qty = 5 + ((i * 7) % 40);
  const previous = med.quantity;
  const signed = type === "Stock In" || type === "Return" ? qty : -qty;
  return {
    id: `MOV-${String(i + 1).padStart(3, "0")}`,
    medicineId: med.id,
    batchNumber: med.batchNumber,
    type,
    quantity: qty,
    previousStock: previous,
    newStock: Math.max(0, previous + signed),
    date: iso(-(i + 1)),
    user: staffNames[i % staffNames.length],
    reason: reasons[i % reasons.length],
  };
});

const customers = ["Walk-in Customer", "Aline M.", "Eric N.", "RSSB Insurance", "Jean B."];
const payments = ["Cash", "Mobile Money", "Insurance", "Card"];

export const sales = Array.from({ length: 20 }, (_, i) => {
  const med = medicines[(i * 5) % medicines.length];
  const qty = 1 + (i % 9);
  const offset = i < 3 ? 0 : -(i * 5);
  return {
    id: `SAL-${String(i + 1).padStart(3, "0")}`,
    date: iso(offset),
    medicineId: med.id,
    quantity: qty,
    unitPrice: med.unitPrice,
    total: qty * med.unitPrice,
    customer: customers[i % customers.length],
    staff: staffNames[i % staffNames.length],
    paymentMethod: payments[i % payments.length],
  };
});
