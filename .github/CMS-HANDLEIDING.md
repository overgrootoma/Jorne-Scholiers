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
   - **Project images**: voeg per foto een rij toe, in de volgorde van de pagina (sleep om
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
Op een telefoon (smaller dan 700 px) staan alle foto's altijd onder elkaar op volle breedte.

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
