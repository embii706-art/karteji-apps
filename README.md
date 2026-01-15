# KARTEJI – Karang Taruna Digital

<div align="center">
  <h3>🏘️ Aplikasi Mobile untuk Organisasi Karang Taruna RT</h3>
  <p><em>Pemuda Aktif, RT Produktif</em></p>
</div>

---

## 📱 Tentang Aplikasi

**KARTEJI** adalah aplikasi mobile Android untuk manajemen organisasi Karang Taruna tingkat RT (Rukun Tetangga) di Indonesia. Aplikasi ini dirancang untuk meningkatkan koordinasi, transparansi, dan partisipasi aktif anggota dalam kegiatan organisasi.

### 🎯 Fitur Utama

#### 1. **Dashboard / Home**
- Greeting personal untuk member
- Summary statistik organisasi (total anggota, event aktif)
- Quick action buttons (Events, Agenda, Keuangan, Voting)
- Upcoming activities card
- Pengumuman penting

#### 2. **Events & Kegiatan**
- Daftar seluruh kegiatan organisasi
- Filter: Akan Datang, Berlangsung, Selesai
- Detail event dengan foto dari Cloudinary
- Jumlah peserta & lokasi
- Status badge real-time

#### 3. **Voting / Musyawarah**
- Sistem voting untuk keputusan bersama
- Countdown timer untuk batas waktu voting
- Visualisasi hasil transparansi (percentage bar)
- Tracking vote history per user
- Real-time vote counting

#### 4. **Keuangan**
- Transparansi kas organisasi
- Total saldo, pemasukan, pengeluaran
- Riwayat transaksi lengkap dengan kategori
- Filter transaksi (Semua, Pemasukan, Pengeluaran)
- Data-driven dari Firebase

#### 5. **Profile**
- Foto profil dari Cloudinary
- Statistik partisipasi (kegiatan, poin, badge)
- Badge & penghargaan
- Menu pengaturan
- Logout

---

## 🏗️ Teknologi Stack

### **Frontend**
- **React Native 0.83.1** - Cross-platform mobile framework
- **React Navigation** - Navigation & bottom tabs
- **React Native Vector Icons** - Icon library

### **Backend & Services**
- **Firebase**
  - **Authentication** - Login & user management
  - **Firestore** - Real-time database
  - **Storage** - File storage
- **Cloudinary** - Image hosting & optimization

### **UI/UX**
- **Design System** - Custom theme dengan deep blue & yellow
- **Typography** - Optimized untuk readability
- **Components** - Reusable styled components
- **Shadows & Borders** - Modern, clean design

---

## 🎨 Design System

### **Color Palette**
```javascript
Primary: #1E3A8A (Deep Blue)
Accent: #FCD34D (Yellow)
Background: #FFFFFF
Success: #10B981
Error: #EF4444
Text: #1F2937
```

### **Typography Scale**
- H1: 32px Bold
- H2: 24px Bold
- H3: 20px Semi-bold
- Body: 16px Regular
- Caption: 12px Regular

### **Spacing System**
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

---

## 📂 Struktur Project

```
karteji-apps/
├── src/
│   ├── screens/              # 6 Main Screens
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── EventsScreen.js
│   │   ├── VotingScreen.js
│   │   ├── FinanceScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/
│   │   └── AppNavigator.js   # Stack + Bottom Tabs
│   ├── config/
│   │   └── firebase.js       # Firebase config
│   ├── services/
│   │   └── cloudinary.js     # Image upload & optimization
│   └── constants/
│       └── theme.js          # Design tokens
├── android/                   # Android native code
├── App.js                     # Root component
└── package.json
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js 18+
- npm atau yarn
- Android Studio (untuk Android development)
- Firebase Project
- Cloudinary Account

### **Installation Steps**

1. **Clone repository**
```bash
git clone https://github.com/embii706-art/karteji-apps.git
cd karteji-apps
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
- Buka `/android/app/google-services.json`
- Update dengan credentials Firebase Anda

4. **Configure Cloudinary** (optional)
- Buka `/src/services/cloudinary.js`
- Update `cloudName` dan `uploadPreset`

5. **Run Android**
```bash
npm run android
# atau
npx react-native run-android
```

---

## 🔥 Firebase Setup

### **Collections Structure**

#### **profiles**
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: string,
  profilePhoto: string (Cloudinary URL),
  activityPoints: number,
  badges: array,
  createdAt: timestamp
}
```

#### **activities**
```javascript
{
  title: string,
  description: string,
  location: string,
  startDate: timestamp,
  endDate: timestamp,
  imageUrl: string (Cloudinary URL),
  participantCount: number,
  status: string,
  createdAt: timestamp
}
```

#### **voting**
```javascript
{
  title: string,
  description: string,
  options: array [{id, name, votes}],
  totalVotes: number,
  status: string ('active' | 'closed'),
  endDate: timestamp,
  createdAt: timestamp
}
```

#### **votes**
```javascript
{
  userId: string,
  votingId: string,
  optionId: string,
  createdAt: timestamp
}
```

#### **finance**
```javascript
{
  description: string,
  amount: number,
  type: string ('income' | 'expense'),
  category: string,
  date: timestamp,
  createdAt: timestamp
}
```

#### **announcements**
```javascript
{
  title: string,
  content: string,
  author: string,
  createdAt: timestamp
}
```

---

## 📸 Cloudinary Setup

### **Upload Preset Configuration**
1. Login ke Cloudinary Dashboard
2. Settings → Upload → Upload presets
3. Create preset: `karteji_preset`
4. Set **Signing Mode** to **Unsigned**
5. Folder: `karteji/`

### **Image Optimization**
```javascript
// Otomatis resize & optimize
const optimizedUrl = getOptimizedImageUrl(originalUrl, width=400, quality='auto');
```

---

## 🎯 User Flow

```
1. Splash Screen (2 detik)
   ↓
2. Login Screen
   → Input email & password
   → Authenticate via Firebase
   ↓
3. Main App (Bottom Tabs)
   ├── Dashboard → Quick access & overview
   ├── Events → Browse & join activities
   ├── Voting → Participate in decisions
   ├── Finance → View kas transparently
   └── Profile → Manage account & view stats
```

---

## 🛠️ Development

### **Run Development Server**
```bash
npm start
```

### **Build APK**
```bash
cd android
./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/app-release.apk`

### **Debug**
```bash
npx react-native log-android
```

---

## 📋 Features Checklist

- [x] Splash Screen dengan logo
- [x] Login dengan Firebase Auth
- [x] Dashboard dengan stats real-time
- [x] Events listing dengan Cloudinary images
- [x] Voting system dengan results visualization
- [x] Finance transparency dengan transaction history
- [x] Profile dengan badges & activity points
- [x] Bottom navigation (5 tabs)
- [x] Real-time data dari Firestore
- [x] Image optimization via Cloudinary
- [x] Modern UI dengan deep blue & yellow theme
- [x] Loading states & error handling
- [x] Responsive design untuk mobile

---

## 🤝 Contributing

Aplikasi ini dikembangkan untuk komunitas Karang Taruna. Kontribusi sangat terbuka!

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

Distributed under MIT License.

---

## 👥 Contact

**Project Maintainer:** [@embii706-art](https://github.com/embii706-art)

**Repository:** [https://github.com/embii706-art/karteji-apps](https://github.com/embii706-art/karteji-apps)

---

<div align="center">
  <strong>KARTEJI - Pemuda Aktif, RT Produktif</strong>
  <br>
  <em>Built with ❤️ for Indonesian communities</em>
</div>
