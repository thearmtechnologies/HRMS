const HolidayConfig = require("../models/HolidaysStructure");

const getHolidaysByYear = async (req, res) => {
    const { year } = req.params;

    try {
        const config = await HolidayConfig.findOne({ year: parseInt(year) });

        if (!config)
            return res.status(404).json({ message: "Holiday config not found" });

        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const setHolidayConfig = async (req, res) => {
    const { year, holidays } = req.body;

    if (!year || !Array.isArray(holidays)) {
        return res.status(400).json({ message: "Invalid data" });
    }

    try {
        const existing = await HolidayConfig.findOne({ year });
        if (existing) {
            return res.status(409).json({ message: "Holiday config for this year already exists" });
        }

        const created = await HolidayConfig.create({
            year,
            holidays // now includes "dates: []"
        });

        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


const updateHolidayForMonth = async (req, res) => {
    const { year } = req.params;
    const { month, dates } = req.body;

    if (!month || !Array.isArray(dates)) {
        return res.status(400).json({ message: "Invalid data" });
    }

    try {
        const config = await HolidayConfig.findOne({ year: parseInt(year) });

        if (!config)
            return res.status(404).json({ message: "Holiday config not found" });

        // Find or create month entry
        const monthEntry = config.holidays.find(h => h.month === month);

        if (monthEntry) {
            monthEntry.dates = dates; // replace dates
        } else {
            config.holidays.push({ month, dates });
        }

        await config.save();
        res.json(config);

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


module.exports = { getHolidaysByYear, setHolidayConfig, updateHolidayForMonth }