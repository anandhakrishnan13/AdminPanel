import * as React from "react";
import { Users, Building2, TrendingUp, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/services/api.service";
import type { UserStats } from "@/services/api.service";

export function Dashboard(): React.ReactNode {
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Fetch user statistics from backend
  React.useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await userService.getUserStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calculate stats configuration from backend data
  const statsConfig = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      { 
        title: "Total Users", 
        value: stats.total.toString(), 
        description: `${stats.byStatus.active} active, ${stats.byStatus.inactive} inactive`, 
        icon: Users 
      },
      { 
        title: "Super Admins", 
        value: stats.byRole.superAdmin.toString(), 
        description: "Full system access", 
        icon: Building2 
      },
      { 
        title: "Admins & HODs", 
        value: (stats.byRole.admin + stats.byRole.hod).toString(), 
        description: `${stats.byRole.admin} Admins, ${stats.byRole.hod} HODs`, 
        icon: TrendingUp 
      },
      { 
        title: "Managers & Employees", 
        value: (stats.byRole.manager + stats.byRole.employee).toString(), 
        description: `${stats.byRole.manager} Managers, ${stats.byRole.employee} Employees`, 
        icon: Clock 
      },
    ];
  }, [stats]);

  // Recent activity data (mock for now - can be fetched from backend later)
  const recentActivity = [
    { user: "Jane Admin", action: "Created new user", time: "2 hours ago" },
    { user: "Robert HOD", action: "Updated permissions", time: "4 hours ago" },
    { user: "Sarah Manager", action: "Logged in", time: "5 hours ago" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your activity this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              Chart placeholder
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {activity.user.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
