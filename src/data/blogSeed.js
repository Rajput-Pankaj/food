import { estimateReadTime, slugify } from '../utils/blogContent';

function createPost({
  id,
  title,
  excerpt,
  content,
  author,
  category,
  image,
  publishedAt,
  tags = [],
}) {
  const slug = slugify(title);
  return {
    id,
    slug,
    title,
    excerpt,
    content,
    author,
    category,
    image,
    publishedAt,
    tags,
    readTime: estimateReadTime(content),
    available: true,
  };
}

import { MEDIA_BLOG_PREFIX } from '../constants/media';

const BLOG_IMAGES = [
  `${MEDIA_BLOG_PREFIX}/image1.avif`,
  `${MEDIA_BLOG_PREFIX}/image6.avif`,
  `${MEDIA_BLOG_PREFIX}/image10.avif`,
  `${MEDIA_BLOG_PREFIX}/image15.avif`,
  `${MEDIA_BLOG_PREFIX}/image20.avif`,
  `${MEDIA_BLOG_PREFIX}/image22.avif`,
  `${MEDIA_BLOG_PREFIX}/image8.avif`,
  `${MEDIA_BLOG_PREFIX}/image12.avif`,
];

const seedPosts = [
  createPost({
    id: 1,
    title: '10 Quick and Healthy Breakfast Ideas for Busy Mornings',
    excerpt:
      'Start your day right with nutritious breakfast options that take less than 15 minutes to prepare.',
    author: 'Chef Sarah Johnson',
    category: 'Recipes',
    image: BLOG_IMAGES[0],
    publishedAt: '2024-03-15T08:00:00.000Z',
    tags: ['breakfast', 'healthy', 'quick meals'],
    content: `Breakfast fuels your morning focus, energy, and mood. When time is tight, these ten ideas keep nutrition high without slowing you down.

## 1. Greek Yogurt Parfait
Layer yogurt, granola, and berries in a jar the night before. Add honey in the morning for a creamy, protein-rich start.

## 2. Masala Egg Wrap
Scramble eggs with onion, tomato, and spices. Roll in a warm roti with mint chutney for a desi twist on the breakfast burrito.

## 3. Overnight Oats
Combine oats, milk, chia seeds, and banana in a jar. Refrigerate overnight and enjoy cold or warmed.

## 4. Avocado Toast Upgrade
Top sourdough with smashed avocado, chili flakes, lemon, and a poached egg for healthy fats and staying power.

## 5. Smoothie Bowl
Blend frozen mango, spinach, and yogurt. Pour into a bowl and add seeds, nuts, and fresh fruit on top.

- Prep ingredients on Sunday for faster weekdays
- Keep boiled eggs ready in the fridge
- Use whole grains instead of refined flour
- Pair carbs with protein for stable energy`,
  }),
  createPost({
    id: 2,
    title: 'The Ultimate Guide to Perfect Pizza Dough',
    excerpt:
      'Learn the secrets to making restaurant-quality pizza dough at home with our step-by-step guide.',
    author: 'Chef Michael Chen',
    category: 'Recipes',
    image: BLOG_IMAGES[1],
    publishedAt: '2024-03-12T09:30:00.000Z',
    tags: ['pizza', 'baking', 'dough'],
    content: `Great pizza begins with great dough. This guide walks you through hydration, fermentation, and baking for a crisp crust and airy crumb.

## Ingredients That Matter
Use strong bread flour, active dry yeast, salt, olive oil, and room-temperature water. Measure by weight when possible for consistency.

## Mixing and Kneading
Stir flour, yeast, and salt. Add water gradually until a shaggy dough forms. Knead 8–10 minutes until smooth and elastic.

## Cold Fermentation
Rest dough in the fridge for 24–72 hours. Slow fermentation develops flavor and makes the dough easier to stretch.

## Shaping and Topping
Bring dough to room temperature before shaping. Use a light hand—overworking creates toughness. Less sauce and mozzarella often means a crisper base.

### Baking Tips
- Preheat oven and stone or steel for at least 45 minutes
- Bake at the highest temperature your oven allows
- Finish with fresh basil and olive oil after baking`,
  }),
  createPost({
    id: 3,
    title: 'Sustainable Food Practices: How We Are Going Green',
    excerpt:
      'Discover how FoodExpress is reducing environmental impact through smarter sourcing and packaging.',
    author: 'Emily Rodriguez',
    category: 'Restaurant News',
    image: BLOG_IMAGES[2],
    publishedAt: '2024-03-10T11:00:00.000Z',
    tags: ['sustainability', 'company'],
    content: `Sustainability is not a marketing slogan for us—it is an operating principle. Here is how FoodExpress is building a greener delivery model.

## Local Sourcing First
We partner with regional farms and suppliers to shorten supply chains, improve freshness, and cut transport emissions.

## Smarter Packaging
Our packaging roadmap replaces single-use plastic with compostable and recyclable materials wherever food safety allows.

## Waste Reduction in Kitchens
Batch planning, donation partnerships, and inventory tracking help us minimize food waste across prep and service.

## What You Can Do
- Choose bundled orders to reduce delivery trips
- Opt out of disposable cutlery when not needed
- Reuse or recycle packaging when possible

We publish quarterly progress updates and welcome feedback from customers who care about responsible food service.`,
  }),
  createPost({
    id: 4,
    title: '5 Essential Cooking Tips Every Home Chef Should Know',
    excerpt:
      'Master fundamental techniques to elevate everyday cooking and build restaurant-worthy flavor at home.',
    author: 'Chef Sarah Johnson',
    category: 'Food Tips',
    image: BLOG_IMAGES[3],
    publishedAt: '2024-03-08T07:45:00.000Z',
    tags: ['cooking', 'techniques'],
    content: `Small habits create big improvements in the kitchen. These five techniques will immediately upgrade your results.

## 1. Season in Layers
Season at every stage—not only at the end. A pinch during sautéing builds depth that a last-minute dash cannot replace.

## 2. Respect Your Pan Heat
A properly preheated pan prevents sticking and encourages browning. If food steams instead of searing, patience is usually the fix.

## 3. Rest Meat Before Slicing
Resting redistributes juices. Cut too early and flavor ends up on the board instead of in every bite.

## 4. Taste Constantly
Balance acid, salt, and fat as you cook. A squeeze of lemon or splash of vinegar can rescue a flat dish.

## 5. Mise en Place
Prep ingredients before heat goes on. Calm setup leads to better timing and fewer mistakes.

- Keep knives sharp
- Read the full recipe once before starting
- Clean as you go to stay organized`,
  }),
  createPost({
    id: 5,
    title: 'The Benefits of Mediterranean Diet: A Complete Guide',
    excerpt:
      'Explore the health benefits and delicious patterns behind one of the world’s most recommended eating styles.',
    author: 'Dr. Lisa Martinez',
    category: 'Healthy Eating',
    image: BLOG_IMAGES[4],
    publishedAt: '2024-03-05T10:15:00.000Z',
    tags: ['nutrition', 'wellness'],
    content: `The Mediterranean diet emphasizes whole foods, healthy fats, and joyful eating—not restriction. Research links it with heart health, metabolic balance, and longevity.

## Core Food Groups
Vegetables, legumes, whole grains, nuts, olive oil, fish, and moderate dairy form the foundation. Red meat and sweets play a smaller role.

## Why It Works
Fiber supports digestion. Unsaturated fats support cardiovascular health. Variety keeps meals satisfying without relying on ultra-processed foods.

## Easy Swaps to Start
- Use olive oil instead of butter for sautéing
- Choose fish twice a week
- Build meals around plants, not just sides
- Snack on nuts and fruit instead of packaged chips

### A Sample Day
Breakfast: yogurt with walnuts and berries. Lunch: lentil soup and salad. Dinner: grilled fish, roasted vegetables, and whole-grain bread.

Always consult a healthcare professional for personalized nutrition advice.`,
  }),
  createPost({
    id: 6,
    title: 'New Menu Items: Spring Edition 2024',
    excerpt:
      'Introducing seasonal dishes celebrating fresh spring produce and bright, balanced flavors.',
    author: 'Chef Michael Chen',
    category: 'Restaurant News',
    image: BLOG_IMAGES[5],
    publishedAt: '2024-03-03T12:00:00.000Z',
    tags: ['menu', 'seasonal'],
    content: `Spring menus are here—and they are built around freshness, color, and lighter comfort food.

## Highlights from the Kitchen
Our chefs developed new pasta primavera, herb-grilled salmon, and a berry-forward dessert lineup using peak-season produce.

## Limited-Time Pairings
Try mango lassi with spicy mains or fresh lime soda with grilled dishes for a refreshing contrast.

## Chef’s Recommendation
Start with minestrone soup, move to pesto pasta, and finish with New York cheesecake if you are sharing.

Browse the full menu on FoodExpress and filter by category to explore every new addition.`,
  }),
  createPost({
    id: 7,
    title: 'How to Build a Balanced Food Order for the Family',
    excerpt:
      'Mix proteins, greens, and crowd-pleasers so everyone at the table gets a meal they enjoy.',
    author: 'Emily Rodriguez',
    category: 'Food Tips',
    image: BLOG_IMAGES[6],
    publishedAt: '2024-02-28T08:20:00.000Z',
    tags: ['ordering', 'family'],
    content: `Family orders work best with a simple framework: one protein anchor, one vegetable-forward dish, one carb everyone likes, and one treat.

## Start with a Shared Main
Biryani, butter chicken, or margherita pizza can anchor the meal depending on preferences and appetite.

## Add Balance
Pair rich mains with soup or salad. A tomato soup or vegetable soup keeps the spread from feeling too heavy.

## Think About Portions
Order one portion per adult and share sides. Kids often prefer mild flavors—paneer dishes and pasta are reliable picks.

## Do Not Forget Drinks
Lassi, lime soda, or masala chai round out the experience and often cost less than extra mains.

Use dietary filters on our menu to quickly separate veg and non-veg options when ordering for mixed groups.`,
  }),
  createPost({
    id: 8,
    title: 'Spice Levels Explained: Ordering the Right Heat',
    excerpt:
      'From mild comfort food to bold chili-forward dishes—how to choose heat that suits your palate.',
    author: 'Chef Sarah Johnson',
    category: 'Healthy Eating',
    image: BLOG_IMAGES[7],
    publishedAt: '2024-02-22T14:00:00.000Z',
    tags: ['spices', 'ordering'],
    content: `Heat should enhance flavor, not overwhelm it. Understanding spice levels helps you order confidently every time.

## Mild Favorites
Butter chicken, paneer butter masala, and margherita pizza deliver richness with gentle spice—great for kids and sensitive palates.

## Medium Heat
Chicken tikka masala, penne arrabbiata, and pepperoni pizza bring noticeable warmth without long burn.

## Bold and Fiery
Manchow soup, lamb rogan josh, and arrabbiata-style pastas lean hotter. Pair with yogurt-based drinks to balance heat.

## Custom Notes
Add delivery notes for “less spicy” or “extra spicy” when available. Cooling sides like raita-style yogurt drinks help tame chili intensity.

Listen to your body, start moderate, and build heat gradually across orders.`,
  }),
];

export const blog_posts = seedPosts;
export const BLOG_SEED_COUNT = blog_posts.length;

export default blog_posts;
