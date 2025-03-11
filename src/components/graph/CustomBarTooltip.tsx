import { TooltipProps } from "recharts";
import { Coffee, UtensilsCrossed, Moon } from "lucide-react";

interface CustomPayload {
  name: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
}

const CustomBarTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as CustomPayload;

    return (
      <div className="bg-black p-3 rounded border border-gray-700 text-white text-sm">
        <p className="font-bold mb-1">{data.name}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-yellow-400" />
            <span>Breakfast: {data.breakfast}</span>
          </div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-green-400" />
            <span>Lunch: {data.lunch}</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-purple-400" />
            <span>Dinner: {data.dinner}</span>
          </div>
          <div className="mt-1 pt-1 border-t border-gray-700">
            <span className="font-semibold">Total: {data.total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default CustomBarTooltip;
