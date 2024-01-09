/* eslint-disable max-len */

import {appStatus, divChildCard, divStatusCard, doAjax, dtOptions, hideChildCard, hideStatusCard, to, ugasiTImere} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';

/* eslint-disable require-jsdoc */
export default class AdministracijaDjelatnika {
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
      await this.initDataTable();
      await this.dohvatiPodatke();
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
            <div class="card-body p-0 rounded-0">
              <div class="table-responsive">
                <table class="table table-dark w-100" id="popisDjelatnikaTable" data-order='[[ 0, "asc" ]]'>
                      <thead class="thead-dark">
                          <tr>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">ID</th>
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="false">Ime</th>    
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="false">Prezime</th>  
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="false">Korisničko ime</th>
                              <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="false">OIB</th>
                              <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="false">Administrator</th>  
                              <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="false">Izmjena podataka</th> 
                          </tr>
                      </thead>
                      <tbody></tbody>
                  </table>
              </div>                
            </div>
        </div>
      </div>
    </div>
    `;
  }

  async dohvatiPodatke() {
    const table = $('#popisDjelatnikaTable').DataTable();
    // TODO: upisati adresu
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;
    debugger;
    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));


    table.clear();
    table.rows.add(data).draw();
  }

  async initDataTable() {
    const {dom, language, pageLength, pagingType, responsive} = dtOptions;

    const format = ({IdDjelatnika, Ime, Prezime, KorisnickoIme, Admin}) => {
      return `
        ${divChildCard()}
        <div class="card bg-dark rounded-0 z-depth-0 d-none child-content">
          <div class="card-header rounded-0">
            ID djelatnika <strong>${IdDjelatnika}</strong>
          </div>
          <div class="card-body rounded-0">
            <p><strong>Lozinku ostavite praznu ako ju ne želite promijeniti.<br/>Kod bilo koje izmjene, osoba kojoj vršite izmjenu, mora se ponovo prijaviti u sustav.</strong></p>
            <form>
              <div class="form-outline mb-4">
                <label class="text-white" for="imeDjelatnika">Ime</label>
                <input type="text" id="imeDjelatnika" name="imeDjelatnika" class="form-control input-dark-f rounded-0 w-50" value="${Ime}" autocomplete="off" required>
              </div>
              <div class="form-outline mb-4">
                <label class="text-white" for="prezimeDjelatnika">Prezime</label>
                <input type="text" id="prezimeDjelatnika" name="prezimeDjelatnika" class="form-control input-dark-f rounded-0 w-50" value="${Prezime}" autocomplete="off" required>
              </div>
              <div class="form-outline mb-4">
                <label class="text-white" for="kiDjelatnika">Korisničko ime</label>
                <input type="text" id="kiDjelatnika" name="kiDjelatnika" class="form-control input-dark-f rounded-0 w-50" value="${KorisnickoIme}" autocomplete="off" required>
              </div>
              <div class="form-outline mb-4">
                <label class="text-white" for="lozinkaDjelatnika">Lozinka</label>
                <input type="password" id="lozinkaDjelatnika" name="lozinkaDjelatnika" class="form-control input-dark-f rounded-0 w-50" autocomplete="off" value="">
              </div>
              <div class="form-outline mb-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="adminPrava" ${Admin ? 'checked' : ''} />
                  <label class="form-check-label text-white" for="adminPrava">
                    Djelatnik posjeduje administratorska prava (potrebno označiti)
                  </label>
                </div>
              </div>

              <button type="button" class="btn btn-md btn-dark-f text-center" id="spremiIzmjene" data-id="${IdDjelatnika}" >
                  Spremi izmjene
              </button>
            </form>
          </div>
        </div>             
      `;
    };

    $('#popisDjelatnikaTable').DataTable( {
      dom,
      language,
      pageLength,
      pagingType,
      responsive,
      'columns': [
        {'data': 'IdDjelatnika'},
        {'data': 'Ime'},
        {'data': 'Prezime'},
        {'data': 'KorisnickoIme'},
        {'data': 'OIB', 'searchable': false},
        {
          'data': 'Admin',
          'searchable': false,
          'render': (data) => {
            return `${data ? 'DA' : 'NE'}`;
          },
        },
        {
          'className': 'details-control text-center align-middle',
          'data': 'IdDjelatnika',
          'searchable': false,
          'render': (data) => {
            return `<button type="button" class="btn btn-md btn-dark-f rounded-0 urediButton" data-id="${data}" >
                          Izmijeni
                      </button>`;
          },
        },
      ],
      'initComplete': () => {
        $('#popisDjelatnikaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
      },
    } );

    $('#popisDjelatnikaTable tbody').on('click', 'button.urediButton', async (e) => {
      debugger;
      const table = $('#popisDjelatnikaTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );

      if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        if ( table.row( '.shown' ).length ) {
          $('button.urediButton', table.row( '.shown' ).node()).trigger('click');
        }
        row.child( format(row.data())).show();
        tr.addClass('shown');
        await hideChildCard();
      }
    } );
  }

  async spremiIzmjene() {
    $('#popisDjelatnikaTable tbody').on('click', 'button#spremiIzmjene', async (e) => {
      debugger;
      const button = e.currentTarget;
      // TODO: upisati adresu
      const ajaxURL = ``;
      const tokenData = Object.freeze({
        'IdDjelatnika': parseInt(button.dataset.id, 10),
        'Ime': document.getElementById('imeDjelatnika').value,
        'Prezime': document.getElementById('prezimeDjelatnika').value,
        'Lozinka': document.getElementById('lozinkaDjelatnika').value,
        'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
        'Admin': document.getElementById('adminPrava').checked,
        'KorisnickoIme': document.getElementById('kiDjelatnika').value,
      });

      console.log(tokenData);

      let err; let data;
      debugger;
      [err, data] = await to(zakljucajToken(tokenData));
      if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

      // TODO: upisati adresu
      [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ``})));
      if (err) return new Error(appStatus(new ErrorView().getError(err), true));

      await this.dohvatiPodatke();
      appStatus(`Zahtjev za izmjenom djelatnika ${button.dataset.id} uspješno poslan.`);
    });
  }
}
