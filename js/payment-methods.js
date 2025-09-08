
// ---------------------------------------------------------------
// -- PENGATURAN & KONSTANTA
// ---------------------------------------------------------------

const PAYMENT_METHODS = {
  "Transfer": {
    isDirect: true,
    providers: [
      { name: "Transfer Bank", code: "TRANSFER", disabled: true }
    ]
  },
  "QRIS": {
    isDirect: true,
    providers: [
      { name: "QRIS", code: "QR_ShoppePay_SP", disabled: false }
    ]
  },
  "Virtual Account": {
    isDirect: false,
    providers: [
      { name: "Bank Mandiri", code: "VA_MANDIRI_M2", disabled: false }, // Sesuaikan kode 'xx' jika perlu
      { name: "Bank BNI", code: "VA_BNI_I1", disabled: false },
      { name: "Bank BRI (BRIVA)", code: "VA_BRI_BR", disabled: false },
      { name: "Bank BSI", code: "VA_BSI_BV", disabled: false },
      { name: "Bank Permata", code: "VA_Permata_BT", disabled: false },
      { name: "Bank CIMB Niaga", code: "VA_CIMB_B1", disabled: false },
      { name: "Bank Mybank", code: "VA_Mybank_VA", disabled: false },
      { name: "Bank Artha Graha", code: "VA_Artha_AG", disabled: false },
      { name: "Bank Neo Commerce/BNC", code: "VA_BNC_NC", disabled: false },
      { name: "Bank Sahabat Sampoerna", code: "VA_Sampoerna_S1", disabled: false },
      { name: "Bank Danamon", code: "VA_Danamon_DM", disabled: false },
      { name: "ATM Bersama", code: "VA_ATMBersama_A1", disabled: false },
    ]
  },
  "Retail": {
    isDirect: false,
    providers: [
      { name: "Alfamart", code: "Retail_Alfamart_FT", disabled: false },
      { name: "Pos", code: "Retail_Pos_FT", disabled: false },
      { name: "Pegadaian", code: "Retail_Pegadaian_FT", disabled: false },
    ]
  },
    "E-Wallet": {
    isDirect: false,
    providers: [
      { name: "ShopeePay", code: "Wallet_ShepeePay_SA", disabled: false },
    ]
  }
};







