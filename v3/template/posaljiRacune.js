/* eslint-disable max-len */

import {appStatus, doAjax, statusBlagajne, to} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';

/* eslint-disable require-jsdoc */
export default class PosaljiRacune {
  constructor(server, windowLocation, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
  }

  async init() {
    debugger;
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    if (!localStorage.offlineRacuni) return appStatus('Svi računi uspješno sinkronizirani.');

    const racuni = JSON.parse(localStorage.offlineRacuni);
    const arrayOfTokens = [];
    // TODO: upisati adresu
    const ajaxURL = ``;

    for (const i of racuni) {
      i.KontrolniBrojDjelatnika = this.kontrolniBrojDjelatnika;

      const [err, data] = await to(zakljucajToken(i));
      if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

      arrayOfTokens.push(data);
    }

    let err; let data;
    [err, data] = await to(doAjax(ajaxURL, Object.freeze({'listaRacuna': arrayOfTokens})));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

    localStorage.removeItem('offlineRacuni');
    document.getElementById('posaljiRacune').classList.add('d-none');
    await statusBlagajne(true);
    if (document.getElementById('popisOfflineRacunaTable')) {
      const table = $('#popisOfflineRacunaTable').DataTable();
      table.clear().draw();
    }
    return appStatus(data);
  }
}
