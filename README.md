# 📅 Todo App - Sistema de Autenticação

Um aplicativo de agenda e tarefas com sistema completo de autenticação, desenvolvido com Node.js, Express e EJS.

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- **Registro de usuários** com validação de dados
- **Login seguro** com criptografia de senhas
- **Sessões persistentes** com cookies seguros
- **Proteção de rotas** - acesso apenas para usuários logados
- **Logout** com destruição de sessão

### 📱 Interface Moderna
- **Design responsivo** para desktop e mobile
- **Animações suaves** e transições elegantes
- **Tema escuro** com acentos dourados
- **Validação em tempo real** nos formulários
- **Mensagens de feedback** para o usuário

## 🚀 Como usar

### 1. Instalação
```bash
npm install
```

### 2. Executar a aplicação
```bash
npm start
```

### 3. Acessar no navegador
- **Login:** http://localhost:3000/login
- **Registro:** http://localhost:3000/register
- **App principal:** http://localhost:3000 (após login)

## 📋 Rotas Disponíveis

### Autenticação
- `GET /login` - Página de login
- `POST /login` - Processar login
- `GET /register` - Página de registro
- `POST /register` - Processar registro
- `GET /logout` - Fazer logout
- `POST /logout` - Fazer logout (alternativo)

### Aplicação (Protegidas)
- `GET /` - Página principal do app

## 🛡️ Segurança

- **Senhas criptografadas** com bcryptjs
- **Sessões seguras** com express-session
- **Validação de dados** no servidor
- **Proteção CSRF** com tokens de sessão
- **Cookies HTTPOnly** para segurança

## 🎨 Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Template Engine:** EJS
- **Autenticação:** express-session, bcryptjs
- **Estilização:** CSS3 com variáveis customizadas
- **Ícones:** Font Awesome
- **Validação:** HTML5 + JavaScript

## 📱 Responsividade

O app é totalmente responsivo e funciona perfeitamente em:
- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1400px+)

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)
```bash
PORT=3000
NODE_ENV=production
SESSION_SECRET=sua-chave-secreta-aqui
```

### Estrutura de Arquivos
```
Todo-App-P1/
├── auth.js                 # Rotas de autenticação
├── routes.js              # Rotas principais
├── index.js               # Servidor principal
├── views/
│   ├── auth/
│   │   ├── login.ejs      # Página de login
│   │   └── register.ejs   # Página de registro
│   └── index.ejs          # Página principal
├── public/
│   └── css/
│       ├── style.css      # Estilos principais
│       └── auth.css       # Estilos de autenticação
└── package.json
```

## 🎯 Próximos Passos

- [ ] Integração com banco de dados real
- [ ] Recuperação de senha por email
- [ ] Perfil do usuário
- [ ] Funcionalidades de tarefas
- [ ] Notificações push
- [ ] API REST

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para organizar sua vida!**
