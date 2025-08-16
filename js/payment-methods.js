
// ---------------------------------------------------------------
// -- PENGATURAN & KONSTANTA
// ---------------------------------------------------------------

const PAYMENT_METHODS = {
  "Transfer": {
    isDirect: true,
    providers: [
      { name: "Transfer Bank", code: "TRANSFER" }
    ]
  },
  "QRIS": {
    isDirect: true,
    providers: [
      { name: "QRIS (segera hadir)", code: "QRIS", disabled: true }
    ]
  },
  "Virtual Account": {
    isDirect: false,
    providers: [
      { name: "Bank BRI (segera hadir)", code: "VA_BRI_xx", disabled: true }, // Sesuaikan kode 'xx' jika perlu
      { name: "Bank BNI (segera hadir)", code: "VA_BNI_yy", disabled: true }, // Sesuaikan kode 'yy' jika perlu
    ]
  },
  "E-Wallet": {
    isDirect: false,
    providers: [
      { name: "GoPay (segera hadir)", code: "EWALLET_GOPAY_zz", disabled: true } // Sesuaikan kode 'zz' jika perlu
    ]
  }
};
