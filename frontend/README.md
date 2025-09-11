# Ticketify - Decentralized Event Management System

A modern, blockchain-powered event management platform built with Next.js 15, TypeScript, and Tailwind CSS. Ticketify enables users to create, discover, and attend events with complete transparency and security through blockchain technology.

## 🚀 Features

### 🎯 Core Features
- **Event Creation**: Create events with comprehensive details, pricing, and capacity management
- **Event Discovery**: Browse and search events with advanced filtering options
- **Ticket Management**: Purchase, transfer, and manage NFT-based tickets
- **User Dashboard**: Comprehensive dashboard for event organizers and attendees
- **Blockchain Integration**: Built-in Web3 wallet connectivity and smart contract interactions

### 🎨 Design Features
- **Modern UI/UX**: Beautiful, responsive design with dark mode support
- **Gradient Animations**: Smooth animations and transitions throughout the app
- **Mobile-First**: Fully responsive design that works on all devices
- **Accessibility**: WCAG compliant with proper semantic HTML and ARIA labels

### 🔧 Technical Features
- **Next.js 15**: Latest Next.js with App Router and React Server Components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS 4**: Modern utility-first CSS framework
- **Web3 Integration**: Ready for RainbowKit, Wagmi, and Viem integration
- **Performance Optimized**: Image optimization, code splitting, and caching

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx       # Navigation header with wallet connection
│   │   ├── Footer.tsx       # Site footer
│   │   ├── HeroSection.tsx  # Landing page hero
│   │   ├── FeaturesSection.tsx # Features showcase
│   │   ├── EventsPreview.tsx   # Event preview section
│   │   ├── StatsSection.tsx    # Platform statistics
│   │   └── EventCard.tsx       # Event card component
│   ├── events/              # Event-related pages
│   │   ├── page.tsx         # Events listing page
│   │   └── [id]/page.tsx    # Event detail page
│   ├── create-event/        # Event creation
│   │   └── page.tsx         # Event creation form
│   ├── dashboard/           # User dashboard
│   │   └── page.tsx         # Dashboard with tabs
│   ├── lib/                 # Utility functions
│   │   └── utils.ts         # Common utilities
│   ├── types/               # TypeScript type definitions
│   │   └── event.ts         # Event-related types
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── public/                  # Static assets
└── package.json             # Dependencies and scripts
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Headless UI
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Web3 Integration (Ready)
- **Wallet Connection**: RainbowKit
- **Ethereum Interaction**: Wagmi + Viem
- **State Management**: TanStack React Query
- **Supported Networks**: Ethereum, Polygon, Arbitrum, Optimism

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ticketify/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Linting
npx next lint
```

## 📱 Pages Overview

### 🏠 Landing Page (`/`)
- Hero section with platform introduction
- Feature highlights with blockchain benefits
- Event previews with mock data
- Platform statistics and trust indicators
- Call-to-action sections

### 🎪 Events Page (`/events`)
- Comprehensive event listing with search and filters
- Category filtering (Conference, Concert, Workshop, etc.)
- Sorting options (Date, Price, Popularity, Availability)
- Grid and list view options
- Real-time availability indicators

### 📝 Event Detail Page (`/events/[id]`)
- Complete event information with image gallery
- Speaker profiles and event agenda
- Interactive ticket purchasing interface
- Availability tracking and pricing
- Smart contract information display

### ✨ Create Event Page (`/create-event`)
- Multi-step event creation wizard
- Form validation and image preview
- Real-time event summary
- Blockchain integration ready
- Responsive design for all devices

### 📊 Dashboard Page (`/dashboard`)
- User overview with key metrics
- Event management for organizers
- Ticket management for attendees
- Revenue tracking and analytics
- Recent activity feed

## 🎨 Design System

### Color Palette
- **Primary**: Blue to Purple gradient (`from-blue-600 to-purple-600`)
- **Secondary**: Slate tones for text and backgrounds
- **Accent Colors**: Green (success), Red (error), Orange (warning)

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Headings**: Bold weights with proper hierarchy
- **Body Text**: Regular weight with good line spacing

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with smooth transitions

## 🔗 Web3 Integration (Ready for Implementation)

The application is prepared for Web3 integration with:

### Smart Contract Functions
- Event creation and management
- Ticket minting as NFTs (ERC-721)
- Secure payment processing
- Ownership verification
- Transfer functionality

### Wallet Integration
- MetaMask, WalletConnect
- Network switching capabilities
- Balance checking and transaction handling
- Gas estimation and optimization

## 🎯 Future Enhancements

### Phase 2 Features
- [ ] Advanced analytics and reporting
- [ ] Secondary marketplace for ticket resales
- [ ] Social features and event reviews

### Phase 3 Features
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced event streaming integration
- [ ] DAO governance features
- [ ] Cross-chain compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

**Built with ❤️ for the decentralized future of events**