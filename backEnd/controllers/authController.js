const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwtService = require('../jwt.service');
const validationService = require('../validation');

const authController = {
  async register(req, res) {
    try {
      const validatedData = validationService.validate('register', req.body);
      
      const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          message: 'User with this email already exists',
          error: 'USER_001'
        });
      }
      
      const newUser = new User({
        nombre: validatedData.nombre,
        email: validatedData.email.toLowerCase(),
        password: validatedData.password,
        role: validatedData.codigoInvitacion === 'agenteObservador' ? 'observer' : 'reader'
      });
      
      await newUser.save();
      
      const token = jwtService.generateToken({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        nombre: newUser.nombre
      });
      
      const safeUserData = newUser.toSafeObject();
      
      res.status(201).json({
        message: 'User registered successfully',
        user: safeUserData,
        token: token
      });
      
    } catch (error) {
      console.error('Registration error:', error.message);
      
      if (error.message.startsWith('Validation error:')) {
        return res.status(400).json({
          message: 'Registration validation failed',
          error: 'REG_001',
          details: error.message.replace('Validation error: ', '')
        });
      }
      
      res.status(500).json({
        message: 'Internal server error during registration',
        error: 'REG_002'
      });
    }
  },
  
  async login(req, res) {
    try {
      const validatedData = validationService.validate('login', req.body);
      
      const user = await User.findOne({ 
        email: validatedData.email.toLowerCase(),
        active: true 
      });
      
      if (!user) {
        return res.status(401).json({
          message: 'Invalid credentials',
          error: 'LOGIN_001'
        });
      }
      
      const isValidPassword = await user.comparePassword(validatedData.password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: 'Invalid credentials',
          error: 'LOGIN_002'
        });
      }
      
      const token = jwtService.generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        nombre: user.nombre
      });
      
      const safeUserData = user.toSafeObject();
      
      res.json({
        message: 'Login successful',
        user: safeUserData,
        token: token
      });
      
    } catch (error) {
      console.error('Login error:', error.message);
      
      if (error.message.startsWith('Validation error:')) {
        return res.status(400).json({
          message: 'Login validation failed',
          error: 'LOGIN_003',
          details: error.message.replace('Validation error: ', '')
        });
      }
      
      res.status(500).json({
        message: 'Internal server error during login',
        error: 'LOGIN_004'
      });
    }
  }
};

module.exports = authController;