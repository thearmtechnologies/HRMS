const Site = require("../models/Site");

const createSite = async (req, res) => {
    try {
        const site = new Site(req.body);
        await site.save();
        res.status(201).json(site);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getSites = async (req, res) => {
    try {
        const sites = await Site.find();
        res.json(sites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSite = async (req, res) => {
    try {
        const site = await Site.findByIdAndDelete(req.params.id);
        if (!site) {
            return res.status(404).json({ error: "Site not found" });
        }
        res.json({ message: "Site deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSite = async (req, res) => {
    try {
        const site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!site) {
            return res.status(404).json({ error: "Site not found" });
        }
        res.json(site);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createSite, getSites, deleteSite, updateSite }