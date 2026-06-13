# Pickpock 🛍️

**AI-Powered E-commerce Platform for Modern Shopping**

Pickpock is a cutting-edge e-commerce platform that combines artificial intelligence with seamless shopping experiences. Built for the Thai market with full bilingual support (TH/EN), Pickpock offers intelligent product recommendations, smart search, and real-time inventory management.

## ✨ Features

### For Customers
- 🛒 **Smart Shopping** - AI-curated product recommendations and bundle suggestions
- 🔍 **Intelligent Search** - Natural language search that understands context
- 💳 **Multiple Payment Options** - With secure checkout process
- ❤️ **Wishlist** - Save your favorite items for later
- ⚖️ **Product Comparison** - Compare up to 4 products side-by-side
- 👑 **VIP Membership** - Get 10% discount on all purchases
- 📦 **Order Tracking** - Real-time order status updates

### For Partners (Store Owners)
- 🏪 **Store Management** - Easy product upload and inventory tracking
- 🤖 **AI Description Generator** - Automatically generate product descriptions
- 📊 **Sales Analytics** - Track performance with detailed KPIs
- 📈 **Demand Insights** - AI-powered pricing recommendations
- 🎯 **Customer Analytics** - Understand your buyers better

### For Founders (Platform Admins)
- 📉 **Comprehensive Dashboards** - Full platform analytics
- 🏢 **Multi-Store Management** - Manage all partner stores
- 📊 **Advanced KPIs** - Revenue, user growth, and conversion tracking
- 🎨 **Category Analytics** - Understand market trends
- 💰 **Revenue Share Analysis** - Official Mall vs Partner performance

### AI Features
- 🤖 **AI Chatbot** - 24/7 intelligent customer support
- ✍️ **Auto-Description** - AI writes engaging product descriptions
- 🔮 **Sales Forecasting** - Predict demand and optimize pricing
- 🎁 **Smart Bundles** - AI suggests products that go well together
- 💬 **Review Analysis** - AI summarizes customer feedback

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see Pickpock in action.

## 🌐 Environment Variables

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + SWR
- **AI**: Google Gemini (Generative AI)
- **Storage**: Supabase
- **Icons**: Lucide React
- **Theming**: next-themes (Dark/Light mode)

## 📁 Project Structure

```
pickpock/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── ai/           # AI endpoints
│   │   ├── auth/         # Authentication
│   │   ├── orders/       # Order management
│   │   └── products/     # Product CRUD
│   ├── founder/          # Founder dashboard
│   ├── partner/          # Partner dashboard
│   └── products/         # Product pages
├── components/            # Reusable components
│   ├── analytics/        # KPI charts
│   ├── products/         # Product-related components
│   └── shared/           # Shared UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and data
├── services/             # Business logic layer
│   ├── ai/              # AI services
│   ├── analytics/       # Analytics calculations
│   └── ...
└── types/               # TypeScript type definitions
```

## 🎨 Design Philosophy

- **Thai-First**: Primary language is Thai with English as secondary
- **Clean UI**: Minimal clutter, focus on content
- **Performance**: Optimized for Lighthouse scores > 90
- **Accessibility**: WCAG AA compliant
- **Mobile-First**: Responsive design for all devices

## 📊 KPIs & Analytics

The platform provides comprehensive analytics including:
- Revenue trends (7/30/90 days)
- Category distribution
- Store performance rankings
- Low stock alerts
- Customer conversion rates
- VIP vs Member purchase patterns

## 🔐 User Roles

1. **Customer (Member)** - Regular shoppers
2. **VIP** - Premium members with 10% discount
3. **Partner** - Store owners with product management
4. **Founder** - Platform administrators with full access

## 🤝 Contributing

Contributions are welcome! Please follow our coding standards and submit PRs for review.

## 📄 License

This project is part of ITMSU Hackathon 2026.

---

Built with ❤️ for the ITMSU Hackathon 2026
