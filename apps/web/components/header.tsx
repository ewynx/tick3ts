// components/Header.tsx

import { Button } from "@/components/ui/button";
import protokit from "@/public/protokit-zinc.svg";
import Image from "next/image";
// @ts-ignore
import truncateMiddle from "truncate-middle";
import { Skeleton } from "@/components/ui/skeleton";
import { Chain } from "./chain";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { AdminPanel } from "./adminPanel";
import { Modal } from "./adminModal"; // Import the Modal component
import { addCode, 
  resetCountersDistributor, 
  useStandardTierCounter,
  useTopTierCounter } from "@/lib/stores/ticketDistributor"; // Import hooks

export interface HeaderProps {
  loading: boolean;
  wallet?: string;
  onConnectWallet: () => void;
  balance?: string;
  balanceLoading: boolean;
  blockHeight?: string;
}

export default function Header({
  loading,
  wallet,
  onConnectWallet,
  balance,
  balanceLoading,
  blockHeight,
}: HeaderProps) {
  const [showAdmin, setShowAdmin] = useState(false);
  const resetCounters = resetCountersDistributor();
  const onAddCode = addCode(); 
  const standardTierCounter = useStandardTierCounter();
  const topTierCounter = useTopTierCounter();

  return (
    <div className="flex items-center justify-between border-b p-2 shadow-sm">
      <div className="container flex">
        <div className="flex basis-6/12 items-center justify-start">
          <Image className="h-8 w-8" src={protokit} alt={"Protokit logo"} />
          <Separator className="mx-4 h-8" orientation={"vertical"} />
          <div className="flex grow">
            <Chain height={blockHeight} />
          </div>
        </div>
        <div className="flex basis-6/12 flex-row items-center justify-end">
          {/* balance */}
          {wallet && (
            <div className="mr-4 flex shrink flex-col items-end justify-center">
              <div>
                <p className="text-xs">Your balance</p>
              </div>
              <div className="w-32 pt-0.5 text-right">
                {balanceLoading && balance === undefined ? (
                  <Skeleton className="h-4 w-full" />
                ) : (
                  <p className="text-xs font-bold">{balance} MINA</p>
                )}
              </div>
            </div>
          )}
          {/* connect wallet */}
          <Button loading={loading} className="w-44" onClick={onConnectWallet}>
            <div>
              {wallet ? truncateMiddle(wallet, 7, 7, "...") : "Connect wallet"}
            </div>
          </Button>
          {/* Admin Button */}
          <Button className="ml-4" onClick={() => setShowAdmin(true)}>
            Admin
          </Button>
        </div>
      </div>

      {/* Admin Panel Modal */}
      <Modal isOpen={showAdmin} onClose={() => setShowAdmin(false)} title="Admin Panel">
        <AdminPanel
          onAddCodes={onAddCode} // Pass the function directly
          onResetCounters={resetCounters} // Pass the function to reset counters
          standardTierCounter={standardTierCounter}
          topTierCounter={topTierCounter}
        />
      </Modal>
    </div>
  );
}
