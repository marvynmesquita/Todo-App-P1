//Módulos nativos de Node.js
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');

//Configurar variáveis de ambiente
require('dotenv').config();

//Modulos externos
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuração do MongoDB
const uri = process.env.DB_URI;

// Função para limpar o console e mostrar mensagens
const printMessage = (message) => {
    console.clear();
    console.log(message);
};

// Crie um cliente MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function run() {
  try {
    // Conecte o cliente ao servidor
    await client.connect();
    // Envie um ping para confirmar uma conexão bem-sucedida
    await client.db("admin").command({ ping: 1 });
    db = client.db('todo-app');
    
    // Middleware para arquivos estáticos
    app.use(express.static(path.join(__dirname, 'public'), {
        maxAge: NODE_ENV === 'production' ? '1d' : 0,
        etag: true
    }));

    // Rotas de autenticação
    const { router: authRouter, requireAuth } = require('./auth')(db);
    app.use('/', authRouter);

    // Rotas principais (protegidas)
    const router = require('./routes')(db);
    app.use('/', requireAuth, router);
    
    // Iniciar o servidor Express somente após a conexão com o banco de dados
    app.listen(PORT, () => {
      if(db) {
        printMessage(`
          ---------------------------------------
          🚀 TODO APP iniciado em modo ${NODE_ENV}
          🌎 Servidor rodando em http://localhost:${PORT}
          ✅ Conectado ao MongoDB com sucesso!
          ---------------------------------------
        `);
      } else {
        printMessage(`
          ---------------------------------------
          🚀 TODO APP iniciado em modo ${NODE_ENV}
          🌎 Servidor rodando em http://localhost:${PORT}
          ❌ Falha na conexão com o MongoDB.
          ---------------------------------------
          `);
      }
    });

  } catch (err) {
    printMessage(`Falha na conexão com o MongoDB: ${err}`);
    process.exit(1);
  }
}

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'todo-app-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

//Flash messages
app.use(flash());

//Configuração do motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Inicie a função de conexão
run();