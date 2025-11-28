// models/Project.js
const mongoose = require('mongoose');

/**
 * Schema do Projeto
 * Representa um projeto que pertence a um usuário e pode ter múltiplas tarefas
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome do projeto é obrigatório'],
    trim: true,
    minlength: [2, 'O nome deve ter no mínimo 2 caracteres'],
    maxlength: [200, 'O nome deve ter no máximo 200 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'A descrição deve ter no máximo 1000 caracteres']
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O ID do usuário é obrigatório'],
    index: true
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obter as tarefas do projeto
projectSchema.virtual('tasks', {
  ref: 'Tarefa',
  localField: '_id',
  foreignField: 'projectId'
});

// Método para obter estatísticas do projeto
projectSchema.methods.getStats = async function() {
  const Tarefa = mongoose.model('Tarefa');
  const tasks = await Tarefa.find({ projectId: this._id });
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.concluida).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionPercentage: parseFloat(completionPercentage.toFixed(2))
  };
};

// Índices para melhorar performance
projectSchema.index({ usuarioId: 1, createdAt: -1 });

// Middleware para deletar todas as tarefas quando um projeto é deletado
projectSchema.pre('remove', async function() {
  const Tarefa = mongoose.model('Tarefa');
  await Tarefa.deleteMany({ projectId: this._id });
});

// Exporta o modelo
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
