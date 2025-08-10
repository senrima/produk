/**
 * Fungsi untuk mengambil data keranjang dari localStorage.
 * @returns {Array} Array berisi produk di keranjang.
 */
function getCart() {
    const cart = localStorage.getItem('s-tools-cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Fungsi untuk menyimpan data keranjang ke localStorage.
 * @param {Array} cart Array berisi produk di keranjang.
 */
function saveCart(cart) {
    localStorage.setItem('s-tools-cart', JSON.stringify(cart));
}

/**
 * Fungsi untuk menambahkan produk ke keranjang.
 * @param {object} product Objek produk yang akan ditambahkan.
 */
function addToCart(product) {
    let cart = getCart();
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        alert('Produk ini sudah ada di keranjang Anda.');
    } else {
        cart.push({ ...product, quantity: 1 });
        saveCart(cart);
        showCartNotification();
        updateCartIcon();
    }
}

/**
 * Fungsi untuk membeli produk secara langsung (Beli Sekarang).
 * @param {object} product Objek produk yang akan dibeli.
 */
function buyNow(product) {
    // Kosongkan keranjang, lalu tambahkan hanya produk ini.
    const singleItemCart = [{ ...product, quantity: 1 }];
    saveCart(singleItemCart);
    // Langsung arahkan ke halaman checkout.
    window.location.href = 'checkout-mlt.html';
}

/**
 * Fungsi untuk menghapus produk dari keranjang.
 * @param {string} productId ID produk yang akan dihapus.
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartPage(); // Render ulang halaman keranjang
    updateCartIcon();
}

/**
 * Fungsi untuk memperbarui ikon keranjang di header.
 */
function updateCartIcon() {
    const cartCountDesktop = document.getElementById('cart-count-desktop');
    const cartCountMobile = document.getElementById('cart-count-mobile');
    const count = getCart().length;
    if (cartCountDesktop) cartCountDesktop.textContent = count;
    if (cartCountMobile) cartCountMobile.textContent = count;
}

/**
 * Fungsi untuk menampilkan notifikasi "Ditambahkan ke keranjang".
 */
function showCartNotification() {
    const notification = document.getElementById('cart-notification');
    if (notification) {
        notification.classList.remove('translate-x-full');
        setTimeout(() => {
            notification.classList.add('translate-x-full');
        }, 2000);
    }
}

/**
 * Fungsi untuk merender konten di halaman keranjang.html.
 */
function renderCartPage() {
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return; // Hanya berjalan di halaman keranjang

    const cart = getCart();
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-12">
                <p class="text-xl text-gray-600 mb-4">Keranjang belanja Anda kosong.</p>
                <a href="view.html" class="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700">Mulai Belanja</a>
            </div>
        `;
        return;
    }

    let itemsHTML = '<div class="space-y-6">';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        itemsHTML += `
            <div class="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div class="flex items-center gap-4">
                    <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-lg object-cover">
                    <div>
                        <h3 class="font-semibold text-gray-800">${item.name}</h3>
                        <p class="text-gray-600">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 font-semibold">&times;</button>
            </div>
        `;
    });

    itemsHTML += '</div>';

    const summaryHTML = `
        <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>Rp ${total.toLocaleString('id-ID')}</span>
            </div>
            <a href="checkout-mlt.html" class="block w-full text-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg text-lg hover:opacity-90 transition-opacity mt-6">
                Lanjutkan ke Checkout
            </a>
        </div>
    `;

    cartContainer.innerHTML = itemsHTML + summaryHTML;
}

