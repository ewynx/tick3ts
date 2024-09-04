import { Button } from "@/components/ui/button";
import tickets from "@/public/Tick3ts.png";
import Image from "next/image";
// @ts-ignore
import truncateMiddle from "truncate-middle";
import { Skeleton } from "@/components/ui/skeleton";
import { Chain } from "./chain";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { AdminPanel } from "./adminPanel";
import { Modal } from "./adminModal";
import { addCode, 
  resetCountersDistributor, 
  useStandardTierCounter,
  useTopTierCounter } from "@/lib/stores/ticketDistributor";

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
          {/* Adjusted Image with max height and auto width for maintaining aspect ratio */}
          <Image 
            className="h-10 w-auto max-w-full" 
            src={tickets} 
            alt={"Tick3ts logo"} 
            style={{ maxHeight: '50px', maxWidth: '200px' }}
          />
        </div>
        <div className="flex basis-6/12 flex-row items-center justify-end">
          {/* balance */}
          {wallet && (
            <div className="mr-4 flex shrink flex-col items-start justify-center bg-gray-100 p-2 rounded-md shadow-sm">
              <div className="text-xs text-gray-600">Your balance:</div>
              <div className="w-40 pt-0.5 text-left">
                {balanceLoading && balance === undefined ? (
                  <Skeleton className="h-4 w-full" />
                ) : (
                  <p className="text-xs font-bold text-black">{balance} Tick3t Claim Tokens</p>
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
          onAddCodes={onAddCode}
          onResetCounters={resetCounters} 
        />
      </Modal>
    </div>
  );
}
