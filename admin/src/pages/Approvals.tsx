import React, { useState, useEffect } from 'react';
import { getEvents, getLocations, approveContent } from '../services/api';
import { CheckCircle, XCircle, Loader2, CalendarDays, MapPin, Clock, Search } from 'lucide-react';

const Approvals = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchPendingContent = async () => {
    try {
      const [eventsRes, locationsRes] = await Promise.all([
        getEvents(),
        getLocations()
      ]);
      
      const pendingEvents = (eventsRes.data.events || [])
        .filter(e => e.approval_status === 'pending')
        .map(e => ({ ...e, contentType: 'event' }));
        
      const pendingLocations = (locationsRes.data || [])
        .filter(l => l.approval_status === 'pending')
        .map(l => ({ ...l, contentType: 'location' }));

      setPendingItems([...pendingEvents, ...pendingLocations]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const handleApprove = async (type, id, status) => {
    setProcessingId(`${type}-${id}`);
    try {
      await approveContent(type, id, status);
      fetchPendingContent();
    } catch (error) {
      console.error("Failed to approve", error);
      alert("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const processedItems = pendingItems
    .filter((item: any) => {
      const query = searchTerm.toLowerCase();
      const titleOrName = (item.title || item.name || "").toLowerCase();
      const description = (item.description || "").toLowerCase();
      const author = (item.author || "Unknown").toLowerCase();
      return (
        titleOrName.includes(query) ||
        description.includes(query) ||
        author.includes(query)
      );
    })
    .sort((a: any, b: any) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === "events-first") {
        if (a.contentType === "event" && b.contentType !== "event") return -1;
        if (a.contentType !== "event" && b.contentType === "event") return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === "locations-first") {
        if (a.contentType === "location" && b.contentType !== "location") return -1;
        if (a.contentType !== "location" && b.contentType === "location") return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Content Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">Review pending events and locations submitted by users.</p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in duration-500">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search pending items by title, description, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="w-full md:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium text-slate-700 transition-colors"
            >
              <option value="newest">Sort: Newest Submission</option>
              <option value="oldest">Sort: Oldest Submission</option>
              <option value="events-first">Sort: Events First</option>
              <option value="locations-first">Sort: Locations First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {processedItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">All caught up!</h3>
            <p className="text-slate-500">
              {searchTerm 
                ? "No pending items match your search criteria." 
                : "There are no pending items requiring your approval."}
            </p>
          </div>
        ) : (
          processedItems.map((item: any) => {
            const isEvent = item.contentType === 'event';
            const isProcessing = processingId === `${item.contentType}-${item.id}`;
            
            return (
              <div key={`${item.contentType}-${item.id}`} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 transition-all hover:shadow-md">
                {/* Image or Icon */}
                <div className="sm:w-48 h-32 flex-shrink-0 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center relative">
                  {item.image ? (
                    <img src={item.image} alt={item.title || item.name} className="w-full h-full object-cover" />
                  ) : isEvent ? (
                    <CalendarDays className="h-10 w-10 text-slate-300" />
                  ) : (
                    <MapPin className="h-10 w-10 text-slate-300" />
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                    {isEvent ? 'Event' : 'Location'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title || item.name}</h3>
                    {isEvent && (
                      <p className="text-sm text-slate-600 mb-2 font-medium">
                        📍 {item.locationName} | 🕒 {item.date} {item.time}
                      </p>
                    )}
                    {!isEvent && (
                      <p className="text-sm text-slate-600 mb-2 font-medium">
                        🏷️ {item.type || 'General'} | Lat: {item.latitude || item.coordinate?.latitude}, Lng: {item.longitude || item.coordinate?.longitude}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  {item.author && (
                     <div className="mt-4 text-xs text-slate-400 flex items-center">
                        <span className="font-medium mr-1 text-slate-500">Submitted by:</span> {item.author}
                     </div>
                  )}
                </div>

                {/* Actions */}
                <div className="sm:w-32 flex flex-col justify-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                  <button
                    onClick={() => handleApprove(item.contentType, item.id, 'approved')}
                    disabled={isProcessing}
                    className="flex items-center justify-center w-full px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Approve</>}
                  </button>
                  <button
                    onClick={() => handleApprove(item.contentType, item.id, 'rejected')}
                    disabled={isProcessing}
                    className="flex items-center justify-center w-full px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                     {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-2" /> Reject</>}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Approvals;
