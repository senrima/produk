// ===============================================================
// == JAVASCRIPT LENGKAP UNTUK HALAMAN VIEW PRODUK (VERSI FINAL) ==
// ===============================================================

// Bagian ini dijalankan setelah seluruh struktur halaman siap
document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------------
    // -- SELEKSI ELEMEN DOM
    // ---------------------------------------------------------------
    const API_URL = 'https://api.s-tools.id';
    const productGrid = document.getElementById('product-grid');
    const loadingMessage = document.getElementById('loading-message');
    const searchInput = document.getElementById('search-input');
    const refreshBtn = document.getElementById('refresh-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // ---------------------------------------------------------------
    // -- FUNGSI-FUNGSI UTAMA
    // ---------------------------------------------------------------

    /**
     * Mengambil produk dari API dan menyimpannya ke sessionStorage
     * @param {boolean} forceRefresh - Jika true, paksa ambil data baru dari API
     */
    async function fetchAndCacheProducts(forceRefresh = false) {
        loadingMessage.style.display = 'block';
        loadingMessage.textContent = 'Memuat produk...';
        productGrid.innerHTML = ''; // Kosongkan grid saat memuat

        // Cek cache dulu, kecuali jika dipaksa refresh
        const cachedAllProducts = sessionStorage.getItem('allProducts');
        if (cachedAllProducts && !forceRefresh) {
            console.log("Memuat produk dari cache...");
            renderProducts(JSON.parse(cachedAllProducts));
            return;
        }

        console.log("Mengambil produk baru dari API...");
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ kontrol: 'proteksi', action: 'getallproduk' })
            });
            const result = await response.json();

            if (response.ok && result.status === 'sukses') {
                const products = result.data || [];
                
                sessionStorage.setItem('allProducts', JSON.stringify(products));

                const categorizedProducts = products.reduce((acc, product) => {
                    const category = product.Kategori.toLowerCase();
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(product);
                    return acc;
                }, {});
                sessionStorage.setItem('categorizedProducts', JSON.stringify(categorizedProducts));

                renderProducts(products);
            } else {
                throw new Error(result.message || 'Gagal memuat produk.');
            }
        } catch (error) {
            console.error("Error:", error);
            loadingMessage.textContent = `Error: ${error.message}`;
        }
    }

    /**
     * Menampilkan produk ke dalam grid
     * @param {Array} products - Array berisi objek produk
     */
    function renderProducts(products) {
        loadingMessage.style.display = 'none';
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">Produk tidak ditemukan.</p>';
            return;
        }

      //  window.allProductsData = products; 
        
        products.forEach(product => {
            productGrid.innerHTML += createProductCard(product);
        });

        reinitializeEventListeners();
    }

    /**
     * Membuat HTML untuk satu kartu produk.
     */
    function createProductCard(product) {
        const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.Harga);

        const isOutOfStock = !product.Stok || product.Stok <= 0;
        
        const disabledAttribute = isOutOfStock ? 'disabled' : '';
        const buttonText = isOutOfStock ? 'Stok Habis' : (product.TombolTeks || 'Beli Sekarang');
        const buttonClasses = isOutOfStock 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700';
        const stockLabel = isOutOfStock 
            ? `<div class="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">Stok Habis</div>` 
            : '';
        
        const productData = { id: product.IDProduk, name: product.NamaProduk, price: product.Harga, image: product.GambarURL, category: product.Kategori, waktuAkses: product.WaktuAkses };
        const productDataString = JSON.stringify(productData);
        const videoButtonHTML = product.VideoID ? `<button class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 open-modal" data-video-id="${product.VideoID}"><svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg></button>` : '';
        const buttonsHTML = `
            <div class="mt-auto pt-4 space-y-3">
                <div class="flex items-center gap-3">
                    <button 
                        onclick='addToCart(${productDataString})' 
                        class="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors" 
                        title="Tambah ke Keranjang">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>
                    <button 
                        onclick='buyNow(${productDataString})' 
                        class="flex-grow block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">${product.TombolTeks}
                    </button>
                </div>
                <a href="${product.LandingPageURL}" target="_blank" class="block w-full text-center text-indigo-600 font-semibold py-2 rounded-lg hover:bg-indigo-50 transition-colors text-sm">Pelajari Selengkapnya</a>
            </div>`;
        return `<div class="product-card flex flex-col bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-indigo-500 transition-all duration-300" data-category="${product.Kategori.toLowerCase()}"><div class="relative mb-4 overflow-hidden rounded-lg group"><img src="${product.GambarURL}" alt="Gambar ${product.NamaProduk}" class="w-full h-auto transform group-hover:scale-105 transition-transform duration-300">${videoButtonHTML}</div><div class="flex flex-col flex-grow"><p class="text-3xl font-bold text-gray-900">${priceFormatted}</p><span class="text-sm font-semibold text-indigo-600 mt-2">${product.SubKategori}</span><h3 class="text-2xl font-bold text-gray-900 mt-1">${product.NamaProduk}</h3><p class="text-gray-600 my-3 flex-grow">${product.Deskripsi}</p></div>${buttonsHTML}</div>`;
    }

    /**
     * Memasang ulang event listener untuk elemen dinamis.
     */
    function reinitializeEventListeners() {
        const openModalButtons = document.querySelectorAll('.open-modal');
        const closeModalButton = document.getElementById('close-modal');
        const modalOverlay = document.getElementById('video-modal-overlay');
        const videoIframe = document.getElementById('video-iframe');
        if (!modalOverlay) return;
        const openModal = (videoId) => { videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`; modalOverlay.classList.remove('hidden'); document.body.style.overflow = 'hidden'; setTimeout(() => { modalOverlay.style.opacity = '1'; }, 10); };
        const closeModal = () => { modalOverlay.style.opacity = '0'; document.body.style.overflow = 'auto'; setTimeout(() => { modalOverlay.classList.add('hidden'); videoIframe.src = ''; }, 300); };
        openModalButtons.forEach(button => { button.replaceWith(button.cloneNode(true)); });
        document.querySelectorAll('.open-modal').forEach(button => { button.addEventListener('click', () => { const videoId = button.getAttribute('data-video-id'); openModal(videoId); }); });
        if (closeModalButton) closeModalButton.onclick = closeModal;
        if (modalOverlay) modalOverlay.onclick = (event) => { if (event.target === modalOverlay) closeModal(); };
        document.onkeydown = (event) => { if (event.key === 'Escape' && !modalOverlay.classList.contains('hidden')) closeModal(); };
    }

    // ---------------------------------------------------------------
    // -- EVENT LISTENERS
    // ---------------------------------------------------------------
    filterButtons.forEach(button => {
        button.addEventListener('click', () => { 
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            const allProducts = JSON.parse(sessionStorage.getItem('allProducts')) || [];
            const categorizedProducts = JSON.parse(sessionStorage.getItem('categorizedProducts')) || {};
            searchInput.value = '';
            if (filter === 'all') { renderProducts(allProducts); }
            else if (categorizedProducts[filter]) { renderProducts(categorizedProducts[filter]); }
            else { renderProducts([]); }
        });
    });

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const allProducts = JSON.parse(sessionStorage.getItem('allProducts')) || [];
            const query = searchInput.value.toLowerCase().trim();
            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            if (!query) { renderProducts(allProducts); return; }
            const filtered = allProducts.filter(product => product.NamaProduk.toLowerCase().includes(query));
            renderProducts(filtered);
        }, 300);
    });
    
    // Listener untuk tombol segarkan (hanya untuk klik manual)
    refreshBtn.addEventListener('click', () => {
        const refreshIcon = refreshBtn.querySelector('svg');
        refreshIcon.classList.add('animate-spin');
        refreshBtn.disabled = true;
        
        sessionStorage.removeItem('allProducts');
        sessionStorage.removeItem('categorizedProducts');
        
        fetchAndCacheProducts(true).finally(() => {
            refreshIcon.classList.remove('animate-spin');
            refreshBtn.disabled = false;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            searchInput.value = '';
        });
    });

    // ---------------------------------------------------------------
    // -- INISIALISASI HALAMAN (BAGIAN YANG DIPERBARUI)
    // ---------------------------------------------------------------
    
    /**
     * Fungsi inisialisasi baru untuk mengatur pemuatan halaman
     */
    async function initializePage() {
        const cachedProducts = sessionStorage.getItem('allProducts');
        
        if (!cachedProducts) {
            // JIKA CACHE KOSONG: Segarkan otomatis
            console.log("Cache kosong, menjalankan refresh otomatis...");
            const refreshIcon = refreshBtn.querySelector('svg');
            refreshIcon.classList.add('animate-spin');
            refreshBtn.disabled = true;

            await fetchAndCacheProducts(true); // Tunggu sampai data selesai dimuat

            refreshIcon.classList.remove('animate-spin');
            refreshBtn.disabled = false;
        } else {
            // JIKA CACHE ADA: Langsung muat dari cache
            await fetchAndCacheProducts();
        }

        // Pastikan fungsi keranjang dipanggil setelah data produk ada
        if (typeof updateCartIcon === 'function') {
            updateCartIcon();
        }
    }

    // Panggil fungsi inisialisasi baru saat halaman dimuat
    initializePage();
});



