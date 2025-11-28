# Guia Rápido - API de Tarefas com Hierarquia

## 🚀 Início Rápido

### Executar Testes
```bash
node test-hierarquia.js
```

### Estrutura
```
User (Usuário)
  └── Project (Projeto)
        └── Task (Tarefa)
```

## 📋 Endpoints da API

### 1. Criar Tarefa
```http
POST /api/tarefas
Content-Type: application/json

{
  "titulo": "Minha tarefa",
  "descricao": "Descrição da tarefa",
  "prioridade": "alta",
  "categoria": "trabalho",
  "usuarioId": "507f1f77bcf86cd799439011",
  "projectId": "507f1f77bcf86cd799439012"
}
```
**Validações**: usuarioId e projectId obrigatórios, projeto deve pertencer ao usuário

### 2. Listar Tarefas
```http
# Todas as tarefas de um usuário
GET /api/tarefas?usuarioId=507f1f77bcf86cd799439011

# Todas as tarefas de um projeto
GET /api/tarefas?projectId=507f1f77bcf86cd799439012

# Tarefas de um usuário em um projeto específico
GET /api/tarefas?usuarioId=507f1f77bcf86cd799439011&projectId=507f1f77bcf86cd799439012
```

### 3. Buscar Tarefa Específica
```http
# Sem validação
GET /api/tarefas/:id

# Com validação de propriedade
GET /api/tarefas/:id?usuarioId=507f1f77bcf86cd799439011
```

### 4. Atualizar Tarefa
```http
PUT /api/tarefas/:id
Content-Type: application/json

{
  "titulo": "Título atualizado",
  "prioridade": "media",
  "concluida": true,
  "usuarioId": "507f1f77bcf86cd799439011"
}
```
**Validações**: usuarioId obrigatório, tarefa deve pertencer ao usuário

### 5. Deletar Tarefa
```http
DELETE /api/tarefas/:id?usuarioId=507f1f77bcf86cd799439011
```
**Validações**: usuarioId obrigatório, tarefa deve pertencer ao usuário

### 6. Buscar Tarefas com Histórico
```http
# Todas as tarefas com histórico
GET /api/tarefas/com-historico

# Tarefas com histórico de um usuário
GET /api/tarefas/com-historico?usuarioId=507f1f77bcf86cd799439011
```

### 7. Buscar Histórico de um Campo
```http
GET /api/tarefas/:id/historico/:campo
```
Exemplo: `/api/tarefas/123/historico/prioridade`

### 8. Adicionar Entrada Manual ao Histórico
```http
POST /api/tarefas/:id/historico
Content-Type: application/json

{
  "campo": "prioridade",
  "valorAntigo": "baixa",
  "valorNovo": "alta",
  "usuario": "507f1f77bcf86cd799439011"
}
```

## 💻 Métodos do Modelo Tarefa

### Métodos Estáticos

```javascript
// Buscar por usuário
const tarefas = await Tarefa.buscarPorUsuario(usuarioId);
const tarefas = await Tarefa.buscarPorUsuario(usuarioId, { concluida: false });

// Buscar por projeto
const tarefas = await Tarefa.buscarPorProjeto(projectId);
const tarefas = await Tarefa.buscarPorProjeto(projectId, { prioridade: 'alta' });

// Buscar por usuário e projeto
const tarefas = await Tarefa.buscarPorUsuarioEProjeto(usuarioId, projectId);

// Validar propriedade
const pertence = await Tarefa.pertenceAoUsuario(tarefaId, usuarioId);
const pertence = await Tarefa.pertenceAoProjeto(tarefaId, projectId);

// Buscar com validação
const tarefa = await Tarefa.buscarPorIdEUsuario(tarefaId, usuarioId);

// Atualizar com validação
const tarefa = await Tarefa.atualizarPorIdEUsuario(tarefaId, usuarioId, {
  titulo: 'Novo título',
  concluida: true
});

// Deletar com validação
const tarefa = await Tarefa.deletarPorIdEUsuario(tarefaId, usuarioId);

// Buscar com histórico
const tarefas = await Tarefa.buscarTarefasComHistorico();
const tarefas = await Tarefa.buscarTarefasComHistorico(usuarioId);
```

### Métodos de Instância

```javascript
// Adicionar ao histórico
tarefa.adicionarAoHistorico('prioridade', 'baixa', 'alta', usuarioId);

// Obter histórico por campo
const historico = tarefa.obterHistoricoPorCampo('prioridade');

// Obter histórico ordenado
const historico = tarefa.obterHistoricoOrdenado();

// Resumo do histórico
const resumo = tarefa.resumoHistorico();
// Retorna: { totalAlteracoes, camposAlterados, primeiraAlteracao, ultimaAlteracao }
```

### Virtuals

```javascript
// Última alteração
const data = tarefa.ultimaAlteracao;
// Retorna a data da última entrada no histórico ou createdAt
```

## 💻 Métodos do Modelo Project

```javascript
// Obter estatísticas do projeto
const stats = await projeto.getStats();
// Retorna: { totalTasks, completedTasks, pendingTasks, completionPercentage }
```

## 🔒 Validações de Segurança

### ✅ O que é validado:
- Tarefa deve ter usuarioId e projectId
- Projeto deve pertencer ao usuário ao criar tarefa
- Tarefa deve pertencer ao usuário ao atualizar
- Tarefa deve pertencer ao usuário ao deletar
- Projeto é deletado → tarefas são deletadas (cascade)

### ❌ O que é bloqueado:
- Criar tarefa em projeto de outro usuário
- Atualizar tarefa de outro usuário
- Deletar tarefa de outro usuário
- Ver tarefas de outro usuário (quando validado)

## 📊 Campos da Tarefa

```javascript
{
  _id: ObjectId,                    // ID único
  titulo: String,                   // Obrigatório, 3-200 caracteres
  descricao: String,                // Opcional, max 1000 caracteres
  prioridade: String,               // 'baixa' | 'media' | 'alta'
  concluida: Boolean,               // Default: false
  categoria: String,                // Opcional, max 100 caracteres
  dataVencimento: Date,             // Opcional
  usuarioId: ObjectId,              // Obrigatório, ref: User
  projectId: ObjectId,              // Obrigatório, ref: Project
  historico: [HistoricoEntry],      // Array de mudanças
  createdAt: Date,                  // Auto-gerado
  updatedAt: Date                   // Auto-atualizado
}
```

## 📊 Campos do Histórico

```javascript
{
  campo: String,                    // Nome do campo alterado
  valorAntigo: Mixed,               // Valor anterior
  valorNovo: Mixed,                 // Novo valor
  data: Date,                       // Data da alteração
  usuario: String                   // ID do usuário que alterou
}
```

## 🎯 Prioridades

- `baixa` - Prioridade baixa
- `media` - Prioridade média (default)
- `alta` - Prioridade alta

## 📝 Exemplos de Uso

### Criar e Gerenciar Tarefas

```javascript
// 1. Criar projeto
const projeto = new Project({
  name: 'Meu Projeto',
  description: 'Descrição',
  usuarioId: userId
});
await projeto.save();

// 2. Criar tarefa
const tarefa = new Tarefa({
  titulo: 'Minha Tarefa',
  descricao: 'Descrição da tarefa',
  prioridade: 'alta',
  categoria: 'trabalho',
  usuarioId: userId,
  projectId: projeto._id
});
await tarefa.save();

// 3. Buscar tarefas do usuário
const minhasTarefas = await Tarefa.buscarPorUsuario(userId);

// 4. Buscar tarefas do projeto
const tarefasDoProjeto = await Tarefa.buscarPorProjeto(projeto._id);

// 5. Atualizar tarefa
const atualizada = await Tarefa.atualizarPorIdEUsuario(
  tarefa._id,
  userId,
  { concluida: true, prioridade: 'media' }
);

// 6. Ver histórico
console.log(atualizada.historico);
// Mostra as mudanças de prioridade e concluida

// 7. Obter estatísticas do projeto
const stats = await projeto.getStats();
console.log(`${stats.completionPercentage}% concluído`);

// 8. Deletar tarefa
await Tarefa.deletarPorIdEUsuario(tarefa._id, userId);
```

### Filtrar Tarefas

```javascript
// Tarefas não concluídas do usuário
const pendentes = await Tarefa.buscarPorUsuario(userId, { concluida: false });

// Tarefas de alta prioridade do projeto
const urgentes = await Tarefa.buscarPorProjeto(projectId, { prioridade: 'alta' });

// Tarefas concluídas do usuário em um projeto
const concluidas = await Tarefa.buscarPorUsuarioEProjeto(
  userId,
  projectId,
  { concluida: true }
);
```

## 🔍 Respostas da API

### Sucesso (200/201)
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "tarefa": { ... },
  "tarefas": [ ... ]
}
```

### Erro (400/404/500)
```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "Detalhes técnicos"
}
```

## 📚 Documentação Adicional

- `HIERARQUIA_USER_PROJECT_TASK.md` - Documentação completa
- `DIAGRAMA_HIERARQUIA.md` - Diagramas visuais
- `RESUMO_ALTERACOES.md` - Resumo das mudanças
- `test-hierarquia.js` - Testes automatizados

## 🧪 Testar a API

### Com cURL
```bash
# Criar tarefa
curl -X POST http://localhost:3000/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Minha tarefa",
    "usuarioId": "507f1f77bcf86cd799439011",
    "projectId": "507f1f77bcf86cd799439012"
  }'

# Listar tarefas
curl http://localhost:3000/api/tarefas?usuarioId=507f1f77bcf86cd799439011

# Atualizar tarefa
curl -X PUT http://localhost:3000/api/tarefas/123 \
  -H "Content-Type: application/json" \
  -d '{
    "concluida": true,
    "usuarioId": "507f1f77bcf86cd799439011"
  }'

# Deletar tarefa
curl -X DELETE "http://localhost:3000/api/tarefas/123?usuarioId=507f1f77bcf86cd799439011"
```

### Com Postman/Insomnia
Importe a coleção de exemplos ou use os endpoints acima.

## ⚡ Performance

### Índices Criados
- `User.email` - Busca rápida por email
- `Project.usuarioId + createdAt` - Listar projetos do usuário
- `Tarefa.usuarioId + concluida` - Filtrar tarefas por status
- `Tarefa.projectId + concluida` - Filtrar tarefas do projeto
- `Tarefa.usuarioId + projectId` - Busca combinada

### Dicas de Performance
- Use filtros sempre que possível
- Evite buscar todas as tarefas sem filtro
- Use paginação para grandes volumes
- Aproveite os índices nas queries

## 🐛 Troubleshooting

### Erro: "Projeto não encontrado ou não pertence ao usuário"
- Verifique se o projectId está correto
- Verifique se o projeto pertence ao usuário
- Confirme que o projeto existe no banco

### Erro: "Tarefa não encontrada ou não pertence ao usuário"
- Verifique se o tarefaId está correto
- Verifique se a tarefa pertence ao usuário
- Confirme que a tarefa existe no banco

### Erro: "O ID do usuário é obrigatório"
- Adicione o campo usuarioId no body (POST/PUT)
- Adicione o parâmetro usuarioId na query string (DELETE/GET)

### Erro: "O ID do projeto é obrigatório"
- Adicione o campo projectId no body ao criar tarefa
