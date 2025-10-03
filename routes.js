const express = require('express');
const holidaysService = require('./services/holidaysService');
const { ObjectId } = require('mongodb'); // Importe ObjectId

// Exporta uma função que recebe o objeto db
module.exports = (db) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            const eventDay = now.toLocaleDateString('pt-BR', { weekday: 'long' });
            const eventDate = now.toLocaleDateString('pt-BR');

            const holidays = await holidaysService.getHolidays(currentYear);
            const days = generateCalendarDays(now, holidays);

            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({ _id: new ObjectId(req.session.userId) });
            const userTasks = user ? user.tasks : [];

            res.render('index', {
                title: 'Home',
                userName: req.session.userName,
                userEmail: req.session.userEmail,
                currentMonth,
                days: days,
                eventDay,
                eventDate,
                events: userTasks,
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
            });
        }
    });

    // Nova rota para buscar tarefas de um usuário para uma data específica
    router.get('/tasks/:date', async (req, res) => {
        try {
            const { date } = req.params;
            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({ _id: new ObjectId(req.session.userId) });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            
            // Encontra as tarefas para a data específica comparando as strings de data
            const tasksForDate = user.tasks.filter(task => {
                return task.date === date;
            });

            res.json(tasksForDate);
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            res.status(500).json({ error: 'Erro ao buscar tarefas.' });
        }
    });

    // Nova rota para adicionar uma tarefa
    router.post('/tasks', async (req, res) => {
        try {
            const { date, title, time } = req.body;
            const newTask = {
                id: Date.now().toString(),
                date: date,
                title: title,
                time: time
            };

            const usersCollection = db.collection('users'); // Usa o `db` recebido
            await usersCollection.updateOne(
                { _id: new ObjectId(req.session.userId) },
                { $push: { tasks: newTask } }
            );

            res.status(201).json(newTask);
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            res.status(500).json({ error: 'Erro ao adicionar tarefa.' });
        }
    });

    // Nova rota para deletar uma tarefa
    router.delete('/tasks/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const usersCollection = db.collection('users'); // Usa o `db` recebido
            await usersCollection.updateOne(
                { _id: new ObjectId(req.session.userId) },
                { $pull: { tasks: { id: id } } }
            );

            res.status(200).json({ message: 'Tarefa removida com sucesso.' });
        } catch (error) {
            console.error('Erro ao remover tarefa:', error);
            res.status(500).json({ error: 'Erro ao remover tarefa.' });
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

    return router;
};