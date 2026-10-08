# E-mailhandtekening

Drie kolommen: je logo-animatie | je naam (pixellettertype), Visual Designer en Ghent, Belgium |
je e-mail, telefoon, website, Instagram en LinkedIn. Behalve het logo en je naam is alles gewone
tekst in vette Helvetica, zodat elke link klikbaar is.

Komen de kolommen na het plakken toch onder elkaar te staan? Gebruik dan de methode met het
bestand hieronder ("Exact installeren").

## Installeren in Apple Mail

1. Mail → **Instellingen** → **Handtekeningen**: selecteer de oude handtekening en klik **–**.
2. Open **https://jornescholiers.be/email-signature/signature.html** in **Safari**.
3. Klik ergens op de pagina, druk **Cmd + A** en daarna **Cmd + C**.
4. In Mail: kies je iCloud-account, klik **+**, klik in het rechtervak en druk **Cmd + V**.
5. Vink **"Gebruik altijd mijn standaardlettertype"** uit.

Gegevens aanpassen? Wijzig de tekst in `signature.html`, push, en kopieer opnieuw.

## Exact installeren (als plakken de kolommen breekt)

1. Maak in Mail een handtekening met als tekst `TEMP` en sluit Mail (**Cmd + Q**).
2. Finder → **Shift + Cmd + G** → `~/Library/Mail/V10/MailData/Signatures/` (of V11/V9).
3. Open het nieuwste `.mailsignature`-bestand met TextEdit, laat de regels bovenaan staan en
   vervang alles onder de eerste lege regel door de inhoud van `mail-signature.html`. Bewaar.
4. Rechtsklik → **Toon info** → vink **Geblokkeerd** aan. Open Mail.
