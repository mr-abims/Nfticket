// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract EventManager is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Event {
        string eventName;
        bytes32 eventId;
        uint256 regStartBlock;
        uint256 regEndblock;
        uint8 ticketFee;
        bool ticketRequired;
        uint256 maxTickets;
        uint256 ticketsSold;
        string ticketURI;
    }

    mapping(bytes32 => Event) public IdtoEvent;
    Event[] public allEvents;
    Event[] public liveEvents;
    Event[] public pastEvents;

    event EventCreated(
        string eventName,
        bytes32 eventId,
        uint256 regStartBlock,
        uint256 regEndblock,
        uint8 ticketFee,
        bool ticketRequired,
        uint256 maxTickets
    );
    event UserRegistered(address user, bytes32 eventId, uint256 tokenId);

    constructor() ERC721("EventTicket", "ETK") Ownable(msg.sender) {}

    struct User {
        uint256[] eventsAttended;
        uint256[] eventsCreated;
    }

    mapping(address => User) internal users;

    function createEvent(
        string memory _eventName,
        uint256 _regStartBlock,
        uint256 _regEndblock,
        uint8 _ticketFee,
        uint256 _maxTickets,
        string memory _ticketURI
    ) public onlyOwner {
        require(_regStartBlock >= block.number, "Start block must be in the future");
        require(_regEndblock > _regStartBlock, "End block must be after start block");
        require(_maxTickets > 0, "Max tickets must be greater than zero");
        bytes32 eventId = keccak256(
            abi.encodePacked(
                msg.sender, address(this), _eventName, _regStartBlock, _regEndblock, _ticketFee, _maxTickets
            )
        );
        if (_ticketFee > 0) {
            IdtoEvent[eventId] =
                Event(_eventName, eventId, _regStartBlock, _regEndblock, _ticketFee, true, _maxTickets, 0, _ticketURI);
        } else {
            IdtoEvent[eventId] =
                Event(_eventName, eventId, _regStartBlock, _regEndblock, 0, false, _maxTickets, 0, _ticketURI);
        }
        users[msg.sender].eventsCreated.push(uint256(eventId));
        allEvents.push(IdtoEvent[eventId]);
        liveEvents.push(IdtoEvent[eventId]);
        emit EventCreated(_eventName, eventId, _regStartBlock, _regEndblock, _ticketFee, _ticketFee > 0, _maxTickets);
    }

    function getEventById(bytes32 eventId) public view returns (Event memory) {
        return IdtoEvent[eventId];
    }

    function getLiveEvents() public view returns (Event[] memory) {
        return liveEvents;
    }

    function getPastEvents() public view returns (Event[] memory) {
        return pastEvents;
    }

    function getAllEvents() public view returns (Event[] memory) {
        return allEvents;
    }

    function registerForEvent(bytes32 eventId) public payable {
        Event storage _event = IdtoEvent[eventId];
        require(block.number >= _event.regStartBlock, "Registration has not started yet");
        require(block.number <= _event.regEndblock, "Registration has ended");
        require(_event.ticketsSold < _event.maxTickets, "Event is sold out");
        if (_event.ticketRequired) {
            require(msg.value == _event.ticketFee, "Incorrect ticket fee");
        } else {
            require(msg.value == 0, "No ticket fee required");
        }
        _event.ticketsSold += 1;
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _event.ticketURI);
        users[msg.sender].eventsAttended.push(uint256(eventId));
        emit UserRegistered(msg.sender, eventId, tokenId);
    }

    function endEvent(bytes32 eventId) public onlyOwner {
        Event memory _event = IdtoEvent[eventId];
        require(block.number > _event.regEndblock, "Event has not ended yet");
        // Move event from liveEvents to pastEvents
        for (uint256 i = 0; i < liveEvents.length; i++) {
            if (liveEvents[i].eventId == eventId) {
                pastEvents.push(liveEvents[i]);
                liveEvents[i] = liveEvents[liveEvents.length - 1];
                liveEvents.pop();
                break;
            }
        }
    }

    function transferTicket(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this ticket");
        _transfer(msg.sender, to, tokenId);
    }

    function getUserEvents(address user) public view returns (uint256[] memory, uint256[] memory) {
        return (users[user].eventsAttended, users[user].eventsCreated);
    }

    function getUserAttendedEvents(address user) public view returns (uint256[] memory) {
        return users[user].eventsAttended;
    }

    function getUserCreatedEvents(address user) public view returns (uint256[] memory) {
        return users[user].eventsCreated;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
