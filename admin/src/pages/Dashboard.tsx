import React, { useEffect, useState } from 'react';
import { getOverview } from '../services/api';
import { Users, MapPin, CalendarDays, Loader2, ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-xl ${colorClass} mr-5`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, events: 0, locations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOverview();
        setStats({
          users: data.users?.length || 0,
          events: data.events?.length || 0,
          locations: data.locations?.length || 0
        });
      } catch (error) {
        console.error("Failed to fetch overview", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back to the Admin Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={Users} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Campus Locations" 
          value={stats.locations} 
          icon={MapPin} 
          colorClass="bg-emerald-500" 
        />
        <StatCard 
          title="Total Events" 
          value={stats.events} 
          icon={CalendarDays} 
          colorClass="bg-violet-500" 
        />
      </div>

      {/* Quick Actions / Recent Activity placeholder */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Quick Tips</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start">
             <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                <MapPin className="text-emerald-500 h-5 w-5" />
             </div>
             <div>
                <h4 className="font-semibold text-slate-800 mb-1">Manage Locations</h4>
                <p className="text-sm text-slate-500">Keep campus maps updated by adding or editing locations.</p>
             </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start">
             <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                <CheckSquare className="text-amber-500 h-5 w-5" />
             </div>
             <div>
                <h4 className="font-semibold text-slate-800 mb-1">Review Pending Content</h4>
                <p className="text-sm text-slate-500">Check the Approvals tab to review user-submitted events or locations.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Need CheckSquare icon above
import { CheckSquare } from 'lucide-react';

export default Dashboard;
