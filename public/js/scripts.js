const calendar = document.querySelector('.calendar'),
    date = document.querySelector('.date'),
    daysContainer = document.querySelector('.days'),
    prev = document.querySelector('.prev'),
    next = document.querySelector('.next'),
    todayBtn = document.querySelector('.today-btn'),
    gotoBtn = document.querySelector('.goto-btn'),
    dateInput = document.querySelector('.date-input');

const eventsList = document.querySelector('.event-list'),
    eventDay = document.querySelector('.event-day'),
    eventDate = document.querySelector('.event-date');

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();
let fetchedHolidays = {}; // Cache para feriados por ano
let userTasks = [];

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const daysFullname = [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

var eventsArray = [
    {
        day: 30,
        month: 1,
        year: 2023,
        events: [
            {
                title: 'O dia que passei desenvolvendo esta aplicação',
                time: '00:00',
            },
        ],
    },
    {
        day: 31,
        month: 1,
        year: 2023,
        events: [
            {
                title: 'Limite de dia para entregar o projeto de lista de tarefas',
                time: '23:59',
            },
        ],
    },
    {
        day: 1,
        month: 2,
        year: 2023,
        events: [
            {
                title: 'Tempo para relaxar... zzzz...',
                time: '00:00',
            },
        ],
    },
];

async function fetchHolidays(yearToFetch) {
    if (fetchedHolidays[yearToFetch]) {
        return fetchedHolidays[yearToFetch];
    }
    try {
        const response = await fetch(`/holidays/${yearToFetch}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const holidays = await response.json();
        fetchedHolidays[yearToFetch] = holidays;
        return holidays;
    } catch (error) {
        console.error("Erro ao buscar feriados:", error);
        return [];
    }
}

// Nova função para buscar tarefas do usuário
async function fetchUserTasks(dateString) {
    console.log('4. URL de requisição para buscar tarefas:', `/tasks/${dateString}`);
    try {
        const response = await fetch(`/tasks/${dateString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        console.log('5. Dados de tarefas recebidos:', tasks);
        return tasks;
    } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        return [];
    }
}

async function initCalendar() {
    const holidays = await fetchHolidays(year);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay();

    date.innerHTML = `${months[month]} ${year}`;
    let daysHtml = "";

    // Dias do mês anterior
    for (let x = day; x > 0; x--) {
        const dayNumber = prevDays - x + 1;
        daysHtml += `<div class="day prev-date">${dayNumber}</div>`;
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDate; i++) {
        const currentDate = new Date(year, month, i);
        const dateString = currentDate.toISOString().split('T')[0];
        const isToday = currentDate.toDateString() === new Date().toDateString();
        const isHoliday = holidays.find(h => h.date === dateString);

        let classList = "day";
        if (isToday) classList += " today";
        if (isHoliday) classList += " holiday";
        
        const holidayName = isHoliday ? isHoliday.name : '';
        const holidayType = isHoliday ? isHoliday.type : '';
        const title = isHoliday ? holidayName : '';

        daysHtml += `<div class="${classList}"
                         data-date="${dateString}"
                         data-holiday="${!!isHoliday}"
                         data-holiday-name="${holidayName}"
                         data-holiday-type="${holidayType}"
                         title="${title}">${i}</div>`;
    }

    // Dias do próximo mês
    for (let j = 1; j < nextDays; j++) {
        daysHtml += `<div class="day next-date">${j}</div>`;
    }

    daysContainer.innerHTML = daysHtml;
    addListener();
}

function prevMonth() {
    if (month === 0) {
        month = 11;
        year--;
    } else {
        month--;
    }
    initCalendar();
}

function nextMonth() {
    if (month === 11) {
        month = 0;
        year++;
    } else {
        month++;
    }
    initCalendar();
}

prev.addEventListener('click', prevMonth);
next.addEventListener('click', nextMonth);

todayBtn.addEventListener('click', () => {
    today = new Date();
    month = today.getMonth();
    year = today.getFullYear();
    activeDay = undefined;
    initCalendar();
    getActiveDay(today.getDate());
    updateEvents(today.getDate());
});

dateInput.addEventListener('input', (e) => {
    dateInput.value = dateInput.value.replace(/[^0-9/]/g, '');
    if (dateInput.value.length === 2) {
        dateInput.value += '/';
    }
    if (dateInput.value.length > 7) {
        dateInput.value = dateInput.value.slice(0, 7);
    }
    if (e.inputType === "deleteContentBackward") {
        if (dateInput.value.length === 3) {
            dateInput.value = dateInput.value.slice(0, 2);
        }
    }
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
    const dateArray = dateInput.value.split('/');
    if (dateArray.length === 2) {
        if (dateArray[0] > 0 && dateArray[0] < 13 && dateArray[1].length === 4) {
            month = dateArray[0] - 1;
            year = dateArray[1];
            initCalendar();
            return;
        }
    }
    alert("Data inválida");
}

function eventCreator() {
    const eventWrapper = document.createElement("div");
    eventWrapper.classList.add("create-event");
    const eventName = document.createElement("input");
    eventName.classList.add('event-input', 'event-name');
    eventName.placeholder = "Nome da tarefa";
    eventWrapper.appendChild(eventName);
    const eventHour = document.createElement("input");
    eventHour.classList.add('event-input', 'event-hour');
    eventHour.placeholder = "Hora da tarefa";
    eventWrapper.appendChild(eventHour);
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add('event-btn-container');
    const cancelButton = document.createElement("button");
    cancelButton.classList.add('event-btn', 'cancel');
    cancelButton.innerHTML = '&#10006;';
    buttonsContainer.appendChild(cancelButton);
    const okBtn = document.createElement("button");
    okBtn.classList.add('event-btn', 'ok');
    okBtn.innerHTML = '&#10003;';
    buttonsContainer.appendChild(okBtn);
    eventWrapper.appendChild(buttonsContainer);
    const addBtn = document.querySelector('.add-event');
    addBtn.remove();
    const eventLi = document.createElement('li');
    eventLi.appendChild(eventWrapper);
    eventsList.appendChild(eventLi);

    eventName.addEventListener('input', (e) => {
        eventName.value = eventName.value.slice(0, 50);
    });
    eventHour.addEventListener('input', (e) => {
        eventHour.value = eventHour.value.replace(/[^0-9:]/g, '');
        if (eventHour.value.length === 2) {
            eventHour.value += ':';
        }
        if (eventHour.value.length > 5) {
            eventHour.value = eventHour.value.slice(0, 5);
        }
        if (e.inputType === "deleteContentBackward") {
            if (eventHour.value.length === 3) {
                eventHour.value = eventHour.value.slice(0, 2);
            }
        }
    });

    okBtn.addEventListener("click", async () => {
        const eventAppendTitle = eventName.value;
        const eventAppendHour = eventHour.value;
        const eventAppendDate = eventDate.innerHTML;
        const [day, monthName, year] = eventAppendDate.split(' ');
        const monthIndex = months.indexOf(monthName);
        const dateString = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        if (eventAppendTitle && eventAppendHour) {
            // Formatar a hora para o padrão HH:MM antes de enviar
            const formattedTime = formatTime(eventAppendHour);

            try {
                const response = await fetch('/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: dateString,
                        title: eventAppendTitle,
                        time: formattedTime
                    })
                });
                if (response.ok) {
                    eventLi.remove();
                    createAddButton();
                    await updateEvents(day); // Chama a função de atualização para recarregar a lista
                } else {
                    console.error('Falha ao adicionar a tarefa.');
                }
            } catch (error) {
                console.error('Erro de rede ao adicionar tarefa:', error);
            }
        }
    });

    cancelButton.addEventListener("click", () => {
        eventLi.remove();
        createAddButton();
    });
}

function createAddButton() {
    const addButton = document.createElement('li');
    addButton.innerHTML = '+';
    addButton.classList.add('add-event');
    eventsList.appendChild(addButton);
    const addDiv = document.querySelector('.add-event');
    addDiv.addEventListener('click', () => eventCreator());
}

function addListener() {
    const days = document.querySelectorAll('.day');
    days.forEach((day) => {
        day.addEventListener('click', async (e) => {
            const dateAttribute = e.target.getAttribute('data-date');
            console.log('1. Atributo data-date do elemento clicado:', dateAttribute);

            const date = new Date(dateAttribute + 'T12:00:00');
            activeDay = date.getDate();
            year = date.getFullYear();
            month = date.getMonth();

            console.log('2. Objeto Date criado (formato string):', date.toString());
            console.log('3. Variáveis de data setadas: dia=', activeDay, 'mês=', month, 'ano=', year);

            days.forEach((day) => {
                day.classList.remove('active');
            });
            e.target.classList.add('active');

            getActiveDay(activeDay);
            await updateEvents(activeDay);
        });
    });
}

function getActiveDay(date) {
    const day = new Date(year, month, date);
    const dayName = daysFullname[day.getDay()];
    eventDay.innerHTML = dayName;
    eventDate.innerHTML = `${date} ${months[month]} ${year}`;
}

async function updateEvents(date) {
    eventsList.innerHTML = '';
    const holidays = await fetchHolidays(year);
    const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    const isHoliday = holidays.find(h => h.date === dateString);

    console.log('6. Buscando eventos para a data:', dateString);

    // Adiciona o feriado como um evento
    if (isHoliday) {
        const holidayLi = document.createElement('li');
        holidayLi.classList.add('filled', 'holiday-item');
        holidayLi.innerHTML = `
            <div class="event-desc">
                <div class="title">${isHoliday.name}</div>
                <div class="hour">${isHoliday.type}</div>
            </div>
        `;
        eventsList.appendChild(holidayLi);
    }
    
    // Buscar tarefas para o dia ativo
    const tasksForActiveDay = await fetchUserTasks(dateString);

    if (tasksForActiveDay.length > 0) {
        tasksForActiveDay.forEach((event) => {
            const eventLiGenerator = document.createElement('li');
            eventLiGenerator.innerHTML = `
                <div class="event-desc">
                    <div class="title">${event.title}</div>
                    <div class="hour">${formatTime(event.time)}</div>
                </div>
            `;
            eventLiGenerator.classList.add('filled');
            eventLiGenerator.dataset.taskId = event.id;
            eventsList.appendChild(eventLiGenerator);
        });
    } else {
        // Se não houver feriados nem tarefas, adicione a mensagem de "Nenhuma tarefa"
        const noTasksLi = document.createElement('li');
        noTasksLi.classList.add('no-tasks');
        noTasksLi.innerHTML = `
            <i class="fas fa-plus-circle"></i>
            <span>Nenhuma tarefa</span>
        `;
        eventsList.appendChild(noTasksLi);
    }

    const allEvents = document.querySelectorAll('.filled');
    allEvents.forEach((event) => {
        if (!event.classList.contains('holiday-item')) {
            event.addEventListener('click', async () => {
                const taskId = event.dataset.taskId;
                try {
                    const response = await fetch(`/tasks/${taskId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        event.remove();
                        // Remover a tarefa do array local
                        userTasks = userTasks.filter(task => task.id !== taskId);
                        // Atualizar a visualização
                        await updateEvents(activeDay);
                    } else {
                        console.error('Falha ao remover a tarefa.');
                    }
                } catch (error) {
                    console.error('Erro de rede ao remover tarefa:', error);
                }
            });
        }
    });

    createAddButton();
}

// Nova função para formatar a hora (adicione ao final do arquivo)
function formatTime(timeStr) {
  // Se a hora já tem dois pontos, retorna como está
  if (timeStr.includes(':')) {
    return timeStr;
  }
  
  // Se for um número de 4 dígitos, insere os dois pontos
  if (timeStr.length === 4 && !isNaN(timeStr)) {
    return timeStr.slice(0, 2) + ':' + timeStr.slice(2);
  }

  return timeStr;
}

initCalendar();
getActiveDay(today.getDate());
updateEvents(today.getDate());