const express = require('express');
const holidaysService = require('./services/holidaysService');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        const eventDay = now.toLocaleDateString('pt-BR', { weekday: 'long' });
        const eventDate = now.toLocaleDateString('pt-BR');

        // Buscar feriados do ano atual
        const holidays = await holidaysService.getHolidays(currentYear);
        
        // Gerar dias do calendário com feriados
        const days = generateCalendarDays(now, holidays);

        res.render('index', {
            title: 'Home',
            userName: req.session.userName,
            userEmail: req.session.userEmail,
            currentMonth,
            days: days,
            eventDay,
            eventDate,
            events: [],
            holidays: holidays
        });
    } catch (error) {
        console.error('Erro ao carregar página principal:', error);
        const now = new Date();
        res.render('index', {
            title: 'Home',
            userName: req.session.userName,
            userEmail: req.session.userEmail,
            currentMonth: now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
            days: generateCalendarDays(now, []),
            eventDay: now.toLocaleDateString('pt-BR', { weekday: 'long' }),
            eventDate: now.toLocaleDateString('pt-BR'),
            events: [],
            holidays: []
        });
    }
});

// Rota para buscar feriados de um ano específico
router.get('/holidays/:year', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const holidays = await holidaysService.getHolidays(year);
        res.json(holidays);
    } catch (error) {
        console.error('Erro ao buscar feriados:', error);
        res.status(500).json({ error: 'Erro ao buscar feriados' });
    }
});

/**
 * Gera os dias do calendário com informações de feriados
 * @param {Date} date - Data de referência
 * @param {Array} holidays - Array de feriados
 * @returns {Array} Array de dias do calendário
 */
function generateCalendarDays(date, holidays) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = domingo, 1 = segunda, etc.)
    const firstDayWeekday = firstDay.getDay();
    
    // Número de dias no mês
    const daysInMonth = lastDay.getDate();
    
    // Número de dias do mês anterior para preencher
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const days = [];
    
    // Adicionar dias do mês anterior
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const dayNumber = daysInPrevMonth - i;
        days.push({
            number: dayNumber,
            isCurrentMonth: false,
            isToday: false,
            isHoliday: false,
            holidayName: null,
            holidayType: null,
            date: new Date(year, month - 1, dayNumber).toISOString().split('T')[0]
        });
    }
    
    // Adicionar dias do mês atual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateString = currentDate.toISOString().split('T')[0];
        const isToday = currentDate.toDateString() === today.toDateString();
        
        // Verificar se é feriado
        const holiday = holidays.find(h => h.date === dateString);
        
        days.push({
            number: day,
            isCurrentMonth: true,
            isToday: isToday,
            isHoliday: !!holiday,
            holidayName: holiday ? holiday.name : null,
            holidayType: holiday ? holiday.type : null,
            date: dateString
        });
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias = 42
    for (let day = 1; day <= remainingDays; day++) {
        days.push({
            number: day,
            isCurrentMonth: false,
            isToday: false,
            isHoliday: false,
            holidayName: null,
            holidayType: null,
            date: new Date(year, month + 1, day).toISOString().split('T')[0]
        });
    }
    
    return days;
}

module.exports = router;
