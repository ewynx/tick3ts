import { Balance, Balances, TokenId, UInt64 } from "@proto-kit/library";
import { runtimeModule, state, runtimeMethod, RuntimeModule } from "@proto-kit/module";
import { assert, State, StateMap } from "@proto-kit/protocol";
import { Bool, Bytes, Field, Provable, PublicKey, Struct, UInt8 } from "o1js";
import { inject } from "tsyringe";

export class ChosenRegistrations extends Struct ({
  bytes: Provable.Array(UInt8, 5)
}) {}

export class Codes extends Struct ({
  // 25 + 10 registrations for the 2 tiers
  fields: Provable.Array(Field, 35)
}) {}

@runtimeModule()
export class TieredTicketDistributor extends RuntimeModule {
  @state() public validCodes = StateMap.from<Field, Bool>(Field, Bool);
  
  // StandardTierPool: standard price, 20% chance.
  // 5 tx, max 25 registrations
  @state() public standardTierRegistrations = StateMap.from<UInt8, PublicKey>(UInt8, PublicKey);
  @state() public standardTierCounter = State.from<UInt8>(UInt8);
  
  // TopTierPool: 150% standard price, 50% chance
  // 5 tx, max 10 registrations
  @state() public topTierRegistrations = StateMap.from<UInt8, PublicKey>(UInt8, PublicKey);
  @state() public topTierCounter = State.from<UInt8>(UInt8);

  // Can add an extra "special" tier that has separate "special" codes 

  // Ticket Claim Tokens
  @state() public claimTokenCount = State.from<Field>(Field);
  @state() public claimTokenOwners = StateMap.from<TokenId, PublicKey>(TokenId, PublicKey);

  //////// ADMIN ////////
  // TODO add permissions for all functions in this section
  
  @runtimeMethod()
  public async addCodes(code: Field): Promise<void>{
    await this.validCodes.set(code, Bool(true));
  }

  @runtimeMethod()
  public async addMultipleCodes(codes: Codes): Promise<void>{
    for (let i = 0; i < 35; i++) {
      await this.validCodes.set(codes.fields[i], Bool(true));
    }
  }

  // This can also be done with config settings, but in this way there is a reset
  // Initialize method to set initial values
  @runtimeMethod()
  public async resetCounters(): Promise<void> {
    await this.topTierCounter.set(UInt8.from(0));
    await this.standardTierCounter.set(UInt8.from(0));
  }

  // TODO can this be done differently?
  @runtimeMethod()
  public async initTokenCount(): Promise<void> {
    await this.claimTokenCount.set(Field.from(0));
  }

  constructor(@inject("Balances") public balances: Balances) {
    super();
  }

  // Awarding Ticket Claim Tokens to the lucky 20% of the Standard Tier
  // Here we have 5 tickets for 25 potential registrations
  // Note: these entries have index max 2^8-1 = 255 because they are packed in UInt8
  @runtimeMethod()
  public async distributeStandardTicketClaims(chosenRegistrations: ChosenRegistrations): Promise<void> {
    // Ideally this would be done automatically, maybe upon filling the tiers
    // and using an oracle for randomness

    // award each chosen registrations a Ticket Claim Token
    for (let i = 0; i < 5; i++) {
      const pickedIndex = chosenRegistrations.bytes[i];
      const chosenRegistration = await this.standardTierRegistrations.get(pickedIndex);

      // Mint Ticket Claim Token for the lucky one
      const currentTokenCount = await this.claimTokenCount.get();
      // TokenId starts at 1
      const newValue = currentTokenCount.value.add(1);
      const newTokenId = TokenId.from(newValue);
      await this.claimTokenCount.set(newValue);
      // Mint Ticket Claim Token for the lucky registrant
      await this.balances.mint(newTokenId, chosenRegistration.value, Balance.from(1));
      await this.claimTokenOwners.set(newTokenId, chosenRegistration.value);
  
      Provable.log("minted");
    }
  }

  //////// USER ////////

  // STANDARD TIER

  // Register `address` for Standard Tier
  // this can be a different address than signer
  // Will only go through if the code is valid and hasn't been used
  @runtimeMethod()
  public async registerStandardTier(
    code: Field,
    address: PublicKey): Promise<void> {
    // Check if the code is valid and has not been used yet
    const isCodeUsed = await this.validCodes.get(
      code
    );

    assert(isCodeUsed.value, "Code is invalid or has already been used");

    // Check if Standard Tier still has room
    // There are max 25 participants
    const standardTierCounter = await this.standardTierCounter.get();
    assert(standardTierCounter.value.lessThan(UInt8.from(25)), "Standard Tier is full")
    // All checks OK; make registration for user + make code invalid
    // Register this participant
    // First person to register does so with index 0, last one with 24
    await this.standardTierRegistrations.set(standardTierCounter.value, address);
    // Increase counter
    const newCounter = standardTierCounter.value.add(1);
    await this.standardTierCounter.set(newCounter);
    // Invalidate code
    await this.validCodes.set(code, Bool(false));
  }

  // TODO a participant can transfer their registrations
  // TODO a participant can transfer their Ticket Claim Token

  // TOP TIER

  @runtimeMethod()
  public async registerTopTier(
    code: Field,
    address: PublicKey): Promise<void> {
    // Check if the code is valid and has not been used yet
    const isCodeUsed = await this.validCodes.get(
      code
    );

    assert(isCodeUsed.value, "Code is invalid or has already been used");

    // Check if Top Tier still has room
    // There are max 10 participants
    const topTierCounter = await this.topTierCounter.get();
    assert(topTierCounter.value.lessThan(UInt8.from(10)), "Top Tier is full")
    // All checks OK; make registration for user + make code invalid
    // Register this participant
    await this.topTierRegistrations.set(topTierCounter.value, address);
    // Increase counter
    const newCounter = topTierCounter.value.add(1);
    await this.topTierCounter.set(newCounter);
    // Invalidate code
    await this.validCodes.set(code, Bool(false));
  }
}