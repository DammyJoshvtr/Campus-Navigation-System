import {
    CalendarDays,
    Image as ImageIcon,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    createEvent,
    deleteEvent,
    getEvents,
    updateEvent,
    uploadImage,
} from "../services/api";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    locationName: "",
    date: "",
    time: "",
    status: "upcoming",
    image: "",
    author: "",
  });
  const [uploading, setUploading] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data } = await getEvents();
      setEvents(data.events || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (evt = null) => {
    if (evt) {
      setCurrentEvent(evt);
      setFormData({
        title: evt.title,
        description: evt.description || "",
        locationName: evt.locationName || "",
        date: evt.date || "",
        time: evt.time || "",
        status: evt.status || "upcoming",
        image: evt.image || "",
        author: evt.author || "",
      });
    } else {
      setCurrentEvent(null);
      setFormData({
        title: "",
        description: "",
        locationName: "",
        date: "",
        time: "",
        status: "upcoming",
        image: "",
        author: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentEvent) {
        await updateEvent(currentEvent.id, formData);
      } else {
        await createEvent(formData);
      }
      handleCloseModal();
      fetchEvents();
    } catch (error) {
      console.error("Failed to save event", error);
      alert("Failed to save event");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        fetchEvents();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const processedEvents = events
    .filter((evt: any) => {
      const query = searchTerm.toLowerCase();
      return (
        evt.title.toLowerCase().includes(query) ||
        (evt.locationName || "").toLowerCase().includes(query) ||
        (evt.author || "").toLowerCase().includes(query) ||
        (evt.description || "").toLowerCase().includes(query)
      );
    })
    .sort((a: any, b: any) => {
      if (sortBy === "date-asc") {
        const dateA = a.date ? new Date(`${a.date}T${a.time || "00:00:00"}`).getTime() : 0;
        const dateB = b.date ? new Date(`${b.date}T${b.time || "00:00:00"}`).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === "date-desc") {
        const dateA = a.date ? new Date(`${a.date}T${a.time || "00:00:00"}`).getTime() : 0;
        const dateB = b.date ? new Date(`${b.date}T${b.time || "00:00:00"}`).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "newest") {
        return b.id - a.id;
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Events</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create and manage campus events.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search events by title, location, author, description..."
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
              <option value="newest">Sort: Newest First</option>
              <option value="date-asc">Sort: Event Date (Soonest)</option>
              <option value="date-desc">Sort: Event Date (Furthest)</option>
              <option value="title-asc">Sort: Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Event</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    {searchTerm ? "No events match your search query." : "No events found."}
                  </td>
                </tr>
              ) : (
                processedEvents.map((evt: any) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mr-4 border border-slate-200">
                          {evt.image ? (
                            <img
                              src={evt.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <CalendarDays className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {evt.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            By {evt.author || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="text-sm">{evt.date}</div>
                      <div className="text-xs text-slate-500">{evt.time}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {evt.locationName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          evt.approval_status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : evt.approval_status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {evt.approval_status || "approved"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(evt)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors mr-2"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                {currentEvent ? "Edit Event" : "Create Event"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={formData.locationName}
                    onChange={(e) =>
                      setFormData({ ...formData, locationName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Event Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
                      />
                      {uploading && (
                        <span className="text-xs text-primary-600 mt-2 block">
                          Uploading...
                        </span>
                      )}
                    </div>
                  </div>
                  {formData.image && (
                    <div className="mt-2 flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium truncate max-w-[20rem] md:max-w-md">
                        {formData.image.startsWith("data:")
                          ? "✓ Image stored in database (Base64)"
                          : formData.image}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {currentEvent ? "Update Event" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
