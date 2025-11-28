// test-hierarquia.js
/**
 * Script de teste para demonstrar a hierarquia User > Project > Task
 * Execute com: node test-hierarquia.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Tarefa = require('./models/Tarefa');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB
async function conectar() {
  try {
    await mongoose.connect(process.env.DB_URI, {
      dbName: 'todo-app'
    });
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Limpar dados de teste
async function limparDadosTeste() {
  console.log('\n🧹 Limpando dados de teste...');
  await User.deleteMany({ email: 'teste@hierarquia.com' });
  await Project.deleteMany({ name: /^Projeto Teste/ });
  await Tarefa.deleteMany({ titulo: /^Tarefa Teste/ });
  console.log('✅ Dados de teste limpos');
}

// Teste 1: Criar usuário
async function testeCrearUsuario() {
  console.log('\n📝 Teste 1: Criar Usuário');
  
  const hashedPassword = await bcrypt.hash('senha123', 10);
  
  const usuario = new User({
    name: 'Usuário Teste',
    email: 'teste@hierarquia.com',
    password: hashedPassword
  });
  
  await usuario.save();
  console.log('✅ Usuário criado:', usuario._id);
  return usuario;
}

// Teste 2: Criar projetos
async function testeCrearProjetos(usuarioId) {
  console.log('\n📝 Teste 2: Criar Projetos');
  
  const projeto1 = new Project({
    name: 'Projeto Teste 1',
    description: 'Primeiro projeto de teste',
    usuarioId: usuarioId
  });
  
  const projeto2 = new Project({
    name: 'Projeto Teste 2',
    description: 'Segundo projeto de teste',
    usuarioId: usuarioId
  });
  
  await projeto1.save();
  await projeto2.save();
  
  console.log('✅ Projeto 1 criado:', projeto1._id);
  console.log('✅ Projeto 2 criado:', projeto2._id);
  
  return [projeto1, projeto2];
}

// Teste 3: Criar tarefas
async function testeCrearTarefas(usuarioId, projetos) {
  console.log('\n📝 Teste 3: Criar Tarefas');
  
  const tarefas = [];
  
  // Tarefas do projeto 1
  for (let i = 1; i <= 3; i++) {
    const tarefa = new Tarefa({
      titulo: `Tarefa Teste ${i} - Projeto 1`,
      descricao: `Descrição da tarefa ${i}`,
      prioridade: i === 1 ? 'alta' : i === 2 ? 'media' : 'baixa',
      categoria: 'teste',
      usuarioId: usuarioId,
      projectId: projetos[0]._id,
      concluida: i === 1 // Primeira tarefa já concluída
    });
    
    await tarefa.save();
    tarefas.push(tarefa);
    console.log(`✅ Tarefa ${i} criada no Projeto 1:`, tarefa._id);
  }
  
  // Tarefas do projeto 2
  for (let i = 1; i <= 2; i++) {
    const tarefa = new Tarefa({
      titulo: `Tarefa Teste ${i} - Projeto 2`,
      descricao: `Descrição da tarefa ${i}`,
      prioridade: i === 1 ? 'alta' : 'media',
      categoria: 'teste',
      usuarioId: usuarioId,
      projectId: projetos[1]._id,
      concluida: false
    });
    
    await tarefa.save();
    tarefas.push(tarefa);
    console.log(`✅ Tarefa ${i} criada no Projeto 2:`, tarefa._id);
  }
  
  return tarefas;
}

// Teste 4: Buscar tarefas por usuário
async function testeBuscarPorUsuario(usuarioId) {
  console.log('\n📝 Teste 4: Buscar Tarefas por Usuário');
  
  const tarefas = await Tarefa.buscarPorUsuario(usuarioId);
  console.log(`✅ Encontradas ${tarefas.length} tarefas do usuário`);
  
  tarefas.forEach(t => {
    console.log(`   - ${t.titulo} (${t.prioridade}) - Concluída: ${t.concluida}`);
  });
  
  return tarefas;
}

// Teste 5: Buscar tarefas por projeto
async function testeBuscarPorProjeto(projectId, nomeProjeto) {
  console.log(`\n📝 Teste 5: Buscar Tarefas do ${nomeProjeto}`);
  
  const tarefas = await Tarefa.buscarPorProjeto(projectId);
  console.log(`✅ Encontradas ${tarefas.length} tarefas do projeto`);
  
  tarefas.forEach(t => {
    console.log(`   - ${t.titulo} (${t.prioridade})`);
  });
  
  return tarefas;
}

// Teste 6: Buscar tarefas por usuário e projeto
async function testeBuscarPorUsuarioEProjeto(usuarioId, projectId) {
  console.log('\n📝 Teste 6: Buscar Tarefas por Usuário e Projeto');
  
  const tarefas = await Tarefa.buscarPorUsuarioEProjeto(usuarioId, projectId);
  console.log(`✅ Encontradas ${tarefas.length} tarefas`);
  
  return tarefas;
}

// Teste 7: Validar propriedade
async function testeValidarPropriedade(tarefaId, usuarioId, projectId) {
  console.log('\n📝 Teste 7: Validar Propriedade');
  
  const pertenceUsuario = await Tarefa.pertenceAoUsuario(tarefaId, usuarioId);
  const pertenceProjeto = await Tarefa.pertenceAoProjeto(tarefaId, projectId);
  
  console.log(`✅ Tarefa pertence ao usuário: ${pertenceUsuario}`);
  console.log(`✅ Tarefa pertence ao projeto: ${pertenceProjeto}`);
  
  // Testar com ID inválido
  const naoPerteceUsuario = await Tarefa.pertenceAoUsuario(tarefaId, new mongoose.Types.ObjectId());
  console.log(`✅ Tarefa pertence a usuário aleatório: ${naoPerteceUsuario}`);
}

// Teste 8: Atualizar tarefa com validação
async function testeAtualizarComValidacao(tarefaId, usuarioId) {
  console.log('\n📝 Teste 8: Atualizar Tarefa com Validação');
  
  const tarefaAtualizada = await Tarefa.atualizarPorIdEUsuario(tarefaId, usuarioId, {
    titulo: 'Tarefa Atualizada',
    concluida: true,
    prioridade: 'alta'
  });
  
  if (tarefaAtualizada) {
    console.log('✅ Tarefa atualizada com sucesso');
    console.log(`   - Novo título: ${tarefaAtualizada.titulo}`);
    console.log(`   - Concluída: ${tarefaAtualizada.concluida}`);
    console.log(`   - Histórico: ${tarefaAtualizada.historico.length} entradas`);
  } else {
    console.log('❌ Falha ao atualizar tarefa');
  }
  
  // Tentar atualizar com usuário inválido
  const falha = await Tarefa.atualizarPorIdEUsuario(tarefaId, new mongoose.Types.ObjectId(), {
    titulo: 'Não deve funcionar'
  });
  
  console.log(`✅ Tentativa de atualização com usuário inválido: ${falha === null ? 'Bloqueada' : 'Permitida (ERRO)'}`);
}

// Teste 9: Obter estatísticas do projeto
async function testeEstatisticasProjeto(projeto) {
  console.log(`\n📝 Teste 9: Estatísticas do ${projeto.name}`);
  
  const stats = await projeto.getStats();
  
  console.log('✅ Estatísticas:');
  console.log(`   - Total de tarefas: ${stats.totalTasks}`);
  console.log(`   - Tarefas concluídas: ${stats.completedTasks}`);
  console.log(`   - Tarefas pendentes: ${stats.pendingTasks}`);
  console.log(`   - Percentual de conclusão: ${stats.completionPercentage}%`);
}

// Teste 10: Deletar tarefa com validação
async function testeDeletarComValidacao(tarefaId, usuarioId) {
  console.log('\n📝 Teste 10: Deletar Tarefa com Validação');
  
  const tarefaDeletada = await Tarefa.deletarPorIdEUsuario(tarefaId, usuarioId);
  
  if (tarefaDeletada) {
    console.log('✅ Tarefa deletada com sucesso:', tarefaDeletada.titulo);
  } else {
    console.log('❌ Falha ao deletar tarefa');
  }
  
  // Tentar deletar novamente (deve falhar)
  const falha = await Tarefa.deletarPorIdEUsuario(tarefaId, usuarioId);
  console.log(`✅ Tentativa de deletar tarefa já deletada: ${falha === null ? 'Bloqueada' : 'Permitida (ERRO)'}`);
}

// Teste 11: Buscar tarefas com histórico
async function testeBuscarComHistorico(usuarioId) {
  console.log('\n📝 Teste 11: Buscar Tarefas com Histórico');
  
  const tarefas = await Tarefa.buscarTarefasComHistorico(usuarioId);
  console.log(`✅ Encontradas ${tarefas.length} tarefas com histórico`);
  
  tarefas.forEach(t => {
    console.log(`   - ${t.titulo}: ${t.historico.length} alterações`);
  });
}

// Executar todos os testes
async function executarTestes() {
  try {
    await conectar();
    await limparDadosTeste();
    
    console.log('\n' + '='.repeat(60));
    console.log('🚀 INICIANDO TESTES DE HIERARQUIA USER > PROJECT > TASK');
    console.log('='.repeat(60));
    
    // Teste 1: Criar usuário
    const usuario = await testeCrearUsuario();
    
    // Teste 2: Criar projetos
    const projetos = await testeCrearProjetos(usuario._id);
    
    // Teste 3: Criar tarefas
    const tarefas = await testeCrearTarefas(usuario._id, projetos);
    
    // Teste 4: Buscar por usuário
    await testeBuscarPorUsuario(usuario._id);
    
    // Teste 5: Buscar por projeto
    await testeBuscarPorProjeto(projetos[0]._id, projetos[0].name);
    await testeBuscarPorProjeto(projetos[1]._id, projetos[1].name);
    
    // Teste 6: Buscar por usuário e projeto
    await testeBuscarPorUsuarioEProjeto(usuario._id, projetos[0]._id);
    
    // Teste 7: Validar propriedade
    await testeValidarPropriedade(tarefas[0]._id, usuario._id, projetos[0]._id);
    
    // Teste 8: Atualizar com validação
    await testeAtualizarComValidacao(tarefas[1]._id, usuario._id);
    
    // Teste 9: Estatísticas do projeto
    await testeEstatisticasProjeto(projetos[0]);
    await testeEstatisticasProjeto(projetos[1]);
    
    // Teste 10: Deletar com validação
    await testeDeletarComValidacao(tarefas[2]._id, usuario._id);
    
    // Teste 11: Buscar com histórico
    await testeBuscarComHistorico(usuario._id);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB fechada');
  }
}

// Executar
executarTestes();
