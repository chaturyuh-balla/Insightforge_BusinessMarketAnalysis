import express from 'express';
import bcrypt from 'bcryptjs';
import { isDatabaseConfigured, requireDb } from '../db.js';
import { createId, memory } from '../memoryStore.js';

const router = express.Router();

router.get('/me', (req, res) => {
  res.json({ user: req.session?.user || null });
});

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || password !== confirmPassword) {
      return res.status(400).json({ message: 'Please provide valid account details.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    if (!isDatabaseConfigured) {
      if (memory.users.some((user) => user.email === email.toLowerCase().trim())) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      const user = {
        id: createId(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      };
      memory.users.push(user);
      req.session.user = publicUser(user);
      return res.status(201).json({ user: req.session.user });
    }

    const db = requireDb();
    const { rows } = await db.query(
      'insert into users (name, email, password_hash) values ($1, $2, $3) returning id, name, email, created_at',
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    req.session.user = rows[0];
    res.status(201).json({ user: rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      error.status = 409;
      error.message = 'An account with this email already exists.';
    }
    next(error);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!isDatabaseConfigured) {
      const demoUser = memory.users.find((item) => item.email === email.toLowerCase().trim());
      if (!demoUser || !(await bcrypt.compare(password, demoUser.password_hash))) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      req.session.user = publicUser(demoUser);
      return res.json({ user: req.session.user });
    }

    const db = requireDb();
    const { rows } = await db.query('select * from users where email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    };
    res.json({ user: req.session.user });
  } catch (error) {
    next(error);
  }
});

router.post('/signout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

export default router;

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at
  };
}
