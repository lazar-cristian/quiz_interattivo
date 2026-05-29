// ==========================================
// FASE 4: Modifica Autonoma e Personalizzazione
// ==========================================
const domandeQuiz = [
    {
        domanda: "Chi ha vinto il Mondiale di calcio nel 2006?",
        opzioni: ["Francia", "Italia", "Brasile", "Germania"],
        opzioni: ["Francia", "Italia", "Brasile", "Marocco"],
        rispostaCorretta: 1 // L'indice della risposta corretta (0-based, quindi 1 è "Italia")
    },
    {
        domanda: "Quale squadra di club ha vinto più Champions League?",
        opzioni: ["Milan", "Barcellona", "Real Madrid", "Bayern Monaco"],
        opzioni: ["Milan", "Mappanese", "Real Madrid", "Bayern Monaco"],
        rispostaCorretta: 2 // 2 è "Real Madrid"
    },
    {
        domanda: "Quanti giocatori compongono una squadra di calcio in campo?",
        opzioni: ["9", "10", "11", "12"],
        rispostaCorretta: 2 // 2 è "11"
    },
    {
        domanda: "Chi è soprannominato 'La Pulce'?",
        opzioni: ["Cristiano Ronaldo", "Diego Maradona", "Pelé", "Lionel Messi"],
        opzioni: ["Christian Cianni", "Umberto fadda", "Alessandro Valido", "Lionel Messi"],
        rispostaCorretta: 3 // 3 è "Lionel Messi"
    },
    {
        domanda: "In quale città si trova lo stadio Santiago Bernabéu?",
        opzioni: ["Barcellona", "Madrid", "Siviglia", "Valencia"],
        opzioni: ["Barcellona", "Madrid", "Siviglia", "Leinì"],
        rispostaCorretta: 1 // 1 è "Madrid"
    }
];

// Variabili per tenere traccia dello stato del quiz
let indiceDomandaCorrente = 0; // Parte dalla prima domanda (indice 0)
let punteggio = 0; // Il punteggio iniziale è 0

// Elementi HTML recuperati tramite il loro ID per poterli modificare
const elementoDomanda = document.getElementById("titolo-domanda");
const contenitoreOpzioni = document.getElementById("opzioni");
const pulsanteControlla = document.getElementById("btn-controlla");
const elementoFeedback = document.getElementById("feedback");
const elementoPunteggio = document.getElementById("punteggio");

// ==========================================
// FASE 3: Aggiungere JavaScript per il Controllo
// ==========================================

// Funzione per mostrare la domanda corrente sullo schermo
function mostraDomanda() {
    // 1. Puliamo il feedback della domanda precedente
    elementoFeedback.textContent = "";
    
    // 2. Prendiamo la domanda corrente dall'array usando l'indice
    const domandaAttuale = domandeQuiz[indiceDomandaCorrente];
    
    // 3. Inseriamo il testo della domanda nel tag h2
    elementoDomanda.textContent = domandaAttuale.domanda;
    
    // 4. Svuotiamo il contenitore delle opzioni HTML per togliere quelle vecchie
    contenitoreOpzioni.innerHTML = "";
    
    // 5. Creiamo le 4 opzioni di risposta usando un ciclo for
    for (let i = 0; i < domandaAttuale.opzioni.length; i++) {
        // Creiamo una etichetta (label) per ogni opzione
        const etichetta = document.createElement("label");
        etichetta.classList.add("opzione");
        
        // Creiamo il radio button
        const radioButton = document.createElement("input");
        radioButton.type = "radio"; // Impostiamo il tipo come radio button
        radioButton.name = "scelta"; // Diamo lo stesso nome per raggrupparli (se ne può scegliere solo uno)
        radioButton.value = i; // Il valore sarà l'indice (0, 1, 2 o 3)
        
        // Aggiungiamo il radio button e il testo dell'opzione dentro l'etichetta
        etichetta.appendChild(radioButton);
        etichetta.append(" " + domandaAttuale.opzioni[i]);
        
        // Aggiungiamo l'etichetta finita nel contenitore HTML sulla pagina
        contenitoreOpzioni.appendChild(etichetta);
    }
    
    // 6. Cambiamo il testo del pulsante per permettere il controllo
    pulsanteControlla.textContent = "Controlla Risposta";
}

// Funzione per controllare la risposta selezionata dall'utente e dare feedback
function controllaRisposta() {
    // Se il testo del pulsante è "Prossima Domanda", significa che abbiamo già risposto e vogliamo andare avanti
    if (pulsanteControlla.textContent === "Prossima Domanda") {
        indiceDomandaCorrente++; // Incrementiamo l'indice per andare alla domanda successiva
        
        // Controlliamo se ci sono ancora domande nell'array
        if (indiceDomandaCorrente < domandeQuiz.length) {
            mostraDomanda(); // Mostriamo la nuova domanda
        } else {
            mostraRisultatoFinale(); // Se le domande sono finite, mostriamo il risultato finale
        }
        return; // Usciamo dalla funzione per non eseguire il controllo di nuovo
    }

    // Troviamo quale radio button è stato effettivamente selezionato (checked)
    const rispostaSelezionata = document.querySelector('input[name="scelta"]:checked');
    
    // Se l'utente non ha selezionato nulla, diamo un avviso testuale
    if (!rispostaSelezionata) {
        elementoFeedback.textContent = "Per favore, seleziona una risposta prima di controllare!";
        elementoFeedback.style.color = "orange";
        return; // Usciamo dalla funzione
    }
    
    // Prendiamo il valore della risposta scelta (che è l'indice) e lo convertiamo in numero intero (parseInt)
    const indiceScelto = parseInt(rispostaSelezionata.value);
    
    // Troviamo qual era la risposta corretta per la domanda attuale dall'array
    const indiceCorretto = domandeQuiz[indiceDomandaCorrente].rispostaCorretta;
    
    // Controlliamo se la risposta è giusta (struttura condizionale if)
    if (indiceScelto === indiceCorretto) {
        // Messaggio di feedback immediato: Risposta corretta
        elementoFeedback.textContent = "Risposta corretta!";
        elementoFeedback.style.color = "green"; // Testo verde
        punteggio++; // Aggiungiamo 1 al punteggio totale
        elementoPunteggio.textContent = punteggio; // Aggiorniamo il punteggio a schermo
    } else {
        // Messaggio di feedback immediato: Risposta errata
        elementoFeedback.textContent = "Risposta errata!";
        elementoFeedback.style.color = "red"; // Testo rosso
    }
    
    // Disabilitiamo tutti i radio button per impedire di cambiare la risposta dopo aver controllato
    const tuttiIRadio = document.querySelectorAll('input[name="scelta"]');
    for (let i = 0; i < tuttiIRadio.length; i++) {
        tuttiIRadio[i].disabled = true;
    }
    
    // Cambiamo il testo del pulsante per permettere all'utente di cliccare per andare avanti
    pulsanteControlla.textContent = "Prossima Domanda";
}

// Funzione per mostrare il messaggio finale personalizzato (Fase 4)
function mostraRisultatoFinale() {
    // Cambiamo il titolo e svuotiamo il contenitore delle opzioni
    elementoDomanda.textContent = "Quiz Terminato!";
    contenitoreOpzioni.innerHTML = "";
    pulsanteControlla.style.display = "none"; // Nascondiamo il pulsante perché il quiz è finito
    
    let messaggio = "";
    
    // Mostriamo un messaggio finale diverso in base al punteggio totale raggiunto (Struttura condizionale)
    if (punteggio >= 4) {
        messaggio = "Ottimo lavoro! Sei un vero esperto di calcio.";
    } else {
        messaggio = "Devi ripassare un po'. Clicca su un link al materiale di studio per ricominciare.";
    }
    
    // Stampiamo il messaggio finale a schermo
    elementoFeedback.textContent = messaggio;
    elementoFeedback.style.color = "blue";
}

// Colleghiamo l'evento click del pulsante alla funzione controllaRisposta
pulsanteControlla.addEventListener("click", controllaRisposta);

// Avviamo il quiz mostrando la prima domanda quando si carica la pagina web per la prima volta
mostraDomanda();
