export const BRAND = {
  name: 'Ninytasha Exports',
  legal: 'Ninytasha Exports Pvt Ltd',
  productBrand: 'True Glass',
  tagline: 'Hand-finished borosilicate glass diyas & bells',
  address: '414, 4th Floor, Usha Kiran Building',
  mapQuery: 'Usha Kiran Building, Azadpur, Delhi',
  email: 'ninytasha@gmail.com',
  phone: '9821412506',
  phone2: '9810022607',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '919821412506',
  gstin: '', // add your GSTIN to show it on invoices and in the footer
  freeShippingAbove: 999,
  shippingFee: 79,
  codFee: 49,
}
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
