import React from 'react';
import { AuthenticatedLayout } from '@/layouts';
import { Main } from '@/components/layout/main';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Target,
  Clock,
  AlertTriangle,
  Eye,
  TrendingUp,
  AlertCircle,
  PieChart,
  BarChart3,
  Activity,
  Calendar,
  Users,
  CheckCircle
} from 'lucide-react';
import { router } from '@inertiajs/react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Make interfaces optional to handle undefined data
interface Stats {
  total_projects?: number;
  completed_projects?: number;
  in_progress_projects?: number;
  planning_projects?: number;
  on_hold_projects?: number;
  overdue_projects?: number;
  urgent_projects?: number;
  average_progress?: number;
}

interface Project {
  id: number;
  name: string;
  opd_owner?: string;
  status: string;
  progress_percentage: number;
  is_overdue?: boolean;
  is_urgent?: boolean;
  days_until_due?: number;
  due_date?: string;
}

interface Props {
  stats?: Stats;
  recent_projects?: Project[];
  urgent_projects?: Project[];
  status_chart_data?: any[];
  opd_chart_data?: any[];
  projects_by_opd?: any[];
}

export default function DashboardIndex({
                                         stats = {},
                                         recent_projects = [],
                                         urgent_projects = [],
                                         status_chart_data = [],
                                         opd_chart_data = [],
                                         projects_by_opd = []
                                       }: Props) {

  const statusColors = {
    planning: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-gray-100 text-gray-800',
  };

  // Enhanced color schemes
  const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#6b7280'];
  const GRADIENT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  // Prepare data for charts
  const pieChartData = status_chart_data.map((item, index) => ({
    name: item.name,
    value: item.value || 0,
    color: PIE_COLORS[index] || '#6b7280'
  }));

  const opdProgressData = opd_chart_data.slice(0, 6).map(opd => ({
    name: opd.name?.substring(0, 12) + (opd.name?.length > 12 ? '...' : '') || 'Tidak Diketahui',
    progress: opd.progress || 0,
    projects: opd.total_projects || 0
  }));

  // Mock data for trending chart
  const trendingData = [
    { month: 'Jan', completed: 4, in_progress: 8 },
    { month: 'Feb', completed: 6, in_progress: 12 },
    { month: 'Mar', completed: 8, in_progress: 15 },
    { month: 'Apr', completed: 12, in_progress: 18 },
    { month: 'Mei', completed: 16, in_progress: 20 },
    { month: 'Jun', completed: 20, in_progress: 22 },
  ];

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <AuthenticatedLayout title="Dashboard">
      <Main>
        <div className="space-y-8">
          {/* Hero Header with Gradient */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Dashboard Proyek</h1>
                  <p className="mt-2 text-lg text-blue-100">
                    Lacak dan pantau kemajuan proyek di semua departemen
                  </p>
                  <div className="mt-4 flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>{stats?.total_projects || 0} Proyek Aktif</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{projects_by_opd?.length || 0} Departemen</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{stats?.average_progress || 0}% Rata-rata Kemajuan</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Button
                    onClick={() => router.visit(route('dashboard.projects.index'))}
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Lihat Semua Proyek
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Proyek</CardTitle>
                <div className="rounded-full bg-green-100 p-2">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats?.total_projects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.completed_projects || 0} selesai bulan ini
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Rata-rata Kemajuan</CardTitle>
                <div className="rounded-full bg-blue-100 p-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats?.average_progress || 0}%</div>
                <Progress value={stats?.average_progress || 0} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Proyek Mendesak</CardTitle>
                <div className="rounded-full bg-orange-100 p-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats?.urgent_projects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Jatuh tempo dalam 7 hari
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Proyek Terlambat</CardTitle>
                <div className="rounded-full bg-red-100 p-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.overdue_projects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Perlu perhatian segera
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Project Status Pie Chart */}
            <Card className="lg:col-span-1 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-purple-100 p-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                  </div>
                  Status Proyek
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} proyek`, 'Total']}
                          contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Tidak ada data tersedia</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Trend Chart */}
            <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  Tren Kemajuan Proyek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendingData}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="1"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                        name="Selesai"
                      />
                      <Area
                        type="monotone"
                        dataKey="in_progress"
                        stackId="1"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorInProgress)"
                        name="Sedang Berlangsung"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* OPD Progress Chart - Full Width */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                </div>
                Kemajuan Proyek per Departemen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opdProgressData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={opdProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'progress' ? `${value}%` : value,
                          name === 'progress' ? 'Kemajuan' : 'Proyek'
                        ]}
                        contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend
                        formatter={(value) => value === 'progress' ? 'Kemajuan (%)' : 'Jumlah Proyek'}
                      />
                      <Bar dataKey="progress" fill="#10b981" name="progress" />
                      <Bar dataKey="projects" fill="#3b82f6" name="projects" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Tidak ada data departemen tersedia</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Project Lists */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent projects */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  Proyek Terbaru
                  <Badge variant="secondary" className="ml-auto">
                    {recent_projects?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recent_projects && recent_projects.length > 0 ? (
                  <div className="space-y-4">
                    {recent_projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="group p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate group-hover:text-blue-600 transition-colors">
                              {project.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {project.opd_owner || 'No OPD'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {project.status?.replace('_', ' ') || 'No Status'}
                              </Badge>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{project.progress_percentage || 0}%</span>
                              </div>
                              <Progress value={project.progress_percentage || 0} className="h-2" />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(route('dashboard.projects.show', project.id))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Tidak ada proyek terbaru</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Urgent projects */}
            <Card className="hover:shadow-lg transition-shadow border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <div className="rounded-full bg-orange-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  Proyek Mendesak
                  <Badge variant="destructive" className="ml-auto">
                    {urgent_projects?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {urgent_projects && urgent_projects.length > 0 ? (
                  <div className="space-y-4">
                    {urgent_projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="group p-4 border border-orange-200 rounded-lg bg-orange-50/50 hover:bg-orange-100/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate group-hover:text-orange-700 transition-colors">
                              {project.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs border-orange-300">
                                {project.opd_owner || 'No OPD'}
                              </Badge>
                              <Badge variant="destructive" className="text-xs">
                                {project.is_overdue ? 'Terlambat' : 'Segera'}
                              </Badge>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{project.progress_percentage || 0}%</span>
                              </div>
                              <Progress
                                value={project.progress_percentage || 0}
                                className="h-2"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(route('dashboard.projects.show', project.id))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-600 hover:text-orange-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                    <p className="text-green-600">Semua proyek berjalan sesuai rencana!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </AuthenticatedLayout>
  );
}
