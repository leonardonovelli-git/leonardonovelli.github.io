// Contenuti del corso. Tipi di step:
//   intro → concetto breve        mcq → quiz a scelta
//   find  → trova un valore con i DevTools (answers → hash in build)
//   do    → compi un'azione: `check` gira nella pagina e verifica
// Testo: `codice`, **grassetto**, *corsivo*, [[scorciatoia]] (diventa i tasti giusti per Mac/Windows).
// page: 'plp' | 'pdp:VL2041' | 'pdp:VL2210' | 'any' (default: quella della lezione)

const ok = (t) => ({ t, ok: true });
const no = (t) => ({ t });

export const UNITS = [
  {
    id: 'u1', icon: '🧭', title: 'Orientarsi in Elements',
    lessons: [
      {
        id: 'u1l1', title: 'Apri la cassetta degli attrezzi', page: 'plp',
        tip: { title: 'Da schermo a codice in un clic', body: '[[inspect]] → clic sull\'elemento → in Elements risali i genitori finché trovi il contenitore con gli attributi `data-*`. Lì quasi sempre c\'è il codice prodotto.' },
        steps: [
          { type: 'intro', page: 'any', text: 'Il negozio dietro questo pannello, **Maison Velluto**, è finto ma costruito come uno vero: PLP, PDP, API, analytics, cookie… e qualche bug di dati messo apposta.\n\nOgni domanda si risolve **aprendo i DevTools su questa pagina**. Consiglio: agganciali in basso (menu ⋮ dei DevTools → *Dock side*) così vedi sia il sito che me.' },
          { type: 'mcq', page: 'any', text: 'Come apri i DevTools?', options: [ok('[[devtools]] (oppure tasto destro → Ispeziona)'), no('[[source]]'), no('[[find]]'), no('[[device]]')], explain: 'Con tasto destro → *Ispeziona* i DevTools si aprono già posizionati sull\'elemento che hai cliccato.' },
          { type: 'mcq', page: 'any', text: 'E la scorciatoia del **selettore di elementi** (la freccina nell\'angolo in alto a sinistra dei DevTools)?', options: [ok('[[inspect]]'), no('[[gsearch]]'), no('[[cmd]]'), no('[[reload]]')], explain: 'Col selettore attivo, passando sopra la pagina vedi dimensioni e classi di ogni elemento; cliccando, Elements salta al suo codice.' },
          { type: 'find', text: 'Attiva il selettore ([[inspect]]) e clicca sul **nome** del primo prodotto della griglia. In Elements si evidenzia il suo tag: quale tag HTML è?', placeholder: 'es. div', answers: ['h3'], mode: 'text', hints: ['Il tag è la prima parola dopo `<` nella riga evidenziata.', 'È un titolo (heading) di terzo livello.'], solution: '`h3`', explain: 'Il selettore è il modo più rapido per passare da "quella cosa a schermo" al suo codice.' },
          { type: 'find', text: 'Risali di qualche livello dal titolo: il contenitore del prodotto è un `<article class="product-tile">` con degli attributi `data-*`. Che valore ha `data-pid` del primo prodotto?', placeholder: 'codice prodotto', answers: ['VL2041'], mode: 'code', hints: ['Gli attributi stanno nel tag di apertura: `data-pid="…"`.', 'Usa i triangolini ▸ per espandere/chiudere i nodi e risalire fino ad `article`.'], solution: '`VL2041`', explain: 'Nei siti veri `data-pid` (o `data-product-id`, `data-sku`…) è quasi sempre il codice che arriva dal back-end: il ponte tra lo schermo e il PIM.' },
        ],
      },
      {
        id: 'u1l2', title: 'Attributi data-* e dati nascosti', page: 'plp',
        tip: { title: 'Cerca con i selettori', body: 'In Elements, [[find]] accetta anche selettori CSS: `[data-pid="VL2041"]`, `img[alt=""]`, `.badge`. È il modo più rapido per trovare un elemento in una pagina enorme.' },
        steps: [
          { type: 'intro', text: 'Il front spesso "appende" dati del back-end agli elementi come attributi `data-*` (codice, colore, posizione…).\n\nE alcuni dati arrivano ma **non si vedono**: nascosti dal CSS. Quando qualcuno dice *"l\'ho messo in PIM ma non appare"*, la prima domanda è: arriva ed è nascosto, o non arriva proprio?' },
          { type: 'find', text: 'Che codice colore (`data-color-code`) ha il **Mocassino Brera**?', placeholder: 'codice colore', answers: ['R022'], mode: 'code', hints: ['Tasto destro sulla card del Mocassino Brera → Ispeziona.', 'Risali fino all\'`article`: l\'attributo è lì accanto a `data-pid`.'], solution: '`R022`' },
          { type: 'find', text: 'Nella card del Mocassino Brera c\'è un **badge** che il back-end ha inviato ma che a schermo non vedi. Che testo contiene?', placeholder: 'testo del badge', answers: ['Edizione limitata'], mode: 'text', hints: ['Espandi il `div class="tile-media"` della card.', 'Cerca uno `span` con classe `badge`: in Elements gli elementi nascosti si vedono comunque.'], solution: '"Edizione limitata"', explain: 'Il dato arriva, ma una regola CSS lo nasconde. In Styles vedrai anche il commento che spiega perché.' },
          { type: 'do', text: 'Rendilo visibile: seleziona lo `span` del badge e nel pannello **Styles** togli la spunta alla dichiarazione `display: none`. Poi premi Verifica.', hints: ['Styles è il pannello accanto all\'albero di Elements: mostra le regole CSS dell\'elemento selezionato.', 'Passa col mouse sulla riga `display: none;` e clicca la casellina che compare a sinistra.'], check: () => { const b = document.querySelector('.product-tile .badge--limited'); return !!b && getComputedStyle(b).display !== 'none' && b.getClientRects().length > 0; }, explain: 'Hai testato una modifica CSS senza toccare il codice. Ora puoi scrivere al team front: "basta togliere questa regola".' },
          { type: 'find', text: 'Una delle card ha l\'immagine con l\'attributo `alt` **vuoto** (male per SEO e accessibilità). Che `data-pid` ha quella card?', placeholder: 'codice prodotto', answers: ['VL2275'], mode: 'code', hints: ['In Elements premi [[find]] e cerca il selettore `img[alt=""]`.', 'Quando trovi l\'`img`, risali al suo `article` per leggere il codice.'], solution: '`VL2275` (Sneaker Lumen)', explain: 'L\'alt di solito viene dalla descrizione immagine in PIM/DAM: alt vuoto = dato mancante a monte.' },
          { type: 'mcq', text: 'Vedi un `data-*` in Elements. Come capisci se l\'ha scritto il **server** o il **JavaScript** del front?', options: [ok('Controllo se c\'è anche nel sorgente originale ([[source]]): se c\'è, l\'ha mandato il server'), no('Tutti i data-* arrivano dal server'), no('Quelli colorati in viola sono del JavaScript'), no('Non si può sapere')], explain: 'Elements mostra il DOM *vivo* (dopo il JavaScript), il sorgente mostra cosa ha mandato il server. È l\'argomento della prossima unità.' },
        ],
      },
      {
        id: 'u1l3', title: 'Modifiche finte, effetti veri', page: 'plp',
        tip: { title: 'Screenshot di un solo elemento', body: '[[cmd]] apre il Command Menu dei DevTools: scrivi "screenshot" → *Capture node screenshot* per fotografare solo il nodo selezionato, oppure *Capture full size screenshot* per l\'intera pagina.' },
        steps: [
          { type: 'intro', text: 'Tutto quello che cambi nei DevTools vive **solo nel tuo browser** finché non ricarichi. Perfetto per mock-up al volo (*"come verrebbe con questo nome?"*) senza rompere nulla.' },
          { type: 'do', text: 'In Elements fai doppio clic sul **testo** del nome del primo prodotto e cambialo in `Ciao`. Invio, poi Verifica.', hints: ['Seleziona l\'`h3` del primo prodotto ed espandilo: il testo è dentro.', 'Doppio clic sul testo (non sul nome del tag). In alternativa: tasto destro sul nodo → *Edit as HTML*.'], check: () => { const n = document.querySelector('.product-tile .tile-name'); return !!n && n.textContent.trim().toLowerCase() === 'ciao'; } },
          { type: 'mcq', text: 'Ora ricarichi la pagina ([[reload]]). Cosa succede al nome?', options: [ok('Torna quello originale: la modifica era solo nel mio browser'), no('Resta "Ciao" per tutti'), no('Resta "Ciao" solo per me'), no('Si aggiorna anche nel PIM')] },
          { type: 'find', text: 'Con [[find]] in Elements cerca il selettore `.product-tile`. Quanti risultati trova?', placeholder: 'numero', answers: ['8'], mode: 'num', hints: ['Clicca prima dentro l\'albero di Elements, poi [[find]].', 'Il contatore compare a destra della barra di ricerca (es. "1 of …").'], solution: '8' },
          { type: 'mcq', text: 'Vuoi mostrare al team come apparirebbe un prezzo diverso su una card, senza toccare nulla. Cosa fai?', options: [ok('Cambio il testo in Elements e faccio uno screenshot'), no('Chiedo un deploy di test'), no('Cambio il prezzo nel PIM e poi lo rimetto'), no('Apro il sorgente con [[source]] e lo modifico')], explain: 'Bonus: [[cmd]] → "screenshot" → *Capture node screenshot* fotografa solo l\'elemento selezionato.' },
        ],
      },
    ],
  },
  {
    id: 'u2', icon: '📄', title: 'Sorgente vs DOM',
    lessons: [
      {
        id: 'u2l1', title: 'Cosa manda davvero il server', page: 'plp',
        tip: { title: 'CSR o SSR in 5 secondi', body: '[[source]] e cerca il nome di un prodotto. C\'è → la pagina arriva già pronta dal server (SSR). Non c\'è → la costruisce il JavaScript (CSR) e i dati stanno in una chiamata del Network.' },
        steps: [
          { type: 'intro', page: 'any', text: 'Due viste diverse della stessa pagina:\n\n**Sorgente** ([[source]]) = l\'HTML così come l\'ha mandato il server.\n**Elements** = il DOM *dopo* che il JavaScript ha lavorato.\n\nSe un dato è in Elements ma non nel sorgente, l\'ha aggiunto il front, di solito da una chiamata API.' },
          { type: 'mcq', text: 'Sulla PLP apri il sorgente ([[source]]) e cerca ([[find]]) `Mocassino Brera`. Lo trovi?', options: [ok('No: i prodotti li disegna il JavaScript dopo il caricamento'), no('Sì, dentro un h3'), no('Sì, ma commentato'), no('Il sorgente è una pagina bianca')], explain: 'Questa PLP è renderizzata lato client (CSR): la lista arriva da un\'API. Nell\'unità Network la troverai.' },
          { type: 'mcq', page: 'pdp:VL2041', text: 'Ora vai sulla PDP del **Décolleté Aurora** e fai lo stesso cercando `Décolleté Aurora`. C\'è nel sorgente?', options: [ok('Sì: questa pagina arriva già costruita dal server (SSR)'), no('No, come nella PLP'), no('Solo nel title'), no('Solo dopo aver scelto la taglia')] },
          { type: 'find', page: 'pdp:VL2041', text: 'Nel sorgente della PDP c\'è un **commento HTML** che dice quando è stata generata la pagina. Che data? (AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: ['2026-09-14', '14/09/2026', '14-09-2026', '2026/09/14', '14.09.2026'], mode: 'text', hints: ['I commenti HTML iniziano con `<!--`.', 'Cerca la parola `rendered` nel sorgente (o in Elements, i commenti si vedono anche lì).'], solution: '2026-09-14 (`rendered=2026-09-14T08:12:37Z`)', explain: 'Molte piattaforme lasciano commenti o header con data, nodo, cache HIT/MISS. Oro quando devi capire se una pagina è "vecchia".' },
          { type: 'mcq', page: 'pdp:VL2041', text: 'E il **prezzo**? È nel sorgente della PDP?', options: [ok('No: arriva dopo, da una chiamata API dei prezzi'), no('Sì, nel JSON-LD'), no('Sì, nel title'), no('Sì, ma in un commento')], explain: 'Pattern comunissimo: pagina in cache per ore o giorni, prezzo e disponibilità chiesti in tempo reale.' },
        ],
      },
      {
        id: 'u2l2', title: 'Dati strutturati e meta tag', page: 'pdp:VL2041',
        tip: { title: 'JSON-LD: il catalogo per Google', body: 'In Elements [[find]] → `ld+json`. Dentro trovi sku, gtin, brand, materiale, origine: se qui c\'è un dato sbagliato, è sbagliato anche su Google. Validalo con il Rich Results Test di Google.' },
        steps: [
          { type: 'intro', text: 'Nel `<head>` delle PDP ci sono dati pensati per le macchine:\n\n**JSON-LD** (`<script type="application/ld+json">`) → letto da Google\n**Open Graph** (`og:*`) → anteprime sui social e in chat\n**canonical** e **hreflang** → SEO e versioni per lingua\n\nSpesso sono la cosa che arriva più "dritta" dal catalogo.' },
          { type: 'find', text: 'Trova il blocco JSON-LD: che **gtin13** (EAN) dichiara?', placeholder: '13 cifre', answers: ['8056789204110'], mode: 'num', hints: ['In Elements espandi `<head>`, oppure [[find]] → `gtin13`.', 'Funziona anche dal sorgente ([[source]]).'], solution: '8056789204110' },
          { type: 'find', text: 'Sempre nel JSON-LD: che valore ha `countryOfOrigin`?', placeholder: 'valore', answers: ['IT', 'Italia', 'Italy'], mode: 'text', hints: ['È poco sotto `material`.'], solution: '`IT`', explain: 'Tienilo a mente: ci servirà in un\'indagine. 🕵️' },
          { type: 'find', text: 'Quanti tag `<link rel="alternate" hreflang="…">` ci sono nella pagina (x-default compreso)?', placeholder: 'numero', answers: ['4'], mode: 'num', hints: ['In Elements [[find]] → selettore `link[hreflang]` e leggi il contatore.'], solution: '4 (it-it, fr-fr, en-gb, x-default)' },
          { type: 'find', text: 'Che **nome file** ha l\'immagine dichiarata in `og:image`?', placeholder: 'nomefile.ext', answers: ['VL2041-N001.svg', 'VL2041-N001'], mode: 'url', hints: ['Cerca `og:image` tra i `<meta>`: il valore è in `content`.', 'Ti basta l\'ultima parte dell\'URL, dopo l\'ultimo `/`.'], solution: '`VL2041-N001.svg`' },
          { type: 'mcq', text: 'A cosa serve il `<link rel="canonical">`?', options: [ok('A dire ai motori di ricerca qual è l\'URL "ufficiale" della pagina, evitando duplicati (es. con parametri)'), no('A caricare il CSS principale'), no('A tradurre la pagina'), no('A tracciare le visite in Analytics')] },
        ],
      },
    ],
  },
  {
    id: 'u3', icon: '📡', title: 'Network: le chiamate',
    lessons: [
      {
        id: 'u3l1', title: 'Fetch/XHR: dove arrivano i dati', page: 'plp',
        tip: { title: 'Il flusso base del Network', body: 'Network → filtro **Fetch/XHR** → [[reload]] → clic sulla chiamata → **Preview** (JSON navigabile), **Response** (testo grezzo), **Headers** (URL e status), **Payload** (parametri).' },
        steps: [
          { type: 'intro', text: 'Il pannello **Network** registra tutto quello che la pagina scarica. Il filtro **Fetch/XHR** isola le chiamate API: è lì che il front chiede i dati al back-end (in JSON).\n\nRegola d\'oro: apri Network **prima** di ricaricare, altrimenti è vuoto.' },
          { type: 'find', text: 'Apri Network, filtra **Fetch/XHR** e ricarica la PLP. Quante chiamate vedi?', placeholder: 'numero', answers: ['3'], mode: 'num', hints: ['Se la lista è vuota, ricarica con il pannello Network aperto.', 'Conta solo con il filtro Fetch/XHR attivo (i bottoni sopra la lista).'], solution: '3: traduzioni, ricerca, prezzi' },
          { type: 'find', text: 'Una delle tre porta la lista prodotti. Come si chiama il file (colonna *Name*, senza parametri)?', placeholder: 'nome file', answers: ['calzature-donna.json', 'calzature-donna'], mode: 'url', hints: ['Clicca ogni riga e guarda la scheda **Preview**.', 'È quella con dentro `hits` e i nomi dei prodotti.'], solution: '`calzature-donna.json`' },
          { type: 'find', text: 'Nella **Preview** di quella risposta: quanti prodotti totali dichiara il campo `total`?', placeholder: 'numero', answers: ['23'], mode: 'num', hints: ['`total` è uno dei campi al primo livello del JSON.'], solution: '23 (su più pagine)' },
          { type: 'find', text: 'E quanti elementi ci sono nell\'array `hits` di questa pagina?', placeholder: 'numero', answers: ['9'], mode: 'num', hints: ['Espandi `hits`: gli elementi sono numerati da 0.', 'Anche `query.pageSize` ti dà un indizio.'], solution: '9' },
          { type: 'find', text: 'A schermo vedi 8 prodotti, l\'API ne manda 9. Quale `id` **manca** a schermo?', placeholder: 'codice prodotto', answers: ['VL3307'], mode: 'code', hints: ['Confronta gli `id` in `hits` con i `data-pid` delle card.', 'Scorciatoia in Console: `$$(\'.product-tile\').map(t => t.dataset.pid)`'], solution: '`VL3307` (Sandalo Capri)' },
          { type: 'mcq', text: 'Guarda i dati di quel prodotto nella risposta. Perché secondo te il front non lo mostra?', options: [ok('Ha l\'array `images` vuoto'), no('Ha `online: false`'), no('Non ha prezzo'), no('La chiamata è andata in errore')], explain: 'Molti front scartano i prodotti senza immagini. Nell\'unità "Sources" troverai la riga di codice che lo fa.' },
        ],
      },
      {
        id: 'u3l2', title: 'Parametri, header e status', page: 'plp',
        tip: { title: 'Il ticket perfetto al back-end', body: 'Tasto destro sulla chiamata → **Copy → Copy as cURL** e incollalo nel ticket. Chi lo riceve ha URL, parametri e header esatti e riproduce il problema in un minuto.' },
        steps: [
          { type: 'intro', text: 'Ogni chiamata ha:\n**URL + parametri** → cosa chiedi\n**header** → metadati (lingua, canale, autenticazione…)\n**status** → 200 ok, 304 da cache, 404 non trovato, 500 errore server\n**risposta** → i dati' },
          { type: 'find', text: 'Apri la chiamata dei **prezzi**, scheda **Payload**: che valore ha il parametro `country`?', placeholder: 'valore', answers: ['IT'], mode: 'code', hints: ['La chiamata prezzi ha `prices` nell\'URL.', 'Payload → *Query String Parameters*.'], solution: '`IT`' },
          { type: 'find', text: 'Scheda **Headers** → *Request Headers*: che valore ha `X-Channel`?', placeholder: 'valore', answers: ['WEB-EU'], mode: 'code', hints: ['Scorri oltre *Response Headers* fino a *Request Headers*.'], solution: '`WEB-EU`', explain: 'Header così (canale, paese, id richiesta) dicono al back-end chi sta chiedendo. Il `X-Request-Id` è oro per far trovare la chiamata nei log del back-end.' },
          { type: 'find', text: 'Che **status code** ha la chiamata prezzi?', placeholder: 'numero', answers: ['200', '304'], mode: 'num', hints: ['È nella colonna *Status*, o in Headers → *General*.'], solution: '200 (o 304 se servita dalla cache)' },
          { type: 'mcq', text: 'Tasto destro su una chiamata → **Copy → Copy as cURL**. A cosa ti serve?', options: [ok('A riprodurre la stessa identica chiamata fuori dal browser o a girarla al team back-end'), no('A scaricare la pagina come PDF'), no('A copiare solo il JSON di risposta'), no('A bloccare la chiamata')] },
          { type: 'mcq', text: 'Clicchi un bottone, la pagina ti reindirizza e le chiamate spariscono dal Network. Cosa attivi?', options: [ok('Preserve log'), no('Disable cache'), no('Offline'), no('Big request rows')], explain: '**Preserve log** mantiene la lista tra un caricamento e l\'altro: indispensabile per checkout, login e redirect.' },
        ],
      },
      {
        id: 'u3l3', title: 'Caccia all\'errore', page: 'plp',
        tip: { title: 'Trova l\'errore in 3 mosse', body: '1) Network + [[reload]]  2) cerca le righe rosse (4xx/5xx) o scrivi `status-code:404` nel filtro  3) la colonna **Initiator** dice quale script ha fatto la chiamata. Per simulare un KO: tasto destro → *Block request URL*.' },
        steps: [
          { type: 'find', text: 'Una card della PLP non mostra l\'immagine. Filtra il Network per **Img** e ricarica: come si chiama il file in rosso?', placeholder: 'nomefile.ext', answers: ['VL2302-W01O.svg', 'VL2302-W01O'], mode: 'url', hints: ['Le richieste fallite sono scritte in rosso.', 'Copialo esattamente, lettera per lettera: c\'è un tranello.'], solution: '`VL2302-W01O.svg`' },
          { type: 'find', text: 'Che status code ha quella richiesta?', placeholder: 'numero', answers: ['404'], mode: 'num', solution: '404 (Not Found)' },
          { type: 'mcq', text: 'Il codice colore del prodotto è `W010`. Confrontalo con il nome del file: dov\'è il problema?', options: [ok('Nel nome file c\'è una O (lettera) al posto dello 0 (zero): il percorso immagine nei dati è sbagliato'), no('Il server delle immagini è giù'), no('Il CSS nasconde l\'immagine'), no('L\'immagine è troppo pesante')], explain: 'Classico errore di naming tra DAM e PIM. Si corregge il dato, non il front.' },
          { type: 'do', text: 'Simula un servizio prezzi KO: in Network tasto destro sulla chiamata dei prezzi → **Block request URL**, poi ricarica e Verifica.', hints: ['Togli prima il filtro Img e rimetti Fetch/XHR per ritrovare la chiamata.', 'Alternativa: [[cmd]] → scrivi "request blocking" → *Show Network request blocking* → aggiungi il pattern `*prices*`.'], check: () => !!document.querySelector('.tile-price.is-unavailable') },
          { type: 'mcq', text: 'Cosa mostra il negozio quando i prezzi non arrivano?', options: [ok('"Prezzo non disponibile" su ogni card'), no('Prezzi a 0 €'), no('Una pagina bianca'), no('I prezzi del giorno prima')], explain: 'Testare i casi KO così è utilissimo per verificare che il front "degradi" bene invece di mostrare 0 €.' },
          { type: 'do', text: 'Ora **sblocca** la richiesta (togli la spunta nel pannello *Network request blocking*, in basso) e ricarica: i prezzi devono tornare.', hints: ['Il pannello di blocco si apre in basso nei DevTools; puoi anche disattivare "Enable network request blocking".'], check: () => !document.querySelector('.tile-price.is-unavailable') && !!document.querySelector('.tile-price[data-loaded]') },
          { type: 'find', page: 'pdp:VL2041', text: 'Sulla PDP del Décolleté Aurora una chiamata Fetch/XHR fallisce **in silenzio** (a schermo nessun errore). Che status code ha?', placeholder: 'numero', answers: ['404'], mode: 'num', hints: ['Fetch/XHR + ricarica, cerca la riga rossa.', 'Anche la Console la segnala in rosso.'], solution: '404' },
          { type: 'mcq', page: 'pdp:VL2041', text: 'Leggi l\'URL di quella chiamata. Quale parte della pagina manca per colpa sua?', options: [ok('I consigli "Ti potrebbe piacere" (recommendations)'), no('Il prezzo'), no('Le taglie'), no('L\'immagine principale')], explain: 'Il front ignora l\'errore e nasconde la sezione: per l\'utente "non c\'è", per te è un 404 da segnalare.' },
          { type: 'find', page: 'pdp:VL2041', text: 'Colonna **Initiator**: quale file JavaScript ha lanciato la chiamata `availability`?', placeholder: 'nomefile.js', answers: ['pdp.js'], mode: 'url', hints: ['Occhio: più chiamate si chiamano `VL2041.json`! Passa il mouse sul nome per vedere il percorso completo (`/availability/…`).', 'Se non vedi la colonna, tasto destro sull\'intestazione della tabella → spunta *Initiator*.', 'Ignora il numero di riga dopo i due punti.'], solution: '`pdp.js`' },
        ],
      },
      {
        id: 'u3l4', title: 'Cerca in tutte le risposte', page: 'pdp:VL2041',
        tip: { title: 'Il superpotere: cerca un valore ovunque', body: 'Network aperto → [[reload]] → [[find]] con il focus nel pannello Network (o icona 🔍) → scrivi un valore che vedi in PIM. Trovi la chiamata **e** la chiave JSON. Funziona anche su header e URL.' },
        steps: [
          { type: 'intro', text: 'Domanda tipica del lavoro: *"questo attributo che abbiamo in PIM arriva al front? Con che nome?"*\n\nNon serve aprire una chiamata alla volta: il Network ha una **ricerca dentro tutte le risposte**. Si apre con [[find]] mentre il pannello Network è attivo (o con l\'icona 🔍 in alto).' },
          { type: 'find', text: 'Ricarica la PDP con il Network aperto, poi cerca `Archivio 1987`. In quale richiesta compare? (nome file)', placeholder: 'nome file', answers: ['VL2041.json', 'VL2041'], mode: 'url', hints: ['La ricerca si apre come pannello a sinistra della lista.', 'Clicca sul risultato: ti porta dentro la risposta.'], solution: '`VL2041.json` (la chiamata prodotto)' },
          { type: 'find', text: 'Con che **chiave JSON** arriva quel valore?', placeholder: 'chiave', answers: ['line', 'attributes.line'], mode: 'text', hints: ['È la parola a sinistra dei due punti, prima di "Archivio 1987".'], solution: '`line` (dentro `attributes`)' },
          { type: 'find', text: 'A schermo il tacco è "8,5 cm". Nella stessa risposta, come si chiama la chiave del tacco?', placeholder: 'chiave', answers: ['heel_height_mm', 'attributes.heel_height_mm'], mode: 'text', hints: ['Cerca `heel`.'], solution: '`heel_height_mm`' },
          { type: 'mcq', text: 'Il back-end manda `85`, il front mostra `8,5 cm`. Chi fa la conversione?', options: [ok('Il front-end (JavaScript)'), no('Il PIM'), no('Il browser, automaticamente'), no('Google')], explain: 'Se in PIM qualcuno inserisse già i cm (8,5), il front li dividerebbe ancora per 10 → "0,85 cm". Sapere chi trasforma cosa evita tanti bug.' },
          { type: 'find', text: 'Nella risposta prodotto c\'è una **stagione** che a schermo non compare da nessuna parte. Che valore ha?', placeholder: 'valore', answers: ['FW26'], mode: 'code', hints: ['Guarda tutti i campi dentro `attributes`.'], solution: '`FW26` (campo `season`)', explain: 'Ecco un attributo che arriva al front ma non viene usato: se il business lo vuole a schermo, il dato c\'è già, serve solo il lavoro front.' },
          { type: 'find', text: 'E un codice di **istruzioni di cura**, anche lui non mostrato. Valore?', placeholder: 'valore', answers: ['CR-07', 'CR07'], mode: 'code', hints: ['Il campo si chiama `care_code`.'], solution: '`CR-07`' },
        ],
      },
    ],
  },
  {
    id: 'u4', icon: '💻', title: 'Console',
    lessons: [
      {
        id: 'u4l1', title: 'La Console come lente', page: 'plp',
        tip: { title: 'Estrai una lista in 2 secondi', body: '`copy($$(\'.product-tile\').map(t => t.dataset.pid).join(\'\\n\'))` → incolla in Excel: un codice per riga. Cambia selettore e attributo per qualsiasi lista della pagina.' },
        steps: [
          { type: 'intro', text: 'La **Console** ([[console]]) esegue JavaScript sulla pagina. Non serve essere sviluppatori, bastano 4 comandi:\n\n`$0` → l\'elemento selezionato in Elements\n`$$(\'selettore\')` → tutti gli elementi che corrispondono\n`copy(x)` → copia negli appunti\n`console.table(x)` → tabella leggibile' },
          { type: 'find', text: 'Scrivi in Console `$$(\'.product-tile\').length` e premi Invio. Risultato?', placeholder: 'numero', answers: ['8'], mode: 'num', hints: ['Se Chrome ti chiede di digitare "allow pasting", è perché hai incollato: scrivilo a mano o segui le istruzioni.'], solution: '8' },
          { type: 'do', text: 'Crea in Console una variabile `pids` con l\'elenco dei `data-pid` di tutte le card. La forma è: `pids = $$(…).map(t => t.dataset.pid)`', hints: ['Il selettore è lo stesso di prima: `.product-tile`.', '`t.dataset.pid` legge l\'attributo `data-pid` di ogni card.', 'Soluzione: `pids = $$(\'.product-tile\').map(t => t.dataset.pid)`'], check: () => Array.isArray(window.pids) && window.pids.length === 8 && window.pids.includes('VL2041'), explain: 'Aggiungi `copy(pids)` e hai la lista pronta da incollare dove vuoi.' },
          { type: 'mcq', text: 'Selezioni una card in Elements e scrivi `$0.dataset` in Console. Cosa ottieni?', options: [ok('Tutti i suoi attributi data-* come oggetto'), no('Il prezzo del prodotto'), no('Un errore'), no('Il CSS della card')] },
          { type: 'find', text: 'Molti siti salvano lo stato iniziale della pagina in una variabile globale. Qui si chiama `__VL_STATE__`: scrivila in Console. Che valore ha `sort`?', placeholder: 'valore', answers: ['newest'], mode: 'text', hints: ['Espandi l\'oggetto con le freccine ▸.', 'È dentro `search`.'], solution: '`newest`', explain: 'Nei siti veri cerca `__NEXT_DATA__` (Next.js), `__NUXT__`, `__INITIAL_STATE__`, `__PRELOADED_STATE__`: spesso dentro c\'è tutto il prodotto.' },
          { type: 'find', text: 'E il `pageSize`?', placeholder: 'numero', answers: ['9'], mode: 'num', solution: '9' },
        ],
      },
      {
        id: 'u4l2', title: 'dataLayer: cosa vede Analytics', page: 'plp',
        tip: { title: 'Leggere il dataLayer', body: '`dataLayer.filter(e => e.event)` mostra solo gli eventi; `console.table(dataLayer.find(e => e.event === \'view_item_list\').ecommerce.items)` rende leggibili i prodotti. Per seguirlo in tempo reale: Google Tag Assistant.' },
        steps: [
          { type: 'intro', text: 'Il `dataLayer` è l\'array in cui il sito "racconta" a Google Analytics / Tag Manager cosa succede: liste viste, prodotti visti, aggiunte al carrello… con codici, prezzi e categorie.\n\nSe un report GA4 ha dati strani, si parte da qui.' },
          { type: 'find', text: 'Scrivi `dataLayer` in Console. Quale `event` contiene la lista prodotti della PLP?', placeholder: 'nome evento', answers: ['view_item_list'], mode: 'text', hints: ['Espandi gli elementi dell\'array uno per uno.'], solution: '`view_item_list`' },
          { type: 'find', text: 'Che `item_list_name` ha?', placeholder: 'valore', answers: ['Calzature Donna'], mode: 'text', hints: ['È dentro `ecommerce`.'], solution: '"Calzature Donna"' },
          { type: 'find', text: 'Confronta i prezzi negli `items` del dataLayer con quelli a schermo: un prodotto ha un prezzo **diverso**. Quale `item_id`?', placeholder: 'codice prodotto', answers: ['VL2210'], mode: 'code', hints: ['Prova: `console.table(dataLayer.find(e => e.event === \'view_item_list\').ecommerce.items)`', 'Confronta la colonna `price` con la griglia, prodotto per prodotto.'], solution: '`VL2210`: 1090 nel dataLayer, 1150 a schermo' },
          { type: 'mcq', text: 'Guarda le risposte nel Network. Da dove prende il prezzo "sbagliato" il dataLayer?', options: [ok('Dalla risposta di **ricerca** (indice non aggiornato), mentre a schermo c\'è quella del **servizio prezzi**'), no('Da un cookie'), no('Dal JSON-LD'), no('È un numero casuale')], explain: 'Due fonti per lo stesso dato = report GA4 sballati. Bug da segnalare allegando entrambe le chiamate (nota `indexed_at` nella ricerca!).' },
          { type: 'do', page: 'pdp:VL2041', text: 'Vai sulla PDP del Décolleté Aurora, scegli la taglia **38** (colore nero) e aggiungi al carrello.', hints: ['Il colore nero è quello selezionato di default.'], check: () => { try { return (JSON.parse(localStorage.getItem('vl_cart')) || []).some((l) => l.sku === 'VL2041-CA01-N001-38'); } catch (e) { return false; } } },
          { type: 'find', page: 'pdp:VL2041', text: 'Nel dataLayer è comparso un evento `add_to_cart`. Che `item_variant` contiene?', placeholder: 'valore', answers: ['N001'], mode: 'code', hints: ['`dataLayer.filter(e => e.event === \'add_to_cart\')`', 'Espandi `ecommerce` → `items` → `0`.'], solution: '`N001` (il codice colore)' },
        ],
      },
    ],
  },
  {
    id: 'u5', icon: '🍪', title: 'Cookie e storage',
    lessons: [
      {
        id: 'u5l1', title: 'Il cookie che cambia paese', page: 'plp',
        tip: { title: 'Testare un altro mercato', body: 'Application → Cookies: cambia il cookie di paese/lingua e [[reload]]. Più veloce di un VPN per controllare prezzi e traduzioni. (Sui siti veri a volte il paese dipende anche dall\'URL o dall\'IP.)' },
        steps: [
          { type: 'intro', text: 'Il pannello **Application** (se non lo vedi, è dietro »): qui vivono **Cookie**, **Local Storage** e **Session Storage**.\n\nI cookie spesso decidono paese, lingua, valuta e varianti dei test A/B.' },
          { type: 'find', text: 'Application → Cookies → questo sito. Che valore ha `vl_country`?', placeholder: 'valore', answers: ['IT'], mode: 'code', hints: ['Nella colonna di sinistra: *Storage → Cookies* → clicca l\'indirizzo del sito.'], solution: '`IT`' },
          { type: 'find', text: 'In che variante del test A/B sei? Leggi il cookie `vl_ab`.', placeholder: 'valore', answers: ['plp_grid:B', 'B'], mode: 'text', solution: '`plp_grid:B`', explain: 'Curiosità: la variante B mostra la griglia a 4 colonne, la A a 3. Puoi provare a cambiarla tu.' },
          { type: 'do', text: 'Doppio clic sul valore di `vl_country`, scrivi `FR`, Invio, poi **ricarica** la pagina.', hints: ['Il valore si modifica direttamente nella tabella.', 'Dopo la modifica serve [[reload]]: il sito legge il cookie al caricamento.'], check: () => /(?:^|; )vl_country=FR/.test(document.cookie) && document.documentElement.lang === 'fr' },
          { type: 'find', text: 'Ora il negozio è in francese. Che prezzo ha il Décolleté Aurora in Francia? (solo il numero)', placeholder: 'numero', answers: ['990'], mode: 'num', solution: '990 €' },
          { type: 'find', text: 'Nel Network (Fetch/XHR): quale file di traduzioni viene caricato adesso?', placeholder: 'nome file', answers: ['fr-FR.json', 'fr-FR'], mode: 'url', hints: ['Prima era `it-IT.json`.'], solution: '`fr-FR.json`' },
          { type: 'do', text: 'Rimetti `vl_country` a `IT` e ricarica.', check: () => /(?:^|; )vl_country=IT/.test(document.cookie) && document.documentElement.lang === 'it' },
        ],
      },
      {
        id: 'u5l2', title: 'Local Storage: la memoria del browser', page: 'plp',
        tip: { title: 'Ripartire puliti', body: 'Application → Storage → **Clear site data** cancella cookie, storage e cache del sito in un colpo: sei di nuovo un utente nuovo. Utile prima di testare banner, popup o test A/B.' },
        steps: [
          { type: 'find', text: 'Application → **Local Storage** → questo sito. C\'è una wishlist (`vl_wishlist`): che codice prodotto contiene?', placeholder: 'codice prodotto', answers: ['VL2188'], mode: 'code', solution: '`VL2188`' },
          { type: 'mcq', text: 'Differenza chiave tra cookie e Local Storage?', options: [ok('I cookie viaggiano verso il server a ogni richiesta, il Local Storage resta solo nel browser'), no('Sono la stessa cosa'), no('Il Local Storage scade dopo un\'ora'), no('I cookie non si possono modificare')] },
          { type: 'do', text: 'Svuota il carrello: in Local Storage seleziona la chiave `vl_cart` e cancellala (tasto Canc o icona ⊘), poi ricarica. Il contatore in alto deve essere 0. (Se `vl_cart` non c\'è, aggiungi qualcosa dalla PDP e torna qui.)', hints: ['Se non vedi il contatore aggiornato, ricarica.'], check: () => { let c; try { c = JSON.parse(localStorage.getItem('vl_cart') || '[]'); } catch (e) { c = null; } const n = document.querySelector('[data-cart-count]'); return Array.isArray(c) && c.length === 0 && !!n && n.textContent.trim() === '0'; } },
          { type: 'mcq', text: 'Un collega vede il carrello pieno e tu vuoto, sullo stesso sito. Com\'è possibile?', options: [ok('Il carrello di questo sito è salvato nel Local Storage di ciascun browser'), no('Il server ha perso i dati'), no('Il carrello dipende dall\'orario'), no('È colpa della cache del CDN')] },
        ],
      },
    ],
  },
  {
    id: 'u6', icon: '🔎', title: 'Sources: il codice',
    lessons: [
      {
        id: 'u6l1', title: 'Ricerca globale nel codice', page: 'plp',
        tip: { title: 'Dal dato al codice', body: '[[gsearch]] cerca in tutti i JS e CSS caricati. Cerca il nome della chiave JSON (es. `heel_height_mm`) per scoprire dove il front la usa e come la trasforma.' },
        steps: [
          { type: 'intro', text: 'Quando un dato arriva (lo vedi nel Network) ma a schermo è diverso o non c\'è, la risposta sta nel **codice JavaScript**.\n\nLa **ricerca globale** cerca in tutti i file caricati dalla pagina.' },
          { type: 'mcq', text: 'Qual è la scorciatoia della ricerca globale nei DevTools?', options: [ok('[[gsearch]]'), no('[[find]]'), no('[[source]]'), no('[[device]]')] },
          { type: 'find', text: 'Trova nel codice la regola che scarta i prodotti senza immagini (cerca `images.length`). In quale file si trova?', placeholder: 'nomefile.js', answers: ['plp.js'], mode: 'url', hints: ['Apri la ricerca con [[gsearch]] e scrivi `images.length`.', 'Il risultato mostra il file e la riga.'], solution: '`plp.js`, funzione `isDisplayable`' },
          { type: 'find', text: 'In quale file è definita la funzione `formatPrice`?', placeholder: 'nomefile.js', answers: ['app.js'], mode: 'url', hints: ['Cerca `function formatPrice`.'], solution: '`app.js`' },
          { type: 'mcq', text: 'Apri un file e il codice è tutto su un\'unica riga illeggibile (minificato). Cosa premi?', options: [ok('Il pulsante `{}` (Pretty print) in basso nel pannello'), no('[[hardreload]]'), no('Disable cache'), no('Niente, non si può leggere')] },
          { type: 'mcq', text: 'Vuoi provare una modifica a un file JS/CSS e farla **sopravvivere al reload**, senza deploy. Cosa usi?', options: [ok('Local Overrides (Sources → Overrides)'), no('Preserve log'), no('Edit as HTML'), no('Disable cache')], explain: 'Con gli Overrides puoi anche sostituire la risposta di un\'API (tasto destro sulla chiamata → *Override content*) per vedere come apparirebbe un dato diverso.' },
        ],
      },
    ],
  },
  {
    id: 'u7', icon: '📱', title: 'Mobile e rete lenta',
    lessons: [
      {
        id: 'u7l1', title: 'Come lo vede un telefono', page: 'plp',
        tip: { title: 'Svuota la cache e ricarica', body: 'Con i DevTools aperti, tasto destro (o clic lungo) sul pulsante ricarica del browser → *Empty Cache and Hard Reload*. Quando "non vedo la modifica", molto spesso è cache.' },
        steps: [
          { type: 'do', text: 'Attiva la **Device Toolbar** ([[device]] o l\'icona 📱 in alto a sinistra nei DevTools) e scegli un iPhone dal menu *Dimensions*. Poi Verifica.', hints: ['Il menu dei dispositivi compare sopra la pagina, a sinistra.', 'Se non cambia nulla, ricarica la pagina.'], check: () => matchMedia('(pointer: coarse)').matches && innerWidth <= 500 },
          { type: 'find', text: 'Quante colonne ha la griglia prodotti su mobile?', placeholder: 'numero', answers: ['2'], mode: 'num', solution: '2' },
          { type: 'do', text: 'Simula una rete lenta: in Network cambia **No throttling** in **3G**, poi ricarica e Verifica quando i prezzi sono comparsi.', hints: ['Il menu del throttling è nella barra in alto del pannello Network.', 'Nelle versioni recenti di Chrome le voci si chiamano "Slow 4G", "3G": scegli 3G.', 'Se i prezzi arrivano subito, è la cache: spunta anche **Disable cache** in Network e ricarica.'], check: () => performance.getEntriesByType('resource').some((e) => e.name.includes('/prices/') && (e.duration > 1200 || e.responseEnd > 2500)) },
          { type: 'mcq', text: 'Mentre carica, cosa vedi al posto dei prezzi?', options: [ok('Un trattino "—" (placeholder) finché la chiamata non risponde'), no('0 €'), no('Il prezzo in dollari'), no('Niente, la card non c\'è')], explain: 'Con la rete lenta capisci l\'**ordine** in cui arrivano i dati: prima l\'HTML, poi le card, poi i prezzi.' },
          { type: 'do', text: 'Rimetti **No throttling** (e togli Disable cache se l\'avevi messo), chiudi la Device Toolbar e ricarica.', check: () => !matchMedia('(pointer: coarse)').matches && innerWidth > 500 },
          { type: 'mcq', text: 'In Network, **Disable cache** a cosa serve?', options: [ok('A scaricare tutto da zero come un utente alla prima visita (finché i DevTools sono aperti)'), no('A cancellare per sempre la cache di tutti gli utenti'), no('A svuotare i cookie'), no('A bloccare le immagini')] },
        ],
      },
    ],
  },
  {
    id: 'u8', icon: '🕵️', title: 'Indagini',
    lessons: [
      {
        id: 'u8l1', title: 'Ticket #4127 · Made in sbagliato', page: 'pdp:VL2041',
        tip: { title: 'Dove si è fermato il dato?', body: 'Segui il dato lungo la catena: PIM → API (Network) → HTML del server ([[source]]) → DOM (Elements) → schermo. Il punto in cui il valore cambia è dove sta il problema.' },
        steps: [
          { type: 'intro', text: '📨 **Ticket #4127** · Qualità prodotto\n\n*"Il Décolleté Aurora (VL2041) in PIM è Made in **Romania** dal 27 ottobre, ma sul sito c\'è ancora scritto Made in Italy. Potete capire dove si blocca?"*\n\nUsa tutto quello che sai.' },
          { type: 'find', text: 'Cosa manda l\'API prodotto (dati live) come paese di origine?', placeholder: 'codice paese', answers: ['RO', 'Romania'], mode: 'text', hints: ['Network → chiamata `VL2041.json` → Preview → `attributes`.', 'Oppure cerca `made_in` con la ricerca del Network.'], solution: '`RO` (`attributes.made_in`)' },
          { type: 'find', text: 'Nella stessa risposta, dentro `_meta`: quando è stato pubblicato l\'ultimo aggiornamento dal PIM? (AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: ['2026-10-27', '27/10/2026', '27-10-2026', '2026/10/27', '27.10.2026'], mode: 'text', solution: '2026-10-27' },
          { type: 'mcq', text: 'Il testo "Made in Italy" a schermo è anche nel **sorgente** ([[source]])?', options: [ok('Sì: è scritto nell\'HTML generato dal server'), no('No, lo aggiunge il JavaScript'), no('No, è un\'immagine'), no('Solo nel JSON-LD')] },
          { type: 'find', text: 'E quando è stato generato quell\'HTML? (dal commento nel sorgente, AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: ['2026-09-14', '14/09/2026', '14-09-2026', '2026/09/14', '14.09.2026'], mode: 'text', hints: ['Cerca `rendered` nel sorgente.'], solution: '2026-09-14, con `cache=HIT`' },
          { type: 'mcq', text: 'Diagnosi?', options: [ok('L\'API è aggiornata (RO), ma la pagina HTML è in cache da prima della modifica: va ripubblicata / invalidata la cache della PDP'), no('Il PIM non ha salvato la modifica'), no('Il front traduce male il codice RO'), no('È un problema del browser di chi ha aperto il ticket')], explain: 'Anche il JSON-LD dice ancora `IT`: viene dallo stesso HTML in cache. Quindi anche Google vede il dato vecchio.' },
          { type: 'mcq', text: 'Cosa alleghi alla risposta per il team tecnico?', options: [ok('Screenshot del commento con data e cache=HIT + Copy as cURL della chiamata prodotto con made_in: RO'), no('Solo uno screenshot della pagina'), no('Il link al PIM'), no('Niente, basta scrivere "non funziona"')] },
        ],
      },
      {
        id: 'u8l2', title: 'Ticket #4133 · La taglia fantasma', page: 'pdp:VL2041',
        tip: { title: 'Dati incoerenti', body: 'Quando due campi dicono cose diverse (qty 0 ma IN_STOCK), scopri quale usa il front con la ricerca globale. Il bug è di chi manda il dato incoerente; la robustezza è di chi lo legge.' },
        steps: [
          { type: 'intro', text: '📨 **Ticket #4133** · Customer care\n\n*"Una cliente ha ordinato il Décolleté Aurora nero in taglia **40**: il sito la dava disponibile, ma in magazzino non c\'era."*' },
          { type: 'find', text: 'Che `qty` ha la taglia 40 (colore N001) nella risposta **availability**?', placeholder: 'numero', answers: ['0'], mode: 'num', hints: ['Network → `VL2041.json` della availability (occhio: ce ne sono due con lo stesso nome! Guarda il percorso o la Preview).', 'Espandi `items` e cerca `size: "40"` con `color_code: "N001"`.'], solution: '0' },
          { type: 'find', text: 'E che `status` ha?', placeholder: 'valore', answers: ['IN_STOCK'], mode: 'code', solution: '`IN_STOCK`' },
          { type: 'find', text: 'Ora nel codice: [[gsearch]] e cerca `OUT_OF_STOCK`. In che file il front decide se una taglia è acquistabile?', placeholder: 'nomefile.js', answers: ['pdp.js'], mode: 'url', solution: '`pdp.js`, funzione `isPurchasable`' },
          { type: 'mcq', text: 'Su cosa si basa il front?', options: [ok('Solo su `status`: se non è OUT_OF_STOCK la taglia è acquistabile, anche con qty 0'), no('Solo su `qty`'), no('Su entrambi'), no('Sul prezzo')] },
          { type: 'mcq', text: 'Chi deve intervenire?', options: [ok('Entrambi: il feed stock manda dati incoerenti (qty 0 ma IN_STOCK) e il front potrebbe controllare anche qty'), no('Solo il front'), no('Nessuno, è un caso isolato'), no('Solo il customer care')] },
        ],
      },
      {
        id: 'u8l3', title: 'Ticket #4140 · L\'etichetta misteriosa', page: 'pdp:VL2210',
        tip: { title: 'Chiave a vista = traduzione mancante', body: 'Se a schermo leggi qualcosa come `material.XYZ` o `product.label.foo`, il front non ha trovato la traduzione: cerca la chiave nel file/endpoint di traduzioni della lingua (Network) e confronta con un\'altra lingua.' },
        steps: [
          { type: 'intro', text: '📨 **Ticket #4140** · Merchandising\n\n*"Sulla PDP dello Stivaletto Navigli, alla voce Materiale, compare una scritta strana invece di \'Camoscio\'."*' },
          { type: 'find', text: 'Che testo compare alla voce **Materiale**?', placeholder: 'testo', answers: ['material.SUEDE02'], mode: 'text', hints: ['È nella sezione Dettagli della PDP.'], solution: '`material.SUEDE02`' },
          { type: 'find', text: 'È una **chiave di traduzione** non trovata. In quale file di traduzioni (Network) il front l\'ha cercata?', placeholder: 'nome file', answers: ['it-IT.json', 'it-IT'], mode: 'url', hints: ['Network → Fetch/XHR: c\'è un file con la lingua nel nome.'], solution: '`it-IT.json`' },
          { type: 'mcq', text: 'Apri quel file nella Preview. C\'è `material.SUEDE02`?', options: [ok('No: ci sono CA01, CA02 e CA03, ma SUEDE02 manca'), no('Sì, ma è vuota'), no('Sì, scritta giusta'), no('Il file è vuoto')] },
          { type: 'do', text: 'Controprova: imposta il cookie `vl_country` a `FR` e ricarica.', check: () => /(?:^|; )vl_country=FR/.test(document.cookie) && document.documentElement.lang === 'fr' },
          { type: 'find', text: 'In francese l\'etichetta funziona: che parola compare?', placeholder: 'parola', answers: ['Daim'], mode: 'text', solution: '"Daim"' },
          { type: 'mcq', text: 'Qual è il fix corretto?', options: [ok('Aggiungere la traduzione italiana `material.SUEDE02` nel servizio/file di traduzioni'), no('Cambiare il codice materiale in PIM'), no('Nascondere il campo Materiale'), no('Mettere tutti gli utenti italiani su FR')] },
          { type: 'do', text: 'Rimetti `vl_country` a `IT` e ricarica. Indagine chiusa! 🎉', check: () => /(?:^|; )vl_country=IT/.test(document.cookie) && document.documentElement.lang === 'it' },
        ],
      },
    ],
  },
];
