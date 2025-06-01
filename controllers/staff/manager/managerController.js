const {
  getAllFields,
  createField,
  updateField,
  deleteField
} = require('../../../models/business/fieldModel');
const {
  getDashboardOverview
} = require('../../shared/analyticsController');

const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const dashboardData = await getDashboardOverview('manajer_futsal', managerId);

    res.json({
      success: true,
      data: {
        manager_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          department: req.rawUser.department,
          role: 'Manajer Futsal'
        },
        ...dashboardData
      }
    });

  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil dashboard manajer'
    });
  }
};

// User management functions moved to admin/roleManagementController
// Manager should use role management endpoints for user operations

const getAllFieldsForManager = async (req, res) => {
  try {
    const fields = await getAllFields();
    
    res.json({
      success: true,
      data: fields
    });

  } catch (error) {
    console.error('Get all fields for manager error:', error);
    res.status(500).json({ 
      error: 'Failed to get fields',
      code: 'FIELDS_FETCH_FAILED'
    });
  }
};

const createFieldByManager = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const fieldData = {
      ...req.body,
      created_by: managerId
    };
    
    const newField = await createField(fieldData);
    
    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      data: newField
    });

  } catch (error) {
    console.error('Create field by manager error:', error);
    res.status(500).json({ 
      error: 'Failed to create field',
      code: 'FIELD_CREATE_FAILED'
    });
  }
};

const updateFieldByManager = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: managerId
    };
    
    const updatedField = await updateField(id, updateData);
    if (!updatedField) {
      return res.status(404).json({ 
        error: 'Field not found',
        code: 'FIELD_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Field updated successfully',
      data: updatedField
    });

  } catch (error) {
    console.error('Update field by manager error:', error);
    res.status(500).json({ 
      error: 'Failed to update field',
      code: 'FIELD_UPDATE_FAILED'
    });
  }
};

// Analytics function moved to shared/analyticsController
// Use getBusinessAnalytics from shared controller

module.exports = {
  getManagerDashboard,
  getAllFieldsForManager,
  createFieldByManager,
  updateFieldByManager
};
