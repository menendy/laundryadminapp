// local.js (Final Version: Wi-Fi Priority & ADB Status)
const os = require('os');
const { execSync, spawn } = require('child_process');

/**
 * Fungsi untuk mendeteksi IP Laptop yang benar.
 * Memprioritaskan adapter 'Wi-Fi' dan mengabaikan adapter virtual (vEthernet).
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  let fallbackIp = 'localhost';

  // Langkah 1: Cari adapter yang namanya mengandung 'Wi-Fi'
  for (const name of Object.keys(interfaces)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wifi')) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  // Langkah 2: Jika tidak ada nama 'Wi-Fi', cari IP 192.168.x.x (standar router)
  // sambil mengabaikan adapter virtual 'vEthernet'
  for (const name of Object.keys(interfaces)) {
    if (name.toLowerCase().includes('vethernet')) continue; 
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168')) {
          return iface.address;
        }
        fallbackIp = iface.address;
      }
    }
  }
  return fallbackIp;
}

const localIp = getLocalIp();
const apiUrl = `http://${localIp}:5001/laundry-apps-7f84c/asia-southeast2`;

console.log("\n===============================================");
console.log(`📡  IP DETECTED : \x1b[32m${localIp}\x1b[0m`);
console.log(`🔗  API URL     : \x1b[34m${apiUrl}\x1b[0m`);
console.log("===============================================\n");

/**
 * Menjalankan ADB Reverse.
 * Jika kabel dicolok, port akan terhubung. Jika tidak, akan lanjut ke mode Wi-Fi.
 */
try {
  // Jalankan adb reverse untuk port Firebase (5001) dan Metro (8081)
  execSync('adb reverse tcp:5001 tcp:5001', { stdio: 'ignore' });
  execSync('adb reverse tcp:8081 tcp:8081', { stdio: 'ignore' });
  console.log("✅ ADB Reverse Active");
} catch (e) {
  console.log("⚠️  ADB Device tidak terdeteksi (Mode Wi-Fi aktif)");
}

/**
 * Menjalankan Expo dengan menimpa (override) API URL menggunakan IP Laptop.
 * Ini memastikan HP fisik bisa mengakses API melalui jaringan Wi-Fi.
 */
spawn('npx', ['expo', 'start', '--dev-client', '--lan'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    EXPO_PUBLIC_ENV: 'local',
    EXPO_PUBLIC_API_BASE_URL: apiUrl
  }
});