# 🍕 Food Delivery App

A modern, responsive food delivery application built with React and Tailwind CSS. This app allows users to browse food items by category, search for specific dishes, and manage their shopping cart.

## ✨ Features

- **Category Filtering**: Browse food items by categories (All, Breakfast, Soups, Pasta, Main Course, Pizza, Burgers)
- **Search Functionality**: Search for food items by name
- **Shopping Cart**: Add items to cart, manage quantities, and view total
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive UI**: Smooth animations and hover effects
- **Real-time Notifications**: Get notified when items are added/removed from cart

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd food-delivery
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Built With

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **ESLint** - Code linting

## 📁 Project Structure

```
food-delivery/
├── src/
│   ├── components/
│   │   ├── Card.jsx          # Food item card component
│   │   ├── Nav.jsx           # Navigation bar with search
│   │   ├── CartModal.jsx     # Shopping cart modal
│   │   └── Notification.jsx  # Toast notifications
│   ├── pages/
│   │   └── Home.jsx          # Main page component
│   ├── assets/               # Food images
│   ├── Categories.jsx        # Category definitions
│   ├── food.js              # Food data
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── public/
└── package.json
```

## 🎯 Key Features Explained

### Category Filtering
- Click on any category card to filter food items
- Selected category is highlighted with a green border
- "All" category shows all available items

### Search Functionality
- Real-time search as you type
- Searches through food item names
- Works in combination with category filtering

### Shopping Cart
- Add items to cart with the "Add to Cart" button
- View cart by clicking the shopping bag icon
- Manage item quantities with +/- buttons
- Remove items with the trash icon
- See total amount and proceed to checkout

### Notifications
- Toast notifications appear when items are added/removed
- Auto-dismiss after 3 seconds
- Can be manually dismissed

## 🎨 Styling

The app uses Tailwind CSS for styling with:
- Green color scheme for food/branding
- Responsive grid layouts
- Smooth transitions and hover effects
- Modern card-based design
- Custom scrollbars for better UX

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Food images from various sources
- React Icons for the icon library
- Tailwind CSS for the styling framework
