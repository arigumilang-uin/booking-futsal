const pool = require('../../config/db');

const getAllFields = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT f.id, f.uuid, f.name, f.type, f.description, f.facilities, f.capacity,
           f.location, f.address, f.coordinates, f.price, f.price_weekend, f.price_member,
           f.operating_hours, f.operating_days, f.image_url, f.gallery, f.status,
           f.rating, f.total_reviews, f.booking_count, f.revenue_total, f.last_booking_date,
           f.assigned_operator, f.created_at,
           u.name as operator_name, u.employee_id as operator_employee_id
    FROM fields f
    LEFT JOIN users u ON f.assigned_operator = u.id
    WHERE f.status != 'deleted'
    ORDER BY f.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const getFieldById = async (id) => {
  const query = `
    SELECT f.id, f.uuid, f.name, f.type, f.description, f.facilities, f.capacity,
           f.location, f.address, f.coordinates, f.price, f.price_weekend, f.price_member,
           f.operating_hours, f.operating_days, f.image_url, f.gallery, f.status,
           f.rating, f.total_reviews, f.booking_count, f.revenue_total, f.last_booking_date,
           f.assigned_operator, f.created_at, f.updated_at,
           u.name as operator_name, u.employee_id as operator_employee_id
    FROM fields f
    LEFT JOIN users u ON f.assigned_operator = u.id
    WHERE f.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createField = async ({
  name,
  type = 'futsal',
  price,
  image_url,
  status = 'active',
  description = '',
  facilities = [],
  capacity = 22,
  location = '',
  address = '',
  coordinates = null,
  price_weekend = null,
  price_member = null,
  operating_hours = { start: '09:00', end: '24:00' },
  operating_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  gallery = [],
  assigned_operator = null,
  created_by = null
}) => {
  const query = `
    INSERT INTO fields (
      name, type, description, facilities, capacity, location, address, coordinates,
      price, price_weekend, price_member, operating_hours, operating_days,
      image_url, gallery, status, assigned_operator, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id, uuid, name, type, description, facilities, capacity, location, address,
              coordinates, price, price_weekend, price_member, operating_hours, operating_days,
              image_url, gallery, status, rating, total_reviews, assigned_operator, created_at
  `;
  const values = [
    name, type, description, JSON.stringify(facilities), capacity, location, address,
    coordinates ? JSON.stringify(coordinates) : null, price, price_weekend, price_member,
    JSON.stringify(operating_hours), JSON.stringify(operating_days), image_url,
    JSON.stringify(gallery), status, assigned_operator, created_by
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateField = async (id, fieldData) => {
  const {
    name, type, price, image_url, status, description, facilities, capacity,
    location, address, coordinates, price_weekend, price_member, operating_hours,
    operating_days, gallery, assigned_operator
  } = fieldData;

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (type !== undefined) {
    updateFields.push(`type = $${paramCount++}`);
    values.push(type);
  }
  if (description !== undefined) {
    updateFields.push(`description = $${paramCount++}`);
    values.push(description);
  }
  if (facilities !== undefined) {
    updateFields.push(`facilities = $${paramCount++}`);
    values.push(JSON.stringify(facilities));
  }
  if (capacity !== undefined) {
    updateFields.push(`capacity = $${paramCount++}`);
    values.push(capacity);
  }
  if (location !== undefined) {
    updateFields.push(`location = $${paramCount++}`);
    values.push(location);
  }
  if (address !== undefined) {
    updateFields.push(`address = $${paramCount++}`);
    values.push(address);
  }
  if (coordinates !== undefined) {
    updateFields.push(`coordinates = $${paramCount++}`);
    values.push(coordinates ? JSON.stringify(coordinates) : null);
  }
  if (price !== undefined) {
    updateFields.push(`price = $${paramCount++}`);
    values.push(price);
  }
  if (price_weekend !== undefined) {
    updateFields.push(`price_weekend = $${paramCount++}`);
    values.push(price_weekend);
  }
  if (price_member !== undefined) {
    updateFields.push(`price_member = $${paramCount++}`);
    values.push(price_member);
  }
  if (operating_hours !== undefined) {
    updateFields.push(`operating_hours = $${paramCount++}`);
    values.push(JSON.stringify(operating_hours));
  }
  if (operating_days !== undefined) {
    updateFields.push(`operating_days = $${paramCount++}`);
    values.push(JSON.stringify(operating_days));
  }
  if (image_url !== undefined) {
    updateFields.push(`image_url = $${paramCount++}`);
    values.push(image_url);
  }
  if (gallery !== undefined) {
    updateFields.push(`gallery = $${paramCount++}`);
    values.push(JSON.stringify(gallery));
  }
  if (status !== undefined) {
    updateFields.push(`status = $${paramCount++}`);
    values.push(status);
  }
  if (assigned_operator !== undefined) {
    updateFields.push(`assigned_operator = $${paramCount++}`);
    values.push(assigned_operator);
  }

  // Always update updated_at
  updateFields.push(`updated_at = NOW()`);

  // Add id parameter
  values.push(id);

  const query = `
    UPDATE fields
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, uuid, name, type, description, facilities, capacity, location, address,
              coordinates, price, price_weekend, price_member, operating_hours, operating_days,
              image_url, gallery, status, rating, total_reviews, assigned_operator,
              created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteField = async (id) => {
  const query = 'UPDATE fields SET status = $1, updated_at = NOW() WHERE id = $2';
  await pool.query(query, ['deleted', id]);
};

const searchFieldsByName = async (keyword) => {
  const query = `
    SELECT f.id, f.uuid, f.name, f.type, f.description, f.facilities, f.capacity,
           f.location, f.address, f.coordinates, f.price, f.price_weekend, f.price_member,
           f.operating_hours, f.operating_days, f.image_url, f.gallery, f.status,
           f.rating, f.total_reviews, f.assigned_operator, f.created_at,
           u.name as operator_name, u.employee_id as operator_employee_id
    FROM fields f
    LEFT JOIN users u ON f.assigned_operator = u.id
    WHERE f.name ILIKE $1 AND f.status != 'deleted'
    ORDER BY f.created_at DESC
  `;
  const result = await pool.query(query, [`%${keyword}%`]);
  return result.rows;
};

const getFieldsByStatus = async (status) => {
  const query = `
    SELECT f.id, f.uuid, f.name, f.type, f.description, f.facilities, f.capacity,
           f.location, f.address, f.coordinates, f.price, f.price_weekend, f.price_member,
           f.operating_hours, f.operating_days, f.image_url, f.gallery, f.status,
           f.rating, f.total_reviews, f.assigned_operator, f.created_at,
           u.name as operator_name, u.employee_id as operator_employee_id
    FROM fields f
    LEFT JOIN users u ON f.assigned_operator = u.id
    WHERE f.status = $1
    ORDER BY f.created_at DESC
  `;
  const result = await pool.query(query, [status]);
  return result.rows;
};

const getFieldsByOperator = async (operatorId) => {
  const query = `
    SELECT f.id, f.uuid, f.name, f.type, f.description, f.facilities, f.capacity,
           f.location, f.address, f.coordinates, f.price, f.price_weekend, f.price_member,
           f.operating_hours, f.operating_days, f.image_url, f.gallery, f.status,
           f.rating, f.total_reviews, f.assigned_operator, f.created_at,
           u.name as operator_name, u.employee_id as operator_employee_id
    FROM fields f
    LEFT JOIN users u ON f.assigned_operator = u.id
    WHERE f.assigned_operator = $1 AND f.status != 'deleted'
    ORDER BY f.created_at DESC
  `;
  const result = await pool.query(query, [operatorId]);
  return result.rows;
};

const getAvailableFields = async () => {
  const query = `
    SELECT f.id, f.uuid, f.name, f.type, f.description, f.facilities, f.capacity,
           f.location, f.address, f.coordinates, f.price, f.price_weekend, f.price_member,
           f.operating_hours, f.operating_days, f.image_url, f.gallery, f.status,
           f.rating, f.total_reviews, f.assigned_operator, f.created_at,
           u.name as operator_name, u.employee_id as operator_employee_id
    FROM fields f
    LEFT JOIN users u ON f.assigned_operator = u.id
    WHERE f.status = 'active'
    ORDER BY f.rating DESC, f.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const updateFieldRating = async (fieldId, newRating, totalReviews) => {
  const query = `
    UPDATE fields
    SET rating = $1, total_reviews = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, rating, total_reviews
  `;
  const result = await pool.query(query, [newRating, totalReviews, fieldId]);
  return result.rows[0];
};

const getFieldStatistics = async () => {
  const query = `
    SELECT
      COUNT(*) as total_fields,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_fields,
      COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_fields,
      COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_fields,
      AVG(rating) as average_rating,
      SUM(total_reviews) as total_reviews,
      COUNT(CASE WHEN assigned_operator IS NOT NULL THEN 1 END) as assigned_fields
    FROM fields
    WHERE status != 'deleted'
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

const getFieldAvailability = async (fieldId, date) => {
  try {
    const field = await getFieldById(fieldId);
    if (!field || field.status !== 'active') {
      throw new Error('Field not available');
    }

    const operatingHours = field.operating_hours;
    const startHour = operatingHours.start || '09:00';
    const endHour = operatingHours.end || '24:00';

    const bookings = await getFieldBookings(fieldId, date);
    const availableSlots = await calculateAvailableSlots(fieldId, date, startHour, endHour, bookings);

    return {
      field_id: fieldId,
      date: date,
      operating_hours: { start: startHour, end: endHour },
      available_slots: availableSlots,
      total_available: availableSlots.length,
      booked_slots: bookings.length
    };
  } catch (error) {
    console.error('Get field availability error:', error);
    throw error;
  }
};

const getFieldBookings = async (fieldId, date) => {
  const query = `
    SELECT id, start_time, end_time, status, name
    FROM bookings
    WHERE field_id = $1 AND date = $2 AND status IN ('pending', 'confirmed', 'completed')
    ORDER BY start_time
  `;
  const result = await pool.query(query, [fieldId, date]);
  return result.rows;
};

const calculateAvailableSlots = async (fieldId, date, startHour, endHour, existingBookings) => {
  const availableSlots = [];
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const startMinutes = timeToMinutes(startHour);
  const endMinutes = timeToMinutes(endHour);
  const slotDuration = 60; // 1 hour slots

  for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += slotDuration) {
    const slotStart = minutesToTime(currentMinutes);
    const slotEnd = minutesToTime(currentMinutes + slotDuration);

    const isAvailable = !existingBookings.some(booking => {
      const bookingStart = timeToMinutes(booking.start_time);
      const bookingEnd = timeToMinutes(booking.end_time);
      const slotStartMinutes = currentMinutes;
      const slotEndMinutes = currentMinutes + slotDuration;

      return (slotStartMinutes < bookingEnd && slotEndMinutes > bookingStart);
    });

    if (isAvailable) {
      availableSlots.push({
        start_time: slotStart,
        end_time: slotEnd,
        available: true,
        duration_minutes: slotDuration
      });
    }
  }

  return availableSlots;
};

const getFieldOperatingHours = async (fieldId) => {
  const query = `
    SELECT operating_hours, operating_days
    FROM fields
    WHERE id = $1 AND status = 'active'
  `;
  const result = await pool.query(query, [fieldId]);
  return result.rows[0];
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  searchFieldsByName,
  getFieldsByStatus,
  getFieldsByOperator,
  getAvailableFields,
  updateFieldRating,
  getFieldStatistics,
  getFieldAvailability,
  getFieldBookings,
  calculateAvailableSlots,
  getFieldOperatingHours,
};
