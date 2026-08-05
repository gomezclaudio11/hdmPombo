const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const jwtService = require('../jwt.service');
const validationService = require('../validation');
const emailService = require('../emailService');

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
  },

  async forgotPassword(req, res) {
    try {
      const validatedData = validationService.validate('forgotPassword', req.body);
      const user = await User.findOne({ email: validatedData.email.toLowerCase(), active: true });

      if (!user) {
        return res.json({
          message: 'Si el correo está registrado, se han enviado las instrucciones para restablecer la contraseña.'
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.json({
        message: 'Si el correo está registrado, se han enviado las instrucciones para restablecer la contraseña.'
      });
    } catch (error) {
      console.error('Forgot password error:', error.message);
      if (error.message.startsWith('Validation error:')) {
        return res.status(400).json({
          message: 'Validation failed',
          details: error.message.replace('Validation error: ', '')
        });
      }
      res.status(500).json({ message: 'Error al procesar la solicitud de recuperación' });
    }
  },

  async resetPassword(req, res) {
    try {
      const validatedData = validationService.validate('resetPassword', req.body);
      const { token, password } = validatedData;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
        active: true
      });

      if (!user) {
        return res.status(400).json({
          message: 'El enlace de recuperación es inválido o ha expirado.'
        });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      });
    } catch (error) {
      console.error('Reset password error:', error.message);
      if (error.message.startsWith('Validation error:')) {
        return res.status(400).json({
          message: 'Validation failed',
          details: error.message.replace('Validation error: ', '')
        });
      }
      res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
  }
};

module.exports = authController;