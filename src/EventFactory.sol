// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EventManager} from "./EventManager.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract EventFactory is Ownable {
    EventManager[] public allEvents;
    mapping(address => EventManager[]) public userCreatedEvents;
    mapping(string => bool) public eventNameExists;
    mapping(string => address) public eventNameToContract;

    mapping(address => uint256) public userEventCount;

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

        emit EventCreated(
            eventAddress, msg.sender, _eventName, _eventAcronym, _regStartTime, _regEndTime, _ticketFee, _maxTickets
        );

        return eventAddress;
    }

    function getAllEvents() external view returns (EventManager[] memory) {
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
}
