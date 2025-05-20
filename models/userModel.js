// models/userModels.js
const pool = require('../config/db');

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const createUser = async ({ name, email, password, role = 'user' }) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password, role]
  );
  return result.rows[0];
};

const deleteUserById = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rowCount > 0; 
};


const getUsersByRole = async (role) => {
  const result = await pool.query('SELECT * FROM users WHERE role = $1', [role]);
  return result.rows;
};

const updateUserProfile = async (id, { name, email }) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
    [name, email, id]
  );
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  deleteUserById,
  getUsersByRole,
  updateUserProfile,
};
