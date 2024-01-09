/* eslint-disable max-len */

import {appStatus, dateTimeFormatT, doAjax, to} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';
import Racun from './racun';

/* eslint-disable require-jsdoc */
export default class Naplata {
  constructor(server, windowLocation, kontrolniBrojDjelatnika, obveznikPDV, obveznikFiskalizacije) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.obveznikPDV = obveznikPDV;
    this.obveznikFiskalizacije = obveznikFiskalizacije;
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

    const {databaseTime, viewTime} = dateTimeFormatT();
    // TODO: upisati adresu
    const ajaxURL = ``;
    const tokenData = Object.freeze({
      'BrKartice': this.brKarticeWeb,
      'DatumVrijemeRacuna': databaseTime,
      'ViewTime': viewTime,
      'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
      'KontrolniBrojStudenta': this.kontrolniBrojStudenta,
      'Artikli': sastavnice,
    });

    console.log(tokenData);
    if (window.navigator.onLine) {
      let err; let data;
      debugger;
      [err, data] = await to(zakljucajToken(tokenData));
      if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

      // TODO: upisati adresu
      [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
      if (err && (err.status === 0 || err.status === 503)) {
        await this.izradiRacun(await this.pripremaOfflineRacuna(tokenData), false);
      } else {
        if (err) return new Error(appStatus(new ErrorView().getError(err), true));

        [err, data] = await to(otkljucajToken(data.jwtToken));
        if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

        console.log(data);

        data.RazinaPrava = this.razinaPrava;
        await this.izradiRacun(data, true);
      }
    } else {
      await this.izradiRacun(await this.pripremaOfflineRacuna(tokenData), false);
    }
  }

  async pripremaOfflineRacuna(tokenData) {
    if (this.obveznikFiskalizacije) return new Error(appStatus('Naplatu nije moguće izvršiti. Provjerite Internet konekciju!', true));

    let offlineRacuni;
    if (localStorage.offlineRacuni) {
      offlineRacuni = JSON.parse(localStorage.offlineRacuni);
    } else {
      offlineRacuni = [];
    }
    offlineRacuni.push(tokenData);
    localStorage.offlineRacuni = JSON.stringify(offlineRacuni);

    const data = Object.freeze({
      obveznikPDV: this.obveznikPDV,
      obveznikFiskalizacije: this.obveznikFiskalizacije,
      RacunOdgovor: {
        HasGreska: true,
        HasJIR: false,
      },
    });

    return data;
  }

  async izradiRacun(racunDetalji, online) {
    const {
      obveznikPDV,
      obveznikFiskalizacije,
      RacunOdgovor,
    } = racunDetalji;

    const {HasGreska, HasJIR} = RacunOdgovor;

    if ((obveznikFiskalizacije && HasGreska) || (obveznikFiskalizacije && !HasJIR)) {
      appStatus(`Naplata izvršena bez fiskalizacije.`);
    } else {
      appStatus(`Naplata izvršena.`);
    }

    await this.racun.init(racunDetalji, false, online);
  }
}
