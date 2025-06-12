
// src/app/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js
import Image from 'next/image'; // Menggunakan next/image untuk penanganan gambar yang dioptimalkan
import { QRIS_ORDER_KUOTA, PANEL_DOMAIN } from '../lib/constants'; // Impor konstanta dari file lib

export default function HomePage() {
  // State untuk form pembelian
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State untuk status pembayaran
  const [loading, setLoading] = useState(false);
  const [qrisImageUrl, setQrisImageUrl] = useState(null);
  const [alertMessage, setAlertMessage] = useState({ text: '', type: '' });
  // State untuk data panel
  const [panelData, setPanelData] = useState([]);
  // State untuk UI dashboard
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State untuk timer QRIS
  const [qrisTimeLeft, setQrisTimeLeft] = useState(5 * 60); // 5 menit dalam detik
  const qrisCountdownRef = useRef(null);
  const paymentPollingRef = useRef(null);

  // Seleksi elemen DOM (diganti dengan useRef atau ID langsung di JSX jika memungkinkan)
  const alertMessageRef = useRef(null);
  const statusSectionRef = useRef(null);
  const qrisDisplayRef = useRef(null);
  const submitButtonRef = useRef(null);
  const purchaseFormRef = useRef(null);
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Muat data panel dari Local Storage saat komponen dimuat
  useEffect(() => {
    const storedPanelData = localStorage.getItem('userPanelData');
    if (storedPanelData) {
      setPanelData(JSON.parse(storedData));
    }

    // Inisialisasi Chart.js setelah DOM dimuat
    const chartCtx = document.getElementById('salesChart');
    if (chartCtx) {
        renderChart(chartCtx);
    }

    // Cleanup interval saat komponen di-unmount
    return () => {
      if (qrisCountdownRef.current) clearInterval(qrisCountdownRef.current);
      if (paymentPollingRef.current) clearInterval(paymentPollingRef.current);
    };
  }, []);

  // Efek untuk mengelola sidebar (khusus mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      if (isSidebarOpen) {
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('sidebarOverlay').classList.add('active');
      } else {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
      }
    }
  }, [isSidebarOpen]);

  // Fungsi untuk menampilkan pesan notifikasi
  const showAlert = (message, type = 'info') => {
    if (alertMessageRef.current && statusSectionRef.current) {
      alertMessageRef.current.textContent = message;
      alertMessageRef.current.className = `p-4 rounded-lg text-sm font-medium fade-in 
        ${type === 'success' ? 'bg-green-100 text-green-800' :
          type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'}`;
      statusSectionRef.current.classList.remove('hidden');
      alertMessageRef.current.classList.remove('hidden');
    }
  };

  // Merender data panel ke UI
  const renderPanelData = () => {
    const panelListElement = document.getElementById('panelList');
    const noPanelsMessageElement = document.getElementById('noPanelsMessage');
    const panelContentElement = document.getElementById('panelContent');

    if (panelListElement && noPanelsMessageElement && panelContentElement) {
      panelListElement.innerHTML = ''; // Kosongkan daftar sebelum merender
      if (panelData.length > 0) {
        noPanelsMessageElement.classList.add('hidden');
        panelContentElement.classList.remove('hidden');
        panelData.slice().reverse().forEach(panel => { // Tampilkan terbaru di atas
          const panelItem = document.createElement('div');
          panelItem.className = 'dashboard-card p-4 fade-in';
          panelItem.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div class="mb-2 md:mb-0">
                <p class="text-xs text-gray-500">Dibeli pada: ${panel.createdAt}</p>
                <p class="font-medium text-gray-800 break-all">Username: <span class="font-bold text-blue-600">${panel.username}</span></p>
                <p class="font-medium text-gray-800 break-all">Password: <span class="font-bold text-blue-600">${panel.password}</span></p>
              </div>
              <a href="${panel.link}" target="_blank" rel="noopener noreferrer" class="text-sm btn-primary font-semibold py-2 px-3 rounded-md text-center mt-2 md:mt-0">Login Panel</a>
            </div>
          `;
          panelListElement.appendChild(panelItem);
        });
      } else {
        panelContentElement.classList.add('hidden');
        noPanelsMessageElement.classList.remove('hidden');
      }
    }
  };

  // Menyimpan data panel ke localStorage
  const savePanelData = () => {
    localStorage.setItem('userPanelData', JSON.stringify(panelData));
  };

  // Fungsi untuk simulasi pembuatan panel setelah pembayaran dikonfirmasi
  const simulateCreatePanel = () => {
    showAlert('Panel sedang dipersiapkan untuk Anda. Ini mungkin memakan waktu singkat...', 'success');

    setTimeout(() => {
      const newPanel = {
        id: Date.now(),
        username: username,
        password: password,
        link: PANEL_DOMAIN,
        createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      };

      setPanelData(prevData => {
        const updatedData = [...prevData, newPanel];
        localStorage.setItem('userPanelData', JSON.stringify(updatedData));
        return updatedData;
      });

      showAlert('Panel Anda berhasil dibuat! Silakan cek di tab "Panel Saya".', 'success');

      if (purchaseFormRef.current) purchaseFormRef.current.reset();
      setUsername('');
      setPassword('');
      setLoading(false);
      setQrisImageUrl(null); // Sembunyikan QRIS
      setActiveTab('myPanels'); // Otomatis pindah ke tab Panel Saya
    }, 2000); // Simulasi delay pembuatan panel
  };

  // Reset UI untuk state pembayaran
  const resetPaymentUI = () => {
    if (paymentPollingRef.current) clearInterval(paymentPollingRef.current);
    if (qrisCountdownRef.current) clearInterval(qrisCountdownRef.current);

    setQrisTimeLeft(5 * 60); // Reset timer 5 menit
    setLoading(false);
    setQrisImageUrl(null); // Sembunyikan QRIS
    
    if (submitButtonRef.current) {
      submitButtonRef.current.disabled = false;
      submitButtonRef.current.textContent = 'Proses Pembelian';
    }
    if (qrisDisplayRef.current) qrisDisplayRef.current.classList.add('hidden');
    if (statusSectionRef.current) statusSectionRef.current.classList.add('hidden');
    if (purchaseFormRef.current) purchaseFormRef.current.reset();
    setUsername('');
    setPassword('');
  };

  // Update timer QRIS
  const updateQRIStimer = () => {
    setQrisTimeLeft(prevTime => {
      if (prevTime <= 0) {
        // Timer habis
        clearInterval(qrisCountdownRef.current);
        clearInterval(paymentPollingRef.current);
        showAlert('QRIS telah kedaluwarsa. Silakan mulai transaksi baru.', 'error');
        resetPaymentUI();
        return 0;
      }
      return prevTime - 1;
    });
  };

  // Simulasi polling status pembayaran
  const startPaymentPolling = () => {
    let checkAttempts = 0;
    const minChecksForConfirmation = 3; // Pembayaran akan dikonfirmasi setelah minimal 3 cek (6 detik)

    showAlert('Menunggu konfirmasi pembayaran otomatis...', 'info');
    if (qrisDisplayRef.current) qrisDisplayRef.current.classList.remove('hidden');

    setQrisTimeLeft(5 * 60); // Reset timer ke 5 menit
    if (qrisCountdownRef.current) clearInterval(qrisCountdownRef.current); // Hentikan timer sebelumnya
    qrisCountdownRef.current = setInterval(updateQRIStimer, 1000); // Mulai timer

    if (paymentPollingRef.current) clearInterval(paymentPollingRef.current); // Hentikan polling sebelumnya
    paymentPollingRef.current = setInterval(() => {
      checkAttempts++;

      // Simulasi "saldo masuk" hanya setelah waktu minimum dan dengan kemungkinan besar
      const isConfirmedInSimulation = (checkAttempts >= minChecksForConfirmation && Math.random() > 0.3);

      if (isConfirmedInSimulation) {
        clearInterval(paymentPollingRef.current);
        clearInterval(qrisCountdownRef.current); // Pastikan timer berhenti
        simulateCreatePanel();
      } else if (qrisTimeLeft <= 0) { // Jika timer sudah 0, proses akan direset oleh updateQRIStimer
        clearInterval(paymentPollingRef.current); // Hentikan polling jika sudah expired
      } else {
        showAlert(`Menunggu konfirmasi pembayaran otomatis...`, 'info');
      }
    }, 2000); // Cek setiap 2 detik
  };

  // Handler untuk submit form pembelian
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Pencegahan Duplikasi Username
    const isDuplicateUsername = panelData.some(panel =>
        panel.username === username
    );

    if (isDuplicateUsername) {
        showAlert('Username ini sudah terdaftar di panel Anda. Silakan gunakan username lain atau cek "Panel Saya".', 'error');
        setLoading(false);
        return;
    }

    if (submitButtonRef.current) {
      submitButtonRef.current.disabled = true;
      submitButtonRef.current.textContent = 'Memuat QRIS...';
    }
    
    resetPaymentUI(); // Reset UI pembayaran sebelum memulai yang baru

    showAlert('Membuat kode pembayaran Anda...', 'info');

    setTimeout(() => {
      setQrisImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(QRIS_ORDER_KUOTA)}`);
      if (qrisDisplayRef.current) qrisDisplayRef.current.classList.remove('hidden');
      if (statusSectionRef.current) statusSectionRef.current.classList.remove('hidden');
      startPaymentPolling();
      if (submitButtonRef.current) submitButtonRef.current.textContent = 'QRIS Ditampilkan';
    }, 1500);
  };

  // Navigasi Tab
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Tutup sidebar di mobile setelah klik
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Overlay for mobile sidebar */}
      <div id="sidebarOverlay" className={`overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Main Wrapper for Dashboard Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside id="sidebar" className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">👤</div>
              <div>
                <p className="font-bold text-gray-800">rikishop01</p>
                <p className="text-sm text-gray-600">081400337353</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <button className={`btn-sidebar w-full ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
              <span className="text-xl">🏠</span> Home
            </button>
            <button className={`btn-sidebar w-full ${activeTab === 'buyPanel' ? 'active' : ''}`} onClick={() => handleNavClick('buyPanel')}>
              <span className="text-xl">🛒</span> Beli Panel
            </button>
            <button className={`btn-sidebar w-full ${activeTab === 'myPanels' ? 'active' : ''}`} onClick={() => handleNavClick('myPanels')}>
              <span className="text-xl">🖥️</span> Panel Saya
            </button>
            <button className={`btn-sidebar w-full ${activeTab === 'info' ? 'active' : ''}`} onClick={() => handleNavClick('info')}>
              <span className="text-xl">ℹ️</span> Informasi Website
            </button>
            {/* Placeholder for other removed features, linking to a generic placeholder content */}
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">🔄</span> Transaksi
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">💰</span> Saldo
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">🔔</span> Pemberitahuan
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">📜</span> Daftar Harga
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">👥</span> Downline
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">✍️</span> Blog
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">📄</span> Ketentuan Layanan
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">❓</span> FAQ
            </button>
            <button className="btn-sidebar w-full" onClick={() => handleNavClick('placeholder')}>
                <span className="text-xl">📞</span> Hubungi Kami
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="main-content-wrapper">
          {/* Top Bar */}
          <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:justify-start lg:gap-4 z-10">
            <button className="text-gray-600 focus:outline-none lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <span className="text-2xl">&#x2261;</span>
            </button>
            <h1 className="text-xl font-bold text-gradient mx-auto lg:mx-0">PPOB Panel</h1>
            <span className="text-gray-500 text-sm lg:hidden">👤</span>
          </header>

          {/* Scrollable Content */}
          <div className="scrollable-content bg-gray-50">
            {/* Home Content */}
            {activeTab === 'home' && (
              <section id="contentHome" className="tab-content fade-in">
                <div className="dashboard-card p-8 text-center">
                  <h2 className="text-3xl font-bold text-gradient mb-4">Selamat Datang di PPOB Panel Otomatis</h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
                    Temukan kemudahan dalam mendapatkan panel hosting berkualitas tinggi. Proses otomatis, pembayaran instan, dan akses cepat untuk kebutuhan proyek digital Anda.
                  </p>
                  <blockquote className="text-base italic text-gray-500 mb-8">
                    "Masa depan milik mereka yang percaya pada keindahan mimpi-mimpi mereka." - Eleanor Roosevelt
                  </blockquote>
                  <button className="btn-primary font-bold py-3 px-6 rounded-lg text-lg" onClick={() => handleNavClick('buyPanel')}>
                    Mulai Beli Panel Sekarang!
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                  <div className="dashboard-card p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-2">⚡</span>
                    <p className="font-medium text-sm">Performa Cepat</p>
                  </div>
                  <div className="dashboard-card p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-2">🔒</span>
                    <p className="font-medium text-sm">Aman & Terpercaya</p>
                  </div>
                  <div className="dashboard-card p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-2">⏱️</span>
                    <p className="font-medium text-sm">Instan</p>
                  </div>
                  <div className="dashboard-card p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-2">📞</span>
                    <p className="font-medium text-sm">Dukungan</p>
                  </div>
                </div>
              </section>
            )}

            {/* Buy Panel Tab Content */}
            {activeTab === 'buyPanel' && (
              <section id="contentBuyPanel" className="tab-content fade-in">
                <div className="dashboard-card p-8">
                  <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Formulir Pembelian Panel</h2>
                  <form ref={purchaseFormRef} onSubmit={handlePurchaseSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">Username Panel Baru</label>
                      <input
                        type="text"
                        id="username"
                        ref={usernameInputRef}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Masukkan username pilihan Anda"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password Panel Baru</label>
                      <input
                        type="password"
                        id="password"
                        ref={passwordInputRef}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Buat password yang kuat"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" ref={submitButtonRef} className="w-full btn-primary font-bold py-3 px-4 rounded-lg" disabled={loading}>
                      {loading ? 'Memuat...' : 'Proses Pembelian'}
                    </button>
                  </form>

                  {/* Status and QR Code Display */}
                  <div ref={statusSectionRef} className={`text-center space-y-4 mt-8 ${alertMessage.text ? 'block' : 'hidden'} ${qrisImageUrl ? 'block' : 'hidden'}`}>
                    <div ref={alertMessageRef} className={`p-4 rounded-lg text-sm font-medium ${alertMessage.type === 'success' ? 'bg-green-100 text-green-800' : alertMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {alertMessage.text}
                    </div>
                    {qrisImageUrl && (
                      <div ref={qrisDisplayRef} className="dashboard-card p-6">
                        <h3 className="text-xl font-bold mb-2 text-green-700">Pindai untuk Membayar</h3>
                        <p className="text-gray-600 mb-4 text-sm">QRIS akan kedaluwarsa dalam {Math.floor(qrisTimeLeft / 60).toString().padStart(2, '0')}:{ (qrisTimeLeft % 60).toString().padStart(2, '0') }</p>
                        <Image src={qrisImageUrl} alt="QRIS Payment Code" width={200} height={200} className="mx-auto rounded-lg border-4 border-gray-200 w-48 h-48 md:w-64 md:h-64 object-contain" />
                        <p className="mt-4 text-sm text-gray-500">Menunggu konfirmasi pembayaran otomatis...</p>
                        <button className="mt-6 w-full btn-cancel font-bold py-3 px-4 rounded-lg" onClick={resetPaymentUI}>
                          Batalkan Pembayaran
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* My Panels Tab Content */}
            {activeTab === 'myPanels' && (
              <section id="contentMyPanels" className="tab-content fade-in">
                <div className="dashboard-card p-8">
                  <h2 className="text-2xl font-bold text-center mb-6 text-green-700">Panel Saya</h2>
                  <div id="panelDataSection">
                    <div id="panelContent" className={`space-y-6 ${panelData.length === 0 ? 'hidden' : ''}`}>
                      <div className="dashboard-card p-6 border-l-4 border-blue-500 bg-blue-50 bg-opacity-80 text-blue-800 shadow-md">
                        <h3 className="text-lg font-bold mb-2 text-blue-700">Informasi Penting & Garansi:</h3>
                        <ul className="list-none p-0 space-y-2 text-sm">
                          <li className="line-marker">Jangan menyalahgunakan panel untuk aktivitas ilegal (DDoS, spamming, mining, dll).</li>
                          <li className="line-marker">Jaga kerahasiaan link login dan kredensial panel Anda. Jangan sebarkan.</li>
                          <li className="line-marker">Garansi berlaku 15 hari dengan 1x penggantian (replace) jika ada masalah teknis yang bukan karena kesalahan pengguna.</li>
                          <li className="line-marker">Klaim garansi wajib menyertakan bukti transfer/pembayaran yang valid.</li>
                        </ul>
                      </div>
                      <div id="panelList" className="space-y-4">
                        {/* Panel data items will be injected here by JavaScript */}
                      </div>
                    </div>
                    <div id="noPanelsMessage" className={`text-center text-gray-500 p-8 dashboard-card ${panelData.length > 0 ? 'hidden' : 'block'}`}>
                      <p className="text-lg">Anda belum memiliki panel yang dibeli.</p>
                      <p className="mt-2">Silakan kunjungi tab "Beli Panel" untuk memulai.</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Information Website Tab Content */}
            {activeTab === 'info' && (
              <section id="contentInfo" className="tab-content fade-in">
                <div className="dashboard-card p-8">
                  <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Informasi Website</h2>

                  <div className="dashboard-card p-6 mb-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Tentang Website PPOB Panel Otomatis</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Kami adalah platform inovatif yang dirancang untuk menyederhanakan proses pembelian dan pengelolaan panel hosting. Dengan sistem otomatis kami, Anda dapat dengan mudah mendapatkan akses ke panel server berkualitas tinggi tanpa menunggu lama. Integrasi pembayaran melalui QRIS OrderKuota memastikan transaksi yang aman dan konfirmasi instan. Fokus kami adalah menyediakan solusi yang efisien, andal, dan user-friendly bagi para pengembang, pengusaha, dan siapa pun yang membutuhkan infrastruktur server yang cepat dan terkelola dengan baik.
                    </p>
                  </div>

                  <div className="dashboard-card p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 text-center">Spesifikasi Panel Kami</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-blue-800 flex items-center space-x-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h4 className="font-bold text-md mb-1">Performa Tinggi</h4>
                          <p className="text-sm">Didukung SSD NVMe dan CPU terbaru untuk kecepatan maksimal.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-green-800 flex items-center space-x-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <h4 className="font-bold text-md mb-1">Akses Penuh</h4>
                          <p className="text-sm">Kontrol panel yang intuitif dan akses root (opsional).</p>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-purple-800 flex items-center space-x-3">
                        <span className="text-2xl">🔊</span>
                        <div>
                          <h4 className="font-bold text-md mb-1">Dukungan 24/7</h4>
                          <p className="text-sm">Tim support siap membantu Anda kapan saja.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800 flex items-center space-x-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                          <h4 className="font-bold text-md mb-1">Keamanan Terjamin</h4>
                          <p className="text-sm">Proteksi DDoS dan firewall canggih.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-card p-6 text-center">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Informasi Kontak Admin</h3>
                    <p className="text-gray-700 max-w-xl mx-auto leading-relaxed mb-4">
                      Jika Anda memiliki pertanyaan, masalah, atau memerlukan bantuan, jangan ragu untuk menghubungi administrator kami. Kami siap membantu Anda.
                    </p>
                    <div className="text-lg font-medium text-gray-800 space-y-1">
                      <p><strong>Nama:</strong> Riki</p>
                      <p><strong>Email:</strong> admin@example.com</p>
{activeTab === 'contact' && (
  <section>
    <div>
      <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
    </div>
  </section>
)}

            {/* Placeholder for unused sidebar items (visible only when active) */}
            {activeTab === 'placeholder' && (
              <section id="contentPlaceholder" className="tab-content fade-in text-center p-8 dashboard-card">
                <h2 className="text-2xl font-bold mb-4 text-gray-700">Fitur Segera Hadir!</h2>
                <p className="text-gray-600">Bagian ini sedang dalam pengembangan. Nantikan pembaruan berikutnya!</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Chart Section (Outside main dashboard grid for full width) */}
      <section className="mt-8 md:mt-16 container mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Analitik Penjualan Panel</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Tinjauan singkat aktivitas penjualan panel selama seminggu terakhir (data contoh dan bersifat hipotetis).</p>
        </div>
        <div className="dashboard-card p-4 md:p-6">
          <div className="chart-container">
            <canvas id="salesChart"></canvas>
          </div>
        </div>
      </section>

      {/* Footer */}
</section>
            )}
          </div>
        </div>
      </div> {/* ← Tutup .flex.flex-1 */}
      <footer className="text-center text-gray-500 mt-auto p-4 text-sm bg-white border-t border-gray-100">
        <p>&copy; <span id="currentYear"></span> PPOB Panel Otomatis. Semua Hak Dilindungi.</p>
        <p className="mt-1">Melayani Kebutuhan Panel Hosting Anda dengan Cepat dan Aman.</p>
      </footer>
    </div> {/* ← Tutup .flex.flex-col.min-h-screen */}
  );
}

// Fungsi renderChart di luar komponen React karena Chart.js langsung memanipulasi DOM
function renderChart(canvasElement) {
  const ctx = canvasElement.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(label => {
        if (label.length > 16) {
          return label.match(/.{1,16}/g);
        }
        return label;
      }),
      datasets: [{
        label: 'Jumlah Penjualan Panel',
        data: [18, 25, 12, 30, 20, 28, 35],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Jumlah Penjualan'
          }
        },
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'Hari'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          backgroundColor: '#222',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(context) {
              const label = context[0].label;
              if (Array.isArray(label)) {
                return label;
              }
              if (label && label.length > 16) {
                return label.match(/.{1,16}/g);
              }
              return `Hari: ${label}`;
            },
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + ' Panel';
              }
              return label;
            }
          }
        }
      }
    }
  });
}

