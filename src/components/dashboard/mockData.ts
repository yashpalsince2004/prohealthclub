export interface Invoice {
  id: string;
  date: string;
  amount: number;
  method: "Cash" | "Card" | "UPI" | "Split";
  status: "Paid" | "Pending" | "Refunded";
}

export interface Measurement {
  weight: number;
  bodyFat: number;
  muscleMass: number;
  date: string;
}

export interface ActivityLog {
  id: string;
  type: "checkin" | "checkout" | "payment" | "renewal" | "trainer" | "biometric";
  details: string;
  timestamp: string;
}

export interface Member {
  id: string;
  name: string;
  photo: string;
  email: string;
  phone: string;
  membership: string;
  assignedTrainerId?: string;
  attendanceToday: boolean;
  checkInTime?: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Frozen" | "Cancelled";
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalConditions: string[];
  qrCode: string;
  workoutPlan: string[];
  dietPlan: string[];
  measurements: Measurement[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  notes: string[];
}

export interface Trainer {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  experience: string;
  assignedMembers: number;
  todaySessions: number;
  rating: number;
  status: "Active" | "Inactive";
  salary: number;
  performanceScore: number; // out of 100
}

export interface BiometricDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: "Online" | "Offline";
  firmware: string;
  lastSync: string;
  todaySyncs: number;
  todayErrors: number;
}

export interface BiometricEvent {
  id: string;
  timestamp: string;
  memberName: string;
  deviceName: string;
  type: "Fingerprint" | "Face" | "QR" | "Manual";
  status: "Success" | "Error";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Supplements" | "Products" | "Accessories" | "Merchandise";
  price: number;
  stock: number;
  minStock: number;
  supplier: string;
  salesCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "expiry" | "birthday" | "payment" | "trainer" | "biometric";
}

export const initialTrainers: Trainer[] = [
  {
    id: "TR-01",
    name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop",
    specialization: "Bodybuilding & Strength Coaching",
    experience: "8 Years",
    assignedMembers: 14,
    todaySessions: 6,
    rating: 4.9,
    status: "Active",
    salary: 45000,
    performanceScore: 96
  },
  {
    id: "TR-02",
    name: "Ananya Sharma",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=200&auto=format&fit=crop",
    specialization: "Functional Fitness & Pilates",
    experience: "5 Years",
    assignedMembers: 10,
    todaySessions: 4,
    rating: 4.8,
    status: "Active",
    salary: 38000,
    performanceScore: 92
  },
  {
    id: "TR-03",
    name: "Kabir Dev",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    specialization: "Weight Management & Nutrition",
    experience: "6 Years",
    assignedMembers: 12,
    todaySessions: 5,
    rating: 4.7,
    status: "Active",
    salary: 40000,
    performanceScore: 89
  },
  {
    id: "TR-04",
    name: "Rohan Das",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
    specialization: "Powerlifting & CrossFit",
    experience: "10 Years",
    assignedMembers: 18,
    todaySessions: 8,
    rating: 4.9,
    status: "Active",
    salary: 55000,
    performanceScore: 98
  },
  {
    id: "TR-05",
    name: "Meera Nair",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    specialization: "Cardio Kickboxing & Flexibility",
    experience: "4 Years",
    assignedMembers: 8,
    todaySessions: 3,
    rating: 4.6,
    status: "Inactive",
    salary: 32000,
    performanceScore: 85
  }
];

export const initialMembers: Member[] = [
  {
    id: "PHC-101",
    name: "Amit Patel",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    email: "amit.patel@gmail.com",
    phone: "+91 98765 43210",
    membership: "Annual Platinum Plan",
    assignedTrainerId: "TR-01",
    attendanceToday: true,
    checkInTime: "07:15 AM",
    expiryDate: "2026-12-15",
    status: "Active",
    emergencyContact: { name: "Rajesh Patel", phone: "+91 98765 43211", relationship: "Father" },
    medicalConditions: ["None"],
    qrCode: "QR_PHC_101",
    workoutPlan: [
      "Mon: Heavy Squats, Leg Press, Extensions (4 sets x 8-12 reps)",
      "Tue: Bench Press, Incline Dumbbell Flys, Cable Crossovers",
      "Wed: Deadlifts, Pull-ups, Lat Pulldowns, Seated Rows",
      "Thu: Shoulder Press, Lateral Raises, Face Pulls",
      "Fri: Barbell Curls, Tricep Pushdowns, Hammer Curls",
      "Sat: HIIT Cardio, Core Planks, Leg Raises"
    ],
    dietPlan: [
      "Meal 1: Oats with Almonds, 4 Egg Whites, 1 Whole Egg",
      "Meal 2: Chicken Breast (150g), Brown Rice (100g), Broccoli",
      "Meal 3: Whey Protein Isolate, 1 Banana (Post Workout)",
      "Meal 4: Fish Filet (150g) or Paneer (150g), Sweet Potato (100g)",
      "Meal 5: Mixed Greens Salad, Olive Oil, Roasted Almonds"
    ],
    measurements: [
      { weight: 82.5, bodyFat: 16.8, muscleMass: 40.2, date: "2026-06-01" },
      { weight: 81.2, bodyFat: 15.2, muscleMass: 40.9, date: "2026-07-01" }
    ],
    invoices: [
      { id: "INV-2026-001", date: "2025-12-15", amount: 18000, method: "UPI", status: "Paid" },
      { id: "INV-2026-042", date: "2026-03-10", amount: 1200, method: "Cash", status: "Paid" } // product purchase
    ],
    activityLogs: [
      { id: "AL-001", type: "checkin", details: "Checked in via Face Scanner at Main Gate", timestamp: "07:15 AM" },
      { id: "AL-002", type: "trainer", details: "Trainer Vikram Malhotra assigned for session", timestamp: "07:30 AM" }
    ],
    notes: ["Focused on lean bulk goals.", "Prefers morning workouts."]
  },
  {
    id: "PHC-102",
    name: "Priya Sharma",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    email: "priya.sharma@yahoo.com",
    phone: "+91 91234 56789",
    membership: "3-Month Gold Plan",
    assignedTrainerId: "TR-02",
    attendanceToday: true,
    checkInTime: "08:30 AM",
    expiryDate: "2026-08-20",
    status: "Active",
    emergencyContact: { name: "Sunita Sharma", phone: "+91 91234 56780", relationship: "Mother" },
    medicalConditions: ["Lower Back Pain (Mild)"],
    qrCode: "QR_PHC_102",
    workoutPlan: [
      "Mon: Goblet Squats, Lunges, Glute Bridges (3 sets x 12-15 reps)",
      "Wed: Dumbbell Rows, Lat Pulldowns, Facepulls",
      "Fri: Dumbbell Shoulder Press, Pushups, Plank Variations"
    ],
    dietPlan: [
      "Meal 1: Moong Dal Chilla, Mint Chutney, Black Coffee",
      "Meal 2: Soya Chunks, Quinoa, Cucumber Salad",
      "Meal 3: Apple, Walnuts, 1 Scoop Whey Protein",
      "Meal 4: Grilled Paneer (120g), Steamed Asparagus & Bell Peppers"
    ],
    measurements: [
      { weight: 64.0, bodyFat: 24.5, muscleMass: 25.1, date: "2026-05-20" },
      { weight: 62.8, bodyFat: 23.1, muscleMass: 25.8, date: "2026-06-20" }
    ],
    invoices: [
      { id: "INV-2026-015", date: "2026-05-20", amount: 4500, method: "Card", status: "Paid" }
    ],
    activityLogs: [
      { id: "AL-003", type: "checkin", details: "Checked in via Fingerprint Scanner", timestamp: "08:30 AM" }
    ],
    notes: ["Needs to avoid heavy spinal loading due to back issues.", "Goal is fat loss and core strengthening."]
  },
  {
    id: "PHC-103",
    name: "Rahul Verma",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    email: "verma.rahul@gmail.com",
    phone: "+91 99887 76655",
    membership: "Starter Pack Monthly",
    assignedTrainerId: undefined,
    attendanceToday: false,
    expiryDate: "2026-07-05",
    status: "Active",
    emergencyContact: { name: "Nehal Verma", phone: "+91 99887 76654", relationship: "Spouse" },
    medicalConditions: ["None"],
    qrCode: "QR_PHC_103",
    workoutPlan: ["General Gym Access: Card / Free weights self-training"],
    dietPlan: ["Basic balanced diet, high protein intake recommendation"],
    measurements: [{ weight: 75.0, bodyFat: 19.5, muscleMass: 33.0, date: "2026-06-05" }],
    invoices: [{ id: "INV-2026-028", date: "2026-06-05", amount: 1500, method: "UPI", status: "Paid" }],
    activityLogs: [],
    notes: ["Enjoys evening runs and self training."]
  },
  {
    id: "PHC-104",
    name: "Sunita Kapoor",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    email: "sunita.kapoor@rediffmail.com",
    phone: "+91 98223 34455",
    membership: "Annual Platinum Plan",
    assignedTrainerId: "TR-03",
    attendanceToday: false,
    expiryDate: "2026-03-01",
    status: "Expired",
    emergencyContact: { name: "Anil Kapoor", phone: "+91 98223 34450", relationship: "Spouse" },
    medicalConditions: ["Hypertension (Controlled)"],
    qrCode: "QR_PHC_104",
    workoutPlan: ["Light cardio walking, stretching, machine rows (high rep, low load)"],
    dietPlan: ["Low sodium, high fiber, lots of fresh vegetables, fish, lentils"],
    measurements: [{ weight: 70.2, bodyFat: 31.0, muscleMass: 22.0, date: "2025-03-01" }],
    invoices: [{ id: "INV-2025-004", date: "2025-03-01", amount: 18000, method: "Split", status: "Paid" }],
    activityLogs: [{ id: "AL-005", type: "renewal", details: "Membership Expired", timestamp: "2026-03-01" }],
    notes: ["Needs regular heart rate checks during sessions.", "Requires renewal follow up."]
  },
  {
    id: "PHC-105",
    name: "Deepak Malhotra",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    email: "deepak.malhotra@gmail.com",
    phone: "+91 95454 54545",
    membership: "3-Month Gold Plan",
    assignedTrainerId: "TR-04",
    attendanceToday: true,
    checkInTime: "06:05 AM",
    expiryDate: "2026-09-10",
    status: "Active",
    emergencyContact: { name: "Geeta Malhotra", phone: "+91 95454 54540", relationship: "Sister" },
    medicalConditions: ["None"],
    qrCode: "QR_PHC_105",
    workoutPlan: ["Heavy powerlifting splits: squats, bench, deadlifts, overhead presses"],
    dietPlan: ["3500 kcal bulking plan: oats, peanut butter, chicken, rice, eggs, protein shakes"],
    measurements: [{ weight: 89.0, bodyFat: 18.2, muscleMass: 42.0, date: "2026-06-10" }],
    invoices: [{ id: "INV-2026-035", date: "2026-06-10", amount: 4500, method: "UPI", status: "Paid" }],
    activityLogs: [{ id: "AL-006", type: "checkin", details: "Checked in via Face Scanner at Main Gate", timestamp: "06:05 AM" }],
    notes: ["Training for Kalyan state powerlifting competition."]
  },
  {
    id: "PHC-106",
    name: "Karan Johar",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
    email: "karan.j@kjo.com",
    phone: "+91 97777 88888",
    membership: "Annual Platinum Plan",
    assignedTrainerId: undefined,
    attendanceToday: false,
    expiryDate: "2026-11-30",
    status: "Frozen",
    emergencyContact: { name: "Hiroo Johar", phone: "+91 97777 88880", relationship: "Mother" },
    medicalConditions: ["Knee injury rehab (ACL Recovery)"],
    qrCode: "QR_PHC_106",
    workoutPlan: ["Leg extensions (very light), hamstring curls, upper body focus"],
    dietPlan: ["Maintenance calories, anti-inflammatory foods, supplements"],
    measurements: [{ weight: 78.5, bodyFat: 21.0, muscleMass: 34.0, date: "2025-11-30" }],
    invoices: [{ id: "INV-2025-088", date: "2025-11-30", amount: 18000, method: "Card", status: "Paid" }],
    activityLogs: [{ id: "AL-008", type: "renewal", details: "Membership Frozen due to ACL injury", timestamp: "2026-05-15" }],
    notes: ["Do not allow leg workouts without supervisor clearance.", "Frozen till end of July."]
  },
  {
    id: "PHC-201",
    name: "Rahul Sharma",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98888 77777",
    membership: "Starter Pack Monthly",
    assignedTrainerId: "TR-01",
    attendanceToday: true,
    checkInTime: "06:45 AM",
    expiryDate: "2026-07-04", // Expiring soon
    status: "Active",
    emergencyContact: { name: "Vijay Sharma", phone: "+91 98888 77770", relationship: "Brother" },
    medicalConditions: ["None"],
    qrCode: "QR_PHC_201",
    workoutPlan: ["Squat progressions, Leg curls, Lunges"],
    dietPlan: ["Caloric surplus: protein focus, low fat"],
    measurements: [{ weight: 72, bodyFat: 15, muscleMass: 33.5, date: "2026-06-04" }],
    invoices: [{ id: "INV-2026-201", date: "2026-06-04", amount: 1500, method: "UPI", status: "Paid" }],
    activityLogs: [{ id: "AL-201", type: "checkin" as const, details: "Checked in via face terminal", timestamp: "06:45 AM" }],
    notes: ["Expiring soon. Needs renewal follow-up."]
  },
  {
    id: "PHC-202",
    name: "Priya Patel",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    email: "priya.patel@gmail.com",
    phone: "+91 97777 66666",
    membership: "Annual Platinum Plan",
    assignedTrainerId: "TR-02",
    attendanceToday: false,
    expiryDate: "2026-06-30", // Expired 2 days ago
    status: "Expired",
    emergencyContact: { name: "Dinesh Patel", phone: "+91 97777 66660", relationship: "Father" },
    medicalConditions: ["Asthma"],
    qrCode: "QR_PHC_202",
    workoutPlan: ["Pilates, core balance exercises, medium cardio"],
    dietPlan: ["Strict carb control, high fiber, daily vitamins"],
    measurements: [{ weight: 58.5, bodyFat: 22.1, muscleMass: 22.8, date: "2025-06-30" }],
    invoices: [{ id: "INV-2025-202", date: "2025-06-30", amount: 18000, method: "Card", status: "Paid" }],
    activityLogs: [{ id: "AL-202", type: "renewal" as const, details: "Membership Expired", timestamp: "2026-06-30" }],
    notes: ["Expired 2 days ago. Lock locker #45."]
  },
  {
    id: "PHC-203",
    name: "Amit Verma",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    email: "amit.verma@gmail.com",
    phone: "+91 96666 55555",
    membership: "3-Month Gold Plan",
    assignedTrainerId: "TR-04",
    attendanceToday: true,
    checkInTime: "07:50 AM",
    expiryDate: "2026-09-12",
    status: "Active",
    emergencyContact: { name: "Seema Verma", phone: "+91 96666 55550", relationship: "Spouse" },
    medicalConditions: ["None"],
    qrCode: "QR_PHC_203",
    workoutPlan: ["Push/Pull/Legs hypertrophy split routines"],
    dietPlan: ["Clean bulk: oats, eggs, rice, chicken, broccoli"],
    measurements: [{ weight: 80, bodyFat: 17.5, muscleMass: 38, date: "2026-06-12" }],
    invoices: [{ id: "INV-2026-203", date: "2026-06-12", amount: 4500, method: "UPI", status: "Paid" }],
    activityLogs: [{ id: "AL-203", type: "checkin" as const, details: "Checked in manually", timestamp: "07:50 AM" }],
    notes: ["Training consistently. Good progress."]
  },
  {
    id: "PHC-204",
    name: "Sneha Joshi",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    email: "sneha.joshi@gmail.com",
    phone: "+91 95555 44444",
    membership: "Annual Platinum Plan",
    assignedTrainerId: undefined,
    attendanceToday: false,
    expiryDate: "2026-12-20",
    status: "Frozen",
    emergencyContact: { name: "Anil Joshi", phone: "+91 95555 44440", relationship: "Father" },
    medicalConditions: ["Lower Back Pain (Mild)"],
    qrCode: "QR_PHC_204",
    workoutPlan: ["Low impact walking, swimming, light stretching"],
    dietPlan: ["Balanced recovery focus, high hydration"],
    measurements: [{ weight: 61, bodyFat: 21, muscleMass: 24.2, date: "2025-12-20" }],
    invoices: [{ id: "INV-2025-204", date: "2025-12-20", amount: 18000, method: "UPI", status: "Paid" }],
    activityLogs: [{ id: "AL-204", type: "renewal" as const, details: "Membership Frozen", timestamp: "2026-06-15" }],
    notes: ["Frozen due to corporate travel. Unfreeze on request."]
  }
];

export const initialDevices: BiometricDevice[] = [
  {
    id: "DEV-01",
    name: "Main Gate Face Terminal",
    ip: "192.168.1.150",
    port: 5005,
    status: "Online",
    firmware: "v4.5.12-PHC",
    lastSync: "10 seconds ago",
    todaySyncs: 184,
    todayErrors: 0
  },
  {
    id: "DEV-02",
    name: "Cardio Section Fingerprint",
    ip: "192.168.1.151",
    port: 5006,
    status: "Online",
    firmware: "v3.2.1-PHC",
    lastSync: "3 mins ago",
    todaySyncs: 112,
    todayErrors: 2
  },
  {
    id: "DEV-03",
    name: "PT Room Face Scanner",
    ip: "192.168.1.152",
    port: 5005,
    status: "Offline",
    firmware: "v4.5.08-PHC",
    lastSync: "2 hours ago",
    todaySyncs: 48,
    todayErrors: 14
  }
];

export const initialBiometricEvents: BiometricEvent[] = [
  { id: "EV-001", timestamp: "06:05 AM", memberName: "Deepak Malhotra", deviceName: "Main Gate Face Terminal", type: "Face", status: "Success" },
  { id: "EV-002", timestamp: "07:15 AM", memberName: "Amit Patel", deviceName: "Main Gate Face Terminal", type: "Face", status: "Success" },
  { id: "EV-003", timestamp: "08:30 AM", memberName: "Priya Sharma", deviceName: "Cardio Section Fingerprint", type: "Fingerprint", status: "Success" },
  { id: "EV-004", timestamp: "09:12 AM", memberName: "Unknown User", deviceName: "Main Gate Face Terminal", type: "Face", status: "Error" },
  { id: "EV-005", timestamp: "10:15 AM", memberName: "Rahul Verma", deviceName: "Cardio Section Fingerprint", type: "Manual", status: "Success" }
];

export const initialInventory: InventoryItem[] = [
  { id: "INV-01", name: "Premium Whey Protein Isolate (1kg)", category: "Supplements", price: 3500, stock: 45, minStock: 10, supplier: "Neulife India", salesCount: 88 },
  { id: "INV-02", name: "Creatine Monohydrate (250g)", category: "Supplements", price: 850, stock: 65, minStock: 15, supplier: "Optimum Nutrition", salesCount: 142 },
  { id: "INV-03", name: "Pre-Workout Explosion (300g)", category: "Supplements", price: 1800, stock: 8, minStock: 12, supplier: "MuscleBlaze", salesCount: 54 },
  { id: "INV-04", name: "PHC Premium Shaker Bottle (700ml)", category: "Accessories", price: 450, stock: 120, minStock: 20, supplier: "Signora Ware", salesCount: 210 },
  { id: "INV-05", name: "Heavy Duty Gym Belt (Leather)", category: "Accessories", price: 1200, stock: 15, minStock: 5, supplier: "Being Strong Accessories", salesCount: 39 },
  { id: "INV-06", name: "PHC Luxury Athlete T-Shirt", category: "Merchandise", price: 899, stock: 2, minStock: 10, supplier: "Alcis Sports", salesCount: 175 }
];

export const initialNotifications: NotificationItem[] = [
  { id: "NT-01", title: "Membership Expiring Soon", message: "Rahul Verma's Starter Pack expires in 3 days (2026-07-05).", timestamp: "2 hours ago", read: false, type: "expiry" },
  { id: "NT-02", title: "Biometric Device Offline", message: "PT Room Face Scanner has disconnected from the server.", timestamp: "4 hours ago", read: false, type: "biometric" },
  { id: "NT-03", title: "Low Stock Alert", message: "PHC Luxury Athlete T-Shirt is below minimum stock level (2 remaining).", timestamp: "1 day ago", read: true, type: "payment" },
  { id: "NT-04", title: "Birthday Celebration", message: "Wish Deepak Malhotra a happy birthday today!", timestamp: "6 hours ago", read: false, type: "birthday" }
];

export interface Staff {
  id: string;
  name: string;
  photo: string;
  role: "Receptionist" | "Manager" | "Sales Executive" | "Support";
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  shift: "Morning" | "Evening" | "Full-time";
  joiningDate: string;
  salary: number;
}

export interface PayrollRecord {
  id: string;
  recipientId: string;
  recipientName: string;
  role: string;
  amount: number;
  status: "Paid" | "Pending" | "Advance Paid";
  month: string;
  paymentDate?: string;
  method?: "UPI" | "Cash" | "Bank Transfer";
}

export const initialStaff: Staff[] = [
  {
    id: "ST-01",
    name: "Ritu Patel",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    role: "Receptionist",
    email: "ritu.patel@prrohealth.com",
    phone: "+91 98765 43210",
    status: "Active",
    shift: "Morning",
    joiningDate: "2025-01-15",
    salary: 22000
  },
  {
    id: "ST-02",
    name: "Karan Malhotra",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    role: "Manager",
    email: "karan.malhotra@prrohealth.com",
    phone: "+91 97654 32109",
    status: "Active",
    shift: "Full-time",
    joiningDate: "2024-06-10",
    salary: 35000
  },
  {
    id: "ST-03",
    name: "Sanjay Dutt",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
    role: "Sales Executive",
    email: "sanjay.dutt@prrohealth.com",
    phone: "+91 96543 21098",
    status: "Active",
    shift: "Evening",
    joiningDate: "2025-03-01",
    salary: 25000
  },
  {
    id: "ST-04",
    name: "Asha Bhosle",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    role: "Receptionist",
    email: "asha.b@prrohealth.com",
    phone: "+91 95432 10987",
    status: "Inactive",
    shift: "Evening",
    joiningDate: "2024-11-20",
    salary: 18000
  }
];

export const initialPayroll: PayrollRecord[] = [
  { id: "PAY-001", recipientId: "TR-01", recipientName: "Vikram Malhotra", role: "Head Trainer", amount: 45000, status: "Paid", month: "June 2026", paymentDate: "2026-06-28", method: "Bank Transfer" },
  { id: "PAY-002", recipientId: "TR-02", recipientName: "Rohan Sharma", role: "Strength Coach", amount: 50000, status: "Advance Paid", month: "July 2026", paymentDate: "2026-06-30", method: "UPI" },
  { id: "PAY-003", recipientId: "TR-03", recipientName: "Anjali Mehta", role: "Yoga Certified Instructor", amount: 42000, status: "Pending", month: "June 2026" },
  { id: "PAY-004", recipientId: "TR-04", recipientName: "Kabir Sen", role: "Cardio Expert", amount: 48000, status: "Paid", month: "June 2026", paymentDate: "2026-06-29", method: "UPI" },
  { id: "PAY-005", recipientId: "ST-01", recipientName: "Ritu Patel", role: "Receptionist", amount: 22000, status: "Paid", month: "June 2026", paymentDate: "2026-06-29", method: "Cash" },
  { id: "PAY-006", recipientId: "ST-02", recipientName: "Karan Malhotra", role: "Manager", amount: 35000, status: "Paid", month: "June 2026", paymentDate: "2026-06-28", method: "Bank Transfer" },
  { id: "PAY-007", recipientId: "ST-03", recipientName: "Sanjay Dutt", role: "Sales Executive", amount: 25000, status: "Pending", month: "June 2026" },
  { id: "PAY-008", recipientId: "ST-04", recipientName: "Asha Bhosle", role: "Receptionist", amount: 18000, status: "Advance Paid", month: "July 2026", paymentDate: "2026-06-30", method: "UPI" }
];
