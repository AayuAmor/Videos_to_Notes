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
  BarChart,
  Bar,
} from "recharts";
import {
  Flame,
  BadgeCheck,
  Clock,
  FileText,
  PlayCircle,
  ListChecks,
} from "lucide-react";
// Card components replaced with inline styled divs

function getStats(tasks) {
  // Unplanned: no video_url and no process_time
  const unplanned = tasks.filter(
    (task) => !task.video_url && !task.process_time
  ).length;

  // Planned: has video_url or process_time
  const planned = tasks.filter(
    (task) => task.video_url || task.process_time
  ).length;

  // Incomplete: planned tasks that are not completed
  const incomplete = tasks.filter(
    (task) =>
      (task.video_url || task.process_time) && task.status !== "Completed"
  ).length;

  // Complete: has video_url or process_time and status is "Completed"
  const completed = tasks.filter(
    (task) =>
      (task.video_url || task.process_time) && task.status === "Completed"
  ).length;

  // Calculate streak: count consecutive days with at least one completed task
  const completedDates = tasks
    .filter((task) => task.status === "Completed" && task.process_time)
    .map((task) => {
      const d = new Date(task.process_time);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    });
  const uniqueDays = Array.from(new Set(completedDates)).sort((a, b) => b - a);
  let streak = 0;
  if (uniqueDays.length) {
    let current = uniqueDays[0];
    streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      if (uniqueDays[i] === current - 86400000) {
        streak++;
        current = uniqueDays[i];
      } else {
        break;
      }
    }
  }

  // Calculate total study time (sum process_time durations if available)
  // If process_time is a duration in hours, sum it; if it's a date, count as 1 hour
  let totalStudyTime = 0;
  tasks.forEach((task) => {
    if (
      task.status === "Completed" ||
      task.status === "Planned" ||
      task.status === "Pending"
    ) {
      if (task.duration) {
        totalStudyTime += Number(task.duration);
      } else if (
        task.process_time &&
        !isNaN(new Date(task.process_time).getTime())
      ) {
        totalStudyTime += 1; // fallback: count as 1 hour
      }
    }
  });

  // Badges: Consistency for streak >= 3
  const badges = [];
  if (streak >= 3) {
    badges.push({
      name: "Consistency",
      icon: <BadgeCheck className="w-5 h-5 text-green-500" />,
    });
  }
  return {
    planned,
    unplanned,
    completed,
    incomplete,
    streak,
    badges,
    totalStudyTime,
  };
}

const COLORS = ["#6366F1", "#10B981", "#F59E42", "#F43F5E", "#A3E635"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getProductivityTrend(tasks) {
  // Last 7 days
  const now = new Date();
  const trend = days.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).getTime();
    const dayEnd = dayStart + 86400000;
    const hours = tasks
      .filter(
        (t) =>
          t.status === "Completed" &&
          t.process_time &&
          new Date(t.process_time).getTime() >= dayStart &&
          new Date(t.process_time).getTime() < dayEnd
      )
      .reduce((sum, t) => sum + (t.duration ? Number(t.duration) : 1), 0);
    return { day, hours };
  });
  return trend;
}

function getTopicDistribution(tasks) {
  // Group by note_format (or use another property if needed)
  const dist = {};
  tasks.forEach((t) => {
    const topic = t.note_format || "Other";
    dist[topic] = (dist[topic] || 0) + 1;
  });
  return Object.entries(dist).map(([name, value]) => ({ name, value }));
}

function getHeatmapData(tasks) {
  // 4 weeks, 7 days each, sessions per day
  const now = new Date();
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(now);
      day.setDate(now.getDate() - (w * 7 + (6 - d)));
      const dayStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate()
      ).getTime();
      const dayEnd = dayStart + 86400000;
      const sessions = tasks.filter(
        (t) =>
          t.status === "Completed" &&
          t.process_time &&
          new Date(t.process_time).getTime() >= dayStart &&
          new Date(t.process_time).getTime() < dayEnd
      ).length;
      week.push(sessions);
    }
    weeks.push(week);
  }
  return weeks;
}

function getHeatColor(val) {
  if (val === 0) return "bg-gray-200";
  if (val === 1) return "bg-blue-200";
  if (val === 2) return "bg-blue-500";
  return "bg-blue-800";
}

const StatsDashboard = () => {
  const { tasks } = useLocalTasks();
  const stats = getStats(tasks);
  // Data for graphical comparison bar chart
  const comparisonData = [
    { name: "Planned", value: stats.planned },
    { name: "Completed", value: stats.completed },
    { name: "Unplanned", value: stats.unplanned },
    { name: "Incomplete", value: stats.incomplete },
  ];
  const productivityTrend = getProductivityTrend(tasks);
  const topicDistribution = getTopicDistribution(tasks);
  const heatmapData = getHeatmapData(tasks);
  // Additional dynamic stats
  const notesGenerated = tasks.filter(
    (t) => t.notes && t.notes.length > 0
  ).length;
  const videoCompletionRate =
    stats.planned > 0 ? Math.round((stats.completed / stats.planned) * 100) : 0;

  // Completely new dashboard layout
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Dashboard Header */}
      <div className="mb-10 text-left flex flex-col gap-2">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          Study Dashboard
        </h1>
        <p className="text-gray-400 text-xl">
          Your personalized study analytics and achievements
        </p>
      </div>

      {/* Summary Highlights */}
      <div className="flex flex-wrap gap-6 mb-12">
        <div className="flex-1 min-w-[220px] bg-gradient-to-br from-indigo-700 to-blue-600 rounded-3xl p-8 shadow-lg text-white flex flex-col items-start justify-center hover:scale-105 transition-transform">
          <Clock className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-extrabold">{stats.totalStudyTime}h</div>
          <div className="text-lg font-medium mt-1">Total Study Time</div>
        </div>
        <div className="flex-1 min-w-[220px] bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-8 shadow-lg text-white flex flex-col items-start justify-center hover:scale-105 transition-transform">
          <FileText className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-extrabold">{notesGenerated}</div>
          <div className="text-lg font-medium mt-1">Notes Generated</div>
        </div>
        <div className="flex-1 min-w-[220px] bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 shadow-lg text-white flex flex-col items-start justify-center hover:scale-105 transition-transform">
          <PlayCircle className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-extrabold">{videoCompletionRate}%</div>
          <div className="text-lg font-medium mt-1">Video Completion Rate</div>
        </div>
        <div className="flex-1 min-w-[220px] bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-8 shadow-lg text-black flex flex-col items-start justify-center hover:scale-105 transition-transform">
          <ListChecks className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-extrabold">
            {stats.completed}/{stats.planned}
          </div>
          <div className="text-lg font-medium mt-1">Planned vs Completed</div>
        </div>
        <div className="flex-1 min-w-[220px] bg-gradient-to-br from-red-400 to-red-600 rounded-3xl p-8 shadow-lg text-white flex flex-col items-start justify-center hover:scale-105 transition-transform">
          <ListChecks className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-extrabold">{stats.unplanned}</div>
          <div className="text-lg font-medium mt-1">Unplanned Tasks</div>
        </div>
        <div className="flex-1 min-w-[220px] bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-8 shadow-lg text-white flex flex-col items-start justify-center hover:scale-105 transition-transform">
          <Clock className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-extrabold">{stats.incomplete}</div>
          <div className="text-lg font-medium mt-1">Incomplete Tasks</div>
        </div>
      </div>

      {/* Streaks & Badges Section - prominent */}
      <div className="mb-12 flex flex-col md:flex-row gap-8 items-center justify-between bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-8 shadow-lg">
        <div className="flex items-center gap-4">
          <Flame className="w-10 h-10 text-orange-400" />
          <span className="text-3xl font-bold text-white">
            {stats.streak} days
          </span>
          <span className="text-lg text-gray-200 ml-2">Current streak</span>
        </div>
        <div className="flex gap-4 flex-wrap">
          {stats.badges.length > 0 ? (
            stats.badges.map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white/10 px-5 py-2 rounded-2xl shadow-sm hover:bg-white/20 transition-colors"
              >
                {badge.icon}
                <span className="text-lg font-medium text-white">
                  {badge.name}
                </span>
              </div>
            ))
          ) : (
            <span className="text-gray-300">No badges yet</span>
          )}
        </div>
      </div>

      {/* Charts Section - graphical comparison and trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Bar Chart: Graphical Comparison of Tasks */}
        <div className="rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
          <div className="px-6 pt-6 pb-2">
            <div className="font-semibold text-lg">
              Task Category Comparison
            </div>
          </div>
          <div className="px-6 pb-6 pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Line Chart: Productivity Trend */}
        <div className="rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
          <div className="px-6 pt-6 pb-2">
            <div className="font-semibold text-lg">Productivity Trend</div>
          </div>
          <div className="px-6 pb-6 pt-2">
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
          </div>
        </div>
        {/* Pie Chart: Topic Distribution */}
        <div className="rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
          <div className="px-6 pt-6 pb-2">
            <div className="font-semibold text-lg">Topic Distribution</div>
          </div>
          <div className="px-6 pb-6 pt-2">
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
          </div>
        </div>
      </div>

      {/* Heatmap Section - keep modern look */}
      <div className="rounded-2xl shadow-md hover:shadow-lg transition-shadow mb-8 bg-white dark:bg-gray-800">
        <div className="px-6 pt-6 pb-2">
          <div className="font-semibold text-lg">Daily Study Activity</div>
        </div>
        <div className="px-6 pb-6 pt-2">
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
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
