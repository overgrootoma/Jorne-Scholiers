# Je portfolio bewerken met Pages CMS

Met Pages CMS pas je projecten, teksten en foto's aan in je browser. Elke keer dat je
iets opslaat, komt dat als een commit op GitHub terecht. GitHub bouwt de site daarna
automatisch opnieuw en zet ze online (na 1 à 2 minuten).

Twee plekken om te werken:

- **Pages CMS** (https://app.pagescms.org): teksten, foto's uploaden, nieuwe projecten, homepage-info.
- **Layout-editor** (https://jornescholiers.be/editor/): de volgorde en breedte van de foto's
  van een project, in één visueel overzicht (zie 4).

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
   - **Showreel** (optioneel): een video die het project over het hele scherm opent (zie 6)
   - **Title** en **Year** (verplicht)
   - **One-liner** en **Tags**: korte omschrijving en blauwe blokjes (zie 5)
   - **Position**: 1 = bovenaan. Leeg = onderaan de lijst.
   - **Cover image**: de hoofdfoto voor de Projects-pagina
   - **Text**: je beschrijving. Eén enter = nieuwe regel, een lege regel = nieuwe alinea.
   - **Photo order**: voeg alle foto's van het project toe als vakjes, in de juiste volgorde.
   - **Homepage hover images**: max. 4 foto's die verschijnen als je over de titel beweegt
   - **Files**: PDF's (worden een link, met jouw **Link text**) of video's (worden getoond)
   - **Old project folder**: leeg laten
3. Klik **Save**. Na 1 à 2 minuten staat het project online, met alle foto's op volle breedte.
4. Open daarna de **layout-editor** om de foto's te schikken (zie 4).

Wil je het eerst verbergen? Vink **Hide this project** aan. Het blijft dan bewaard,
maar niemand ziet het.

## 3. Een bestaand project aanpassen

Open het project onder **Projects**. Alles staat er al in: titel, positie, tekst, cover,
alle foto's in hun huidige volgorde, de hover-foto's, PDF's en video's. Pas aan wat je wil
en klik **Save**.

Een extra foto toevoegen? Upload ze eerst in **Media → Project images → de map van het
project**. Voeg ze daarna toe in de layout-editor met **+ Photo**, of in het CMS als vakje bij
**Photo order**.

## 4. Foto's schikken op het grid

Op een computer en tablet (zoals een iPad) staan de foto's van een projectpagina op een grid
van **6 kolommen**. Op een telefoon staat alles onder elkaar op volle breedte.

### De layout-editor (makkelijkst)

Ga naar **https://jornescholiers.be/editor/**. Je ziet de pagina van een project zoals op een
computer.

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

### Wat de instellingen betekenen

- **Width (columns of 6)**: hoe breed de foto is. 6 = volle breedte, 3 = de helft,
  2 = een derde, 1 = een zesde.
- **Start at column**: `auto` = meteen na de vorige foto. Kies je een latere kolom, dan
  blijven de kolommen ervoor leeg (witruimte links van de foto).
- **Start a new row**: begint een nieuwe rij, zodat de rest van de vorige rij leeg blijft.

Een foto die niet meer past in de rij, schuift vanzelf door naar de volgende rij.

**Voorbeeld:** drie foto's naast elkaar, daaronder één foto op de linkerhelft met witruimte
ernaast.

| Foto | Width | Start at column | Start a new row |
|------|-------|-----------------|-----------------|
| A    | 2     | auto            | uit             |
| B    | 2     | auto            | uit             |
| C    | 2     | auto            | uit             |
| D    | 3     | auto            | uit             |
| E    | 6     | auto            | **aan**         |

Foto D vult kolom 1 tot 3; kolom 4 tot 6 blijft leeg omdat E een nieuwe rij begint.
Wil je D rechts, met de witruimte links? Zet dan bij D **Start at column** op **4**.

### Hetzelfde in Pages CMS

Bovenaan bij **Photo order (drag the tiles)** staan alle foto's als kleine vakjes: sleep een
vakje om de volgorde te wijzigen. De breedte en positie per foto staan eronder bij
**Project images and text sections**; die instellingen verhuizen mee met de foto.
Een foto weghalen doe je op beide plekken (de layout-editor doet dat in één keer).

## 5. Tekstsecties, tags en one-liner

**Tekstsectie tussen foto's** (voor een case study): in de layout-editor met **+ Text section**,
of in het CMS onder **Project images and text sections** met **Add → Text section**. Een
tekstsectie heeft drie velden, die je elk leeg mag laten:

- **Title**: een titel in het pixelfont
- **Introduction**: een inleiding, groter weergegeven
- **Body text**: de gewone tekst. Eén enter = nieuwe regel, een lege regel = nieuwe alinea.

Ze staat op hetzelfde grid als de foto's: zet ze bv. op **3** kolommen naast een foto van **3**
kolommen.

**Tags** zijn de kleine blauwe blokjes onder de projecttitel, bv. `book`, `album art`,
`installation`. Je past ze aan bij **Tags (blue blocks)**, één woord of korte term per regel.
De **One-liner** staat onder de kaartjes op de Projects-pagina.

## 6. Showreel (optioneel)

Helemaal bovenaan elk project staat **Showreel**. Kies daar een korte video (mp4 of webm, zonder
geluid). Het project opent dan met die video over het hele scherm; pas als je scrolt, zie je de
rest van het project. Leeg = gewone projectpagina. Hou de video klein (± 1920 px breed, onder
15 MB), dan laadt ze snel.

## 7. Gevonden worden op Google

Per project kan je in het CMS nog drie dingen invullen (alles is optioneel):

- **Keywords**: het eerste keyword komt in de titel in Google, bv. "Isolation – Creative Coding".
- **Google title** en **Google description**: wat mensen in Google zien. Leeg = automatisch.
- **alt text** per foto: een korte beschrijving van wat erop staat. Helpt Google Afbeeldingen
  en mensen met een schermlezer.

## 8. Foto's in het Archive

Hier hoef je niets in te vullen: alles wat in de map staat, komt op de site.

1. Ga naar **Media → Archive**.
2. Open de map van het jaar (bv. `2026`) en klik **Upload**.
3. Nieuw jaar? Maak een nieuwe map, bv. `2027`.

(**Media → Photography** werkt op dezelfde manier, maar die pagina is voorlopig verborgen:
niets op de site linkt ernaar.)

## 9. Homepage-info

Onder **Homepage information** pas je About, Exhibitions, Experience, Education en
de links aan.

- **Year or dates**: bv. `2025` of `2023 — 2026`.
- Een **lege rij** bij Links (geen tekst, geen link) wordt een witregel, bv. tussen je
  contactgegevens en je sociale media.

## 10. Controleren of het online staat

Op GitHub, tab **Actions**, zie je per wijziging een run
"Deploy static content to Pages":

- groen vinkje: staat online
- rode kruis: er zat een fout in (bv. een kapot bestand). Je site blijft dan gewoon de
  vorige versie tonen. Klik op de run om de foutmelding te lezen.
- blijft een run lang geel (wachten)? Annuleer ze met **Cancel run** en sla in het CMS
  opnieuw iets op.

Een foto die niet (meer) bestaat, wordt overgeslagen, dus je site breekt daar niet van.

## 11. Samen met VS Code werken

Het CMS maakt commits op GitHub. Doe daarom in VS Code **altijd eerst `git pull`**
(of Sync Changes) voor je zelf iets aanpast, anders krijg je conflicten.

- `npm run build`: bouwt de site lokaal
- `npm run watch`: bouwt opnieuw zodra je iets in Projects, Archive, photography of content wijzigt

Waar alles staat:

- `content/projects/*.json`: één bestand per project (dit bewerken het CMS en de layout-editor)
- `content/site.json`: de homepage-info
- `Projects/<map>/page.json`: extra instellingen van de oudere projecten (bv. het raster onderaan Isolation)
- `.pages.yml`: de instellingen van het CMS zelf
- `editor/index.html`: de layout-editor

## Tips

- Foto's van max. ± 2500 px breed, als jpg of webp. Dan blijft je site snel.
- Het CMS maakt bestandsnamen automatisch "veilig" (kleine letters, geen spaties).
- Browsers onthouden oude versies. Zie je een wijziging niet, herlaad dan met Cmd+Shift+R.
