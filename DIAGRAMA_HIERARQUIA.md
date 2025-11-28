# Diagrama da Estrutura User > Project > Task

## Hierarquia de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                          USER                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ _id: ObjectId                                          │ │
│  │ name: String                                           │ │
│  │ email: String (unique, indexed)                        │ │
│  │ password: String (hashed)                              │ │
│  │ createdAt: Date                                        │ │
│  │ updatedAt: Date                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ 1:N                              │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                     PROJECT                            │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ _id: ObjectId                                    │ │ │
│  │  │ name: String                                     │ │ │
│  │  │ description: String                              │ │ │
│  │  │ usuarioId: ObjectId → User._id (indexed)         │ │ │
│  │  │ createdAt: Date                                  │ │ │
│  │  │ updatedAt: Date                                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                       │                                │ │
│  │                       │ 1:N                            │ │
│  │                       ▼                                │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │                  TAREFA                          │ │ │
│  │  │  ┌────────────────────────────────────────────┐ │ │ │
│  │  │  │ _id: ObjectId                              │ │ │ │
│  │  │  │ titulo: String                             │ │ │ │
│  │  │  │ descricao: String                          │ │ │ │
│  │  │  │ prioridade: String (baixa|media|alta)      │ │ │ │
│  │  │  │ concluida: Boolean                         │ │ │ │
│  │  │  │ categoria: String                          │ │ │ │
│  │  │  │ usuarioId: ObjectId → User._id (indexed)   │ │ │ │
│  │  │  │ projectId: ObjectId → Project._id (indexed)│ │ │ │
│  │  │  │ historico: Array[HistoricoEntry]           │ │ │ │
│  │  │  │ createdAt: Date                            │ │ │ │
│  │  │  │ updatedAt: Date                            │ │ │ │
│  │  │  └────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Relacionamentos

### User → Project (1:N)
- Um usuário pode ter **múltiplos** projetos
- Um projeto pertence a **um único** usuário
- Relacionamento via `Project.usuarioId → User._id`

### Project → Tarefa (1:N)
- Um projeto pode ter **múltiplas** tarefas
- Uma tarefa pertence a **um único** projeto
- Relacionamento via `Tarefa.projectId → Project._id`

### User → Tarefa (1:N)
- Um usuário pode ter **múltiplas** tarefas
- Uma tarefa pertence a **um único** usuário
- Relacionamento via `Tarefa.usuarioId → User._id`
- **Importante**: A tarefa também deve pertencer a um projeto do mesmo usuário

## Fluxo de Validação

```
┌──────────────────────────────────────────────────────────────┐
│                    CRIAR TAREFA                               │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Recebe: usuarioId, projectId, dados │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Valida: usuarioId existe?            │
        └──────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                   Sim           Não
                    │             │
                    ▼             ▼
        ┌───────────────┐  ┌──────────────┐
        │ Continua      │  │ Erro 400     │
        └───────────────┘  └──────────────┘
                    │
                    ▼
        ┌──────────────────────────────────────┐
        │ Valida: projectId existe?            │
        └──────────────────────────────────────┘
                    │
             ┌──────┴──────┐
             │             │
            Sim           Não
             │             │
             ▼             ▼
┌────────────────────┐  ┌──────────────┐
│ Continua           │  │ Erro 400     │
└────────────────────┘  └──────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Valida: projeto pertence ao usuário?     │
│ Project.findOne({                        │
│   _id: projectId,                        │
│   usuarioId: usuarioId                   │
│ })                                       │
└──────────────────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
     Sim           Não
      │             │
      ▼             ▼
┌──────────┐  ┌──────────────────────┐
│ Cria     │  │ Erro 404             │
│ Tarefa   │  │ "Projeto não         │
│          │  │  encontrado ou não   │
│          │  │  pertence ao usuário"│
└──────────┘  └──────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ Tarefa criada com sucesso!           │
│ - usuarioId: validado                │
│ - projectId: validado                │
│ - Pertence ao usuário correto        │
└──────────────────────────────────────┘
```

## Índices para Performance

```
User:
  ├─ email: 1 (unique)

Project:
  ├─ usuarioId: 1, createdAt: -1
  
Tarefa:
  ├─ usuarioId: 1, concluida: 1
  ├─ projectId: 1, concluida: 1
  ├─ usuarioId: 1, projectId: 1
  ├─ historico.data: -1
  └─ historico.campo: 1
```

## Operações CRUD com Validação

### CREATE (Criar)
```javascript
// Validações:
// 1. usuarioId é obrigatório
// 2. projectId é obrigatório
// 3. Projeto deve pertencer ao usuário

const tarefa = new Tarefa({
  titulo: "...",
  usuarioId: userId,
  projectId: projectId  // ← Validado que pertence ao userId
});
```

### READ (Ler)
```javascript
// Opções de busca:
// 1. Por usuário: Tarefa.buscarPorUsuario(userId)
// 2. Por projeto: Tarefa.buscarPorProjeto(projectId)
// 3. Por ambos: Tarefa.buscarPorUsuarioEProjeto(userId, projectId)
// 4. Com validação: Tarefa.buscarPorIdEUsuario(taskId, userId)
```

### UPDATE (Atualizar)
```javascript
// Validações:
// 1. usuarioId é obrigatório
// 2. Tarefa deve pertencer ao usuário

const tarefa = await Tarefa.atualizarPorIdEUsuario(
  taskId,
  userId,  // ← Valida propriedade
  { titulo: "Novo título" }
);
```

### DELETE (Deletar)
```javascript
// Validações:
// 1. usuarioId é obrigatório
// 2. Tarefa deve pertencer ao usuário

const tarefa = await Tarefa.deletarPorIdEUsuario(
  taskId,
  userId  // ← Valida propriedade
);
```

## Segurança

### ✅ Proteções Implementadas
- Usuário só pode criar tarefas em seus próprios projetos
- Usuário só pode ver suas próprias tarefas (quando filtrado)
- Usuário só pode atualizar suas próprias tarefas
- Usuário só pode deletar suas próprias tarefas
- Projeto só pode ser associado ao seu dono
- Cascade delete: deletar projeto remove suas tarefas

### ❌ Operações Bloqueadas
- Criar tarefa em projeto de outro usuário → 404
- Atualizar tarefa de outro usuário → 404
- Deletar tarefa de outro usuário → 404
- Ver tarefas de outro usuário (quando validado) → 404

## Exemplo de Uso Completo

```javascript
// 1. Usuário faz login (já existe)
const userId = req.session.userId;

// 2. Criar projeto
const projeto = new Project({
  name: "Meu Projeto",
  usuarioId: userId
});
await projeto.save();

// 3. Criar tarefa no projeto
const tarefa = new Tarefa({
  titulo: "Minha Tarefa",
  usuarioId: userId,
  projectId: projeto._id  // ✅ Validado
});
await tarefa.save();

// 4. Buscar tarefas do usuário
const tarefas = await Tarefa.buscarPorUsuario(userId);

// 5. Atualizar tarefa (com validação)
await Tarefa.atualizarPorIdEUsuario(
  tarefa._id,
  userId,  // ✅ Validado
  { concluida: true }
);

// 6. Deletar tarefa (com validação)
await Tarefa.deletarPorIdEUsuario(
  tarefa._id,
  userId  // ✅ Validado
);
```
