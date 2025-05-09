// tests/authController.test.js
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import VALIDATION_RULES from '../src/middleware/validationConfig.js';

import {
  getRequirements,
  registerUser,
  loginUser,
  logoutUser,
  sendUserResetLink,
  resetPassword,
} from '../src/controllers/authController.js';

// Mock dependencies
jest.mock('express-validator', () => ({ validationResult: jest.fn() }));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/repositories/user.repo.js');
jest.mock('../src/repositories/stats.repo.js');
jest.mock('../src/repositories/ranking.repo.js');
jest.mock('../src/services/email.service.js');
jest.mock('../src/config/config.js', () => ({ config: { tokenKey: 'testKey' } }));

// Import mocks for assertions
import * as userRepo from '../src/repositories/user.repo.js';
import * as statsRepo from '../src/repositories/stats.repo.js';
import * as rankingRepo from '../src/repositories/ranking.repo.js';
import { sendEmail, generateResetPasswordEmail } from '../src/services/email.service.js';

// Helper to mock Express response
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn();
  res.clearCookie = jest.fn();
  return res;
};

describe('authController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getRequirements', () => {
    it('returns validation rules', () => {
      const res = mockRes();
      getRequirements({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        validationRules: VALIDATION_RULES,
      });
    });
  });

  describe('registerUser', () => {
    const req = { body: { username: 'u', email: 'e', password: 'p' } };

    it('on validation error responds 400', async () => {
      validationResult.mockReturnValue({ isEmpty: () => false, array: () => ['err'] });
      const res = mockRes();
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: ['err'] });
    });

    it('on success responds 201 and userId', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      bcrypt.hash.mockResolvedValue('hashed');
      userRepo.createUser.mockResolvedValue(42);
      rankingRepo.userRankingUpdate.mockResolvedValue();
      userRepo.incrementUserActivity.mockResolvedValue();

      const res = mockRes();
      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
      expect(userRepo.createUser).toHaveBeenCalledWith('u', 'e', 'hashed');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, userId: 42 });
    });

    it('on duplicate key error responds 409', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      bcrypt.hash.mockResolvedValue('h');
      userRepo.createUser.mockRejectedValue({ code: '23505' });
      const res = mockRes();
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Username or email already exists.' });
    });

    it('on other error responds 500', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      bcrypt.hash.mockResolvedValue('h');
      userRepo.createUser.mockRejectedValue(new Error('fail'));
      const res = mockRes();
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'An error occurred during registration.' });
    });
  });

  describe('loginUser', () => {
    const req = { body: { username: 'u', password: 'p' } };

    it('invalid user responds 401', async () => {
      userRepo.getUserByUsername.mockResolvedValue(null);
      const res = mockRes();
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ERR_INVALID_CREDENTIALS', code: 'ERR_INVALID_CREDENTIALS' });
    });

    it('invalid password responds 401', async () => {
      userRepo.getUserByUsername.mockResolvedValue({ password: 'x' });
      bcrypt.compare.mockResolvedValue(false);
      const res = mockRes();
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ERR_INVALID_CREDENTIALS', code: 'ERR_INVALID_CREDENTIALS' });
    });

    it('on success sets cookie and responds 200', async () => {
      const user = { id: 1, username: 'u', password: 'x', role: 'r' };
      userRepo.getUserByUsername.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      statsRepo.updateLastLogin.mockResolvedValue();
      userRepo.incrementUserActivity.mockResolvedValue();
      jwt.sign.mockReturnValue('tok');

      const res = mockRes();
      process.env.NODE_ENV = 'production';
      await loginUser(req, res);

      expect(res.cookie).toHaveBeenCalledWith('token', 'tok', expect.objectContaining({ httpOnly: true }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Login successful' });
    });

    it('on exception responds 500', async () => {
      userRepo.getUserByUsername.mockRejectedValue(new Error('err'));
      const res = mockRes();
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'An error occurred during login.' });
    });
  });

  describe('logoutUser', () => {
    it('clears cookie and responds 200', () => {
      const res = mockRes();
      logoutUser({}, res);
      expect(res.clearCookie).toHaveBeenCalledWith('token', expect.objectContaining({ httpOnly: true }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Logged out successfully', token: null });
    });
  });

  describe('sendUserResetLink', () => {
    const req = { body: { email: 'e', language: 'pl' } };

    it('when no user still returns INFO_RESET_EMAIL_SENT', async () => {
      userRepo.getUserByEmail.mockResolvedValue([]);
      const res = mockRes();
      await sendUserResetLink(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'INFO_RESET_EMAIL_SENT' });
    });

    it('when user exists sends email and returns message', async () => {
      const user = { id: 5, username: 'u', email: 'e' };
      userRepo.getUserByEmail.mockResolvedValue([user]);
      jwt.sign.mockReturnValue('token');
      generateResetPasswordEmail.mockReturnValue('<html>');
      sendEmail.mockResolvedValue();

      const res = mockRes();
      await sendUserResetLink(req, res);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'e', html: '<html>' }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'INFO_RESET_EMAIL_SENT' });
    });

    it('on error responds 500', async () => {
      userRepo.getUserByEmail.mockRejectedValue(new Error('fail'));
      const res = mockRes();
      await sendUserResetLink(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'ERR_RESET_SENDING_FAIL', code: 'ERR_RESET_SENDING_FAIL' });
    });
  });

  describe('resetPassword', () => {
    const req = { body: { token: 't', password: 'newp' } };

    it('on success responds 200', async () => {
      jwt.verify.mockReturnValue({ id: 3 });
      bcrypt.hash.mockResolvedValue('hp');
      userRepo.updateUserById.mockResolvedValue();
      const res = mockRes();
      await resetPassword(req, res);
      expect(jwt.verify).toHaveBeenCalledWith('t', 'testKey');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Hasło zostało zmienione.' });
    });

    it('on invalid token responds 400', async () => {
      jwt.verify.mockImplementation(() => { throw new Error(); });
      const res = mockRes();
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token wygasł lub jest nieprawidłowy.' });
    });
  });
});
