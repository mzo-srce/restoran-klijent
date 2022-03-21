/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import PopisPojedinacnihArtikala from './popisPojedinacnihArtikala';
import PopisMenia from './popisMenia';
import Ponuda from './ponuda';
import Blagajna from './blagajna';
import IzmjenaSastavnica from './izmjenaSastavnica';
import ObracunBlagajne from './obracunBlagajne';
import ObracunObjekta from './obracunObjekta';
import SkenerIskaznica from './skenerIskaznica';
import StorniranjeRacuna from './storniranjeRacuna';
import PovijestRacuna from './povijestRacuna';
import Odjava from './odjava';
import {displayClock} from '../../Shared/js/asyncAjax';
import {header} from './header';
import {footer} from './footer';
import AdministracijaDjelatnika from './administracijaDjelatnika';
import DodajDjelatnika from './dodajDjelatnika';
export default class Main {
  constructor({server, admin, autoBlagajna, autoOdjava, windowLocation, kontrolniBrojDjelatnika, obveznikPDV, korisnickoIme}) {
    this.admin = admin;
    this.autoBlagajna = autoBlagajna;
    this.autoOdjava = autoOdjava;
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.obveznikPDV = obveznikPDV;
    this.korisnickoIme = korisnickoIme;
    this.header = document.querySelector('header');
    this.footer = document.querySelector('footer');
    this.skener = new SkenerIskaznica();
    this.administracijaDjelatnika = new AdministracijaDjelatnika(this.server, this.windowLocation, this.admin, this.kontrolniBrojDjelatnika);
    this.dodajDjelatnika = new DodajDjelatnika(this.server, this.windowLocation, this.admin, this.kontrolniBrojDjelatnika);
    this.blagajna = new Blagajna(this.server, this.windowLocation, this.kontrolniBrojDjelatnika, this.obveznikPDV);
    this.popisPojedinacnihArtikala = new PopisPojedinacnihArtikala(this.server, this.windowLocation, this.kontrolniBrojDjelatnika);
    this.popisMenia = new PopisMenia(this.server, this.windowLocation, this.kontrolniBrojDjelatnika);
    this.ponuda = new Ponuda(this.server, this.kontrolniBrojDjelatnika);
    this.izmjenaSastavnica = new IzmjenaSastavnica(this.server, this.windowLocation, this.admin, this.kontrolniBrojDjelatnika);
    this.obracunBlagajne = new ObracunBlagajne(this.server, this.windowLocation, this.kontrolniBrojDjelatnika);
    this.obracunObjekta = new ObracunObjekta(this.server, this.windowLocation, this.admin, this.kontrolniBrojDjelatnika);
    this.storniranjeRacuna = new StorniranjeRacuna(this.server, this.windowLocation, this.kontrolniBrojDjelatnika);
    this.povijestRacuna = new PovijestRacuna(this.server, this.windowLocation, this.kontrolniBrojDjelatnika);
    this.odjava = new Odjava(this.server, this.windowLocation, this.kontrolniBrojDjelatnika);
    this.lookupTableIzbornici = {
      'administracijaDjelatnika': async () => {
        await this.administracijaDjelatnika.init();
      },
      'blagajna': async () => {
        await this.blagajna.init();
      },
      'dodajDjelatnika': async () => {
        await this.dodajDjelatnika.init();
      },
      'izmjenaSastavnica': () => {
        this.izmjenaSastavnica.init();
      },
      'obracunBlagajne': async () => {
        await this.obracunBlagajne.init();
      },
      'obracunObjekta': async () => {
        await this.obracunObjekta.init();
      },
      'popisPojedinacnihArtikala': () => {
        this.popisPojedinacnihArtikala.init();
      },
      'ponuda': () => {
        this.ponuda.init();
      },
      'storniranjeRacuna': () => {
        this.storniranjeRacuna.init();
      },
      'popisMenia': () => {
        this.popisMenia.init();
      },
      'povijestRacuna': () => {
        this.povijestRacuna.init();
      },
      'odjavaSustav': async () => {
        await this.odjava.init();
      },
    };
  }

  init() {
    if (isspVrijeme.autoOdjava === null && this.autoOdjava) {
      isspVrijeme.autoOdjava = setTimeout(async () => {
        await this.lookupTableIzbornici['odjavaSustav']();
      }, 1000*60*60*8);
    }

    this.header.innerHTML = header(this.korisnickoIme, this.admin, this.autoBlagajna, this.windowLocation);
    this.footer.innerHTML = footer(this.windowLocation);
    this.events();
    this.lookupTableIzbornici['blagajna']();
  }

  events() {
    $(window).on('keypress', (e) => {
      $.when(this.skener.dohvatiBrojIskaznice(e)).then((response) => {
        if (document.getElementById('unosKarticeCard') && document.getElementById('unosKarticeCard').classList.contains('d-none') === false) {
          document.getElementById('unosBrKartice').value = response;
          $('#unosBrKartice').trigger('input');
        }
      });
    });

    $('header').on('click', 'a', (e) => {
      if (e.target.id) {
        const a = Array.from(document.querySelectorAll('header ul li a'));

        a.forEach((e) => {
          e.classList.remove('active');
        });
        e.target.classList.add('active');
        this.lookupTableIzbornici[e.target.id]();
      }
    });

    $(document).on('click', 'button, li, a', (e) => {
      if (!e.detail || e.detail > 1) {
        e.preventDefault();
        e.stopPropagation();
        console.log('zaustavljam multi-click!');
        return false;
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'x') {
        this.lookupTableIzbornici['odjavaSustav']();
      }
    });

    $(document).on('submit', 'form', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    displayClock();
    console.warn('%cIzmjena koda utječe na rad aplikacije, molimo Vas zatvorite ovaj prozor!', 'color: red; font-size: 20px');
  }
}
