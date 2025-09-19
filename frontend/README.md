# Ticketify - Decentralized Event Management System

A modern, blockchain-powered event management platform built with Next.js, TypeScript, Solidity, and Tailwind CSS. Ticketify enables users to create, discover, and attend events with complete transparency and security through blockchain technology.

## 🚀 Features

### 🎯 Core Features
- **Event Creation**: Create events with comprehensive details, pricing, and capacity management
- **Event Discovery**: Browse and search events with advanced filtering options
- **Ticket Management**: Purchase, transfer, and manage NFT-based tickets
- **User Dashboard**: Comprehensive dashboard for event organizers and attendees
- **Blockchain Integration**: Built-in Web3 wallet connectivity and smart contract interactions

### 🔧 Technical Features
- **Next.js 15**: Latest Next.js with App Router and React Server Components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS 4**: Modern CSS framework
- **Web3 Integration**:RainbowKit, Wagmi, and Viem integration


## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── components/                        # UI components
│   │   ├── ConnectButton.tsx             # Wallet connection
│   │   ├── EventCard.tsx                 # Event display
│   │   ├── EventCreationModal.tsx        # Event creation
│   │   ├── Header.tsx                    # Navigation
│   │   ├── HeroSection.tsx               # Landing hero
│   │   └── ...                           # Other components
│   ├── contracts/                        # Smart contract integration
│   │   ├── abis/                         # Contract ABIs
│   │   └── config.ts                     # Contract addresses
│   ├── events/                           # Event pages
│   │   ├── [id]/page.tsx                 # Event detail
│   │   └── page.tsx                      # Events listing
│   ├── create-event/page.tsx             # Event creation
│   ├── dashboard/page.tsx                # User dashboard
│   ├── hooks/                            # Custom hooks
│   ├── lib/                              # Utilities
│   ├── types/                            # TypeScript types
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Landing page
├── public/                                # Static assets
├── next.config.ts                         # Next.js config
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript config
├── wagmi.config.ts                        # Web3 config
└── README.md                              # Documentation
```


### Web3 Integration
- **Wallet Connection**: RainbowKit
- **Ethereum Interaction**: Wagmi + Viem
- **State Management**: TanStack React Query
- **Supported Networks**: Somnia

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
- Real time availability indicators

### 📝 Event Detail Page (`/events/[id]`)
- Complete event information with image gallery
- Interactive ticket purchasing interface
- Availability tracking and pricing
- Smart contract information display

### ✨ Create Event Page (`/create-event`)
- Multi-step event creation 
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
- **Primary**: Black to Purple gradient 
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
- Balance checking and transaction handling
- Gas estimation and optimization

## 🎯 Future Enhancements

### Phase 2 Features
- [ ] Advanced analytics and reporting
- [ ] Secondary marketplace for ticket resales
- [ ] Social features and event reviews
- [ ] ZKVerify


### Phase 3 Features
- [ ] Mobile app development
- [ ] Multi-blockchain support
- [ ] Advanced event streaming integration
- [ ] DAO governance features
- [ ] Cross-chain compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
