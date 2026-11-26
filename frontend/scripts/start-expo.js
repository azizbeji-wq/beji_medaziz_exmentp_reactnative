const os = require('os');
const { spawn } = require('child_process');

const VIRTUAL_IFACE_PATTERN =
  /vethernet|wsl|hyper-v|vmware|vmnet|virtualbox|vbox|docker|loopback|tailscale|zerotier|hamachi|nordlynx|wireguard|tun|tap/i;

function detectLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!Array.isArray(addrs)) continue;
    for (const addr of addrs) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      if (addr.address.startsWith('169.254.')) continue;

      let score = 0;
      if (!VIRTUAL_IFACE_PATTERN.test(name)) score += 100;
      if (/wi-?fi|wlan|wireless/i.test(name)) score += 50;
      else if (/ethernet/i.test(name)) score += 30;
      if (addr.address.startsWith('192.168.')) score += 20;
      else if (addr.address.startsWith('10.')) score += 10;

      candidates.push({ name, address: addr.address, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.address || null;
}

const args = process.argv.slice(2);
const env = { ...process.env };
const isTunnel = args.includes('--tunnel');

if (isTunnel) {
  // Évite le crash d'adbReverse sur un émulateur fantôme (ex. emulator-5554) lors du démarrage du tunnel ngrok
  env.ANDROID_HOME = '__skip_adb__';
  env.ANDROID_SDK_ROOT = '__skip_adb__';
} else if (!env.REACT_NATIVE_PACKAGER_HOSTNAME) {
  const lanIp = detectLanIp();
  if (lanIp) {
    env.REACT_NATIVE_PACKAGER_HOSTNAME = lanIp;
    console.log(`\n[Expo LAN] IP détectée automatiquement : ${lanIp}`);
    console.log(`[API Laravel] URL attendue sur mobile : http://${lanIp}:8000/api\n`);
  }
}

const expoCli = require.resolve('expo/bin/cli');
const child = spawn(process.execPath, [expoCli, 'start', ...args], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
