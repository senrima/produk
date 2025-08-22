// ===============================================================
// == JAVASCRIPT CHECKOUT DENGAN STRUKTUR ANTI GAGAL (FINAL V2) ==
// ===============================================================

// --- Variabel Penanda (Flags) ---
let isDomReady = false;
let isGsiReady = false;

/**
 * Callback yang dipanggil oleh skrip Google setelah selesai dimuat.
 */
function googleScriptLoaded() {
    isGsiReady = true;
    tryStartApp();
}

/**
 * Event listener yang dijalankan setelah halaman HTML selesai dimuat.
 */
document.addEventListener('DOMContentLoaded', () => {
    isDomReady = true;
    tryStartApp();
});

/**
 * "Gerbang Utama" yang hanya berjalan jika DOM dan Google Script sudah siap.
 */
function tryStartApp() {
    // Hanya jalankan sekali
    if (isDomReady && isGsiReady && !window.appInitialized) {
        window.appInitialized = true; // Tandai bahwa aplikasi sudah dimulai
        initializeApp();
    }
}

/**
 * Fungsi inisialisasi utama yang berisi semua logika aplikasi.
 */
function initializeApp() {
    console.log("DOM dan Google GSI siap. Menjalankan aplikasi...");

    // ---------------------------------------------------------------
    // -- SELEKSI DOM & STATE
    // ---------------------------------------------------------------
    const API_URL = 'https://api.senrima.web.id';
    const paymentOptionsContainer = document.getElementById('payment-options-container');
    const cartItemsSummary = document.getElementById('cart-items-summary');
    const userDetailsStep = document.getElementById('user-details-step');
    const tokenVerificationStep = document.getElementById('token-verification-step');
    const verificationSuccessMessage = document.getElementById('verification-success-message');
    const paymentMethodStep = document.getElementById('payment-method-step');
    const fullNameInput = document.getElementById('full_name');
    const emailInput = document.getElementById('email');
    const sendTokenBtn = document.getElementById('send-token-btn');
    const tokenInput = document.getElementById('token');
    const verifyTokenBtn = document.getElementById('verify-token-btn');
    const tokenFeedback = document.getElementById('token-feedback');
    const payNowBtn = document.getElementById('pay-now-btn');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponCodeInput = document.getElementById('coupon_code');
    const couponFeedback = document.getElementById('coupon-feedback');
    const subtotalEl = document.getElementById('subtotal-amount');
    const discountEl = document.getElementById('discount-amount');
    const serviceFeeEl = document.getElementById('service-fee');
    const totalEl = document.getElementById('total-amount');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const GOOGLE_CLIENT_ID = '140122260876-rea6sfsmcd32acgie6ko7hrr2rj65q6v.apps.googleusercontent.com';

    var orderData = {
        items: [], kodeKupon: '', diskon: 0, biayaLayanan: 5000,
        totalPembayaran: 0, namaPembeli: '', emailPembeli: '',
        metodePembayaran: '', verifikasiVia: 'otp'
    };

    // ---------------------------------------------------------------
    // -- DEKLARASI SEMUA FUNGSI APLIKASI
    // ---------------------------------------------------------------
    
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    
    const updateSummary = () => {
        const itemsToCalculate = Array.isArray(orderData.items) ? orderData.items : [];
        const subtotal = itemsToCalculate.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        const discount = orderData.diskon;
        if (discount >= subtotal && subtotal > 0) {
            orderData.biayaLayanan = 0;
        } else {
            orderData.biayaLayanan = parseFloat(serviceFeeEl.getAttribute('data-fee')) || 5000;
        }
        const serviceFee = orderData.biayaLayanan;
        const total = subtotal - discount + serviceFee;
        orderData.totalPembayaran = total < 0 ? 0 : total;
        subtotalEl.textContent = formatCurrency(subtotal);
        discountEl.textContent = `- ${formatCurrency(discount)}`;
        serviceFeeEl.textContent = formatCurrency(serviceFee);
        totalEl.textContent = formatCurrency(orderData.totalPembayaran);
        
        const paymentGroups = document.querySelectorAll('.payment-group');
        const transferRadio = document.getElementById('payment-TRANSFER');
        if (orderData.totalPembayaran <= 0 && subtotal > 0) {
            paymentGroups.forEach(group => {
                const radio = group.querySelector('input[name="payment_method"]');
                if (radio && radio.value !== 'TRANSFER') group.classList.add('hidden');
            });
            if(transferRadio) transferRadio.checked = true;
            orderData.metodePembayaran = 'TRANSFER';
            payNowBtn.textContent = 'Klaim & Selesaikan';
        } else {
            paymentGroups.forEach(group => group.classList.remove('hidden'));
            payNowBtn.textContent = 'Bayar Sekarang';
        }
    };

    function renderCartSummary() {
        const cart = getCart();
        if (!cart || cart.length === 0) {
            alert('Keranjang Anda kosong. Anda akan diarahkan kembali.');
            window.location.href = 'https://s-tools.id/produk/';
            return;
        }
        orderData.items = cart;
        cartItemsSummary.innerHTML = '';
        cart.forEach(item => {
            const itemHTML = `<div class="flex items-center justify-between gap-4"><div class="flex items-center gap-4"><img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover"><div><h3 class="font-semibold text-gray-800">${item.name}</h3><p class="text-sm text-gray-500">${item.id}</p></div></div><p class="font-semibold text-gray-800">${formatCurrency((item.price || 0) * (item.quantity || 1))}</p></div>`;
            cartItemsSummary.innerHTML += itemHTML;
        });
        updateSummary();
    }

    function transitionToVerifiedState() {
        sendTokenBtn.classList.add('hidden');
        if (googleLoginBtn.previousElementSibling) {
            googleLoginBtn.previousElementSibling.classList.add('hidden');
        }
        googleLoginBtn.classList.add('hidden');
        userDetailsStep.disabled = true;
        userDetailsStep.classList.remove('hidden');
        tokenVerificationStep.classList.add('hidden');
        tokenVerificationStep.disabled = true;
        verificationSuccessMessage.classList.remove('hidden');
        paymentMethodStep.disabled = false;
        payNowBtn.disabled = false;
    }
    
    async function handleCredentialResponse(response) {
        googleLoginBtn.disabled = true;
        googleLoginBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Memverifikasi...`;
        try {
            const responsePayload = JSON.parse(atob(response.credential.split('.')[1]));
            fullNameInput.value = responsePayload.name;
            emailInput.value = responsePayload.email;
            orderData.namaPembeli = responsePayload.name;
            orderData.emailPembeli = responsePayload.email;
            orderData.verifikasiVia = 'google';
            const registrationPayload = { kontrol: 'proteksi', action: 'kirimotpbayar', email: responsePayload.email, nama: responsePayload.name };
            const registrationResponse = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(registrationPayload) });
            const registrationResult = await registrationResponse.json();
            if (!registrationResponse.ok || registrationResult.status !== 'sukses') {
                throw new Error(registrationResult.message || 'Gagal mendaftarkan email ke server.');
            }
            console.log("Email berhasil didaftarkan di server via Google Login.");
            transitionToVerifiedState();
        } catch (error) {
            console.error("Error selama verifikasi Google:", error);
            alert("Terjadi kesalahan saat verifikasi dengan Google: " + error.message);
            googleLoginBtn.disabled = false;
            googleLoginBtn.innerHTML = `<svg class="w-5 h-5 mr-2" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.64,9.2c0-.63-.06-1.25-.16-1.84H9.18v3.48h4.74c-.2,1.13-.83,2.08-1.78,2.72v2.26h2.9c1.7-1.56,2.68-3.87,2.68-6.62Z" fill="#4285F4"></path><path d="M9.18,18c2.43,0,4.47-.8,5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35,0-4.35-1.58-5.06-3.71H1.1v2.33C2.54,16.27,5.61,18,9.18,18Z" fill="#34A853"></path><path d="M4.12,10.71a5.37,5.37,0,0,1,0-3.42V4.96H1.1A8.99,8.99,0,0,0,0,9a8.99,8.99,0,0,0,1.1,4.04l3.02-2.33Z" fill="#FBBC05"></path><path d="M9.18,3.54c1.32,0,2.52.46,3.46,1.36l2.58-2.58C13.65.8,11.61,0,9.18,0,5.61,0,2.54,1.73,1.1,4.96l3.02,2.33C4.83,5.12,6.83,3.54,9.18,3.54Z" fill="#EA4335"></path></svg>Login dengan Google`;
        }
    }

    function renderPaymentMethods() {
        paymentOptionsContainer.innerHTML = '';
        let groupIndex = 0;
        for (const [groupName, groupDetails] of Object.entries(PAYMENT_METHODS)) {
            groupIndex++;
            const hasOptions = groupDetails.providers.length > 1;
            const mainProvider = groupDetails.providers[0];
            const radioId = `payment-${mainProvider.code}`;
            const dropdownContainerId = `options-list-${groupIndex}`;
            const isDisabled = mainProvider.disabled;
            let optionsHTML = '';
            if (hasOptions) {
                let selectOptions = `<option value="" disabled selected>Pilih Opsi</option>`;
                groupDetails.providers.forEach(provider => { selectOptions += `<option value="${provider.code}">${provider.name}</option>`; });
                optionsHTML = `<div id="${dropdownContainerId}" class="payment-options-list"><select class="payment-dropdown w-full p-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-indigo-500 focus:border-indigo-500">${selectOptions}</select></div>`;
            }
            const itemHTML = `<div class="payment-group border rounded-lg overflow-hidden has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}"><label for="${radioId}" class="flex items-center p-4 cursor-pointer"><input type="radio" id="${radioId}" name="payment_method" value="${mainProvider.code}" class="h-4 w-4 text-indigo-600" ${isDisabled ? 'disabled' : ''} data-has-options="${hasOptions}" data-target="${dropdownContainerId}"><span class="ml-3 font-medium text-gray-800">${groupName}</span></label>${optionsHTML}</div>`;
            paymentOptionsContainer.innerHTML += itemHTML;
        }
    }

    async function handleFinalPayment(event) {
        event.preventDefault();
        payNowBtn.disabled = true;
        payNowBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Memproses...`;
        if (orderData.verifikasiVia !== 'google') {
            orderData.namaPembeli = fullNameInput.value;
            orderData.emailPembeli = emailInput.value;
        }
        const payload = { kontrol: 'proteksi', action: 'buatinvoice', data: orderData };
        try {
            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (response.ok && (result.status === 'sukses' || result.status === 'success') && result.paymentLink) {
                clearCart();
                window.location.href = result.paymentLink;
            } else {
                alert(result.message || 'Gagal membuat invoice. Silakan coba lagi.');
                payNowBtn.disabled = false;
                payNowBtn.textContent = orderData.totalPembayaran <= 0 ? 'Klaim & Selesaikan' : 'Bayar Sekarang';
            }
        } catch (error) {
            console.error("Gagal memproses pembayaran:", error);
            alert('Terjadi kesalahan. Silakan coba beberapa saat lagi.');
            payNowBtn.disabled = false;
            payNowBtn.textContent = orderData.totalPembayaran <= 0 ? 'Klaim & Selesaikan' : 'Bayar Sekarang';
        }
    };

    // ---------------------------------------------------------------
    // -- INISIALISASI GOOGLE & EVENT LISTENERS
    // ---------------------------------------------------------------
    
    // Inisialisasi Google Sign-In
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });

    googleLoginBtn.addEventListener('click', () => {
        google.accounts.id.prompt();
    });
    
    sendTokenBtn.addEventListener('click', async () => {
            if (fullNameInput.value.trim() === '' || emailInput.value.trim() === '') {
                alert('Nama dan Email harus diisi.');
                return;
            }

            sendTokenBtn.disabled = true;
            sendTokenBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Mengirim...`;
            
            var payload = {
                kontrol: 'proteksi',
                action: 'kirimotpbayar',
                email: emailInput.value,
                nama: fullNameInput.value
            };

            try {
                var response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                var result = await response.json();
                if (response.ok && result.status === 'sukses') {
                    userDetailsStep.disabled = true; 
                    sendTokenBtn.classList.add('hidden'); 

                    if (googleLoginBtn.previousElementSibling) {
                        googleLoginBtn.previousElementSibling.classList.add('hidden'); // Sembunyikan divider "Atau"
                    }
                    googleLoginBtn.classList.add('hidden');
                    
                    tokenVerificationStep.classList.remove('hidden');
                    tokenFeedback.textContent = `OTP telah dikirim ke ${emailInput.value}`;
                    tokenFeedback.classList.add('text-blue-600');
                } else {
                    alert(result.message || 'Gagal mengirim OTP. Silakan coba lagi.');
                    sendTokenBtn.disabled = false;
                    sendTokenBtn.innerHTML = 'Kirim OTP ke Email';
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan jaringan. Periksa koneksi Anda dan coba lagi.');
                sendTokenBtn.disabled = false;
                sendTokenBtn.innerHTML = 'Kirim OTP ke Email';
            }
    });

    verifyTokenBtn.addEventListener('click', async () => {
            if (tokenInput.value.trim() === '') {
                alert('Kode OTP harus diisi.');
                return;
            }
            
            verifyTokenBtn.disabled = true;
            verifyTokenBtn.innerHTML = 'Memverifikasi...';

            var payload = {
                kontrol: 'proteksi',
                action: 'cekotpbayar',
                email: emailInput.value,
                otp: tokenInput.value
            };
            
            try {
                var response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                var result = await response.json();
                if (response.ok && result.status === 'sukses') {
                    // Cukup panggil fungsi baru kita
                    transitionToVerifiedState();
                } else {
                    tokenFeedback.textContent = result.message || 'OTP salah. Silakan coba lagi.';
                    tokenFeedback.classList.remove('text-green-600', 'text-blue-600');
                    tokenFeedback.classList.add('text-red-500');
                    verifyTokenBtn.disabled = false;
                    verifyTokenBtn.innerHTML = 'Verifikasi OTP';
                }
            } catch(error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan jaringan saat verifikasi.');
                verifyTokenBtn.disabled = false;
                verifyTokenBtn.innerHTML = 'Verifikasi OTP';
            }
    });

    applyCouponBtn.addEventListener('click', async () => {
            var code = couponCodeInput.value.trim();
            if (!code) {
                alert('Silakan masukkan kode kupon.');
                return;
            }

            applyCouponBtn.disabled = true;
            applyCouponBtn.textContent = '...';
            couponFeedback.textContent = '';

            var payload = {
                kontrol: 'proteksi',
                action: 'cekkupon',
                kodeKupon: code
            };

            try {
                var response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                var result = await response.json();

                if (response.ok && result.status === 'sukses') {
                    var coupon = result.data;
                    orderData.diskon = (coupon.tipe === 'fixed') ? parseFloat(coupon.nilai) : orderData.items.reduce((sum, item) => sum + item.price, 0) * parseFloat(coupon.nilai);
                    orderData.kodeKupon = code;
                    couponFeedback.textContent = `Kupon "${code}" berhasil diterapkan!`;
                    couponFeedback.classList.add('text-green-600');
                    couponFeedback.classList.remove('text-red-500');
                } else {
                    throw new Error(result.message || 'Kupon tidak valid.');
                }
            } catch (error) {
                orderData.diskon = 0;
                orderData.kodeKupon = '';
                couponFeedback.textContent = error.message;
                couponFeedback.classList.add('text-red-500');
                couponFeedback.classList.remove('text-green-600');
            } finally {
                updateSummary();
                applyCouponBtn.disabled = false;
                applyCouponBtn.textContent = 'Terapkan';
            }
    });
        
    document.getElementById('payment-form').addEventListener('submit', handleFinalPayment);

    paymentOptionsContainer.addEventListener('change', function(event) {
        const selectedRadio = event.target;
        if (selectedRadio.name === 'payment_method') {
            document.querySelectorAll('.payment-options-list').forEach(list => { list.classList.remove('options-list-visible'); });
            if (selectedRadio.dataset.hasOptions === 'true') {
                const targetId = selectedRadio.dataset.target;
                document.getElementById(targetId).classList.add('options-list-visible');
                orderData.metodePembayaran = '';
            } else {
                orderData.metodePembayaran = selectedRadio.value;
            }
        }
        if (selectedRadio.classList.contains('payment-dropdown')) {
            orderData.metodePembayaran = selectedRadio.value;
        }
    });

    // ---------------------------------------------------------------
    // -- PEMANGGILAN FUNGSI AWAL
    // ---------------------------------------------------------------
    renderCartSummary();
    renderPaymentMethods();

    console.log("Aplikasi Checkout berhasil diinisialisasi.");
}
