
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
      { name: "QRIS (segera hadir)", code: "QR_QRISShopeePay_SP", disabled: true }
    ]
  },
  "Virtual Account": {
    isDirect: false,
    providers: [
      { name: "Bank Mandiri", code: "VA_MANDIRI_M2", disabled: false }, // Sesuaikan kode 'xx' jika perlu
      { name: "Bank BNI", code: "VA_BNI_I1", disabled: false },
      { name: "Bank BRI", code: "VA_BRI_BR", disabled: false },
      { name: "Bank BSI", code: "VA_BSI_BV", disabled: false },
      { name: "Bank Permata", code: "VA_Permata_BT", disabled: false },
      { name: "Bank CIMB Niaga", code: "VA_CIMB_B1", disabled: false },
      { name: "ATM Bersama", code: "VA_ATMBersama_A1", disabled: false },
    ]
  },
  "E-Wallet": {
    isDirect: false,
    providers: [
      { name: "ShopeePay (segera hadir)", code: "EWALLET_ShopeePay_SA", disabled: true },
      { name: "OVO (segera hadir)", code: "EWALLET_OVO_OV", disabled: true }, // Sesuaikan kode 'zz' jika perlu
    ]
  }
};

