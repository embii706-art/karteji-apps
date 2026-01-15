# 🚀 KARTEJI - Quick Start Guide

## 📱 Apa yang Sudah Dibuat?

**Aplikasi mobile Android lengkap untuk Karang Taruna** dengan 6 screens utama, Firebase integration, dan Cloudinary untuk images.

---

## ⚡ Install & Run (5 Menit)

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Run di Android**
```bash
npx react-native run-android
```

Aplikasi akan terbuka di emulator atau device Android Anda!

---

## 🔐 Login Testing

Karena Firebase Auth sudah aktif, Anda bisa:

### **Option 1: Buat akun baru**
1. Buka Firebase Console: https://console.firebase.google.com
2. Pilih project: `katar-9cac3`
3. Authentication → Users → Add User
4. Masukkan email & password
5. Login di app dengan credentials tersebut

### **Option 2: Login dengan test account** (jika ada)
```
Email: test@karteji.com
Password: (tanyakan admin)
```

---

## 📊 Populate Data (Opsional)

Untuk melihat app dengan data lengkap, tambahkan di Firestore:

### **1. Activities (Events)**
```javascript
// Collection: activities
{
  title: "Gotong Royong Kebersihan",
  description: "Kerja bakti membersihkan lingkungan RT 05",
  location: "Balai RT 05",
  startDate: new Date("2026-01-20"),
  endDate: new Date("2026-01-20"),
  imageUrl: "https://via.placeholder.com/400", // Ganti dengan Cloudinary URL
  participantCount: 15,
  status: "active",
  createdAt: new Date()
}
```

### **2. Voting**
```javascript
// Collection: voting
{
  title: "Pilih Ketua Karang Taruna",
  description: "Pemilihan ketua periode 2026-2028",
  options: [
    {id: "1", name: "Budi Santoso", description: "Pengalaman 5 tahun", votes: 12},
    {id: "2", name: "Andi Wijaya", description: "Fresh ideas", votes: 8}
  ],
  totalVotes: 20,
  status: "active",
  endDate: new Date("2026-02-01"),
  createdAt: new Date()
}
```

### **3. Finance**
```javascript
// Collection: finance
{
  description: "Iuran bulanan anggota",
  amount: 500000,
  type: "income",
  category: "Iuran",
  date: new Date(),
  createdAt: new Date()
}

{
  description: "Pembelian konsumsi rapat",
  amount: 150000,
  type: "expense",
  category: "Konsumsi",
  date: new Date(),
  createdAt: new Date()
}
```

### **4. Announcements**
```javascript
// Collection: announcements
{
  title: "Rapat Koordinasi Bulanan",
  content: "Rapat akan dilaksanakan pada Sabtu, 20 Januari 2026 pukul 19:00 WIB di Balai RT.",
  author: "Admin",
  createdAt: new Date()
}
```

---

## 🎨 Customize

### **1. Ganti Logo**
Edit file: `src/screens/SplashScreen.js`
```javascript
// Ganti logoCircle dengan Image
<Image 
  source={require('../assets/logo.png')} 
  style={styles.logo}
/>
```

### **2. Ganti Nama RT**
Cari & replace: `"RT 05"` → `"RT [Nomor Anda]"`

### **3. Ganti Warna**
Edit: `src/constants/theme.js`
```javascript
export const COLORS = {
  primary: '#1E3A8A',  // Ganti dengan warna pilihan
  accent: '#FCD34D',   // Ganti dengan accent color
  // ...
};
```

---

## 📸 Setup Cloudinary (untuk upload foto)

1. Buka: https://cloudinary.com
2. Sign up / Login
3. Dashboard → Settings → Upload
4. Create Upload Preset:
   - Name: `karteji_preset`
   - Signing Mode: **Unsigned**
   - Folder: `karteji/`
5. Copy **Cloud Name**
6. Edit `src/services/cloudinary.js`:
```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'YOUR_CLOUD_NAME',  // Paste di sini
  uploadPreset: 'karteji_preset',
};
```

---

## 🔥 Firebase Setup (sudah dikonfigurasi!)

Project sudah terhubung ke:
- **Project ID:** `katar-9cac3`
- **Region:** Asia Southeast (Singapore)

File config:
- ✅ `android/app/google-services.json` (Android)
- ✅ `src/config/firebase.js` (App)

**Jika ingin pakai Firebase sendiri:**
1. Buat project di https://console.firebase.google.com
2. Download `google-services.json`
3. Replace file di `android/app/`
4. Update credentials di `src/config/firebase.js`

---

## 📱 Build APK

### Development Build
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Production Build
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🐛 Troubleshooting

### **Error: Metro bundler tidak start**
```bash
npx react-native start --reset-cache
```

### **Error: Cannot connect to Android device**
```bash
adb devices
adb reverse tcp:8081 tcp:8081
```

### **Error: Firebase not working**
- Pastikan `google-services.json` ada di `android/app/`
- Rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

### **Error: Icons tidak muncul**
```bash
npx react-native link react-native-vector-icons
```

---

## 📚 Resources

- **Repository:** https://github.com/embii706-art/karteji-apps
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Firebase Docs:** https://firebase.google.com/docs
- **React Navigation:** https://reactnavigation.org/docs/getting-started

---

## 🎯 Development Workflow

### **Daily Development:**
```bash
# 1. Start Metro
npm start

# 2. Run Android (terminal baru)
npx react-native run-android

# 3. View logs
npx react-native log-android
```

### **Testing:**
1. Login dengan test account
2. Navigate ke semua screens
3. Test CRUD operations (jika sudah ada data)
4. Test real-time updates
5. Test logout

### **Before Commit:**
```bash
git add .
git commit -m "feat: your feature description"
git push
```

---

## 💡 Pro Tips

### **1. Hot Reload**
- Double-tap R untuk reload
- Shake device untuk dev menu

### **2. Debug Menu**
- Cmd/Ctrl + M (Android)
- Enable "Fast Refresh"

### **3. Performance**
- Gunakan Cloudinary untuk optimize images
- Cleanup listeners di `useEffect` cleanup
- Use `React.memo` untuk komponen berat

### **4. UI/UX**
- Selalu tampilkan loading state
- Error messages harus jelas
- Success feedback setelah action

---

## 📞 Support

Kalau ada masalah:
1. Check `PROJECT_SUMMARY.md` untuk overview lengkap
2. Check `README.md` untuk dokumentasi detail
3. Lihat Firebase Console untuk data issues
4. Check React Native logs: `npx react-native log-android`

---

## ✅ Checklist Sebelum Deploy

- [ ] Test login/logout
- [ ] Test semua screens
- [ ] Populate sample data di Firebase
- [ ] Upload sample images ke Cloudinary
- [ ] Test di real device (bukan emulator)
- [ ] Build release APK
- [ ] Test APK di device lain
- [ ] Update app icon & splash screen
- [ ] Siap deploy ke Play Store!

---

<div align="center">
  <strong>Selamat Coding! 🚀</strong>
  <br>
  <em>KARTEJI - Pemuda Aktif, RT Produktif</em>
</div>
