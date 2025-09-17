// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EventManager} from "./EventManager.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract EventFactory is Ownable {
    EventManager[] public allEvents;
    mapping(address => EventManager[]) public userCreatedEvents;
    mapping(string => bool) public eventNameExists;
    mapping(string => address) public eventNameToContract;
    mapping(address => bool) public isValidEventContract;

    mapping(address => uint256) public userEventCount;

    // Global ticket tracking
    struct UserTicket {
        address eventContract;
        uint256 tokenId;
        uint256 purchaseTime;
        string eventName;
    }

    mapping(address => UserTicket[]) public userAllTickets;
    mapping(address => uint256) public userTicketCount;
    mapping(address => mapping(address => uint256[])) public userTicketsByEvent;

    event EventCreated(
        address indexed eventContract,
        address indexed eventOwner,
        string eventName,
        string eventAcronym,
        uint256 regStartTime,
        uint256 regEndTime,
        uint256 ticketFee,
        uint256 maxTickets
    );

    event TicketPurchased(
        address indexed user,
        address indexed eventContract,
        uint256 tokenId,
        string eventName,
        uint256 purchaseTime
    );

    constructor() Ownable(msg.sender) {}

    function createEvent(
        string memory _eventName,
        string memory _eventAcronym,
        uint256 _regStartTime,
        uint256 _regEndTime,
        uint256 _ticketFee,
        uint256 _maxTickets,
        string memory _ticketURI
    ) external returns (address) {
        require(!eventNameExists[_eventName], "Event name already exists");
        require(bytes(_eventName).length > 0, "Event name cannot be empty");

        EventManager newEvent = new EventManager(
            _eventName, _eventAcronym, _regStartTime, _regEndTime, _ticketFee, _maxTickets, _ticketURI, msg.sender
        );

        address eventAddress = address(newEvent);
        allEvents.push(newEvent);
        userCreatedEvents[msg.sender].push(newEvent);

        // Update user event count
        userEventCount[msg.sender]++;

        // Mark event name as used and map to contract
        eventNameExists[_eventName] = true;
        eventNameToContract[_eventName] = eventAddress;
        
        // Mark as valid event contract for ticket tracking
        isValidEventContract[eventAddress] = true;

        emit EventCreated(
            eventAddress, msg.sender, _eventName, _eventAcronym, _regStartTime, _regEndTime, _ticketFee, _maxTickets
        );

        return eventAddress;
    }

    function getAllEvents() external view returns (address[] memory) {
        address[] memory eventAddresses = new address[](allEvents.length);
        for (uint256 i = 0; i < allEvents.length; i++) {
            eventAddresses[i] = address(allEvents[i]);
        }
        return eventAddresses;
    }

    function getAllEventsContracts() external view returns (EventManager[] memory) {
        return allEvents;
    }

    function getLiveEvents() external view returns (EventManager[] memory) {
        uint256 liveCount = 0;

        // First pass: count live events
        for (uint256 i = 0; i < allEvents.length; i++) {
            if (allEvents[i].isEventLive()) {
                liveCount++;
            }
        }

        // Second pass: populate live events array
        EventManager[] memory liveEvents = new EventManager[](liveCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < allEvents.length; i++) {
            if (allEvents[i].isEventLive()) {
                liveEvents[currentIndex] = allEvents[i];
                currentIndex++;
            }
        }

        return liveEvents;
    }

    function getPastEvents() external view returns (EventManager[] memory) {
        uint256 pastCount = 0;

        // First pass: count past events
        for (uint256 i = 0; i < allEvents.length; i++) {
            if (allEvents[i].isEventPast()) {
                pastCount++;
            }
        }

        // Second pass: populate past events array
        EventManager[] memory pastEvents = new EventManager[](pastCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < allEvents.length; i++) {
            if (allEvents[i].isEventPast()) {
                pastEvents[currentIndex] = allEvents[i];
                currentIndex++;
            }
        }

        return pastEvents;
    }

    function getTotalEventsCount() external view returns (uint256) {
        return allEvents.length;
    }

    function getEventContractByName(string memory eventName) external view returns (address) {
        require(eventNameExists[eventName], "Event name does not exist");
        return eventNameToContract[eventName];
    }

    function isEventNameAvailable(string memory eventName) external view returns (bool) {
        return !eventNameExists[eventName];
    }

    // Simple user management functions - only for created events
    function getUserCreatedEvents(address user) external view returns (EventManager[] memory) {
        return userCreatedEvents[user];
    }

    function getUserEventCount(address user) external view returns (uint256) {
        return userEventCount[user];
    }

    // Global ticket tracking functions
    function recordTicketPurchase(
        address user, 
        uint256 tokenId, 
        string memory eventName
    ) external {
        require(isValidEventContract[msg.sender], "Only valid event contracts can call this");
        
        UserTicket memory newTicket = UserTicket({
            eventContract: msg.sender,
            tokenId: tokenId,
            purchaseTime: block.timestamp,
            eventName: eventName
        });
        
        userAllTickets[user].push(newTicket);
        userTicketCount[user]++;
        userTicketsByEvent[user][msg.sender].push(tokenId);
        
        emit TicketPurchased(user, msg.sender, tokenId, eventName, block.timestamp);
    }

    function getUserAllTickets(address user) external view returns (UserTicket[] memory) {
        return userAllTickets[user];
    }

    function getUserTicketCount(address user) external view returns (uint256) {
        return userTicketCount[user];
    }

    function getUserTicketsForEvent(address user, address eventContract) external view returns (uint256[] memory) {
        return userTicketsByEvent[user][eventContract];
    }

    function getTotalTicketsSold() external view returns (uint256) {
        uint256 totalSold = 0;
        for (uint256 i = 0; i < allEvents.length; i++) {
            totalSold += allEvents[i].ticketsSold();
        }
        return totalSold;
    }
}
