# restoran-klijent
Restoranska aplikacija za rad sa subvencioniranom studentskom prehranom

## Osnovne informacije
Srce održava i razvija [Informacijski sustav studentskih prava (ISSP)](https://www.srce.unizg.hr/issp) i [Informacijski sustav akademskih kartica (ISAK)](https://www.srce.unizg.hr/isak) te pruža potporu korisnicima tih sustava. U okviru tih aktivnosti Srce održava sučelje [ISSP REST API](https://issp.srce.hr/isspapi/index.html) namijenjeno programskoj interakciji sa sustavima ISSP i ISAK. To sučelje omogućava pristup i upravljanje podacima vezanim za studente, studentske iskaznice, ustanove i restorane koji nude uslugu subvencionirane studentske prehrane.

Novi model rada aplikacije za restorane temelji se na uspostavi odgovarajućeg aplikativnog sučelja za potrebe restorana, [ISSP Restoran REST API](https://issp.srce.hr/RestoranAPI/index.html), uz dodatni modul za registraciju i autorizaciju blagajni. Restoranski API uspostavljen je kao zasebna cjelina (**neovisan o ISSP REST API-ju**) i omogućava davateljima usluge subvencionirane studentske prehrane izradu vlastitih aplikacijskih rješenja za blagajne koje će zadovoljiti sve njihove potrebe i omogućiti povezivanje s dodatnim servisima (npr. knjigovodstvo, skladište, kartična naplata).

Bitna stavka kod ovog modela je postojanje stalne veze na Internet. Restoranskim API-jem je moguće ostvariti direktnu vezu između blagajne i središnje baze podataka, ali ovaj pristup također omogućava i uvođenje lokalnog poslužitelja (struktura i hijerarhijska organizacija po izboru davatelja usluge). Lokalni poslužitelj može prosljeđivati zahtjeve pojedinih blagajni i pohranjivati podatke za vlastite potrebe, izradu analiza ili uparivanje sa aplikacijama treće strane. Lokalna baza podataka na svakoj blagajni zasebno više nije potrebna jer se izračuni izvršavaju u trenutku zahtjeva.

**Više informacija potražite na službenom ISSP portalu: [https://issp.srce.hr/](https://issp.srce.hr/)**

## O aplikaciji
Srce osnovna klijentska aplikacija sadržava module:
- v1
  - Administracija djelatnika (dodavanje, brisanje, izmjena)
  -	Administracija jelovnika i sastavnica menija (dodavanje, brisanje, izmjena)
  -	Izrada obračuna i status blagajne
  -	Izrada cjenika / dnevne ponude
  -	Definiranje jelovnika za određeni dan
  -	Dohvaćanje studenta
  -	Dohvaćanje artikala i grupa
  -	Rukovanje sa limitima (ograničenja studenta po određenim grupama)
  -	Komunikacija sa fizičkim uređajima (printer, čitač iskaznica)
  -	Komunikacija sa središnjom bazom podataka.
  -	Fiskalizacija i storniranje računa
  
## Tehnička specifikacija
Aplikacija je u potpunosti izrađena u JavaScript programskom jeziku te koristi modularni dizajn (ES6+ sintaksa). Moduli su neovisni te je svaki zasebno moguće koristiti. Za produkcijsku okolinu predlažemo spajanje modula u jednu cjelinu te ugradnju u glavnu (jedinu) stranicu, index.html (single page application). Iz programskog koda, zbog autorskih prava, uklonjene su sve * *3rd party datoteke* * .Nakon preuzimanja programskog koda napravite pretragu po ključnoj riječi **TODO:**. Na navedena mjesta potrebno je ugraditi adrese koje vode do restoranskog API-ja.

ISSP Restoran REST API produkcijska okolina: [https://issp.srce.hr/RestoranAPI/index.html](https://issp.srce.hr/RestoranAPI/index.html)

ISSP Restoran REST API testna okolina: [https://issp.srce.hr/TESTRestoranAPI/index.html](https://issp.srce.hr/TESTRestoranAPI/index.html)

## Tehnička podrška
issp@srce.hr

## Slike sustava

![slika 1 login](/slikeSustava/ss4.png)
* *Prijava djelatnika u sustav* *
![slika 2 pocetna stranica](/slikeSustava/ss1.png)
* *Početna stranica sustava* *
![slika 3 prikaz artikala](/slikeSustava/ss2.png)
* *Operacije s artiklima* *
![slika 4 blagajna](/slikeSustava/ss3.png)
* *Prikaz blagajne i košarice* *
