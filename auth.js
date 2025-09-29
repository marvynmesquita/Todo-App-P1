const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Simulação de banco de dados em memória (em produção, use um banco real)
const users = [];

// Middleware para verificar se o usuário está logado
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        req.flash('error', 'Você precisa fazer login para acessar esta página');
        return res.redirect('/login');
    }
};

// Middleware para verificar se o usuário já está logado
const redirectIfLoggedIn = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    return next();
};

// Página de login
router.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('auth/login', { 
        title: 'Login',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Processar login
router.post('/login', redirectIfLoggedIn, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuário por email
        const user = users.find(u => u.email === email);
        
        if (!user) {
            req.flash('error', 'Email ou senha incorretos');
            return res.redirect('/login');
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            req.flash('error', 'Email ou senha incorretos');
            return res.redirect('/login');
        }

        // Criar sessão
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        
        req.flash('success', `Bem-vindo, ${user.name}!`);
        res.redirect('/');
        
    } catch (error) {
        console.error('Erro no login:', error);
        req.flash('error', 'Erro interno do servidor');
        res.redirect('/login');
    }
});

// Página de registro
router.get('/register', redirectIfLoggedIn, (req, res) => {
    res.render('auth/register', { 
        title: 'Registro',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Processar registro
router.post('/register', redirectIfLoggedIn, async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            req.flash('error', 'Todos os campos são obrigatórios');
            return res.redirect('/register');
        }

        if (password !== confirmPassword) {
            req.flash('error', 'As senhas não coincidem');
            return res.redirect('/register');
        }

        if (password.length < 6) {
            req.flash('error', 'A senha deve ter pelo menos 6 caracteres');
            return res.redirect('/register');
        }

        // Verificar se email já existe
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            req.flash('error', 'Este email já está em uso');
            return res.redirect('/register');
        }

        // Criptografar senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Criar novo usuário
        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date()
        };

        users.push(newUser);

        req.flash('success', 'Conta criada com sucesso! Faça login para continuar.');
        res.redirect('/login');

    } catch (error) {
        console.error('Erro no registro:', error);
        req.flash('error', 'Erro interno do servidor');
        res.redirect('/register');
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
        }
        res.redirect('/login');
    });
});

// Logout via GET (para facilitar)
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
        }
        res.redirect('/login');
    });
});

module.exports = { router, requireAuth };

