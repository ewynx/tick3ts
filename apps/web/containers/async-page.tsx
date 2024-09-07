"use client";
import { TicketDashboard } from "@/components/claimDashboard";
import { useRegisterStandardTicket, useRegisterTopTicket } from "@/lib/stores/ticketDistributor";
import { useWalletStore } from "@/lib/stores/wallet";

export default function Home() {
  const wallet = useWalletStore();
  const registerStandardTicket = useRegisterStandardTicket();
  const registerTopTicket = useRegisterTopTicket();
  
  return (
    <div className="mx-auto -mt-16 h-full pt-16">
        <div className="flex basis-8/12 flex-col items-center justify-center 2xl:basis-6/12 p-8">
          <TicketDashboard
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            onRegisterStandardTier={registerStandardTicket}
            onRegisterTopTier={registerTopTicket}
            loading={false}
          />
         </div>
       </div>
  );
}
