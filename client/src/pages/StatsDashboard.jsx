import React from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dummy Data
const statData = {
  studyTime: 12.5,
  notesGenerated: 34,
  completionRate: 82,
  plannedTasks: 10,
  completedTasks: 8,
  streak: 6,
  badges: [
    {
      name: "Consistency",
      icon: <BadgeCheck className="w-5 h-5 text-green-500" />,
    },
    { name: "Early Bird", icon: <Flame className="w-5 h-5 text-orange-500" /> },
  ],
};

const productivityTrend = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 1.5 },
  { day: "Wed", hours: 2.5 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 1 },
  { day: "Sat", hours: 2 },
  { day: "Sun", hours: 1.5 },
];

const topicDistribution = [
  { name: "Math", value: 8 },
  { name: "CS", value: 12 },
  { name: "Physics", value: 6 },
  { name: "Chemistry", value: 4 },
  { name: "Other", value: 4 },
];

const COLORS = ["#6366F1", "#10B981", "#F59E42", "#F43F5E", "#A3E635"];

const heatmapData = [
  [1, 2, 0, 1, 2, 1, 0],
  [2, 1, 1, 2, 1, 2, 1],
  [0, 1, 2, 1, 0, 1, 2],
  [1, 2, 1, 0, 2, 1, 1],
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHeatColor(val) {
  if (val === 0) return "bg-gray-200";
  if (val === 1) return "bg-blue-200";
  if (val === 2) return "bg-blue-500";
  return "bg-blue-800";
}

const StatsDashboard = () => (
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
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-500" />
          <CardTitle className="text-lg">Total Study Time</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{statData.studyTime}h</span>
          <div className="text-gray-400 text-sm mt-1">This week</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-500" />
          <CardTitle className="text-lg">Notes Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{statData.notesGenerated}</span>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-pink-500" />
          <CardTitle className="text-lg">Video Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{statData.completionRate}%</span>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-yellow-500" />
          <CardTitle className="text-lg">Planned vs Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">
            {statData.completedTasks}/{statData.plannedTasks}
          </span>
          <div className="text-gray-400 text-sm mt-1">Tasks</div>
        </CardContent>
      </Card>
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
            <LineChart data={productivityTrend}>
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
                data={topicDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name }) => name}
              >
                {topicDistribution.map((entry, idx) => (
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
          {heatmapData.map((week, i) => (
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
            <span className="text-xl font-bold">{statData.streak} days</span>
            <span className="text-gray-400 ml-2">Current streak</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {statData.badges.map((badge, idx) => (
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
  </div>
);

export default StatsDashboard;
