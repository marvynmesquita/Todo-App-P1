// models/User.js
const mongoose = require('mongoose');

/**
 * Schema do Usuário
 * Representa um usuário do sistema que pode ter múltiplos projetos
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório'],
    trim: true,
    minlength: [2, 'O nome deve ter no mínimo 2 caracteres'],
    maxlength: [100, 'O nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'O email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um email válido']
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória'],
    minlength: [6, 'A senha deve ter no mínimo 6 caracteres']
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obter os projetos do usuário
userSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'usuarioId'
});

// Índices para melhorar performance
userSchema.index({ email: 1 });

// Exporta o modelo
const User = mongoose.model('User', userSchema);

module.exports = User;
