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

    res.json({
      success: true,
      data: {
        reviews,
        rating_summary: ratingSummary,
        pagination: {
          current_page: page,
          per_page: limit,
          total: reviews.length
        }
      }
    });
  } catch (error) {
    console.error('Get field reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil review lapangan'
    });
  }
};

// Get user's reviews
const getUserReviewsList = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await getUserReviews(userId, page, limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current_page: page,
          per_page: limit,
          total: reviews.length
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil review Anda'
    });
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
        success: false,
        message: 'Field ID, booking ID, dan rating wajib diisi'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    // Check if user can review this booking
    const canReview = await canUserReviewBooking(userId, booking_id);
    if (!canReview.canReview) {
      return res.status(400).json({
        success: false,
        message: canReview.reason
      });
    }

    const newReview = await createFieldReview({
      field_id,
      user_id: userId,
      booking_id,
      rating,
      review,
      images: images || [],
      is_anonymous: is_anonymous || false
    });

    res.status(201).json({
      success: true,
      message: 'Review berhasil dibuat',
      data: newReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal membuat review'
    });
  }
};

// Update review
const updateFieldReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, review, images, is_anonymous } = req.body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    const updatedReview = await updateFieldReview(id, userId, {
      rating,
      review,
      images,
      is_anonymous
    });

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    res.json({
      success: true,
      message: 'Review berhasil diperbarui',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui review'
    });
  }
};

// Delete review
const deleteFieldReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteFieldReview(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    res.json({
      success: true,
      message: 'Review berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus review'
    });
  }
};

// Get review by ID
const getReviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await getReviewById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail review'
    });
  }
};

// Check if user can review a booking
const checkCanReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const canReview = await canUserReviewBooking(userId, bookingId);

    res.json({
      success: true,
      data: canReview
    });
  } catch (error) {
    console.error('Check can review error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memeriksa status review'
    });
  }
};

// Get field rating summary
const getFieldRating = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const ratingSummary = await getFieldRatingSummary(fieldId);

    res.json({
      success: true,
      data: ratingSummary
    });
  } catch (error) {
    console.error('Get field rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rating lapangan'
    });
  }
};

module.exports = {
  getFieldReviewsList,
  getUserReviewsList,
  createReview,
  updateFieldReview,
  deleteFieldReview,
  getReviewDetail,
  checkCanReview,
  getFieldRating
};
