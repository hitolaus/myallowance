const BASE_URL = 'https://i0156jqmic.execute-api.eu-west-1.amazonaws.com/prod';

async function getTransactions() {
    // TODO: try-catch
    const transactions = await fetch(`${BASE_URL}/transactions`,
        {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json', // This header is CORS-safe
            },
        }
    );
    return transactions.json();
}

async function addTransaction(note, amount) {
    // TODO: try-catch
    const response = await fetch(`${BASE_URL}/transactions`,
        {
            method: 'POST',
            body: JSON.stringify({ note, amount }),
            headers: {
              'Content-Type': 'application/json', // This header is CORS-safe
            },
        }
    );
    return response.json();
}

function inputTransaction(sign) {
    const amountElement = document.getElementById('amount-input');
    const noteElement = document.getElementById('note-input');

    const amount = parseInt(amountElement.value);
    const note = noteElement.value;

    // verify amount is a number and note is a string
    if (isNaN(amount) || amount <= 0) {
        amountElement.focus();
        amountElement.classList.add('error');
        return;
    } else {
        amountElement.classList.remove('error');
    }
        
    if (!note) {
        noteElement.focus();
        noteElement.classList.add('error');
        return;
    } else {
        noteElement.classList.remove('error');
    }

    addTransaction(note, amount * sign)
        .then(() => loadTransactions())
        .then(() => {
            amountElement.value = '';
            noteElement.value = '';

            gotoPage('page-main');
        });
}

function earn() {
    inputTransaction(1);
}

function burn() {
    inputTransaction(-1);
}

function gotoPage(pageId) {
    const activePage = document.querySelector('.page.active');
    const nextPage = document.getElementById(pageId);

    activePage.classList.remove('active');
    nextPage.classList.add('active');
}

Array.from(document.getElementsByClassName('nav-link')).forEach(element => {
    element.addEventListener('click', (e) => {
        const href = e.target.href ?? e.target.parentNode.href;
        const pageId = href?.split('#').pop();

        gotoPage(pageId);

        e.preventDefault();
    }); 
});

let currentPin = [];

Array.from(document.getElementsByClassName('pin-numpad')).forEach(element => {
    element.addEventListener('click', (e) => {
        let activeInput = document.querySelector('.pin-input.active');
        if (!activeInput) {
            return;
        }
        activeInput.classList.remove('active');
        
        if (e.target.innerHTML === '' || e.target.innerHTML.indexOf('delete') > -1) {
            const prevInput = activeInput.previousElementSibling;
            if (prevInput) {
                prevInput.innerHTML = '';
                prevInput.classList.add('active');
                currentPin.pop();
            }
            else {
                activeInput.classList.add('active');
            }
            return;
        }

        const nextInput = activeInput.nextElementSibling;
        activeInput.innerHTML = "*";
        
        currentPin.push(e.target.innerHTML);

        if (!nextInput) {
            // TODO: Hack until backend check is in place
            if (currentPin.join('') === '2012') {
                gotoPage("page-add-transaction");
            }
            // Reset pin
            currentPin = [];
            // Reset input
            document.querySelectorAll('.pin-input').forEach((e) => e.innerHTML = '');
            // Reset active
            document.querySelector('.pin-input').classList.add('active');
            return;
            
        }

        nextInput.classList.add('active');

        e.preventDefault();
    }); 
});

function leftpad(str, len, ch) {
    str = String(str);
    let i = -1;
    if (!ch && ch !== 0) ch = ' ';
    len = len - str.length;
    while (++i < len) {
        str = ch + str;
    }
    return str;
}

function formatDate(date) {
    const d = leftpad(date.getDate(), 2, '0');
    const m = leftpad(date.getMonth() + 1, 2, '0');

    let day;
    switch (date.getDay()) {
        case 0:
            day = 'S&oslash;ndag';
            break;
        case 1:
            day = 'Mandag';
            break;
        case 2:
            day = 'Tirsdag';
            break;
        case 3:
            day = 'Onsdag';
            break;
        case 4:
            day = 'Torsdag';
            break;
        case 5:
            day = 'Fredag';
            break;
        case 6:
            day = 'L&oslash;rdag';
            break;
    }
    return `${day}, ${d}/${m}`;
}

function loadTransactions() {
    getTransactions().then((transactions) => {
        transactions.sort(function(a, b) {
            return (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0);
        })

        const transctionsElement = document.getElementById("transactions");
        transctionsElement.innerHTML = '';

        let total = 0;

        transactions.forEach((transaction) => {
            const element = document.createElement('section');
            element.classList.add('transaction');

            const dateElement = document.createElement('div');
            dateElement.classList.add('transaction--date');
            dateElement.innerHTML = `${formatDate(new Date(transaction.date))}`;

            element.appendChild(dateElement);

            const noteElement = document.createElement('div');
            noteElement.classList.add('transaction--note');
            noteElement.innerHTML = `${transaction.note}`;

            element.appendChild(noteElement);

            const amountElement = document.createElement('div');
            if (transaction.amount > 0) {
                amountElement.classList.add('transaction--income');
            } else {
                amountElement.classList.add('transaction--expense');
            }
            amountElement.innerHTML = `${transaction.amount} kr.`;

            total += transaction.amount;

            element.appendChild(amountElement);

            transctionsElement.append(element);
        });
        
        document.getElementById('total').innerHTML = `${total} kr.`;
    });
}
loadTransactions();