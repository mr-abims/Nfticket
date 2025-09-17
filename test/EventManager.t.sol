// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {EventManager} from "../src/EventManager.sol";
import {EventFactory} from "../src/EventFactory.sol";

contract EventManagerTest is Test {
    EventFactory public eventFactory;
    EventManager public eventManager;
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        eventFactory = new EventFactory();
    }

    function test_CreateEvent() public {
        vm.prank(owner);
        address eventAddress = eventFactory.createEvent(
            "Test Event", "TE", block.timestamp + 100, block.timestamp + 1000, 0, 100, "ipfs://testuri"
        );

        eventManager = EventManager(eventAddress);
        (string memory eventName,,,,,,,,) = eventManager.getEventInfo();
        assertEq(eventName, "Test Event");
        assertEq(eventManager.eventOwner(), owner);
    }

    function test_RegisterForEvent() public {
        test_CreateEvent();

        // Move to registration start time
        vm.warp(block.timestamp + 150);

        vm.startPrank(user1);
        eventManager.registerForEvent();

        uint256[] memory userTickets = eventManager.getUserTickets(user1);
        assertEq(userTickets.length, 1);
        assertEq(eventManager.ownerOf(userTickets[0]), user1);
        vm.stopPrank();

        vm.startPrank(user2);
        eventManager.registerForEvent();

        userTickets = eventManager.getUserTickets(user2);
        assertEq(userTickets.length, 1);
        assertEq(eventManager.ownerOf(userTickets[0]), user2);
        vm.stopPrank();

        (,,,,,, uint256 ticketsSold,,) = eventManager.getEventInfo();
        assertEq(ticketsSold, 2);
    }

    function test_ticketTransfer() public {
        test_RegisterForEvent();

        vm.startPrank(user1);
        uint256[] memory userTickets = eventManager.getUserTickets(user1);
        uint256 tokenId = userTickets[0];

        address user3 = makeAddr("user3");
        eventManager.transferTicket(user3, tokenId);
        assertEq(eventManager.ownerOf(tokenId), user3);
        vm.stopPrank();
    }

    function test_createPayableEvent() public {
        vm.prank(owner);
        address eventAddress = eventFactory.createEvent(
            "PayableTest Event",
            "PTE",
            block.timestamp + 100,
            block.timestamp + 1000,
            0.001 ether,
            100,
            "ipfs://testuri"
        );

        eventManager = EventManager(eventAddress);
        (string memory eventName,,, uint256 ticketFee, bool ticketFeeRequired,,,,) = eventManager.getEventInfo();
        assertEq(eventName, "PayableTest Event");
        assertEq(ticketFee, 0.001 ether);
        assertTrue(ticketFeeRequired);
    }

    function test_registerForPayableEvent() public {
        test_createPayableEvent();

        vm.startPrank(user1);
        vm.deal(user1, 1 ether);
        vm.warp(block.timestamp + 150);

        eventManager.registerForEvent{value: 0.001 ether}();

        uint256[] memory userTickets = eventManager.getUserTickets(user1);
        assertEq(userTickets.length, 1);
        assertEq(eventManager.ownerOf(userTickets[0]), user1);
        vm.stopPrank();
    }

    function test_factoryFunctionality() public {
        // Create multiple events
        vm.startPrank(owner);
        eventFactory.createEvent("Event 1", "E1", block.timestamp + 100, block.timestamp + 1000, 0, 50, "ipfs://event1");
        eventFactory.createEvent(
            "Event 2", "E2", block.timestamp + 200, block.timestamp + 2000, 0.01 ether, 100, "ipfs://event2"
        );
        vm.stopPrank();

        // Check total events
        assertEq(eventFactory.getTotalEventsCount(), 2);

        // Check user created events
        EventManager[] memory userEvents = eventFactory.getUserCreatedEvents(owner);
        assertEq(userEvents.length, 2);

        
    }

    function test_endEvent() public {
        test_CreateEvent();

        // Move past event end time
        vm.warp(block.timestamp + 2000);

        vm.prank(owner);
        eventManager.endEvent();

        (,,,,,,,, bool eventEnded) = eventManager.getEventInfo();
        assertTrue(eventEnded);
        assertTrue(eventManager.isEventPast());
    }

    function test_getLiveAndPastEvents() public {
        vm.startPrank(owner);
        // Create a live event
        eventFactory.createEvent(
            "Live Event", "LE", block.timestamp + 100, block.timestamp + 1000, 0, 50, "ipfs://live"
        );

        // Create a past event (that will be ended manually)
        address pastEventAddress = eventFactory.createEvent(
            "Past Event", "PE", block.timestamp + 50, block.timestamp + 200, 0, 50, "ipfs://past"
        );
        EventManager pastEvent = EventManager(pastEventAddress);

        vm.stopPrank();

        // Move time to make the past event actually past
        vm.warp(block.timestamp + 250);

        // End the past event
        vm.prank(owner);
        pastEvent.endEvent();

        // Test live events
        EventManager[] memory liveEvents = eventFactory.getLiveEvents();
        assertEq(liveEvents.length, 1);

        // Test past events
        EventManager[] memory pastEvents = eventFactory.getPastEvents();
        assertEq(pastEvents.length, 1);
    }

    function test_userEventCreation() public {
        // Create an event
        vm.prank(owner);
        address eventAddress = eventFactory.createEvent(
            "User Management Test", "UMT", block.timestamp + 100, block.timestamp + 1000, 0, 100, "ipfs://testuri"
        );

        eventManager = EventManager(eventAddress);

        // Check user created events for owner
        EventManager[] memory ownerCreatedEvents = eventFactory.getUserCreatedEvents(owner);
        assertEq(ownerCreatedEvents.length, 1);
        assertEq(address(ownerCreatedEvents[0]), eventAddress);

        // User1 registers for the event (this only affects the EventManager, not factory)
        vm.warp(block.timestamp + 150);
        vm.prank(user1);
        eventManager.registerForEvent();

        // Verify registration worked on EventManager level
        uint256[] memory userTickets = eventManager.getUserTickets(user1);
        assertEq(userTickets.length, 1);
        assertEq(eventManager.ownerOf(userTickets[0]), user1);
    }

    function test_multipleEventCreation() public {
        // Owner creates multiple events
        vm.startPrank(owner);
        address event1 = eventFactory.createEvent(
            "Event 1", "E1", block.timestamp + 100, block.timestamp + 1000, 0, 50, "ipfs://event1"
        );
        address event2 = eventFactory.createEvent(
            "Event 2", "E2", block.timestamp + 200, block.timestamp + 2000, 0.01 ether, 100, "ipfs://event2"
        );
        vm.stopPrank();

        // Check owner created events count
        assertEq(eventFactory.getUserEventCount(owner), 2);

        // Check owner created events
        EventManager[] memory ownerCreatedEvents = eventFactory.getUserCreatedEvents(owner);
        assertEq(ownerCreatedEvents.length, 2);
        assertEq(address(ownerCreatedEvents[0]), event1);
        assertEq(address(ownerCreatedEvents[1]), event2);

        // User1 registers for both events (only affects individual EventManager contracts)
        vm.warp(block.timestamp + 150);
        vm.startPrank(user1);
        EventManager(event1).registerForEvent();
        vm.deal(user1, 1 ether);
        vm.warp(block.timestamp + 250);
        EventManager(event2).registerForEvent{value: 0.01 ether}();
        vm.stopPrank();

        // Verify registrations worked on individual EventManager contracts
        uint256[] memory user1TicketsEvent1 = EventManager(event1).getUserTickets(user1);
        uint256[] memory user1TicketsEvent2 = EventManager(event2).getUserTickets(user1);
        assertEq(user1TicketsEvent1.length, 1);
        assertEq(user1TicketsEvent2.length, 1);
    }

    function test_eventNameUniqueness() public {
        // Create first event with a name
        vm.prank(owner);
        eventFactory.createEvent(
            "Unique Event", "UE", block.timestamp + 100, block.timestamp + 1000, 0, 50, "ipfs://event1"
        );

        // Try to create another event with the same name - should fail
        vm.prank(owner);
        vm.expectRevert("Event name already exists");
        eventFactory.createEvent(
            "Unique Event", "UE2", block.timestamp + 200, block.timestamp + 2000, 0, 100, "ipfs://event2"
        );

        // Check that the name is not available
        assertFalse(eventFactory.isEventNameAvailable("Unique Event"));
        assertTrue(eventFactory.isEventNameAvailable("Another Event"));

        // Get event contract by name
        address eventContract = eventFactory.getEventContractByName("Unique Event");
        assertTrue(eventContract != address(0));

        // Try to get non-existent event by name - should fail
        vm.expectRevert("Event name does not exist");
        eventFactory.getEventContractByName("Non Existent Event");
    }

    function test_eventStatusTracking() public {
        // Create events with different timelines
        vm.startPrank(owner);
        address liveEvent = eventFactory.createEvent(
            "Live Event", "LE", block.timestamp + 100, block.timestamp + 1000, 0, 50, "ipfs://live"
        );
        address pastEvent = eventFactory.createEvent(
            "Past Event", "PE", block.timestamp + 50, block.timestamp + 200, 0, 50, "ipfs://past"
        );
        vm.stopPrank();

        // User registers for past event first
        vm.warp(block.timestamp + 75);
        vm.startPrank(user1);
        EventManager(pastEvent).registerForEvent();
        vm.stopPrank();

        // User registers for live event
        vm.warp(block.timestamp + 150);
        vm.startPrank(user1);
        EventManager(liveEvent).registerForEvent();
        vm.stopPrank();

        // End the past event
        vm.warp(block.timestamp + 250);
        vm.prank(owner);
        EventManager(pastEvent).endEvent();

        // Check factory-level event categorization
        EventManager[] memory factoryLiveEvents = eventFactory.getLiveEvents();
        EventManager[] memory factoryPastEvents = eventFactory.getPastEvents();

        assertEq(factoryLiveEvents.length, 1);
        assertEq(address(factoryLiveEvents[0]), liveEvent);

        assertEq(factoryPastEvents.length, 1);
        assertEq(address(factoryPastEvents[0]), pastEvent);

        // Check individual event status
        assertTrue(EventManager(liveEvent).isEventLive());
        assertTrue(EventManager(pastEvent).isEventPast());
    }
}
