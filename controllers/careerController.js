import Career from '../models/Career.js';

// Get all active careers
export const getCareers = async (req, res) => {
    try {
        const careers = await Career.findAll({ where: { isActive: true } });
        res.json(careers);
    } catch (error) {
        console.error("Error fetching careers:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Create a new career
export const createCareer = async (req, res) => {
    try {
        const { title, description, icon, categories, isActive } = req.body;
        const newCareer = await Career.create({ title, description, icon, categories, isActive });
        res.status(201).json(newCareer);
    } catch (error) {
        console.error("Error creating career:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Update an existing career
export const updateCareer = async (req, res) => {
    try {
        await Career.update(req.body, { where: { id: req.params.id } });
        const career = await Career.findByPk(req.params.id);
        if (!career) return res.status(404).json({ message: "Career not found" });
        res.json(career);
    } catch (error) {
        console.error("Error updating career:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Delete a career
export const deleteCareer = async (req, res) => {
    try {
        const deleted = await Career.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: "Career not found" });
        res.json({ message: "Career removed" });
    } catch (error) {
        console.error("Error deleting career:", error);
        res.status(500).json({ message: "Server error" });
    }
};
