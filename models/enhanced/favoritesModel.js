const pool = require('../../config/db');

// Add field to favorites
const addToFavorites = async (userId, fieldId) => {
  // Check if already in favorites
  const existingQuery = `
    SELECT id FROM user_favorites
    WHERE user_id = $1 AND field_id = $2
  `;
  const existingResult = await pool.query(existingQuery, [userId, fieldId]);

  if (existingResult.rows.length > 0) {
    return { success: false, message: 'Field already in favorites' };
  }

  const query = `
    INSERT INTO user_favorites (user_id, field_id)
    VALUES ($1, $2)
    RETURNING id, uuid, user_id, field_id, created_at
  `;
  const result = await pool.query(query, [userId, fieldId]);
  return { success: true, favorite: result.rows[0] };
};

// Remove field from favorites
const removeFromFavorites = async (userId, fieldId) => {
  const query = `
    DELETE FROM user_favorites
    WHERE user_id = $1 AND field_id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [userId, fieldId]);
  return result.rowCount > 0;
};

// Get user favorites
const getUserFavorites = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT uf.id, uf.uuid, uf.user_id, uf.field_id, uf.created_at,
           f.name as field_name, f.type as field_type, f.description, f.location,
           f.address, f.price, f.price_weekend, f.price_member, f.image_url,
           f.rating, f.total_reviews, f.status, f.operating_hours, f.operating_days
    FROM user_favorites uf
    JOIN fields f ON uf.field_id = f.id
    WHERE uf.user_id = $1 AND f.status = 'active'
    ORDER BY uf.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Check if field is in user favorites
const isFieldFavorite = async (userId, fieldId) => {
  const query = `
    SELECT id FROM user_favorites
    WHERE user_id = $1 AND field_id = $2
  `;
  const result = await pool.query(query, [userId, fieldId]);
  return result.rows.length > 0;
};

// Get favorite count for field
const getFieldFavoriteCount = async (fieldId) => {
  const query = `
    SELECT COUNT(*) as favorite_count
    FROM user_favorites
    WHERE field_id = $1
  `;
  const result = await pool.query(query, [fieldId]);
  return parseInt(result.rows[0].favorite_count);
};

// Get user favorite count
const getUserFavoriteCount = async (userId) => {
  const query = `
    SELECT COUNT(*) as favorite_count
    FROM user_favorites uf
    JOIN fields f ON uf.field_id = f.id
    WHERE uf.user_id = $1 AND f.status = 'active'
  `;
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].favorite_count);
};

// Get popular fields (most favorited)
const getPopularFields = async (limit = 10) => {
  const query = `
    SELECT f.id, f.uuid, f.name, f.type, f.description, f.location, f.address,
           f.price, f.price_weekend, f.price_member, f.image_url, f.rating,
           f.total_reviews, f.status, f.operating_hours, f.operating_days,
           COUNT(uf.id) as favorite_count
    FROM fields f
    LEFT JOIN user_favorites uf ON f.id = uf.field_id
    WHERE f.status = 'active'
    GROUP BY f.id, f.uuid, f.name, f.type, f.description, f.location, f.address,
             f.price, f.price_weekend, f.price_member, f.image_url, f.rating,
             f.total_reviews, f.status, f.operating_hours, f.operating_days
    ORDER BY favorite_count DESC, f.rating DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

// Get favorite statistics
const getFavoriteStatistics = async () => {
  const query = `
    SELECT
      COUNT(DISTINCT user_id) as total_users_with_favorites,
      COUNT(DISTINCT field_id) as total_favorited_fields,
      COUNT(*) as total_favorites,
      AVG(field_count) as average_favorites_per_user
    FROM (
      SELECT user_id, COUNT(*) as field_count
      FROM user_favorites
      GROUP BY user_id
    ) user_stats
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

// Get user's favorite fields with booking history
const getUserFavoritesWithBookings = async (userId) => {
  const query = `
    SELECT uf.id, uf.uuid, uf.field_id, uf.created_at as favorited_at,
           f.name as field_name, f.type as field_type, f.location, f.price,
           f.rating, f.total_reviews, f.image_url,
           COUNT(b.id) as booking_count,
           MAX(b.date) as last_booking_date,
           SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings
    FROM user_favorites uf
    JOIN fields f ON uf.field_id = f.id
    LEFT JOIN bookings b ON f.id = b.field_id AND b.user_id = uf.user_id
    WHERE uf.user_id = $1 AND f.status = 'active'
    GROUP BY uf.id, uf.uuid, uf.field_id, uf.created_at, f.name, f.type,
             f.location, f.price, f.rating, f.total_reviews, f.image_url
    ORDER BY uf.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Toggle favorite (add if not exists, remove if exists)
const toggleFavorite = async (userId, fieldId) => {
  const isCurrentlyFavorite = await isFieldFavorite(userId, fieldId);

  if (isCurrentlyFavorite) {
    const removed = await removeFromFavorites(userId, fieldId);
    return {
      success: removed,
      action: 'removed',
      isFavorite: false,
      message: removed ? 'Removed from favorites' : 'Failed to remove from favorites'
    };
  } else {
    const result = await addToFavorites(userId, fieldId);
    return {
      success: result.success,
      action: 'added',
      isFavorite: result.success,
      message: result.success ? 'Added to favorites' : result.message,
      favorite: result.favorite
    };
  }
};

// Get recently favorited fields
const getRecentlyFavorited = async (limit = 10) => {
  const query = `
    SELECT uf.id, uf.uuid, uf.user_id, uf.field_id, uf.created_at,
           u.name as user_name,
           f.name as field_name, f.type as field_type, f.location, f.rating
    FROM user_favorites uf
    JOIN users u ON uf.user_id = u.id
    JOIN fields f ON uf.field_id = f.id
    WHERE f.status = 'active'
    ORDER BY uf.created_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

// Clean up favorites for inactive fields
const cleanupInactiveFavorites = async () => {
  const query = `
    DELETE FROM user_favorites
    WHERE field_id IN (
      SELECT id FROM fields WHERE status != 'active'
    )
    RETURNING COUNT(*) as deleted_count
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFieldFavorite,
  getFieldFavoriteCount,
  getUserFavoriteCount,
  getPopularFields,
  getFavoriteStatistics,
  getUserFavoritesWithBookings,
  toggleFavorite,
  getRecentlyFavorited,
  cleanupInactiveFavorites
};
