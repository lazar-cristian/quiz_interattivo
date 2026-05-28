// ==========================================
// SEZIONE 1: SINTESI AUDIO (Web Audio API)
// ==========================================

// Inizializziamo il contesto audio, gestendo la compatibilità con i vari browser (es. Safari)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

/**
 * Funzione per generare effetti sonori sintetizzati senza caricare file esterni.
 * @param {string} type - Il tipo di suono da riprodurre ('click', 'success', 'error')
 */
function playSound(type) {
    // Se il contesto audio è sospeso (es. per policy del browser), lo sblocchiamo
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // Creiamo un oscillatore (generatore di onde sonore)
    const osc = audioCtx.createOscillator();
    // Creiamo un nodo per il controllo del volume (guadagno)
    const gainNode = audioCtx.createGain();
    
    // Colleghiamo l'oscillatore al controllo volume, e quest'ultimo all'uscita audio finale
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Salviamo il tempo corrente per programmare i cambiamenti di frequenza e volume
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
        // Suono breve e secco per il click (onda sinusoidale pura)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now); // Frequenza di partenza a 400Hz
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05); // Sale rapidamente a 600Hz
        gainNode.gain.setValueAtTime(0, now); // Volume iniziale zero
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01); // Attacco rapido del volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Decadimento rapido
        osc.start(now); // Facciamo partire il suono
        osc.stop(now + 0.1); // Fermiamo il suono dopo 0.1 secondi
    } else if (type === 'success') {
        // Arpeggio felice per la risposta corretta (onda triangolare, più morbida)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // Nota La
        osc.frequency.setValueAtTime(554.37, now + 0.1); // Nota Do#
        osc.frequency.setValueAtTime(659.25, now + 0.2); // Nota Mi (Accordo Maggiore)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'error') {
        // Suono basso e discendente per l'errore (onda a dente di sega, più ruvida)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now); // Frequenza bassa iniziale
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3); // Scende rapidamente simulando un errore
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}

// ==========================================
// SEZIONE 2: BACKGROUND FISICO INTERATTIVO (Canvas)
// ==========================================

// Recuperiamo l'elemento canvas dal DOM e il suo contesto di disegno 2D
const canvas = document.getElementById('physics-canvas');
const ctx = canvas.getContext('2d');

// Variabili globali per gestire dimensioni e particelle
let width, height;
let particles = [];
// Oggetto che tiene traccia della posizione e della velocità del mouse
let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
let lastMouse = { x: -1000, y: -1000 };

/**
 * Ridimensiona il canvas per coprire l'intera finestra del browser.
 */
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Ascoltiamo l'evento resize della finestra per adattare il canvas
window.addEventListener('resize', resize);
resize(); // Chiamata iniziale per impostare le misure

// Ascoltiamo i movimenti del mouse per calcolarne la velocità (effetto repulsivo)
window.addEventListener('mousemove', (e) => {
    // Salviamo la posizione precedente del mouse
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
    // Aggiorniamo la posizione corrente basandoci sulle coordinate dell'evento
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Calcoliamo la velocità del mouse come differenza tra posizione corrente e precedente
    mouse.vx = mouse.x - lastMouse.x;
    mouse.vy = mouse.y - lastMouse.y;
});

// Array di colori accesi (Neon) per le particelle fluttuanti
const colors = ['#007aff', '#34c759', '#ff3b30', '#ffcc00', '#5856d6', '#ff9500'];

/**
 * Classe che rappresenta una singola particella (bolla) sullo schermo.
 */
class Particle {
    constructor() {
        // Raggio casuale tra 10 e 35
        this.radius = Math.random() * 25 + 10;
        // Posizione iniziale casuale lungo lo schermo
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Velocità iniziale casuale (movimento fluttuante)
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        // Seleziona un colore a caso dall'array dei colori
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Aggiorna la fisica e la posizione della particella.
     */
    update() {
        // Effetto Antigravità: sottraiamo una piccola quantità di velocità per farle salire lentamente
        this.vy -= 0.02; 
        
        // Calcoliamo la distanza tra la particella e il mouse
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let minDistance = 150 + this.radius; // Area d'azione del mouse

        // Se la particella è vicina al mouse, applichiamo una forza repulsiva
        if (distance < minDistance) {
            // Più è vicina, più forte è la spinta
            let force = (minDistance - distance) / minDistance;
            // Calcoliamo l'angolo di repulsione
            let angle = Math.atan2(dy, dx);
            // Applichiamo la spinta repulsiva alla velocità
            this.vx -= Math.cos(angle) * force * 1.5;
            this.vy -= Math.sin(angle) * force * 1.5;
            
            // Trasferiamo una frazione della velocità del mouse (effetto schiaffo)
            this.vx += mouse.vx * 0.05;
            this.vy += mouse.vy * 0.05;
        }

        // Applichiamo un attrito (smorzamento) costante per rallentare le particelle
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Se la velocità si avvicina allo zero, ridiamo una piccola scossa casuale (moto browniano)
        if(Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.1;
        if(Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.1;

        // Aggiorniamo la posizione in base alla velocità calcolata
        this.x += this.vx;
        this.y += this.vy;

        // Gestione delle collisioni con i bordi laterali (effetto rimbalzo)
        if (this.x - this.radius < 0) { this.x = this.radius; this.vx *= -1; }
        if (this.x + this.radius > width) { this.x = width - this.radius; this.vx *= -1; }
        // Se sbatte in alto, rimbalza
        if (this.y - this.radius < 0) { this.y = this.radius; this.vy *= -1; }
        // Se esce dal bordo inferiore, la teletrasportiamo in cima (flusso continuo antigravitazionale)
        if (this.y + this.radius > height) { 
            this.y = -this.radius; 
        }
    }

    /**
     * Disegna la particella sul canvas.
     */
    draw() {
        ctx.beginPath();
        // Disegna un cerchio alle coordinate attuali
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Creiamo un gradiente radiale per dare un effetto 3D e vetro sfocato (glassmorphism)
        let gradient = ctx.createRadialGradient(
            this.x - this.radius*0.3, this.y - this.radius*0.3, this.radius*0.1, 
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#ffffff'); // Centro luminoso
        gradient.addColorStop(0.3, this.color); // Colore principale a metà
        gradient.addColorStop(1, this.color); // Bordo col colore
        
        ctx.globalAlpha = 0.4; // Trasparenza per l'effetto vetro
        ctx.fillStyle = gradient; // Applichiamo il gradiente
        ctx.fill(); // Riempiamo la forma
        ctx.globalAlpha = 1; // Ripristiniamo l'opacità globale per le altre operazioni
    }
}

// Generiamo 70 particelle all'avvio dell'applicazione
for (let i = 0; i < 70; i++) {
    particles.push(new Particle());
}

/**
 * Il loop di animazione principale. Viene eseguito circa 60 volte al secondo.
 */
function animate() {
    // Pulisce il frame precedente
    ctx.clearRect(0, 0, width, height);
    
    // Rallentiamo la velocità fittizia del mouse gradualmente nel tempo
    mouse.vx *= 0.9;
    mouse.vy *= 0.9;

    // Per ogni particella, aggiorniamo la fisica e la disegniamo
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Richiediamo il prossimo frame di animazione al browser
    requestAnimationFrame(animate);
}
// Avviamo l'animazione
animate();


// ==========================================
// SEZIONE 3: LOGICA DEL QUIZ E INTERFACCIA
// ==========================================

// --- Gestione Tema Chiaro/Scuro ---
// Recuperiamo il bottone per il cambio tema dal DOM
const themeBtn = document.getElementById('theme-toggle');

// Aggiungiamo l'evento click per alternare la classe 'dark-theme'
themeBtn.addEventListener('click', () => {
    playSound('click'); // Suono di feedback al click
    // Aggiunge o rimuove la classe dark-theme dal body
    document.body.classList.toggle('dark-theme');
    // Salviamo la preferenza nel LocalStorage in modo da mantenerla ricaricando la pagina
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Al caricamento, controlliamo se l'utente aveva scelto il tema scuro in precedenza
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// Icone SVG predefinite per feedback visivo (usiamo template literal per leggibilità)
const iconaSuccesso = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
const iconaErrore = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

// Array contenente le 5 domande richieste dalle specifiche del compito
const domande = [
    { testo: "Cosa significa l'acronimo HTML?", opzioni: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup", "Home Tool Markup Language"], corretta: 0 },
    { testo: "Quale linguaggio definisce lo stile di una pagina web?", opzioni: ["JavaScript", "Python", "CSS", "C++"], corretta: 2 },
    { testo: "Cos'è un array in JavaScript?", opzioni: ["Una funzione", "Una lista ordinata di valori", "Un elemento HTML", "Un colore CSS"], corretta: 1 },
    { testo: "Quale tag HTML si usa per inserire un'immagine?", opzioni: ["<image>", "<pic>", "<img>", "<src>"], corretta: 2 },
    { testo: "Quale di questi NON è un browser web?", opzioni: ["Chrome", "Firefox", "Linux", "Safari"], corretta: 2 }
];

// Variabili di stato globale del quiz
let indiceDomanda = 0; // Traccia quale domanda stiamo visualizzando
let punteggio = 0;     // Contatore risposte corrette
let hasAnswered = false; // Flag per capire se l'utente ha già risposto alla domanda corrente

// Cache dei riferimenti agli elementi DOM per migliorare le prestazioni
const elDomanda = document.getElementById("domanda");
const elOpzioni = document.getElementById("opzioni");
const btnAzione = document.getElementById("btn-azione");
const elFeedback = document.getElementById("feedback");
const elPunteggio = document.getElementById("punteggio");
const progressBar = document.getElementById("progress-bar");
const btnRestart = document.getElementById("btn-restart");

/**
 * Aggiorna visivamente la larghezza della barra di progresso
 */
function updateProgress() {
    // Calcoliamo la percentuale completata
    const percent = (indiceDomanda / domande.length) * 100;
    // Applichiamo la percentuale come stile CSS width
    progressBar.style.width = `${percent}%`;
}

/**
 * Funzione incaricata di generare a schermo la domanda corrente e le relative opzioni
 */
function mostraDomanda() {
    // Resettiamo lo stato di risposta
    hasAnswered = false;
    
    // Ripuliamo il div di feedback dalle classi e dal contenuto precedente
    elFeedback.className = "";
    elFeedback.innerHTML = "";
    elFeedback.classList.remove('show');
    
    // Aggiorniamo la barra di stato
    updateProgress();
    
    // Recuperiamo l'oggetto domanda corrente dall'array
    const dCorrente = domande[indiceDomanda];
    // Inseriamo il testo della domanda nell'H2
    elDomanda.textContent = dCorrente.testo;
    // Svuotiamo il contenitore delle opzioni
    elOpzioni.innerHTML = "";
    
    // Cicliamo sull'array delle opzioni per creare i radio button
    dCorrente.opzioni.forEach((opzione, i) => {
        // Creiamo dinamicamente l'elemento <label>
        const label = document.createElement("label");
        
        // Inseriamo l'input radio (che verrà nascosto da CSS) e il testo dell'opzione.
        // Utilizziamo replace per impedire eventuali interpretazioni HTML del testo (es. "<image>")
        label.innerHTML = `<input type="radio" name="scelta" value="${i}"> <span>${opzione.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
        
        // Aggiungiamo un event listener 'change' per riprodurre un suono quando l'utente seleziona
        label.addEventListener('change', () => {
            playSound('click'); // Suono micro-interazione
            // Abilitiamo il bottone di conferma rimuovendo la classe disabled
            btnAzione.classList.remove('disabled');
        });
        
        // Aggiungiamo la label al DOM (dentro elOpzioni)
        elOpzioni.appendChild(label);
    });
    
    // Impostiamo il testo del bottone d'azione e lo disabilitiamo finché non si fa una scelta
    btnAzione.textContent = "Conferma Risposta";
    btnAzione.classList.add('disabled');
}

/**
 * Verifica se l'opzione selezionata è corretta e fornisce feedback all'utente.
 */
function verificaRisposta() {
    // Se il bottone è ancora visivamente disabilitato, blocchiamo la funzione
    if (btnAzione.classList.contains('disabled')) return;
    
    // Cerchiamo l'input radio che è stato effettivamente checkato dall'utente
    const scelta = document.querySelector('input[name="scelta"]:checked');
    // Controllo di sicurezza: se niente è scelto usciamo dalla funzione
    if (!scelta) return;

    // Aggiorniamo lo stato
    hasAnswered = true;
    
    // Estraiamo il valore (l'indice) dall'input e lo convertiamo in numero intero
    const indiceScelto = parseInt(scelta.value);
    // Recuperiamo l'indice corretto dai dati
    const indiceCorretto = domande[indiceDomanda].corretta;

    // Aggiungiamo la classe show per far apparire visibilmente il box di feedback
    elFeedback.classList.add('show');

    // Valutazione condizionale (Logica del quiz)
    if (indiceScelto === indiceCorretto) {
        // SUCCESSO
        playSound('success'); // Innesca la Web Audio API felice
        elFeedback.innerHTML = `${iconaSuccesso} Risposta esatta!`;
        // Inietta la classe success che farà partire il keyframes pop definito nel CSS
        elFeedback.className = "feedback-success show"; 
        
        punteggio++; // Incrementiamo il contatore
        elPunteggio.textContent = punteggio; // Aggiorniamo il contatore a schermo
    } else {
        // ERRORE
        playSound('error'); // Innesca il suono di errore
        // Recuperiamo il testo esatto della risposta per mostrarlo all'utente
        const correctText = domande[indiceDomanda].opzioni[indiceCorretto].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        elFeedback.innerHTML = `${iconaErrore} Sbagliato! Era: ${correctText}`;
        // Inietta la classe error che innescherà il keyframes shake nel CSS
        elFeedback.className = "feedback-error show";
    }

    // Blocchiamo tutti gli input radio per evitare che l'utente cambi la risposta dopo la correzione
    document.querySelectorAll('input[name="scelta"]').forEach(input => input.disabled = true);
    
    // Cambiamo la funzione (e il testo) del bottone per il prossimo step
    btnAzione.textContent = "Prossima Domanda";
}

/**
 * Gestisce la logica di fine quiz, mostrando i risultati finali basati sul punteggio (Requisito 3).
 */
function fineQuiz() {
    // Riempiamo completamente la barra di progresso
    updateProgress();
    progressBar.style.width = '100%';
    
    // Rimuoviamo le opzioni dal DOM
    elOpzioni.innerHTML = "";
    // Nascondiamo il bottone principale e mostriamo il bottone di restart
    btnAzione.style.display = "none";
    btnRestart.style.display = "block";
    
    // Mostriamo un titolo conclusivo
    elDomanda.textContent = "Quiz Terminato!";
    
    // Prepariamo la visualizzazione del feedback finale
    elFeedback.classList.add('show');
    
    // Generiamo messaggi differenti in base al punteggio finale come richiesto dalle regole accademiche
    if (punteggio >= 4) {
        playSound('success');
        elFeedback.innerHTML = `${iconaSuccesso} Ottimo lavoro! Hai ottenuto ${punteggio} su ${domande.length}. Sei un esperto nel tuo campo.`;
        elFeedback.className = "feedback-success show";
    } else {
        playSound('error');
        elFeedback.innerHTML = `${iconaErrore} Hai ottenuto ${punteggio} su ${domande.length}. Devi ripassare un po'. Aggiorna la pagina per ricominciare!`;
        elFeedback.className = "feedback-error show";
    }
}

// ==========================================
// SEZIONE 4: GESTIONE EVENTI (Event Listeners)
// ==========================================

// Listener sul bottone principale (il cuore del flusso dell'applicazione)
btnAzione.addEventListener("click", () => {
    // Se il bottone è "spento", ignoriamo il click
    if (btnAzione.classList.contains('disabled')) return;
    
    // Valutiamo la logica a "doppia funzione" del bottone basandoci sulla variabile di stato
    if (!hasAnswered) {
        // Fase 1: L'utente deve ancora confermare. Cliccando verifichiamo la sua selezione.
        verificaRisposta();
    } else {
        // Fase 2: L'utente ha già risposto. Cliccando passiamo alla domanda successiva.
        playSound('click'); // Feedback sonoro di avanzamento
        
        indiceDomanda++; // Incrementiamo l'indice
        
        // Verifichiamo se ci sono ancora domande nell'array
        if (indiceDomanda < domande.length) {
            mostraDomanda(); // Ripetiamo il ciclo mostrando la nuova domanda
        } else {
            fineQuiz(); // Abbiamo esaurito le domande, chiudiamo il gioco
        }
    }
});

/**
 * Mischia l'ordine delle domande in modo casuale (Algoritmo di Fisher-Yates)
 */
function mischiaDomande() {
    for (let i = domande.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Scambio degli elementi nell'array
        [domande[i], domande[j]] = [domande[j], domande[i]];
    }
}

// Listener sul bottone di riavvio
btnRestart.addEventListener("click", () => {
    playSound('click'); // Suono di interazione
    
    // Ripristiniamo i contatori
    indiceDomanda = 0;
    punteggio = 0;
    elPunteggio.textContent = punteggio; // Aggiorniamo a schermo
    
    // Mischiamo le domande ad ogni nuovo riavvio
    mischiaDomande();
    
    // Ripristiniamo i bottoni
    btnRestart.style.display = "none";
    btnAzione.style.display = "block";
    
    // Facciamo ripartire il quiz
    mostraDomanda();
});

// Mischiamo le domande per la primissima partita
mischiaDomande();
// Boot dell'applicazione: mostriamo la prima domanda all'avvio dello script
mostraDomanda();
