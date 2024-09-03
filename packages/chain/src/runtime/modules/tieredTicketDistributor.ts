import { UInt64 } from "@proto-kit/library";
import { runtimeModule, state, runtimeMethod, RuntimeModule } from "@proto-kit/module";
import { assert, State, StateMap } from "@proto-kit/protocol";
import { Bool, Bytes, Field, Provable, PublicKey, Struct, UInt8 } from "o1js";

export class ChosenRegistrations extends Struct ({
  bytes: Provable.Array(UInt8, 200)
}) {}

@runtimeModule()
export class TieredTicketDistributor extends RuntimeModule {
  @state() public validCodes = StateMap.from<Field, Bool>(Field, Bool);
  
  // StandardTierPool: standard price
  // 200 tx, max 1000 registrations
  @state() public standardTierRegistrations = StateMap.from<UInt64, PublicKey>(UInt64, PublicKey);
  @state() public standardTierCounter = State.from<UInt64>(UInt64);
  
  // TopTierPool: 150% standard price
  // 200 tx, max 400 registrations
  @state() public topTierRegistrations = StateMap.from<UInt64, PublicKey>(UInt64, PublicKey);
  @state() public topTierCounter = State.from<UInt64>(UInt64);

  // Can add an extra "special" tier that has separate "special" codes 

  // ADMIN
  // TODO create a fn that can input multiple codes at once
  @runtimeMethod()
  public async addCodes(code: Field): Promise<void>{
    await this.validCodes.set(code, Bool(true));
  }

  // This can also be done with config settings, but in this way there is a reset
  // Initialize method to set initial values
  @runtimeMethod()
  public async resetCounters(): Promise<void> {
    await this.topTierCounter.set(UInt64.zero);
    await this.standardTierCounter.set(UInt64.zero);
  }

  // Ideally this would be done automatically, maybe upon filling the tiers
  // and using an oracle for randomness
  @runtimeMethod()
  public async distributeTicketClaims(chosenRegistrations: ChosenRegistrations): Promise<void> {
    // award each chosen registrations a Ticket Claim Token
  }

  // USER

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
    // There are max 1000 participants
    const standardTierCounter = await this.standardTierCounter.get();
    assert(standardTierCounter.value.lessThan(UInt64.from(1000)), "Standard Tier is full at the moment")


    // All checks OK; make registration for user + make code invalid
    const newCounter = standardTierCounter.value.add(1);
    await this.standardTierCounter.set(newCounter);

    // Register this participant
    // TODO a participant can transfer their registrations
    await this.standardTierRegistrations.set(newCounter, address);
    await this.validCodes.set(code, Bool(false));
  }

  // TOP TIER

}