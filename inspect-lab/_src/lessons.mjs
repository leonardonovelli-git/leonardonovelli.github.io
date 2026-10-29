// Contenuti del corso. Tipi di step:
//   intro → concetto breve        mcq → quiz a scelta
//   find  → trova un valore con i DevTools (answers → hash in build)
//   do    → compi un'azione: `check` gira nella pagina e verifica
// Testo: `codice`, **grassetto**, *corsivo*, [[scorciatoia]] (diventa i tasti giusti per Mac/Windows).
// page: 'plp' | 'pdp:VL2041' | 'pdp:VL2210' | 'any' (default: quella della lezione)
//
// Architettura simulata: Akeneo (PIM) → BEIL (integrazione Azure) → Algolia (PLP) + SAP Commerce Cloud (PDP) → front → Adobe Analytics

const ok = (t) => ({ t, ok: true });
const no = (t) => ({ t });
const DATES = (d) => { const [y, m, g] = d.split('-'); return [d, `${g}/${m}/${y}`, `${g}-${m}-${y}`, `${y}/${m}/${g}`, `${g}.${m}.${y}`]; };
const cookieIs = (v) => new Function(`return /(?:^|; )vl_country=${v}/.test(document.cookie) && document.documentElement.lang === '${v === 'FR' ? 'fr' : 'it'}'`);

export const UNITS = [
  {
    id: 'u1', icon: '🧭', title: 'Orientarsi in Elements',
    lessons: [
      {
        id: 'u1l1', title: 'Apri la cassetta degli attrezzi', page: 'plp',
        tip: { title: 'Da schermo a codice in un clic', body: '[[inspect]] → clic sull\'elemento → in Elements risali i genitori finché trovi il contenitore con gli attributi `data-*`. Lì quasi sempre c\'è il codice prodotto.' },
        steps: [
          { type: 'intro', page: 'any', text: 'Il negozio dietro questo pannello, **Maison Velluto**, è finto ma costruito come il vostro: catalogo in **Akeneo**, PLP servite da **Algolia**, PDP da **SAP Commerce Cloud**, analytics in **Adobe**. E ci sono bug di dati messi apposta.\n\nOgni domanda si risolve **aprendo i DevTools su questa pagina**. Consiglio: agganciali in basso (menu ⋮ dei DevTools → *Dock side*) così vedi sia il sito che me.' },
          { type: 'mcq', page: 'any', text: 'Come apri i DevTools?', options: [ok('[[devtools]] (oppure tasto destro → Ispeziona)'), no('[[source]]'), no('[[find]]'), no('[[device]]')], explain: 'Con tasto destro → *Ispeziona* i DevTools si aprono già posizionati sull\'elemento che hai cliccato.' },
          { type: 'mcq', page: 'any', text: 'E la scorciatoia del **selettore di elementi** (la freccina nell\'angolo in alto a sinistra dei DevTools)?', options: [ok('[[inspect]]'), no('[[gsearch]]'), no('[[cmd]]'), no('[[reload]]')], explain: 'Col selettore attivo, passando sopra la pagina vedi dimensioni e classi di ogni elemento; cliccando, Elements salta al suo codice.' },
          { type: 'find', text: 'Attiva il selettore ([[inspect]]) e clicca sul **nome** del primo prodotto della griglia. In Elements si evidenzia il suo tag: quale tag HTML è?', placeholder: 'es. div', answers: ['h3'], mode: 'text', hints: ['Il tag è la prima parola dopo `<` nella riga evidenziata.', 'È un titolo (heading) di terzo livello.'], solution: '`h3`', explain: 'Il selettore è il modo più rapido per passare da "quella cosa a schermo" al suo codice.' },
          { type: 'find', text: 'Risali di qualche livello dal titolo: il contenitore del prodotto è un `<article class="product-tile">` con degli attributi `data-*`. Che valore ha `data-pid` del primo prodotto?', placeholder: 'codice prodotto', answers: ['VL2041'], mode: 'code', hints: ['Gli attributi stanno nel tag di apertura: `data-pid="…"`.', 'Usa i triangolini ▸ per espandere/chiudere i nodi e risalire fino ad `article`.'], solution: '`VL2041`', explain: '`data-pid` (o `data-product-id`, `data-sku`…) è quasi sempre il codice che arriva dal back-end: il ponte tra lo schermo e Akeneo.' },
        ],
      },
      {
        id: 'u1l2', title: 'Attributi data-* e dati nascosti', page: 'plp',
        tip: { title: 'Cerca con i selettori', body: 'In Elements, [[find]] accetta anche selettori CSS: `[data-pid="VL2041"]`, `img[alt=""]`, `.badge`. È il modo più rapido per trovare un elemento in una pagina enorme.' },
        steps: [
          { type: 'intro', text: 'Il front spesso "appende" dati del back-end agli elementi come attributi `data-*` (codice, colore, posizione…).\n\nE alcuni dati arrivano ma **non si vedono**: nascosti dal CSS. Quando il merch dice *"l\'ho messo in Akeneo ma non appare"*, la prima domanda è: arriva ed è nascosto, o non arriva proprio?' },
          { type: 'find', text: 'Che codice colore (`data-color-code`) ha il **Mocassino Brera**?', placeholder: 'codice colore', answers: ['R022'], mode: 'code', hints: ['Tasto destro sulla card del Mocassino Brera → Ispeziona.', 'Risali fino all\'`article`: l\'attributo è lì accanto a `data-pid`.'], solution: '`R022`' },
          { type: 'find', text: 'Nella card del Mocassino Brera c\'è un **badge** che il back-end ha inviato ma che a schermo non vedi. Che testo contiene?', placeholder: 'testo del badge', answers: ['Edizione limitata'], mode: 'text', hints: ['Espandi il `div class="tile-media"` della card.', 'Cerca uno `span` con classe `badge`: in Elements gli elementi nascosti si vedono comunque.'], solution: '"Edizione limitata"', explain: 'Il dato arriva, ma una regola CSS lo nasconde. In Styles vedrai anche il commento che spiega perché.' },
          { type: 'do', text: 'Rendilo visibile: seleziona lo `span` del badge e nel pannello **Styles** togli la spunta alla dichiarazione `display: none`. Poi premi Verifica.', hints: ['Styles è il pannello accanto all\'albero di Elements: mostra le regole CSS dell\'elemento selezionato.', 'Passa col mouse sulla riga `display: none;` e clicca la casellina che compare a sinistra.'], check: () => { const b = document.querySelector('.product-tile .badge--limited'); return !!b && getComputedStyle(b).display !== 'none' && b.getClientRects().length > 0; }, explain: 'Hai testato una modifica CSS senza toccare il codice. Ora puoi scrivere al team front: "basta togliere questa regola".' },
          { type: 'find', text: 'Una delle card ha l\'immagine con l\'attributo `alt` **vuoto** (male per SEO e accessibilità). Che `data-pid` ha quella card?', placeholder: 'codice prodotto', answers: ['VL2275'], mode: 'code', hints: ['In Elements premi [[find]] e cerca il selettore `img[alt=""]`.', 'Quando trovi l\'`img`, risali al suo `article` per leggere il codice.'], solution: '`VL2275` (Sneaker Lumen)', explain: 'L\'alt viene dalla descrizione immagine nel PIM/DAM: alt vuoto = dato mancante a monte.' },
          { type: 'mcq', text: 'Vedi un `data-*` in Elements. Come capisci se l\'ha scritto il **server** o il **JavaScript** del front?', options: [ok('Controllo se c\'è anche nel sorgente originale ([[source]]): se c\'è, l\'ha mandato il server'), no('Tutti i data-* arrivano dal server'), no('Quelli colorati in viola sono del JavaScript'), no('Non si può sapere')], explain: 'Elements mostra il DOM *vivo* (dopo il JavaScript), il sorgente mostra cosa ha mandato il server. È l\'argomento della prossima unità.' },
        ],
      },
      {
        id: 'u1l3', title: 'Modifiche finte, effetti veri', page: 'plp',
        tip: { title: 'Screenshot di un solo elemento', body: '[[cmd]] apre il Command Menu dei DevTools: scrivi "screenshot" → *Capture node screenshot* per fotografare solo il nodo selezionato, oppure *Capture full size screenshot* per l\'intera pagina.' },
        steps: [
          { type: 'intro', text: 'Tutto quello che cambi nei DevTools vive **solo nel tuo browser** finché non ricarichi. Perfetto per mock-up al volo (*"come verrebbe con questo nome?"*) senza rompere nulla.' },
          { type: 'do', text: 'In Elements fai doppio clic sul **testo** del nome del primo prodotto e cambialo in `Ciao`. Invio, poi Verifica.', hints: ['Seleziona l\'`h3` del primo prodotto ed espandilo: il testo è dentro.', 'Doppio clic sul testo (non sul nome del tag). In alternativa: tasto destro sul nodo → *Edit as HTML*.'], check: () => { const n = document.querySelector('.product-tile .tile-name'); return !!n && n.textContent.trim().toLowerCase() === 'ciao'; } },
          { type: 'mcq', text: 'Ora ricarichi la pagina ([[reload]]). Cosa succede al nome?', options: [ok('Torna quello originale: la modifica era solo nel mio browser'), no('Resta "Ciao" per tutti'), no('Resta "Ciao" solo per me'), no('Si aggiorna anche in Akeneo')] },
          { type: 'find', text: 'Con [[find]] in Elements cerca il selettore `.product-tile`. Quanti risultati trova?', placeholder: 'numero', answers: ['8'], mode: 'num', hints: ['Clicca prima dentro l\'albero di Elements, poi [[find]].', 'Il contatore compare a destra della barra di ricerca (es. "1 of …").'], solution: '8' },
          { type: 'mcq', text: 'Vuoi mostrare al team come apparirebbe un nome prodotto diverso, senza toccare nulla. Cosa fai?', options: [ok('Cambio il testo in Elements e faccio uno screenshot'), no('Chiedo un deploy di test'), no('Cambio il nome in Akeneo e poi lo rimetto'), no('Apro il sorgente con [[source]] e lo modifico')], explain: 'Bonus: [[cmd]] → "screenshot" → *Capture node screenshot* fotografa solo l\'elemento selezionato.' },
        ],
      },
    ],
  },
  {
    id: 'u2', icon: '📄', title: 'Sorgente vs DOM',
    lessons: [
      {
        id: 'u2l1', title: 'Cosa manda davvero il server', page: 'plp',
        tip: { title: 'CSR o SSR in 5 secondi', body: '[[source]] e cerca il nome di un prodotto. C\'è → la pagina arriva già pronta dal server (SSR). Non c\'è → la costruisce il JavaScript (CSR) e i dati stanno in una chiamata del Network (qui: Algolia).' },
        steps: [
          { type: 'intro', page: 'any', text: 'Due viste diverse della stessa pagina:\n\n**Sorgente** ([[source]]) = l\'HTML così come l\'ha mandato il server.\n**Elements** = il DOM *dopo* che il JavaScript ha lavorato.\n\nSe un dato è in Elements ma non nel sorgente, l\'ha aggiunto il front, di solito da una chiamata API.' },
          { type: 'mcq', text: 'Sulla PLP apri il sorgente ([[source]]) e cerca ([[find]]) `Mocassino Brera`. Lo trovi?', options: [ok('No: i prodotti li disegna il JavaScript dopo il caricamento'), no('Sì, dentro un h3'), no('Sì, ma commentato'), no('Il sorgente è una pagina bianca')], explain: 'La PLP è renderizzata lato client (CSR): la lista arriva da una chiamata ad **Algolia**. La vedrai nell\'unità Network.' },
          { type: 'mcq', page: 'pdp:VL2041', text: 'Ora vai sulla PDP del **Décolleté Aurora** e fai lo stesso cercando `Décolleté Aurora`. C\'è nel sorgente?', options: [ok('Sì: questa pagina arriva già costruita dal server (SSR)'), no('No, come nella PLP'), no('Solo nel title'), no('Solo dopo aver scelto la taglia')] },
          { type: 'find', page: 'pdp:VL2041', text: 'Nel sorgente della PDP c\'è un **commento HTML** che dice quando è stata generata la pagina. Che data? (AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: DATES('2026-09-14'), mode: 'text', hints: ['I commenti HTML iniziano con `<!--`.', 'Cerca la parola `rendered` nel sorgente (o in Elements, i commenti si vedono anche lì).'], solution: '2026-09-14 (`rendered=2026-09-14T08:15:02Z`)', explain: 'Molte piattaforme lasciano commenti o header con data, nodo, cache HIT/MISS. Oro quando devi capire se una pagina è "vecchia".' },
          { type: 'mcq', page: 'pdp:VL2041', text: 'E il **prezzo**? È nel sorgente della PDP?', options: [ok('No: arriva dopo, dalla chiamata a SAP'), no('Sì, nel JSON-LD'), no('Sì, nel title'), no('Sì, ma in un commento')], explain: 'Pattern comunissimo: pagina in cache, prezzo e disponibilità chiesti in tempo reale.' },
        ],
      },
      {
        id: 'u2l2', title: 'Dati strutturati e meta tag', page: 'pdp:VL2041',
        tip: { title: 'JSON-LD: il catalogo per Google', body: 'In Elements [[find]] → `ld+json`. Dentro trovi sku, gtin, brand, materiale, origine: se qui c\'è un dato sbagliato, è sbagliato anche su Google. Validalo con il Rich Results Test di Google.' },
        steps: [
          { type: 'intro', text: 'Nel `<head>` delle PDP ci sono dati pensati per le macchine:\n\n**JSON-LD** (`<script type="application/ld+json">`) → letto da Google\n**Open Graph** (`og:*`) → anteprime sui social e in chat\n**canonical** e **hreflang** → SEO e versioni per lingua' },
          { type: 'find', text: 'Trova il blocco JSON-LD: che **gtin13** (EAN) dichiara?', placeholder: '13 cifre', answers: ['8056789204110'], mode: 'num', hints: ['In Elements espandi `<head>`, oppure [[find]] → `gtin13`.', 'Funziona anche dal sorgente ([[source]]).'], solution: '8056789204110' },
          { type: 'find', text: 'Sempre nel JSON-LD: che valore ha `countryOfOrigin`?', placeholder: 'valore', answers: ['IT', 'Italia', 'Italy'], mode: 'text', hints: ['È poco sotto `material`.'], solution: '`IT`', explain: 'Tienilo a mente: ci servirà in un\'indagine. 🕵️' },
          { type: 'find', text: 'Quanti tag `<link rel="alternate" hreflang="…">` ci sono nella pagina (x-default compreso)?', placeholder: 'numero', answers: ['4'], mode: 'num', hints: ['In Elements [[find]] → selettore `link[hreflang]` e leggi il contatore.'], solution: '4 (it-it, fr-fr, en-gb, x-default)' },
          { type: 'find', text: 'Che **nome file** ha l\'immagine dichiarata in `og:image`?', placeholder: 'nomefile.ext', answers: ['VL2041-N001.svg', 'VL2041-N001'], mode: 'url', hints: ['Cerca `og:image` tra i `<meta>`: il valore è in `content`.', 'Ti basta l\'ultima parte dell\'URL, dopo l\'ultimo `/`.'], solution: '`VL2041-N001.svg`' },
          { type: 'mcq', text: 'A cosa serve il `<link rel="canonical">`?', options: [ok('A dire ai motori di ricerca qual è l\'URL "ufficiale" della pagina, evitando duplicati (es. con parametri)'), no('A caricare il CSS principale'), no('A tradurre la pagina'), no('A tracciare le visite in Adobe')] },
        ],
      },
    ],
  },
  {
    id: 'u3', icon: '📡', title: 'Network: le chiamate',
    lessons: [
      {
        id: 'u3l0', title: 'Chi parla con il front', page: 'plp',
        tip: { title: 'Riconoscere i sistemi dall\'URL', body: '`/1/indexes/…` + header `x-algolia-*` → **Algolia** (PLP, ricerca).\n`/occ/v2/<sito>/…` → **SAP Commerce Cloud** (PDP, carrello).\n`/b/ss/…` → **Adobe Analytics**.\nAkeneo e il BEIL non li vedi mai dal browser: vedi solo cosa è arrivato a valle.' },
        steps: [
          { type: 'intro', page: 'any', text: 'Il viaggio di un attributo da voi:\n\n**Akeneo** → **BEIL** (integrazione Azure) → **Algolia** (PLP, ricerca) e **SAP CC** (PDP) → **front** → **Adobe**\n\nDal browser **non vedi Akeneo né il BEIL**: vedi solo le due "copie" del dato arrivate ad Algolia e a SAP. Il trucco di questo corso è confrontarle.' },
          { type: 'mcq', text: 'Apri **Network**, filtro **Fetch/XHR**, e ricarica la PLP. Una chiamata contiene `/1/indexes/` e ha header che iniziano con `x-algolia-`. Che cos\'è?', options: [ok('La ricerca su Algolia che porta la lista prodotti'), no('Una chiamata ad Akeneo'), no('Il tracciamento di Adobe'), no('Un file di traduzioni')] },
          { type: 'find', text: 'L\'ultima parte di quell\'URL è il **nome dell\'indice** Algolia interrogato. Qual è? (senza parametri)', placeholder: 'nome indice', answers: ['vl_prod_it_IT'], mode: 'url', hints: ['È il valore nella colonna *Name*, prima del `?`.'], solution: '`vl_prod_it_IT`', explain: 'Un indice per mercato e lingua: un prodotto può esserci nell\'indice italiano e mancare in quello francese. Lo vedremo in un\'indagine.' },
          { type: 'mcq', page: 'pdp:VL2041', text: 'Ora sulla PDP del Décolleté Aurora: c\'è una chiamata con `/occ/v2/` nell\'URL. Che sistema è?', options: [ok('SAP Commerce Cloud: OCC sono le sue API REST'), no('Algolia'), no('Akeneo'), no('Il BEIL')], explain: 'OCC = *Omni Commerce Connect*: è il modo in cui il front chiede a SAP CC prodotto, prezzo, varianti, stock, carrello.' },
          { type: 'find', page: 'pdp:VL2041', text: 'Nell\'URL OCC, il pezzo subito dopo `/occ/v2/` è il **baseSite** (il sito/mercato in SAP). Qual è?', placeholder: 'baseSite', answers: ['vl-it'], mode: 'text', hints: ['Passa il mouse sulla riga per vedere l\'URL completo, oppure Headers → *Request URL*.'], solution: '`vl-it`' },
          { type: 'mcq', page: 'any', text: 'Il merch ha cambiato un attributo in Akeneo un\'ora fa e sul sito non lo vede. Qual è la prima cosa da fare nei DevTools?', options: [ok('Cercare il valore nella risposta di Algolia e in quella di SAP: chi ha il valore nuovo e chi no ti dice quale flusso si è fermato'), no('Svuotare la cache del browser e basta'), no('Aprire il sorgente e cercare la data'), no('Niente: dal browser non si può capire')], explain: 'Esempio: Algolia nuovo e SAP vecchio → il problema è nel passaggio verso SAP (flusso BEIL o sync del catalogo), non in Akeneo.' },
        ],
      },
      {
        id: 'u3l1', title: 'Fetch/XHR: leggere la risposta', page: 'plp',
        tip: { title: 'Il flusso base del Network', body: 'Network → filtro **Fetch/XHR** → [[reload]] → clic sulla chiamata → **Preview** (JSON navigabile), **Response** (testo grezzo), **Headers** (URL e status), **Payload** (parametri).' },
        steps: [
          { type: 'intro', text: 'Il pannello **Network** registra tutto quello che la pagina scarica. Il filtro **Fetch/XHR** isola le chiamate API.\n\nRegola d\'oro: apri Network **prima** di ricaricare, altrimenti è vuoto.' },
          { type: 'find', text: 'Con **Fetch/XHR** attivo e la PLP ricaricata, quante chiamate vedi?', placeholder: 'numero', answers: ['2'], mode: 'num', hints: ['Se la lista è vuota, ricarica con il pannello Network aperto.', 'Conta solo con il filtro Fetch/XHR attivo.'], solution: '2: i testi del front (`it-IT.json`) e Algolia (`vl_prod_it_IT`)' },
          { type: 'find', text: 'Apri la risposta di Algolia, scheda **Preview**. Quanti prodotti totali dichiara `nbHits`?', placeholder: 'numero', answers: ['23'], mode: 'num', hints: ['`nbHits` è al primo livello del JSON, sotto `hits`.'], solution: '23 (su più pagine)' },
          { type: 'find', text: 'E quanti elementi ci sono nell\'array `hits` di questa pagina?', placeholder: 'numero', answers: ['9'], mode: 'num', hints: ['Espandi `hits`: gli elementi sono numerati da 0.', 'Anche `hitsPerPage` ti dà un indizio.'], solution: '9' },
          { type: 'find', text: 'A schermo vedi 8 prodotti, Algolia ne manda 9. Quale `objectID` **manca** a schermo?', placeholder: 'codice prodotto', answers: ['VL3307'], mode: 'code', hints: ['Confronta gli `objectID` in `hits` con i `data-pid` delle card.', 'Scorciatoia in Console: `$$(\'.product-tile\').map(t => t.dataset.pid)`'], solution: '`VL3307` (Sandalo Capri)' },
          { type: 'mcq', text: 'Guarda i dati di quel prodotto nella risposta. Perché il front non lo mostra?', options: [ok('Ha l\'array `images` vuoto'), no('Ha `isOnline: false`'), no('Non ha prezzo'), no('La chiamata è andata in errore')], explain: 'Il prodotto è indicizzato ma senza immagini, e il front scarta i prodotti senza immagini. È uno dei motivi classici di *"prodotto online ma non visibile"*.' },
        ],
      },
      {
        id: 'u3l2', title: 'Parametri, header e status', page: 'plp',
        tip: { title: 'Il ticket perfetto al team tecnico', body: 'Tasto destro sulla chiamata → **Copy → Copy as cURL** e incollalo nel ticket. Chi lo riceve ha URL, parametri e header esatti e riproduce il problema in un minuto.' },
        steps: [
          { type: 'intro', text: 'Ogni chiamata ha:\n**URL + parametri** → cosa chiedi\n**header** → metadati (chiavi, canale, lingua…)\n**status** → 200 ok, 304 da cache, 404 non trovato, 500 errore server\n**risposta** → i dati' },
          { type: 'find', text: 'Chiamata Algolia, scheda **Payload**: che valore ha il parametro `filters`?', placeholder: 'valore', answers: ['categoryPageId:calzature-donna'], mode: 'code', hints: ['Payload → *Query String Parameters*.'], solution: '`categoryPageId:calzature-donna`', explain: 'Ecco come la PLP "sa" quali prodotti mostrare: filtra l\'indice per categoria. Se in Akeneo un prodotto non ha questa categoria, qui non esce.' },
          { type: 'find', text: 'Scheda **Headers** → *Request Headers*: che valore ha `x-algolia-application-id`?', placeholder: 'valore', answers: ['VLDEMO01'], mode: 'code', hints: ['Scorri oltre *Response Headers* fino a *Request Headers*.'], solution: '`VLDEMO01`' },
          { type: 'find', text: 'Che **status code** ha la chiamata Algolia?', placeholder: 'numero', answers: ['200', '304'], mode: 'num', hints: ['È nella colonna *Status*, o in Headers → *General*.'], solution: '200 (o 304 se servita dalla cache)' },
          { type: 'find', text: 'Cambia l\'ordinamento della PLP in **Prezzo crescente**. Parte una nuova chiamata Algolia: che indice interroga?', placeholder: 'nome indice', answers: ['vl_prod_it_IT_price_asc'], mode: 'url', hints: ['Guarda la nuova riga comparsa in fondo alla lista.'], solution: '`vl_prod_it_IT_price_asc`', explain: 'In Algolia ogni ordinamento è una **replica** dell\'indice. Se una replica non si aggiorna, l\'ordinamento per prezzo mostra dati vecchi anche se "Novità" è giusto.' },
          { type: 'mcq', text: 'Tasto destro su una chiamata → **Copy → Copy as cURL**. A cosa ti serve?', options: [ok('A riprodurre la stessa identica chiamata fuori dal browser o a girarla al team tecnico'), no('A scaricare la pagina come PDF'), no('A copiare solo il JSON di risposta'), no('A bloccare la chiamata')] },
          { type: 'mcq', text: 'Clicchi un bottone, la pagina ti reindirizza e le chiamate spariscono dal Network. Cosa attivi?', options: [ok('Preserve log'), no('Disable cache'), no('Offline'), no('Big request rows')], explain: '**Preserve log** mantiene la lista tra un caricamento e l\'altro: indispensabile per checkout, login e redirect.' },
        ],
      },
      {
        id: 'u3l3', title: 'Caccia all\'errore', page: 'plp',
        tip: { title: 'Trova l\'errore in 3 mosse', body: '1) Network + [[reload]]  2) cerca le righe rosse (4xx/5xx) o scrivi `status-code:404` nel filtro  3) la colonna **Initiator** dice quale script ha fatto la chiamata. Per simulare un KO: tasto destro → *Block request URL*.' },
        steps: [
          { type: 'find', text: 'Una card della PLP non mostra l\'immagine. Filtra il Network per **Img** e ricarica: come si chiama il file in rosso?', placeholder: 'nomefile.ext', answers: ['VL2302-W01O.svg', 'VL2302-W01O'], mode: 'url', hints: ['Le richieste fallite sono scritte in rosso.', 'Copialo esattamente, lettera per lettera: c\'è un tranello.'], solution: '`VL2302-W01O.svg`' },
          { type: 'find', text: 'Che status code ha quella richiesta?', placeholder: 'numero', answers: ['404'], mode: 'num', solution: '404 (Not Found)' },
          { type: 'mcq', text: 'Il codice colore del prodotto è `W010`. Confrontalo con il nome del file: dov\'è il problema?', options: [ok('Nel nome file c\'è una O (lettera) al posto dello 0 (zero): il percorso immagine nel dato è sbagliato'), no('Il server delle immagini è giù'), no('Il CSS nasconde l\'immagine'), no('L\'immagine è troppo pesante')], explain: 'Classico errore di naming tra DAM e PIM. Si corregge il dato a monte, non il front.' },
          { type: 'do', text: 'Simula Algolia KO: in Network tasto destro sulla chiamata `vl_prod_it_IT` → **Block request URL**, poi ricarica e Verifica.', hints: ['Togli il filtro Img e rimetti Fetch/XHR per ritrovare la chiamata.', 'Alternativa: [[cmd]] → scrivi "request blocking" → *Show Network request blocking* → aggiungi il pattern `*indexes*`.'], check: () => !!document.querySelector('.plp-error') },
          { type: 'mcq', text: 'Cosa vede il cliente quando Algolia non risponde?', options: [ok('Un messaggio "Al momento non riusciamo a mostrare i prodotti"'), no('I prodotti con prezzo 0 €'), no('Una pagina bianca'), no('I prodotti del giorno prima')], explain: 'La PLP dipende al 100% da Algolia. La PDP invece no: arriva da SAP.' },
          { type: 'do', text: 'Ora **sblocca** la richiesta (togli la spunta nel pannello *Network request blocking*, in basso) e ricarica: i prodotti devono tornare.', hints: ['Il pannello di blocco si apre in basso nei DevTools; puoi anche disattivare "Enable network request blocking".'], check: () => !document.querySelector('.plp-error') && document.querySelectorAll('.product-tile').length > 0 },
          { type: 'find', page: 'pdp:VL2041', text: 'Sulla PDP del Décolleté Aurora una chiamata Fetch/XHR verso SAP fallisce **in silenzio** (a schermo nessun errore). Che status code ha?', placeholder: 'numero', answers: ['404'], mode: 'num', hints: ['Fetch/XHR + ricarica, cerca la riga rossa.', 'Anche la Console la segnala in rosso.'], solution: '404' },
          { type: 'mcq', page: 'pdp:VL2041', text: 'L\'URL di quella chiamata finisce con `/references`. Quale parte della pagina manca per colpa sua?', options: [ok('I consigli "Ti potrebbe piacere" (prodotti collegati in SAP)'), no('Il prezzo'), no('Le taglie'), no('L\'immagine principale')], explain: 'Il front ignora l\'errore e nasconde la sezione: per il cliente "non c\'è", per te è un 404 da segnalare.' },
          { type: 'find', page: 'pdp:VL2041', text: 'Colonna **Initiator**: quale file JavaScript ha lanciato la chiamata OCC del prodotto?', placeholder: 'nomefile.js', answers: ['pdp.js'], mode: 'url', hints: ['Se non vedi la colonna, tasto destro sull\'intestazione della tabella → spunta *Initiator*.', 'Ignora il numero di riga dopo i due punti.'], solution: '`pdp.js`' },
        ],
      },
      {
        id: 'u3l4', title: 'Cerca in tutte le risposte', page: 'pdp:VL2041',
        tip: { title: 'Il superpotere: cerca un valore ovunque', body: 'Network aperto → [[reload]] → [[find]] con il focus nel pannello Network (o icona 🔍) → scrivi il valore che vedi in Akeneo. Trovi la chiamata **e** il campo. Funziona anche su header e URL.' },
        steps: [
          { type: 'intro', text: 'Domanda tipica: *"questo attributo che abbiamo in Akeneo arriva al front? Con che nome?"*\n\nNon serve aprire una chiamata alla volta: il Network ha una **ricerca dentro tutte le risposte**. Si apre con [[find]] mentre il pannello Network è attivo (o con l\'icona 🔍).\n\nAttenzione: in SAP gli attributi di Akeneo diventano **feature** di una classificazione, con un codice tipo `…/shoes.nome_attributo`.' },
          { type: 'find', text: 'Ricarica la PDP con il Network aperto, poi cerca `Archivio 1987`. In quale richiesta compare? (nome nella colonna Name, senza parametri)', placeholder: 'nome', answers: ['VL2041'], mode: 'url', hints: ['La ricerca si apre come pannello a sinistra della lista.', 'Clicca sul risultato: ti porta dentro la risposta.'], solution: '`VL2041` (la chiamata OCC del prodotto)' },
          { type: 'find', text: 'Quel valore sta in una feature. Che cosa c\'è nel suo `code` **dopo l\'ultimo punto**?', placeholder: 'nome attributo', answers: ['line'], mode: 'text', hints: ['Risali di qualche riga sopra `featureValues`: trovi `code: "VLClassification/1.0/shoes.…"`.'], solution: '`line`', explain: 'Spesso è lo stesso codice dell\'attributo in Akeneo: così colleghi PIM e sito.' },
          { type: 'find', text: 'A schermo il tacco è "8,5 cm". Nella feature `heel_height`, che **unità** (`featureUnit.symbol`) manda SAP?', placeholder: 'unità', answers: ['mm'], mode: 'text', hints: ['Cerca `heel_height` nella stessa risposta.'], solution: '`mm` (valore 85)' },
          { type: 'mcq', text: 'SAP manda `85` mm e il front mostra `8,5 cm`. Chi fa la conversione?', options: [ok('Il front-end (JavaScript)'), no('Akeneo'), no('Il browser, automaticamente'), no('Algolia')], explain: 'Se in Akeneo qualcuno inserisse già i cm (8,5), il front li dividerebbe ancora per 10 → "0,85 cm". Sapere chi trasforma cosa evita tanti bug.' },
          { type: 'find', text: 'Nella risposta c\'è una **stagione** che a schermo non compare da nessuna parte. Che valore ha?', placeholder: 'valore', answers: ['FW26'], mode: 'code', hints: ['Guarda tutte le feature della classificazione.'], solution: '`FW26` (feature `season`)', explain: 'Un attributo che arriva al front ma non viene usato: se il business lo vuole a schermo, il dato c\'è già, serve solo il lavoro front.' },
          { type: 'find', text: 'E un codice di **istruzioni di cura**, anche lui non mostrato. Valore?', placeholder: 'valore', answers: ['CR-07', 'CR07'], mode: 'code', hints: ['La feature finisce con `care_code`.'], solution: '`CR-07`' },
        ],
      },
    ],
  },
  {
    id: 'u4', icon: '💻', title: 'Console e Adobe',
    lessons: [
      {
        id: 'u4l1', title: 'La Console come lente', page: 'plp',
        tip: { title: 'Estrai una lista in 2 secondi', body: '`copy($$(\'.product-tile\').map(t => t.dataset.pid).join(\'\\n\'))` → incolla in Excel: un codice per riga. Utile per confrontare la PLP con un export di Akeneo.' },
        steps: [
          { type: 'intro', text: 'La **Console** ([[console]]) esegue JavaScript sulla pagina. Non serve essere sviluppatori, bastano 4 comandi:\n\n`$0` → l\'elemento selezionato in Elements\n`$$(\'selettore\')` → tutti gli elementi che corrispondono\n`copy(x)` → copia negli appunti\n`console.table(x)` → tabella leggibile' },
          { type: 'find', text: 'Scrivi in Console `$$(\'.product-tile\').length` e premi Invio. Risultato?', placeholder: 'numero', answers: ['8'], mode: 'num', hints: ['Se Chrome ti chiede di digitare "allow pasting", è perché hai incollato: scrivilo a mano o segui le istruzioni.'], solution: '8' },
          { type: 'do', text: 'Crea in Console una variabile `pids` con l\'elenco dei `data-pid` di tutte le card. La forma è: `pids = $$(…).map(t => t.dataset.pid)`', hints: ['Il selettore è lo stesso di prima: `.product-tile`.', '`t.dataset.pid` legge l\'attributo `data-pid` di ogni card.', 'Soluzione: `pids = $$(\'.product-tile\').map(t => t.dataset.pid)`'], check: () => Array.isArray(window.pids) && window.pids.length === 8 && window.pids.includes('VL2041'), explain: 'Aggiungi `copy(pids)` e hai la lista pronta da incollare accanto a un export di Akeneo.' },
          { type: 'mcq', text: 'Selezioni una card in Elements e scrivi `$0.dataset` in Console. Cosa ottieni?', options: [ok('Tutti i suoi attributi data-* come oggetto'), no('Il prezzo del prodotto'), no('Un errore'), no('Il CSS della card')] },
          { type: 'find', text: 'Molti siti salvano lo stato iniziale della pagina in una variabile globale. Qui si chiama `__VL_STATE__`: scrivila in Console. Che valore ha `search.provider`?', placeholder: 'valore', answers: ['algolia'], mode: 'text', hints: ['Espandi l\'oggetto con le freccine ▸.', 'È dentro `search`.'], solution: '`algolia`', explain: 'Nei siti veri cerca variabili come `__NEXT_DATA__`, `__NUXT__`, `__INITIAL_STATE__`, o uno `<script type="application/json">` di stato: spesso dentro c\'è tutto il prodotto.' },
          { type: 'find', text: 'E quanti prodotti per pagina chiede (`hitsPerPage`)?', placeholder: 'numero', answers: ['9'], mode: 'num', solution: '9' },
        ],
      },
      {
        id: 'u4l2', title: 'Adobe: cosa vede Analytics', page: 'plp',
        tip: { title: 'Vedere i dati di Adobe senza Adobe', body: 'Console: `adobeDataLayer` (cosa racconta il sito). Network: filtra per `b/ss` (cosa parte davvero verso Adobe) e leggi la scheda **Payload**. Per un controllo più comodo c\'è l\'estensione *Adobe Experience Platform Debugger*. Contentsquare invece registra il comportamento (click, scroll): utile per capire *come* gli utenti usano la pagina, non *cosa* comprano.' },
        steps: [
          { type: 'intro', text: 'Il tracciamento Adobe ha due pezzi che puoi vedere tu:\n\n**`adobeDataLayer`** (Console) → l\'array dove il sito racconta cosa succede: lista vista, prodotto visto, aggiunta al carrello…\n**Il beacon** (Network, URL con `/b/ss/`) → la chiamata che parte verso Adobe, con dentro `pageName`, `events`, `products`, eVar. **È questo che finisce nei report.**' },
          { type: 'find', text: 'Scrivi `adobeDataLayer` in Console. Quale `event` contiene la lista prodotti della PLP?', placeholder: 'nome evento', answers: ['product-list-view'], mode: 'text', hints: ['Espandi gli elementi dell\'array uno per uno.'], solution: '`product-list-view`' },
          { type: 'find', text: 'Che `listName` ha la lista?', placeholder: 'valore', answers: ['Calzature Donna'], mode: 'text', hints: ['È dentro `productList`.'], solution: '"Calzature Donna"' },
          { type: 'find', text: 'Ora in Network scrivi `b/ss` nel filtro (tutti i tipi, non solo Fetch/XHR) e ricarica. Apri il beacon, scheda **Payload**: che `pageName` manda?', placeholder: 'valore', answers: ['vl:it:plp:calzature-donna'], mode: 'text', hints: ['Il filtro è la casella di testo in alto a sinistra nel Network.', 'Il beacon è una richiesta di tipo immagine (gif).'], solution: '`vl:it:plp:calzature-donna`', explain: 'Se in Adobe un report "per pagina" ha nomi strani, il `pageName` del beacon è il primo posto dove guardare.' },
          { type: 'find', page: 'pdp:VL2041', text: 'Vai sulla PDP del Décolleté Aurora e guarda il suo beacon. Che valore ha `events`?', placeholder: 'valore', answers: ['prodView'], mode: 'text', solution: '`prodView` (prodotto visto)' },
          { type: 'do', page: 'pdp:VL2041', text: 'Scegli la taglia **38** e aggiungi al carrello.', hints: ['Il colore nero è quello selezionato di default.'], check: () => { try { return (JSON.parse(localStorage.getItem('vl_cart')) || []).some((l) => l.sku === 'VL2041-N001-38'); } catch (e) { return false; } } },
          { type: 'find', page: 'pdp:VL2041', text: 'È partito un nuovo beacon con `events=scAdd`. Nel parametro `products`, in quale **eVar** finisce la taglia?', placeholder: 'es. eVar1', answers: ['eVar13'], mode: 'text', hints: ['`products` ha la forma `;codice;quantità;prezzo;;eVarX=…|eVarY=…`'], solution: '`eVar13` (la taglia), mentre `eVar12` è il colore', explain: 'Ora sai verificare da solo se un report Adobe "per taglia" o "per colore" riceve il dato giusto.' },
        ],
      },
    ],
  },
  {
    id: 'u5', icon: '🍪', title: 'Cookie e storage',
    lessons: [
      {
        id: 'u5l1', title: 'Il cookie che cambia mercato', page: 'plp',
        tip: { title: 'Testare un altro mercato', body: 'Application → Cookies: cambia il cookie di paese/lingua e [[reload]]. Poi nel Network controlla che indice Algolia e che baseSite SAP vengono chiamati. (Sui siti veri il mercato dipende spesso anche dall\'URL o dall\'IP.)' },
        steps: [
          { type: 'intro', text: 'Il pannello **Application** (se non lo vedi, è dietro »): qui vivono **Cookie**, **Local Storage** e **Session Storage**.\n\nI cookie spesso decidono paese, lingua, valuta e varianti dei test A/B. Cambiare mercato = cambiare **indice Algolia** e **baseSite SAP**.' },
          { type: 'find', text: 'Application → Cookies → questo sito. Che valore ha `vl_country`?', placeholder: 'valore', answers: ['IT'], mode: 'code', hints: ['Nella colonna di sinistra: *Storage → Cookies* → clicca l\'indirizzo del sito.'], solution: '`IT`' },
          { type: 'find', text: 'In che variante del test A/B sei? Leggi il cookie `vl_ab`.', placeholder: 'valore', answers: ['plp_grid:B', 'B'], mode: 'text', solution: '`plp_grid:B`', explain: 'La variante B mostra la griglia a 4 colonne, la A a 3. Lo stesso valore finisce anche nel beacon Adobe (`c5`).' },
          { type: 'do', text: 'Doppio clic sul valore di `vl_country`, scrivi `FR`, Invio, poi **ricarica** la pagina.', hints: ['Il valore si modifica direttamente nella tabella.', 'Dopo la modifica serve [[reload]]: il sito legge il cookie al caricamento.'], check: cookieIs('FR') },
          { type: 'find', text: 'Nel Network (Fetch/XHR): che indice Algolia interroga adesso la PLP?', placeholder: 'nome indice', answers: ['vl_prod_fr_FR'], mode: 'url', solution: '`vl_prod_fr_FR`' },
          { type: 'find', text: 'Che prezzo ha il Décolleté Aurora in Francia? (solo il numero)', placeholder: 'numero', answers: ['990'], mode: 'num', solution: '990 €' },
          { type: 'find', text: 'Quanti prodotti dichiara l\'indice francese (`nbHits`)? Confrontalo con l\'italiano (23).', placeholder: 'numero', answers: ['22'], mode: 'num', solution: '22: uno in meno! Lo indagheremo in un ticket.' },
          { type: 'do', text: 'Rimetti `vl_country` a `IT` e ricarica.', check: cookieIs('IT') },
        ],
      },
      {
        id: 'u5l2', title: 'Local Storage: la memoria del browser', page: 'plp',
        tip: { title: 'Ripartire puliti', body: 'Application → Storage → **Clear site data** cancella cookie, storage e cache del sito in un colpo: sei di nuovo un utente nuovo. Utile prima di testare banner, popup o test A/B.' },
        steps: [
          { type: 'find', text: 'Application → **Local Storage** → questo sito. C\'è una wishlist (`vl_wishlist`): che codice prodotto contiene?', placeholder: 'codice prodotto', answers: ['VL2188'], mode: 'code', solution: '`VL2188`' },
          { type: 'mcq', text: 'Differenza chiave tra cookie e Local Storage?', options: [ok('I cookie viaggiano verso il server a ogni richiesta, il Local Storage resta solo nel browser'), no('Sono la stessa cosa'), no('Il Local Storage scade dopo un\'ora'), no('I cookie non si possono modificare')] },
          { type: 'do', text: 'Svuota il carrello: in Local Storage seleziona la chiave `vl_cart` e cancellala (tasto Canc o icona ⊘), poi ricarica. Il contatore in alto deve essere 0. (Se `vl_cart` non c\'è, aggiungi qualcosa dalla PDP e torna qui.)', hints: ['Se non vedi il contatore aggiornato, ricarica.'], check: () => { let c; try { c = JSON.parse(localStorage.getItem('vl_cart') || '[]'); } catch (e) { c = null; } const n = document.querySelector('[data-cart-count]'); return Array.isArray(c) && c.length === 0 && !!n && n.textContent.trim() === '0'; } },
          { type: 'mcq', text: 'In questo negozio demo un collega vede il carrello pieno e tu vuoto. Com\'è possibile?', options: [ok('Il carrello è salvato nel Local Storage di ciascun browser'), no('Il server ha perso i dati'), no('Il carrello dipende dall\'orario'), no('È colpa della cache del CDN')], explain: 'Nei siti veri con SAP il carrello vive sul server (chiamate OCC `/carts`) e nel browser c\'è solo un riferimento al carrello: guardalo in Application.' },
        ],
      },
    ],
  },
  {
    id: 'u6', icon: '🔎', title: 'Sources: il codice',
    lessons: [
      {
        id: 'u6l1', title: 'Ricerca globale nel codice', page: 'plp',
        tip: { title: 'Dal dato al codice', body: '[[gsearch]] cerca in tutti i JS e CSS caricati. Cerca il nome del campo (es. `heel_height`) per scoprire dove il front lo usa e come lo trasforma.' },
        steps: [
          { type: 'intro', text: 'Quando un dato arriva (lo vedi nel Network) ma a schermo è diverso o non c\'è, la risposta sta nel **codice JavaScript** del front.\n\nLa **ricerca globale** cerca in tutti i file caricati dalla pagina.' },
          { type: 'mcq', text: 'Qual è la scorciatoia della ricerca globale nei DevTools?', options: [ok('[[gsearch]]'), no('[[find]]'), no('[[source]]'), no('[[device]]')] },
          { type: 'find', text: 'Trova nel codice la regola che scarta i prodotti senza immagini (cerca `images.length`). In quale file si trova?', placeholder: 'nomefile.js', answers: ['plp.js'], mode: 'url', hints: ['Apri la ricerca con [[gsearch]] e scrivi `images.length`.', 'Il risultato mostra il file e la riga.'], solution: '`plp.js`, funzione `isDisplayable`' },
          { type: 'find', text: 'In quale file è definita la funzione `formatPrice`?', placeholder: 'nomefile.js', answers: ['app.js'], mode: 'url', hints: ['Cerca `function formatPrice`.'], solution: '`app.js`' },
          { type: 'mcq', text: 'Apri un file e il codice è tutto su un\'unica riga illeggibile (minificato). Cosa premi?', options: [ok('Il pulsante `{}` (Pretty print) in basso nel pannello'), no('[[hardreload]]'), no('Disable cache'), no('Niente, non si può leggere')] },
          { type: 'mcq', text: 'Vuoi vedere come apparirebbe la PDP se SAP mandasse un valore diverso, senza toccare SAP. Cosa usi?', options: [ok('Local Overrides: tasto destro sulla chiamata → Override content, modifichi il JSON e ricarichi'), no('Preserve log'), no('Edit as HTML'), no('Disable cache')], explain: 'Ottimo per dimostrare al team "se il dato fosse così, la pagina verrebbe così".' },
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
          { type: 'do', text: 'Simula una rete lenta: in Network cambia **No throttling** in **3G**, poi ricarica e Verifica quando i prodotti sono comparsi.', hints: ['Il menu del throttling è nella barra in alto del pannello Network.', 'Nelle versioni recenti di Chrome le voci si chiamano "Slow 4G", "3G": scegli 3G.', 'Se tutto arriva subito, è la cache: spunta anche **Disable cache** in Network e ricarica.'], check: () => performance.getEntriesByType('resource').some((e) => e.name.includes('/indexes/') && (e.duration > 1000 || e.responseEnd > 1800)) },
          { type: 'mcq', text: 'Mentre carica, cosa vedi al posto dei prodotti?', options: [ok('Dei riquadri grigi pulsanti (skeleton) finché Algolia non risponde'), no('Una pagina bianca'), no('I prodotti senza prezzo'), no('Un messaggio di errore')], explain: 'Con la rete lenta capisci l\'**ordine** in cui arrivano i pezzi: prima l\'HTML, poi i testi, poi i prodotti da Algolia.' },
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
        id: 'u8l1', title: 'Ticket #4127 · Dato vecchio sulla PDP', page: 'pdp:VL2041',
        tip: { title: 'Confronta le due copie del dato', body: 'Stesso prodotto, cerca lo stesso attributo nella risposta **Algolia** (PLP) e in quella **SAP/OCC** (PDP), con le loro date (`lastIndexedAt`, `modifiedTime`). Chi ha il valore vecchio ti dice quale flusso dal BEIL si è fermato.' },
        steps: [
          { type: 'intro', text: '📨 **Ticket #4127** · Merchandising\n\n*"Il Décolleté Aurora in Akeneo è Made in **Romania** dal 27 ottobre, ma in PDP c\'è ancora Made in Italy."*\n\n📦 **Akeneo** · VL2041\n`made_in` = Romania · ultima modifica 27/10/2026 16:42' },
          { type: 'find', text: 'Cosa manda **SAP** (chiamata OCC del prodotto) nella feature `made_in`?', placeholder: 'valore', answers: ['Italia', 'Italy', 'IT'], mode: 'text', hints: ['Network → Fetch/XHR → chiamata `VL2041` → Preview → `classifications` → `features`.', 'Oppure cerca `made_in` con la ricerca del Network.'], solution: '"Italia"' },
          { type: 'find', text: 'Nella stessa risposta SAP: in che data è stato modificato il prodotto l\'ultima volta (`modifiedTime`)? (AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: DATES('2026-09-14'), mode: 'text', solution: '2026-09-14: prima della modifica in Akeneo' },
          { type: 'find', page: 'plp', text: 'Ora la controprova su **Algolia**: nella risposta della PLP, che `madeIn` ha l\'hit `VL2041`?', placeholder: 'valore', answers: ['Romania', 'RO'], mode: 'text', hints: ['Network → `vl_prod_it_IT` → Preview → `hits` → quello con `objectID: "VL2041"`.'], solution: '"Romania"' },
          { type: 'find', page: 'plp', text: 'E quando è stato indicizzato (`lastIndexedAt`)? (AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: DATES('2026-10-27'), mode: 'text', solution: '2026-10-27, subito dopo la modifica in Akeneo' },
          { type: 'mcq', page: 'any', text: 'Diagnosi?', options: [ok('Il flusso Akeneo → Algolia ha funzionato, quello verso SAP no: va controllato il passaggio BEIL → SAP (o la sincronizzazione del catalogo in SAP)'), no('Akeneo non ha salvato la modifica'), no('Il front traduce male il paese'), no('È la cache del browser di chi ha aperto il ticket')], explain: 'Anche il JSON-LD della PDP dice ancora `IT`: viene dallo stesso dato SAP. Quindi anche Google vede il valore vecchio.' },
          { type: 'mcq', page: 'any', text: 'Cosa alleghi alla risposta per il team tecnico?', options: [ok('Copy as cURL delle due chiamate (OCC con Italia e modifiedTime 14/09, Algolia con Romania e lastIndexedAt 27/10)'), no('Solo uno screenshot della pagina'), no('Il link al prodotto in Akeneo'), no('Niente, basta scrivere "non funziona"')] },
        ],
      },
      {
        id: 'u8l2', title: 'Ticket #4129 · Prezzo diverso PLP/PDP', page: 'plp',
        tip: { title: 'Due prezzi, due sistemi', body: 'In PLP il prezzo arriva da Algolia, in PDP da SAP. Se non coincidono, guarda `lastIndexedAt` nell\'hit Algolia: se è più vecchio del cambio prezzo, l\'indice va aggiornato (reindex).' },
        steps: [
          { type: 'intro', page: 'any', text: '📨 **Ticket #4129** · Customer care\n\n*"Un cliente ha visto lo **Stivaletto Navigli** a un prezzo in lista e a un altro nella pagina prodotto. Quale è giusto?"*' },
          { type: 'find', text: 'Che prezzo mostra la **PLP** per lo Stivaletto Navigli? (solo il numero)', placeholder: 'numero', answers: ['1090'], mode: 'num', solution: '1090 €' },
          { type: 'find', page: 'pdp:VL2210', text: 'E la **PDP**?', placeholder: 'numero', answers: ['1150'], mode: 'num', solution: '1150 €' },
          { type: 'find', page: 'pdp:VL2210', text: 'Nella risposta SAP (OCC), che `modifiedTime` ha il prodotto? (AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: DATES('2026-10-20'), mode: 'text', solution: '2026-10-20' },
          { type: 'find', text: 'Nell\'hit Algolia `VL2210`, quando è stato indicizzato l\'ultima volta (`lastIndexedAt`)? (AAAA-MM-GG)', placeholder: 'AAAA-MM-GG', answers: DATES('2026-10-02'), mode: 'text', solution: '2026-10-02: prima del cambio prezzo' },
          { type: 'mcq', page: 'any', text: 'Diagnosi?', options: [ok('Il prezzo giusto è quello di SAP (1150); l\'indice Algolia non è stato aggiornato dopo il cambio: serve un reindex del prodotto'), no('Il prezzo giusto è 1090, va corretto SAP'), no('È un arrotondamento del front'), no('Dipende dal cookie del cliente')], explain: 'Attenzione anche alle **repliche** (ordinamento per prezzo): devono aggiornarsi pure loro.' },
        ],
      },
      {
        id: 'u8l3', title: 'Ticket #4131 · Non visibile in Francia', page: 'plp',
        tip: { title: 'Un indice per mercato', body: 'Se un prodotto si vede in un paese e non in un altro, confronta gli indici Algolia dei due mercati (`nbHits`, `objectID`). Se manca solo in uno, il problema è nell\'export verso quell\'indice: spesso un attributo obbligatorio non compilato per quella lingua in Akeneo.' },
        steps: [
          { type: 'intro', page: 'any', text: '📨 **Ticket #4131** · Retail FR\n\n*"Il **Mule Sempione** è online in Italia, ma i clienti francesi non lo trovano nella lista Calzature."*' },
          { type: 'do', text: 'Imposta il cookie `vl_country` a `FR` e ricarica.', check: cookieIs('FR') },
          { type: 'find', text: 'Nella risposta Algolia francese, quanti risultati (`nbHits`)?', placeholder: 'numero', answers: ['22'], mode: 'num', solution: '22 (in Italia sono 23)' },
          { type: 'find', text: 'Cerca nel Network il codice del Mule, `VL2366`. In quale indice Algolia **non** compare?', placeholder: 'nome indice', answers: ['vl_prod_fr_FR'], mode: 'url', hints: ['Usa la ricerca del Network ([[find]] con il pannello Network attivo).', 'Se la ricerca non trova nulla, è proprio quello il punto.'], solution: '`vl_prod_fr_FR`' },
          { type: 'mcq', text: 'La PDP del Mule in francese invece funziona (SAP ha il prodotto su `vl-fr`). Dove si è fermato il prodotto?', options: [ok('Non è stato indicizzato nell\'indice Algolia francese: da verificare l\'export verso Algolia FR (es. attributi o traduzioni FR obbligatori mancanti in Akeneo)'), no('Il prodotto è offline in SAP'), no('Il front francese ha un bug grafico'), no('È un problema del cookie del cliente')] },
          { type: 'do', text: 'Rimetti `vl_country` a `IT` e ricarica.', check: cookieIs('IT') },
        ],
      },
      {
        id: 'u8l4', title: 'Ticket #4132 · Varianti disallineate', page: 'plp',
        tip: { title: 'Contare le varianti', body: 'In Algolia guarda l\'array dei colori dell\'hit; in SAP conta le `variantOptions` e i loro qualifier colore. Una variante presente in un sistema e assente nell\'altro = flusso di quella variante da verificare.' },
        steps: [
          { type: 'intro', page: 'any', text: '📨 **Ticket #4132** · E-commerce\n\n*"Il **Décolleté Aurora** in lista mostra due colori, ma in pagina prodotto se ne può scegliere solo uno."*\n\n📦 **Akeneo** · VL2041\nvarianti colore: `N001` Nero, `B014` Cipria' },
          { type: 'find', text: 'Nella PLP, quanti pallini colore ha la card del Décolleté Aurora?', placeholder: 'numero', answers: ['2'], mode: 'num', solution: '2' },
          { type: 'find', text: 'Nell\'hit Algolia `VL2041`, l\'array `colors`: qual è il codice del **secondo** colore?', placeholder: 'codice colore', answers: ['B014'], mode: 'code', solution: '`B014` (Cipria)' },
          { type: 'find', page: 'pdp:VL2041', text: 'In PDP, nella risposta SAP: quante `variantOptions` ci sono?', placeholder: 'numero', answers: ['7'], mode: 'num', hints: ['Accanto a `variantOptions` nella Preview vedi la lunghezza dell\'array.'], solution: '7: solo le taglie 35–41 del colore N001' },
          { type: 'mcq', page: 'any', text: 'Diagnosi?', options: [ok('La variante B014 è arrivata in Algolia ma non in SAP: va verificato il flusso della variante verso SAP (BEIL, approvazione o sync)'), no('Il front nasconde i colori chiari'), no('La variante B014 va cancellata da Akeneo'), no('È normale: in PDP si vede un colore alla volta')] },
        ],
      },
      {
        id: 'u8l5', title: 'Ticket #4133 · La taglia fantasma', page: 'pdp:VL2041',
        tip: { title: 'Dati incoerenti', body: 'Quando due campi dicono cose diverse (stockLevel 0 ma inStock), scopri quale usa il front con la ricerca globale. Il bug è di chi manda il dato incoerente; la robustezza è di chi lo legge.' },
        steps: [
          { type: 'intro', text: '📨 **Ticket #4133** · Customer care\n\n*"Una cliente ha ordinato il Décolleté Aurora nero in taglia **40**: il sito la dava disponibile, ma in magazzino non c\'era."*' },
          { type: 'find', text: 'Nella risposta SAP, la variante della taglia 40: che `stockLevel` ha?', placeholder: 'numero', answers: ['0'], mode: 'num', hints: ['Cerca `VL2041-N001-40` nella Preview o con la ricerca del Network.'], solution: '0' },
          { type: 'find', text: 'E che `stockLevelStatus`?', placeholder: 'valore', answers: ['inStock'], mode: 'text', solution: '`inStock`' },
          { type: 'find', text: 'Ora nel codice: [[gsearch]] e cerca `outOfStock`. In che file il front decide se una taglia è acquistabile?', placeholder: 'nomefile.js', answers: ['pdp.js'], mode: 'url', solution: '`pdp.js`, funzione `isPurchasable`' },
          { type: 'mcq', text: 'Su cosa si basa il front?', options: [ok('Solo su `stockLevelStatus`: se non è outOfStock la taglia è acquistabile, anche con stockLevel 0'), no('Solo su `stockLevel`'), no('Su entrambi'), no('Sul prezzo')] },
          { type: 'mcq', text: 'Chi deve intervenire?', options: [ok('Entrambi: lo stock arriva incoerente (0 ma inStock) e il front potrebbe controllare anche stockLevel'), no('Solo il front'), no('Nessuno, è un caso isolato'), no('Solo il customer care')] },
        ],
      },
      {
        id: 'u8l6', title: 'Ticket #4140 · L\'etichetta misteriosa', page: 'pdp:VL2210',
        tip: { title: 'Un codice a vista = etichetta mancante', body: 'Se a schermo leggi un codice tipo `suede_02` al posto di un\'etichetta, controlla la risposta nelle varie lingue: se manca solo in una, quasi sempre manca l\'etichetta di quell\'opzione per quella lingua in Akeneo.' },
        steps: [
          { type: 'intro', text: '📨 **Ticket #4140** · Merchandising\n\n*"Sulla PDP dello Stivaletto Navigli, alla voce Materiale, compare una scritta strana invece di \'Camoscio\'."*' },
          { type: 'find', text: 'Che testo compare alla voce **Materiale**?', placeholder: 'testo', answers: ['suede_02'], mode: 'text', hints: ['È nella sezione Dettagli della PDP.'], solution: '`suede_02`' },
          { type: 'find', text: 'Nella risposta SAP, che valore ha la feature `material`?', placeholder: 'valore', answers: ['suede_02'], mode: 'text', solution: '`suede_02`: il front mostra esattamente quello che riceve' },
          { type: 'do', text: 'Controprova: imposta il cookie `vl_country` a `FR` e ricarica.', check: cookieIs('FR') },
          { type: 'find', text: 'In francese che parola compare?', placeholder: 'parola', answers: ['Daim'], mode: 'text', solution: '"Daim"' },
          { type: 'mcq', text: 'Qual è il fix corretto?', options: [ok('Compilare l\'etichetta italiana dell\'opzione `suede_02` in Akeneo, poi verificare che arrivi a SAP'), no('Correggere il front perché traduca i codici'), no('Nascondere il campo Materiale'), no('Mettere tutti gli utenti italiani su FR')] },
          { type: 'do', text: 'Rimetti `vl_country` a `IT` e ricarica. Indagini chiuse! 🎉', check: cookieIs('IT') },
        ],
      },
    ],
  },
];
