import { getGalleryImages, getMenuImage } from './menuImages';

/**
 * Compact seed rows:
 * [id, name, category, type, price, imageIndex, prepTime, description, details, ingredients, allergens, nutrition]
 * nutrition: [calories, servingSize, protein, carbs, fat, fiber, sugar, sodium]
 */
const MENU_ROWS = [
  [1, 'Pancakes', 'Breakfast', 'veg', 499, 0, 12, 'Fluffy buttermilk pancakes with maple syrup and butter.', 'Served warm with seasonal fruit garnish and whipped cream on request.', 'Flour, buttermilk, eggs, butter, sugar, baking powder, maple syrup, salt', 'Contains gluten, dairy, eggs', [420, '3 pancakes (220g)', 8, 62, 14, 3, 22, 380]],
  [2, 'Chicken Soup', 'Soup', 'non_veg', 399, 1, 18, 'Hearty clear chicken broth with vegetables and shredded chicken.', 'Slow-simmered stock with herbs — light, comforting, and protein-rich.', 'Chicken, carrot, celery, onion, garlic, bay leaf, pepper, salt', 'Contains celery; may contain traces of gluten', [185, '350ml bowl', 16, 12, 7, 2, 3, 720]],
  [3, 'Minestrone Soup', 'Soup', 'veg', 349, 2, 16, 'Italian vegetable soup with beans, pasta, and tomato broth.', 'Topped with parmesan and fresh basil for a rustic finish.', 'Tomato, beans, pasta, carrot, celery, zucchini, onion, olive oil, herbs', 'Contains gluten, dairy', [210, '350ml bowl', 9, 28, 6, 6, 8, 640]],
  [4, 'Spaghetti Carbonara', 'Pasta', 'non_veg', 999, 3, 22, 'Classic Roman pasta with egg, pecorino, guanciale, and black pepper.', 'Creamy without cream — finished with aged cheese and cracked pepper.', 'Spaghetti, egg, pecorino, guanciale, black pepper, garlic, salt', 'Contains gluten, dairy, eggs', [680, '1 plate (380g)', 28, 72, 32, 4, 3, 980]],
  [5, 'Veg Alfredo Pasta', 'Pasta', 'veg', 899, 4, 20, 'Fettuccine in rich parmesan cream sauce with sautéed vegetables.', 'Silky sauce tossed with broccoli, bell pepper, and sweet corn.', 'Pasta, cream, parmesan, butter, broccoli, bell pepper, corn, garlic', 'Contains gluten, dairy', [620, '1 plate (360g)', 18, 68, 28, 5, 6, 840]],
  [6, 'Chicken Alfredo Pasta', 'Pasta', 'non_veg', 1099, 5, 24, 'Grilled chicken strips over fettuccine in creamy alfredo sauce.', 'Finished with parsley and extra parmesan for a indulgent main.', 'Pasta, chicken breast, cream, parmesan, butter, garlic, parsley', 'Contains gluten, dairy', [740, '1 plate (400g)', 42, 65, 34, 4, 5, 920]],
  [7, 'Paneer Butter Masala', 'Main Course', 'veg', 799, 6, 25, 'Cottage cheese cubes in rich tomato-butter gravy with fenugreek.', 'North Indian favourite — pairs well with naan or jeera rice.', 'Paneer, tomato, butter, cream, cashew, onion, ginger-garlic, spices', 'Contains dairy, nuts', [480, '1 bowl (300g)', 22, 18, 36, 4, 10, 780]],
  [8, 'Chicken Biryani', 'Main Course', 'non_veg', 1199, 7, 35, 'Fragrant basmati rice layered with spiced chicken and caramelized onions.', 'Dum-cooked with saffron, mint, and fried onions — served with raita.', 'Basmati rice, chicken, yogurt, onion, saffron, biryani masala, ghee', 'Contains dairy', [650, '1 plate (450g)', 38, 72, 22, 3, 4, 890]],
  [9, 'Margherita Pizza', 'Pizza', 'veg', 649, 8, 18, 'Thin crust pizza with tomato sauce, mozzarella, and fresh basil.', 'Wood-fired style crust with San Marzano-style tomato base.', 'Flour, tomato, mozzarella, basil, olive oil, yeast, salt', 'Contains gluten, dairy', [720, '10 inch pizza', 28, 82, 24, 4, 8, 1120]],
  [10, 'Pepperoni Pizza', 'Pizza', 'non_veg', 749, 9, 18, 'Classic pepperoni pizza with mozzarella on a crisp crust.', 'Generous pepperoni slices with oregano and chili flakes.', 'Flour, tomato, mozzarella, pepperoni, oregano, olive oil, yeast', 'Contains gluten, dairy', [820, '10 inch pizza', 34, 78, 38, 4, 6, 1380]],
  [11, 'Veggie Burger', 'Burger', 'veg', 499, 10, 15, 'Grilled vegetable patty with lettuce, tomato, and house sauce.', 'Served in a toasted brioche bun with crispy fries on the side.', 'Bun, veg patty, lettuce, tomato, onion, pickles, house sauce', 'Contains gluten, soy, sesame', [540, '1 burger + fries', 14, 58, 26, 6, 9, 980]],
  [12, 'Chicken Burger', 'Burger', 'non_veg', 599, 11, 16, 'Crispy fried chicken fillet with coleslaw and spicy mayo.', 'Double-layer crunch with melted cheese optional on request.', 'Bun, chicken breast, lettuce, coleslaw, mayo, pickles', 'Contains gluten, dairy, eggs', [620, '1 burger + fries', 32, 52, 30, 4, 7, 1100]],
  [13, 'Tomato Soup', 'Soup', 'veg', 299, 12, 14, 'Creamy roasted tomato soup with a hint of basil.', 'Blended smooth and finished with a swirl of cream.', 'Tomato, onion, garlic, cream, basil, vegetable stock, butter', 'Contains dairy', [160, '350ml bowl', 4, 18, 9, 3, 12, 580]],
  [14, 'Egg Sandwich', 'Breakfast', 'non_veg', 349, 13, 10, 'Fluffy scrambled eggs in toasted multigrain bread.', 'With cheddar, tomato, and microgreens — perfect morning bite.', 'Multigrain bread, eggs, cheddar, tomato, butter, microgreens', 'Contains gluten, dairy, eggs', [380, '1 sandwich', 18, 34, 18, 4, 4, 620]],
  [15, 'Mushroom Soup', 'Soup', 'veg', 349, 14, 16, 'Creamy wild mushroom soup with thyme and cracked pepper.', 'Made with button and shiitake mushrooms for depth of flavour.', 'Mushroom, cream, onion, garlic, thyme, butter, vegetable stock', 'Contains dairy', [195, '350ml bowl', 6, 14, 14, 2, 4, 520]],
  [16, 'Chicken Tikka Masala', 'Main Course', 'non_veg', 1199, 15, 28, 'Char-grilled chicken tikka in creamy tomato-onion gravy.', 'British-Indian classic with bell pepper and kasuri methi.', 'Chicken, yogurt, tomato, cream, onion, tikka masala, bell pepper', 'Contains dairy', [520, '1 bowl (320g)', 40, 14, 32, 3, 8, 860]],
  [17, 'Cheese Omelette', 'Breakfast', 'non_veg', 399, 16, 8, 'Three-egg omelette folded with cheddar and herbs.', 'Served with buttered toast and grilled tomato.', 'Eggs, cheddar, butter, herbs, toast, tomato', 'Contains gluten, dairy, eggs', [410, '1 plate', 24, 8, 32, 1, 2, 740]],
  [18, 'Fettuccine Alfredo', 'Pasta', 'veg', 949, 17, 20, 'Wide ribbon pasta in classic butter and parmesan sauce.', 'Simple, rich, and finished with nutmeg and parsley.', 'Fettuccine, butter, parmesan, cream, nutmeg, parsley, garlic', 'Contains gluten, dairy', [590, '1 plate (340g)', 16, 64, 26, 3, 4, 780]],
  [19, 'Garlic Bread', 'Pizza', 'veg', 299, 18, 10, 'Toasted baguette slices with garlic butter and herbs.', 'Topped with melted mozzarella — ideal as a side or starter.', 'Baguette, butter, garlic, parsley, mozzarella, oregano', 'Contains gluten, dairy', [320, '6 pieces', 10, 38, 14, 2, 2, 680]],
  [20, 'Fish and Chips', 'Main Course', 'non_veg', 1099, 19, 22, 'Beer-battered cod with golden fries and tartar sauce.', 'Crispy outside, flaky inside — pub-style comfort food.', 'Cod, flour, beer, potato, tartar sauce, lemon, peas', 'Contains gluten, fish, eggs', [780, '1 plate (420g)', 36, 68, 38, 5, 4, 1020]],
  [21, 'Hash Browns', 'Breakfast', 'veg', 249, 20, 12, 'Crispy shredded potato patties fried until golden.', 'Seasoned with salt, pepper, and a touch of onion.', 'Potato, onion, salt, pepper, vegetable oil', 'None declared', [280, '3 pieces', 4, 34, 16, 3, 1, 420]],
  [22, 'Vegetable Soup', 'Soup', 'veg', 329, 21, 15, 'Seasonal mixed vegetable soup in light herb broth.', 'Low-calorie, colourful, and packed with garden vegetables.', 'Carrot, beans, peas, corn, celery, onion, tomato, herbs', 'None declared', [120, '350ml bowl', 4, 22, 3, 5, 8, 480]],
  [23, 'Egg Fried Rice', 'Main Course', 'non_veg', 599, 22, 16, 'Wok-tossed jasmine rice with egg, spring onion, and soy.', 'Smoky high-heat stir fry with carrots and green peas.', 'Rice, egg, spring onion, carrot, peas, soy sauce, sesame oil', 'Contains gluten, eggs, soy, sesame', [440, '1 plate (350g)', 14, 68, 12, 3, 3, 920]],
  [24, 'Hawaiian Pizza', 'Pizza', 'non_veg', 799, 23, 18, 'Ham and pineapple pizza with mozzarella on tomato base.', 'Sweet and savoury combo with a crisp crust edge.', 'Flour, tomato, mozzarella, ham, pineapple, oregano', 'Contains gluten, dairy', [760, '10 inch pizza', 30, 80, 26, 4, 14, 1240]],
  [25, 'Pasta Primavera', 'Pasta', 'veg', 899, 24, 20, 'Penne with seasonal vegetables in light olive oil and herb sauce.', 'Colourful medley of zucchini, cherry tomato, and asparagus.', 'Penne, zucchini, tomato, asparagus, olive oil, garlic, herbs', 'Contains gluten', [480, '1 plate (340g)', 12, 62, 16, 7, 8, 520]],
  [26, 'French Toast', 'Breakfast', 'veg', 429, 0, 12, 'Thick brioche slices dipped in cinnamon custard and pan-fried.', 'Dusted with icing sugar and served with berry compote.', 'Brioche, eggs, milk, cinnamon, sugar, butter, berry compote', 'Contains gluten, dairy, eggs', [450, '2 slices', 12, 54, 18, 2, 28, 420]],
  [27, 'Masala Dosa', 'Breakfast', 'veg', 379, 1, 15, 'Crispy rice crepe filled with spiced potato masala.', 'Served with coconut chutney and sambar on the side.', 'Rice, urad dal, potato, mustard, curry leaves, chutney, sambar', 'None declared', [320, '1 dosa plate', 8, 52, 8, 4, 3, 580]],
  [28, 'Lentil Soup', 'Soup', 'veg', 319, 5, 20, 'Hearty red lentil soup with cumin and lemon.', 'Protein-packed, vegan-friendly, and naturally gluten-free.', 'Red lentil, onion, carrot, cumin, lemon, vegetable stock', 'None declared', [180, '350ml bowl', 11, 28, 3, 8, 4, 520]],
  [29, 'Penne Arrabbiata', 'Pasta', 'veg', 849, 10, 18, 'Penne in spicy tomato sauce with garlic and chili.', 'Vegan option available on request — bold and fiery.', 'Penne, tomato, garlic, chili, olive oil, parsley, basil', 'Contains gluten', [420, '1 plate (320g)', 12, 68, 10, 5, 8, 620]],
  [30, 'Pesto Pasta', 'Pasta', 'veg', 879, 11, 17, 'Fusilli tossed in fresh basil pesto with pine nuts.', 'Topped with cherry tomatoes and shaved parmesan.', 'Fusilli, basil, pine nuts, parmesan, olive oil, garlic, tomato', 'Contains gluten, dairy, nuts', [510, '1 plate (330g)', 14, 58, 22, 4, 4, 580]],
  [31, 'Dal Makhani', 'Main Course', 'veg', 649, 15, 30, 'Slow-cooked black lentils in creamy tomato-butter gravy.', 'Overnight simmered for authentic smoky depth.', 'Black urad dal, rajma, butter, cream, tomato, spices', 'Contains dairy', [380, '1 bowl (280g)', 16, 42, 14, 10, 6, 620]],
  [32, 'Butter Chicken', 'Main Course', 'non_veg', 999, 16, 28, 'Tandoori chicken in velvety tomato-butter masala.', 'Mild, creamy curry — our most ordered main course.', 'Chicken, tomato, butter, cream, cashew, fenugreek, spices', 'Contains dairy, nuts', [490, '1 bowl (300g)', 36, 12, 34, 2, 8, 780]],
  [33, 'Palak Paneer', 'Main Course', 'veg', 699, 17, 22, 'Cottage cheese cubes in spiced spinach purée.', 'Healthy North Indian classic with garlic tempering.', 'Paneer, spinach, onion, tomato, cream, garlic, spices', 'Contains dairy', [360, '1 bowl (280g)', 18, 14, 24, 6, 5, 640]],
  [34, 'Lamb Rogan Josh', 'Main Course', 'non_veg', 1299, 18, 40, 'Kashmiri-style lamb curry with aromatic whole spices.', 'Tender lamb slow-braised in rich red gravy.', 'Lamb, yogurt, onion, kashmiri chili, fennel, ginger, spices', 'Contains dairy', [520, '1 bowl (320g)', 42, 10, 36, 2, 4, 820]],
  [35, 'Grilled Salmon', 'Main Course', 'non_veg', 1399, 19, 20, 'Atlantic salmon fillet with lemon butter and asparagus.', 'Pan-seared to medium with herb roasted potatoes.', 'Salmon, butter, lemon, asparagus, potato, dill, olive oil', 'Contains fish, dairy', [450, '1 fillet plate', 40, 18, 28, 4, 2, 580]],
  [36, 'BBQ Chicken Pizza', 'Pizza', 'non_veg', 849, 20, 20, 'Smoky BBQ sauce base with grilled chicken and red onion.', 'Topped with mozzarella and fresh cilantro.', 'Flour, BBQ sauce, chicken, onion, mozzarella, cilantro', 'Contains gluten, dairy', [790, '10 inch pizza', 36, 76, 28, 4, 12, 1180]],
  [37, 'Four Cheese Pizza', 'Pizza', 'veg', 799, 21, 18, 'White base pizza with mozzarella, cheddar, gorgonzola, and parmesan.', 'Creamy, indulgent, and baked until golden.', 'Flour, mozzarella, cheddar, gorgonzola, parmesan, cream', 'Contains gluten, dairy', [840, '10 inch pizza', 32, 72, 36, 3, 4, 1320]],
  [38, 'Farmhouse Pizza', 'Pizza', 'veg', 749, 22, 18, 'Loaded veggie pizza with bell pepper, corn, olive, and onion.', 'Tomato base with generous mozzarella on thin crust.', 'Flour, tomato, mozzarella, bell pepper, corn, olive, onion', 'Contains gluten, dairy', [680, '10 inch pizza', 22, 78, 22, 6, 10, 1060]],
  [39, 'Double Patty Burger', 'Burger', 'non_veg', 749, 23, 18, 'Two smashed beef patties with double cheese and special sauce.', 'Stacked high with caramelized onion and pickles.', 'Bun, beef patty, cheddar, onion, pickles, special sauce', 'Contains gluten, dairy, eggs', [820, '1 burger + fries', 44, 48, 42, 3, 8, 1420]],
  [40, 'Grilled Paneer Burger', 'Burger', 'veg', 549, 24, 15, 'Marinated grilled paneer patty with mint mayo and lettuce.', 'Spiced tandoori-style paneer in a soft sesame bun.', 'Bun, paneer, mint mayo, lettuce, tomato, onion, spices', 'Contains gluten, dairy, sesame', [520, '1 burger + fries', 20, 46, 24, 5, 6, 880]],
  [41, 'Chocolate Brownie', 'Dessert', 'veg', 299, 2, 8, 'Warm fudge brownie with dark chocolate chunks.', 'Served with vanilla ice cream scoop optional (+Rs.80).', 'Dark chocolate, butter, flour, eggs, sugar, cocoa', 'Contains gluten, dairy, eggs, nuts may be present', [420, '1 piece (120g)', 5, 52, 22, 3, 38, 180]],
  [42, 'Gulab Jamun', 'Dessert', 'veg', 249, 3, 5, 'Soft milk-solid dumplings soaked in cardamom sugar syrup.', 'Served warm — two pieces per portion.', 'Milk solids, flour, sugar, cardamom, ghee, rose water', 'Contains gluten, dairy', [380, '2 pieces', 6, 58, 14, 0, 48, 120]],
  [43, 'Ice Cream Sundae', 'Dessert', 'veg', 349, 4, 5, 'Vanilla ice cream with chocolate sauce, nuts, and cherry.', 'Classic diner-style sundae in a glass bowl.', 'Vanilla ice cream, chocolate sauce, nuts, cherry, wafer', 'Contains dairy, nuts, gluten', [450, '1 sundae', 7, 58, 20, 2, 42, 140]],
  [44, 'New York Cheesecake', 'Dessert', 'veg', 399, 5, 5, 'Creamy baked cheesecake on a buttery biscuit base.', 'Topped with berry compote and mint.', 'Cream cheese, biscuit, butter, egg, sugar, berry compote', 'Contains gluten, dairy, eggs', [480, '1 slice', 8, 42, 32, 1, 28, 320]],
  [45, 'Tiramisu', 'Dessert', 'veg', 429, 6, 5, 'Espresso-soaked ladyfingers with mascarpone cream.', 'Dusted with cocoa — Italian classic done right.', 'Mascarpone, ladyfinger, espresso, egg, cocoa, sugar', 'Contains gluten, dairy, eggs', [390, '1 portion', 6, 38, 24, 1, 22, 95]],
  [46, 'Mango Lassi', 'Beverages', 'veg', 199, 7, 3, 'Thick yogurt smoothie blended with Alphonso mango.', 'Refreshing, cooling, and lightly sweetened.', 'Yogurt, mango pulp, sugar, cardamom, ice', 'Contains dairy', [220, '300ml glass', 8, 38, 4, 1, 32, 85]],
  [47, 'Cold Coffee', 'Beverages', 'veg', 179, 8, 4, 'Chilled espresso blended with milk, ice, and vanilla.', 'Topped with whipped cream on request.', 'Espresso, milk, ice, sugar, vanilla', 'Contains dairy', [180, '350ml glass', 6, 24, 6, 0, 20, 95]],
  [48, 'Fresh Lime Soda', 'Beverages', 'veg', 149, 9, 3, 'Freshly squeezed lime with soda — sweet or salted.', 'Perfect palate cleanser with mint leaves.', 'Lime, soda, sugar or salt, mint, ice', 'None declared', [60, '300ml glass', 0, 16, 0, 0, 14, 120]],
  [49, 'Masala Chai', 'Beverages', 'veg', 129, 10, 5, 'Indian spiced tea brewed with milk, ginger, and cardamom.', 'Served hot in a traditional cutting glass.', 'Tea, milk, ginger, cardamom, cinnamon, sugar', 'Contains dairy', [120, '200ml cup', 3, 18, 4, 0, 14, 65]],
  [50, 'Berry Smoothie', 'Beverages', 'veg', 219, 11, 4, 'Mixed berry smoothie with banana, yogurt, and honey.', 'Packed with antioxidants — no added artificial flavours.', 'Strawberry, blueberry, banana, yogurt, honey, ice', 'Contains dairy', [190, '350ml glass', 5, 36, 3, 4, 28, 55]],
];

function buildMenuItem(row) {
  const [
    id,
    food_name,
    food_category,
    food_type,
    price,
    imageIndex,
    prepTime,
    description,
    details,
    ingredients,
    allergens,
    [calories, servingSize, protein, carbs, fat, fiber, sugar, sodium],
  ] = row;

  return {
    id,
    food_name,
    food_category,
    food_type,
    food_quantity: 1,
    food_image: getMenuImage(imageIndex),
    price,
    description,
    details,
    ingredients,
    allergens,
    prepTime,
    nutrition: {
      calories,
      servingSize,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
    },
    galleryImages: getGalleryImages(imageIndex),
    available: true,
  };
}

export const food_items = MENU_ROWS.map(buildMenuItem);

export const MENU_SEED_VERSION = 2;
export const MENU_SEED_COUNT = 50;

if (MENU_ROWS.length !== MENU_SEED_COUNT) {
  throw new Error(`Menu seed mismatch: expected ${MENU_SEED_COUNT} items, found ${MENU_ROWS.length}`);
}
