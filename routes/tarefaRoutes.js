// routes/tarefaRoutes.js
const express = require('express');
const router = express.Router();
const Tarefa = require('../models/Tarefa');

/**
 * Rotas de teste para o modelo Tarefa
 * Estas rotas demonstram todas as funcionalidades implementadas
 */

// ==========================================
// ROTA DE TESTE 1: Criar uma nova tarefa
// Valida que a tarefa pertence a um usuário e projeto
// ==========================================
router.post('/api/tarefas', async (req, res) => {
  try {
    const { titulo, descricao, prioridade, categoria, usuarioId, projectId } = req.body;
    
    // Validação: usuarioId e projectId são obrigatórios
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'O ID do usuário é obrigatório'
      });
    }
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'O ID do projeto é obrigatório'
      });
    }
    
    // Validar que o projeto pertence ao usuário
    const Project = require('../models/Project');
    const project = await Project.findOne({ _id: projectId, usuarioId });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado ou não pertence ao usuário'
      });
    }
    
    const novaTarefa = new Tarefa({
      titulo,
      descricao,
      prioridade,
      categoria,
      usuarioId,
      projectId,
      concluida: false
    });
    
    await novaTarefa.save();
    
    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      tarefa: novaTarefa
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar tarefa',
      error: error.message
    });
  }
});

// ==========================================
// ROTA DE TESTE 2: Adicionar entrada manual ao histórico
// Demonstra o método adicionarAoHistorico
// ==========================================
router.post('/api/tarefas/:id/historico', async (req, res) => {
  try {
    const { id } = req.params;
    const { campo, valorAntigo, valorNovo, usuario } = req.body;
    
    const tarefa = await Tarefa.findById(id);
    
    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }
    
    // Usa o método adicionarAoHistorico
    const entrada = tarefa.adicionarAoHistorico(campo, valorAntigo, valorNovo, usuario);
    await tarefa.save();
    
    res.json({
      success: true,
      message: 'Entrada adicionada ao histórico',
      entrada,
      historicoCompleto: tarefa.historico
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao adicionar ao histórico',
      error: error.message
    });
  }
});

// ==========================================
// ROTA DE TESTE 3: Atualizar tarefa (testa middleware pre-save)
// O middleware registra automaticamente as mudanças
// Valida que a tarefa pertence ao usuário
// ==========================================
router.put('/api/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, prioridade, concluida, categoria, descricao, usuarioId } = req.body;
    
    // Validação: usuarioId é obrigatório para atualização
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'O ID do usuário é obrigatório'
      });
    }
    
    // Busca a tarefa validando que pertence ao usuário
    const tarefa = await Tarefa.buscarPorIdEUsuario(id, usuarioId);
    
    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada ou não pertence ao usuário'
      });
    }
    
    // Atualiza os campos (o middleware pre-save registrará as mudanças)
    if (titulo !== undefined) tarefa.titulo = titulo;
    if (prioridade !== undefined) tarefa.prioridade = prioridade;
    if (concluida !== undefined) tarefa.concluida = concluida;
    if (categoria !== undefined) tarefa.categoria = categoria;
    if (descricao !== undefined) tarefa.descricao = descricao;
    
    await tarefa.save();
    
    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      tarefa,
      historicoAtualizado: tarefa.historico
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar tarefa',
      error: error.message
    });
  }
});

// ==========================================
// ROTA DE TESTE 4: Buscar tarefas com histórico
// Demonstra o método estático buscarTarefasComHistorico
// Suporta filtro por usuário
// ==========================================
router.get('/api/tarefas/com-historico', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    const tarefas = await Tarefa.buscarTarefasComHistorico(usuarioId);
    
    res.json({
      success: true,
      total: tarefas.length,
      tarefas: tarefas.map(t => ({
        id: t._id,
        titulo: t.titulo,
        usuarioId: t.usuarioId,
        projectId: t.projectId,
        totalAlteracoes: t.historico.length,
        ultimaAlteracao: t.ultimaAlteracao,
        historico: t.historico
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tarefas com histórico',
      error: error.message
    });
  }
});

// ==========================================
// ROTA DE TESTE 5: Obter histórico por campo
// Demonstra o método obterHistoricoPorCampo
// ==========================================
router.get('/api/tarefas/:id/historico/:campo', async (req, res) => {
  try {
    const { id, campo } = req.params;
    
    const tarefa = await Tarefa.findById(id);
    
    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }
    
    // Usa o método obterHistoricoPorCampo
    const historicoCampo = tarefa.obterHistoricoPorCampo(campo);
    
    res.json({
      success: true,
      campo,
      totalAlteracoes: historicoCampo.length,
      historico: historicoCampo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico do campo',
      error: error.message
    });
  }
});

// ==========================================
// ROTA DE TESTE 6: Obter última alteração
// Demonstra o virtual ultimaAlteracao
// ==========================================
router.get('/api/tarefas/:id/ultima-alteracao', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarefa = await Tarefa.findById(id);
    
    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }
    
    res.json({
      success: true,
      tarefaId: tarefa._id,
      titulo: tarefa.titulo,
      ultimaAlteracao: tarefa.ultimaAlteracao,
      createdAt: tarefa.createdAt,
      temHistorico: tarefa.historico.length > 0,
      totalAlteracoes: tarefa.historico.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar última alteração',
      error: error.message
    });
  }
});

// ==========================================
// ROTAS AUXILIARES
// ==========================================

// Listar todas as tarefas
// Suporta filtros por usuário e/ou projeto
router.get('/api/tarefas', async (req, res) => {
  try {
    const { usuarioId, projectId } = req.query;
    
    let tarefas;
    
    // Se ambos usuarioId e projectId são fornecidos
    if (usuarioId && projectId) {
      tarefas = await Tarefa.buscarPorUsuarioEProjeto(usuarioId, projectId);
    }
    // Se apenas usuarioId é fornecido
    else if (usuarioId) {
      tarefas = await Tarefa.buscarPorUsuario(usuarioId);
    }
    // Se apenas projectId é fornecido
    else if (projectId) {
      tarefas = await Tarefa.buscarPorProjeto(projectId);
    }
    // Se nenhum filtro é fornecido, retorna todas (não recomendado em produção)
    else {
      tarefas = await Tarefa.find().sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      total: tarefas.length,
      tarefas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar tarefas',
      error: error.message
    });
  }
});

// Buscar uma tarefa específica
// Opcionalmente valida que pertence ao usuário
router.get('/api/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    let tarefa;
    
    // Se usuarioId é fornecido, valida que a tarefa pertence ao usuário
    if (usuarioId) {
      tarefa = await Tarefa.buscarPorIdEUsuario(id, usuarioId);
      
      if (!tarefa) {
        return res.status(404).json({
          success: false,
          message: 'Tarefa não encontrada ou não pertence ao usuário'
        });
      }
    } else {
      tarefa = await Tarefa.findById(id);
      
      if (!tarefa) {
        return res.status(404).json({
          success: false,
          message: 'Tarefa não encontrada'
        });
      }
    }
    
    res.json({
      success: true,
      tarefa,
      resumoHistorico: tarefa.resumoHistorico()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tarefa',
      error: error.message
    });
  }
});

// Deletar uma tarefa
// Valida que a tarefa pertence ao usuário
router.delete('/api/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query; // Recebe usuarioId via query string
    
    // Validação: usuarioId é obrigatório
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'O ID do usuário é obrigatório'
      });
    }
    
    // Deleta a tarefa validando que pertence ao usuário
    const tarefa = await Tarefa.deletarPorIdEUsuario(id, usuarioId);
    
    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada ou não pertence ao usuário'
      });
    }
    
    res.json({
      success: true,
      message: 'Tarefa deletada com sucesso',
      tarefa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar tarefa',
      error: error.message
    });
  }
});

module.exports = router;
