import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  description,
  defaultOpen = false,
  children,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && <div className="text-gray-400">{icon}</div>}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 bg-transparent">
          {children}
        </div>
      )}
    </div>
  );
};
