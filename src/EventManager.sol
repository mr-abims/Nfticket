// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IEventFactory {
    function recordTicketPurchase(address user, uint256 tokenId, string memory eventName) external;
}

contract EventManager is ERC721, ERC721URIStorage, Ownable {
    address public eventOwner;
    address public factory;
    string public eventName;
    uint256 public regStartTime;
    uint256 public regEndTime;
    uint256 public ticketFee;
    bool public ticketFeeRequired;
    uint256 public maxTickets;
    uint256 public ticketsSold;
    string public ticketURI;
    bool public eventEnded;
    uint256 private _nextTokenId;

    event UserRegistered(address user, string eventName, uint256 tokenId);
    event EventEnded(string eventName);
    event TicketTransferred(address from, address to, uint256 tokenId);

    constructor(
        string memory _eventName,
        string memory _eventAcronym,
        uint256 _regStartTime,
        uint256 _regEndTime,
        uint256 _ticketFee,
        uint256 _maxTickets,
        string memory _ticketURI,
        address _eventOwner
    ) ERC721(_eventName, _eventAcronym) Ownable(_eventOwner) {
        eventOwner = _eventOwner;
        factory = msg.sender; // Factory is the creator of this contract

        require(_regStartTime >= block.timestamp, "Start time must be in the future");
        require(_regEndTime > _regStartTime, "End time must be after start time");
        require(_maxTickets > 0, "Max tickets must be greater than zero");
        require(bytes(_eventName).length > 0, "Event name cannot be empty");

        eventName = _eventName;
        regStartTime = _regStartTime;
        regEndTime = _regEndTime;
        ticketFee = _ticketFee;
        ticketFeeRequired = _ticketFee > 0;
        maxTickets = _maxTickets;
        ticketsSold = 0;
        ticketURI = _ticketURI;
        eventEnded = false;
    }

    mapping(address => uint256[]) public userTickets;

    function getEventInfo()
        public
        view
        returns (
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
    {
        return (
            eventName,
            regStartTime,
            regEndTime,
            ticketFee,
            ticketFeeRequired,
            maxTickets,
            ticketsSold,
            ticketURI,
            eventEnded
        );
    }

    function registerForEvent() public payable {
        require(!eventEnded, "Event has ended");
        require(block.timestamp >= regStartTime, "Registration has not started yet");
        require(block.timestamp <= regEndTime, "Registration has ended");
        require(ticketsSold < maxTickets, "Event is sold out");

        if (ticketFeeRequired) {
            require(msg.value == ticketFee, "Incorrect ticket fee");
        } else {
            require(msg.value == 0, "No ticket fee required");
        }

        ticketsSold += 1;
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, ticketURI);
        userTickets[msg.sender].push(tokenId);

        // Report ticket purchase to factory for global tracking
        IEventFactory(factory).recordTicketPurchase(msg.sender, tokenId, eventName);

        emit UserRegistered(msg.sender, eventName, tokenId);
    }

    function endEvent() public {
        require(msg.sender == eventOwner, "Only event owner can end event");
        require(block.timestamp > regEndTime, "Event has not ended yet");
        require(!eventEnded, "Event already ended");

        eventEnded = true;
        emit EventEnded(eventName);
    }

    function transferTicket(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this ticket");
        _transfer(msg.sender, to, tokenId);
        emit TicketTransferred(msg.sender, to, tokenId);
    }

    function getUserTickets(address user) public view returns (uint256[] memory) {
        return userTickets[user];
    }

    function isEventLive() public view returns (bool) {
        return !eventEnded && block.timestamp >= regStartTime && block.timestamp <= regEndTime;
    }

    function isEventPast() public view returns (bool) {
        return eventEnded || block.timestamp > regEndTime;
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
