/* eslint-disable max-len */

import {appStatus, doAjax, to} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';

/* eslint-disable require-jsdoc */
export default class Odjava {
  constructor(server, windowLocation, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
  }

  async init() {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    // TODO: upisati adresu
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    debugger;
    const [err] = await to(doAjax(ajaxURL, ajaxDATA, method));
    debugger;
    if (err && err.responseJSON !== 'Error: Blagajna ne postoji u sustavu') return new Error(appStatus(new ErrorView().getError(err), true));

    if (isspVrijeme.autoOdjava) {
      clearTimeout(isspVrijeme.autoOdjava);
      isspVrijeme.autoOdjava = null;
    }
    clearInterval(isspVrijeme.provjeraVeze);
    isspVrijeme.provjeraVeze = null;
    localStorage.removeItem('prijavljen');
    location.reload();
  }
}
