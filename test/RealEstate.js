const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.Units(n.toString(), "ether");
};

const ether = tokens;

describe("RealEstate", () => {
  let realEstate, escrow;
  let deployer, seller, buyer, inspector, lender;
  let nftId = 1;
  let purchasePrice = ether(100);
  let escrowAmount = ether(20);

  beforeEach(async () => {
    // Account setup
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];

    // Contract loaded
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    // Contract deployed
    realEstate = await RealEstate.deploy();

    escrow = await Escrow.deploy(
      realEstate.address,
      nftId,
      purchasePrice,
      escrowAmount,
      seller.address,
      buyer.address,
      inspector.address,
      lender.address
    );

    // NFT approved by seller
    transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, nftId);
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("deplyer/seller has an NFT", async () => {
      expect(await realEstate.ownerOf(nftId)).to.equal(seller.address);
    });
  });

  describe("Selling real estate", () => {
    let balance, transaction;

    it("executes a successful transaction", async () => {
      // Expects seller to be NFT owner before the sale
      expect(await realEstate.ownerOf(nftId)).to.equal(seller.address);

      // Check escrow balance
      balance = await escrow.getBalance();
      console.log("escrow balance:", ethers.utils.formatEther(balance));

      // Earnest deposited by buyer
      console.log("Buyer deposits earnest money");
      transaction = await escrow
        .connect(buyer)
        .depositEarnest({ value: escrowAmount });
      await transaction.wait();

      // Check escrow balance
      balance = await escrow.getBalance();
      console.log("escrow balance:", ethers.utils.formatEther(balance));

      // Status updated by inspector
      transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(true);
      await transaction.wait();
      console.log("Inspector updates status");

      // Sale approved by buyer
      transaction = await escrow.connect(buyer).approveSale();
      await transaction.wait();
      console.log("Buyer approves sale");

      // Sale approved by seller
      transaction = await escrow.connect(seller).approveSale();
      await transaction.wait();
      console.log("Seller approves sale");

      // Sale funded by lender
      transaction = await lender.sendTransaction({
        to: escrow.address,
        value: ether(80),
      });

      // Sale approved by lender
      transaction = await escrow.connect(lender).approveSale();
      await transaction.wait();
      console.log("Lender approves sale");

      // Finalize sale
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalizes sale");

      // Expect Buyer to be owner of NFT address
      expect(await realEstate.ownerOf(nftId)).to.equal(buyer.address);

      // Expect Seller to receive Funds
      balance = await ethers.provider.getBalance(seller.address);
      console.log("Seller balance:", ethers.utils.formatEther(balance));
      expect(balance).to.be.above(ether(10099));
    });
  });
});
