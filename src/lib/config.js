export const BRAND = {
  name: 'Ninytasha Exports',
  legal: 'Ninytasha Exports Pvt Ltd',
  productBrand: 'True Glass',
  tagline: 'Handcrafted borosilicate glassware, temple items & décor',
  since: 2000, // year of incorporation (from CIN)

  // Registered office (used on invoices, terms, map)
  address: 'A-240, Derawal Nagar, Delhi – 110009',
  mapQuery: 'A-240 Derawal Nagar Delhi 110009',
  locations: [
    { label: 'Registered office', address: 'A-240, Derawal Nagar, Delhi – 110009' },
    { label: 'Factory', address: 'E-35, SMA Industrial Area, GTK Road, Delhi – 110033' },
    { label: 'Warehouse', address: 'D-15, SMA Industrial Area, near GTK Road, Delhi – 110033' },
  ],

  email: 'ninytasha@gmail.com',
  phone: '9821412506',
  phone2: '9810022607',
  contacts: [
    { name: 'Mr. Aditya', phone: '9821412506' },
    { name: 'Mr. Kewal Sadana', phone: '9810022607' },
  ],
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '919821412506',

  gstin: '07AABCN6809Q1ZW',
  cin: 'U51420DL2000PTC108062',

  bank: {
    name: 'Punjab National Bank',
    branch: 'ECE House, 28-A, K.G. Marg, Connaught Place, New Delhi – 110001',
    account: '1120002102306691',
    beneficiary: 'NINYTASHA EXPORTS PVT. LTD.',
    ifsc: 'PUNB0112000',
    swift: 'PUNBINBBDCG',
    beneficiaryAddress: 'A-240, Derawal Nagar, Delhi – 110009',
  },

  freeShippingAbove: 999,
  shippingFee: 79,
  codFee: 49,
}
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')