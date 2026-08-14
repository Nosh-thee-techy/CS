/**
 * Shared in-memory platform data used when Firebase is not configured.
 * Lima na Loop and My Readiness both read this store so scores, loans,
 * deliveries, and deductions stay in sync.
 */

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function tierFromScore(score) {
  if (score >= 85) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
}

function coreScore(display) {
  return Math.round(Math.min(850, Math.max(300, 300 + Number(display) * 5.5)));
}

const cooperatives = [
  { id: 'C001', name: 'Kiambu Tea Growers SACCO', shortName: 'Kiambu SACCO', county: 'Kiambu', farmerCount: 1420, factoryCode: 'KTG-01', dailyCapacityKg: 45000 },
  { id: 'C002', name: 'Meru Highland Tea Factory', shortName: 'Meru Highland', county: 'Meru', farmerCount: 890, factoryCode: 'MHT-02', dailyCapacityKg: 32000 },
  { id: 'C003', name: 'Nandi Hills Tea Cooperative', shortName: 'Nandi Hills', county: 'Nandi', farmerCount: 675, factoryCode: 'NHT-03', dailyCapacityKg: 28000 },
  { id: 'C004', name: 'Kericho Farmers Cooperative', shortName: 'Kericho FC', county: 'Kericho', farmerCount: 1105, factoryCode: 'KFC-04', dailyCapacityKg: 50000 },
  { id: 'C005', name: 'Nyamira Tea Cooperative Union', shortName: 'Nyamira TCU', county: 'Nyamira', farmerCount: 760, factoryCode: 'NTC-05', dailyCapacityKg: 24000 },
];

const farmers = [
  {
    id: 'F-001', name: 'Mary Wanjiku', phone: '0700434567', nationalId: '43456789',
    county: 'Kiambu', ward: 'North Ridge', cooperativeId: 'C001', memberNumber: 'KTDA-43456789',
    cropType: 'Purple & Green Tea', farmSizeAcres: 3.5, creditScore: 68,
    joinedDate: '2019-03-14', lastDeliveryDate: '2026-08-14',
    totalDeliveries: 186, volumeKgLast90Days: 1240, totalEarnedYTD: 142500,
    hasChama: true, chamaName: 'Wamama Wetu Savings', loopAccountStatus: 'active',
    deliveryConsistency: 22, chamaScore: 16, repaymentScore: 15, riskScore: 15, zoneId: 'zone_rift',
  },
  {
    id: 'F-002', name: 'Grace Njeri Waweru', phone: '0756789012', nationalId: '34567890',
    county: 'Kiambu', ward: 'South Fields', cooperativeId: 'C001', memberNumber: 'KTG-001-0114',
    cropType: 'Green Tea (Camellia)', farmSizeAcres: 5.0, creditScore: 91,
    joinedDate: '2017-07-22', lastDeliveryDate: '2026-08-13',
    totalDeliveries: 312, volumeKgLast90Days: 2100, totalEarnedYTD: 218000,
    hasChama: true, chamaName: 'Nguvu Women Group', loopAccountStatus: 'active',
    deliveryConsistency: 24, chamaScore: 23, repaymentScore: 24, riskScore: 20, zoneId: 'zone_central',
  },
  {
    id: 'F-003', name: 'James Mutua Mwangi', phone: '0723456789', nationalId: '45678901',
    county: 'Meru', ward: 'Upper Zone', cooperativeId: 'C002', memberNumber: 'MHT-002-0234',
    cropType: 'Highland Black Tea', farmSizeAcres: 2.0, creditScore: 67,
    joinedDate: '2021-01-10', lastDeliveryDate: '2026-08-11',
    totalDeliveries: 94, volumeKgLast90Days: 620, totalEarnedYTD: 68400,
    hasChama: true, chamaName: 'Pamoja Growth Fund', loopAccountStatus: 'active',
    deliveryConsistency: 17, chamaScore: 16, repaymentScore: 18, riskScore: 16, zoneId: 'zone_central',
  },
  {
    id: 'F-004', name: 'Achieng Otieno', phone: '0734567890', nationalId: '56789012',
    county: 'Nandi', ward: 'Kapsabet West', cooperativeId: 'C003', memberNumber: 'NHT-003-0567',
    cropType: 'Orthodox Green Tea', farmSizeAcres: 1.5, creditScore: 74,
    joinedDate: '2020-11-05', lastDeliveryDate: '2026-08-14',
    totalDeliveries: 221, volumeKgLast90Days: 890, totalEarnedYTD: 96800,
    hasChama: false, loopAccountStatus: 'active',
    deliveryConsistency: 20, chamaScore: 14, repaymentScore: 21, riskScore: 19, zoneId: 'zone_rift',
  },
  {
    id: 'F-005', name: 'Kipchoge Ruto', phone: '0745678901', nationalId: '67890123',
    county: 'Kericho', ward: 'Litein', cooperativeId: 'C004', memberNumber: 'KFC-004-0789',
    cropType: 'CTC Black Tea', farmSizeAcres: 4.0, creditScore: 55,
    joinedDate: '2022-04-18', lastDeliveryDate: '2026-08-05',
    totalDeliveries: 61, volumeKgLast90Days: 380, totalEarnedYTD: 41200,
    hasChama: true, chamaName: 'Jua Kali Savers', loopAccountStatus: 'pending',
    deliveryConsistency: 12, chamaScore: 14, repaymentScore: 13, riskScore: 16, zoneId: 'zone_rift',
  },
  {
    id: 'F-006', name: 'Margaret Atieno Ouma', phone: '0756890123', nationalId: '78901234',
    county: 'Nyamira', ward: 'Manga Central', cooperativeId: 'C005', memberNumber: 'NTC-005-0321',
    cropType: 'Purple Specialty Tea', farmSizeAcres: 2.5, creditScore: 88,
    joinedDate: '2018-08-30', lastDeliveryDate: '2026-08-12',
    totalDeliveries: 248, volumeKgLast90Days: 1560, totalEarnedYTD: 168000,
    hasChama: true, chamaName: 'Bidii Farmers Circle', loopAccountStatus: 'active',
    deliveryConsistency: 23, chamaScore: 22, repaymentScore: 22, riskScore: 21, zoneId: 'zone_western',
  },
  {
    id: 'F-007', name: 'Peter Njoroge Kariuki', phone: '0767901234', nationalId: '89012345',
    county: 'Kiambu', ward: 'Githunguri', cooperativeId: 'C001', memberNumber: 'KTG-001-2041',
    cropType: 'Green Tea', farmSizeAcres: 1.8, creditScore: 43,
    joinedDate: '2024-02-01', lastDeliveryDate: '2026-07-25',
    totalDeliveries: 28, volumeKgLast90Days: 190, totalEarnedYTD: 20400,
    hasChama: false, loopAccountStatus: 'none',
    deliveryConsistency: 10, chamaScore: 8, repaymentScore: 14, riskScore: 11, zoneId: 'zone_central',
  },
  {
    id: 'F-008', name: 'Eunice Adhiambo Ochieng', phone: '0778012345', nationalId: '90123456',
    county: 'Nandi', ward: 'Mosoriot', cooperativeId: 'C003', memberNumber: 'NHT-003-0102',
    cropType: 'Green Leaf Tea', farmSizeAcres: 3.0, creditScore: 79,
    joinedDate: '2020-06-15', lastDeliveryDate: '2026-08-14',
    totalDeliveries: 195, volumeKgLast90Days: 980, totalEarnedYTD: 106500,
    hasChama: true, chamaName: 'Maendeleo Sacco Group', loopAccountStatus: 'active',
    deliveryConsistency: 21, chamaScore: 19, repaymentScore: 20, riskScore: 19, zoneId: 'zone_rift',
  },
  {
    id: 'F-009', name: 'Samuel Kipchoge', phone: '0712345678', nationalId: '22019834',
    county: 'Kericho', ward: 'Litein', cooperativeId: 'C004', memberNumber: 'KTDA-22019834',
    cropType: 'CTC Black Tea', farmSizeAcres: 3.2, creditScore: 82,
    joinedDate: '2018-01-20', lastDeliveryDate: '2026-08-13',
    totalDeliveries: 204, volumeKgLast90Days: 1480, totalEarnedYTD: 156000,
    hasChama: true, chamaName: 'Kericho Chama', loopAccountStatus: 'active',
    deliveryConsistency: 21, chamaScore: 20, repaymentScore: 22, riskScore: 19, zoneId: 'zone_central',
  },
  {
    id: 'F-010', name: 'Amina Hassan', phone: '0711881102', nationalId: '12345678',
    county: 'Kilifi', ward: 'Mtwapa', cooperativeId: 'C003', memberNumber: 'KTDA-88110221',
    cropType: 'Green Leaf Tea', farmSizeAcres: 1.2, creditScore: 41,
    joinedDate: '2024-06-01', lastDeliveryDate: '2026-07-20',
    totalDeliveries: 18, volumeKgLast90Days: 140, totalEarnedYTD: 12600,
    hasChama: false, loopAccountStatus: 'pending',
    deliveryConsistency: 9, chamaScore: 7, repaymentScore: 12, riskScore: 13, zoneId: 'zone_coast',
  },
];

farmers.forEach((farmer) => {
  farmer.creditTier = tierFromScore(farmer.creditScore);
});

const deliveries = [
  { id: 'DEL-20260814-001', farmerId: 'F-001', farmerName: 'Mary Wanjiku', cooperativeId: 'C001', date: '2026-08-14', time: '08:45 AM', weightKg: 42, grade: 'A', ratePerKg: 30, grossAmount: 1260, deductions: [{ label: 'SACCO Levy', amount: 126 }, { label: 'Loan recovery', amount: 800 }], netAmount: 334, status: 'paid', loopTransactionRef: 'LOOP-TXN-00452' },
  { id: 'DEL-20260812-001', farmerId: 'F-001', farmerName: 'Mary Wanjiku', cooperativeId: 'C001', date: '2026-08-12', time: '10:30 AM', weightKg: 38, grade: 'B', ratePerKg: 26, grossAmount: 988, deductions: [{ label: 'SACCO Levy', amount: 99 }, { label: 'Factory Charge', amount: 66 }], netAmount: 823, status: 'paid', loopTransactionRef: 'LOOP-TXN-00440' },
  { id: 'DEL-20260813-001', farmerId: 'F-002', farmerName: 'Grace Njeri Waweru', cooperativeId: 'C001', date: '2026-08-13', time: '09:15 AM', weightKg: 68, grade: 'A', ratePerKg: 30, grossAmount: 2040, deductions: [{ label: 'SACCO Levy', amount: 204 }, { label: 'Input Loan', amount: 300 }], netAmount: 1536, status: 'paid', loopTransactionRef: 'LOOP-TXN-00451' },
  { id: 'DEL-20260811-001', farmerId: 'F-003', farmerName: 'James Mutua Mwangi', cooperativeId: 'C002', date: '2026-08-11', time: '07:50 AM', weightKg: 29, grade: 'B', ratePerKg: 26, grossAmount: 754, deductions: [{ label: 'SACCO Levy', amount: 75 }], netAmount: 679, status: 'payment_pending' },
  { id: 'DEL-20260814-002', farmerId: 'F-004', farmerName: 'Achieng Otieno', cooperativeId: 'C003', date: '2026-08-14', time: '08:10 AM', weightKg: 51, grade: 'A', ratePerKg: 30, grossAmount: 1530, deductions: [{ label: 'Factory Charge', amount: 153 }, { label: 'Input Advance', amount: 200 }], netAmount: 1177, status: 'graded' },
  { id: 'DEL-20260812-002', farmerId: 'F-006', farmerName: 'Margaret Atieno Ouma', cooperativeId: 'C005', date: '2026-08-12', time: '09:00 AM', weightKg: 74, grade: 'A', ratePerKg: 30, grossAmount: 2220, deductions: [{ label: 'SACCO Levy', amount: 222 }, { label: 'Factory Charge', amount: 148 }], netAmount: 1850, status: 'paid', loopTransactionRef: 'LOOP-TXN-00448' },
  { id: 'DEL-20260814-003', farmerId: 'F-008', farmerName: 'Eunice Adhiambo Ochieng', cooperativeId: 'C003', date: '2026-08-14', time: '11:20 AM', weightKg: 44, grade: 'A', ratePerKg: 30, grossAmount: 1320, deductions: [{ label: 'SACCO Levy', amount: 132 }, { label: 'Factory Charge', amount: 88 }], netAmount: 1100, status: 'recorded' },
  { id: 'DEL-20260813-009', farmerId: 'F-009', farmerName: 'Samuel Kipchoge', cooperativeId: 'C004', date: '2026-08-13', time: '08:20 AM', weightKg: 55, grade: 'A', ratePerKg: 30, grossAmount: 1650, deductions: [{ label: 'Loan recovery', amount: 1500 }], netAmount: 150, status: 'paid', loopTransactionRef: 'LOOP-TXN-00460' },
  { id: 'DEL-20260720-010', farmerId: 'F-010', farmerName: 'Amina Hassan', cooperativeId: 'C003', date: '2026-07-20', time: '09:40 AM', weightKg: 22, grade: 'C', ratePerKg: 21, grossAmount: 462, deductions: [], netAmount: 462, status: 'payment_pending' },
];

const paymentBatches = [
  { id: 'BATCH-2026-031', cooperativeId: 'C001', cooperativeName: 'Kiambu Tea Growers SACCO', description: 'July 2026 Tea Settlement — Batch 3', period: 'July 2026 · Batch 3', totalAmount: 3420000, farmerCount: 412, status: 'paid', createdDate: '2026-08-01', disbursedDate: '2026-08-03', loopBatchRef: 'LOOP-BATCH-0031' },
  { id: 'BATCH-2026-032', cooperativeId: 'C002', cooperativeName: 'Meru Highland Tea Factory', description: 'Aug 2026 First Advance', period: 'August 2026 · Advance', totalAmount: 1850000, farmerCount: 287, status: 'processing', createdDate: '2026-08-12', loopBatchRef: 'LOOP-BATCH-0032' },
  { id: 'BATCH-2026-033', cooperativeId: 'C003', cooperativeName: 'Nandi Hills Tea Cooperative', description: 'Aug W32 Weekly Payment', period: 'August 2026 · W32', totalAmount: 640000, farmerCount: 198, status: 'approved', createdDate: '2026-08-13' },
  { id: 'BATCH-2026-034', cooperativeId: 'C004', cooperativeName: 'Kericho Farmers Cooperative', description: 'July 2026 Final Settlement', period: 'July 2026 · Final', totalAmount: 2100000, farmerCount: 334, status: 'pending', createdDate: '2026-08-13' },
  { id: 'BATCH-2026-035', cooperativeId: 'C005', cooperativeName: 'Nyamira Tea Cooperative Union', description: 'Aug 2026 Monthly Advance', period: 'August 2026 · Advance', totalAmount: 980000, farmerCount: 156, status: 'pending', createdDate: '2026-08-14' },
];

const loans = [
  { loanId: 'LN-2026-001', farmerId: 'F-001', farmerName: 'Mary Wanjiku', cooperativeId: 'C001', requestedAmount: 8000, approvedAmount: 8000, outstandingBalance: 7200, purpose: 'input_purchase', status: 'DISBURSED', createdAt: '2026-06-01T00:00:00.000Z', disbursedAt: '2026-06-04T00:00:00.000Z', creditScoreAtRequest: 674, loopTransactionRef: 'LOOP-TXN-00310' },
  { loanId: 'LN-2026-009', farmerId: 'F-009', farmerName: 'Samuel Kipchoge', cooperativeId: 'C004', requestedAmount: 20000, approvedAmount: 20000, outstandingBalance: 18500, purpose: 'input_purchase', status: 'PENDING', createdAt: '2026-08-10T00:00:00.000Z', creditScoreAtRequest: 751 },
  { loanId: 'LN-2026-002', farmerId: 'F-002', farmerName: 'Grace Njeri Waweru', cooperativeId: 'C001', requestedAmount: 60000, approvedAmount: 60000, outstandingBalance: 60000, purpose: 'farm_equipment', status: 'DISBURSED', createdAt: '2026-07-20T00:00:00.000Z', disbursedAt: '2026-07-24T00:00:00.000Z', creditScoreAtRequest: 800, loopTransactionRef: 'LOOP-TXN-00401' },
  { loanId: 'LN-2026-003', farmerId: 'F-003', farmerName: 'James Mutua Mwangi', cooperativeId: 'C002', requestedAmount: 18000, approvedAmount: 18000, outstandingBalance: 18000, purpose: 'other', status: 'APPROVED', createdAt: '2026-08-01T00:00:00.000Z', creditScoreAtRequest: 668 },
  { loanId: 'LN-2026-006', farmerId: 'F-008', farmerName: 'Eunice Adhiambo Ochieng', cooperativeId: 'C003', requestedAmount: 20000, approvedAmount: 0, outstandingBalance: 0, purpose: 'input_purchase', status: 'PENDING', createdAt: '2026-08-14T00:00:00.000Z', creditScoreAtRequest: 734 },
];

const payouts = [
  { payoutId: 'PAY-001', farmerId: 'F-001', cooperativeId: 'C001', grossProduceAmount: 5000, loanDeductionAmount: 800, netPayoutAmount: 4200, status: 'COMPLETED', createdAt: '2026-08-14T00:00:00.000Z' },
  { payoutId: 'PAY-009', farmerId: 'F-009', cooperativeId: 'C004', grossProduceAmount: 8500, loanDeductionAmount: 1500, netPayoutAmount: 7000, status: 'COMPLETED', createdAt: '2026-08-13T00:00:00.000Z' },
  { payoutId: 'PAY-010', farmerId: 'F-010', cooperativeId: 'C003', grossProduceAmount: 800, loanDeductionAmount: 0, netPayoutAmount: 800, status: 'FAILED', createdAt: '2026-07-20T00:00:00.000Z' },
];

export function toApiFarmer(farmer) {
  return {
    farmerId: farmer.id,
    fullName: farmer.name,
    nationalId: farmer.nationalId,
    phoneNumber: farmer.phone,
    cooperativeId: farmer.cooperativeId,
    memberNumber: farmer.memberNumber,
    zoneId: farmer.zoneId || 'zone_rift',
    status: farmer.status || 'ACTIVE',
    mpesaVerified: farmer.loopAccountStatus === 'active',
    createdAt: farmer.joinedDate,
    updatedAt: farmer.lastDeliveryDate || farmer.joinedDate,
  };
}

export function registerFarmer({ fullName, nationalId, phoneNumber, cooperativeId }) {
  const existing = farmers.find((row) => String(row.nationalId) === String(nationalId));
  if (existing) {
    const err = new Error('A farmer with this National ID is already registered.');
    err.statusCode = 409;
    throw err;
  }
  const id = `F-${Date.now().toString().slice(-6)}`;
  const today = new Date().toISOString().slice(0, 10);
  const farmer = {
    id,
    name: fullName,
    phone: phoneNumber,
    nationalId,
    county: cooperatives.find((row) => row.id === cooperativeId)?.county || 'Kiambu',
    ward: 'Branch desk',
    cooperativeId,
    memberNumber: `WALK-${id.slice(-4)}`,
    cropType: 'Green Tea',
    farmSizeAcres: 1,
    creditScore: 58,
    creditTier: 'silver',
    joinedDate: today,
    lastDeliveryDate: today,
    totalDeliveries: 0,
    volumeKgLast90Days: 0,
    totalEarnedYTD: 0,
    hasChama: false,
    loopAccountStatus: 'pending',
    deliveryConsistency: 10,
    chamaScore: 8,
    repaymentScore: 12,
    riskScore: 14,
    zoneId: 'zone_central',
    status: 'ACTIVE',
  };
  farmers.unshift(farmer);
  return toApiFarmer(farmer);
}

export function updateFarmer(farmerId, updates = {}) {
  const farmer = farmers.find((row) => row.id === farmerId);
  if (!farmer) return null;
  if (updates.fullName !== undefined) farmer.name = updates.fullName;
  if (updates.phoneNumber !== undefined) farmer.phone = updates.phoneNumber;
  if (updates.status !== undefined) farmer.status = updates.status;
  if (updates.mpesaVerified !== undefined) {
    farmer.loopAccountStatus = updates.mpesaVerified ? 'active' : 'pending';
  }
  farmer.lastDeliveryDate = new Date().toISOString().slice(0, 10);
  return toApiFarmer(farmer);
}

export function deactivateFarmer(farmerId) {
  return updateFarmer(farmerId, { status: 'INACTIVE' });
}

export function findFarmerByLookup(raw) {
  const lookup = String(raw || '').trim();
  if (!lookup) return null;
  const upper = lookup.toUpperCase();
  const phone = digits(lookup);
  const found = farmers.find((farmer) => {
    if (farmer.id === lookup) return true;
    if (String(farmer.memberNumber).toUpperCase() === upper) return true;
    if (String(farmer.nationalId).toUpperCase() === upper) return true;
    const farmerPhone = digits(farmer.phone);
    if (phone && (farmerPhone === phone || farmerPhone.endsWith(phone) || phone.endsWith(farmerPhone.slice(-9)))) return true;
    return false;
  });
  return found ? toApiFarmer(found) : null;
}

export function getFarmer(farmerId) {
  const farmer = farmers.find((row) => row.id === farmerId);
  return farmer ? toApiFarmer(farmer) : null;
}

export function getUiFarmer(farmerId) {
  return farmers.find((row) => row.id === farmerId) || null;
}

export function listFarmers(cooperativeId) {
  const rows = cooperativeId ? farmers.filter((row) => row.cooperativeId === cooperativeId) : farmers;
  return rows.map(toApiFarmer);
}

export function getCreditProfile(farmerId) {
  const farmer = farmers.find((row) => row.id === farmerId);
  if (!farmer) return null;
  const display = farmer.creditScore;
  const score = coreScore(display);
  const riskTier = display >= 75 ? 'LOW' : display >= 50 ? 'MEDIUM' : 'HIGH';
  const maxLoanLimit = display >= 75 ? 20000 : display >= 50 ? 8000 : 0;
  return {
    farmerId,
    score,
    displayScore: display,
    riskTier,
    maxLoanLimit,
    totalProduceKgHistorical: farmer.volumeKgLast90Days,
    deliveryConsistencyScore: Math.min(100, farmer.deliveryConsistency * 4),
    aiExplanation: `Credit Score: ${score}/850 (Risk: ${riskTier}). Display score ${display}/100 from deliveries, chama, and repayment.`,
    lastCalculatedAt: new Date().toISOString(),
  };
}

export function listLoans(farmerId) {
  return farmerId ? loans.filter((row) => row.farmerId === farmerId) : [...loans];
}

export function addLoan(loan) {
  loans.unshift(loan);
  return loan;
}

export function getLoan(loanId) {
  return loans.find((row) => row.loanId === loanId) || null;
}

export function listLoansByCooperative(cooperativeId) {
  return loans.filter((row) => row.cooperativeId === cooperativeId);
}

export function processLoanDecision(loanId, action, approvedAmount = null) {
  const loan = getLoan(loanId);
  if (!loan) return null;
  if (!['PENDING', 'APPROVED'].includes(loan.status) && action === 'APPROVE') {
    const err = new Error(`Loan is already ${loan.status}. Only PENDING or APPROVED loans can be processed.`);
    err.statusCode = 400;
    throw err;
  }
  if (loan.status !== 'PENDING' && action === 'REJECT') {
    const err = new Error(`Loan is already ${loan.status}. Only PENDING loans can be processed.`);
    err.statusCode = 400;
    throw err;
  }
  if (action === 'REJECT') {
    loan.status = 'REJECTED';
    return loan;
  }
  const finalAmount = Number(approvedAmount || loan.requestedAmount);
  loan.status = 'DISBURSED';
  loan.approvedAmount = finalAmount;
  loan.outstandingBalance = finalAmount;
  loan.disbursedAt = new Date().toISOString();
  loan.loopTransactionRef = loan.loopTransactionRef || `LOOP-SIM-${Date.now()}`;
  return loan;
}

export function reduceLoanBalance(loanId, amount) {
  const loan = getLoan(loanId);
  if (!loan) return null;
  const newBalance = parseFloat(Math.max(0, Number(loan.outstandingBalance || 0) - Number(amount)).toFixed(2));
  loan.outstandingBalance = newBalance;
  if (newBalance === 0) loan.status = 'REPAID';
  return loan;
}

export function recordRepaymentPrompt(loanId, promptRecord) {
  const loan = getLoan(loanId);
  if (!loan) return null;
  Object.assign(loan, promptRecord);
  return loan;
}

export function listProduce(farmerId) {
  return deliveries
    .filter((row) => !farmerId || row.farmerId === farmerId)
    .map((row) => ({
      recordId: row.id,
      farmerId: row.farmerId,
      cooperativeId: row.cooperativeId,
      cropType: 'tea',
      quantityKg: row.weightKg,
      ratePerKg: row.ratePerKg,
      totalAmount: row.grossAmount,
      produceDate: row.date,
      payoutStatus: row.status === 'paid' ? 'SETTLED' : 'UNPAID',
      payoutId: row.loopTransactionRef || null,
      createdAt: row.date,
    }));
}

export function recordProduce({ farmerId, cooperativeId, cropType, quantityKg, ratePerKg, produceDate }) {
  const farmer = farmers.find((row) => row.id === farmerId);
  const rate = Number(ratePerKg);
  const qty = Number(quantityKg);
  const gross = parseFloat((qty * rate).toFixed(2));
  const levy = Math.round(gross * 0.1);
  const factory = Math.round(gross * 0.067);
  const net = gross - levy - factory;
  const id = `DEL-${Date.now()}`;
  const delivery = {
    id,
    farmerId,
    farmerName: farmer?.name || farmerId,
    cooperativeId,
    date: (produceDate || new Date().toISOString()).slice(0, 10),
    time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
    weightKg: qty,
    grade: rate >= 30 ? 'A' : rate >= 26 ? 'B' : 'C',
    ratePerKg: rate,
    grossAmount: gross,
    deductions: [
      { label: 'SACCO Levy', amount: levy },
      { label: 'Factory Charge', amount: factory },
    ],
    netAmount: net,
    status: 'recorded',
  };
  deliveries.unshift(delivery);
  if (farmer) {
    farmer.totalDeliveries += 1;
    farmer.lastDeliveryDate = delivery.date;
    farmer.volumeKgLast90Days += qty;
  }
  return {
    recordId: id,
    farmerId,
    cooperativeId,
    cropType: cropType || 'tea',
    quantityKg: qty,
    ratePerKg: rate,
    totalAmount: gross,
    produceDate: delivery.date,
    payoutStatus: 'UNPAID',
    createdAt: new Date().toISOString(),
  };
}

export function listPayouts(farmerId) {
  return farmerId ? payouts.filter((row) => row.farmerId === farmerId) : [...payouts];
}

export function getPayout(payoutId) {
  return payouts.find((row) => row.payoutId === payoutId) || null;
}

export function addPayout(payout) {
  payouts.unshift(payout);
  return payout;
}

export function markProduceSettled(recordIds, payoutId) {
  const ids = new Set(recordIds);
  deliveries.forEach((row) => {
    if (ids.has(row.id)) {
      row.status = 'paid';
      row.loopTransactionRef = payoutId;
    }
  });
}

export function updatePayoutByLoopRef(transactionRef, status) {
  const payout = payouts.find((row) => row.loopTransactionRef === transactionRef);
  if (!payout) return null;
  payout.status = status;
  return payout;
}

export function findLoanByPromptRef(txnReference) {
  return loans.find((row) => row.repaymentPromptTxnReference === txnReference) || null;
}

export function snapshot() {
  return {
    source: 'demo-store',
    sessionFarmerId: 'F-001',
    cooperatives,
    farmers: farmers.map((farmer) => ({ ...farmer })),
    deliveries: [...deliveries],
    paymentBatches: [...paymentBatches],
    loans: loans.map((loan) => ({
      id: loan.loanId,
      farmerId: loan.farmerId,
      farmerName: loan.farmerName,
      amount: loan.approvedAmount || loan.requestedAmount,
      purpose: loan.purpose,
      status: uiLoanStatus(loan.status),
      appliedDate: (loan.createdAt || '').slice(0, 10),
      approvedDate: loan.disbursedAt ? loan.disbursedAt.slice(0, 10) : undefined,
      disbursedDate: loan.disbursedAt ? loan.disbursedAt.slice(0, 10) : undefined,
      repaidAmount: Math.max(0, (loan.approvedAmount || loan.requestedAmount || 0) - (loan.outstandingBalance || 0)),
      creditScoreAtApplication: loan.displayScore || Math.round((Number(loan.creditScoreAtRequest) - 300) / 5.5),
      loopRef: loan.loopTransactionRef,
      interestRate: 12,
    })),
    kpis: {
      totalFarmers: farmers.length,
      registeredCooperatives: cooperatives.length,
      disbursedThisMonth: 8940000,
      pendingBatches: paymentBatches.filter((row) => row.status === 'pending').length,
      activeLoans: loans.filter((row) => ['DISBURSED', 'APPROVED', 'PENDING'].includes(row.status)).length,
      avgCreditScore: Math.round(farmers.reduce((sum, row) => sum + row.creditScore, 0) / farmers.length),
      farmersScored: farmers.length,
      pendingApprovals: loans.filter((row) => row.status === 'PENDING').length,
    },
  };
}

function uiLoanStatus(status) {
  return {
    PENDING: 'applied',
    APPROVED: 'approved',
    DISBURSED: 'repaying',
    REPAID: 'closed',
    REJECTED: 'closed',
    DEFAULTED: 'closed',
  }[status] || 'applied';
}

export default {
  findFarmerByLookup,
  getFarmer,
  getUiFarmer,
  listFarmers,
  registerFarmer,
  updateFarmer,
  deactivateFarmer,
  getCreditProfile,
  listLoans,
  addLoan,
  getLoan,
  listLoansByCooperative,
  processLoanDecision,
  reduceLoanBalance,
  recordRepaymentPrompt,
  findLoanByPromptRef,
  listProduce,
  recordProduce,
  markProduceSettled,
  listPayouts,
  getPayout,
  addPayout,
  updatePayoutByLoopRef,
  snapshot,
  toApiFarmer,
};
