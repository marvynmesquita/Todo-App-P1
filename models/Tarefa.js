// models/Tarefa.js
const mongoose = require('mongoose');

/**
 * Schema para rastrear mudanças em campos da tarefa
 * Cada entrada registra: campo alterado, valor antigo, valor novo, data e usuário
 */
const historicoSchema = new mongoose.Schema({
  campo: {
    type: String,
    required: true,
    description: 'Nome do campo que foi alterado'
  },
  valorAntigo: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Valor anterior do campo'
  },
  valorNovo: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Novo valor do campo'
  },
  data: {
    type: Date,
    default: Date.now,
    required: true,
    description: 'Data e hora da alteração'
  },
  usuario: {
    type: String,
    required: true,
    description: 'Identificador do usuário que fez a alteração'
  }
}, { _id: false }); // Não criar _id para subdocumentos do histórico

/**
 * Schema principal da Tarefa
 */
const tarefaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'O título da tarefa é obrigatório'],
    trim: true,
    minlength: [3, 'O título deve ter no mínimo 3 caracteres'],
    maxlength: [200, 'O título deve ter no máximo 200 caracteres']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [1000, 'A descrição deve ter no máximo 1000 caracteres']
  },
  prioridade: {
    type: String,
    enum: {
      values: ['baixa', 'media', 'alta'],
      message: 'A prioridade deve ser: baixa, media ou alta'
    },
    default: 'media'
  },
  concluida: {
    type: Boolean,
    default: false
  },
  categoria: {
    type: String,
    trim: true,
    maxlength: [100, 'A categoria deve ter no máximo 100 caracteres']
  },
  dataVencimento: {
    type: Date
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O ID do usuário é obrigatório'],
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'O ID do projeto é obrigatório'],
    index: true
  },
  // Tarefa 1: Campo historico adicionado ao schema
  historico: {
    type: [historicoSchema],
    default: [],
    description: 'Array de objetos que rastreia todas as mudanças feitas na tarefa'
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==========================================
// TAREFA 1: Método de instância adicionarAoHistorico
// ==========================================
/**
 * Adiciona uma entrada ao histórico da tarefa
 * @param {String} campo - Nome do campo que foi alterado
 * @param {*} valorAntigo - Valor anterior do campo
 * @param {*} valorNovo - Novo valor do campo
 * @param {String} usuario - Identificador do usuário que fez a alteração
 * @returns {Object} A entrada de histórico adicionada
 */
tarefaSchema.methods.adicionarAoHistorico = function(campo, valorAntigo, valorNovo, usuario) {
  const entrada = {
    campo,
    valorAntigo,
    valorNovo,
    data: new Date(),
    usuario
  };
  
  this.historico.push(entrada);
  return entrada;
};

// ==========================================
// TAREFA 2: Middleware pre('save') para registro automático
// ==========================================
/**
 * Middleware que registra automaticamente no histórico quando campos importantes são alterados
 * Campos monitorados: titulo, prioridade, concluida, categoria
 */
tarefaSchema.pre('save', function() {
  // Só registra mudanças se o documento já existe (não é novo)
  if (!this.isNew) {
    // Array de campos importantes a serem monitorados
    const camposMonitorados = ['titulo', 'prioridade', 'concluida', 'categoria'];
    
    // Itera sobre cada campo monitorado
    camposMonitorados.forEach(campo => {
      // Verifica se o campo foi modificado
      if (this.isModified(campo)) {
        // Obtém o valor antigo usando o método correto do Mongoose
        // $__original contém os valores originais do documento
        const valorAntigoReal = this.$__original ? this.$__original[campo] : this._doc[campo];
        
        // Obtém o valor novo do campo
        const valorNovo = this[campo];
        
        // Determina o usuário (pode ser obtido do contexto ou definido manualmente)
        // Por padrão, usamos o usuarioId da tarefa
        const usuario = this.usuarioId ? this.usuarioId.toString() : 'sistema';
        
        // Adiciona ao histórico apenas se os valores forem diferentes
        if (valorAntigoReal !== valorNovo) {
          this.adicionarAoHistorico(campo, valorAntigoReal, valorNovo, usuario);
        }
      }
    });
  }
});

// ==========================================
// TAREFA 3: Método estático buscarTarefasComHistorico
// ==========================================
/**
 * Retorna tarefas que possuem pelo menos uma entrada no histórico,
 * ordenadas por data da última alteração (mais recente primeiro)
 * @param {String|ObjectId} usuarioId - ID do usuário (opcional)
 * @returns {Promise<Array>} Array de tarefas com histórico
 */
tarefaSchema.statics.buscarTarefasComHistorico = async function(usuarioId = null) {
  const filtro = {
    // Filtra tarefas que têm pelo menos um item no histórico
    'historico.0': { $exists: true }
  };
  
  // Se usuarioId for fornecido, adiciona ao filtro
  if (usuarioId) {
    filtro.usuarioId = usuarioId;
  }
  
  return this.find(filtro)
  .sort({
    // Ordena pela data do último item do histórico (mais recente primeiro)
    // Usamos um aggregation pipeline para isso
  })
  .exec()
  .then(tarefas => {
    // Ordena as tarefas pela data da última alteração no histórico
    return tarefas.sort((a, b) => {
      const dataA = a.historico.length > 0 
        ? a.historico[a.historico.length - 1].data 
        : new Date(0);
      const dataB = b.historico.length > 0 
        ? b.historico[b.historico.length - 1].data 
        : new Date(0);
      return dataB - dataA; // Ordem decrescente (mais recente primeiro)
    });
  });
};

// Versão alternativa usando aggregation (mais eficiente para grandes volumes)
/**
 * Versão alternativa usando aggregation pipeline
 * @returns {Promise<Array>} Array de tarefas com histórico
 */
tarefaSchema.statics.buscarTarefasComHistoricoAggregation = async function() {
  return this.aggregate([
    // Filtra apenas tarefas com histórico
    {
      $match: {
        'historico.0': { $exists: true }
      }
    },
    // Adiciona um campo com a data da última alteração
    {
      $addFields: {
        ultimaAlteracaoData: { $last: '$historico.data' }
      }
    },
    // Ordena pela data da última alteração (mais recente primeiro)
    {
      $sort: { ultimaAlteracaoData: -1 }
    },
    // Remove o campo temporário
    {
      $project: {
        ultimaAlteracaoData: 0
      }
    }
  ]);
};

// ==========================================
// TAREFA 4: Método de instância obterHistoricoPorCampo
// ==========================================
/**
 * Retorna apenas as entradas do histórico relacionadas a um campo específico
 * @param {String} nomeCampo - Nome do campo a ser filtrado
 * @returns {Array} Array de entradas do histórico para o campo especificado
 */
tarefaSchema.methods.obterHistoricoPorCampo = function(nomeCampo) {
  // Filtra o histórico retornando apenas entradas do campo especificado
  return this.historico.filter(entrada => entrada.campo === nomeCampo);
};

// ==========================================
// TAREFA 5: Virtual ultimaAlteracao
// ==========================================
/**
 * Virtual que retorna a data da última entrada no histórico,
 * ou a data de criação se não houver histórico
 */
tarefaSchema.virtual('ultimaAlteracao').get(function() {
  // Se houver histórico, retorna a data da última entrada
  if (this.historico && this.historico.length > 0) {
    const ultimaEntrada = this.historico[this.historico.length - 1];
    return ultimaEntrada.data;
  }
  
  // Caso contrário, retorna a data de criação (createdAt)
  return this.createdAt;
});

// ==========================================
// MÉTODOS AUXILIARES ADICIONAIS
// ==========================================

/**
 * Método auxiliar para obter um resumo do histórico
 * @returns {Object} Resumo com total de alterações e campos alterados
 */
tarefaSchema.methods.resumoHistorico = function() {
  const camposAlterados = [...new Set(this.historico.map(h => h.campo))];
  
  return {
    totalAlteracoes: this.historico.length,
    camposAlterados,
    primeiraAlteracao: this.historico.length > 0 ? this.historico[0].data : null,
    ultimaAlteracao: this.ultimaAlteracao
  };
};

/**
 * Método para obter histórico ordenado por data (mais recente primeiro)
 * @returns {Array} Histórico ordenado
 */
tarefaSchema.methods.obterHistoricoOrdenado = function() {
  return [...this.historico].sort((a, b) => b.data - a.data);
};

// ==========================================
// MÉTODOS ESTÁTICOS PARA HIERARQUIA USER > PROJECT > TASK
// ==========================================

/**
 * Busca todas as tarefas de um usuário específico
 * @param {String|ObjectId} usuarioId - ID do usuário
 * @param {Object} filtros - Filtros adicionais (opcional)
 * @returns {Promise<Array>} Array de tarefas do usuário
 */
tarefaSchema.statics.buscarPorUsuario = async function(usuarioId, filtros = {}) {
  return this.find({ 
    usuarioId, 
    ...filtros 
  }).sort({ createdAt: -1 });
};

/**
 * Busca todas as tarefas de um projeto específico
 * @param {String|ObjectId} projectId - ID do projeto
 * @param {Object} filtros - Filtros adicionais (opcional)
 * @returns {Promise<Array>} Array de tarefas do projeto
 */
tarefaSchema.statics.buscarPorProjeto = async function(projectId, filtros = {}) {
  return this.find({ 
    projectId, 
    ...filtros 
  }).sort({ createdAt: -1 });
};

/**
 * Busca tarefas de um usuário em um projeto específico
 * @param {String|ObjectId} usuarioId - ID do usuário
 * @param {String|ObjectId} projectId - ID do projeto
 * @param {Object} filtros - Filtros adicionais (opcional)
 * @returns {Promise<Array>} Array de tarefas
 */
tarefaSchema.statics.buscarPorUsuarioEProjeto = async function(usuarioId, projectId, filtros = {}) {
  return this.find({ 
    usuarioId,
    projectId, 
    ...filtros 
  }).sort({ createdAt: -1 });
};

/**
 * Valida se uma tarefa pertence a um usuário específico
 * @param {String|ObjectId} tarefaId - ID da tarefa
 * @param {String|ObjectId} usuarioId - ID do usuário
 * @returns {Promise<Boolean>} true se a tarefa pertence ao usuário
 */
tarefaSchema.statics.pertenceAoUsuario = async function(tarefaId, usuarioId) {
  const tarefa = await this.findOne({ _id: tarefaId, usuarioId });
  return !!tarefa;
};

/**
 * Valida se uma tarefa pertence a um projeto específico
 * @param {String|ObjectId} tarefaId - ID da tarefa
 * @param {String|ObjectId} projectId - ID do projeto
 * @returns {Promise<Boolean>} true se a tarefa pertence ao projeto
 */
tarefaSchema.statics.pertenceAoProjeto = async function(tarefaId, projectId) {
  const tarefa = await this.findOne({ _id: tarefaId, projectId });
  return !!tarefa;
};

/**
 * Busca uma tarefa validando que pertence ao usuário
 * @param {String|ObjectId} tarefaId - ID da tarefa
 * @param {String|ObjectId} usuarioId - ID do usuário
 * @returns {Promise<Object|null>} Tarefa ou null se não encontrada/não pertence ao usuário
 */
tarefaSchema.statics.buscarPorIdEUsuario = async function(tarefaId, usuarioId) {
  return this.findOne({ _id: tarefaId, usuarioId });
};

/**
 * Atualiza uma tarefa validando que pertence ao usuário
 * @param {String|ObjectId} tarefaId - ID da tarefa
 * @param {String|ObjectId} usuarioId - ID do usuário
 * @param {Object} updates - Campos a serem atualizados
 * @returns {Promise<Object|null>} Tarefa atualizada ou null
 */
tarefaSchema.statics.atualizarPorIdEUsuario = async function(tarefaId, usuarioId, updates) {
  const tarefa = await this.findOne({ _id: tarefaId, usuarioId });
  if (!tarefa) return null;
  
  Object.assign(tarefa, updates);
  await tarefa.save();
  return tarefa;
};

/**
 * Deleta uma tarefa validando que pertence ao usuário
 * @param {String|ObjectId} tarefaId - ID da tarefa
 * @param {String|ObjectId} usuarioId - ID do usuário
 * @returns {Promise<Object|null>} Tarefa deletada ou null
 */
tarefaSchema.statics.deletarPorIdEUsuario = async function(tarefaId, usuarioId) {
  return this.findOneAndDelete({ _id: tarefaId, usuarioId });
};


// Índices para melhorar performance
tarefaSchema.index({ usuarioId: 1, concluida: 1 });
tarefaSchema.index({ projectId: 1, concluida: 1 });
tarefaSchema.index({ usuarioId: 1, projectId: 1 });
tarefaSchema.index({ 'historico.data': -1 });
tarefaSchema.index({ 'historico.campo': 1 });

// Exporta o modelo
const Tarefa = mongoose.model('Tarefa', tarefaSchema);

module.exports = Tarefa;
