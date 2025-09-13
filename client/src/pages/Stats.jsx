import React from "react";
import { useLocalTasks } from "../useLocalTasks";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Flame,
  BadgeCheck,
  Clock,
  FileText,
  PlayCircle,
  ListChecks,
} from "lucide-react";

const COLORS = ["#6366F1", "#10B981", "#F59E42", "#F43F5E", "#A3E635"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHeatColor(val) {
  if (val === 0) return "bg-gray-200";
  if (val === 1) return "bg-blue-200";
  if (val === 2) return "bg-blue-500";
  return "bg-blue-800";
}

const Card = ({ className = "", children }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-0 ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={`px-6 pt-6 pb-2 ${className}`}>{children}</div>
);
const CardTitle = ({ className = "", children }) => (
  <div className={`font-semibold text-lg ${className}`}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={`px-6 pb-6 pt-2 ${className}`}>{children}</div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex items-center gap-2">
      <Icon className={`w-6 h-6 ${color}`} />
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <span className="text-3xl font-bold">{value}</span>
    </CardContent>
  </Card>
);

const StatsDashboard = () => {
  const { tasks, history } = useLocalTasks();

  // --- Stats calculated from local data ---
  const notesGenerated = history.filter(
    (h) => h.notes && h.notes.length > 0
  ).length;
  const studyTime = "-"; // Not tracked locally
  const plannedTasks = tasks.filter(
    (task) =>
      task.status === "Pending" ||
      task.status === "Not Started" ||
      (task.process_time && new Date(task.process_time) > new Date())
  );
  const completedTasks = tasks.filter((task) => task.status === "Completed");
  const unplannedTasks = history.filter(
    (h) => !tasks.some((t) => t.video_url === h.content)
  ).length;
  const incompleteTasks = tasks.filter(
    (task) => task.status !== "Completed" && task.status !== "Failed"
  ).length;
  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;
  const plannedVsCompleted = `${completedTasks.length}/${plannedTasks.length}`;

  // Topic distribution (group by task.topic)
  const topicMap = {};
  tasks.forEach((task) => {
    const topic = task.topic || "Other";
    topicMap[topic] = (topicMap[topic] || 0) + 1;
  });
  const topicDistributionData = Object.entries(topicMap).map(
    ([name, value]) => ({ name, value })
  );

  // Productivity trend (count completed tasks per day this week)
  const now = new Date();
  const trendData = days.map((day, idx) => {
    // Find date for this day
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - ((now.getDay() + 6 - idx) % 7)
    );
    const count = completedTasks.filter((task) => {
      if (!task.completed_at) return false;
      const d = new Date(task.completed_at);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    }).length;
    return { day, hours: count };
  });

  // Heatmap (count tasks per day for last 4 weeks)
  const heatmapWeeks = Array.from({ length: 4 }, (_, w) =>
    days.map((day, idx) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (w * 7 + ((now.getDay() + 6 - idx) % 7))
      );
      return tasks.filter((task) => {
        if (!task.completed_at) return false;
        const d = new Date(task.completed_at);
        return (
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      }).length;
    })
  );

  // Streaks & Badges (dummy: current streak is max consecutive days with completed tasks)
  let streak = 0;
  let maxStreak = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const count = completedTasks.filter((task) => {
      if (!task.completed_at) return false;
      const d = new Date(task.completed_at);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    }).length;
    if (count > 0) {
      streak++;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 0;
    }
  }
  // Badges (dummy: earned for >5 completed, >5 planned, etc.)
  const badges = [];
  if (completedTasks.length > 5)
    badges.push({
      name: "Consistency",
      icon: <BadgeCheck className="w-5 h-5 text-green-500" />,
    });
  if (plannedTasks.length > 5)
    badges.push({
      name: "Planner",
      icon: <ListChecks className="w-5 h-5 text-blue-500" />,
    });
  if (completionRate > 80)
    badges.push({
      name: "High Performer",
      icon: <Flame className="w-5 h-5 text-orange-500" />,
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold flex items-center justify-center gap-2">
          <span>📊</span> Study Stats
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Your weekly study insights and achievements powered by
          Videos-to-Notes-AI.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Study Time"
          value={`${studyTime}h`}
          icon={Clock}
          color="text-indigo-500"
        />
        <StatCard
          title="Notes Generated"
          value={notesGenerated}
          icon={FileText}
          color="text-green-500"
        />
        <StatCard
          title="Video Completion Rate"
          value={`${completionRate}%`}
          icon={PlayCircle}
          color="text-pink-500"
        />
        <StatCard
          title="Planned vs Completed"
          value={plannedVsCompleted}
          icon={ListChecks}
          color="text-yellow-500"
        />
        <StatCard
          title="Unplanned Tasks"
          value={unplannedTasks}
          icon={Clock}
          color="text-red-500"
        />
        <StatCard
          title="Incomplete Tasks"
          value={incompleteTasks}
          icon={Clock}
          color="text-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Line Chart */}
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Pie Chart */}
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Topic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={topicDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name }) => name}
                >
                  {topicDistributionData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Section */}
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Daily Study Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {heatmapWeeks.map((week, i) => (
              <div key={i} className="flex gap-2">
                {week.map((val, j) => (
                  <div
                    key={j}
                    className={`w-8 h-8 rounded-lg ${getHeatColor(
                      val
                    )} border border-gray-100 transition-colors`}
                    title={`${days[j]}: ${
                      val === 0
                        ? "No study"
                        : `${val} session${val > 1 ? "s" : ""}`
                    }`}
                  />
                ))}
              </div>
            ))}
            <div className="flex gap-2 mt-2 justify-center">
              {days.map((d, i) => (
                <span key={i} className="text-xs text-gray-400 w-8 text-center">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streaks & Badges Section */}
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Streaks & Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <span className="text-xl font-bold">{maxStreak} days</span>
              <span className="text-gray-400 ml-2">Current streak</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-2xl shadow-sm hover:bg-gray-200 transition-colors"
                >
                  {badge.icon}
                  <span className="text-sm font-medium text-gray-700">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* No error message needed, all local */}
    </div>
  );
};

export default StatsDashboard;
