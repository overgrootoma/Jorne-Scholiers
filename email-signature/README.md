# E-mailhandtekening

Logo-animatie links, je naam, functie en contactgegevens rechts, in het pixellettertype van je
site. Alle tekst is een kleine afbeelding (op dubbele resolutie, dus scherp op een Retina-scherm)
en elke regel is klikbaar. De beelden staan online op jornescholiers.be, maar worden nergens op de
site getoond.

- `mail-signature.html`: de handtekening zelf (voor Apple Mail, zie hieronder)
- `signature.html`: dezelfde handtekening als webpagina, om te kopiëren en plakken (Gmail, Outlook)

## Apple Mail (beste resultaat)

Plakken laat Mail de opmaak aanpassen. Zo zet je de handtekening er exact in:

1. **Mail → Instellingen → Handtekeningen**: kies je iCloud-account, klik **+**, noem hem
   bv. "Jorne" en typ als inhoud gewoon `TEMP`. Vink **"Gebruik altijd mijn standaardlettertype"**
   uit.
2. Sluit Mail helemaal af (**Cmd + Q**).
3. In Finder: **Ga → Ga naar map…** (Shift + Cmd + G) en plak:
   `~/Library/Mail/V10/MailData/Signatures/`
   (bestaat V10 niet, probeer dan V11 of V9.)
4. Zet de weergave op lijst en sorteer op **Gewijzigd**. Open het nieuwste `.mailsignature`-bestand
   met **TextEdit** (rechtsklik → Open met).
5. Bovenaan staan een paar regels zoals `Content-Type:` en `Mime-Version:`. Laat die staan.
   Vervang alles **onder de eerste lege regel** (waar `TEMP` staat, met de HTML eromheen) door de
   volledige inhoud van `mail-signature.html`. Bewaar (Cmd + S).
6. Rechtsklik het bestand → **Toon info** → vink **Geblokkeerd** aan (anders overschrijft Mail het).
7. Open Mail en maak een nieuw bericht: de handtekening staat er.

## Gmail / Outlook

Open https://jornescholiers.be/email-signature/signature.html, druk **Cmd + A** en **Cmd + C**, en
plak in de handtekening-instellingen.

## Goed om te weten

- Sommige ontvangers zien afbeeldingen pas als ze "afbeeldingen laden" aanklikken; ze zien dan eerst
  de tekst van elke regel.
- Gegevens aanpassen? Vraag het aan Claude: de afbeeldingen worden dan opnieuw gemaakt.
