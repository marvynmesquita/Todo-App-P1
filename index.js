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
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.grrmfnw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    console.log("Conectado com sucesso ao MongoDB!");
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
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (err) {
    console.error('Falha na conexão com o MongoDB:', err);
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