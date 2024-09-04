// components/adminPanel.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AdminPanelProps {
  onAddCodes: (code: string) => void;
  onResetCounters: () => void;
  standardTierCounter: string;
  topTierCounter: string;
}

export function AdminPanel({
  onAddCodes,
  onResetCounters,
  standardTierCounter,
  topTierCounter,
}: AdminPanelProps) {
  const [newCode, setNewCode] = useState("");

  const handleAddCode = () => {
    if (newCode.trim() !== "") {
      onAddCodes(newCode);
      setNewCode(""); // Clear the input field after adding the code
    }
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-md flex flex-col">
      {/* Reset Counters Section */}
      <Button 
        onClick={onResetCounters} 
        className="bg-blue-600 text-white hover:bg-blue-700 mb-6"
      >
        Reset Counters
      </Button>
      
      <div className="flex flex-row">
        {/* Code Input Section */}
        <div className="flex flex-col w-1/2 mr-4">
          <Input
            placeholder="Enter code to add"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="mb-2"
          />
          <Button 
            onClick={handleAddCode} 
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Code
          </Button>
        </div>

        {/* Ticket Distributor State Section */}
        <div className="flex flex-col w-1/2 ml-4">
          <h3 className="text-lg font-bold text-blue-800 mb-4">Ticket Distributor State</h3>
          <div className="bg-white p-2 rounded shadow">
          Registration Counters:
            <p>Standard Tier: {standardTierCounter}</p>
            <p>Top Tier: {topTierCounter}</p>
            {/* More state variables can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}
