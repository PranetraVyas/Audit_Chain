'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Eye, FileText, Network, Anchor, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getEvents, getDashboardStats, Event } from '@/lib/api';

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBatches: 0,
    anchoredRoots: 0,
    verificationRequests: 0,
    eventsChange: 0,
    batchesChange: 0,
    anchoredChange: 0,
    verificationChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, statsData] = await Promise.all([
        getEvents(5, 0),
        getDashboardStats(),
      ]);
      setEvents(eventsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Anchored':
        return 'bg-green-500';
      case 'Batched':
        return 'bg-blue-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Train':
        return 'text-blue-400';
      case 'Evaluate':
        return 'text-yellow-400';
      case 'Deploy':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#6C4EFF]/20 to-[#944BFF]/10 rounded-2xl p-8 md:p-12 border border-[#6C4EFF]/30">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#6C4EFF]">Blockchain-Backed</span>{' '}
            <span className="text-white">ML Audit Logging</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Tamper-proof, verifiable, and transparent machine learning lifecycle auditing. 
            Ensure integrity and compliance across your ML pipeline with cryptographic proof.
          </p>
          <div className="flex gap-4">
            <Link
              href="/audit-logs"
              className="px-6 py-3 bg-[#6C4EFF] hover:bg-[#5a3fe6] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Explore Audit Logs
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verification"
              className="px-6 py-3 bg-[#1B1B1D] hover:bg-[#2A2A2C] text-white rounded-lg font-medium transition-colors border border-[#2A2A2C]"
            >
              Verify Event
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#6C4EFF]/20 rounded-lg">
              <FileText className="w-6 h-6 text-[#6C4EFF]" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.eventsChange}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {loading ? '...' : stats.totalEvents.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Total Audit Events</div>
        </div>

        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#6C4EFF]/20 rounded-lg">
              <Network className="w-6 h-6 text-[#6C4EFF]" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.batchesChange}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {loading ? '...' : stats.totalBatches.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Merkle Batches Created</div>
        </div>

        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#6C4EFF]/20 rounded-lg">
              <Anchor className="w-6 h-6 text-[#6C4EFF]" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.anchoredChange}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {loading ? '...' : stats.anchoredRoots.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Anchored Roots</div>
        </div>

        <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#6C4EFF]/20 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-[#6C4EFF]" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.verificationChange}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {loading ? '...' : stats.verificationRequests.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Verification Requests</div>
        </div>
      </div>

      {/* Recent Audit Events */}
      <div className="bg-[#161618] rounded-xl border border-[#2A2A2C] overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2C] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Audit Events</h2>
          <Link
            href="/audit-logs"
            className="text-[#6C4EFF] hover:text-[#5a3fe6] text-sm font-medium transition-colors"
                  >
            View All
          </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
            <thead className="bg-[#1B1B1D] border-b border-[#2A2A2C]">
                      <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Event ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Model
                        </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Event Type
                        </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                        </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Timestamp
                        </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                        </th>
                      </tr>
                    </thead>
            <tbody className="divide-y divide-[#2A2A2C]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    No events yet. Create your first event!
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-[#1B1B1D] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      EVT-{String(event.id).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {event.model_name || event.model_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getEventTypeColor(event.event_type)}`}>
                              {event.event_type}
                            </span>
                          </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                        <span className="text-sm text-gray-300">{event.status}</span>
                      </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-[#6C4EFF] hover:text-[#5a3fe6] transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                          </td>
                        </tr>
                ))
              )}
                    </tbody>
                  </table>
                </div>
              </div>
    </div>
  );
}
