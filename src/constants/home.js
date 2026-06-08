import { getMenuImage } from '../data/menuImages';
import { BASE_CATEGORY_ORDER, getCategoryIcon } from './categories';

export const HERO_SLIDES = [
  {
    id: 'fresh-flavors',
    dietary: 'all',
    imageDietary: 'veg',
    badge: 'New Season Menu',
    title: 'Fresh flavors,\ndelivered fast',
    subtitle:
      'From breakfast classics to wholesome dinners — chef-crafted meals at your doorstep in under 30 minutes.',
    cta: 'Order Now',
    ctaLink: '/menu',
    secondaryCta: 'View Offers',
    secondaryLink: '/menu',
    image: getMenuImage(6),
    tint: 'green',
  },
  {
    id: 'veg-delight',
    dietary: 'veg',
    imageDietary: 'veg',
    badge: '100% Vegetarian',
    title: 'Pure veg\ncomfort food',
    subtitle:
      'Paneer curries, fresh pasta, wood-fired pizzas, and desserts — every bite meat-free and full of flavor.',
    cta: 'Browse Veg Menu',
    ctaLink: '/menu',
    secondaryCta: 'View Offers',
    secondaryLink: '/menu',
    image: getMenuImage(8),
    tint: 'emerald',
  },
  {
    id: 'weekend-feast',
    dietary: 'non_veg',
    imageDietary: 'non_veg',
    badge: 'Weekend Special',
    title: 'Family feast\nstarts here',
    subtitle:
      'Bundle biryani, grilled mains, and sides for the whole table. Free delivery on orders above Rs.500.',
    cta: 'Explore Menu',
    ctaLink: '/menu',
    secondaryCta: 'Read Blog',
    secondaryLink: '/blog',
    image: getMenuImage(7),
    tint: 'amber',
  },
  {
    id: 'grill-night',
    dietary: 'non_veg',
    imageDietary: 'non_veg',
    badge: 'Chef Special',
    title: 'Bold grills\n& biryanis',
    subtitle:
      'Slow-cooked biryani, tikka masala, and burgers — crafted for serious non-veg food lovers.',
    cta: 'Order Non-Veg',
    ctaLink: '/menu',
    secondaryCta: 'Our Story',
    secondaryLink: '/about',
    image: getMenuImage(15),
    tint: 'rose',
  },
  {
    id: 'healthy-picks',
    dietary: 'veg',
    imageDietary: 'veg',
    badge: 'Healthy Eating',
    title: 'Eat well,\nfeel great',
    subtitle:
      'Wholesome soups, salads, and calorie-smart vegetarian picks — nourishing meals made easy.',
    cta: 'Browse Healthy',
    ctaLink: '/menu',
    secondaryCta: 'Food Blog',
    secondaryLink: '/blog',
    image: getMenuImage(21),
    tint: 'teal',
  },
];

export const HOME_OFFERS = [
  {
    id: 'free-delivery',
    dietary: 'all',
    title: 'Free Delivery',
    description: 'On all orders above Rs.500 across the city.',
    code: 'No code needed',
    icon: '🚚',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'first-order',
    dietary: 'all',
    title: '20% Off First Order',
    description: 'New customers save on their first delicious delivery.',
    code: 'WELCOME20',
    icon: '🎉',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'combo-deal',
    dietary: 'all',
    title: 'Combo Meals',
    description: 'Main + drink + dessert bundles at special prices.',
    code: 'COMBO15',
    icon: '🍱',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'veg-combo',
    dietary: 'veg',
    title: 'Veg Combo Saver',
    description: 'Paneer main + garlic bread + drink at 15% off every Wednesday.',
    code: 'VEGCOMBO',
    icon: '🥗',
    gradient: 'from-lime-500 to-green-600',
  },
  {
    id: 'meat-lovers',
    dietary: 'non_veg',
    title: 'Meat Lovers Deal',
    description: 'Biryani or burger + sides combo with extra 10% off weekends.',
    code: 'MEAT10',
    icon: '🍗',
    gradient: 'from-red-500 to-orange-600',
  },
  {
    id: 'weekend-brunch',
    dietary: 'veg',
    title: 'Weekend Brunch',
    description: 'Breakfast favorites with 15% off Sat & Sun mornings.',
    code: 'BRUNCH15',
    icon: '☀️',
    gradient: 'from-sky-500 to-blue-600',
  },
];

export const HOME_STATS = [
  { value: '50+', label: 'Menu Items' },
  { value: '30 min', label: 'Avg. Delivery' },
  { value: '10K+', label: 'Happy Customers' },
  { value: '4.8★', label: 'Average Rating' },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse & Choose',
    description: 'Explore categories, filters, and smart search to find your perfect meal.',
  },
  {
    step: '02',
    title: 'Customize Order',
    description: 'Pick quantities, review nutrition, and add items to your cart in one tap.',
  },
  {
    step: '03',
    title: 'Fast Delivery',
    description: 'Track your order and enjoy restaurant-quality food at home.',
  },
];

export const HOME_TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    dietary: 'non_veg',
    role: 'Regular Customer',
    quote:
      'The biryani is incredible and always arrives hot. FoodExpress is my go-to for family dinners.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    dietary: 'all',
    role: 'Food Blogger',
    quote:
      'Love the menu variety and clean UI. Ordering feels premium — like a modern food app should.',
    rating: 5,
  },
  {
    name: 'Ananya Das',
    dietary: 'veg',
    role: 'Working Professional',
    quote:
      'Quick lunch orders between meetings. Veg filters and calorie info make healthy choices easy.',
    rating: 4,
  },
  {
    name: 'Karan Patel',
    dietary: 'veg',
    role: 'Fitness Enthusiast',
    quote:
      'Margherita pizza and paneer bowls are my weekly staples. Clean veg options without compromise.',
    rating: 5,
  },
];

export const FEATURED_DISH_IDS = {
  all: [8, 9, 7, 41],
  veg: [9, 7, 25, 41],
  non_veg: [8, 16, 12, 20],
};

export const HOME_CATEGORIES = BASE_CATEGORY_ORDER.map((name) => ({
  name,
  icon: getCategoryIcon(name),
  description:
    name === 'Breakfast'
      ? 'Morning favorites'
      : name === 'Soup'
        ? 'Warm & comforting'
        : name === 'Pasta'
          ? 'Italian classics'
          : name === 'Main Course'
            ? 'Hearty meals'
            : name === 'Pizza'
              ? 'Wood-fired style'
              : name === 'Burger'
                ? 'Stacked & juicy'
                : name === 'Dessert'
                  ? 'Sweet treats'
                  : 'Refreshing sips',
}));
