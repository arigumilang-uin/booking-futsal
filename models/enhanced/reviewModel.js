const pool = require('../../config/db');

// Create field review
const createFieldReview = async ({
  user_id,
  field_id,
  booking_id,
  rating,
  review,
  images = [],
  is_anonymous = false
}) => {
  try {
    const query = `
      INSERT INTO field_reviews (user_id, field_id, booking_id, rating, review, images, is_anonymous)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, uuid, user_id, field_id, booking_id, rating, review, images,
                is_anonymous, created_at
    `;
    const values = [
      user_id, field_id, booking_id, rating, review,
      JSON.stringify(images), is_anonymous
    ];
    const result = await pool.query(query, values);

    // Update field rating in background (don't wait for it)
    setImmediate(() => {
      updateFieldRating(field_id).catch(err =>
      );
    });

    return result.rows[0];
  } catch (error) {
    console.error('Create field review error:', error);
    throw error;
  }
};

// Get field reviews
const getFieldReviews = async (fieldId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT fr.id, fr.uuid, fr.user_id, fr.field_id, fr.booking_id, fr.rating,
           fr.review, fr.images, fr.is_anonymous, fr.created_at,
           CASE
             WHEN fr.is_anonymous = true THEN 'Anonymous User'
             ELSE u.name
           END as reviewer_name,
           b.booking_number, b.date as booking_date
    FROM field_reviews fr
    LEFT JOIN users u ON fr.user_id = u.id
    LEFT JOIN bookings b ON fr.booking_id = b.id
    WHERE fr.field_id = $1
    ORDER BY fr.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [fieldId, limit, offset]);
  return result.rows;
};

// Get user reviews
const getUserReviews = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT fr.id, fr.uuid, fr.user_id, fr.field_id, fr.booking_id, fr.rating,
           fr.review, fr.images, fr.is_anonymous, fr.created_at,
           f.name as field_name, f.type as field_type, f.location as field_location,
           b.booking_number, b.date as booking_date
    FROM field_reviews fr
    LEFT JOIN fields f ON fr.field_id = f.id
    LEFT JOIN bookings b ON fr.booking_id = b.id
    WHERE fr.user_id = $1
    ORDER BY fr.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Get review by ID
const getReviewById = async (reviewId) => {
  const query = `
    SELECT fr.id, fr.uuid, fr.user_id, fr.field_id, fr.booking_id, fr.rating,
           fr.review, fr.images, fr.is_anonymous, fr.created_at, fr.updated_at,
           CASE
             WHEN fr.is_anonymous = true THEN 'Anonymous User'
             ELSE u.name
           END as reviewer_name,
           f.name as field_name, f.type as field_type, f.location as field_location,
           b.booking_number, b.date as booking_date
    FROM field_reviews fr
    LEFT JOIN users u ON fr.user_id = u.id
    LEFT JOIN fields f ON fr.field_id = f.id
    LEFT JOIN bookings b ON fr.booking_id = b.id
    WHERE fr.id = $1
  `;
  const result = await pool.query(query, [reviewId]);
  return result.rows[0];
};

// Update review
const updateFieldReview = async (reviewId, userId, { rating, review, images, is_anonymous }) => {
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (rating !== undefined) {
    updateFields.push(`rating = $${paramCount++}`);
    values.push(rating);
  }
  if (review !== undefined) {
    updateFields.push(`review = $${paramCount++}`);
    values.push(review);
  }
  if (images !== undefined) {
    updateFields.push(`images = $${paramCount++}`);
    values.push(JSON.stringify(images));
  }
  if (is_anonymous !== undefined) {
    updateFields.push(`is_anonymous = $${paramCount++}`);
    values.push(is_anonymous);
  }

  updateFields.push(`updated_at = NOW()`);
  values.push(reviewId, userId);

  const query = `
    UPDATE field_reviews
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount++} AND user_id = $${paramCount++}
    RETURNING id, uuid, user_id, field_id, booking_id, rating, review, images,
              is_anonymous, created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete review
const deleteFieldReview = async (reviewId, userId) => {
  const query = `
    DELETE FROM field_reviews
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [reviewId, userId]);
  return result.rowCount > 0;
};

// Check if user can review booking
const canUserReviewBooking = async (userId, bookingId) => {
  // Check if booking exists and belongs to user
  const bookingQuery = `
    SELECT id, status, date, end_time
    FROM bookings
    WHERE id = $1 AND user_id = $2
  `;
  const bookingResult = await pool.query(bookingQuery, [bookingId, userId]);

  if (bookingResult.rows.length === 0) {
    return { canReview: false, reason: 'Booking not found or not owned by user' };
  }

  const booking = bookingResult.rows[0];

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return { canReview: false, reason: 'Booking must be completed to review' };
  }

  // Check if review already exists
  const reviewQuery = `
    SELECT id FROM field_reviews
    WHERE user_id = $1 AND booking_id = $2
  `;
  const reviewResult = await pool.query(reviewQuery, [userId, bookingId]);

  if (reviewResult.rows.length > 0) {
    return { canReview: false, reason: 'Review already exists for this booking' };
  }

  return { canReview: true, booking };
};

// Get field rating summary
const getFieldRatingSummary = async (fieldId) => {
  const query = `
    SELECT
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
    FROM field_reviews
    WHERE field_id = $1
  `;
  const result = await pool.query(query, [fieldId]);
  const summary = result.rows[0];

  return {
    ...summary,
    average_rating: parseFloat(summary.average_rating) || 0,
    total_reviews: parseInt(summary.total_reviews),
    rating_distribution: {
      5: parseInt(summary.five_star),
      4: parseInt(summary.four_star),
      3: parseInt(summary.three_star),
      2: parseInt(summary.two_star),
      1: parseInt(summary.one_star)
    }
  };
};

// Update field rating (called after review creation/update/deletion)
const updateFieldRating = async (fieldId) => {
  const summary = await getFieldRatingSummary(fieldId);

  const updateQuery = `
    UPDATE fields
    SET rating = $1, total_reviews = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, rating, total_reviews
  `;

  const result = await pool.query(updateQuery, [
    summary.average_rating,
    summary.total_reviews,
    fieldId
  ]);

  return result.rows[0];
};

// Get recent reviews
const getRecentReviews = async (limit = 10) => {
  const query = `
    SELECT fr.id, fr.uuid, fr.field_id, fr.rating, fr.review, fr.is_anonymous, fr.created_at,
           CASE
             WHEN fr.is_anonymous = true THEN 'Anonymous User'
             ELSE u.name
           END as reviewer_name,
           f.name as field_name, f.type as field_type, f.location as field_location
    FROM field_reviews fr
    LEFT JOIN users u ON fr.user_id = u.id
    LEFT JOIN fields f ON fr.field_id = f.id
    ORDER BY fr.created_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

// Get review statistics
const getReviewStatistics = async (days = 30) => {
  const query = `
    SELECT
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating,
      COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews,
      COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_reviews,
      COUNT(DISTINCT field_id) as reviewed_fields,
      COUNT(DISTINCT user_id) as unique_reviewers
    FROM field_reviews
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

module.exports = {
  createFieldReview,
  getFieldReviews,
  getUserReviews,
  getReviewById,
  updateFieldReview,
  deleteFieldReview,
  canUserReviewBooking,
  getFieldRatingSummary,
  updateFieldRating,
  getRecentReviews,
  getReviewStatistics
};
