# 🎯 Quick Reference - Modelo Tarefa

## 📁 Arquivos Criados

```
models/
  └── Tarefa.js              ← Modelo principal (todas as 5 tarefas)

routes/
  └── tarefaRoutes.js        ← Rotas de teste da API

test-tarefa.js               ← Script de teste automatizado
TAREFA_HISTORICO.md          ← Documentação completa
INSTRUCOES_PROVA.md          ← Instruções de execução
```

## ⚡ Métodos Implementados

### Tarefa 1: adicionarAoHistorico()
```javascript
tarefa.adicionarAoHistorico('titulo', 'Antigo', 'Novo', 'userId');
```

### Tarefa 2: Middleware pre('save')
```javascript
// Automático! Só salvar a tarefa
tarefa.titulo = 'Novo título';
await tarefa.save(); // Histórico atualizado automaticamente
```

### Tarefa 3: buscarTarefasComHistorico()
```javascript
const tarefas = await Tarefa.buscarTarefasComHistorico();
```

### Tarefa 4: obterHistoricoPorCampo()
```javascript
const historico = tarefa.obterHistoricoPorCampo('prioridade');
```

### Tarefa 5: Virtual ultimaAlteracao
```javascript
console.log(tarefa.ultimaAlteracao); // Retorna Date
```

## 🚀 Como Testar

### 1. Configure o .env
```bash
echo "DB_URI=sua-connection-string-aqui" > .env
```

### 2. Inicie o servidor
```bash
npm start
```

### 3. Execute os testes
```bash
node test-tarefa.js
```

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/tarefas` | Criar tarefa |
| PUT | `/api/tarefas/:id` | Atualizar (testa middleware) |
| GET | `/api/tarefas/com-historico` | Buscar com histórico |
| GET | `/api/tarefas/:id/historico/:campo` | Histórico por campo |
| GET | `/api/tarefas/:id/ultima-alteracao` | Última alteração |

## ✅ Status: COMPLETO

Todas as 5 tarefas implementadas e testadas!
