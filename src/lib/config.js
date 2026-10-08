export const BRAND = {
  name: 'R3 Exports',
  tagline: 'Handcrafted borosilicate glass for every festive flame',
  legal: 'R3 International',
  address: 'Rohini Sector 7, Property No. 6, Pkt E-5, New Delhi – 110085',
  gstin: '07ASUPG6483F1Z9',
  iec: '0516509578',
  email: 'hello@r3exports.in',
  phone: '+91 99999 99999',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999',
  freeShippingAbove: 999,
  shippingFee: 79,
  codFee: 49,
}
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
