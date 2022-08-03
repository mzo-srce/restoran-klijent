/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {appStatus, divStatusCard, doAjax, hideStatusCard, to, ugasiTImere} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {zakljucajToken} from './jwt';


export default class DodajDjelatnika {
  constructor(server, windowLocation, admin, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.admin = admin;
    this.mainDiv = document.getElementById('mainDivContent');
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
  }

  async init() {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    await ugasiTImere();
    await this.postaviStranicu();
    if (this.admin) {
      await this.spremiIzmjene();
      await hideStatusCard();
    }
  }

  async postaviStranicu() {
    this.mainDiv.innerHTML = `
    <div class="row py-3">
      <div class="col">
      ${divStatusCard()}
        <div class="card bg-dark z-depth-0 rounded-0 d-none content-card">
            <div class="card-body rounded-0">
              <p class="text-white"><strong>Dodavanje novog djelatnika na ovu blagajnu.<br/>Sva polja je potrebno ispuniti.</strong></p>
              <form autocomplete="off">
                <div class="form-outline mb-4">
                  <label class="text-white" for="imeDjelatnika">Ime</label>
                  <input type="text" id="imeDjelatnika" name="imeDjelatnika" class="form-control input-dark-f rounded-0 w-50" value="" autocomplete="off" required>
                  <small class="form-text text-muted">
                      * Obavezno polje
                  </small>
                </div>
                <div class="form-outline mb-4">
                  <label class="text-white" for="prezimeDjelatnika">Prezime</label>
                  <input type="text" id="prezimeDjelatnika" name="prezimeDjelatnika" class="form-control input-dark-f rounded-0 w-50" value="" autocomplete="off" required>
                  <small class="form-text text-muted">
                      * Obavezno polje
                  </small>
                </div>
                <div class="form-outline mb-4">
                  <label class="text-white" for="kiDjelatnika">Korisničko ime</label>
                  <input type="text" id="kiDjelatnika" name="kiDjelatnika" class="form-control input-dark-f rounded-0 w-50" value="" autocomplete="off" required>
                  <small class="form-text text-muted">
                      * Obavezno polje <br/>
                      * Korisničko ime je oznaka s kojom će se djelatnik prijavljivati u sustav. Ne mora biti e-mail adresa.
                  </small>
                </div>
                <div class="form-outline mb-4">
                  <label class="text-white" for="oibDjelatnika">OIB</label>
                  <input type="text" id="oibDjelatnika" name="oibDjelatnika" class="form-control input-dark-f rounded-0 w-50" value="" autocomplete="off" required>
                  <small class="form-text text-muted">
                      * Obavezno polje
                  </small>
                </div>
                <div class="form-outline mb-4">
                  <label class="text-white" for="lozinkaDjelatnika">Lozinka</label>
                  <input type="password" id="lozinkaDjelatnika" name="lozinkaDjelatnika" class="form-control input-dark-f rounded-0 w-50" autocomplete="off" value="" required>
                  <small class="form-text text-muted">
                      * Obavezno polje
                  </small>
                </div>
                <div class="form-outline mb-4">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="adminPrava" />
                    <label class="form-check-label text-white" for="adminPrava">
                      Djelatnik posjeduje administratorska prava (potrebno označiti)
                    </label>
                  </div>
                </div>

                <button type="button" class="btn btn-md btn-dark-f text-center" id="spremiIzmjene" >
                    Dodaj djelatnika
                </button>
              </form>                
            </div>
        </div>
      </div>
    </div>
    `;
  }
  async spremiIzmjene() {
    $('button#spremiIzmjene').on('click', async () => {
      // TODO: upisati adresu za izmjenu djelatnika
      const ajaxURL = ``;
      const tokenData = Object.freeze({
        'Ime': document.getElementById('imeDjelatnika').value,
        'Prezime': document.getElementById('prezimeDjelatnika').value,
        'Lozinka': document.getElementById('lozinkaDjelatnika').value,
        'OIB': document.getElementById('oibDjelatnika').value,
        'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
        'Admin': document.getElementById('adminPrava').checked,
        'KorisnickoIme': document.getElementById('kiDjelatnika').value,
      });

      console.log(tokenData);

      let err; let data;

      [err, data] = await to(zakljucajToken(tokenData));
      if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

      // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
      [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ``})));
      if (err) return new Error(appStatus(new ErrorView().getError(err), true));

      document.querySelector('form').reset();
      appStatus(`Novi djelatnik uspješno dodan.`);
    });
  }
}
