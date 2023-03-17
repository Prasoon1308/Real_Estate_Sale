// This file is for transferring ownership of the token and transaction of funds.

// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    uint256 public nftID;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function!");
        _;
    }
    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "Only inspector can call this function!"
        );
        _;
    }

    bool public inspectionPassed = false;
    mapping(address => bool) public approval;

    receive() external payable {} // required to make the contract receive transactions

    constructor(
        address _nftAddress,
        uint256 _nftID,
        uint _purchasePrice,
        uint256 _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftID = _nftID;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        lender = _lender;
    }

    function depositEarnest() public payable onlyBuyer {
        require(msg.value >= escrowAmount); // kind of down payment for the escrow account
    }

    function updateInspectionStatus(bool _passed) public onlyInspector {
        inspectionPassed = _passed;
    }

    function approveSale() public {
        approval[msg.sender] = true;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // If the sale is cancelled the amount should return to the seller

    function cancelSale() public {
        if (inspectionPassed == false) {
            payable(buyer).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    function finalizeSale() public {
        require(inspectionPassed, "must pass the inspection");
        require(approval[buyer], "must be passed by the buyer");
        require(approval[seller], "must be passed by the seller");
        require(approval[lender], "must be passed by the lender");
        require(
            address(this).balance >= purchasePrice,
            "must have enough funds for the sale"
        );

        // send all the balance from smart contract to the seller
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);
        // Transfer ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }
}
