'use client';

import { useState, useEffect } from 'react';
import { Eye, Filter } from 'lucide-react';
import { getEvents, Event } from '@/lib/api';

export default function AuditLogsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents(100, 0);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventIdStr = `EVT-${String(event.id).padStart(3, '0')}`;
    const matchesSearch = 
      eventIdStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.model_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.metadata_hash.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModel = !selectedModel || event.model_id === selectedModel;
    const matchesType = selectedType === 'All Types' || event.event_type === selectedType;
    const matchesStatus = selectedStatus === 'All Statuses' || event.status === selectedStatus;

    return matchesSearch && matchesModel && matchesType && matchesStatus;
  });

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

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 14)}...${hash.substring(hash.length - 4)}`;
  };

  const uniqueModels = Array.from(new Set(events.map(e => e.model_id)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-gray-400">Browse and filter all audit events recorded in the system.</p>
      </div>

      {/* Filters */}
      <div className="bg-[#161618] rounded-xl p-6 border border-[#2A2A2C]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-400 uppercase">FILTERS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by Event ID, Model ID, or Hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
          />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
          >
            <option value="">Model ID</option>
            {uniqueModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
          >
            <option>All Types</option>
            <option>Train</option>
            <option>Evaluate</option>
            <option>Deploy</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white focus:outline-none focus:border-[#6C4EFF] transition-colors"
          >
            <option>All Statuses</option>
            <option>Anchored</option>
            <option>Batched</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#161618] rounded-xl border border-[#2A2A2C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1B1B1D] border-b border-[#2A2A2C]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Event ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Model ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Event Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Merkle Leaf
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2C]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-[#1B1B1D] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      EVT-{String(event.id).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {event.model_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{event.event_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {truncateHash(event.metadata_hash)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {event.merkle_leaf_hash ? truncateHash(event.merkle_leaf_hash) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {event.batch_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                        <span className="text-sm text-gray-300">{event.status}</span>
                      </div>
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

