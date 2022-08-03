/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
// css datoteke
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Shared/css/mdb.min.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import 'datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css';
import '../../Shared/css/buttons.bootstrap4.min.css';
import 'toastr/build/toastr.min.css';
import 'notyf/notyf.min.css';
import '../../Shared/css/maintemplate.css';
import '../src/restoranklijent.css';

// js datoteke
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'bootstrap';
import '../../Shared/js/mdb.min.js';
import 'datatables.net-bs4';
import 'datatables.net-responsive-bs4';
import 'datatables.net-rowgroup';
// nesto od ovog ubija css od tablice, provjeriti
import '../../Shared/js/dataTables.buttons.min.js';
import '../../Shared/js/buttons.bootstrap4.min.js';
import '../../Shared/js/jszip.min.js';
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import '../../Shared/js/buttons.html5.min.js';
import '../../Shared/js/buttons.print.min.js';
import '../../Shared/js/buttons.colVis.min.js';
import {Notyf} from 'notyf';
import WebFont from 'webfontloader';

const printJS = require('print-js');

// slike
import '../../Shared/img/logo/srce.png';
import '../../Shared/img/logo/ikona_srce.png';
import '../../Shared/img/logo/srce-logo-potpis-web.png';
import '../../Shared/img/logo/Logo_potpis_adresa.gif';
import '../../Shared/img/logo/logo-srce-bez-potpisa-krivulje-web.gif';
import '../../Shared/img/hrvatski-grb-crno-bijelo.jpg';
import '../../Shared/img/srce-logo-bijeli-350x135.png';
import '../../Shared/img/srce-logo-bijeli-150x50.png';

import Main from '../template/main';
import {appStatus, doAjax, to} from '../../Shared/js/asyncAjax';
import {otkljucajToken, zakljucajToken} from '../template/jwt';
import ErrorView from '../../Shared/js/errorView';

// fontovi
WebFont.load({'google': {'families': ['Roboto:300,300i,400,400i,500,500i,700', 'Roboto+Mono:300,400,700', 'Roboto+Slab:300,400,700', 'Material+Icons']}});
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// globalne varijable i postavke
global.$ = global.jQuery = $;
global.brKartice = null;
global.isspVrijeme = {
  prikazSata: null,
  nefiskrac: null,
  prikazStudenta: null,
  autoOdjava: null,
  provjeraVeze: null,
};

global.notyf = new Notyf({
  duration: 4000,
  position: {
    x: 'right',
    y: 'top',
  }});

class App {
  constructor() {
    this.admin = false;
    this.autoBlagajna = false;
    this.autoOdjava = false;
    this.kontrolniBrojDjelatnika = null;
    this.obveznikPDV = false;
    this.obveznikFiskalizacije = false;
    // ostaviti prazno
    this.korisnickoIme = '';
    this.server = 'https://issp.srce.hr/restoranapi';
    this.d1 = new Date(`07/16/${new Date().getFullYear()}`);
    this.d2 = new Date(`08/31/${new Date().getFullYear()}`);
    this.danas = new Date();
    this.windowLocation = window.location.href;
    this.header = document.querySelector('header');
    this.footer = document.querySelector('footer');
    this.mainDiv = document.getElementById('mainDivContent');
  }

  async init() {
    if (localStorage.prijavljen) {
      const blagajnaInfo = JSON.parse(localStorage.blagajnaInfo);
      this.admin = blagajnaInfo.Admin;
      this.autoBlagajna = blagajnaInfo.autoBlagajna;
      this.autoOdjava = blagajnaInfo.autoOdjava;
      this.kontrolniBrojDjelatnika = blagajnaInfo.KontrolniBrojDjelatnika;
      this.obveznikPDV = blagajnaInfo.ObveznikPDV;
      this.obveznikFiskalizacije = blagajnaInfo.ObveznikFiskalizacije;
      this.korisnickoIme = blagajnaInfo.KorisnickoIme;
      this.main = new Main(
          {
            server: this.server,
            admin: this.admin,
            autoBlagajna: this.autoBlagajna,
            autoOdjava: this.autoOdjava,
            windowLocation: this.windowLocation,
            kontrolniBrojDjelatnika: this.kontrolniBrojDjelatnika,
            obveznikPDV: this.obveznikPDV,
            obveznikFiskalizacije: this.obveznikFiskalizacije,
            korisnickoIme: this.korisnickoIme,
          },
      );
      this.main.init();
    } else {
      await this.postaviStranicu();
      await this.login();
    }
  }

  async postaviStranicu() {
    this.header.innerHTML = '';
    this.footer.innerHTML = '';
    this.mainDiv.innerHTML = `
    <div class="row align-items-center h-100" id="loginRow">
        <div class="col-lg-8 offset-lg-2 col-xl-4 offset-xl-4">
            <div class="card z-depth-1 rounded-0 my-5">
                <div class="card-header bg-f-dark text-center rounded-0 py-5">
                    <img src="${this.windowLocation.replace(/\/?$/, '/')}dist/img/srce-logo-bijeli-350x135.png?v1" class="srceBigLogo img-fluid" alt="srce logo header" height="200" width="400">
                </div>
                <div class="card-body rounded-0">
                    <h5 class="card-title font-weight-bold text-center text-uppercase pt-3">Restoran studentske prehrane</h5>
                    <p class="text-center">Rad blagajne je omogućen od 06h - 23h</p>
                    <form autocomplete="off">
                        <div class="form-outline mb-4">
                            <input type="text" id="korisnickoIme" class="form-control form-control-lg rounded-0" placeholder="Korisničko ime" autocomplete="off" autofocus />
                            <label class="form-label d-none" for="korisnickoIme">Korisničko ime</label>
                        </div>

                        <div class="form-outline mb-4">
                            <input type="password" id="lozinka" class="form-control form-control-lg rounded-0" placeholder="Lozinka" autocomplete="off" />
                            <label class="form-label d-none" for="lozinka">Lozinka</label>
                        </div>

                        ${(localStorage.simKey && localStorage.privateKey) ? '' : `
                          <div class="form-outline mb-4">
                              <input type="text" id="simKey" class="form-control form-control-lg rounded-0" placeholder="Simetrični ključ" autocomplete="off" />
                              <label class="form-label d-none" for="simKey">Simetrični ključ</label>
                          </div>

                          <div class="form-outline mb-4">
                              <textarea type="text" id="privateKey" class="form-control form-control-lg rounded-0" placeholder="Privatni ključ" rows="10" autocomplete="off"></textarea>
                              <label class="form-label d-none" for="privateKey">Privatni ključ</label>
                          </div>
                        `}                        

                        <div class="form-outline mb-4">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="autoOdjava" />
                            <label class="form-check-label" for="autoOdjava">
                              Automatska odjava nakon 8 sati rada
                            </label>
                          </div>
                        </div>

                        <div class="form-outline mb-4">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="autoBlagajna" />
                            <label class="form-check-label" for="autoBlagajna">
                              Pokreni kao automatska/brza blagajna
                            </label>
                            <small>(ctrl+alt+x odjava)</small>
                          </div>
                        </div>

                        ${(this.danas.getTime() <= this.d2.getTime() && this.danas.getTime() >= this.d1.getTime()) ? '<p class="text-danger font-weight-bold">Naplata obroka nije dozvoljena u razdoblju od 16.07. do 31.08.!</p>' : '' }

                        <button type="button" class="btn btn-lg btn-light-f active btn-block z-depth-0 rounded-0 mb-4" id="prijavaSustav">Prijava u sustav</button>
                        <div class="text-right">
                          <button type="button" class="btn btn-md btn-light-f z-depth-0 rounded-0" id="izbrisiKljuceve">Izbriši ključeve</button>
                          <a type="button" href="https://wiki.srce.hr/pages/viewpage.action?pageId=78087078" target="_blank" rel="noopener" class="btn btn-md btn-light-f z-depth-0 rounded-0">Upute</a>
                          <button type="button" class="btn btn-md btn-light-f z-depth-0 rounded-0 d-none" id="installer">Instaliraj na desktop</button>
                        </div>                        
                    </form>
                </div>
                <div class="card-footer bg-f-dark text-center rounded-0">
                    <img src="${this.windowLocation.replace(/\/?$/, '/')}dist/img/footer_logo.png?v1" class="srceLogoFooter" alt="srce logo footer" height="20" width="60">
                </div>
            </div>
        </div>
    </div>
    `;
  }

  async login() {
    $('#izbrisiKljuceve').on('click', async (e) => {
      e.preventDefault();
      localStorage.simKey = '';
      localStorage.privateKey = '';
      $('#loginRow').fadeOut('slow', async () => {
        await this.init();
      });
    });

    $('#prijavaSustav').on('click', async (e) => {
      e.preventDefault();
      e.currentTarget.disabled = true;
      e.currentTarget.innerText = 'Učitavam..';
      localStorage.simKey = localStorage.simKey ? localStorage.simKey : (document.getElementById('simKey').value).trim();
      localStorage.privateKey = localStorage.privateKey ? localStorage.privateKey : (document.getElementById('privateKey').value).trim();

      if (localStorage.simKey === '' ||localStorage.privateKey === '') {
        e.currentTarget.disabled = false;
        e.currentTarget.innerText = 'Prijava u sustav';
        return new Error(appStatus('Nedostaje simetrični i/ili privatni ključ.', true));
      }

      if (window.navigator.onLine) {
        // TODO: upisati adresu za prijavu djelatnika u sustav
        const ajaxURL = ``;
        const tokenData = Object.freeze({
          'KorIme': (document.getElementById('korisnickoIme').value).trim(),
          'Lozinka': (document.getElementById('lozinka').value).trim(),
        });

        let err; let data;
        debugger;
        [err, data] = await to(zakljucajToken(tokenData));
        if (err) {
          e.currentTarget.disabled = false;
          e.currentTarget.innerText = 'Prijava u sustav';
          return new Error(appStatus('Greška kod zaključavanja tokena.', true));
        }

        // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
        [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
        if (err && (err.status === 0 || err.status === 503)) {
          $('#loginRow').fadeOut('slow', async () => {
            await this.init();
          });
          appStatus('Pokretanje sustava bez Internet konekcije!', true);
          localStorage.prijavljen = true;
          return true;
        } else if (err) {
          e.currentTarget.disabled = false;
          e.currentTarget.innerText = 'Prijava u sustav';
          return new Error(appStatus(new ErrorView().getError(err), true));
        }

        [err, data] = await to(otkljucajToken(data.jwtToken));
        if (err) {
          e.currentTarget.disabled = false;
          e.currentTarget.innerText = 'Prijava u sustav';
          return new Error(appStatus('Greška kod otključavanja tokena.', true));
        }

        console.log(data);

        data.autoBlagajna = document.getElementById('autoBlagajna').checked;
        data.autoOdjava = document.getElementById('autoOdjava').checked;
        localStorage.blagajnaInfo = JSON.stringify(data);

        $('#loginRow').fadeOut('slow', async () => {
          await this.dohvatiPodatkeOffline(data.KontrolniBrojDjelatnika);
          await this.init();
        });
      } else {
        $('#loginRow').fadeOut('slow', async () => {
          await this.init();
        });

        appStatus('Pokretanje sustava bez Internet konekcije!', true);
      }

      localStorage.prijavljen = true;
    });
  }

  // dohvat svih podataka i pohrana u memoriju
  async dohvatiPodatkeOffline() {
    if (!localStorage.sviArtikli) {
      // TODO: upisati adresu za dohvat svih artikala
      const ajaxURL = ``;
      const ajaxDATA = null;
      const method = 'GET';
      const offlineArtikli = [];
      let err; let data;
      debugger;
      [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
      if (err) return new Error(appStatus(new ErrorView().getError(err), true));

      [err, data] = await to(otkljucajToken(data.jwtToken));
      if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

      const {PopisPojedinacnihArtikala, PopisMenija} = data;

      for (const i of PopisPojedinacnihArtikala) {
        const temp = {};
        temp.Aktivan = true;
        temp.Id = i.SifraArtikla;
        temp.Naziv = i.NazivArtikla;
        temp.Cijena = i.CijenaArtikla;
        temp.Subvencija = i.SubvencijaArtikla;
        temp.ZaPlatiti = i.ZaPlatiti;
        temp.PDVIznos = i.PDVIznos;
        temp.StopaPoreza = i.StopaPoreza;
        temp.PostoParticipacije = i.PostoParticipacije;
        temp.GrupaArtiklaId = i.SifGrupeArtikla;
        temp.GrupaArtiklaMaxKolicina = 3;
        temp.PotrosenoDanas = 0;
        temp.IsMenu = false;
        temp.Artikli = null;
        temp.DisplayGrupaId = 4;
        temp.DisplayGrupaNaziv = 'ostalo';

        offlineArtikli.push(temp);
      }

      for (const i of PopisMenija) {
        const temp = {};
        temp.Aktivan = true;
        temp.Id = i.SifraMenija;
        temp.Naziv = i.NazivMenija;
        temp.Cijena = i.CijenaMenija;
        temp.Subvencija = i.SubvencijaMenija;
        temp.ZaPlatiti = i.ZaPlatiti;
        temp.PDVIznos = i.PDVIznos;
        temp.StopaPoreza = i.StopaPoreza;
        temp.PostoParticipacije = i.PostoParticipacije;
        temp.GrupaArtiklaId = i.SifraGrupeMenija;
        temp.GrupaArtiklaMaxKolicina = 3;
        temp.PotrosenoDanas = 0;
        temp.IsMenu = true;
        temp.Artikli = [{NazivArtikla: 'Nepoznato'}];
        temp.DisplayGrupaId = i.DisplayGrupaId;
        temp.DisplayGrupaNaziv = i.DisplayGrupaNaziv;
        offlineArtikli.push(temp);
      }

      localStorage.sviArtikli = JSON.stringify(offlineArtikli);
    }

    if (!localStorage.offlineStudent) {
      const student = {
        Ime: 'Offline',
        Prezime: 'Korisnik',
        BrKartice: null,
        OIB: 'Nepoznat',
        JMBAG: 'Nepoznat',
        SubvencijaIznosDodijeljeno: '100.00',
        Slika: null,
        RazinaPrava: 2.5,
        PravaDoDatuma: '01.01.3020.',
        PravaOdDatuma: '01.01.2020.',
        IsKarticaAktivna: true,
        Poruka: null,
        SubvencijaDnevniIznosRaspoloziv: '40.25',
        SubvencijaDvostrukiDnevniIznos: '80.50',
        GrupeArtikalaPotrosenoDanas: null,
        KontrolniBrojStudenta: null,
      };

      localStorage.offlineStudent = JSON.stringify(student);
    }
  }
}

class Installer {
  async init() {
    let promptEvent;
    const root = document.getElementById('installer');

    if (!root) return false;
    const install = function(e) {
      if (promptEvent) {
        promptEvent.prompt();
        promptEvent.userChoice
            .then(() => {
              promptEvent = null;
              root.classList.add('d-none');
            })
            .catch(() => {
              promptEvent = null;
              root.classList.add('d-none');
            });
      }
    };

    const installed = function(e) {
      promptEvent = null;
      root.classList.add('d-none');
    };

    const beforeinstallprompt = function(e) {
      promptEvent = e;
      promptEvent.preventDefault();
      root.classList.remove('d-none');
      return false;
    };

    window.addEventListener('beforeinstallprompt', beforeinstallprompt);
    window.addEventListener('appinstalled', installed);

    root.addEventListener('click', install.bind(this));
    root.addEventListener('touchend', install.bind(this));
  }
}

// pokreni aplikaciju
const app = new App();
// omoguci instalaciju aplikacije na zaslon (desktop)
const installer = new Installer();

$(window).on('load', async () => {
  await app.init();
  await installer.init();
  $('#loader').fadeOut('slow', () => {
    $('main').removeClass('op-0');
  });
});
