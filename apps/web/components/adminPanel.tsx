"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaTicketAlt, FaStar } from "react-icons/fa";

interface AdminPanelProps {
  onAddCodes: (code: string) => void;
  onResetCounters: () => void;
}

export function AdminPanel({
  onAddCodes,
  onResetCounters,
}: AdminPanelProps) {
  const [newCode, setNewCode] = useState("");
  const [showDrawSection, setShowDrawSection] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"standard" | "top" | null>(null);
  const [standardNumbers, setStandardNumbers] = useState<number[]>([]);
  const [topNumbers, setTopNumbers] = useState<number[]>([]);

  const handleAddCode = () => {
    if (newCode.trim() !== "") {
      onAddCodes(newCode);
      setNewCode("");
    }
  };

  const drawDistinctNumbers = (max: number, count: number) => {
    const numbers = new Set<number>();
    while (numbers.size < count) {
      numbers.add(Math.floor(Math.random() * max));
    }
    return Array.from(numbers);
  };

  const handleDrawStandard = () => {
    setStandardNumbers(drawDistinctNumbers(25, 5));
  };

  // Top tier only gives out 1 ticket, for easy demo purposes
  const handleDrawTop = () => {
    const number = Math.floor(Math.random() * 2); // Random number between 0 and 1
    setTopNumbers([number]); // Set as an array with a single number for consistency
  };

  const distributeStandardTicketClaims = () => {
    console.log("Distributing standard tier ticket claims:", standardNumbers);
  };

  const distributeTopTicketClaims = () => {
    console.log("Distributing top tier ticket claims:", topNumbers);
  };

  return (
    <Card className="w-full p-8">
      <div className="mb-6">
        {/* <h2 className="text-2xl font-bold">Admin Panel</h2> */}
        <p className="mt-2 text-sm text-zinc-500">
          Manage ticket distribution for your event!
        </p>
      </div>

      {/* Reset Counters Section */}
      <Button 
        onClick={onResetCounters} 
        className="bg-gray-300 text-black hover:bg-gray-400 mb-6"
      >
        Set counters to 0
      </Button>

      {/* Code Input Section */}
      <div className="flex flex-col mb-6">
        <Input
          placeholder="Enter code to add"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="mb-2"
        />
        <Button
          onClick={handleAddCode}
          className="bg-gray-300 text-black hover:bg-gray-400"
        >
          Add Code
        </Button>
      </div>

      {/* Draw Lucky Winners Button */}
      <Button
        onClick={() => setShowDrawSection(!showDrawSection)}
        className="bg-blue-600 text-white hover:bg-blue-700 mb-6"
      >
        Draw Lucky Winners
      </Button>

      {/* Show tier selection and drawing only when "Draw Lucky Winners" is clicked */}
      {showDrawSection && (
        <>
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
              <p className="text-sm text-zinc-500">Standard distribution, 5 unique numbers between 0..24</p>
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
              <p className="text-sm text-zinc-500">Top distribution, draw a single number between 0 and 1</p>
            </div>
          </div>

          {/* Action Section for Selected Tier */}
          {selectedTier === "standard" && (
            <div className="mt-6">
              <Button
                onClick={handleDrawStandard}
                className="bg-blue-600 text-white hover:bg-blue-700 mb-2"
              >
                Draw Standard Tier Numbers
              </Button>
              <p>Standard Tier Numbers: {standardNumbers.join(", ")}</p>
              <Button
                onClick={distributeStandardTicketClaims}
                className="bg-gray-300 text-black hover:bg-gray-400 mt-2"
              >
                Distribute Standard Tickets
              </Button>
            </div>
          )}

          {selectedTier === "top" && (
            <div className="mt-6">
              <Button
                onClick={handleDrawTop}
                className="bg-yellow-500 text-white hover:bg-yellow-600 mb-2"
              >
                Draw Top Tier Number
              </Button>
              <p>Top Tier Number: {topNumbers.join(", ")}</p>
              <Button
                onClick={distributeTopTicketClaims}
                className="bg-gray-300 text-black hover:bg-gray-400 mt-2"
              >
                Distribute Top Ticket
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
