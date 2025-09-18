# 🧪 Complete System Testing Guide

## 📋 Pre-Testing Setup

### 1. Environment Variables Setup
Create a `.env.local` file in the `frontend/` directory:

```bash
# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key_here

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

**Get Pinata API Keys:**
1. Go to https://app.pinata.cloud/
2. Sign up/login
3. Navigate to "API Keys" in the sidebar
4. Click "New Key"
5. Enable "Admin" permissions
6. Copy the API Key and Secret Key

### 2. Network Configuration
✅ **Already Configured**: Your contracts are deployed on **Sepolia** at:
- **EventFactory**: `0x0a820c3956d9903e3af9053f5dd084fa9b05a033`

### 3. Wallet Setup
- Install MetaMask or another Web3 wallet
- Add Sepolia testnet if not already added
- Get Sepolia ETH from faucet: https://sepoliafaucet.com/

## 🚀 Testing Workflow

### Phase 1: Environment Verification
```bash
cd frontend
npm run dev
```

**Test Checklist:**
- [ ] App loads without errors
- [ ] Wallet connection works
- [ ] Network check shows correct network (Sepolia)
- [ ] No console errors related to missing environment variables

### Phase 2: Event Creation Flow
Navigate to `/create-event`

**Test Steps:**
1. **Basic Form Validation**
   - [ ] Try submitting empty form → Should show validation errors
   - [ ] Fill required fields partially → Should prevent progression

2. **Image Upload Test**
   - [ ] Select an image file
   - [ ] Should see "Uploading to IPFS..." spinner
   - [ ] Should see "Image uploaded successfully!" message
   - [ ] Should see image preview
   - [ ] Check browser console for IPFS URL

3. **Date/Time Validation**
   - [ ] Try selecting past date → Should show error
   - [ ] Try selecting date < 2 hours from now → Should show error
   - [ ] Select valid future date → Should accept

4. **Complete Event Creation**
   ```
   Test Event Data:
   - Title: "Blockchain Workshop 2024"
   - Description: "Learn smart contract development"
   - Date: [3+ hours from now]
   - Location: "Tech Hub Downtown"
   - Category: "Technology"
   - Ticket Price: "0.01" (ETH)
   - Total Tickets: "50"
   ```

5. **Blockchain Interaction**
   - [ ] Click "Create Event"
   - [ ] Wallet should prompt for transaction
   - [ ] Check console for debug logs with timestamps
   - [ ] Transaction should succeed
   - [ ] Should redirect to events page with success message

### Phase 3: Event Listing Verification
Navigate to `/events`

**Test Checklist:**
- [ ] Your created event appears in the list
- [ ] Event image displays correctly (from IPFS)
- [ ] Event details are accurate
- [ ] Price shows in ETH
- [ ] Availability shows correctly

### Phase 4: Event Details Page
Click on your created event

**Test Checklist:**
- [ ] Event details page loads
- [ ] All information is accurate
- [ ] Image loads from IPFS
- [ ] Contract information shows correct address
- [ ] Network shows "Sepolia Network"
- [ ] Purchase button is enabled

### Phase 5: Ticket Purchase
On the event details page:

**Test Steps:**
1. **Purchase Flow**
   - [ ] Select ticket quantity
   - [ ] Click "Purchase Tickets"
   - [ ] Confirm in modal
   - [ ] Wallet prompts for payment
   - [ ] Transaction succeeds
   - [ ] Redirects to dashboard with success message

2. **Ownership Verification**
   - [ ] Dashboard shows purchased tickets
   - [ ] Ticket details are correct
   - [ ] Event page shows reduced availability

### Phase 6: Advanced Features
Navigate to `/dashboard`

**Test Checklist:**
- [ ] Shows created events
- [ ] Shows owned tickets
- [ ] Ticket transfer modal works
- [ ] Transfer functionality works (test with another address)

## 🔍 Debug Information

### Console Logs to Watch For:
```javascript
// Event creation debug log
Creating event with data: {
  eventName: "Blockchain Workshop 2024",
  regStartTime: "1704067380", // Should be ~3 minutes from now
  regStartTimeDate: "2024-01-01T00:03:00.000Z (3min buffer)",
  regEndTime: "1704070800",
  regEndTimeDate: "2024-01-01T01:00:00.000Z",
  eventDate: "2024-01-01T02:00:00.000Z",
  ticketFee: "0.01 ETH",
  maxTickets: 50,
  ticketURI: "https://gateway.pinata.cloud/ipfs/Qm..."
}
```

### Network Requests to Monitor:
- **Pinata Image Upload**: `POST https://api.pinata.cloud/pinning/pinFileToIPFS`
- **Pinata JSON Upload**: `POST https://api.pinata.cloud/pinning/pinJSONToIPFS`
- **Contract Calls**: Check MetaMask for transaction details

## 🐛 Common Issues & Solutions

### Issue: "Pinata API keys not configured"
**Solution**: Set up `.env.local` file with valid Pinata keys

### Issue: "Please switch to Sepolia network"
**Solution**: Change wallet network to Sepolia testnet

### Issue: "Event must be scheduled at least 2 hours from now"
**Solution**: Select a date/time at least 2 hours in the future

### Issue: Image not loading
**Solution**: Check IPFS URL in console, may need to wait for propagation

### Issue: Transaction fails
**Solution**: 
- Ensure sufficient Sepolia ETH
- Check gas fees
- Verify contract address is correct

## 📊 Success Criteria

### ✅ Complete Success:
- [ ] Event created successfully on blockchain
- [ ] Image uploaded to IPFS and displays correctly
- [ ] Event appears in listings with real data
- [ ] Tickets can be purchased
- [ ] Dashboard shows real user data
- [ ] All timestamps are correct (3min buffer applied)

### 🎯 Performance Metrics:
- Image upload: < 10 seconds
- Event creation: < 30 seconds (including blockchain confirmation)
- Page loads: < 3 seconds
- No console errors

## 🔄 Continuous Testing

After initial success, test edge cases:
- Network switching during transaction
- Large image files
- Special characters in event names
- Multiple events creation
- Concurrent ticket purchases

---

**Happy Testing! 🚀**

Let me know if you encounter any issues during testing!
