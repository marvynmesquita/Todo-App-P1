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

const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

const daysList =[
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
]

const daysFullname = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
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
]

function initCalendar() {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay();

    date.innerHTML = months[month] + ' '+ year;


    let days = "";

    for (let x = day; x > 0; x--) {
        let event = false;

        eventsArray.forEach((eventObj) => {
            if (eventObj.day === x &&
            eventObj.month - 1 === month &&
            eventObj.year === year){
                event = true;
            }
        })
        if(event){
            days += `<div class="day prev-date event">${prevDays -x + 1}</div>`;
        } else {
            days += `<div class="day prev-date">${prevDays -x + 1}</div>`;
        }
    }

    for (let i = 1; i <= lastDate; i++) {

        let event = false;

        eventsArray.forEach((eventObj) => {
            if (eventObj.day === i &&
            eventObj.month - 1 === month &&
            eventObj.year === year){
                event = true;
            }
        })

        if (i === new Date().getDate() &&
        year === new Date().getFullYear() &&
        month === new Date().getMonth()){
            if(activeDay === undefined){
                activeDay = i;
                if (event) {
                    days += `<div class="day today active event">${i}</div>`;
                }
                else {
                    days += `<div class="day active today">${i}</div>`;
                }
            }
            else{
                if (event) {
                    days += `<div class="day today event">${i}</div>`;
                }
                else {
                    days += `<div class="day today">${i}</div>`;
                }
            }
        } else {
            if (event) {
                days += `<div class="day event">${i}</div>`;
            }
            else {
                days += `<div class="day">${i}</div>`;
            }
        }
    }

    for (let j = 1; j < nextDays; j++) {
        let event = false;

        eventsArray.forEach((eventObj) => {
            if (eventObj.day === j &&
            eventObj.month - 1 === month &&
            eventObj.year === year){
                event = true;
            }
        })
        if(event){
            days += `<div class="day next-date event">${j}</div>`;
        }
        else {
            days += `<div class="day next-date">${j}</div>`;
        }
    }

    daysContainer.innerHTML = days;
    addListener();
}

initCalendar();
getActiveDay(today.getDate());
updateEvents(today.getDate());

function prevMonth(){
    if (month === 0){
        month = 11;
        year--;
    } else {
        month--;
    }
    initCalendar();
    activeDay = 1;
    updateEvents(activeDay);
    getActiveDay(activeDay);
}

function nextMonth(){
    if (month === 11){
        month = 0;
        year++;
    } else {
        month++;
    }
    initCalendar();
    activeDay = 1;
    updateEvents(activeDay);
    getActiveDay(activeDay);
}

prev.addEventListener('click', prevMonth);
next.addEventListener('click', nextMonth);

todayBtn.addEventListener('click', () => {
    today = new Date();
    month = today.getMonth();
    year = today.getFullYear();
    activeDay = undefined;
    initCalendar();
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
    const dateArray =  dateInput.value.split('/');
    if (dateArray.length === 2) {
        if (dateArray[0] > 0 && dateArray[0] < 13 && dateArray[1].length === 4){
            month = dateArray[0]-1;
            year = dateArray[1];
            initCalendar();
            return;
        }
    }
    alert("Data inválida");
}

function eventCreator () {
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
    eventLi.appendChild(eventWrapper)
    eventsList.appendChild(eventLi);

    eventName.addEventListener('input', (e) => {
        eventName.value = eventName.value.slice(0, 50)
    })
    eventHour.addEventListener('input', (e) => {
        eventHour.value = eventHour.value.replace(/[^0-9:]/g, '')
        if(eventHour.value.length === 2) {
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
    })
    cancelButton.addEventListener("click", () => {
        eventLi.remove();
        createAddButton();
    })
};

function createAddButton() {
    const addButton = document.createElement('li')
    addButton.innerHTML = '+'
    addButton.classList.add('add-event');
    eventsList.appendChild(addButton)
    const addDiv = document.querySelector('.add-event')
    addDiv.addEventListener('click', () => eventCreator())
};

function addListener() {
    const days = document.querySelectorAll('.day');
    days.forEach((day) => {
        day.addEventListener('click', (e) => {
            activeDay = e.target.innerHTML;
            days.forEach((day) => {
                day.classList.remove('active');
            })
            if(e.target.classList.contains('prev-date')){
                prevMonth();
                setTimeout(() =>{
                    const days = document.querySelectorAll('.day')
                    days.forEach((day) => {
                        if(
                            !day.classList.contains('prev-date')&&
                        day.innerHTML === e.target.innerHTML
                        ){
                            day.classList.add('active');
                        }
                    })
                }, 100)
            }
            else if(e.target.classList.contains('next-date')){
                nextMonth();
                setTimeout(() =>{
                    const days = document.querySelectorAll('.day')
                    days.forEach((day) => {
                        if(
                            !day.classList.contains('next-date')&&
                        day.innerHTML === e.target.innerHTML
                        ){
                            day.classList.add('active');
                        }
                    })
                }, 100)
            }
            else{
                e.target.classList.add('active');
            }
            updateEvents(e.target.innerHTML);
            getActiveDay(e.target.innerHTML);
        })})
}

function getActiveDay(date){
    const day = new Date(year, month, date);
    const dayName = daysFullname[day.getDay()];
    eventDay.innerHTML = dayName;
    eventDate.innerHTML = date + ' ' + months[month] + ' ' + year;
}

function updateEvents(date) {
    eventsList.innerHTML = ' '
    date = parseInt(date);
    eventsArray.forEach((evento) => {
        const eventLiGenerator = document.createElement('li');
        if (date === evento.day &&
            month + 1 === evento.month &&
            year === evento.year) {
            evento.events.forEach((event) => {
                eventLiGenerator.innerHTML =
                `
                <div class="event-desc">
                    <div class="title">${event.title}</div>
                    <div class="hour">${event.time}</div>
                </div>
                `
                eventLiGenerator.classList.add('filled');
                eventLiGenerator.id = eventsArray.indexOf(evento);
                eventsList.appendChild(eventLiGenerator);
            });
        }
    })
    const allEvents = document.querySelectorAll('.filled');
    allEvents.forEach((event) => {
        event.addEventListener('click', () => {
            event.classList.add('checked');
            delete eventsArray[event.id];
        })
    })
    createAddButton();
}

const body = document.body;
console.log(body.clientWidth)