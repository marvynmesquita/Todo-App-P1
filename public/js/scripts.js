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
        const event = eventsArray.find(e => e.day === dayNumber && e.month - 1 === month - 1 && e.year === year);
        daysHtml += `<div class="day prev-date ${event ? 'event' : ''}">${dayNumber}</div>`;
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDate; i++) {
        const currentDate = new Date(year, month, i);
        const dateString = currentDate.toISOString().split('T')[0];
        const isToday = currentDate.toDateString() === new Date().toDateString();
        const isHoliday = holidays.find(h => h.date === dateString);
        const event = eventsArray.find(e => e.day === i && e.month - 1 === month && e.year === year);

        let classList = "day";
        if (isToday) classList += " today";
        if (event) classList += " event";
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
        const event = eventsArray.find(e => e.day === j && e.month - 1 === month + 1 && e.year === year);
        daysHtml += `<div class="day next-date ${event ? 'event' : ''}">${j}</div>`;
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
    okBtn.addEventListener("click", () => {
        const eventAppendTitle = eventName.value;
        const eventAppendHour = eventHour.value;
        const eventAppendDate = eventDate.innerHTML.split(" ");
        const newEvent = {
            day: parseInt(eventAppendDate[0]),
            month: months.indexOf(eventAppendDate[1]) + 1,
            year: parseInt(eventAppendDate[2]),
            events: [
                {
                    title: eventAppendTitle,
                    time: eventAppendHour,
                },
            ],
        };
        eventsArray.push(newEvent);
        activeDay = eventAppendDate[0];
        updateEvents(activeDay);
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
        day.addEventListener('click', (e) => {
            const date = new Date(e.target.getAttribute('data-date'));
            activeDay = date.getDate();
            year = date.getFullYear();
            month = date.getMonth();

            days.forEach((day) => {
                day.classList.remove('active');
            });
            e.target.classList.add('active');

            updateEvents(activeDay);
            getActiveDay(activeDay);
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
    date = parseInt(date);
    const holidays = await fetchHolidays(year);
    const isHoliday = holidays.find(h => new Date(h.date).getDate() === date && new Date(h.date).getMonth() === month);

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

    // Adiciona os eventos/tarefas
    const filteredEvents = eventsArray.filter(
        evento => date === evento.day && month + 1 === evento.month && year === evento.year
    );

    if (filteredEvents.length > 0) {
        filteredEvents.forEach((evento) => {
            evento.events.forEach((event) => {
                const eventLiGenerator = document.createElement('li');
                eventLiGenerator.innerHTML = `
                    <div class="event-desc">
                        <div class="title">${event.title}</div>
                        <div class="hour">${event.time}</div>
                    </div>
                `;
                eventLiGenerator.classList.add('filled');
                eventLiGenerator.id = eventsArray.indexOf(evento);
                eventsList.appendChild(eventLiGenerator);
            });
        });
    }

    const allEvents = document.querySelectorAll('.filled');
    allEvents.forEach((event) => {
        if (!event.classList.contains('holiday-item')) {
            event.addEventListener('click', () => {
                event.classList.add('checked');
                delete eventsArray[event.id];
            });
        }
    });
    
    // Se não houver feriados nem tarefas, adicione a mensagem de "Nenhuma tarefa"
    if (!isHoliday && filteredEvents.length === 0) {
      const noTasksLi = document.createElement('li');
      noTasksLi.classList.add('no-tasks');
      noTasksLi.innerHTML = `
        <i class="fas fa-plus-circle"></i>
        <span>Nenhuma tarefa</span>
      `;
      eventsList.appendChild(noTasksLi);
    }
    
    createAddButton();
}

initCalendar();
getActiveDay(today.getDate());
updateEvents(today.getDate());