const {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isFieldFavorite,
  getUserFavoriteCount,
  getUserFavoritesWithBookings,
  toggleFavorite,
  getFavoriteStatistics,
  getPopularFields
} = require('../../models/enhanced/favoritesModel');

// Get user's favorite fields
const getFavoriteFields = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const favorites = await getUserFavorites(userId, page, limit);
    const totalCount = await getUserFavoriteCount(userId);

    res.json({ success: true, data: {
        favorites,
        // Monitoring data object
        const monitoringData = {
          pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          total_pages: Math.ceil(totalCount / limit)
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil daftar favorit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Add field to favorites
const addFieldToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldId } = req.params;

    const result = await addToFavorites(userId, parseInt(fieldId));

    if (!result.success) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Lapangan sudah ada di daftar favorit'
        };
        // In production, this would be sent to monitoring service
    }

    res.status(201).json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Lapangan berhasil ditambahkan ke favorit',
        data: result.favorite
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Add to favorites error:', error);

    if (error.message.includes('already in favorites')) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Lapangan sudah ada di daftar favorit'
        };
        // In production, this would be sent to monitoring service
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Lapangan tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menambahkan ke favorit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Remove field from favorites
const removeFieldFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldId } = req.params;

    const removed = await removeFromFavorites(userId, parseInt(fieldId));

    if (!removed) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Lapangan tidak ditemukan di daftar favorit'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Lapangan berhasil dihapus dari favorit'
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menghapus dari favorit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Toggle favorite status
const toggleFieldFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldId } = req.params;

    const result = await toggleFavorite(userId, parseInt(fieldId));

    const message = result.action === 'added'
      ? 'Lapangan berhasil ditambahkan ke favorit'
      : 'Lapangan berhasil dihapus dari favorit';

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message,
        data: {
        action: result.action,
        is_favorite: result.isFavorite
        }
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Toggle favorite error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Lapangan tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengubah status favorit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Check if field is favorite
const checkFieldFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldId } = req.params;

    const isFavorite = await isFieldFavorite(userId, parseInt(fieldId));

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          is_favorite: isFavorite
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memeriksa status favorit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get favorites with booking history
const getFavoritesWithAvailabilityInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await getUserFavoritesWithBookings(userId);

    res.json({ success: true, data: {
        favorites
      }
    });
  } catch (error) {
    console.error('Get favorites with booking history error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil favorit dengan riwayat booking'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get user favorites statistics
const getFavoritesStatistics = async (req, res) => {
  try {
    const stats = await getFavoriteStatistics();

    res.json({ success: true, data: stats
    });
  } catch (error) {
    console.error('Get favorites stats error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil statistik favorit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get recommended fields based on popularity
const getRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recommendations = await getPopularFields(limit);

    res.json({ success: true, data: {
        recommendations
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil rekomendasi lapangan'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get favorites count
const getFavoritesCountOnly = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUserFavoriteCount(userId);

    res.json({ success: true, data: {
        count
      }
    });
  } catch (error) {
    console.error('Get favorites count error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil jumlah favorit'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getFavoriteFields,
  addFieldToFavorites,
  removeFieldFromFavorites,
  toggleFieldFavorite,
  checkFieldFavorite,
  getFavoritesWithAvailabilityInfo,
  getFavoritesStatistics,
  getRecommendations,
  getFavoritesCountOnly
};
