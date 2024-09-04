"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { useState } from "react";
import { FaTicketAlt, FaStar } from "react-icons/fa";

export interface TicketDashboardProps {
  wallet?: string;
  loading: boolean;
  onConnectWallet: () => void;
  onRegisterStandardTier: (code: string) => Promise<void>;
  onRegisterTopTier: (code: string) => Promise<void>;
}

export function TicketDashboard({
  wallet,
  onConnectWallet,
  onRegisterStandardTier,
  onRegisterTopTier,
  loading,
}: TicketDashboardProps) {
  const form = useForm();
  const [code, setCode] = useState("");
  const [selectedTier, setSelectedTier] = useState<"standard" | "top" | null>(null);

  const handleRegister = () => {
    if (code.trim() === "") return;

    if (selectedTier === "standard") {
      onRegisterStandardTier(code);
    } else if (selectedTier === "top") {
      onRegisterTopTier(code);
    }

    setCode(""); // Clear the input after adding code
  };

  return (
    <Card className="w-full p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Concert Tickets</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Choose your tier to register for a concert ticket. <b>Successful registrants receive a Ticket Claim Token (NFT).</b>
        </p>
      </div>

      {/* Tier Selection */}
      <div className="flex justify-between mb-8">
        {/* Standard Tier Card */}
        <div
          className={`cursor-pointer p-4 w-1/2 mr-2 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
            selectedTier === "standard" ? "border-4 border-blue-500" : "border border-gray-300"
          }`}
          onClick={() => setSelectedTier("standard")}
        >
          <FaTicketAlt className="text-blue-500 text-3xl mb-2" />
          <h3 className="text-lg font-bold">Standard Tier</h3>
          <p className="text-sm text-zinc-500">Standard price, 20% chance</p>
        </div>

        {/* Top Tier Card */}
        <div
          className={`cursor-pointer p-4 w-1/2 ml-2 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
            selectedTier === "top" ? "border-4 border-yellow-500" : "border border-gray-300"
          }`}
          onClick={() => setSelectedTier("top")}
        >
          <FaStar className="text-yellow-500 text-3xl mb-2" />
          <h3 className="text-lg font-bold">Top Tier</h3>
          <p className="text-sm text-zinc-500">150% price, 50% chance</p>
        </div>
      </div>

      {/* Code Input and Registration Button */}
      {selectedTier && (
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
            className={`mt-6 w-full ${
              selectedTier === "standard" ? "bg-blue-500 hover:bg-blue-600" : "bg-yellow-500 hover:bg-yellow-600"
            } text-white`}
            loading={loading}
            onClick={() => {
              if (wallet) {
                handleRegister();
              } else {
                onConnectWallet();
              }
            }}
          >
            {wallet ? `Register for ${selectedTier === "standard" ? "Standard Tier" : "Top Tier"}` : "Connect Wallet"}
          </Button>
        </Form>
      )}
    </Card>
  );
}
