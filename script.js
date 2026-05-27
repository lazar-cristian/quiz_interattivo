const iconaSuccesso = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
const iconaErrore = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

const domande = [
    { testo: "Cosa significa l'acronimo HTML?", opzioni: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup", "Home Tool Markup Language"], corretta: 0 },
    { testo: "Quale linguaggio definisce lo stile di una pagina web?", opzioni: ["JavaScript", "Python", "CSS", "C++"], corretta: 2 },
    { testo: "Cos'è un array in JavaScript?", opzioni: ["Una funzione", "Una lista ordinata di valori", "Un elemento HTML", "Un colore CSS"], corretta: 1 },
    { testo: "Quale tag HTML si usa per inserire un'immagine?", opzioni: ["<image>", "<pic>", "<img>", "<src>"], corretta: 2 },
    { testo: "Quale di questi NON è un browser web?", opzioni: ["Chrome", "Firefox", "Linux", "Safari"], corretta: 2 }
];

let indiceDomanda = 0;
let punteggio = 0;

const elDomanda = document.getElementById("domanda");
const elOpzioni = document.getElementById("opzioni");
const btnAzione = document.getElementById("btn-azione");
const elFeedback = document.getElementById("feedback");
const elPunteggio = document.getElementById("punteggio");

function mostraDomanda() {
    elFeedback.innerHTML = "";
    const dCorrente = domande[indiceDomanda];
    elDomanda.textContent = dCorrente.testo;
    elOpzioni.innerHTML = "";
    
    dCorrente.opzioni.forEach((opzione, i) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="scelta" value="${i}"> ${opzione}`;
        elOpzioni.appendChild(label);
    });
    
    btnAzione.textContent = "Conferma Risposta";
}

function verificaRisposta() {
    const scelta = document.querySelector('input[name="scelta"]:checked');
    
    if (!scelta) {
        elFeedback.innerHTML = `${iconaErrore} Seleziona una risposta!`;
        elFeedback.className = "feedback-error";
        return;
    }

    const indiceScelto = parseInt(scelta.value);
    const indiceCorretto = domande[indiceDomanda].corretta;

    if (indiceScelto === indiceCorretto) {
        elFeedback.innerHTML = `${iconaSuccesso} Risposta esatta!`;
        elFeedback.className = "feedback-success";
        punteggio++;
        elPunteggio.textContent = punteggio;
    } else {
        elFeedback.innerHTML = `${iconaErrore} Sbagliato! Era: ${domande[indiceDomanda].opzioni[indiceCorretto]}`;
        elFeedback.className = "feedback-error";
    }

    btnAzione.textContent = "Prossima Domanda";
}

function fineQuiz() {
    elOpzioni.innerHTML = "";
    btnAzione.style.display = "none";
    elDomanda.textContent = "Quiz Terminato!";
    
    if (punteggio >= 4) {
        elFeedback.innerHTML = `${iconaSuccesso} Ottimo lavoro! Sei un esperto nel tuo campo.`;
        elFeedback.className = "feedback-success";
    } else {
        elFeedback.innerHTML = `${iconaErrore} Devi ripassare un po'. Clicca <a href="#">link al materiale di studio</a> per ricominciare.`;
        elFeedback.className = "feedback-error";
    }
}

btnAzione.addEventListener("click", () => {
    if (btnAzione.textContent === "Conferma Risposta") {
        verificaRisposta();
    } else {
        indiceDomanda++;
        if (indiceDomanda < domande.length) {
            mostraDomanda();
        } else {
            fineQuiz();
        }
    }
});

mostraDomanda();
