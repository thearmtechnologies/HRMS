import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Grid,
  Info,
  List as ListIcon,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Users,
  AlertCircle,
  Edit,
  X,
  Building2,
  User,
  Repeat,
  Archive,
  RotateCcw,
  DollarSign,
  Briefcase,
  Megaphone
} from "lucide-react";
import holidayService from "../../services/holidayService";
import { AuthContext } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HOLIDAY_TYPES = [
  { value: "National", label: "National Holiday", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "Company", label: "Company Holiday", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "Regional", label: "Regional Holiday", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "Festival", label: "Festival", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "Emergency Closure", label: "Emergency Closure", color: "bg-red-100 text-red-700 border-red-200" }
];

export default function HolidayManagement() {
  const { user } = React.useContext(AuthContext);
  const canEdit = ["admin", "hr"].includes(user?.role);

  // --- STATE ---
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);
  const [holidaysList, setHolidaysList] = useState([]);
  const [legacyHolidays, setLegacyHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Applicability lists
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);

  // UI / Filtering State
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [showArchived, setShowArchived] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterScope, setFilterScope] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [currentHoliday, setCurrentHoliday] = useState(null);
  const [summaryHoliday, setSummaryHoliday] = useState(null);

  // Series vs Occurrence Prompt State
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [seriesAction, setSeriesAction] = useState("edit"); // 'edit' | 'archive'
  const [seriesTarget, setSeriesTarget] = useState(null);
  const [selectedScope, setSelectedScope] = useState("this_occurrence"); // 'this_occurrence' | 'entire_series'

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "Company",
    description: "",
    durationType: "Single Day",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    halfDayType: "First Half",
    customTime: { startTime: "09:00", endTime: "13:00" },
    isPaid: true,
    repeatEveryYear: false,
    appliesTo: "Entire Company",
    applicableDepartments: [],
    applicableLocations: [],
    applicableEmployees: []
  });

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchYears();
    fetchScopes();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchHolidays(selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const fetchYears = async () => {
    try {
      const years = await holidayService.getAllYears();
      if (Array.isArray(years) && years.length > 0) {
        setAvailableYears(years);
        if (!years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load years:", err);
    }
  };

  const fetchScopes = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Departments
      const deptRes = await fetch("http://localhost:5000/api/department", { headers });
      if (deptRes.ok) {
        const dData = await deptRes.json();
        setDepartments(Array.isArray(dData) ? dData : []);
      }

      // Sites / Locations
      const siteRes = await fetch("http://localhost:5000/api/site", { headers });
      if (siteRes.ok) {
        const sData = await siteRes.json();
        setLocations(Array.isArray(sData) ? sData : []);
      }

      // Employees
      if (canEdit) {
        const empRes = await fetch("http://localhost:5000/api/employee", { headers });
        if (empRes.ok) {
          const eData = await empRes.json();
          setEmployees(Array.isArray(eData) ? eData : []);
        }
      }
    } catch (err) {
      console.error("Failed to load applicability scopes:", err);
    }
  };

  const fetchHolidays = async (year) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await holidayService.getHolidaysByYear(year);
      if (data && data.holidaysList) {
        setHolidaysList(data.holidaysList);
        setLegacyHolidays(data.holidays || []);
      } else if (data && data.holidays) {
        // Fallback for older format
        setLegacyHolidays(data.holidays);
        const flat = [];
        data.holidays.forEach(m => {
          (m.holidays || []).forEach(h => {
            flat.push({ ...h, startDate: `${year}-${String(MONTH_NAMES.indexOf(m.month)+1).padStart(2,'0')}-${String(h.date).padStart(2,'0')}`, durationType: 'Single Day' });
          });
        });
        setHolidaysList(flat);
      } else {
        setHolidaysList([]);
        setLegacyHolidays([]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setHolidaysList([]);
        setLegacyHolidays([]);
      } else {
        setErrorMsg(err.message || "Failed to load holidays");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitYear = async () => {
    try {
      setLoading(true);
      await holidayService.createYearConfig(selectedYear);
      setSuccessMsg(`Initialized holiday schedule for ${selectedYear}`);
      fetchYears();
      fetchHolidays(selectedYear);
    } catch (err) {
      setErrorMsg(err.message || "Failed to initialize year");
      setLoading(false);
    }
  };

  // --- DURATION CALCULATION ---
  const calculateDuration = (start, end, type) => {
    if (!start) return 0;
    if (type === "Half Day") return 0.5;
    if (type === "Single Day") return 1;
    const s = new Date(start);
    const e = new Date(end || start);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  const currentDuration = calculateDuration(formData.startDate, formData.endDate, formData.durationType);

  // --- MODAL HANDLERS ---
  const openAddModal = () => {
    setModalMode("add");
    setCurrentHoliday(null);
    const todayStr = new Date().toISOString().split("T")[0];
    setFormData({
      name: "",
      type: "Company",
      description: "",
      durationType: "Single Day",
      startDate: todayStr,
      endDate: todayStr,
      halfDayType: "First Half",
      customTime: { startTime: "09:00", endTime: "13:00" },
      isPaid: true,
      repeatEveryYear: false,
      appliesTo: "Entire Company",
      applicableDepartments: [],
      applicableLocations: [],
      applicableEmployees: []
    });
    setShowModal(true);
  };

  const openEditModal = (holiday) => {
    if (holiday.repeatEveryYear) {
      setSeriesTarget(holiday);
      setSeriesAction("edit");
      setSelectedScope("this_occurrence");
      setShowSeriesModal(true);
      return;
    }
    proceedWithEdit(holiday, "entire_series");
  };

  const proceedWithEdit = (holiday, scope) => {
    setModalMode("edit");
    setCurrentHoliday({ ...holiday, editScope: scope });
    setFormData({
      name: holiday.name || "",
      type: holiday.type || "Company",
      description: holiday.description || "",
      durationType: holiday.durationType || "Single Day",
      startDate: holiday.startDate || new Date().toISOString().split("T")[0],
      endDate: holiday.endDate || holiday.startDate || new Date().toISOString().split("T")[0],
      halfDayType: holiday.halfDayType || "First Half",
      customTime: holiday.customTime || { startTime: "09:00", endTime: "13:00" },
      isPaid: holiday.isPaid !== false,
      repeatEveryYear: holiday.repeatEveryYear || false,
      appliesTo: holiday.appliesTo || "Entire Company",
      applicableDepartments: (holiday.applicableDepartments || []).map(d => d._id || d),
      applicableLocations: (holiday.applicableLocations || []).map(l => l._id || l),
      applicableEmployees: (holiday.applicableEmployees || []).map(e => e._id || e)
    });
    setShowSeriesModal(false);
    setShowModal(true);
  };

  const openArchivePrompt = (holiday) => {
    if (holiday.repeatEveryYear) {
      setSeriesTarget(holiday);
      setSeriesAction("archive");
      setSelectedScope("this_occurrence");
      setShowSeriesModal(true);
      return;
    }
    executeArchive(holiday._id, "entire_series");
  };

  const executeArchive = async (id, scope) => {
    try {
      await holidayService.deleteHoliday(id, scope, selectedYear);
      setSuccessMsg(scope === "this_occurrence" ? "Archived 2026 occurrence of recurring holiday." : "Holiday archived successfully.");
      setShowSeriesModal(false);
      fetchHolidays(selectedYear);
    } catch (err) {
      setErrorMsg(err.message || "Failed to archive holiday");
    }
  };

  const handleRestore = async (id) => {
    try {
      await holidayService.reactivateHoliday(id, selectedYear);
      setSuccessMsg("Holiday restored successfully.");
      fetchHolidays(selectedYear);
    } catch (err) {
      setErrorMsg(err.message || "Failed to restore holiday");
    }
  };

  // --- FORM SUBMISSION ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.name.trim() || !formData.startDate) {
      setErrorMsg("Holiday Name and Start Date are required.");
      return;
    }

    if (formData.durationType === "Multiple Days" && new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrorMsg("End Date cannot be earlier than Start Date.");
      return;
    }

    if (formData.durationType === "Half Day" && formData.halfDayType === "Custom Time") {
      if (formData.customTime.endTime <= formData.customTime.startTime) {
        setErrorMsg("End Time must be later than Start Time for custom half-day window.");
        return;
      }
    }

    try {
      if (modalMode === "add") {
        await holidayService.addHoliday(formData, selectedYear);
        setSuccessMsg("Holiday created successfully!");
      } else {
        const payload = { ...formData, editScope: currentHoliday?.editScope || "entire_series" };
        await holidayService.updateHoliday(currentHoliday._id, payload, selectedYear);
        setSuccessMsg("Holiday updated successfully!");
      }
      setShowModal(false);
      fetchHolidays(selectedYear);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save holiday");
    }
  };

  // --- FILTERING DATA ---
  const getFilteredHolidays = () => {
    return holidaysList.filter(h => {
      if (!showArchived && h.isActive === false) return false;
      if (filterType !== "All" && h.type !== filterType) return false;
      if (filterScope !== "All" && h.appliesTo !== filterScope) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = h.name?.toLowerCase().includes(q);
        const matchDesc = h.description?.toLowerCase().includes(q);
        const matchType = h.type?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchType) return false;
      }
      return true;
    });
  };

  const filteredData = getFilteredHolidays();

  // --- STATS ---
  const activeCount = holidaysList.filter(h => h.isActive !== false).length;
  const nationalCount = holidaysList.filter(h => h.isActive !== false && h.type === "National").length;
  const festivalCount = holidaysList.filter(h => h.isActive !== false && ["Festival", "Regional"].includes(h.type)).length;
  const archivedCount = holidaysList.filter(h => h.isActive === false).length;

  // --- FORMATTERS ---
  const formatDurationDisplay = (h) => {
    if (h.durationType === "Half Day") {
      const hdLabel = h.halfDayType === "Custom Time" ? `${h.customTime?.startTime} - ${h.customTime?.endTime}` : h.halfDayType;
      return `${formatDateShort(h.startDate)} (Half Day - ${hdLabel})`;
    }
    if (h.durationType === "Multiple Days") {
      const dDays = calculateDuration(h.startDate, h.endDate, "Multiple Days");
      return `${formatDateShort(h.startDate)} – ${formatDateShort(h.endDate)} (${dDays} Days)`;
    }
    return formatDateShort(h.startDate);
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const getScopeBadge = (h) => {
    if (h.appliesTo === "Selected Departments") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200"><Briefcase size={12} /> {(h.applicableDepartments || []).length} Depts</span>;
    }
    if (h.appliesTo === "Selected Locations") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold border border-teal-200"><MapPin size={12} /> {(h.applicableLocations || []).length} Sites</span>;
    }
    if (h.appliesTo === "Selected Employees") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200"><User size={12} /> {(h.applicableEmployees || []).length} Emps</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200"><Building2 size={12} /> Entire Company</span>;
  };

  const getTypeStyle = (type) => {
    const found = HOLIDAY_TYPES.find(t => t.value === type);
    return found ? found.color : "bg-gray-100 text-gray-700 border-gray-200";
  };

  // --- CALENDAR VIEW HELPERS ---
  const getCalendarDays = () => {
    const firstDay = new Date(selectedYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(selectedYear, currentMonth, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, dateStr: "" });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const padM = String(currentMonth + 1).padStart(2, '0');
      const padD = String(i).padStart(2, '0');
      days.push({ day: i, isCurrentMonth: true, dateStr: `${selectedYear}-${padM}-${padD}` });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, dateStr: "" });
    }
    return days;
  };

  const getHolidaysOnDate = (dateStr) => {
    if (!dateStr) return [];
    return holidaysList.filter(h => {
      if (h.isActive === false && !showArchived) return false;
      const start = h.startDate;
      const end = h.endDate || h.startDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-slate-700">
      
      {/* 1. HEADER & YEAR SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarIcon className="text-blue-600" size={26} /> Holiday Policy Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise schedule management with multi-day durations, recurrence, and applicability scoping.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedYear(prev => prev - 1)}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="Previous Year"
            >
              <ChevronLeft size={16} />
            </button>
            <select
              id="selectedHolidayYear"
              name="selectedHolidayYear"
              aria-label="Select Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent border-0 font-bold text-slate-800 text-sm focus:ring-0 cursor-pointer py-1 px-2"
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              {!availableYears.includes(selectedYear) && <option value={selectedYear}>{selectedYear}</option>}
            </select>
            <button
              onClick={() => setSelectedYear(prev => prev + 1)}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="Next Year"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => fetchHolidays(selectedYear)}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          {canEdit && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow"
            >
              <Plus size={18} /> Add Holiday
            </button>
          )}
        </div>
      </div>

      {/* ALERT MESSAGES */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="hover:text-red-900"><X size={16} /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-900"><X size={16} /></button>
        </div>
      )}

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard title="Total Active" value={activeCount} icon={CalendarIcon} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="National" value={nationalCount} icon={Info} colorClass="bg-purple-50 text-purple-600" />
        <StatCard title="Festivals / Regional" value={festivalCount} icon={Users} colorClass="bg-amber-50 text-amber-600" />
        <StatCard title="Archived" value={archivedCount} icon={Archive} colorClass="bg-slate-100 text-slate-600" />
      </div>

      {/* 3. FILTERS & VIEW TOGGLE */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="searchHolidays"
              name="searchHolidays"
              aria-label="Search holidays"
              type="text"
              placeholder="Search holiday name, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 hidden sm:inline" />
            <select
              id="filterHolidayType"
              name="filterHolidayType"
              aria-label="Filter by Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Types</option>
              {HOLIDAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Scope Filter */}
          <select
            id="filterHolidayScope"
            name="filterHolidayScope"
            aria-label="Filter by Scope"
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Scopes</option>
            <option value="Entire Company">Entire Company</option>
            <option value="Selected Departments">Selected Departments</option>
            <option value="Selected Locations">Selected Locations</option>
            <option value="Selected Employees">Selected Employees</option>
          </select>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Show Archived Toggle */}
          <label htmlFor="showArchivedHolidays" className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-600">
            <input
              id="showArchivedHolidays"
              name="showArchivedHolidays"
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            Show Archived
          </label>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListIcon size={14} /> List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid size={14} /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <RefreshCw className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
          <p className="text-slate-500 font-medium">Loading holiday schedules for {selectedYear}...</p>
        </div>
      ) : holidaysList.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <CalendarIcon size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Holidays Found for {selectedYear}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              There are no holiday records configured for this year yet. You can initialize the default schedule or add holidays manually.
            </p>
          </div>
          {canEdit && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleInitYear}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
              >
                Initialize {selectedYear} Schedule
              </button>
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
              >
                Add Custom Holiday
              </button>
            </div>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Holiday</th>
                  <th className="py-4 px-6">Duration & Date</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Applies To</th>
                  <th className="py-4 px-6 text-center">Paid</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  {canEdit && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="py-12 text-center text-slate-400 font-medium">
                      No holidays match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map(h => {
                    const isArchived = h.isActive === false;
                    return (
                      <tr key={h._id} className={`hover:bg-slate-50/75 transition-colors ${isArchived ? "bg-slate-50/50 opacity-60" : ""}`}>
                        {/* Name & Desc */}
                        <td className="py-4 px-6 cursor-pointer group" onClick={() => setSummaryHoliday(h)}>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-2 transition-colors">
                            <span>{h.name}</span>
                            {h.repeatEveryYear && (
                              <span title="Repeats Every Year" className="text-slate-400 bg-slate-100 p-1 rounded-md">
                                <Repeat size={12} />
                              </span>
                            )}
                          </div>
                          {h.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{h.description}</p>}
                        </td>

                        {/* Duration & Date */}
                        <td className="py-4 px-6 font-medium text-slate-700">
                          {formatDurationDisplay(h)}
                        </td>

                        {/* Type Badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getTypeStyle(h.type)}`}>
                            {h.type || "Company"}
                          </span>
                        </td>

                        {/* Applies To */}
                        <td className="py-4 px-6">
                          {getScopeBadge(h)}
                        </td>

                        {/* Paid */}
                        <td className="py-4 px-6 text-center">
                          {h.isPaid !== false ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600" title="Paid Holiday">
                              <CheckCircle size={16} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400" title="Unpaid Holiday">
                              <X size={16} />
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 text-center">
                          {isArchived ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        {canEdit && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isArchived ? (
                                <>
                                  <button
                                    onClick={() => openEditModal(h)}
                                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Holiday"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => openArchivePrompt(h)}
                                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Archive Holiday"
                                  >
                                    <Archive size={16} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRestore(h._id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
                                  title="Restore Holiday"
                                >
                                  <RotateCcw size={14} /> Restore
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{MONTH_NAMES[currentMonth]} {selectedYear}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}
                className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date().getMonth())}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors text-slate-700"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}
                className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">
                {day}
              </div>
            ))}
            {getCalendarDays().map((d, idx) => {
              const holsOnDay = d.isCurrentMonth ? getHolidaysOnDate(d.dateStr) : [];
              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 bg-white transition-colors flex flex-col justify-between ${
                    !d.isCurrentMonth ? "bg-slate-50/50 text-slate-400" : "text-slate-800"
                  } ${d.dateStr === new Date().toISOString().split("T")[0] ? "ring-2 ring-inset ring-blue-500 bg-blue-50/10" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      d.dateStr === new Date().toISOString().split("T")[0] ? "bg-blue-600 text-white" : ""
                    }`}>
                      {d.day}
                    </span>
                    {holsOnDay.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {holsOnDay.map(h => (
                      <div
                        key={h._id}
                        onClick={() => canEdit ? openEditModal(h) : setSummaryHoliday(h)}
                        className={`p-1.5 rounded-lg text-xs font-semibold truncate cursor-pointer transition-transform hover:scale-[1.02] border ${getTypeStyle(h.type)}`}
                        title={`${h.name} (${h.type}) - Click for summary`}
                      >
                        {h.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CalendarIcon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {modalMode === "add" ? "Configure New Holiday" : "Edit Holiday Schedule"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* SECTION 1: BASIC INFO */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="holidayNameInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Holiday Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="holidayNameInput"
                      name="holidayNameInput"
                      type="text"
                      required
                      placeholder="e.g. Independence Day, Diwali"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label htmlFor="holidayTypeSelect" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Holiday Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="holidayTypeSelect"
                      name="holidayTypeSelect"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                    >
                      {HOLIDAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="holidayDescriptionTextarea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description / Policy Note
                  </label>
                  <textarea
                    id="holidayDescriptionTextarea"
                    name="holidayDescriptionTextarea"
                    rows={2}
                    placeholder="Optional details regarding office closures or celebrations..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* SECTION 2: DURATION & DATES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Holiday Duration</h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Duration: {currentDuration} {currentDuration === 1 ? "Day" : "Days"}
                  </span>
                </div>

                {/* Duration Type Radios */}
                <div className="grid grid-cols-3 gap-3">
                  {["Single Day", "Multiple Days", "Half Day"].map(dtype => (
                    <label
                      key={dtype}
                      onClick={() => setFormData({ ...formData, durationType: dtype, endDate: dtype === "Multiple Days" ? formData.endDate : formData.startDate })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                        formData.durationType === dtype
                          ? "bg-blue-50/75 border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        id={`durationType_${dtype.replace(/\s+/g, '_')}`}
                        type="radio"
                        name="durationType"
                        checked={formData.durationType === dtype}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      <span>{dtype}</span>
                    </label>
                  ))}
                </div>

                {/* Date Inputs depending on type */}
                {formData.durationType === "Single Day" && (
                  <div>
                    <label htmlFor="singleDayDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                    <input
                      id="singleDayDate"
                      name="singleDayDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}

                {formData.durationType === "Multiple Days" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="multiDayStartDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                      <input
                        id="multiDayStartDate"
                        name="multiDayStartDate"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="multiDayEndDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                      <input
                        id="multiDayEndDate"
                        name="multiDayEndDate"
                        type="date"
                        required
                        min={formData.startDate}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                )}

                {formData.durationType === "Half Day" && (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label htmlFor="halfDayDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                      <input
                        id="halfDayDate"
                        name="halfDayDate"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Half Day Window</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["First Half", "Second Half", "Custom Time"].map(hType => (
                          <label
                            key={hType}
                            onClick={() => setFormData({ ...formData, halfDayType: hType })}
                            className={`flex items-center justify-center p-2 rounded-lg border text-xs font-bold cursor-pointer ${
                              formData.halfDayType === hType ? "bg-white border-blue-600 text-blue-700 shadow-sm" : "bg-transparent border-slate-200 text-slate-600"
                            }`}
                          >
                            <span>{hType}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {formData.halfDayType === "Custom Time" && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label htmlFor="customStartTime" className="block text-xs font-bold text-slate-600 mb-1">Start Time</label>
                          <input
                            id="customStartTime"
                            name="customStartTime"
                            type="time"
                            value={formData.customTime?.startTime || "09:00"}
                            onChange={(e) => setFormData({ ...formData, customTime: { ...formData.customTime, startTime: e.target.value } })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label htmlFor="customEndTime" className="block text-xs font-bold text-slate-600 mb-1">End Time</label>
                          <input
                            id="customEndTime"
                            name="customEndTime"
                            type="time"
                            value={formData.customTime?.endTime || "13:00"}
                            onChange={(e) => setFormData({ ...formData, customTime: { ...formData.customTime, endTime: e.target.value } })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* SECTION 3: APPLICABILITY & RECURRENCE */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Applicability & Policies</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Paid Status */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <label htmlFor="holidayIsPaid" className="flex items-center gap-2.5 cursor-pointer">
                      <DollarSign className="text-emerald-600" size={20} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Paid Holiday</p>
                        <p className="text-xs text-slate-500">No salary deduction</p>
                      </div>
                    </label>
                    <input
                      id="holidayIsPaid"
                      name="holidayIsPaid"
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-5 h-5 cursor-pointer"
                    />
                  </div>

                  {/* Recurrence */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <label htmlFor="holidayRepeatEveryYear" className="flex items-center gap-2.5 cursor-pointer">
                      <Repeat className="text-purple-600" size={20} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Repeat Every Year</p>
                        <p className="text-xs text-slate-500">Auto-applies annually</p>
                      </div>
                    </label>
                    <input
                      id="holidayRepeatEveryYear"
                      name="holidayRepeatEveryYear"
                      type="checkbox"
                      checked={formData.repeatEveryYear}
                      onChange={(e) => setFormData({ ...formData, repeatEveryYear: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Applies To Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Scope</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Entire Company", "Selected Departments", "Selected Locations", "Selected Employees"].map(scope => (
                      <label
                        key={scope}
                        onClick={() => setFormData({ ...formData, appliesTo: scope })}
                        className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold cursor-pointer text-center transition-all ${
                          formData.appliesTo === scope ? "bg-slate-900 border-slate-900 text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>{scope.replace("Selected ", "")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scope Selection Checkboxes */}
                {formData.appliesTo === "Selected Departments" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 max-h-40 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Select Departments:</p>
                    {departments.map(d => (
                      <label key={d._id} htmlFor={`deptCheckbox_${d._id}`} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                          id={`deptCheckbox_${d._id}`}
                          name={`deptCheckbox_${d._id}`}
                          type="checkbox"
                          checked={formData.applicableDepartments.includes(d._id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.applicableDepartments, d._id]
                              : formData.applicableDepartments.filter(id => id !== d._id);
                            setFormData({ ...formData, applicableDepartments: updated });
                          }}
                          className="rounded border-slate-300 text-blue-600 w-4 h-4"
                        />
                        <span>{d.departmentName}</span>
                      </label>
                    ))}
                  </div>
                )}

                {formData.appliesTo === "Selected Locations" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 max-h-40 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Select Sites / Locations:</p>
                    {locations.map(l => (
                      <label key={l._id} htmlFor={`locCheckbox_${l._id}`} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                          id={`locCheckbox_${l._id}`}
                          name={`locCheckbox_${l._id}`}
                          type="checkbox"
                          checked={formData.applicableLocations.includes(l._id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.applicableLocations, l._id]
                              : formData.applicableLocations.filter(id => id !== l._id);
                            setFormData({ ...formData, applicableLocations: updated });
                          }}
                          className="rounded border-slate-300 text-blue-600 w-4 h-4"
                        />
                        <span>{l.siteName}</span>
                      </label>
                    ))}
                  </div>
                )}

                {formData.appliesTo === "Selected Employees" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 max-h-40 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Select Employees:</p>
                    {employees.map(emp => (
                      <label key={emp._id} htmlFor={`empCheckbox_${emp._id}`} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                          id={`empCheckbox_${emp._id}`}
                          name={`empCheckbox_${emp._id}`}
                          type="checkbox"
                          checked={formData.applicableEmployees.includes(emp._id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.applicableEmployees, emp._id]
                              : formData.applicableEmployees.filter(id => id !== emp._id);
                            setFormData({ ...formData, applicableEmployees: updated });
                          }}
                          className="rounded border-slate-300 text-blue-600 w-4 h-4"
                        />
                        <span>{emp.fullName || `${emp.firstName} ${emp.lastName}`} ({emp.employeeId})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. LIVE PREVIEW CARD */}
              <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border border-blue-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black tracking-widest uppercase text-blue-600">Live Policy Preview</span>
                  <span className="text-xs font-bold text-slate-600">
                    {formData.repeatEveryYear ? "🔁 Repeats Annually" : "One-Time Schedule"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h5 className="text-base font-bold text-slate-900">{formData.name || "Holiday Name"}</h5>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getTypeStyle(formData.type)}`}>
                    {formData.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={14} className="text-blue-500" />
                    {formData.durationType === "Half Day"
                      ? `${formatDateShort(formData.startDate)} (${formData.halfDayType === "Custom Time" ? `${formData.customTime.startTime}-${formData.customTime.endTime}` : formData.halfDayType})`
                      : formData.durationType === "Multiple Days"
                      ? `${formatDateShort(formData.startDate)} – ${formatDateShort(formData.endDate)}`
                      : formatDateShort(formData.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-indigo-500" />
                    {currentDuration} {currentDuration === 1 ? "Day" : "Days"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 size={14} className="text-teal-500" />
                    {formData.appliesTo}
                  </span>
                  <span className={`flex items-center gap-1 ${formData.isPaid ? "text-emerald-700" : "text-slate-500"}`}>
                    <DollarSign size={14} />
                    {formData.isPaid ? "Paid Holiday" : "Unpaid"}
                  </span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
                >
                  {modalMode === "add" ? "Create Holiday Policy" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SERIES VS OCCURRENCE PROMPT MODAL */}
      {showSeriesModal && seriesTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Repeat size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {seriesAction === "edit" ? "Modify Recurring Series" : "Archive Recurring Holiday"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  "{seriesTarget.name}" is configured to repeat every year.
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Apply this action to:</p>
              <label
                htmlFor="seriesScope_this_occurrence"
                onClick={() => setSelectedScope("this_occurrence")}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedScope === "this_occurrence"
                    ? "bg-white border-blue-600 shadow-sm ring-1 ring-blue-600"
                    : "bg-transparent border-slate-200 hover:bg-slate-100/60"
                }`}
              >
                <input
                  id="seriesScope_this_occurrence"
                  type="radio"
                  name="seriesScope"
                  checked={selectedScope === "this_occurrence"}
                  onChange={() => {}}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">Only this year ({selectedYear})</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {seriesAction === "edit"
                      ? "Creates an override for this occurrence without affecting future years."
                      : "Removes only the 2026 schedule; future years will continue repeating."}
                  </p>
                </div>
              </label>

              <label
                htmlFor="seriesScope_entire_series"
                onClick={() => setSelectedScope("entire_series")}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedScope === "entire_series"
                    ? "bg-white border-blue-600 shadow-sm ring-1 ring-blue-600"
                    : "bg-transparent border-slate-200 hover:bg-slate-100/60"
                }`}
              >
                <input
                  id="seriesScope_entire_series"
                  type="radio"
                  name="seriesScope"
                  checked={selectedScope === "entire_series"}
                  onChange={() => {}}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">Entire recurring series</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {seriesAction === "edit"
                      ? "Applies policy updates across all future occurrences."
                      : "Archives the entire recurring rule; it will no longer generate annually."}
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSeriesModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (seriesAction === "edit") {
                    proceedWithEdit(seriesTarget, selectedScope);
                  } else {
                    executeArchive(seriesTarget._id, selectedScope);
                  }
                }}
                className={`px-5 py-2 text-white rounded-xl text-sm font-bold transition-all shadow-sm ${
                  seriesAction === "edit" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {seriesAction === "edit" ? "Continue to Edit" : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. HOLIDAY SUMMARY MODAL (Employee / Quick Preview) */}
      {summaryHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <CalendarIcon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{summaryHoliday.name}</h3>
                  <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">{summaryHoliday.type || "Company"} Holiday</span>
                </div>
              </div>
              <button
                onClick={() => setSummaryHoliday(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-sm text-slate-700">
              {/* Date & Duration */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <Clock className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="font-bold text-slate-900">{formatDurationDisplay(summaryHoliday)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {summaryHoliday.durationType === "Multiple Days"
                      ? `${summaryHoliday.startDate} to ${summaryHoliday.endDate}`
                      : summaryHoliday.startDate}
                  </div>
                </div>
              </div>

              {/* Scope & Paid Status Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Applies To</span>
                  <div className="mt-1 font-bold text-slate-800 flex items-center gap-1.5">
                    {getScopeBadge(summaryHoliday)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Paid Status</span>
                  <div className="mt-1 font-bold flex items-center gap-1.5">
                    {summaryHoliday.isPaid !== false ? (
                      <span className="text-emerald-700 flex items-center gap-1"><CheckCircle size={14} className="text-emerald-600" /> Paid Holiday</span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1"><AlertCircle size={14} className="text-amber-600" /> Unpaid / Optional</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description / Message Box */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  <Megaphone size={14} className="text-indigo-600" />
                  <span>Holiday Message</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {summaryHoliday.description || `The office will remain closed on the occasion of ${summaryHoliday.name}. Wishing all employees a wonderful and restful holiday!`}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSummaryHoliday(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
