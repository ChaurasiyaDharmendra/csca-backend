import IndustrySector from '../models/IndustrySector.js';

// Get all active industry sectors
export const getIndustrySectors = async (req, res) => {
    try {
        const sectors = await IndustrySector.findAll({ where: { isActive: true } });
        res.json(sectors);
    } catch (error) {
        console.error("Error fetching industry sectors:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Create a new industry sector
export const createIndustrySector = async (req, res) => {
    try {
        const { id, title, tagline, desc, icon, color, isActive } = req.body;
        const existing = await IndustrySector.findByPk(id);
        if (existing) return res.status(400).json({ message: "Sector with this ID already exists" });

        const newSector = await IndustrySector.create({ id, title, tagline, desc, icon, color, isActive });
        res.status(201).json(newSector);
    } catch (error) {
        console.error("Error creating industry sector:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Update an existing industry sector
export const updateIndustrySector = async (req, res) => {
    try {
        await IndustrySector.update(req.body, { where: { id: req.params.id } });
        const sector = await IndustrySector.findByPk(req.params.id);
        if (!sector) return res.status(404).json({ message: "Industry sector not found" });
        res.json(sector);
    } catch (error) {
        console.error("Error updating industry sector:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Delete an industry sector
export const deleteIndustrySector = async (req, res) => {
    try {
        const deleted = await IndustrySector.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: "Industry sector not found" });
        res.json({ message: "Industry sector removed" });
    } catch (error) {
        console.error("Error deleting industry sector:", error);
        res.status(500).json({ message: "Server error" });
    }
};
