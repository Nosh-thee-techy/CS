// ─── Lima na Loop · Data Engine ──────────────────────────────────────────────────
// Actors: Tea Farmer · Cooperative / Factory · Loop Financial Infrastructure

export type Grade = 'A' | 'B' | 'C';
export type DeliveryStatus = 'recorded' | 'graded' | 'payment_pending' | 'paid';
export type PaymentStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'failed';
export type LoanStatus = 'applied' | 'scored' | 'approved' | 'disbursed' | 'repaying' | 'closed';
export type CreditTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface Cooperative {
  id: string;
  name: string;
  shortName: string;
  county: string;
  farmerCount: number;
  factoryCode: string;
  dailyCapacityKg: number;
}

export interface Delivery {
  id: string;
  farmerId: string;
  farmerName: string;
  cooperativeId: string;
  date: string;
  weightKg: number;
  grade: Grade;
  ratePerKg: number; // KES
  grossAmount: number;
  deductions: { label: string; amount: number }[];
  netAmount: number;
  status: DeliveryStatus;
  loopTransactionRef?: string;
  time?: string;
}

export interface PaymentBatch {
  id: string;
  cooperativeId: string;
  cooperativeName: string;
  description: string;
  period: string;
  totalAmount: number;
  farmerCount: number;
  status: PaymentStatus;
  createdDate: string;
  disbursedDate?: string;
  loopBatchRef?: string;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  county: string;
  ward: string;
  cooperativeId: string;
  memberNumber: string;
  cropType: string;
  farmSizeAcres: number;
  creditScore: number;
  creditTier: CreditTier;
  joinedDate: string;
  lastDeliveryDate: string;
  totalDeliveries: number;
  volumeKgLast90Days: number;
  totalEarnedYTD: number;
  hasChama: boolean;
  chamaName?: string;
  loopAccountStatus: 'active' | 'pending' | 'none';
  deliveryConsistency: number; // /25
  chamaScore: number;          // /25
  repaymentScore: number;      // /25
  riskScore: number;           // /25
}

export interface Loan {
  id: string;
  farmerId: string;
  farmerName: string;
  amount: number;
  purpose: string;
  status: LoanStatus;
  appliedDate: string;
  approvedDate?: string;
  disbursedDate?: string;
  dueDate?: string;
  repaidAmount: number;
  creditScoreAtApplication: number;
  loopRef?: string;
  interestRate: number;
}

// ─── Data Records ─────────────────────────────────────────────────────────────

export const cooperatives: Cooperative[] = [
  { id: 'C001', name: 'Kiambu Tea Growers SACCO', shortName: 'Kiambu SACCO', county: 'Kiambu', farmerCount: 1420, factoryCode: 'KTG-01', dailyCapacityKg: 45000 },
  { id: 'C002', name: 'Meru Highland Tea Factory', shortName: 'Meru Highland', county: 'Meru', farmerCount: 890, factoryCode: 'MHT-02', dailyCapacityKg: 32000 },
  { id: 'C003', name: 'Nandi Hills Tea Cooperative', shortName: 'Nandi Hills', county: 'Nandi', farmerCount: 675, factoryCode: 'NHT-03', dailyCapacityKg: 28000 },
  { id: 'C004', name: 'Kericho Farmers Cooperative', shortName: 'Kericho FC', county: 'Kericho', farmerCount: 1105, factoryCode: 'KFC-04', dailyCapacityKg: 50000 },
  { id: 'C005', name: 'Nyamira Tea Cooperative Union', shortName: 'Nyamira TCU', county: 'Nyamira', farmerCount: 760, factoryCode: 'NTC-05', dailyCapacityKg: 24000 },
];

export const farmers: Farmer[] = [
  {
    id: 'F-001', name: 'Wanjiku Kamau', phone: '0712 345 678',
    nationalId: '23456789', county: 'Kiambu', ward: 'North Ridge',
    cooperativeId: 'C001', memberNumber: 'KTG-001-0892',
    cropType: 'Purple & Green Tea', farmSizeAcres: 3.5, creditScore: 82, creditTier: 'gold',
    joinedDate: '2019-03-14', lastDeliveryDate: '2026-08-14',
    totalDeliveries: 186, volumeKgLast90Days: 1240, totalEarnedYTD: 142500,
    hasChama: true, chamaName: 'Wamama Wetu Savings',
    loopAccountStatus: 'active',
    deliveryConsistency: 22, chamaScore: 20, repaymentScore: 19, riskScore: 21,
  },
  {
    id: 'F-002', name: 'Grace Njeri Waweru', phone: '0756 789 012',
    nationalId: '34567890', county: 'Kiambu', ward: 'South Fields',
    cooperativeId: 'C001', memberNumber: 'KTG-001-0114',
    cropType: 'Green Tea (Camellia)', farmSizeAcres: 5.0, creditScore: 91, creditTier: 'platinum',
    joinedDate: '2017-07-22', lastDeliveryDate: '2026-08-13',
    totalDeliveries: 312, volumeKgLast90Days: 2100, totalEarnedYTD: 218000,
    hasChama: true, chamaName: 'Nguvu Women Group',
    loopAccountStatus: 'active',
    deliveryConsistency: 24, chamaScore: 23, repaymentScore: 24, riskScore: 20,
  },
  {
    id: 'F-003', name: 'James Mutua Mwangi', phone: '0723 456 789',
    nationalId: '45678901', county: 'Meru', ward: 'Upper Zone',
    cooperativeId: 'C002', memberNumber: 'MHT-002-0234',
    cropType: 'Highland Black Tea', farmSizeAcres: 2.0, creditScore: 67, creditTier: 'silver',
    joinedDate: '2021-01-10', lastDeliveryDate: '2026-08-11',
    totalDeliveries: 94, volumeKgLast90Days: 620, totalEarnedYTD: 68400,
    hasChama: true, chamaName: 'Pamoja Growth Fund',
    loopAccountStatus: 'active',
    deliveryConsistency: 17, chamaScore: 16, repaymentScore: 18, riskScore: 16,
  },
  {
    id: 'F-004', name: 'Achieng Otieno', phone: '0734 567 890',
    nationalId: '56789012', county: 'Nandi', ward: 'Kapsabet West',
    cooperativeId: 'C003', memberNumber: 'NHT-003-0567',
    cropType: 'Orthodox Green Tea', farmSizeAcres: 1.5, creditScore: 74, creditTier: 'gold',
    joinedDate: '2020-11-05', lastDeliveryDate: '2026-08-14',
    totalDeliveries: 221, volumeKgLast90Days: 890, totalEarnedYTD: 96800,
    hasChama: false,
    loopAccountStatus: 'active',
    deliveryConsistency: 20, chamaScore: 14, repaymentScore: 21, riskScore: 19,
  },
  {
    id: 'F-005', name: 'Kipchoge Ruto', phone: '0745 678 901',
    nationalId: '67890123', county: 'Kericho', ward: 'Litein',
    cooperativeId: 'C004', memberNumber: 'KFC-004-0789',
    cropType: 'CTC Black Tea', farmSizeAcres: 4.0, creditScore: 55, creditTier: 'silver',
    joinedDate: '2022-04-18', lastDeliveryDate: '2026-08-05',
    totalDeliveries: 61, volumeKgLast90Days: 380, totalEarnedYTD: 41200,
    hasChama: true, chamaName: 'Jua Kali Savers',
    loopAccountStatus: 'pending',
    deliveryConsistency: 12, chamaScore: 14, repaymentScore: 13, riskScore: 16,
  },
  {
    id: 'F-006', name: 'Margaret Atieno Ouma', phone: '0756 890 123',
    nationalId: '78901234', county: 'Nyamira', ward: 'Manga Central',
    cooperativeId: 'C005', memberNumber: 'NTC-005-0321',
    cropType: 'Purple Specialty Tea', farmSizeAcres: 2.5, creditScore: 88, creditTier: 'platinum',
    joinedDate: '2018-08-30', lastDeliveryDate: '2026-08-12',
    totalDeliveries: 248, volumeKgLast90Days: 1560, totalEarnedYTD: 168000,
    hasChama: true, chamaName: 'Bidii Farmers Circle',
    loopAccountStatus: 'active',
    deliveryConsistency: 23, chamaScore: 22, repaymentScore: 22, riskScore: 21,
  },
  {
    id: 'F-007', name: 'Peter Njoroge Kariuki', phone: '0767 901 234',
    nationalId: '89012345', county: 'Kiambu', ward: 'Githunguri',
    cooperativeId: 'C001', memberNumber: 'KTG-001-2041',
    cropType: 'Green Tea', farmSizeAcres: 1.8, creditScore: 43, creditTier: 'bronze',
    joinedDate: '2024-02-01', lastDeliveryDate: '2026-07-25',
    totalDeliveries: 28, volumeKgLast90Days: 190, totalEarnedYTD: 20400,
    hasChama: false,
    loopAccountStatus: 'none',
    deliveryConsistency: 10, chamaScore: 8, repaymentScore: 14, riskScore: 11,
  },
  {
    id: 'F-008', name: 'Eunice Adhiambo Ochieng', phone: '0778 012 345',
    nationalId: '90123456', county: 'Nandi', ward: 'Mosoriot',
    cooperativeId: 'C003', memberNumber: 'NHT-003-0102',
    cropType: 'Green Leaf Tea', farmSizeAcres: 3.0, creditScore: 79, creditTier: 'gold',
    joinedDate: '2020-06-15', lastDeliveryDate: '2026-08-14',
    totalDeliveries: 195, volumeKgLast90Days: 980, totalEarnedYTD: 106500,
    hasChama: true, chamaName: 'Maendeleo Sacco Group',
    loopAccountStatus: 'active',
    deliveryConsistency: 21, chamaScore: 19, repaymentScore: 20, riskScore: 19,
  },
];

export const deliveries: Delivery[] = [
  {
    id: 'DEL-20260814-001', farmerId: 'F-001', farmerName: 'Wanjiku Kamau',
    cooperativeId: 'C001', date: '2026-08-14', time: '08:45 AM', weightKg: 42, grade: 'A',
    ratePerKg: 30, grossAmount: 1260,
    deductions: [{ label: 'SACCO Levy', amount: 126 }, { label: 'Factory Charge', amount: 84 }],
    netAmount: 1050, status: 'payment_pending',
  },
  {
    id: 'DEL-20260813-001', farmerId: 'F-002', farmerName: 'Grace Njeri Waweru',
    cooperativeId: 'C001', date: '2026-08-13', time: '09:15 AM', weightKg: 68, grade: 'A',
    ratePerKg: 30, grossAmount: 2040,
    deductions: [{ label: 'SACCO Levy', amount: 204 }, { label: 'Input Loan', amount: 300 }],
    netAmount: 1536, status: 'paid', loopTransactionRef: 'LOOP-TXN-00451',
  },
  {
    id: 'DEL-20260812-001', farmerId: 'F-001', farmerName: 'Wanjiku Kamau',
    cooperativeId: 'C001', date: '2026-08-12', time: '10:30 AM', weightKg: 38, grade: 'B',
    ratePerKg: 26, grossAmount: 988,
    deductions: [{ label: 'SACCO Levy', amount: 99 }, { label: 'Factory Charge', amount: 66 }],
    netAmount: 823, status: 'paid', loopTransactionRef: 'LOOP-TXN-00440',
  },
  {
    id: 'DEL-20260811-001', farmerId: 'F-003', farmerName: 'James Mutua Mwangi',
    cooperativeId: 'C002', date: '2026-08-11', time: '07:50 AM', weightKg: 29, grade: 'B',
    ratePerKg: 26, grossAmount: 754,
    deductions: [{ label: 'SACCO Levy', amount: 75 }],
    netAmount: 679, status: 'payment_pending',
  },
  {
    id: 'DEL-20260814-002', farmerId: 'F-004', farmerName: 'Achieng Otieno',
    cooperativeId: 'C003', date: '2026-08-14', time: '08:10 AM', weightKg: 51, grade: 'A',
    ratePerKg: 30, grossAmount: 1530,
    deductions: [{ label: 'Factory Charge', amount: 153 }, { label: 'Input Advance', amount: 200 }],
    netAmount: 1177, status: 'graded',
  },
  {
    id: 'DEL-20260812-002', farmerId: 'F-006', farmerName: 'Margaret Atieno Ouma',
    cooperativeId: 'C005', date: '2026-08-12', time: '09:00 AM', weightKg: 74, grade: 'A',
    ratePerKg: 30, grossAmount: 2220,
    deductions: [{ label: 'SACCO Levy', amount: 222 }, { label: 'Factory Charge', amount: 148 }],
    netAmount: 1850, status: 'paid', loopTransactionRef: 'LOOP-TXN-00448',
  },
  {
    id: 'DEL-20260814-003', farmerId: 'F-008', farmerName: 'Eunice Adhiambo Ochieng',
    cooperativeId: 'C003', date: '2026-08-14', time: '11:20 AM', weightKg: 44, grade: 'A',
    ratePerKg: 30, grossAmount: 1320,
    deductions: [{ label: 'SACCO Levy', amount: 132 }, { label: 'Factory Charge', amount: 88 }],
    netAmount: 1100, status: 'recorded',
  },
];

export const paymentBatches: PaymentBatch[] = [
  { id: 'BATCH-2026-031', cooperativeId: 'C001', cooperativeName: 'Kiambu Tea Growers SACCO', description: 'July 2026 Tea Settlement — Batch 3', period: 'July 2026 · Batch 3', totalAmount: 3420000, farmerCount: 412, status: 'paid', createdDate: '2026-08-01', disbursedDate: '2026-08-03', loopBatchRef: 'LOOP-BATCH-0031' },
  { id: 'BATCH-2026-032', cooperativeId: 'C002', cooperativeName: 'Meru Highland Tea Factory', description: 'Aug 2026 First Advance', period: 'August 2026 · Advance', totalAmount: 1850000, farmerCount: 287, status: 'processing', createdDate: '2026-08-12', loopBatchRef: 'LOOP-BATCH-0032' },
  { id: 'BATCH-2026-033', cooperativeId: 'C003', cooperativeName: 'Nandi Hills Tea Cooperative', description: 'Aug W32 Weekly Payment', period: 'August 2026 · W32', totalAmount: 640000, farmerCount: 198, status: 'approved', createdDate: '2026-08-13' },
  { id: 'BATCH-2026-034', cooperativeId: 'C004', cooperativeName: 'Kericho Farmers Cooperative', description: 'July 2026 Final Settlement', period: 'July 2026 · Final', totalAmount: 2100000, farmerCount: 334, status: 'pending', createdDate: '2026-08-13' },
  { id: 'BATCH-2026-035', cooperativeId: 'C005', cooperativeName: 'Nyamira Tea Cooperative Union', description: 'Aug 2026 Monthly Advance', period: 'August 2026 · Advance', totalAmount: 980000, farmerCount: 156, status: 'pending', createdDate: '2026-08-14' },
];

export const loans: Loan[] = [
  { id: 'LN-2026-001', farmerId: 'F-001', farmerName: 'Wanjiku Kamau', amount: 25000, purpose: 'Fertiliser & inputs — long rains', status: 'repaying', appliedDate: '2026-06-01', approvedDate: '2026-06-03', disbursedDate: '2026-06-04', dueDate: '2026-09-04', repaidAmount: 12000, creditScoreAtApplication: 80, loopRef: 'LOOP-TXN-00310', interestRate: 12 },
  { id: 'LN-2026-002', farmerId: 'F-002', farmerName: 'Grace Njeri Waweru', amount: 60000, purpose: 'Farm labour — peak harvest season', status: 'disbursed', appliedDate: '2026-07-20', approvedDate: '2026-07-22', disbursedDate: '2026-07-24', dueDate: '2026-10-24', repaidAmount: 0, creditScoreAtApplication: 91, loopRef: 'LOOP-TXN-00401', interestRate: 10 },
  { id: 'LN-2026-003', farmerId: 'F-003', farmerName: 'James Mutua Mwangi', amount: 18000, purpose: 'Tractor hire — clearing', status: 'approved', appliedDate: '2026-08-01', approvedDate: '2026-08-05', repaidAmount: 0, creditScoreAtApplication: 67, interestRate: 14 },
  { id: 'LN-2026-004', farmerId: 'F-006', farmerName: 'Margaret Atieno Ouma', amount: 45000, purpose: 'Irrigation pipe installation', status: 'scored', appliedDate: '2026-08-10', repaidAmount: 0, creditScoreAtApplication: 88, interestRate: 11 },
  { id: 'LN-2026-005', farmerId: 'F-004', farmerName: 'Achieng Otieno', amount: 12000, purpose: 'Transport & logistics — peak season', status: 'repaying', appliedDate: '2026-05-10', approvedDate: '2026-05-12', disbursedDate: '2026-05-14', dueDate: '2026-08-14', repaidAmount: 9000, creditScoreAtApplication: 72, loopRef: 'LOOP-TXN-00289', interestRate: 13 },
  { id: 'LN-2026-006', farmerId: 'F-008', farmerName: 'Eunice Adhiambo Ochieng', amount: 20000, purpose: 'Pruning & maintenance inputs', status: 'applied', appliedDate: '2026-08-14', repaidAmount: 0, creditScoreAtApplication: 79, interestRate: 13 },
];

export const productionComparison = [
  { month: 'Jan', currentYear: 1200, lastYear: 950 },
  { month: 'Feb', currentYear: 1450, lastYear: 1100 },
  { month: 'Mar', currentYear: 1800, lastYear: 1300 },
  { month: 'Apr', currentYear: 2100, lastYear: 1550 },
  { month: 'May', currentYear: 2600, lastYear: 1900 },
  { month: 'Jun', currentYear: 4200, lastYear: 2800 },
  { month: 'Jul', currentYear: 3900, lastYear: 3100 },
  { month: 'Aug', currentYear: 4100, lastYear: 2900 },
  { month: 'Sep', currentYear: 3400, lastYear: 2600 },
  { month: 'Oct', currentYear: 2900, lastYear: 2200 },
  { month: 'Nov', currentYear: 3100, lastYear: 2400 },
  { month: 'Dec', currentYear: 3800, lastYear: 3000 },
];

export const growthActivity = [
  { phase: 'Seed Phase (W1)', cm: 2.1, status: 'Optimal' },
  { phase: 'Vegetation (W2)', cm: 4.8, status: 'Strong' },
  { phase: 'Final Pluck (W3)', cm: 7.8, status: 'Peak Harvest' },
];

export const kpis = {
  totalFarmers: 4520,
  registeredCooperatives: 5,
  disbursedThisMonth: 8940000,
  pendingBatches: 2,
  activeLoans: 14,
  avgCreditScore: 71,
  farmersScored: 3890,
  pendingApprovals: 4,
};

export const disbursementTrend = [
  { month: 'Mar', disbursed: 7200000, farmers: 890 },
  { month: 'Apr', disbursed: 8100000, farmers: 1020 },
  { month: 'May', disbursed: 7600000, farmers: 940 },
  { month: 'Jun', disbursed: 9200000, farmers: 1140 },
  { month: 'Jul', disbursed: 10100000, farmers: 1280 },
  { month: 'Aug', disbursed: 8940000, farmers: 1190 },
];

export const scoreDistribution = [
  { range: '30-49 (Bronze)', count: 420, color: '#E09870' },
  { range: '50-69 (Silver)', count: 1240, color: '#A0B4A8' },
  { range: '70-84 (Gold)', count: 1890, color: '#C5F82A' },
  { range: '85-100 (Platinum)', count: 970, color: '#134E3B' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getFarmerById = (id: string) => farmers.find(f => f.id === id);
export const getCoopById = (id: string) => cooperatives.find(c => c.id === id);
export const getDeliveriesByFarmer = (id: string) => deliveries.filter(d => d.farmerId === id);
export const getLoansByFarmer = (id: string) => loans.filter(l => l.farmerId === id);

export function formatKES(n: number): string {
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n.toLocaleString()}`;
}

export function tierColor(t: CreditTier): string {
  return t === 'platinum' ? '#134E3B' : t === 'gold' ? '#92D016' : t === 'silver' ? '#7A9184' : '#D97757';
}

export function riskColor(zone: string): string {
  return zone === 'low' ? '#22C55E' : zone === 'moderate' ? '#EAB308' : zone === 'high' ? '#F97316' : '#EF4444';
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export const gradeRates: Record<Grade, number> = { A: 30, B: 26, C: 21 };
