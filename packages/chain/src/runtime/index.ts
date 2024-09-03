import { Balance, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";
import { TieredTicketDistributor } from "./modules/tieredTicketDistributor";

export const modules = VanillaRuntimeModules.with({
  Balances,
  TieredTicketDistributor
});

export const config: ModulesConfig<typeof modules> = {
  Balances: {
    totalSupply: Balance.from(10_000),
  },
  TieredTicketDistributor: {} // TODO set amount of tickets etc
};

export default {
  modules,
  config,
};
