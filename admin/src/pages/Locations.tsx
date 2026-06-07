import {
  Image as ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
  uploadImage,
} from "../services/api";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    latitude: "",
    longitude: "",
    description: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);

  const fetchLocations = async () => {
    try {
      const { data } = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenModal = (loc = null) => {
    if (loc) {
      setCurrentLocation(loc);
      setFormData({
        name: loc.name,
        type: loc.type || "",
        latitude: loc.coordinate?.latitude || loc.latitude || "",
        longitude: loc.coordinate?.longitude || loc.longitude || "",
        description: loc.description || "",
        image: loc.image || "",
      });
    } else {
      setCurrentLocation(null);
      setFormData({
        name: "",
        type: "",
        latitude: "",
        longitude: "",
        description: "",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };
      if (currentLocation) {
        await updateLocation(currentLocation.id, payload);
      } else {
        await createLocation(payload);
      }
      handleCloseModal();
      fetchLocations();
    } catch (error) {
      console.error("Failed to save location", error);
      alert("Failed to save location");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocation(id);
        fetchLocations();
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

  const uniqueTypes = ["All", ...Array.from(new Set(locations.map(loc => loc.type).filter(Boolean)))];

  const processedLocations = locations
    .filter((loc) => {
      const matchesSearch =
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.type || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === "All" || loc.type === selectedType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "type-asc") {
        return (a.type || "").localeCompare(b.type || "");
      }
      if (sortBy === "type-desc") {
        return (b.type || "").localeCompare(a.type || "");
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
          <h1 className="text-2xl font-bold text-slate-900">
            Manage Locations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Add, edit, or remove campus locations.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Location
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
            placeholder="Search locations by name, type, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="w-1/2 md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium text-slate-700 transition-colors"
            >
              <option value="All">All Types</option>
              {uniqueTypes.filter(t => t !== "All").map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2 md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium text-slate-700 transition-colors"
            >
              <option value="name-asc">Sort: Name A-Z</option>
              <option value="name-desc">Sort: Name Z-A</option>
              <option value="type-asc">Sort: Type A-Z</option>
              <option value="type-desc">Sort: Type Z-A</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Coordinates</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedLocations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    {searchTerm || selectedType !== "All" ? "No locations match your search/filter criteria." : "No locations found."}
                  </td>
                </tr>
              ) : (
                processedLocations.map((loc) => (
                  <tr
                    key={loc.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mr-4 border border-slate-200">
                          {loc.image ? (
                            <img
                              src={loc.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <MapPin className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="font-medium text-slate-900">
                          {loc.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {loc.type || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="text-xs">
                        Lat: {loc.coordinate?.latitude || loc.latitude}
                      </div>
                      <div className="text-xs">
                        Lng: {loc.coordinate?.longitude || loc.longitude}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          loc.approval_status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : loc.approval_status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {loc.approval_status || "approved"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(loc)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors mr-2"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id)}
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
                {currentLocation ? "Edit Location" : "Add New Location"}
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
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    placeholder="e.g., Lecture Rooms, Hostel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Image Upload
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
                  {currentLocation ? "Update Location" : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
