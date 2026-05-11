# Jouw Fotografie Portfolio

## Bestanden in dit project

```
portfolio-website/
├── index.html      → Homepage met foto grid
├── about.html      → Over mij pagina
├── contact.html    → Contact pagina
├── style.css       → Alle opmaak (kleuren, lettertype, layout)
└── fotos/          → Maak deze map aan en zet hier je foto's in
```

---

## Stap 1: Tekst aanpassen

Open elk HTML-bestand in een teksteditor (bijv. VS Code).
Zoek op `Jouw Naam` en vervang dit door je eigen naam.
Doe hetzelfde met de placeholderteksten.

---

## Stap 2: Foto's toevoegen

1. Maak een map aan genaamd `fotos` naast de HTML-bestanden
2. Zet je foto's daarin (bijv. `project-01.jpg`, `project-02.jpg`)
3. Open `index.html` en vervang de `src`-waarden:

**Voorbeeld - vervang dit:**
```html
<img src="https://picsum.photos/seed/arch1/800/1100" ... />
```

**Door dit:**
```html
<img src="fotos/project-01.jpg" alt="Omschrijving van de foto" />
```

**Tip:** Zorg dat je foto's niet te groot zijn. Gebruik een tool zoals
[Squoosh.app](https://squoosh.app) om ze te verkleinen naar max. 1500px breed
en sla ze op als .jpg met 80% kwaliteit.

---

## Stap 3: Website online zetten via GitHub + Netlify

### 3a. GitHub repository aanmaken

1. Ga naar github.com en log in
2. Klik op de groene knop **New**
3. Geef je repository een naam, bijv. `portfolio`
4. Kies **Public** en klik **Create repository**

### 3b. Bestanden uploaden naar GitHub

**Optie A: via de browser (makkelijkst)**
1. Open je repository op GitHub
2. Klik op **uploading an existing file**
3. Sleep alle bestanden erin (index.html, about.html, contact.html, style.css en de map `fotos`)
4. Klik **Commit changes**

**Optie B: via GitHub Desktop**
1. Download [GitHub Desktop](https://desktop.github.com)
2. Clone je repository naar je computer
3. Sleep je bestanden in de map
4. Commit en push

### 3c. Netlify koppelen aan GitHub

1. Ga naar [netlify.com](https://netlify.com) en log in
2. Klik **Add new site** → **Import an existing project**
3. Kies **GitHub** en selecteer je repository
4. Laat alle instellingen op standaard staan
5. Klik **Deploy site**

Na een paar seconden is je site live op een willekeurig netlify-adres,
bijv. `amazing-fox-123.netlify.app`

### 3d. Eigen domeinnaam koppelen

1. Ga in Netlify naar **Domain settings** → **Add custom domain**
2. Voer je domeinnaam in
3. Netlify geeft je DNS-instellingen. Voer deze in bij je domeinregistrar
4. Wacht 15-60 minuten en je site is live op je eigen domein

---

## Contactformulier activeren

Het formulier werkt automatisch via **Netlify Forms**.
Je hoeft niets extra's te doen - zodra de site op Netlify staat,
vangen zij de formulierinzendingen op.

Je ontvangt ze via: Netlify Dashboard → **Forms** → contact

---

## Kleuren aanpassen

Open `style.css` en pas de kleuren bovenaan aan:

```css
:root {
  --bg: #f8f6f2;        /* achtergrondkleur pagina */
  --surface: #ffffff;   /* achtergrond kaarten/formulier */
  --text: #1c1c1a;      /* hoofdtekst */
  --text-muted: #8a8680; /* subtekst */
  --border: #e8e4de;    /* lijntjes */
}
```

---

## Vragen?

Vraag het aan Claude. Beschrijf wat je wil veranderen en je krijgt de exacte code.
