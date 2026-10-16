import { Link, Navigate, useParams } from 'react-router-dom'
import { BRAND, inr } from '../lib/config'
import { useSeo, breadcrumbs } from '../lib/seo'

const UPDATED = '16 October 2026'
const B = BRAND
const grievance = B.contacts[0] // Grievance Officer — change in config if someone else handles complaints

// Each policy: { title, description, sections: [[heading, [paragraph | [list items]]]] }
export const POLICIES = {
  'privacy-policy': {
    title: 'Privacy Policy',
    description: `How ${B.legal} collects, uses and protects your personal information when you shop on our website.`,
    sections: [
      ['Introduction', [`This Privacy Policy explains how ${B.legal} (“we”, “us”, “our”), having its registered office at ${B.address}, collects, uses, shares and protects personal information of visitors and customers of this website. By using the website you agree to this policy. It is published in accordance with the Information Technology Act, 2000 and the rules made under it.`]],
      ['Information we collect', [
        'We collect only what we need to process orders and respond to you:',
        ['Contact details — name, email address, phone number', 'Delivery and billing address, and GSTIN / company name if you provide them', 'Order history, cart and wishlist items', 'Messages you send through our contact, quote and review forms', 'Technical data such as browser type, device and pages visited, used to keep the site working and secure'],
      ]],
      ['Payments', [`Online payments are processed by Razorpay Software Pvt. Ltd., a PCI-DSS compliant payment gateway. Your card, UPI and net-banking details are entered on Razorpay’s secure checkout and are never stored on our servers. We receive only a payment reference and status. Please also read Razorpay’s privacy policy at razorpay.com.`]],
      ['How we use your information', [['To process, ship and deliver your orders and send order updates by email, SMS or WhatsApp', 'To issue invoices and meet tax and legal requirements', 'To reply to enquiries, quote requests and support messages', 'To send offers and newsletters — only if you subscribe; you can unsubscribe at any time', 'To prevent fraud and keep the website secure']]],
      ['Sharing of information', [
        'We do not sell or rent your personal information. We share it only with:',
        ['Courier and logistics partners, to deliver your order', 'Razorpay, to process payments', 'Our hosting and database providers, who store data on our behalf under confidentiality obligations', 'Government or law-enforcement authorities, when required by law'],
      ]],
      ['Cookies and local storage', ['We use your browser’s local storage to remember your cart, wishlist and sign-in. We do not use third-party advertising cookies. You can clear this data from your browser settings at any time.']],
      ['Data security and retention', ['We use HTTPS encryption and access controls to protect your data. Order and invoice records are retained for as long as required under Indian tax laws; other data is kept only as long as needed for the purposes above.']],
      ['Your rights', [`You may ask us to access, correct or delete your personal information, or withdraw consent for marketing, by emailing ${B.email}. We will respond within 30 days.`]],
      ['Grievance Officer', [`In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Officer is ${grievance.name}, ${B.legal}, ${B.address}. Email: ${B.email} · Phone: +91 ${grievance.phone}. Complaints are acknowledged within 48 hours and resolved within one month.`]],
      ['Changes to this policy', ['We may update this policy from time to time. The latest version will always be available on this page with its “last updated” date.']],
    ],
  },

  'terms-and-conditions': {
    title: 'Terms & Conditions',
    description: `Terms and conditions for buying from ${B.legal} — orders, pricing, payments, wholesale and governing law.`,
    sections: [
      ['About us', [`This website is owned and operated by ${B.legal}, a company incorporated in India (CIN ${B.cin}, GSTIN ${B.gstin}) with its registered office at ${B.address}. By accessing the website or placing an order, you agree to these Terms & Conditions.`]],
      ['Eligibility', ['You must be at least 18 years old, or use the website under the supervision of a parent or guardian, to place an order.']],
      ['Products', ['Our products are handcrafted from borosilicate glass. Small variations in size, shape, colour and the presence of tiny air bubbles are natural features of handmade glass and are not defects. Product photographs and illustrations are representative; actual pieces may vary slightly. Where an illustration is shown, it is labelled as such.']],
      ['Prices and payment', [
        ['All retail prices are in Indian Rupees (INR) and inclusive of applicable GST unless stated otherwise.', 'Wholesale prices are per piece or per set as shown and exclude GST and shipping.', `Shipping charges, if any, are shown at checkout (free above ${inr(B.freeShippingAbove)}; otherwise ${inr(B.shippingFee)}). Cash on delivery carries an additional fee of ${inr(B.codFee)}.`, 'We accept payment through Razorpay (UPI, cards, net banking, wallets), cash on delivery, and bank transfer for confirmed quotes.', 'In case of an obvious pricing or listing error, we may cancel the order and refund any amount paid in full.'],
      ]],
      ['Orders', ['An order is confirmed when you receive an order confirmation. We may decline or cancel an order for reasons such as stock unavailability, suspected fraud, or incorrect pricing; in such cases any payment is refunded in full.']],
      ['Wholesale, bulk and export orders', ['Wholesale pricing applies from 100 pieces per design. Bulk, customised and export orders are governed by the written quotation or proforma invoice we issue, including payment terms, lead time and packing. Where a quote conflicts with these terms, the quote prevails.']],
      ['Shipping, cancellation and refunds', ['Please see our Shipping & Delivery Policy and our Cancellation & Refund Policy, which form part of these terms.']],
      ['Safe use', ['Glass diyas, candle holders and lamps are used with open flames. Always place them on a stable, heat-safe surface away from flammable material, and never leave a flame unattended. Allow glass to cool before handling or washing. We are not liable for damage or injury caused by misuse.']],
      ['Intellectual property', [`All content on this website — text, logos, product designs, photographs and illustrations — belongs to ${B.legal} or is used with permission, and may not be copied without our written consent.`]],
      ['Limitation of liability', ['To the extent permitted by law, our total liability for any claim relating to an order is limited to the amount paid for that order.']],
      ['Governing law', ['These terms are governed by the laws of India. Courts at Delhi shall have exclusive jurisdiction over any dispute.']],
      ['Contact', [`${B.legal}, ${B.address} · ${B.email} · +91 ${B.phone}`]],
    ],
  },

  'cancellation-and-refund-policy': {
    title: 'Cancellation & Refund Policy',
    description: `Cancellation, return, replacement and refund policy for orders placed with ${B.legal}.`,
    sections: [
      ['Cancellation', [
        ['Retail orders can be cancelled free of charge before they are dispatched. Email us or WhatsApp your order number to cancel.', 'Once an order has been dispatched it cannot be cancelled; you may refuse delivery, in which case the shipping charges may be deducted from the refund.', 'Wholesale, customised and export orders can be cancelled only before production begins, as set out in the quotation.'],
      ]],
      ['Damaged or defective items', [
        'Because our products are fragile and handmade, we accept returns only for items that arrive broken or with a manufacturing defect.',
        [`Report the damage within 48 hours of delivery to ${B.email} or WhatsApp +91 ${B.phone}, with your order number.`, 'Include clear photos or an unboxing video of the outer box, packing and damaged item.', 'Keep the item and packaging until the claim is settled.'],
        'Once verified, we will send a free replacement or, if a replacement is unavailable, issue a full refund for the affected item.',
      ]],
      ['Non-returnable', [['Items that are not damaged or defective (change of mind)', 'Natural variations of handmade glass, such as minor bubbles or slight differences in shape', 'Items damaged through misuse after delivery', 'Customised or branded bulk orders, except for transit damage']]],
      ['Refunds', [
        ['Approved refunds are processed within 5–7 business days of approval.', 'Online payments are refunded to the original payment method via Razorpay; the amount may take a further 5–10 business days to reflect, depending on your bank.', 'Cash-on-delivery orders are refunded by bank transfer or UPI to the account details you provide.', 'The COD fee and shipping charges are non-refundable, except where the item arrived damaged or the order was cancelled by us.'],
      ]],
      ['Contact', [`For any cancellation or refund request: ${B.email} · +91 ${B.phone} (${B.contacts[0].name}) · +91 ${B.phone2} (${B.contacts[1].name})`]],
    ],
  },

  'shipping-policy': {
    title: 'Shipping & Delivery Policy',
    description: `Shipping charges, dispatch time and delivery timelines for orders from ${B.legal}.`,
    sections: [
      ['Where we ship', ['We deliver to addresses across India through reputed courier partners. International shipments for export orders are arranged on a quotation basis.']],
      ['Dispatch and delivery time', [['Orders are dispatched within 2–4 business days of confirmation (prepaid) or confirmation call/WhatsApp (COD).', 'Delivery usually takes 3–7 business days after dispatch, depending on your location. Remote areas may take longer.', 'Wholesale and export orders are dispatched as per the lead time agreed in the quotation.', 'Orders are not dispatched on Sundays and public holidays.']]],
      ['Shipping charges', [[`Free shipping on retail orders of ${inr(B.freeShippingAbove)} and above.`, `A flat ${inr(B.shippingFee)} on orders below ${inr(B.freeShippingAbove)}.`, `Cash on delivery: additional ${inr(B.codFee)}.`, 'Wholesale and export freight is quoted separately.']]],
      ['Packing', ['Every glass item is bubble-wrapped and packed in a sturdy carton to protect it in transit.']],
      ['Tracking', ['Once your order ships, you will receive the courier name and tracking number. You can also check status on our Track Order page using your order number and phone number.']],
      ['Delays and failed delivery', ['Delivery timelines are estimates and may be affected by weather, strikes or courier delays beyond our control. If a delivery fails because the address is incorrect or the recipient is unavailable, re-shipping charges may apply.']],
      ['Damaged in transit', ['If your parcel arrives damaged, please follow the steps in our Cancellation & Refund Policy within 48 hours of delivery.']],
      ['Contact', [`${B.legal} · Warehouse: ${B.locations[2].address} · ${B.email} · +91 ${B.phone}`]],
    ],
  },
}

const ALIASES = { privacy: 'privacy-policy', terms: 'terms-and-conditions', returns: 'cancellation-and-refund-policy', refund: 'cancellation-and-refund-policy', shipping: 'shipping-policy' }

export function PolicyPage({ slug: fixed }) {
  const params = useParams()
  const slug = fixed || params.slug
  const p = POLICIES[slug]
  useSeo(p ? { title: p.title, description: p.description, path: `/${slug}`, jsonLd: breadcrumbs([['Home', '/'], [p.title, `/${slug}`]]) } : { noindex: true })
  if (!p) return ALIASES[slug] ? <Navigate to={`/${ALIASES[slug]}`} replace /> : <Navigate to="/" replace />
  return (
    <div className="container page narrow prose policy">
      <div className="crumbs"><Link to="/">Home</Link> / {p.title}</div>
      <h1>{p.title}</h1>
      <p className="muted small">Last updated: {UPDATED} · {B.legal}</p>
      <nav className="toc">{p.sections.map(([h], i) => <a key={h} href={`#s${i}`}>{h}</a>)}</nav>
      {p.sections.map(([h, body], i) => (
        <section key={h} id={`s${i}`}>
          <h2>{h}</h2>
          {body.map((b, k) => (Array.isArray(b) ? <ul key={k}>{b.map((li) => <li key={li}>{li}</li>)}</ul> : <p key={k}>{b}</p>))}
        </section>
      ))}
      <div className="policy-links">{Object.entries(POLICIES).filter(([k]) => k !== slug).map(([k, v]) => <Link key={k} to={`/${k}`}>{v.title}</Link>)}</div>
    </div>
  )
}
