// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {EventManager} from "../src/EventManager.sol";

contract EventManagerTest is Test {
    EventManager public eventManager;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x4);
    address public user3 = address(0x3);
    address public user4 = address(0x5);
    address public user5 = address(0x6);
    address public user6 = address(0x7);
    address public user7 = address(0x8);
    address public user8 = address(0x9);
    address public user9 = address(0x10);
    address public user10 = address(0x11);
    EventManager.Event public evt;
    function setUp() public {
        vm.prank(owner);
        eventManager = new EventManager();
    }

    function test_CreateEvent() public {
    vm.prank(owner);
    eventManager.createEvent("Test Event", block.number + 1, block.number + 100, 0, 100, "ipfs://testuri");
    evt = eventManager.getLiveEvents()[0];
    assertEq(evt.eventName, "Test Event");
    eventManager.getEventById(evt.eventId);
    vm.prank(owner);
    eventManager.createEvent("Fire&Ice", block.number + 50, block.number + 100, 0, 100, "ipfs://fireandice");
    test_viewCreatedEvents();
    
    }
    function test_RegisterForEvent() public {
    test_CreateEvent();
    uint256 a = vm.getBlockNumber();
    vm.roll(block.number + 5);
    vm.startPrank(user1);
    uint256 b = vm.getBlockNumber();
    test_viewCreatedEvents();
    eventManager.registerForEvent(0x7f31b810572a52e30cd3cda0b71a84579f3ae1a911e725c73509e2a91b343a4d);
    eventManager.getEventById(0x28b5c4c3b2859b2addff42b44fe76e3e5095b0b8d966f982136e590281746582);
    vm.roll(block.number + 60);
    eventManager.registerForEvent(0x92f5a8ceee8683b09b032fe9487c4cecdeec59c311300037cfdf08008364c8ee);
    vm.stopPrank();

    vm.startPrank(user2);
    eventManager.registerForEvent(0x7f31b810572a52e30cd3cda0b71a84579f3ae1a911e725c73509e2a91b343a4d);
    eventManager.getEventById(0x28b5c4c3b2859b2addff42b44fe76e3e5095b0b8d966f982136e590281746582);
    vm.roll(block.number + 20);
    eventManager.getEventById(0x92f5a8ceee8683b09b032fe9487c4cecdeec59c311300037cfdf08008364c8ee);
    eventManager.registerForEvent(0x92f5a8ceee8683b09b032fe9487c4cecdeec59c311300037cfdf08008364c8ee);
    vm.stopPrank();

    }
    function test_ticketTransfer() public {
        test_RegisterForEvent();
        vm.startPrank(user1);
        eventManager.transferTicket(user3, 0);
        assertEq(eventManager.ownerOf(0), user3);
        vm.stopPrank();
    }
    function test_viewCreatedEvents() internal view {
        EventManager.Event[] memory createdEvents = eventManager.getAllEvents();
    }

}
