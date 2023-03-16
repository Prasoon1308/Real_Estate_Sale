# Real_Estate_Sale

Real Estate transactions are financial transactions where we transfer ownership, something smart contracts are great for. Here, real estate ownership will be modeled by a non-fungible token (NFT) which will be used for ownership transfer from seller to the buyer.

Steps:
->Seller lists property
->Buyerdeposits earnset
->Appraisal
->Inspection
->Lender approves
->Lender funds
->Transfer ownership
->Seller gets paid

RealEstate.sol file is for maintaining Real Estate as an ERC721 token.
Escrow.sol file is for transferring ownership of the token and transaction of funds.

The NFTs are stored on a IPFS (interplanetary file system) which is a kind of a blockcahin system(not exactly) where files are stored over different nodes and not on a central server.
