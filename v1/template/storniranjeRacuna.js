/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import {appStatus, datumi, divStatusCard, doAjax, dtOptions, hideStatusCard, to, ugasiTImere} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';
import Racun from './racun';


export default class StorniranjeRacuna {
  constructor(server, windowLocation, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.mainDiv = document.getElementById('mainDivContent');
    this.racun = new Racun();
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
  }

  async init() {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    await ugasiTImere();
    await this.postaviStranicu();
    await this.initDataTable();
    await this.ponoviProcesZaDatum();
    await this.storniraj();
    await hideStatusCard();
  }

  async ponoviProcesZaDatum(datum = datumi(0)) {
    await this.dohvatiPodatke(datum);
  }

  async postaviStranicu() {
    this.mainDiv.innerHTML = `
    <div class="row py-3">
      <div class="col">
      ${divStatusCard()}
        <div class="card bg-dark z-depth-0 rounded-0 d-none content-card">
            <div class="card-body p-0 rounded-0">
              <div class="table-responsive">
                <table class="table table-dark w-100" id="popisRacunaTable" data-order='[[ 2, "desc" ]]'>
                      <thead class="thead-dark">
                          <tr>  
                            <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Djelatnik</th>
                            <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Račun</th>
                            <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="true">Vrijeme računa</th>                              
                            <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="false">Ukupni iznos [kn]</th>
                            <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="false">Ukupni iznos subvencije [kn]</th>
                            <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="false">Ukupno za platiti [kn]</th>
                            <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="true">Fiskaliziran</th>
                            <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="true">Storniran</th>
                            <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="true">Storno</th> 
                          </tr>
                      </thead>
                      <tbody>
                      </tbody>
                  </table>
              </div>               
            </div>
        </div>
      </div>
    </div>
    `;
  }

  async dohvatiPodatke(datum) {
    const table = $('#popisRacunaTable').DataTable();
    // TODO: upisati adresu za dohvat povijesti racuna
    const ajaxURL = ``;
    const tokenData = Object.freeze({
      'DatumDohvata': datum,
      'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
    });
    let err; let data;

    [err, data] = await to(zakljucajToken(tokenData));
    if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

    // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
    [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

    table.clear();
    table.rows.add(data).draw();
  }

  async initDataTable() {
    const {dom, language, pageLength, pagingType, responsive} = dtOptions;
    $('#popisRacunaTable').DataTable( {
      dom,
      language,
      pageLength,
      pagingType,
      responsive,
      'columns': [
        {'data': 'Djelatnik', 'searchable': false},
        {'data': 'BrRacuna'},
        {'data': 'DatumVrijemeRacuna', 'searchable': false},
        {
          'data': null,
          'searchable': false,
          'render': ({UkupniIznosSubvencije, UkupniIznosZaPlatiti}) => {
            return (Number(UkupniIznosSubvencije) + Number(UkupniIznosZaPlatiti)).toFixed(2);
          },
        },
        {'data': 'UkupniIznosSubvencije', 'searchable': false},
        {'data': 'UkupniIznosZaPlatiti', 'searchable': false},
        {
          'data': null,
          'searchable': false,
          'render': ({ObveznikPDV, RacunOdgovor}) => {
            if (ObveznikPDV && RacunOdgovor.HasJIR) {
              return 'DA';
            }
            return 'NE';

            ;
          },
        },
        {
          'data': 'UkupniIznosZaPlatiti',
          'searchable': false,
          'render': (data) => {
            if (Number(data) < 0) {
              return 'DA';
            }
            return 'NE';
          },
        },
        {
          'data': 'UkupniIznosZaPlatiti',
          'searchable': false,
          'render': (data) => {
            if (Number(data) < 0) {
              return `<button type="button" class="btn btn-md btn-success pe-none" >
                        Storniran
                    </button>`;
            }
            return `<button type="button" class="btn btn-md storniraj btn-dark-f" >
                        Storniraj
                    </button>`;
          },
        },

      ],
      'createdRow': ( row, data, index ) => {
        $('td', row).eq(5).attr('data-order', (data.DatumVrijemeRacuna).replace(/[^0-9\.]+/g, ''));
      },
      'initComplete': () => {
        $('#popisRacunaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
      },
    } );
  }

  async storniraj() {
    $('#popisRacunaTable tbody').on('click', 'button.storniraj', async (e) => {
      const table = $('#popisRacunaTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );
      // TODO: upisati adresu za storniranje racuna
      const ajaxURL = ``;
      const tokenData = Object.freeze({
        'DatumRacuna': (row.data().DatumVrijemeRacuna).split('. ')[0].split('.').reverse().join('-'),
        'BrojRacuna': Number(row.data().BrRacuna),
        'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
      });

      let err; let data;
      debugger;
      [err, data] = await to(zakljucajToken(tokenData));
      if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

      // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
      [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
      if (err) return new Error(appStatus(new ErrorView().getError(err), true));

      [err, data] = await to(otkljucajToken(data.jwtToken));
      debugger;
      if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

      console.log(data);
      e.currentTarget.classList.add('btn-success', 'pe-none');
      e.currentTarget.classList.remove('btn-dark-f', 'storniraj');
      e.currentTarget.textContent = 'Storniran';
      tr[0].querySelector('td:nth-of-type(4)').innerText=`-${tr[0].querySelector('td:nth-of-type(4)').innerText}`;
      tr[0].querySelector('td:nth-of-type(5)').innerText=`-${tr[0].querySelector('td:nth-of-type(5)').innerText}`;
      tr[0].querySelector('td:nth-of-type(6)').innerText=`-${tr[0].querySelector('td:nth-of-type(6)').innerText}`;
      tr[0].querySelector('td:nth-of-type(8)').innerText='DA';
      appStatus(`Račun ${row.data().BrRacuna} uspješno storniran.`);
      await this.racun.init(data, true, true);
    });
  }
}
