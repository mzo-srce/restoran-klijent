/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {appStatus, doAjax, to} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';
import Racun from './racun';

export default class Naplata {
  constructor(server, windowLocation, kontrolniBrojDjelatnika, obveznikPDV) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.obveznikPDV = obveznikPDV;
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
    this.racun = new Racun();
    this.brKarticeWeb = null;
    this.kontrolniBrojStudenta = null;
    this.razinaPrava = null;
    this.pravaOd = null;
    this.pravaDo = null;
  }

  set kartica({BrKartice = null, KontrolniBrojStudenta = null, RazinaPrava = null, PravaOdDatuma = null, PravaDoDatuma = null}) {
    this.brKarticeWeb = BrKartice;
    this.kontrolniBrojStudenta = KontrolniBrojStudenta;
    this.razinaPrava = RazinaPrava;
    this.pravaOd = PravaOdDatuma;
    this.pravaDo = PravaDoDatuma;
  }

  async init(e) {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));

    const redovi = Array.from(document.querySelectorAll('#kosaricaCol table#kosaricaTable > tbody > tr'));
    if (redovi.length === 0) return new Error(appStatus('Košarica ne sadrži artikle. Naplata nije izvršena!', true));
    e.currentTarget.disabled = true;
    e.currentTarget.innerText = 'Izvršavam..';
    await this.posaljiKosaricu();
  }

  async posaljiKosaricu() {
    const redovi = Array.from(document.querySelectorAll('#kosaricaCol table#kosaricaTable > tbody > tr'));
    const sastavnice = [];
    redovi.forEach((element) => {
      sastavnice.push({
        'SifraArtikla': parseInt(element.querySelector('td:nth-child(1)').dataset.tdid, 10),
        'Kolicina': parseInt(element.querySelector('td:nth-child(2)').textContent, 10),
      });
    });

    // TODO: upisati adresu za slanje sadrzaja kosarice
    const ajaxURL = ``;
    const tokenData = Object.freeze({
      'BrKartice': this.brKarticeWeb,
      'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
      'KontrolniBrojStudenta': this.kontrolniBrojStudenta,
      'Artikli': sastavnice,
    });

    console.log(tokenData);
    let err; let data;

    [err, data] = await to(zakljucajToken(tokenData));
    if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

    // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
    [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

    console.log(data);

    data.RazinaPrava = this.razinaPrava;
    await this.izradiRacun(data, true);
  }

  async izradiRacun(racunDetalji, online) {
    const {
      obveznikPDV,
      RacunOdgovor,
    } = racunDetalji;

    const {HasGreska, HasJIR} = RacunOdgovor;

    if ((obveznikPDV && HasGreska) || (obveznikPDV && !HasJIR)) {
      appStatus(`Naplata izvršena bez fiskalizacije.`);
    } else {
      appStatus(`Naplata izvršena.`);
    }

    await this.racun.init(racunDetalji, false, online);
  }
}
