// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {EventManager} from "../src/EventManager.sol";

contract CounterScript is Script {
    EventManager public eventManager;

    function setUp() public {
        eventManager = new EventManager(
            "Test Event", "TE", block.timestamp + 100, block.timestamp + 1000, 0, 100, "ipfs://testuri", address(this)
        );
    }

    function run() public {
        vm.startBroadcast();

        eventManager = new EventManager(
            "Test Event", "TE", block.timestamp + 100, block.timestamp + 1000, 0, 100, "ipfs://testuri", address(this)
        );

        vm.stopBroadcast();
    }
}
