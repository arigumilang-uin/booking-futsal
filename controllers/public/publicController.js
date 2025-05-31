const { getAvailableFields, getFieldById } = require('../../models/fieldModel');
const { getFieldAvailability } = require('../../models/bookingModel');

const getPublicFields = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, location } = req.query;
    
    let fields = await getAvailableFields();
    
    if (search) {
      fields = fields.filter(field =>
        field.name.toLowerCase().includes(search.toLowerCase()) ||
        field.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      fields = fields.filter(field => field.type === type);
    }

    if (location) {
      fields = fields.filter(field =>
        field.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFields = fields.slice(startIndex, endIndex);

    const publicFields = paginatedFields.map(field => ({
      id: field.id,
      uuid: field.uuid,
      name: field.name,
      type: field.type,
      description: field.description,
      facilities: field.facilities,
      capacity: field.capacity,
      location: field.location,
      address: field.address,
      coordinates: field.coordinates,
      price: field.price,
      price_weekend: field.price_weekend,
      price_member: field.price_member,
      operating_hours: field.operating_hours,
      operating_days: field.operating_days,
      image_url: field.image_url,
      gallery: field.gallery,
      rating: field.rating,
      total_reviews: field.total_reviews
    }));
    
    res.json({
      success: true,
      data: publicFields,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: fields.length,
        total_pages: Math.ceil(fields.length / limit)
      }
    });

  } catch (error) {
    console.error('Get public fields error:', error);
    res.status(500).json({
      error: 'Failed to get fields'
    });
  }
};

const getPublicFieldDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const field = await getFieldById(id);
    if (!field) {
      return res.status(404).json({
        error: 'Field not found'
      });
    }

    if (field.status !== 'active') {
      return res.status(404).json({
        error: 'Field not available'
      });
    }

    const publicField = {
      id: field.id,
      uuid: field.uuid,
      name: field.name,
      type: field.type,
      description: field.description,
      facilities: field.facilities,
      capacity: field.capacity,
      location: field.location,
      address: field.address,
      coordinates: field.coordinates,
      price: field.price,
      price_weekend: field.price_weekend,
      price_member: field.price_member,
      operating_hours: field.operating_hours,
      operating_days: field.operating_days,
      image_url: field.image_url,
      gallery: field.gallery,
      rating: field.rating,
      total_reviews: field.total_reviews
    };
    
    res.json({
      success: true,
      data: publicField
    });

  } catch (error) {
    console.error('Get public field detail error:', error);
    res.status(500).json({
      error: 'Failed to get field detail'
    });
  }
};

const getPublicFieldAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        error: 'Date parameter is required'
      });
    }

    const field = await getFieldById(id);
    if (!field || field.status !== 'active') {
      return res.status(404).json({
        error: 'Field not found or not available'
      });
    }
    
    const availability = await getFieldAvailability(id, date);
    
    res.json({
      success: true,
      data: {
        field_id: id,
        field_name: field.name,
        date: date,
        operating_hours: field.operating_hours,
        availability: availability
      }
    });

  } catch (error) {
    console.error('Get public field availability error:', error);
    res.status(500).json({
      error: 'Failed to get field availability'
    });
  }
};

const getFieldTypes = async (req, res) => {
  try {
    const fields = await getAvailableFields();
    const types = [...new Set(fields.map(field => field.type))];
    
    res.json({
      success: true,
      data: types
    });

  } catch (error) {
    console.error('Get field types error:', error);
    res.status(500).json({
      error: 'Failed to get field types'
    });
  }
};

const getFieldLocations = async (req, res) => {
  try {
    const fields = await getAvailableFields();
    const locations = [...new Set(fields.map(field => field.location))];
    
    res.json({
      success: true,
      data: locations
    });

  } catch (error) {
    console.error('Get field locations error:', error);
    res.status(500).json({
      error: 'Failed to get field locations'
    });
  }
};

const getSystemInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        app_name: 'Booking Futsal System',
        version: '2.0.0',
        api_version: 'v1',
        enhanced_role_system: true,
        supported_roles: [
          'pengunjung',
          'penyewa', 
          'staff_kasir',
          'operator_lapangan',
          'manajer_futsal',
          'supervisor_sistem'
        ],
        features: [
          'role_based_access',
          'auto_generation',
          'conflict_detection',
          'payment_gateway_ready',
          'audit_trail',
          'jsonb_support'
        ]
      }
    });

  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      error: 'Failed to get system info'
    });
  }
};

module.exports = {
  getPublicFields,
  getPublicFieldDetail,
  getPublicFieldAvailability,
  getFieldTypes,
  getFieldLocations,
  getSystemInfo
};
