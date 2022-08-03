/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {appStatus, doAjax, statusBlagajne, to, ugasiTImere, toEuro} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken} from './jwt';
import Kosarica from './kosarica';
import Naplata from './naplata';


export default class Blagajna {
  constructor(server, windowLocation, kontrolniBrojDjelatnika, obveznikPDV, obveznikFiskalizacije) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.obveznikPDV = obveznikPDV;
    this.obveznikFiskalizacije = obveznikFiskalizacije;
    this.mainDiv = document.getElementById('mainDivContent');
    this.naplata = new Naplata(this.server, this.windowLocation, this.kontrolniBrojDjelatnika, this.obveznikPDV, this.obveznikFiskalizacije);
    this.kosarica = new Kosarica(this.obveznikPDV, this.obveznikFiskalizacije);
  }

  async init() {
    await ugasiTImere();
    await this.postaviCore();
    await this.htmlHolderi();
    await this.coreEvents();
    if (this.obveznikFiskalizacije) {
      await this.nefiskaliziraniRacuni();
      isspVrijeme.nefiskrac = setInterval(async () => {
        await this.nefiskaliziraniRacuni();
      }, 1000*60*15);
    }
    await statusBlagajne(window.navigator.onLine);
  }

  async postaviCore() {
    const core = `
    <div class="row align-items-center h-100" id="unosKarticeCard">
      <div class="bg-image"></div>
      <div class="col-md-10 offset-md-1 col-lg-6 offset-lg-3 no-blur">
        <div class="card z-depth-4 rounded-0 my-5">
          <div class="card-body rounded-0">
            <p class="font-italic text-right">
              Status preglednika: 
              <strong class="${window.navigator.onLine ? 'text-success' : 'text-danger'} statusBlagajne">${window.navigator.onLine ? 'online' : 'offline'}</strong>
              ${!this.obveznikFiskalizacije && !window.navigator.onLine ? ` | Izdano offline računa: <span class="brojOfflineRacuna">0</span>` : ``} 
              ${this.obveznikFiskalizacije ? ` | Nefiskaliziranih računa: <span class="nefisrac">0</span>` : ''} | 
              <span class="clock">00.00.0000. 00:00</span>
            </p>
              <form>
                  <label class="d-none" for="unosBrKartice">Automatski ili ručni unos broja iskaznice</label>
                  <div class="input-group input-group-lg mb-4">
                      <input type="text" id="unosBrKartice" name="unosBrKartice" class="form-control rounded-0" placeholder="Unos broja iskaznice" pattern="^[0-9]+$" autofocus disabled>
                      <div class="input-group-append">
                          <button class="btn btn-light-f m-0 px-3 z-depth-0 rounded-0 waves-effect" id="ponistiBrKartice" type="button">
                              <span class="material-icons md-18 ">
                                  loop
                              </span>
                          </button>
                      </div>
                  </div>

                  <div class="btn-group btn-group-toggle w-100 z-depth-0 rounded-0" data-toggle="buttons">
                      <label class="btn btn-lg btn-light-f form-check-label font-weight-bold m-0 z-depth-0 rounded-0 waves-effect active">
                          <input class="form-check-input" type="radio" name="manualAuto" value="1" autocomplete="off" checked><span class="material-icons md-18 ">
                              credit_card
                          </span> Automatski unos
                      </label>
                      <label class="btn btn-lg btn-light-f form-check-label font-weight-bold m-0 z-depth-0 rounded-0 waves-effect">
                          <input class="form-check-input" type="radio" name="manualAuto" value="2" autocomplete="off"><span class="material-icons md-18 ">
                              keyboard
                          </span> Ručni unos
                      </label>
                  </div>
              </form>
          </div>
        </div>                   
      </div>
    </div>

    <div class="row h-100 d-none" id="blagajnaLoaded">
        <div class="col-8 py-3 bg-dark" id="prviCol">
            <div class="row pb-3">
                <div class="col" id="pretraziArtikleCol">

                </div>
            </div>
            <div class="row px-3" id="menuHolder">

            </div>
        </div>
        <div class="col-4 py-3 bg-f-light" id="drugiCol">
            <div class="row mt-2px pb-3">
                <div class="col">
                  <div class="card z-depth-0 rounded-0 border-light-f">
                    <div class="card-body font-italic text-right py-2">
                      Status preglednika: 
                      <strong class="${window.navigator.onLine ? 'text-success' : 'text-danger'} statusBlagajne">${window.navigator.onLine ? 'online' : 'offline'}</strong>
                      ${!this.obveznikFiskalizacije && !window.navigator.onLine ? ` | Izdano offline računa: <span class="brojOfflineRacuna">0</span>` : ``} 
                      ${this.obveznikFiskalizacije ? ` | Nefiskaliziranih računa: <span class="nefisrac">0</span>` : ''} | 
                      <span class="clock">00.00.0000. 00:00</span>
                    </div>
                  </div>
                </div>
            </div>
            <div class="row">
                <div class="col" id="studentDataCol">

                </div>
            </div>
            <div class="row">
                <div class="col" id="kosaricaCol">

                </div>
            </div>
        </div>
    </div>
    `;

    this.mainDiv.innerHTML = core;
  }

  async htmlHolderi() {
    this.pretraziArtikleCol = this.mainDiv.querySelector('#pretraziArtikleCol');
    this.menuHolder = this.mainDiv.querySelector('#menuHolder');
    this.studentDataCol = this.mainDiv.querySelector('#studentDataCol');
    this.kosaricaCol = this.mainDiv.querySelector('#kosaricaCol');
    this.unosKarticeCard = this.mainDiv.querySelector('#unosKarticeCard');
    this.inputBrKartice = this.mainDiv.querySelector('#unosBrKartice');
    this.blagajnaLoaded = this.mainDiv.querySelector('#blagajnaLoaded');
  }

  async getStudentData(brKarticeWeb) {
    // TODO: upisati adresu za dohvat podataka o studentu
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;

    const offlineData = JSON.parse(localStorage.offlineStudent);
    offlineData.BrKartice = brKarticeWeb;
    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err && (err.status === 0 || err.status === 503)) return offlineData;
    if (err) throw new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) throw new Error(appStatus('Greška kod otključavanja tokena.', true));

    const {
      IsKarticaAktivna,
      Poruka,
      RazinaPrava,
    } = data;

    if (!IsKarticaAktivna) throw new Error(appStatus(Poruka, true));
    if (RazinaPrava < 0) throw new Error(appStatus('Nepostojanje prava na prehranu.', true));

    return data;
  }

  async getMenuData(brKarticeWeb) {
    // TODO: upisati adresu za dohvat danasnjeg jelovnika
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;

    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err && (err.status === 0 || err.status === 503)) return JSON.parse(localStorage.offlineAktivniArtikli ? localStorage.offlineAktivniArtikli : localStorage.sviArtikli);
    if (err) throw new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) throw new Error(appStatus('Greška kod otključavanja tokena.', true));

    const offlineAktivniArtikli = data.map((object) => ({...object}));
    for (const i of offlineAktivniArtikli) {
      i.PotrosenoDanas = 0;
      i.Poruka = '';
    }

    localStorage.offlineAktivniArtikli = JSON.stringify(offlineAktivniArtikli);

    console.log(data);
    return data;
  }

  async showStudentMenu(student, menu) {
    const {
      BlagajnaNaziv,
      Djelatnik,
      ObveznikPDV,
      ObveznikFiskalizacije,
      RestoranAdresa,
      RestoranNaziv,
      UstanovaAdresa,
      UstanovaNaziv,
      UstanovaOIB,
    } = JSON.parse(localStorage.blagajnaInfo);
    console.log(ObveznikPDV);
    let menuItems = '';
    const truncate = (input) => input.length > 25 ? `${input.substring(0, 25)}...` : input;

    const {
      Ime,
      Prezime,
      BrKartice,
      OIB,
      JMBAG,
      SubvencijaIznosDodijeljeno,
      Slika,
      RazinaPrava,
      PravaDoDatuma,
      PravaOdDatuma,
      IsKarticaAktivna,
      Poruka,
      SubvencijaDnevniIznosRaspoloziv,
      SubvencijaDvostrukiDnevniIznos,
      GrupeArtikalaPotrosenoDanas,
      KontrolniBrojStudenta,
    } = student;

    for (const i of menu) {
      let ArtikliMenuPrikaz = '';

      const {
        Id,
        Naziv,
        Cijena,
        Subvencija,
        ZaPlatiti,
        PDVIznos,
        StopaPoreza,
        PostoParticipacije,
        GrupaArtiklaId,
        GrupaArtiklaMaxKolicina,
        PotrosenoDanas,
        IsMenu,
        Artikli,
        DisplayGrupaId,
        DisplayGrupaNaziv,
        Poruka,
        Aktivan,
        Definiran,
      } = i;

      if (IsMenu) {
        for (const a of Artikli) {
          const {NazivArtikla} = a;
          ArtikliMenuPrikaz += `${NazivArtikla}, `;
        }
        ArtikliMenuPrikaz = ArtikliMenuPrikaz.replace(/,\s*$/, '');
      }

      const dostupno = () => {
        return `
                <div class="menu-item px-2 ${PotrosenoDanas >= GrupaArtiklaMaxKolicina ? 'iskoristenArtikl' : `${DisplayGrupaNaziv.toLocaleLowerCase()}`}" data-boja="${PotrosenoDanas >= GrupaArtiklaMaxKolicina ? '' : `${DisplayGrupaNaziv.toLocaleLowerCase()}`}" data-postoparticipacije="${PostoParticipacije}" data-subvencija="${Subvencija}" data-stopaporeza="${StopaPoreza}" data-pdviznos="${PDVIznos}">
                    <div class="float-left small textID">ID: ${Id}</div>
                    <div class="float-right small"><span class="potrosenoDanas" data-potrosenodanas="${PotrosenoDanas}">${PotrosenoDanas}/${GrupaArtiklaMaxKolicina}</span></div>
                    <br/>
                    <div class="textNaziv text-center ${(IsMenu ? 'pt-1' : 'pt-1 pb-1')}">${truncate(Naziv)}</div>
                    <div class="textSastavnice font-italic text-center">${(IsMenu ? `(${truncate(ArtikliMenuPrikaz)})` : '')}</div>
                    <div class="centerParent ${PotrosenoDanas < GrupaArtiklaMaxKolicina ? 'd-none' : ''}"><div class="centerChild text-center">Dnevna količina iskorištena</div></div>
                    <div class="posCijenaBottom px-3 pb-2 d-none">
                      <div class="textCijena text-right"><small>cijena: ${Cijena} Kn</small></div>
                      <div class="textCijenaSaSubvencijom text-right"><small>cijena uz iskaznicu: ${ZaPlatiti} Kn</small></div>
                    </div>
                </div>`;
      };

      menuItems += `
                      <div class="col-6 col-md-3 col-lg-2 h-100 menuArtikl p-0" data-displaygrupaid="${DisplayGrupaId}" data-grupaartiklaid="${GrupaArtiklaId}" data-ismenu="${IsMenu}" data-menutype="${IsMenu && Naziv.includes('veget') ? 'menu-vege' : 'menu'}">
                          ${dostupno()}
                      </div>
                  `;
    }

    this.unosKarticeCard.classList.add('d-none');

    this.studentDataCol.innerHTML = `    
      <div class="card z-depth-0 rounded-0 border-light-f">
        <div class="card-body">
          <div class="media">
          <img id="slikaStudenta" src="${(Slika === '' || Slika === null) ? `${this.windowLocation.replace(/\/?$/, '/')}dist/img/placeholder260x260.png` : `data:image/png;base64, ${Slika}`}" alt="slika studenta" class="img-thumbnail mr-3 img-fluid">
              <div class="media-body">
                  <h5 class="mt-0">${Ime} ${Prezime}</h5>
                  <p class="p-0 m-0">Iskaznica: ${BrKartice}</p>
                  <p class="p-0 m-0">Subvencija: ${toEuro.num(SubvencijaIznosDodijeljeno)} € | ${SubvencijaIznosDodijeljeno} Kn</p>
                  <p class="p-0 m-0">Pravo od ${(new Date(PravaOdDatuma)).toLocaleDateString('de-AT')}. do ${(new Date(PravaDoDatuma)).toLocaleDateString('de-AT')}.</p>
                  <p class="p-0 m-0">Razina prava: ${RazinaPrava === 0 ? `<br/><span class="font-weight-bold">Nepostojanje prava na subvencioniranu prehranu. Naplata će biti izvršena po obračunskoj cijeni.</span>` : RazinaPrava}</p>
                  <p class="p-0 m-0">Raspoloživ dnevni iznos: ${toEuro.num(SubvencijaDnevniIznosRaspoloziv)} € | ${SubvencijaDnevniIznosRaspoloziv} Kn ${SubvencijaDnevniIznosRaspoloziv < 0 ? '(iznos oduzet od idućeg dana)' : ''}</p>
                  <p class="d-none">${SubvencijaDvostrukiDnevniIznos}</p>
              </div>
          </div>
        </div>
      </div>
      `;

    this.pretraziArtikleCol.innerHTML = `
      <div class="card rounded-0">
          <div class="card-body p-0 rounded-0">
              <label for="pretraziArtikle" class="screen-reader-text">Pretražite dostupne artikle iz ponude (pretraživanje moguće po ID oznaci ili po nazivu)</label>
              <div class="input-group input-group-lg">
                  <input type="text" id="pretraziArtikle" name="pretraziArtikle" class="form-control rounded-0 input-dark-f" placeholder="Pretražite dostupne artikle iz ponude po ID oznaci ili nazivu" autofocus>
                  <div class="input-group-append">
                      <button class="btn btn-lg btn-dark-f m-0 px-3 rounded-0 z-depth-0 waves-effect" type="button" id="ponistiTrazilicu">
                          <span class="material-icons md-18 ">
                              loop
                          </span>
                      </button>
                  </div>
              </div>
          </div>
          <div class="row" id="buttonsRow">
              <div class="col">
                  <div class="card rounded-0">
                      <div class="btn-group btn-group-toggle rounded-0" data-toggle="buttons">
                          <label class="btn btn-lg btn-dark-f form-check-label font-weight-bold z-depth-0 rounded-0">
                              <input class="form-check-input" type="radio" name="options" data-id="2" autocomplete="off"> Ručak
                          </label>
                          <label class="btn btn-lg btn-dark-f form-check-label font-weight-bold z-depth-0 rounded-0">
                              <input class="form-check-input" type="radio" name="options" data-id="3" autocomplete="off"> Večera
                          </label>
                          <label class="btn btn-lg btn-dark-f form-check-label font-weight-bold z-depth-0 rounded-0">
                              <input class="form-check-input" type="radio" name="options" data-id="menu" autocomplete="off"> Meni
                          </label>
                          <label class="btn btn-lg btn-dark-f form-check-label font-weight-bold z-depth-0 rounded-0">
                              <input class="form-check-input" type="radio" name="options" data-id="menu-vege" autocomplete="off"> Meni-vege
                          </label>
                          <label class="btn btn-lg btn-dark-f form-check-label font-weight-bold z-depth-0 rounded-0">
                              <input class="form-check-input" type="radio" name="options" data-id="4" autocomplete="off"> Ostalo
                          </label>
                          <label class="btn btn-lg btn-dark-f form-check-label font-weight-bold z-depth-0 rounded-0 active">
                              <input class="form-check-input" type="radio" name="options" data-id="0" autocomplete="off" checked> Sve
                          </label>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      `;
    this.menuHolder.innerHTML = menuItems;

    this.kosaricaCol.innerHTML = `
    <div class="card z-depth-0 rounded-0">
      <div class="card-body pt-0 pb-1 border-light-left-f border-light-right-f" id="print-offline-receipt">
        <div class="d-none d-print-block">
          <p class="p-0 m-0">${UstanovaNaziv}<br/>${UstanovaAdresa}<br/>OIB: ${UstanovaOIB}</p>
          <h4 class="text-center pt-2 m-0">${RestoranNaziv}</h4>
          <p class="text-center pb-2 m-0">${RestoranAdresa}<br/>${BlagajnaNaziv}</p>
          <p class="py-2 m-0">Broj dnevnika: nepoznat</p>
          <p class="pb-2 m-0 d-print-none">Ime i prezime: ${Ime} ${Prezime}<br/>Broj iskaznice: ${BrKartice}<br/>Razina prava: ${RazinaPrava ? RazinaPrava : 'nije dostupno'}<br/>Pravo do ${PravaDoDatuma ? PravaDoDatuma : 'nije dostupno'}</p>
        </div>
        <div class="table-responsive">
            <table class="table table-borderd w-100 mb-0" id="kosaricaTable">
                <caption class="d-print-none d-none"><small>Tablica: sadržaj košarice</small></caption>
                <thead>
                    <tr>
                        <th scope="col" class="text-left align-bottom pb-0">Naziv artikla</th>
                        <th scope="col" class="text-center align-bottom pb-0">Kol.</th>
                        <th scope="col" class="text-right align-bottom text-nowrap pb-0">Cijena [Kn]</th>
                        <td scope="col" class="text-right align-bottom d-print-none pb-0"></td>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot>
                  <tr>
                      <td colspan="4" class="text-right align-middle">Ukupno: 0.00 € | 0.00 Kn</td>
                  </tr>
                  <tr>
                      <td colspan="4" class="text-right align-middle">Ukupni iznos subvencije: 0.00 € | 0.00 Kn</td>
                  </tr>
                  <tr>
                      <td colspan="4" class="text-right align-middle h5">Ukupno za platiti: 0.00 € | 0.00 Kn</td>
                  </tr>
                </tfoot>
            </table>
        </div>
        ${ObveznikPDV ? `
          <div class="d-none d-print-block pb-2">
            <p class="text-center py-2 m-0"><small>Način plaćanja: novčanice<br />----- Obračun poreza -----</small></p>
            <div class="table-responsive">
                <table class="table table-borderd w-100 mb-0" id="printObracunPorezaTable">
                    <caption class="d-print-none d-none"><small>Tablica: obračun poreza</small></caption>
                    <thead>
                        <tr>
                            <td scope="col" class="align-bottom pb-0">Porez</td>
                            <td scope="col" class="text-right align-bottom pb-0">Stopa [%]</td>
                            <td scope="col" class="text-right align-bottom pb-0">Osnovica [Kn]</td>
                            <td scope="col" class="text-right align-bottom pb-0">Iznos [Kn]</td>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="4" class="text-right align-middle">Ukupni iznos poreza: 0.00 € | 0.00 Kn</td>
                      </tr>
                    </tfoot>
                </table>
            </div>
          </div>
        ` : `
          <div class="d-none d-print-block pb-2">
              <p class="text-center py-2 m-0 border-top border-bottom"><small>PDV nije zaračunat po čl. 39 Zakona o PDV-u</small></p>
          </div>
        `}
        
        <p class="d-print-none text-danger p-0 m-0" id="printRacunPotrosnjaInfo"></p>
        <div class="d-none d-print-block">
          <p class="p-0 m-0">
            Datum i vrijeme: <span id="printDatumRacunPotrosnja">${(new Date()).toLocaleString('de-AT')}</span><br/>
            Blagajnik: ${Djelatnik}<br/>
          </p>
          ${ObveznikFiskalizacije ? `
            <p class="p-0 m-0">
              Broj računa: Račun nije fiskaliziran.<br/>
              ZKI: Račun nije fiskaliziran.<br/>
              JIR: Račun nije fiskaliziran.<br/>
            </p>
          ` : ''}
          <div class="pt-2">
            Fiksni tečaj konverzije 1 € = 7.53450 Kn.
            <br/>
            Ograničena je dnevna kupovina artikala po skupinama. Za podnošenje predstavke o usluzi obratite se na: studentski-standard@mzo.hr. Vaša studentska prava provjerite na issp.srce.hr.   
          </div>
        </div>
      </div>
      <div class="row" id="kosaricaButtonsRow">
        <div class="col">
          <div class="btn-group w-100 z-depth-0 rounded-0" role="group" aria-label="poništi i naplati košaricu">
            <button type="button" class="btn btn-lg btn-light-f m-0 z-depth-0 rounded-0" id="ponistiBrKarticeKosarica"><span class="material-icons ">loop</span> Poništi</button>
            <button type="button" id="naplatiKosaricuBtn" class="btn btn-lg btn-light-f active m-0 z-depth-0 rounded-0"><span class="material-icons ">library_add_check</span> Naplati</button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <p class="text-center py-1 m-0"><small>Fiksni tečaj konverzije 1 € = 7.53450 Kn.<br/>Izračun na ekranu može odstupati jednu lipu u odnosu na stvarni račun!</small></p>
        </div>
      </div>
    </div>
  `;
  }

  async pretraziArtikle(e) {
    this.pretraziArtikleCol.querySelector('#buttonsRow label.active').classList.remove('active');
    $('input[type=\'radio\'][name=\'options\'][data-id=\'0\']').prop('checked', true).
        parent().
        addClass('active');

    const upisano = e.currentTarget.value.toLocaleLowerCase();
    const artikli = Array.from(this.menuHolder.querySelectorAll('.menuArtikl'));

    if (upisano.length > 1) {
      artikli.forEach((element) => {
        const naziv = element.querySelector('.textNaziv').innerText.toLocaleLowerCase();
        const id = element.querySelector('.textID').innerText;

        if (naziv.includes(upisano) || id.includes(upisano)) {
          element.classList.remove('d-none');
        } else {
          element.classList.add('d-none');
        }
      });
    } else {
      artikli.forEach((element) => {
        element.classList.remove('d-none');
      });
    }
  }

  async ponistiPretraziArtikle() {
    this.pretraziArtikleCol.querySelector('#buttonsRow label.active').classList.remove('active');
    $('input[type=\'radio\'][name=\'options\'][data-id=\'0\']').prop('checked', true).
        parent().
        addClass('active');

    const artikli = Array.from(this.menuHolder.querySelectorAll('.menuArtikl'));

    artikli.forEach((element) => {
      element.classList.remove('d-none');
    });

    this.pretraziArtikleCol.querySelector('#pretraziArtikle').value = '';
  }

  async nefiskaliziraniRacuni() {
    if (window.navigator.onLine) {
      // TODO: upisati adresu za provjeru broja nefiskaliziranih racuna
      const ajaxURL = ``;
      const nefisrac = Array.from(document.querySelectorAll('.nefisrac'));
      let err; let data;

      // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
      [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': {}, 'putanja': ''})));
      if (err) return new Error(appStatus(new ErrorView().getError(err), true));

      [err, data] = await to(otkljucajToken(data.jwtToken));
      if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

      const {BrojRacuna} = data;
      if (parseInt(BrojRacuna, 10) > 0) {
        // TODO: upisati adresu za pokretanje naknadne fiskalizacije  nefiskaliziranih racuna
        [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': {}, 'putanja': ''})));
        if (err) return new Error(appStatus(new ErrorView().getError(err), true));

        [err, data] = await to(otkljucajToken(data.jwtToken));
        if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

        appStatus('Računi poslani na fiskalizaciju.');
      }

      nefisrac.forEach((e) => {
        if (parseInt(BrojRacuna, 10) > 0) {
          e.classList.add('text-danger', 'font-weight-bold');
        } else {
          e.classList.remove('text-danger', 'font-weight-bold');
        }
        e.innerText = BrojRacuna;
      });
    }
  }

  async coreEvents() {
    $('#blagajnaLoaded').on('change', 'input[type=\'radio\'][name=\'options\']', (e) => {
      this.pretraziArtikleCol.querySelector('#pretraziArtikle').value = '';
      const cols = Array.from(document.querySelectorAll('#menuHolder .menuArtikl'));

      cols.forEach((element) => {
        if (parseInt(element.dataset.displaygrupaid, 10) === parseInt(e.currentTarget.dataset.id, 10) && parseInt(e.currentTarget.dataset.id, 10) !== 0) {
          element.classList.remove('d-none');
        } else if (parseInt(e.currentTarget.dataset.id, 10) === 0) {
          element.classList.remove('d-none');
        } else if (element.dataset.ismenu === 'true' && element.dataset.menutype === 'menu' && e.currentTarget.dataset.id === 'menu') {
          element.classList.remove('d-none');
        } else if (element.dataset.ismenu === 'true' && element.dataset.menutype === 'menu-vege' && e.currentTarget.dataset.id === 'menu-vege') {
          element.classList.remove('d-none');
        } else {
          element.classList.add('d-none');
        }
      });
    });

    $('input[type=\'radio\'][name=\'manualAuto\']').on('change', async () => {
      this.inputBrKartice.value = '';
      document.getElementById('unosBrKartice').toggleAttribute('disabled');
    });

    $('#unosBrKartice').on('input', async (e) => {
      console.log(`Unos kartice input polje: ${e.currentTarget.value}`);
      if (e.currentTarget.value.length === 8 && parseInt($('input[type=\'radio\'][name=\'manualAuto\']:checked').val(), 10) === 1 || e.currentTarget.value.length === 19 && parseInt($('input[type=\'radio\'][name=\'manualAuto\']:checked').val(), 10) === 2) {
        await statusBlagajne(window.navigator.onLine);

        if (window.navigator.onLine) {
          const [errStudent, studentData] = await to(this.getStudentData(e.currentTarget.value));
          console.log(errStudent);
          if (!errStudent) {
            const [errMenu, menuData] = await to(this.getMenuData(e.currentTarget.value));
            if (!errMenu) {
              await this.showStudentMenu(studentData, menuData);
              this.naplata.kartica = studentData;
              this.kosarica.iznosi = studentData;
              this.blagajnaLoaded.classList.remove('d-none');
              isspVrijeme.prikazStudenta = setTimeout(async () => {
                await this.init();
              }, 1000*60*5);
            }
          }
          return true;
        }

        if (this.obveznikFiskalizacije) return new Error(appStatus('Provjerite Internet konekciju!', true));

        const studentData = JSON.parse(localStorage.offlineStudent);
        studentData.BrKartice = e.currentTarget.value;
        await this.showStudentMenu(studentData, JSON.parse(localStorage.offlineAktivniArtikli ? localStorage.offlineAktivniArtikli : localStorage.sviArtikli));
        this.naplata.kartica = studentData;
        this.kosarica.iznosi = studentData;
        this.blagajnaLoaded.classList.remove('d-none');
      }
    });

    $('#unosKarticeCard').on('click', '#ponistiBrKartice', async () => {
      await this.init();
    });

    $('#blagajnaLoaded').on('input', '#pretraziArtikle', async (e) => {
      await this.pretraziArtikle(e);
    });

    $('#blagajnaLoaded').on('click', '#ponistiTrazilicu', async () => {
      await this.ponistiPretraziArtikle();
    });

    $('#blagajnaLoaded').on('click', '#menuHolder .menuArtikl', (e) => {
      this.kosarica.dodaj(e);
    });

    $('#blagajnaLoaded').on('click', '#kosaricaCol button.ukloniIzKosarice', (e) => {
      this.kosarica.ukloni(e);
    });

    $('#blagajnaLoaded').on('click', '#kosaricaCol button#ponistiBrKarticeKosarica', async () => {
      await this.init();
    });

    $('#blagajnaLoaded').on('click', '#kosaricaCol button#naplatiKosaricuBtn', async (e) => {
      await this.naplata.init(e);
      await this.init();
    });
  }
}
