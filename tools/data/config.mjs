// Central site configuration. Edit here, then run: node tools/build.mjs
export const site = {
  name: 'amazonselfpublishers',
  displayName: 'Amazon Self Publishers',
  domain: 'https://amazonselfpublishers.co', // production domain (no www); add a www->non-www redirect at the host if desired
  phone: '+1 323 509 3062',
  phoneHref: 'tel:+13235093062',
  email: 'info@amazonselfpublishers.co', // shown publicly; form recipient is set separately in backend/.env
  legalName: '', // OWNER INPUT NEEDED: exact legal entity name (e.g. "Example Publishing LLC"). Shown in footer/contact/legal pages once set.
  address: 'Fine Arts Building, 811 W. 7th St., Suite 1149, Los Angeles, CA 90017', // supplied by owner 2026-10-18; shown in footer, contact and legal pages
  legalUpdated: 'October 28, 2026', // date legal pages were last materially revised; update when content changes
  hours: '',   // not supplied
  social: { facebook: '', instagram: '', linkedin: '', x: '', youtube: '' }, // add URLs to show icons
  formEndpoint: '/api/contact',
  tokenEndpoint: '/api/token',
  disclaimer:
    'amazonselfpublishers is an independent publishing-services provider. We are not owned by, endorsed by, or officially affiliated with Amazon, Kindle Direct Publishing, or any of their subsidiaries. Amazon and Kindle are trademarks of their respective owners. Authors can publish on Amazon KDP directly and free of charge; we charge only for the optional services they choose.',
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '#', mega: true },
  { label: 'Portfolio', href: '/our-portfolio' },
  { label: 'Testimonials', href: '/client-testimonials' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact-us' },
];
