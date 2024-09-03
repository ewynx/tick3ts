import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Adjusted import path for consistency
import { useState } from "react";

interface AdminPanelProps {
  onAddCodes: (code: string) => void;
  onInitializeState: () => void;
}

export function AdminPanel({ onAddCodes, onInitializeState }: AdminPanelProps) {
  const [newCode, setNewCode] = useState("");

  const handleAddCode = () => {
    if (newCode.trim() !== "") {
      onAddCodes(newCode);
      setNewCode(""); // Clear the input after adding code
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md bg-white admin-panel">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <div className="flex flex-col mb-4">
        <Input
          placeholder="Enter code to add"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleAddCode} className="mt-2">
          Add Code
        </Button>
      </div>
      <div>
        <Button onClick={onInitializeState} className="mt-2">
          Initialize State
        </Button>
      </div>
    </div>
  );
}
