"use client";
import { TicketDashboard } from "@/components/claimDashboard";
import { useRegisterForTicket } from "@/lib/stores/ticketDistributor";
import { useWalletStore } from "@/lib/stores/wallet";

export default function Home() {
  const wallet = useWalletStore();
  const registerForTicket = useRegisterForTicket(); // Hook to handle ticket registration

  return (
    <div className="mx-auto -mt-32 h-full pt-16">
      <div className="flex h-full w-full items-center justify-center pt-16">
        <div className="flex basis-4/12 flex-col items-center justify-center 2xl:basis-3/12">
          <TicketDashboard
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            onRegisterStandardTier={registerForTicket} // Passing the function here
            loading={false}
          />
        </div>
      </div>
    </div>
  );
}
