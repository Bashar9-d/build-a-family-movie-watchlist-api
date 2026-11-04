
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findByUsername } from '../utils/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check required fields
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required.'
      });
    }

    // Find user
    const user = findByUsername(username);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid username or password.'
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid username or password.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    return res.status(200).json({
      token
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
});

export default router;
