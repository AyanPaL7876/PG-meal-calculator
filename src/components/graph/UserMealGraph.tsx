import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Coffee, UtensilsCrossed, Moon } from "lucide-react";
import CustomBarTooltip from "./CustomBarTooltip";
import { mealData } from "@/types/pg";

interface StoreUser {
  id: string;
  name: string;
  avatar?: string;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"];
const MEAL_ICONS = {
  breakfast: <Coffee className="h-4 w-4" />,
  lunch: <UtensilsCrossed className="h-4 w-4" />,
  dinner: <Moon className="h-4 w-4" />,
};

const UserMealGraph = ({ pgId }: { pgId: string }) => {
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [mealData, setMealData] = useState<mealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState("total"); // "total" or "daily"
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const fetchMealData = async () => {
    setLoading(true);
    try {
      // Fetch PG data to get meal sheet
      const pgRef = doc(db, "pgs", pgId);
      const pgSnap = await getDoc(pgRef);

      if (!pgSnap.exists()) {
        throw new Error("PG not found");
      }

      const pgData = pgSnap.data();
      const mealSheet: mealData[] = pgData?.currMonth?.mealSheet || [];
      setMealData(mealSheet);

      // Extract unique dates from all users' meal details
      const dates = new Set<string>();
      mealSheet.forEach((user: mealData) => {
        // Explicitly type 'user'
        user.details.forEach((detail) => {
          dates.add(detail.date);
        });
      });

      const sortedDates = Array.from(dates).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      setAvailableDates(sortedDates);
      if (sortedDates.length > 0) {
        setSelectedDate(sortedDates[sortedDates.length - 1]); // Default to most recent date
      }

      // Fetch user details for each user in the meal sheet
      const userPromises = mealSheet.map(async (meal) => {
        const userRef = doc(db, "users", meal.userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists())
          return { id: meal.userId, name: "Unknown StoreUser" };
        const userData = userSnap.data();
        return {
          id: meal.userId,
          name: userData.name || userData.displayName || "Unknown",
          avatar: userData.photoURL || userData.avatar,
        };
      });

      const fetchedUsers = await Promise.all(userPromises);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching meal data:", err);
      setError("Failed to load meal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pgId) {
      fetchMealData();
    }
  }, [pgId, fetchMealData]);

  // Prepare data for total meals chart
  const prepareUserTotalData = () => {
    return users
      .map((user, index) => {
        const userMeal = mealData.find((meal) => meal.userId === user.id);
        const totalMealCount = userMeal
          ? userMeal.details.reduce(
              (total, detail) => total + detail.sessions.length,
              0
            ) + (userMeal.extra || 0)
          : 0;

        // Count meal types
        const mealTypes = { breakfast: 0, lunch: 0, dinner: 0 };
        if (userMeal) {
          userMeal.details.forEach((detail) => {
            detail.sessions.forEach((session) => {
              if (MEAL_TYPES.includes(session.toLowerCase())) {
                mealTypes[session.toLowerCase() as keyof typeof mealTypes]++;
              }
            });
          });
        }

        return {
          name: user.name,
          userId: user.id,
          total: totalMealCount,
          breakfast: mealTypes.breakfast,
          lunch: mealTypes.lunch,
          dinner: mealTypes.dinner,
          color: COLORS[index % COLORS.length],
        };
      })
      .sort((a, b) => b.total - a.total); // Sort by total meals descending
  };

  // Prepare data for daily meals chart
  const prepareDailyData = () => {
    if (!selectedDate) return [];

    return users
      .map((user, index) => {
        const userMeal = mealData.find((meal) => meal.userId === user.id);
        let breakfast = 0,
          lunch = 0,
          dinner = 0;

        if (userMeal) {
          const dayMeal = userMeal.details.find(
            (detail) => detail.date === selectedDate
          );
          if (dayMeal) {
            dayMeal.sessions.forEach((session) => {
              if (session.toLowerCase() === "breakfast") breakfast = 1;
              if (session.toLowerCase() === "lunch") lunch = 1;
              if (session.toLowerCase() === "dinner") dinner = 1;
            });
          }
        }

        return {
          name: user.name,
          userId: user.id,
          breakfast,
          lunch,
          dinner,
          total: breakfast + lunch + dinner,
          color: COLORS[index % COLORS.length],
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const totalData = prepareUserTotalData();
  const dailyData = prepareDailyData();

  // Calculate meal type totals
  const mealTypeTotals = {
    breakfast: totalData.reduce((sum, user) => sum + user.breakfast, 0),
    lunch: totalData.reduce((sum, user) => sum + user.lunch, 0),
    dinner: totalData.reduce((sum, user) => sum + user.dinner, 0),
  };

  const pieData = [
    { name: "Breakfast", value: mealTypeTotals.breakfast },
    { name: "Lunch", value: mealTypeTotals.lunch },
    { name: "Dinner", value: mealTypeTotals.dinner },
  ];

  if (loading) {
    return (
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading meal data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="text-center text-red-400">
            <p>{error}</p>
            <button
              onClick={fetchMealData}
              className="mt-4 px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 text-white shadow-xl border-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Meal Analytics
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track meal consumption across users
            </CardDescription>
          </div>

          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-full sm:w-auto bg-gray-800 border-gray-700">
              <SelectValue placeholder="View type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="total" className="focus:bg-gray-700">
                Total Meals
              </SelectItem>
              <SelectItem value="daily" className="focus:bg-gray-700">
                Daily View
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {viewType === "daily" && availableDates.length > 0 && (
          <div className="mt-2">
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {availableDates.map((date) => (
                  <SelectItem
                    key={date}
                    value={date}
                    className="focus:bg-gray-700"
                  >
                    {formatDate(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-6">
        {viewType === "total" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={totalData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d3748"
                      horizontal={false}
                    />
                    <XAxis type="number" tick={{ fill: "#cbd5e0" }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: "#cbd5e0" }}
                      width={100}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="breakfast"
                      name="Breakfast"
                      stackId="a"
                      fill="#ffc658"
                    />
                    <Bar
                      dataKey="lunch"
                      name="Lunch"
                      stackId="a"
                      fill="#82ca9d"
                    />
                    <Bar
                      dataKey="dinner"
                      name="Dinner"
                      stackId="a"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 text-center">
                Meal Type Distribution
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {Object.entries(mealTypeTotals).map(([type, count], index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded p-2 text-center"
                  >
                    <div className="flex justify-center mb-1">
                      {MEAL_ICONS[type as keyof typeof MEAL_ICONS]}
                    </div>
                    <div className="text-sm capitalize">{type}</div>
                    <div className="text-xl font-bold">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium mb-4">
              Meals for{" "}
              {selectedDate ? formatDate(selectedDate) : "Selected Date"}
            </h3>

            {dailyData.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                No meal data available for this date
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d3748"
                      vertical={true}
                    />
                    <XAxis dataKey="name" tick={{ fill: "#cbd5e0" }} />
                    <YAxis
                      tick={{ fill: "#cbd5e0" }}
                      domain={[0, 1]}
                      tickCount={2}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="breakfast"
                      name="Breakfast"
                      fill="#ffc658"
                      maxBarSize={60}
                    />
                    <Bar
                      dataKey="lunch"
                      name="Lunch"
                      fill="#82ca9d"
                      maxBarSize={60}
                    />
                    <Bar
                      dataKey="dinner"
                      name="Dinner"
                      fill="#8884d8"
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {MEAL_TYPES.map((type) => {
                const count = dailyData.reduce(
                  (sum, user) =>
                    sum + (user[type as keyof typeof user] as number),
                  0
                );
                const percentage = dailyData.length
                  ? Math.round((count / dailyData.length) * 100)
                  : 0;

                return (
                  <div key={type} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {MEAL_ICONS[type as keyof typeof MEAL_ICONS]}
                        <span className="capitalize font-medium">{type}</span>
                      </div>
                      <span className="text-sm bg-gray-700 px-2 py-1 rounded">
                        {percentage}% participation
                      </span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          type === "breakfast"
                            ? "bg-yellow-400"
                            : type === "lunch"
                            ? "bg-green-400"
                            : "bg-purple-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="mt-2 text-sm text-gray-400">
                      {count} out of {dailyData.length} users
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserMealGraph;
