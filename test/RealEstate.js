const { ethers } = import("hardhat");
const { expect } = import("chai");

describe("Real Estate", () => {
  let realEstate, escrow;
  let deployer, seller;
  let nftID = 1;

  beforeEach(async () => {
    // Account setup
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];

    // Loading Contracts
    const RealEstate = await ethers.getContract("RealEstate");
    const Escrow = await ethers.getContract("Escrow");

    // Deploying Contracts
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(realEstate.address, nftID, seller, buyer);
  });

  describe("Deployment", async () => {
    it("sends an NFT to the seller/deployer", async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(sender.address);
    });
  });
  describe("Selling Real Estate", async () => {
    it("executes a successful transaction", async () => {
      // Before the sale owner of the NFT should be the seller
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      // Sale of the NFT
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Sale is finalized by the buyer");

      // After the sale owner of the NFT should be the buyer
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
