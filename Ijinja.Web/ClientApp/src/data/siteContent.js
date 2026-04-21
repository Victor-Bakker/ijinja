export const WHATSAPP_NUMBER = '27742643837'
export const MANUAL_ORDER_API_PATH = '/api/store/manual-order'
export const USE_WHATSAPP_CHECKOUT = true
export const STORY_VIDEO_SRC = '/content/assets/fire-video.mp4'
export const HERO_PHOTO_SRC = '/content/assets/ijinja-can-on-head.webp'
export const DRINK_CASE_SIZE = 24

export const PAYMENT_OPTIONS = [
  'EFT / Bank Transfer',
  'Card on Delivery',
  'Cash on Delivery',
]

const MERCH_IN_STOCK = false

export const products = [
  {
    id: 'ijinja-original',
    name: 'Ijinja Original',
    tag: 'Original',
    inStock: true,
    coverClass: 'can-cover-original',
    image: '/content/products/ijinja-original.png',
    description:
      'A balanced ginger profile with clean heat and smooth everyday drinkability.',
    price: 34.99,
    options: [`Case (${DRINK_CASE_SIZE} Cans)`],
  },
  {
    id: 'ijinja-alcohol-free',
    name: 'Ijinja Alcohol Free',
    tag: 'Alcohol Free',
    inStock: false,
    coverClass: 'can-cover-alcohol-free',
    image: '/content/products/ijinja-alcohol-free.png',
    description:
      'All the Ijinja flavor and fire, made for alcohol-free moments.',
    price: 34.99,
    options: [`Case (${DRINK_CASE_SIZE} Cans)`],
  },
  {
    id: 'ijinja-with-gin',
    name: 'Ijinja with Gin',
    tag: 'With Gin',
    inStock: false,
    coverClass: 'can-cover-with-gin',
    image: '/content/products/ijinja-with-gin.png',
    description:
      'A bold, premium blend where spicy ginger meets a crisp gin finish.',
    price: 34.99,
    options: [`Case (${DRINK_CASE_SIZE} Cans)`],
  },
]

export const merchProducts = [
  {
    id: 'ijinja-tee',
    name: 'Ijinja Heritage Tee',
    tag: 'Apparel',
    inStock: MERCH_IN_STOCK,
    image: '/content/products/Ijinja-shirt1-front.png',
    images: [
      '/content/products/Ijinja-shirt1-front.png',
      '/content/products/Ijinja-shirt1-back.png',
    ],
    description: 'Soft cotton tee with front logo print for everyday wear.',
    price: 299,
    options: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'ijinja-cap',
    name: 'Ijinja Classic Cap',
    tag: 'Accessories',
    inStock: MERCH_IN_STOCK,
    image: '/content/products/ijinja-hat1-front.png',
    images: [
      '/content/products/ijinja-hat1-front.png',
      '/content/products/ijinja-hat1-back.png',
    ],
    description: 'Curved peak cap with adjustable strap and embroidered logo.',
    price: 249,
    options: ['One Size'],
  },
  {
    id: 'ijinja-cooler',
    name: 'Ijinja Cooler Bag',
    tag: 'Lifestyle',
    inStock: MERCH_IN_STOCK,
    image: '/content/products/Ijinja-cooler.png',
    description: 'Insulated carry bag built for road trips, markets, and events.',
    price: 399,
    options: ['Standard'],
  },
]

export const storeProducts = [...products, ...merchProducts]
export const drinkProductIds = new Set(products.map((product) => product.id))

export const menuItems = [
  { label: 'Our Story', href: '#our-story' },
  { label: 'Products', href: '#products' },
  { label: 'Buy Ijinja', href: '#buy-products' },
  { label: 'Store', href: '#store' },
  { label: "T&C's", href: '/terms-and-conditions.html' },
  { label: 'Contact', href: '#contact' },
]

export const contactDetails = [
  {
    label: 'Email',
    value: 'admin@ijinja.co.za',
    href: 'mailto:admin@ijinja.co.za',
  },
  { label: 'Contact Person', value: 'Eugene van Zyl' },
  {
    label: 'WhatsApp',
    value: '+27 74 264 3837',
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    external: true,
  },
]

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/Ijinjabeer' },
  { label: 'Instagram', href: 'https://www.instagram.com/ijinja_spirit/' },
]

export const initialCheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  paymentMethod: PAYMENT_OPTIONS[0],
  notes: '',
}
