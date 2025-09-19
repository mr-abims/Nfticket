# Ticketify - Smart Contract Documentation

## Overview

Ticketify is a decentralized event ticketing platform built on Somnia that allows users to create, manage, and purchase event tickets as NFTs. The platform consists of three main smart contracts that work together to provide a comprehensive ticketing solution.



## Smart Contract Architecture

The Ticketify platform is built using a factory pattern with the following core components:

1. **EventFactory** - Central contract for creating and managing events
2. **EventManager** - Individual event contracts that handle ticket sales and management

## Smart Contracts

### 1. EventFactory Contract

The EventFactory is the central hub that manages all events in the platform. It acts as a factory contract that creates individual EventManager contracts for each event.

#### Key Features:
- **Event Creation**: Creates new EventManager contracts for events
- **Global Event Tracking**: Maintains a registry of all events
- **User Management**: Tracks events created by users
- **Ticket Tracking**: Global ticket purchase tracking across all events
- **Event Categorization**: Separates live and past events

#### Core Functions:

##### Event Creation
```solidity
function createEvent(
    string memory _eventName,
    string memory _eventAcronym,
    uint256 _regStartTime,
    uint256 _regEndTime,
    uint256 _ticketFee,
    uint256 _maxTickets,
    string memory _ticketURI
) external returns (address)
```

**Parameters:**
- `_eventName`: Unique name for the event
- `_eventAcronym`: Short identifier for the event
- `_regStartTime`: Unix timestamp when registration starts
- `_regEndTime`: Unix timestamp when registration ends
- `_ticketFee`: Cost per ticket (0 for free events)
- `_maxTickets`: Maximum number of tickets available
- `_ticketURI`: IPFS URI for ticket metadata

**Returns:** Address of the created EventManager contract

##### Event Retrieval
```solidity
function getAllEvents() external view returns (address[] memory)
function getLiveEvents() external view returns (EventManager[] memory)
function getPastEvents() external view returns (EventManager[] memory)
function getEventContractByName(string memory eventName) external view returns (address)
```

##### User Management
```solidity
function getUserCreatedEvents(address user) external view returns (EventManager[] memory)
function getUserEventCount(address user) external view returns (uint256)
function getUserAllTickets(address user) external view returns (UserTicket[] memory)
```

##### Ticket Tracking
```solidity
function recordTicketPurchase(address user, uint256 tokenId, string memory eventName) external
function getUserTicketsForEvent(address user, address eventContract) external view returns (uint256[] memory)
```

#### Events:
- `EventCreated`: Emitted when a new event is created
- `TicketPurchased`: Emitted when a ticket is purchased

### 2. EventManager Contract

Each event has its own EventManager contract that handles ticket sales, registration, and management for that specific event.

#### Key Features:
- **ERC721 NFT Tickets**: Each ticket is a unique NFT
- **Registration Management**: Time-based registration windows
- **Payment Handling**: Supports both free and paid events
- **Ticket Transfers**: Allows ticket transfers between users
- **Event Lifecycle**: Manages event start, end, and status

#### Core Functions:

##### Event Information
```solidity
function getEventInfo() public view returns (
    string memory _eventName,
    uint256 _regStartTime,
    uint256 _regEndTime,
    uint256 _ticketFee,
    bool _ticketFeeRequired,
    uint256 _maxTickets,
    uint256 _ticketsSold,
    string memory _ticketURI,
    bool _eventEnded
)
```

##### Registration
```solidity
function registerForEvent() public payable
```

**Requirements:**
- Event must not be ended
- Current time must be within registration window
- Event must not be sold out
- Correct payment amount (if ticket fee required)

##### Ticket Management
```solidity
function transferTicket(address to, uint256 tokenId) public
function getUserTickets(address user) public view returns (uint256[] memory)
```

##### Event Status
```solidity
function isEventLive() public view returns (bool)
function isEventPast() public view returns (bool)
function endEvent() public
```

#### Events:
- `UserRegistered`: Emitted when a user registers for an event
- `EventEnded`: Emitted when an event is ended
- `TicketTransferred`: Emitted when a ticket is transferred


## Testing Framework

The project uses Foundry for testing with comprehensive test coverage.

### Test Structure

The test suite (`test/EventManager.t.sol`) covers:

#### Core Functionality Tests:
- **Event Creation**: Tests event creation through factory
- **Registration**: Tests user registration for events
- **Ticket Transfers**: Tests ticket transfer functionality
- **Payment Handling**: Tests both free and paid events
- **Event Lifecycle**: Tests event start, end, and status

#### Factory Tests:
- **Multiple Event Creation**: Tests creating multiple events
- **User Management**: Tests user event tracking
- **Event Categorization**: Tests live/past event separation
- **Name Uniqueness**: Tests event name uniqueness enforcement

#### Edge Cases:
- **Time-based Registration**: Tests registration window enforcement
- **Sold Out Events**: Tests capacity limits
- **Event Ending**: Tests event lifecycle management

### Running Tests

```bash
# Run all tests
forge test

# Run tests with verbose output
forge test -vvv

# Run specific test
forge test --match-test test_CreateEvent

# Run tests with gas reporting
forge test --gas-report
```

### Test Coverage

The test suite provides comprehensive coverage including:
- ✅ Event creation and management
- ✅ User registration and ticket purchasing
- ✅ Ticket transfers and ownership
- ✅ Payment handling (free and paid events)
- ✅ Event lifecycle management
- ✅ Factory functionality
- ✅ Edge cases and error conditions

## Deployment

### Foundry Configuration

The project uses Foundry for development and deployment:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
verbose = true
verbosity = 5
```

### Build Commands

```bash
# Build contracts
forge build

# Format code
forge fmt
```

## Security Considerations

### Access Control
- **Ownable Pattern**: Uses OpenZeppelin's Ownable for access control
- **Factory Validation**: Only valid event contracts can record ticket purchases
- **Event Owner Control**: Only event owners can end events

### Input Validation
- **Time Validation**: Ensures registration times are logical
- **Name Uniqueness**: Prevents duplicate event names
- **Capacity Limits**: Enforces maximum ticket limits
- **Payment Validation**: Ensures correct payment amounts

## Usage Examples

### Creating an Event

```solidity
// Create a free event
address eventAddress = eventFactory.createEvent(
    "Blockchain Conference 2024",
    "BC24",
    block.timestamp + 86400, // Start in 1 day
    block.timestamp + 604800, // End in 1 week
    0, // Free event
    1000, // Max 1000 tickets
    "ipfs://QmYourMetadataHash"
);

// Create a paid event
address paidEventAddress = eventFactory.createEvent(
    "VIP Workshop",
    "VIP",
    block.timestamp + 3600, // Start in 1 hour
    block.timestamp + 86400, // End in 1 day
    0.1 ether, // 0.1 ETH per ticket
    50, // Max 50 tickets
    "ipfs://QmYourVIPMetadataHash"
);
```

### Registering for an Event

```solidity
// Register for free event
EventManager(eventAddress).registerForEvent();

// Register for paid event
EventManager(paidEventAddress).registerForEvent{value: 0.1 ether}();
```

### Transferring Tickets

```solidity
// Transfer ticket to another user
EventManager(eventAddress).transferTicket(recipientAddress, tokenId);
```

### Querying Events

```solidity
// Get all events
address[] memory allEvents = eventFactory.getAllEvents();

// Get live events
EventManager[] memory liveEvents = eventFactory.getLiveEvents();

// Get user's tickets
UserTicket[] memory userTickets = eventFactory.getUserAllTickets(userAddress);
```


# Frontend Integration Guide

### Integration

The smart contracts are designed to work with the Next.js frontend application

### Wallet 
- MetaMask, WalletConnect
- Deployed on Somnia blockchain
- Balance checking and transaction handling
- Gas estimation and optimization


### Data from smart contract
1. **Contract Addresses**: Deploy contracts and update addresses in `frontend/app/contracts/config.ts`
2. **ABI Files**: Update ABI files in `frontend/app/contracts/abis/`
3. **Wagmi Configuration**: Update `frontend/wagmi.config.ts` with contract addresses

### Event Creation Flow

1. User calls `EventFactory.createEvent()` with event details
2. Factory creates new `EventManager` contract
3. Factory records event in global registry
4. Event is immediately available for registration

### Ticket Purchase Flow

1. User calls `EventManager.registerForEvent()` with payment (if required)
2. Contract mints NFT ticket to user
3. Contract records purchase in factory for global tracking
4. User receives NFT ticket with metadata

### Event Management Flow

1. Event owner can call `endEvent()` after registration period
2. Factory categorizes events as live or past
3. Users can transfer tickets using `transferTicket()`
4. Event owner can withdraw funds using `withdraw()`


### Tools and Technical Features
- **Next.js 15**: Latest Next.js with App Router and React Server Components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS 4**: Modern CSS framework
- **Web3 Integration**: RainbowKit, Wagmi, and Viem integration

## 🏗️ Folder Structure

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
└── README.md



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [Wagmi Documentation](https://wagmi.sh/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
