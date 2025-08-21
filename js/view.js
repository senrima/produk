        const API_URL = 'https://api.senrima.web.id';
        const productGrid = document.getElementById('product-grid');
        const loadingMessage = document.getElementById('loading-message');

        function createProductCard(product) {
            const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.Harga);
            
            const productData = {
                id: product.IDProduk,
                name: product.NamaProduk,
                price: product.Harga,
                image: product.GambarURL,
                category: product.Kategori,
                waktuAkses: product.WaktuAkses
            };
            const productDataString = JSON.stringify(productData);

            const videoButtonHTML = product.VideoID ? `
                <button class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 open-modal" data-video-id="${product.VideoID}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                </button>
            ` : '';

            const buttonsHTML = `
                <div class="mt-auto pt-4 space-y-3">
                    <div class="flex items-center gap-3">
                        <button onclick='addToCart(${productDataString})' class="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors" title="Tambah ke Keranjang">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </button>
                        <button onclick='buyNow(${productDataString})' class="flex-grow block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            ${product.TombolTeks}
                        </button>
                    </div>
                    <a href="${product.LandingPageURL}" target="_blank" class="block w-full text-center text-indigo-600 font-semibold py-2 rounded-lg hover:bg-indigo-50 transition-colors text-sm">
                        Pelajari Selengkapnya
                    </a>
                </div>
            `;

            return `
                <div class="product-card flex flex-col bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-indigo-500 transition-all duration-300" data-category="${product.Kategori.toLowerCase()}">
                    <div class="relative mb-4 overflow-hidden rounded-lg group">
                        <img src="${product.GambarURL}" alt="Gambar ${product.NamaProduk}" class="w-full h-auto transform group-hover:scale-105 transition-transform duration-300">
                        ${videoButtonHTML}
                    </div>
                    <div class="flex flex-col flex-grow">
                        <p class="text-3xl font-bold text-gray-900">${priceFormatted}</p>
                        <span class="text-sm font-semibold text-indigo-600 mt-2">${product.SubKategori}</span>
                        <h3 class="text-2xl font-bold text-gray-900 mt-1">${product.NamaProduk}</h3>
                        <p class="text-gray-600 my-3 flex-grow">${product.Deskripsi}</p>
                    </div>
                    ${buttonsHTML}
                </div>
            `;
        }

        async function fetchAndRenderProducts() {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ kontrol: 'proteksi', action: 'getallproduk' })
                });
                const result = await response.json();

                if (response.ok && result.status === 'sukses') {
                    loadingMessage.style.display = 'none';
                    if (result.data.length > 0) {
                        result.data.forEach(product => {
                            productGrid.innerHTML += createProductCard(product);
                        });
                        reinitializeEventListeners();
                    } else {
                        loadingMessage.textContent = 'Belum ada produk yang tersedia.';
                        loadingMessage.style.display = 'block';
                    }
                } else {
                    throw new Error(result.message || 'Gagal memuat produk.');
                }
            } catch (error) {
                console.error("Error:", error);
                loadingMessage.textContent = `Error: ${error.message}`;
            }
        }

        function reinitializeEventListeners() {
            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            if(menuBtn && mobileMenu) {
                 menuBtn.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }

            const openModalButtons = document.querySelectorAll('.open-modal');
            const closeModalButton = document.getElementById('close-modal');
            const modalOverlay = document.getElementById('video-modal-overlay');
            const videoIframe = document.getElementById('video-iframe');

            const openModal = (videoId) => {
                videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                modalOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                setTimeout(() => { modalOverlay.style.opacity = '1'; }, 10);
            };

            const closeModal = () => {
                modalOverlay.style.opacity = '0';
                document.body.style.overflow = 'auto';
                setTimeout(() => {
                    modalOverlay.classList.add('hidden');
                    videoIframe.src = '';
                }, 300);
            };

            openModalButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-video-id');
                    openModal(videoId);
                });
            });

            if(closeModalButton) closeModalButton.addEventListener('click', closeModal);
            if(modalOverlay) modalOverlay.addEventListener('click', (event) => {
                if (event.target === modalOverlay) closeModal();
            });
            
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && !modalOverlay.classList.contains('hidden')) closeModal();
            });

            const filterButtons = document.querySelectorAll('.filter-btn');
            const productCards = document.querySelectorAll('.product-card');

            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    const filter = button.getAttribute('data-filter');
                    productCards.forEach(card => {
                        if (filter === 'all' || card.getAttribute('data-category') === filter) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            fetchAndRenderProducts();
            updateCartIcon();
        });
