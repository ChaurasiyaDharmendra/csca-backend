import Resource from '../models/Resource.js';

// @desc    Get all active resources
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res) => {
    try {
        const resources = await Resource.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Error fetching resources", error: error.message });
    }
};

// @desc    Get all resources (Admin only)
// @route   GET /api/resources/admin
// @access  Private/Admin
export const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.findAll({ order: [['createdAt', 'DESC']] });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Error fetching resources", error: error.message });
    }
};

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private/Admin
export const createResource = async (req, res) => {
    try {
        const savedResource = await Resource.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.status(201).json(savedResource);
    } catch (error) {
        res.status(500).json({ message: "Error creating resource", error: error.message });
    }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
export const updateResource = async (req, res) => {
    try {
        await Resource.update(req.body, { where: { id: req.params.id } });
        const updatedResource = await Resource.findByPk(req.params.id);

        if (!updatedResource) return res.status(404).json({ message: "Resource not found" });
        res.json(updatedResource);
    } catch (error) {
        res.status(500).json({ message: "Error updating resource", error: error.message });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
export const deleteResource = async (req, res) => {
    try {
        const deleted = await Resource.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: "Resource not found" });
        res.json({ message: "Resource deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting resource", error: error.message });
    }
};
