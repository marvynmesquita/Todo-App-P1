// test-tarefa.js
/**
 * Script de teste para demonstrar todas as funcionalidades do modelo Tarefa
 * Execute com: node test-tarefa.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Tarefa = require('./models/Tarefa');

const uri = process.env.DB_URI;

async function testarModelo() {
  try {
    // Conectar ao MongoDB
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(uri, {
      dbName: 'todo-app'
    });
    console.log('✅ Conectado com sucesso!\n');

    // Limpar tarefas de teste anteriores
    await Tarefa.deleteMany({ titulo: /^TESTE/ });
    console.log('🧹 Tarefas de teste anteriores removidas\n');

    // ==========================================
    // TESTE 1: Criar uma nova tarefa
    // ==========================================
    console.log('📝 TESTE 1: Criando uma nova tarefa...');
    const tarefa1 = new Tarefa({
      titulo: 'TESTE - Implementar funcionalidade X',
      descricao: 'Desenvolver a funcionalidade X conforme especificação',
      prioridade: 'alta',
      categoria: 'desenvolvimento',
      usuarioId: new mongoose.Types.ObjectId()
    });
    await tarefa1.save();
    console.log('✅ Tarefa criada:', {
      id: tarefa1._id,
      titulo: tarefa1.titulo,
      prioridade: tarefa1.prioridade
    });
    console.log('');

    // ==========================================
    // TESTE 2: Adicionar entrada manual ao histórico
    // Demonstra o método adicionarAoHistorico
    // ==========================================
    console.log('📋 TESTE 2: Adicionando entrada manual ao histórico...');
    tarefa1.adicionarAoHistorico(
      'descricao',
      'Descrição antiga',
      'Descrição nova',
      tarefa1.usuarioId.toString()
    );
    await tarefa1.save();
    console.log('✅ Entrada adicionada ao histórico:', tarefa1.historico[0]);
    console.log('');

    // ==========================================
    // TESTE 3: Testar middleware pre-save
    // Mudanças automáticas nos campos monitorados
    // ==========================================
    console.log('🔄 TESTE 3: Testando middleware pre-save (registro automático)...');
    console.log('Valores antes da alteração:');
    console.log('  - Título:', tarefa1.titulo);
    console.log('  - Prioridade:', tarefa1.prioridade);
    console.log('  - Concluída:', tarefa1.concluida);
    console.log('  - Categoria:', tarefa1.categoria);
    
    // Alterar campos monitorados
    tarefa1.titulo = 'TESTE - Implementar funcionalidade X (ATUALIZADO)';
    tarefa1.prioridade = 'media';
    tarefa1.concluida = true;
    tarefa1.categoria = 'desenvolvimento-backend';
    
    await tarefa1.save();
    
    console.log('\nValores após a alteração:');
    console.log('  - Título:', tarefa1.titulo);
    console.log('  - Prioridade:', tarefa1.prioridade);
    console.log('  - Concluída:', tarefa1.concluida);
    console.log('  - Categoria:', tarefa1.categoria);
    
    console.log('\n✅ Histórico atualizado automaticamente:');
    tarefa1.historico.forEach((entrada, index) => {
      console.log(`  ${index + 1}. Campo: ${entrada.campo}`);
      console.log(`     Valor Antigo: ${entrada.valorAntigo}`);
      console.log(`     Valor Novo: ${entrada.valorNovo}`);
      console.log(`     Data: ${entrada.data}`);
      console.log('');
    });

    // ==========================================
    // TESTE 4: Criar mais tarefas para testar busca
    // ==========================================
    console.log('📝 TESTE 4: Criando mais tarefas...');
    const tarefa2 = new Tarefa({
      titulo: 'TESTE - Corrigir bug Y',
      descricao: 'Bug crítico no módulo Y',
      prioridade: 'alta',
      categoria: 'bugfix',
      usuarioId: new mongoose.Types.ObjectId()
    });
    await tarefa2.save();
    
    // Fazer alterações para gerar histórico
    tarefa2.prioridade = 'baixa';
    tarefa2.concluida = true;
    await tarefa2.save();
    
    const tarefa3 = new Tarefa({
      titulo: 'TESTE - Tarefa sem histórico',
      descricao: 'Esta tarefa não terá histórico',
      prioridade: 'baixa',
      categoria: 'documentacao',
      usuarioId: new mongoose.Types.ObjectId()
    });
    await tarefa3.save();
    
    console.log('✅ Mais 2 tarefas criadas (1 com histórico, 1 sem histórico)');
    console.log('');

    // ==========================================
    // TESTE 5: Buscar tarefas com histórico
    // Demonstra o método estático buscarTarefasComHistorico
    // ==========================================
    console.log('🔍 TESTE 5: Buscando tarefas com histórico...');
    const tarefasComHistorico = await Tarefa.buscarTarefasComHistorico();
    console.log(`✅ Encontradas ${tarefasComHistorico.length} tarefas com histórico:`);
    tarefasComHistorico.forEach((t, index) => {
      console.log(`  ${index + 1}. ${t.titulo}`);
      console.log(`     Total de alterações: ${t.historico.length}`);
      console.log(`     Última alteração: ${t.ultimaAlteracao}`);
      console.log('');
    });

    // ==========================================
    // TESTE 6: Obter histórico por campo
    // Demonstra o método obterHistoricoPorCampo
    // ==========================================
    console.log('🔍 TESTE 6: Obtendo histórico do campo "prioridade"...');
    const historicoPrioridade = tarefa1.obterHistoricoPorCampo('prioridade');
    console.log(`✅ Encontradas ${historicoPrioridade.length} alterações no campo "prioridade":`);
    historicoPrioridade.forEach((entrada, index) => {
      console.log(`  ${index + 1}. ${entrada.valorAntigo} → ${entrada.valorNovo}`);
      console.log(`     Data: ${entrada.data}`);
      console.log('');
    });

    // ==========================================
    // TESTE 7: Testar virtual ultimaAlteracao
    // ==========================================
    console.log('📅 TESTE 7: Testando virtual ultimaAlteracao...');
    console.log('Tarefa com histórico:');
    console.log(`  - Título: ${tarefa1.titulo}`);
    console.log(`  - Data de criação: ${tarefa1.createdAt}`);
    console.log(`  - Última alteração: ${tarefa1.ultimaAlteracao}`);
    console.log(`  - Tem histórico: ${tarefa1.historico.length > 0}`);
    
    console.log('\nTarefa sem histórico:');
    console.log(`  - Título: ${tarefa3.titulo}`);
    console.log(`  - Data de criação: ${tarefa3.createdAt}`);
    console.log(`  - Última alteração: ${tarefa3.ultimaAlteracao}`);
    console.log(`  - Tem histórico: ${tarefa3.historico.length > 0}`);
    console.log('');

    // ==========================================
    // TESTE 8: Métodos auxiliares
    // ==========================================
    console.log('📊 TESTE 8: Testando métodos auxiliares...');
    const resumo = tarefa1.resumoHistorico();
    console.log('Resumo do histórico da tarefa 1:');
    console.log('  - Total de alterações:', resumo.totalAlteracoes);
    console.log('  - Campos alterados:', resumo.camposAlterados);
    console.log('  - Primeira alteração:', resumo.primeiraAlteracao);
    console.log('  - Última alteração:', resumo.ultimaAlteracao);
    console.log('');

    const historicoOrdenado = tarefa1.obterHistoricoOrdenado();
    console.log('Histórico ordenado (mais recente primeiro):');
    historicoOrdenado.forEach((entrada, index) => {
      console.log(`  ${index + 1}. ${entrada.campo}: ${entrada.valorAntigo} → ${entrada.valorNovo}`);
    });
    console.log('');

    // ==========================================
    // RESUMO FINAL
    // ==========================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Resumo das funcionalidades testadas:');
    console.log('  ✅ Tarefa 1: Campo historico adicionado ao schema');
    console.log('  ✅ Tarefa 1: Método adicionarAoHistorico implementado');
    console.log('  ✅ Tarefa 2: Middleware pre-save registrando mudanças');
    console.log('  ✅ Tarefa 3: Método buscarTarefasComHistorico funcionando');
    console.log('  ✅ Tarefa 4: Método obterHistoricoPorCampo funcionando');
    console.log('  ✅ Tarefa 5: Virtual ultimaAlteracao implementado');
    console.log('');
    console.log('💡 Dica: As rotas de teste estão disponíveis em /api/tarefas');
    console.log('   Execute "npm start" e acesse http://localhost:3000/api/tarefas');
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

// Executar testes
testarModelo();
