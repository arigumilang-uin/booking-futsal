const pool = require('../config/db');

const getAllFields = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    'SELECT * FROM fields LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
};

const getFieldById = async (id) => {
  const result = await pool.query('SELECT * FROM fields WHERE id = $1', [id]);
  return result.rows[0];
};

const createField = async ({ name, type, price, image_url, status = 'active' }) => {
  const result = await pool.query(
    'INSERT INTO fields (name, type, price, image_url, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, type, price, image_url, status]
  );
  return result.rows[0];
};

const updateField = async (id, { name, type, price, image_url, status }) => {
  const result = await pool.query(
    'UPDATE fields SET name = $1, type = $2, price = $3, image_url = $4, status = $5 WHERE id = $6 RETURNING *',
    [name, type, price, image_url, status, id]
  );
  return result.rows[0];
};

const deleteField = async (id) => {
  await pool.query('DELETE FROM fields WHERE id = $1', [id]);
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
};
