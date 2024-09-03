"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { useWalletStore } from "@/lib/stores/wallet";
import { useState } from "react";

export interface TicketDashboardProps {
  wallet?: string;
  loading: boolean;
  onConnectWallet: () => void;
  onRegisterStandardTier: (code: string) => Promise<void>;
}

export function TicketDashboard({
  wallet,
  onConnectWallet,
  onRegisterStandardTier,
  loading,
}: TicketDashboardProps) {
  const form = useForm();
  const [code, setCode] = useState("");

  return (
    <Card className="w-full p-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold">Concert Tickets</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your access code to register for a concert ticket
        </p>
      </div>
      <Form {...form}>
        <div className="pt-3">
          <FormField
            name="ticketCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your ticket code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          size={"lg"}
          type="submit"
          className="mt-6 w-full"
          loading={loading}
          onClick={() => {
            if (wallet) {
              onRegisterStandardTier(code);
            } else {
              onConnectWallet();
            }
          }}
        >
          {wallet ? "Register for Ticket" : "Connect Wallet"}
        </Button>
      </Form>
    </Card>
  );
}
