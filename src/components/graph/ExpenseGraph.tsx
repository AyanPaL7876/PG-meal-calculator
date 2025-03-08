import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getExpenses } from "@/services/expenseService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, TrendingUp, DollarSign, Calendar } from "lucide-react";

interface Expense {
  date: string;
  totalMoney: number;
  category?: string;
}

const ExpenseGraph = ({ pgId }: { pgId: string }) => {
  const [data, setData] = useState<{ date: string; total: number }[]>([]);
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const expenses: Expense[] = await getExpenses(pgId);
        if (!expenses || !expenses.length) {
          setIsLoading(false);
          return;
        }

        // Calculate date range based on selected time period
        const now = new Date();
        let startDate = new Date();
        
        if (timeRange === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (timeRange === "month") {
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeRange === "year") {
          startDate.setFullYear(now.getFullYear() - 1);
        }

        // Filter expenses by date range
        const filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && expenseDate <= now;
        });

        // Group by date and sum expenses
        const groupedExpenses: Record<string, number> = {};
        let total = 0;
        
        filteredExpenses.forEach((expense) => {
          const date = expense.date.split("T")[0]; // Extract only the date (YYYY-MM-DD)
          if (!groupedExpenses[date]) {
            groupedExpenses[date] = 0;
          }
          groupedExpenses[date] += expense.totalMoney;
          total += expense.totalMoney;
        });

        setTotalAmount(total);

        // Convert to array for the chart and sort by date
        const chartData = Object.entries(groupedExpenses)
          .map(([date, total]) => ({ 
            date: formatDate(date), 
            rawDate: date,
            total 
          }))
          .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
          .map(({ date, total }) => ({ date, total }));
          
        setData(chartData);
      } catch (error) {
        console.error("Error fetching expense data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (pgId) {
      fetchData();
    }
  }, [pgId, timeRange]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black p-2 rounded border border-gray-700 text-white text-sm">
          <p className="font-semibold">{payload[0].payload.date}</p>
          <p className="text-indigo-300">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-900 text-white shadow-xl overflow-hidden border-0">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Expense Analysis</CardTitle>
            <CardDescription className="text-gray-400">Track your spending patterns</CardDescription>
          </div>
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 focus:ring-indigo-500">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="week" className="focus:bg-gray-700">Last Week</SelectItem>
              <SelectItem value="month" className="focus:bg-gray-700">Last Month</SelectItem>
              <SelectItem value="year" className="focus:bg-gray-700">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <div className="px-6 py-2">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Spent</p>
              <p className="h-4 w-4 text-indigo-400" >₹</p>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
            <div className="flex items-center mt-1 text-xs text-indigo-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>Based on {data.length} days</span>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Daily Average</p>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {data.length ? formatCurrency(totalAmount / data.length) : "$0"}
            </p>
            <div className="flex items-center mt-1 text-xs text-emerald-400">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{timeRange === "week" ? "Weekly" : timeRange === "month" ? "Monthly" : "Yearly"} view</span>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="bar" className="px-6 pb-6">
        <TabsList className="bg-gray-800 mb-4">
          <TabsTrigger value="bar" className="data-[state=active]:bg-indigo-600">Bar Chart</TabsTrigger>
          <TabsTrigger value="area" className="data-[state=active]:bg-indigo-600">Area Chart</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bar" className="mt-0">
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400">Loading data...</div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">No expense data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "#cbd5e0", fontSize: 12 }}
                    axisLine={{ stroke: "#4a5568" }}
                    tickLine={{ stroke: "#4a5568" }}
                  />
                  <YAxis 
                    tick={{ fill: "#cbd5e0", fontSize: 12 }}
                    axisLine={{ stroke: "#4a5568" }}
                    tickLine={{ stroke: "#4a5568" }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="total" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="area" className="mt-0">
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400">Loading data...</div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">No expense data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "#cbd5e0", fontSize: 12 }}
                    axisLine={{ stroke: "#4a5568" }}
                    tickLine={{ stroke: "#4a5568" }}
                  />
                  <YAxis 
                    tick={{ fill: "#cbd5e0", fontSize: 12 }}
                    axisLine={{ stroke: "#4a5568" }}
                    tickLine={{ stroke: "#4a5568" }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="total" 
                    fill="#a855f7" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ExpenseGraph;