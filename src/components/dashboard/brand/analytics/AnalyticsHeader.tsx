
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsHeaderProps {
  selectedInfluencer: string;
  setSelectedInfluencer: (value: string) => void;
}

const AnalyticsHeader = ({ selectedInfluencer, setSelectedInfluencer }: AnalyticsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
      <h2 className="text-xl font-semibold">Business Analytics</h2>
      <Select 
        value={selectedInfluencer} 
        onValueChange={setSelectedInfluencer}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Select influencer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Influencers</SelectItem>
          <SelectItem value="emma">Emma Johnson</SelectItem>
          <SelectItem value="mike">Mike Chen</SelectItem>
          <SelectItem value="sophia">Sophia Rivera</SelectItem>
          <SelectItem value="james">James Wilson</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AnalyticsHeader;
