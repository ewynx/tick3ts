import "reflect-metadata";
import { TestingAppChain } from "@proto-kit/sdk";
import { Field, method, PrivateKey, UInt8 } from "o1js";
import { Balances } from "../../../src/runtime/modules/balances";
import { ChosenRegistrations, Codes, TieredTicketDistributor } from "../../../src/runtime/modules/tieredTicketDistributor";
import { log } from "@proto-kit/common";
import { BalancesKey, TokenId, UInt64 } from "@proto-kit/library";

describe("TieredTicketDistributor", () => {
  let appChain = TestingAppChain.fromRuntime({
    TieredTicketDistributor,
    Balances,
  });
  let alicePrivateKey = PrivateKey.random();
  let alice = alicePrivateKey.toPublicKey();

  beforeAll(async () => {
    appChain = TestingAppChain.fromRuntime({
      TieredTicketDistributor,
      Balances,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {
          totalSupply: UInt64.from(10000),
        },
        TieredTicketDistributor: {}
      },
    });

    await appChain.start();
    alicePrivateKey = PrivateKey.random();
    alice = alicePrivateKey.toPublicKey();

    appChain.setSigner(alicePrivateKey);

  })

  it("resetCounters should initialize counters to 0", async () => {
    const balances = appChain.runtime.resolve("Balances");
    const ticketDistributor = appChain.runtime.resolve("TieredTicketDistributor");

    const tx1 = await appChain.transaction(alice, async () => {
      await ticketDistributor.resetCounters();
    });

    await tx1.sign();
    await tx1.send();

    const block = await appChain.produceBlock();
    const standardTierCounter = await appChain.query.runtime.TieredTicketDistributor.standardTierCounter.get();
    const topTierCounter = await appChain.query.runtime.TieredTicketDistributor.topTierCounter.get();

    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(standardTierCounter?.toBigInt()).toBe(0n);
    expect(topTierCounter?.toBigInt()).toBe(0n);
  }, 1_000_000);

  it("addCodes should add a code to validCodes", async () => {
    const balances = appChain.runtime.resolve("Balances");
    const ticketDistributor = appChain.runtime.resolve("TieredTicketDistributor");
    const code = Field.from(11);

    const tx1 = await appChain.transaction(alice, async () => {
      await ticketDistributor.addCodes(code);
    });

    await tx1.sign();
    await tx1.send();

    const block = await appChain.produceBlock();
    const validCode = await appChain.query.runtime.TieredTicketDistributor.validCodes.get(code);
    const invalidCode = await appChain.query.runtime.TieredTicketDistributor.validCodes.get(code.add(1));

    expect(block?.transactions[0].status.toBoolean()).toBe(true);
    expect(validCode?.toBoolean()).toBe(true);
    // Extra check for a code that wasnt added
    expect(invalidCode).toBeUndefined();
  }, 1_000_000);

  it("addMultipleCodes should 35 codes to validCodes", async () => {
    const balances = appChain.runtime.resolve("Balances");
    const ticketDistributor = appChain.runtime.resolve("TieredTicketDistributor");
    let codes = [];
    for (let i = 1; i <= 35; i++) {
      codes.push(Field.from(i));
      
    }

    const tx1 = await appChain.transaction(alice, async () => {
      await ticketDistributor.addMultipleCodes(new Codes({fields: codes}));
    });

    await tx1.sign();
    await tx1.send();

    await appChain.produceBlock();

    const validCode1 = await appChain.query.runtime.TieredTicketDistributor.validCodes.get(Field.from(1));
    const validCode35 = await appChain.query.runtime.TieredTicketDistributor.validCodes.get(Field.from(35));
    const invalidCode = await appChain.query.runtime.TieredTicketDistributor.validCodes.get(Field.from(36));

    expect(validCode1?.toBoolean()).toBe(true);
    expect(validCode35?.toBoolean()).toBe(true);
    expect(invalidCode).toBeUndefined();
  }, 1_000_000);

  it("registerStandardTier should register correctly with a valid code", async () => {
    const balances = appChain.runtime.resolve("Balances");
    const ticketDistributor = appChain.runtime.resolve("TieredTicketDistributor");
    const validCode = Field.from(11);
    const invalidCode = Field.from(133);

    // Register valid code
    const tx1 = await appChain.transaction(alice, async () => {
      await ticketDistributor.addCodes(validCode);
    });

    await tx1.sign();
    await tx1.send();
    await appChain.produceBlock();

    let annaPrivKey = PrivateKey.random();
    // Register for the standard tier for anna
    const tx2 = await appChain.transaction(alice, async () => {
      await ticketDistributor.registerStandardTier(validCode, annaPrivKey.toPublicKey());
    });

    await tx2.sign();
    await tx2.send();

    await appChain.produceBlock();
    // Retrieve first registration (should be for anna)
    const standardTierRegistrations = await appChain.query.runtime.TieredTicketDistributor.standardTierRegistrations.get(UInt8.from(0));
    const standardTierCounter = await appChain.query.runtime.TieredTicketDistributor.standardTierCounter.get();
    const topTierCounter = await appChain.query.runtime.TieredTicketDistributor.topTierCounter.get();

    // Check the first registration in Standard tier is for anna
    expect(standardTierRegistrations?.toJSON()).toBe(annaPrivKey.toPublicKey().toJSON());
    // Counter for this tier should be 1
    expect(standardTierCounter?.toBigInt()).toBe(1n);
    // Counter for top tier should still be 0
    expect(topTierCounter?.toBigInt()).toBe(0n);

  }, 1_000_000);

  it("invalid code can't register for registerStandardTier", async () => {
    const balances = appChain.runtime.resolve("Balances");
    const ticketDistributor = appChain.runtime.resolve("TieredTicketDistributor");
    const validCode = Field.from(11);
    const invalidCode = Field.from(133);

    // Register valid code
    const tx1 = await appChain.transaction(alice, async () => {
      await ticketDistributor.addCodes(validCode);
    });

    await tx1.sign();
    await tx1.send();
    await appChain.produceBlock();

    let annaPrivKey = PrivateKey.random();
    // Register for the standard tier for anna
    const tx2 = await appChain.transaction(alice, async () => {
      await ticketDistributor.registerStandardTier(invalidCode, annaPrivKey.toPublicKey());
    });

    await tx2.sign();
    await tx2.send();

    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(false);
    expect(block?.transactions[0].statusMessage).toMatch(
      /Code is invalid or has already been used/
    );

  }, 1_000_000);

  it("cannot register twice for standard tier with same code", async () => {
    const balances = appChain.runtime.resolve("Balances");
    const ticketDistributor = appChain.runtime.resolve("TieredTicketDistributor");
    const validCode = Field.from(11);
    const invalidCode = Field.from(133);

    // Register valid code
    const tx1 = await appChain.transaction(alice, async () => {
      await ticketDistributor.addCodes(validCode);
    });

    await tx1.sign();
    await tx1.send();
    await appChain.produceBlock();

    let annaPrivKey = PrivateKey.random();
    // Register for the standard tier for anna
    const tx2 = await appChain.transaction(alice, async () => {
      await ticketDistributor.registerStandardTier(validCode, annaPrivKey.toPublicKey());
    });

    await tx2.sign();
    await tx2.send();

    await appChain.produceBlock();

    const tx3 = await appChain.transaction(alice, async () => {
      await ticketDistributor.registerStandardTier(validCode, annaPrivKey.toPublicKey());
    });

    await tx3.sign();
    await tx3.send();

    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(false);
    expect(block?.transactions[0].statusMessage).toMatch(
      /Code is invalid or has already been used/
    );

  }, 1_000_000);

  it("distributeStandardTicketClaims should award 5 Ticket Claim Tokens to the lucky registrants", async () => {
    const balances = appChain.runtime.resolve("Balances");
    const ticketDistributor = appChain.runtime.resolve("TieredTicketDistributor");

    // Initialize counters to 0
    const tx_init = await appChain.transaction(alice, async () => {
      await ticketDistributor.resetCounters();
    });

    await tx_init.sign();
    await tx_init.send();

    await appChain.produceBlock();

    // First add valid codes
    let codes = [];
    for (let i = 1; i <= 35; i++) {
      codes.push(Field.from(i));
    }

    const tx1 = await appChain.transaction(alice, async () => {
      await ticketDistributor.addMultipleCodes(new Codes({fields: codes}));
    });

    await tx1.sign();
    await tx1.send();

    await appChain.produceBlock();

    // 15 people register with a valid code (could be more for standard tier)
    let registrants = [];
    for (let i = 0; i < 15; i++) {
      let registrantPrivateKey = PrivateKey.random();
      let registrant = registrantPrivateKey.toPublicKey();
      registrants.push(registrant);
      
      const tx = await appChain.transaction(registrant, async () => {
        await ticketDistributor.registerStandardTier(codes[i], registrant);
      });
      appChain.setSigner(registrantPrivateKey);

      await tx.sign();
      await tx.send();
      const block = await appChain.produceBlock();
      expect(block?.transactions[0].status.toBoolean()).toBe(true);
    }
    appChain.setSigner(alicePrivateKey);

    const standardTierCounter = await appChain.query.runtime.TieredTicketDistributor.standardTierCounter.get();
    expect(standardTierCounter?.toBigInt()).toBe(15n);

    // Draw 5 lucky winners
    let winners = new ChosenRegistrations({ bytes: [
      UInt8.from(11), 
      UInt8.from(4), 
      UInt8.from(10),
      UInt8.from(7),
      UInt8.from(2)]});

    const tx = await appChain.transaction(alice, async () => {
      await ticketDistributor.distributeStandardTicketClaims(winners);
    });

    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    // 5 Ticket Claim Tokens were awarded
    const claimTokenCount = await appChain.query.runtime.TieredTicketDistributor.claimTokenCount.get();
    expect(claimTokenCount?.equals(Field.from(5)).toBoolean()).toBe(true);

    // Check those addresses are the ones with a Ticket Claim Token

    // Token ids of awarded Ticket Claim Tokens go from 1,..,5
    // index 11 got the first Ticket Claim Token, which will have tokenId = 1
    const tokenId1 = TokenId.from(1);
    const key1 = new BalancesKey({ tokenId: tokenId1, address: registrants[11] });
    const balance1 = await appChain.query.runtime.Balances.balances.get(key1);
    expect(balance1?.toBigInt()).toBe(1n);
    const firstClaimToken = await appChain.query.runtime.TieredTicketDistributor.claimTokenOwners.get(tokenId1);
    expect(firstClaimToken?.toJSON()).toBe(registrants[11].toJSON());

    // Second token claimed should be for registrant[4]
    const tokenId2 = TokenId.from(2);
    const secondClaimToken = await appChain.query.runtime.TieredTicketDistributor.claimTokenOwners.get(tokenId2);
    expect(secondClaimToken?.toJSON()).toBe(registrants[4].toJSON());
    
    // index 7 got the fourth Ticket Claim Token
    const tokenId4 = TokenId.from(4);
    const key4 = new BalancesKey({ tokenId: tokenId4, address: registrants[7] });
    const balance4 = await appChain.query.runtime.Balances.balances.get(key4);
    expect(balance4?.toBigInt()).toBe(1n);
    const fourthClaimToken = await appChain.query.runtime.TieredTicketDistributor.claimTokenOwners.get(tokenId4);
    expect(fourthClaimToken?.toJSON()).toBe(registrants[7].toJSON());
    
  }, 1_000_000);
});
