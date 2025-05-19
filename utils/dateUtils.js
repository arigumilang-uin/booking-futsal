const moment = require('moment');

// Format tanggal ke "YYYY-MM-DD"
const formatDate = (date) => moment(date).format('YYYY-MM-DD');

// Ambil tanggal hari ini dalam format "YYYY-MM-DD"
const getCurrentDate = () => moment().format('YYYY-MM-DD');

// Cek apakah dua waktu bertabrakan (format: HH:mm)
const isTimeOverlap = (start1, end1, start2, end2) => {
  return !(end1 <= start2 || start1 >= end2);
};

module.exports = {
  formatDate,
  getCurrentDate,
  isTimeOverlap,
};
