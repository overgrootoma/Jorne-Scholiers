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
     te herschikken). Kies bij **Width on desktop** hoe breed de foto op een computer staat
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

## 4. Foto's naast elkaar zetten (desktop)

Elke foto heeft een **Width on desktop**:

- **full**: volle breedte (zo staat alles nu)
- **half**: twee foto's naast elkaar
- **third**: drie foto's naast elkaar

Geef foto's die na elkaar komen dezelfde breedte om ze naast elkaar te zetten, bv. twee
staande foto's allebei op **half**. Zo passen ze samen op één scherm. Op een telefoon
staan alle foto's altijd onder elkaar op volle breedte.

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
