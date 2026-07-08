const { User } = require('../models');

async function getUsers(req, res) {
  try {
    const users = await User.findAll({
      where: { isActive: true },
      attributes: { exclude: ['password'] },
      order: [
        ['role', 'asc'],
        ['name', 'asc'],
      ],
    });
    res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

module.exports = {
  getUsers,
};
