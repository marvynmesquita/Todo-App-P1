//Módulos nativos de Node.js
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const path = require('path');

//Modulos externos
const express = require('express');
const cors = require('cors');

//Configurações do servidor
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Configuração do motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Rota de exemplo
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

//Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});