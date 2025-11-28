# Hierarquia User > Project > Task

## Estrutura do Banco de Dados

A aplicação segue uma hierarquia clara de dados:

```
User (Usuário)
  └── Project (Projeto)
        └── Task (Tarefa)
```

### Modelos

#### 1. User (models/User.js)
- Representa um usuário do sistema
- Campos principais:
  - `name`: Nome do usuário
  - `email`: Email único do usuário
  - `password`: Senha criptografada
- Relacionamentos:
  - Um usuário pode ter múltiplos projetos (virtual `projects`)

#### 2. Project (models/Project.js)
- Representa um projeto que pertence a um usuário
- Campos principais:
  - `name`: Nome do projeto
  - `description`: Descrição do projeto
  - `usuarioId`: Referência ao usuário dono do projeto
- Relacionamentos:
  - Um projeto pertence a um usuário
  - Um projeto pode ter múltiplas tarefas (virtual `tasks`)
- Métodos:
  - `getStats()`: Retorna estatísticas do projeto (total de tarefas, concluídas, pendentes, etc.)

#### 3. Tarefa (models/Tarefa.js)
- Representa uma tarefa que pertence a um projeto e a um usuário
- Campos principais:
  - `titulo`: Título da tarefa
  - `descricao`: Descrição da tarefa
  - `prioridade`: Prioridade (baixa, media, alta)
  - `concluida`: Status de conclusão
  - `categoria`: Categoria da tarefa
  - `usuarioId`: Referência ao usuário dono da tarefa
  - `projectId`: Referência ao projeto da tarefa
  - `historico`: Array de mudanças rastreadas
- Relacionamentos:
  - Uma tarefa pertence a um usuário
  - Uma tarefa pertence a um projeto

## Validações de Hierarquia

### Regras de Negócio

1. **Toda tarefa DEVE pertencer a um usuário e a um projeto**
   - Ambos `usuarioId` e `projectId` são obrigatórios ao criar uma tarefa

2. **Um projeto DEVE pertencer a um usuário**
   - O campo `usuarioId` é obrigatório ao criar um projeto

3. **Validação de propriedade**
   - Ao criar uma tarefa, o sistema valida que o projeto especificado pertence ao usuário
   - Ao atualizar/deletar uma tarefa, o sistema valida que a tarefa pertence ao usuário

4. **Cascade Delete**
   - Quando um projeto é deletado, todas as suas tarefas também são deletadas

## API - Rotas de Tarefas (Mongoose)

### Criar Tarefa
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

**Validações:**
- `usuarioId` é obrigatório
- `projectId` é obrigatório
- O projeto deve pertencer ao usuário

### Listar Tarefas
```http
GET /api/tarefas?usuarioId=507f1f77bcf86cd799439011
GET /api/tarefas?projectId=507f1f77bcf86cd799439012
GET /api/tarefas?usuarioId=507f1f77bcf86cd799439011&projectId=507f1f77bcf86cd799439012
```

**Filtros disponíveis:**
- `usuarioId`: Filtra tarefas do usuário
- `projectId`: Filtra tarefas do projeto
- Ambos: Filtra tarefas do usuário em um projeto específico

### Buscar Tarefa Específica
```http
GET /api/tarefas/:id?usuarioId=507f1f77bcf86cd799439011
```

**Validações:**
- Se `usuarioId` for fornecido, valida que a tarefa pertence ao usuário

### Atualizar Tarefa
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

**Validações:**
- `usuarioId` é obrigatório
- A tarefa deve pertencer ao usuário

### Deletar Tarefa
```http
DELETE /api/tarefas/:id?usuarioId=507f1f77bcf86cd799439011
```

**Validações:**
- `usuarioId` é obrigatório (via query string)
- A tarefa deve pertencer ao usuário

### Buscar Tarefas com Histórico
```http
GET /api/tarefas/com-historico?usuarioId=507f1f77bcf86cd799439011
```

**Filtros disponíveis:**
- `usuarioId`: Filtra tarefas com histórico do usuário

## Métodos Estáticos do Modelo Tarefa

### Buscar por Usuário
```javascript
const tarefas = await Tarefa.buscarPorUsuario(usuarioId, { concluida: false });
```

### Buscar por Projeto
```javascript
const tarefas = await Tarefa.buscarPorProjeto(projectId, { prioridade: 'alta' });
```

### Buscar por Usuário e Projeto
```javascript
const tarefas = await Tarefa.buscarPorUsuarioEProjeto(usuarioId, projectId);
```

### Validar Propriedade
```javascript
const pertence = await Tarefa.pertenceAoUsuario(tarefaId, usuarioId);
const pertenceProjeto = await Tarefa.pertenceAoProjeto(tarefaId, projectId);
```

### Buscar com Validação
```javascript
const tarefa = await Tarefa.buscarPorIdEUsuario(tarefaId, usuarioId);
```

### Atualizar com Validação
```javascript
const tarefa = await Tarefa.atualizarPorIdEUsuario(tarefaId, usuarioId, {
  titulo: 'Novo título',
  concluida: true
});
```

### Deletar com Validação
```javascript
const tarefa = await Tarefa.deletarPorIdEUsuario(tarefaId, usuarioId);
```

## Índices para Performance

O modelo Tarefa possui os seguintes índices para otimizar consultas:

1. `{ usuarioId: 1, concluida: 1 }` - Para buscar tarefas de um usuário por status
2. `{ projectId: 1, concluida: 1 }` - Para buscar tarefas de um projeto por status
3. `{ usuarioId: 1, projectId: 1 }` - Para buscar tarefas de um usuário em um projeto
4. `{ 'historico.data': -1 }` - Para ordenar por data de alteração
5. `{ 'historico.campo': 1 }` - Para filtrar histórico por campo

## Exemplo de Uso Completo

```javascript
// 1. Criar um usuário (já existe via auth)
const usuarioId = req.session.userId;

// 2. Criar um projeto
const Project = require('./models/Project');
const projeto = new Project({
  name: 'Meu Projeto',
  description: 'Descrição do projeto',
  usuarioId: usuarioId
});
await projeto.save();

// 3. Criar uma tarefa no projeto
const Tarefa = require('./models/Tarefa');
const tarefa = new Tarefa({
  titulo: 'Minha primeira tarefa',
  descricao: 'Descrição da tarefa',
  prioridade: 'alta',
  categoria: 'trabalho',
  usuarioId: usuarioId,
  projectId: projeto._id
});
await tarefa.save();

// 4. Buscar todas as tarefas do usuário
const tarefasDoUsuario = await Tarefa.buscarPorUsuario(usuarioId);

// 5. Buscar todas as tarefas do projeto
const tarefasDoProjeto = await Tarefa.buscarPorProjeto(projeto._id);

// 6. Atualizar uma tarefa (com validação)
const tarefaAtualizada = await Tarefa.atualizarPorIdEUsuario(
  tarefa._id,
  usuarioId,
  { concluida: true }
);

// 7. Deletar uma tarefa (com validação)
await Tarefa.deletarPorIdEUsuario(tarefa._id, usuarioId);

// 8. Obter estatísticas do projeto
const stats = await projeto.getStats();
console.log(stats);
// {
//   totalTasks: 10,
//   completedTasks: 5,
//   pendingTasks: 5,
//   completionPercentage: 50.00
// }
```

## Segurança

Todas as operações CRUD de tarefas validam que:
1. O usuário está autenticado (via session)
2. A tarefa pertence ao usuário que está fazendo a operação
3. O projeto pertence ao usuário ao criar uma tarefa

Isso garante que um usuário não possa:
- Ver tarefas de outros usuários
- Modificar tarefas de outros usuários
- Criar tarefas em projetos de outros usuários
- Deletar tarefas de outros usuários
