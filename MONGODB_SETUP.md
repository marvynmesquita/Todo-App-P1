# 🔧 Guia de Configuração do MongoDB

## ⚠️ IMPORTANTE: Configure o MongoDB antes de executar o projeto!

O arquivo `.env` foi criado, mas você precisa configurar a connection string do MongoDB.

---

## 🌐 Opção 1: MongoDB Atlas (Recomendado - Grátis)

### Passo a Passo:

1. **Acesse**: https://www.mongodb.com/cloud/atlas

2. **Crie uma conta gratuita** (se ainda não tiver)

3. **Crie um cluster gratuito**:
   - Clique em "Build a Database"
   - Escolha "M0 Free"
   - Selecione uma região próxima (ex: São Paulo)
   - Clique em "Create"

4. **Configure o acesso**:
   - **Database Access**: Crie um usuário com senha
     - Username: `todoapp`
     - Password: Crie uma senha forte (anote!)
   - **Network Access**: Adicione seu IP
     - Clique em "Add IP Address"
     - Escolha "Allow Access from Anywhere" (0.0.0.0/0)

5. **Obtenha a Connection String**:
   - Volte para "Database"
   - Clique em "Connect"
   - Escolha "Connect your application"
   - Copie a connection string
   - Exemplo: `mongodb+srv://todoapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Configure o .env**:
   ```bash
   # Abra o arquivo .env e substitua a linha DB_URI:
   DB_URI=mongodb+srv://todoapp:SUA_SENHA_AQUI@cluster0.xxxxx.mongodb.net/todo-app?retryWrites=true&w=majority
   ```
   
   **IMPORTANTE**: 
   - Substitua `<password>` pela senha que você criou
   - Substitua `cluster0.xxxxx` pelo seu cluster real
   - Adicione `/todo-app` antes do `?` para especificar o banco de dados

---

## 💻 Opção 2: MongoDB Local

### Se você já tem o MongoDB instalado localmente:

1. **Verifique se o MongoDB está rodando**:
   ```bash
   # No macOS com Homebrew:
   brew services list | grep mongodb
   
   # Se não estiver rodando, inicie:
   brew services start mongodb-community
   ```

2. **Configure o .env**:
   ```bash
   # Abra o arquivo .env e use:
   DB_URI=mongodb://localhost:27017/todo-app
   ```

### Se você NÃO tem o MongoDB instalado:

```bash
# Instalar no macOS com Homebrew:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## ✅ Verificar a Configuração

Após configurar o `.env`, teste a conexão:

```bash
# Inicie o servidor
npm start
```

Você deve ver:
```
✅ Conectado ao MongoDB com sucesso!
✅ Mongoose conectado com sucesso!
🚀 TODO APP iniciado em modo development
🌎 Servidor rodando em http://localhost:3000
```

---

## 🧪 Executar os Testes

Depois que o servidor estiver funcionando:

```bash
# Em outro terminal, execute:
node test-tarefa.js
```

---

## 🆘 Problemas Comuns

### Erro: "connect ECONNREFUSED"
- **Causa**: MongoDB não está rodando ou connection string incorreta
- **Solução**: 
  - Verifique se o MongoDB local está rodando OU
  - Verifique se a connection string do Atlas está correta

### Erro: "Authentication failed"
- **Causa**: Usuário/senha incorretos
- **Solução**: Verifique as credenciais no MongoDB Atlas

### Erro: "IP not whitelisted"
- **Causa**: Seu IP não está autorizado no MongoDB Atlas
- **Solução**: Adicione seu IP em "Network Access" no Atlas

---

## 📝 Exemplo de .env Configurado

### Com MongoDB Atlas:
```env
DB_URI=mongodb+srv://todoapp:MinhaSenh@123@cluster0.abc123.mongodb.net/todo-app?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
SESSION_SECRET=todo-app-secret-key-2024-prova-p1
INVERT=SEUTOKEN
```

### Com MongoDB Local:
```env
DB_URI=mongodb://localhost:27017/todo-app
PORT=3000
NODE_ENV=development
SESSION_SECRET=todo-app-secret-key-2024-prova-p1
INVERT=SEUTOKEN
```

---

## 🎯 Próximos Passos

1. ✅ Configure o `.env` com sua connection string
2. ✅ Execute `npm start`
3. ✅ Execute `node test-tarefa.js`
4. ✅ Teste as rotas da API em `http://localhost:3000/api/tarefas`

---

## 💡 Dica

Use o **MongoDB Atlas** (opção 1) se você:
- Não tem MongoDB instalado localmente
- Quer uma solução rápida e gratuita
- Precisa acessar o banco de dados de qualquer lugar

Use o **MongoDB Local** (opção 2) se você:
- Já tem MongoDB instalado
- Prefere trabalhar offline
- Tem experiência com MongoDB local
