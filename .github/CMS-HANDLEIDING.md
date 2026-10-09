# Je portfolio bewerken met Pages CMS

Met Pages CMS pas je projecten, teksten en foto's aan in je browser. Elke keer dat je
iets opslaat, komt dat als een commit op GitHub terecht. GitHub bouwt de site daarna
automatisch opnieuw en zet ze online (na 1 à 2 minuten).

## 1. Eenmalig: inloggen

1. Ga naar **https://app.pagescms.org** en kies **Sign in with GitHub**.
2. Geef Pages CMS toegang tot de repository **overgrootoma/Jorne-Scholiers**
   (GitHub vraagt dit de eerste keer; kies "Only select repositories").
3. Open de repository en kies de branch **main**.

Links zie je nu: **Projects**, **Homepage information** en **Media**.

## 2. Een nieuw project toevoegen

1. Ga naar **Media → Project images** en maak een nieuwe map, bv. `2027 Project naam`.
   Upload daar al je foto's (en eventueel PDF's of video's).
2. Ga naar **Projects → Add an entry** en vul in:
   - **Title** en **Year** (verplicht)
   - **Position**: 1 = bovenaan. Leeg = onderaan de lijst.
   - **Cover image**: de hoofdfoto voor de Projects-pagina
   - **Text**: je beschrijving. Laat een lege regel tussen paragrafen.
   - **Project images and text sections**: voeg per foto een **Image** toe, in de volgorde van de pagina (sleep om
     te herschikken). Kies bij **Width (columns of 6)** hoe breed de foto op een computer staat
     (zie hieronder).
   - **Homepage hover images**: max. 4 foto's die verschijnen als je over de titel beweegt
   - **Files**: PDF's (worden een link, met jouw **Link text**) of video's (worden getoond)
   - **Project folder**: leeg laten
3. Klik **Save**. Na 1 à 2 minuten staat het project online.

Wil je het eerst verbergen? Vink **Hide this project** aan. Het blijft dan bewaard,
maar niemand ziet het.

## 3. Een bestaand project aanpassen

Open het project onder **Projects**. Alles staat er al in: titel, positie, tekst, cover,
alle foto's in hun huidige volgorde, de hover-foto's, PDF's en video's. Pas aan wat je wil
en klik **Save**.

Een extra foto toevoegen? Upload ze eerst in **Media → Project images → de map van het
project**, en voeg ze dan toe bij **Project images**.

## 4. Foto's schikken op het grid (desktop)

Op een computer en tablet (zoals een iPad) staan de foto's van een projectpagina op een grid van **6 kolommen**.
Per foto stel je drie dingen in:

- **Width (columns of 6)**: hoe breed de foto is. 6 = volle breedte, 3 = de helft,
  2 = een derde, 1 = een zesde. Zo staat alles nu op 6.
- **Start at column**: `auto` = meteen na de vorige foto. Kies je een latere kolom, dan
  blijven de kolommen ervoor leeg (witruimte links van de foto).
- **Start a new row**: begint een nieuwe rij, zodat de rest van de vorige rij leeg blijft.

Een foto die niet meer past in de rij, schuift vanzelf door naar de volgende rij.

**Alles in één overzicht: de layout-editor.** Ga naar **https://jornescholiers.be/editor/**.
Je ziet de pagina van een project zoals op een computer, op het grid van 6 kolommen.

- Kies bovenaan het project.
- **Sleep** een foto naar een andere plek om de volgorde te wijzigen.
- **Klik** op een foto: rechts pas je de breedte, de startkolom, "nieuwe rij" en de alt-tekst aan.
  Met ← en → schuif je ze één plek op.
- **+ Photo** voegt een foto uit de map van het project toe, **+ Text section** een tekstsectie.
- Klik **Save**. Na 1 à 2 minuten staat het online.

De eerste keer vraagt de editor een GitHub-sleutel (token). Maak die zelf aan via de link in de
editor: kies "Only select repositories" → Jorne-Scholiers en bij Permissions → Contents
"Read and write". De sleutel blijft alleen in je browser bewaard. Verloopt ze, dan vraagt de
editor gewoon een nieuwe. Nieuwe foto's upload je nog altijd in Pages CMS onder **Media**.

**Volgorde wijzigen:** bovenaan bij **Photo order (drag the tiles)** staan alle foto's van het
project als kleine vakjes. Sleep een vakje naar een andere plek en klik **Save**: zo staan de
foto's op de pagina. Tekstsecties blijven op hun plek staan. Breedte en positie van elke foto
stel je in onder **Project images and text sections**; die instellingen verhuizen mee met de foto.

Een nieuwe foto? Voeg ze toe als vakje bij **Photo order** (ze komt dan op volle breedte op de
pagina) en stel daarna eventueel haar breedte in onder **Project images and text sections**.
Een foto weghalen doe je op beide plekken.

## 4a. Tekstsecties tussen de foto's en tags

**Tekstsectie tussen foto's** (voor een case study): klik onder **Project images and text
sections** op **Add** en kies **Text section** (in plaats van **Image**). Een tekstsectie heeft
drie velden, die je elk leeg mag laten:

- **Title**: een titel in het pixelfont
- **Introduction**: een inleiding, groter weergegeven
- **Body text**: de gewone tekst. Laat een lege regel tussen paragrafen.

Sleep de sectie naar de juiste plek tussen de foto's. Ze staat op hetzelfde grid als de
foto's: zet ze bv. op **3** kolommen naast een foto van **3** kolommen.

**Tags** zijn de kleine blauwe blokjes onder de projecttitel, bv. `book`, `album art`,
`installation`. Je past ze aan bij **Tags (blue blocks)**, één woord of korte term per regel.
De **One-liner** staat onder de kaartjes op de Projects-pagina.

## 4b. Gevonden worden op Google

Per project kan je in het CMS nog drie dingen invullen (alles is optioneel):

- **Keywords**: het eerste keyword komt in de titel in Google, bv. "Isolation – Creative Coding".
- **Google title** en **Google description**: wat mensen in Google zien. Leeg = automatisch.
- **alt text** per foto: een korte beschrijving van wat erop staat. Helpt Google Afbeeldingen
  en mensen met een schermlezer.

## 5. Foto's in Archive of Photography

Hier hoef je niets in te vullen: alles wat in de map staat, komt op de site.

1. Ga naar **Media → Archive** of **Media → Photography**.
2. Open de map van het jaar (bv. `2026` of `Photo 2026`) en klik **Upload**.
3. Nieuw jaar? Maak een nieuwe map: `2027` in Archive, `Photo 2027` in Photography.

## 6. Homepage-info

Onder **Homepage information** pas je About, Exhibitions, Experience, Education en
de links aan.

## 7. Controleren of het online staat

Op GitHub, tab **Actions**, zie je per wijziging een run
"Deploy static content to Pages":

- groen vinkje: staat online
- rode kruis: er zat een fout in (bv. een kapot bestand). Je site blijft dan gewoon de
  vorige versie tonen. Klik op de run om de foutmelding te lezen.

Een foto die niet (meer) bestaat, wordt overgeslagen, dus je site breekt daar niet van.

## 8. Samen met VS Code werken

Het CMS maakt commits op GitHub. Doe daarom in VS Code **altijd eerst `git pull`**
(of Sync Changes) voor je zelf iets aanpast, anders krijg je conflicten.

- `npm run build`: bouwt de site lokaal
- `npm run watch`: bouwt opnieuw zodra je iets in Projects, Archive, photography of content wijzigt

Waar alles staat:

- `content/projects/*.json`: één bestand per project (dit bewerkt het CMS)
- `content/site.json`: de homepage-info
- `Projects/<map>/page.json`: extra instellingen van de oudere projecten (bv. het raster onderaan Isolation)
- `.pages.yml`: de instellingen van het CMS zelf

## Tips

- Foto's van max. ± 2500 px breed, als jpg of webp. Dan blijft je site snel.
- Het CMS maakt bestandsnamen automatisch "veilig" (kleine letters, geen spaties).
