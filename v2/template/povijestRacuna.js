/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import {appStatus, datumi, divStatusCard, doAjax, dtOptions, hideStatusCard, to, ugasiTImere, toEuro, zaokruziNaDvije} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';
import Racun from './racun';


export default class PovijestRacuna {
  constructor(server, windowLocation, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.mainDiv = document.getElementById('mainDivContent');
    this.racun = new Racun(this.tecaj);
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
  }

  async init() {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    await ugasiTImere();
    await this.postaviStranicu();
    await this.initDataTable();
    await this.ponoviProcesZaDatum();
    await this.ispisiRacun();
    await hideStatusCard();
  }

  async ponoviProcesZaDatum(datum = datumi(-1)) {
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
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="false">Ukupni iznos</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="false">Ukupni iznos subvencije</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="false">Ukupno za platiti</th>
                              <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="true">Fiskaliziran</th>
                              <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="true">Storniran</th>
                              <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="true">Tip računa</th>
                              <th scope="col" class="text-center align-middle" data-class-name="text-center align-middle" data-sortable="true">Status računa</th>
                              <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="true">Ispis</th> 
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
            return `${toEuro.num(Number(UkupniIznosSubvencije) + Number(UkupniIznosZaPlatiti))} € <hr class="m-0 p-0"/> ${zaokruziNaDvije(Number(UkupniIznosSubvencije) + Number(UkupniIznosZaPlatiti))} Kn`;
          },
        },
        {'data': 'UkupniIznosSubvencije', 'searchable': false, 'render': (data) => `${toEuro.num(data)} € <hr class="m-0 p-0"/> ${data} Kn`},
        {'data': 'UkupniIznosZaPlatiti', 'searchable': false, 'render': (data) => `${toEuro.num(data)} € <hr class="m-0 p-0"/> ${data} Kn`},
        {
          'data': null,
          'searchable': false,
          'render': ({RacunOdgovor: {HasJIR}}) => {
            if (HasJIR) {
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
          'data': 'RacunOffline',
          'searchable': false,
          'render': (data) => {
            return `${data ? 'offline' : 'online'}`;
          },
        },
        {
          'data': null,
          'searchable': false,
          'render': ({RacunOdbijen, NaplataPoruka}) => {
            return `${RacunOdbijen ? `<button type="button" class="btn btn-md btn-dark-f" data-toggle="popover" title="Razlog odbitka računa" data-content="${NaplataPoruka.replace('Error: ', '')}">odbijen</button>` : 'prihvaćen'}`;
          },
        },
        {
          'data': null,
          'searchable': false,
          'render': () => {
            return `<button type="button" class="btn btn-md ispisiRacuna btn-dark-f" >
                          Ispiši račun
                      </button>`;
          },
        },

      ],
      'initComplete': () => {
        const input = `
        <label class="d-none" for="datumArtikala">Odaberite datum</label>
        <div class="input-group input-group-lg d-inline-flex w-50 pr-4">
            <input type="date" id="datumArtikala" name="datumArtikala" class="form-control input-dark-f rounded-0" value="${datumi(-1)}" max="${datumi(0)}">
        </div>
        `;
        $('#popisRacunaTable_wrapper .dt-art').append(input);
        $('#popisRacunaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
        $('#datumArtikala').on('change', async (e) => {
          await this.ponoviProcesZaDatum(e.currentTarget.value);
        });
      },
      'drawCallback': () => {
        $('[data-toggle="popover"]').popover({container: 'tbody'});
      },
    } );

    $('#popisRacunaTable').on('page.dt', () => {
      $('[data-toggle="popover"]').popover('hide');
    });
  }

  async ispisiRacun() {
    $('#popisRacunaTable tbody').on('click', 'button.ispisiRacuna', async (e) => {
      const table = $('#popisRacunaTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );
      await this.racun.init(row.data(), Number(row.data().UkupniIznosZaPlatiti) < 0 ? true : false, true);
    });
  }
}
