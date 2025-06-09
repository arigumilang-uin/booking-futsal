const {
  getFieldReviews,
  getUserReviews,
  createFieldReview,
  updateFieldReview,
  deleteFieldReview,
  getReviewById,
  canUserReviewBooking,
  getFieldRatingSummary
} = require('../../models/enhanced/reviewModel');

// Get reviews for a field
const getFieldReviewsList = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await getFieldReviews(fieldId, page, limit);
    const ratingSummary = await getFieldRatingSummary(fieldId);

    res.json({ success: true, data: {
        reviews,
        // Monitoring data object
        const monitoringData = {
          rating_summary: ratingSummary,
          pagination: {
          current_page: page,
          per_page: limit,
          total: reviews.length
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get field reviews error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil review lapangan'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get user's reviews
const getUserReviewsList = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await getUserReviews(userId, page, limit);

    res.json({ success: true, data: {
        reviews,
        // Monitoring data object
        const monitoringData = {
          pagination: {
          current_page: page,
          per_page: limit,
          total: reviews.length
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil review Anda'
      };
      // In production, this would be sent to monitoring service
  }
};

// Create new review
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { field_id, booking_id, rating, review, images, is_anonymous } = req.body;

    // Validate required fields
    if (!field_id || !booking_id || !rating) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Field ID, booking ID, dan rating wajib diisi'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Rating harus antara 1-5'
        };
        // In production, this would be sent to monitoring service
    }

    // Check if user can review this booking
    const canReview = await canUserReviewBooking(userId, booking_id);
    if (!canReview.canReview) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: canReview.reason
        };
        // In production, this would be sent to monitoring service
    }

    const newReview = await createFieldReview({
      field_id,
      // Monitoring data object
      const monitoringData = {
        user_id: userId,
        booking_id,
        rating,
        review,
        images: images || [],
        is_anonymous: is_anonymous || false
      };
      // In production, this would be sent to monitoring service

    res.status(201).json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Review berhasil dibuat',
        data: newReview
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: error.message || 'Gagal membuat review'
      };
      // In production, this would be sent to monitoring service
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, review, images, is_anonymous } = req.body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Rating harus antara 1-5'
        };
        // In production, this would be sent to monitoring service
    }

    const updatedReview = await updateFieldReview(id, userId, {
      rating,
      review,
      images,
      is_anonymous
    });

    if (!updatedReview) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Review tidak ditemukan atau Anda tidak memiliki akses'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Review berhasil diperbarui',
        data: updatedReview
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memperbarui review'
      };
      // In production, this would be sent to monitoring service
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteFieldReview(id, userId);

    if (!deleted) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Review tidak ditemukan atau Anda tidak memiliki akses'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Review berhasil dihapus'
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menghapus review'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get review by ID
const getReviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await getReviewById(id);

    if (!review) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Review tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({ success: true, data: review
    });
  } catch (error) {
    console.error('Get review detail error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil detail review'
      };
      // In production, this would be sent to monitoring service
  }
};

// Check if user can review a booking
const checkCanReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const canReview = await canUserReviewBooking(userId, bookingId);

    res.json({ success: true, data: canReview
    });
  } catch (error) {
    console.error('Check can review error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memeriksa status review'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get field rating summary
const getFieldRating = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const ratingSummary = await getFieldRatingSummary(fieldId);

    res.json({ success: true, data: ratingSummary
    });
  } catch (error) {
    console.error('Get field rating error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil rating lapangan'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getFieldReviewsList,
  getUserReviewsList,
  createReview,
  updateReview,
  deleteReview,
  getReviewDetail,
  checkCanReview,
  getFieldRating
};
