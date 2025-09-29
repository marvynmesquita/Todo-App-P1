const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    const now = new Date();
    const currentMonth = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const eventDay = now.toLocaleDateString('pt-BR', { weekday: 'long' });
    const eventDate = now.toLocaleDateString('pt-BR');

    res.render('index', {
        title: 'Home',
        currentMonth,
        days: [],
        eventDay,
        eventDate,
        events: []
    });
});

module.exports = router;
