const {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isFieldFavorite,
  getFavoritesCount,
  getFavoritesWithAvailability,
  toggleFavorite,
  getUserFavoritesStats,
  getRecommendedFields
} = require('../../models/enhanced/favoritesModel');

// Get user's favorite fields
const getFavoriteFields = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const favorites = await getUserFavorites(userId, page, limit);
    const totalCount = await getFavoritesCount(userId);

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          total_pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar favorit'
    });
  }
};

// Add field to favorites
const addFieldToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldId } = req.params;

    const favorite = await addToFavorites(userId, parseInt(fieldId));

    res.status(201).json({
      success: true,
      message: 'Lapangan berhasil ditambahkan ke favorit',
      data: favorite
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    
    if (error.message.includes('already in favorites')) {
      return res.status(400).json({
        success: false,
        message: 'Lapangan sudah ada di daftar favorit'
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan ke favorit'
    });
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
        success: false,
        message: 'Lapangan tidak ditemukan di daftar favorit'
      });
    }

    res.json({
      success: true,
      message: 'Lapangan berhasil dihapus dari favorit'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus dari favorit'
    });
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
      success: true,
      message,
      data: {
        action: result.action,
        is_favorite: result.is_favorite
      }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status favorit'
    });
  }
};

// Check if field is favorite
const checkFieldFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldId } = req.params;

    const isFavorite = await isFieldFavorite(userId, parseInt(fieldId));

    res.json({
      success: true,
      data: {
        is_favorite: isFavorite
      }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memeriksa status favorit'
    });
  }
};

// Get favorites with availability for specific date
const getFavoritesWithAvailabilityInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal diperlukan'
      });
    }

    const favorites = await getFavoritesWithAvailability(userId, date);

    res.json({
      success: true,
      data: {
        date,
        favorites
      }
    });
  } catch (error) {
    console.error('Get favorites with availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil favorit dengan ketersediaan'
    });
  }
};

// Get user favorites statistics
const getFavoritesStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getUserFavoritesStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get favorites stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik favorit'
    });
  }
};

// Get recommended fields based on favorites
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const recommendations = await getRecommendedFields(userId, limit);

    res.json({
      success: true,
      data: {
        recommendations
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rekomendasi lapangan'
    });
  }
};

// Get favorites count
const getFavoritesCountOnly = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getFavoritesCount(userId);

    res.json({
      success: true,
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Get favorites count error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil jumlah favorit'
    });
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
