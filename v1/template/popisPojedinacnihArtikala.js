/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import {appStatus, datumi, divStatusCard, doAjax, dtOptions, hideStatusCard, to, ugasiTImere} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';


export default class PopisPojedinacnihArtikala {
  constructor(server, windowLocation, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.mainDiv = document.getElementById('mainDivContent');
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
  }

  async init() {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    await ugasiTImere();
    await this.postaviStranicu();
    await this.initDataTable();
    await this.ponoviProcesZaDatum();
    await this.aktivirajDeaktivirajArtikl();
    await hideStatusCard();
  }

  async ponoviProcesZaDatum(datum = datumi(0)) {
    const artikli = await this.dohvatiPodatke();
    const ponuda = await this.dohvatiPonudu(datum);
    await this.spojiArtiklePonuda(artikli, ponuda);
  }

  async postaviStranicu() {
    this.mainDiv.innerHTML = `
    <div class="row py-3">
      <div class="col">
      ${divStatusCard()}
        <div class="card bg-dark z-depth-0 rounded-0 d-none content-card">
            <div class="card-body p-0 rounded-0">
              <div class="table-responsive">
                <table class="table table-dark w-100" id="popisArtikalaTable" data-order='[[ 1, "asc" ]]'>
                      <thead class="thead-dark">
                          <tr>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra grupe</th>
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Naziv</th>    
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Naziv grupe</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">PDV iznos [kn]</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Stopa poreza [%]</th>                              
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Subvencija [kn]</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Posto participacije [%]</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Cijena [kn]</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Cijena uz iskaznicu [kn]</th>                              
                              <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="false">Aktiviraj</th>  
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
    // TODO: upisati adresu za dohvat popisa artikala
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;

    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

    const {PopisPojedinacnihArtikala} = data;
    return PopisPojedinacnihArtikala;
  }

  async dohvatiPonudu(datumPonude) {
    console.log(`Datum ponude: ${datumPonude}`);
    // TODO: upisati adresu za dohvat ponude po datumu
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;

    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

    const {Pojedinacno} = data;
    return Pojedinacno;
  }

  async spojiArtiklePonuda(artikli, ponuda) {
    debugger;
    const table = $('#popisArtikalaTable').DataTable();
    const spojiArtiklePonuda = artikli;
    for (const i of spojiArtiklePonuda) {
      i.Aktivan = false;
    }

    for (const i of ponuda) {
      const foundIndex = spojiArtiklePonuda.findIndex((x) => x.SifraArtikla === i.SifraArtikla);
      spojiArtiklePonuda[foundIndex].Aktivan = true;
    }
    table.clear();
    table.rows.add(spojiArtiklePonuda).draw();
  }

  async initDataTable() {
    const {dom, language, pageLength, pagingType, responsive} = dtOptions;
    $('#popisArtikalaTable').DataTable( {
      dom,
      language,
      pageLength,
      pagingType,
      responsive,
      'columns': [
        {'data': 'SifraArtikla'},
        {'data': 'SifGrupeArtikla'},
        {'data': 'NazivArtikla'},
        {'data': 'NazivGrupeArtikla'},
        {'data': 'PDVIznos', 'searchable': false},
        {'data': 'StopaPoreza', 'searchable': false},
        {'data': 'SubvencijaArtikla', 'searchable': false},
        {'data': 'PostoParticipacije', 'searchable': false},
        {'data': 'CijenaArtikla', 'searchable': false},
        {'data': 'ZaPlatiti', 'searchable': false},
        {
          'data': null,
          'searchable': false,
          'render': (data) => `<button type="button" class="btn btn-md ${data.Aktivan ? 'btn-success' : 'btn-dark-f'}" data-aktivan="${data.Aktivan}" data-id="${data.SifraArtikla}" >
                                ${data.Aktivan ? 'Deaktiviraj' : 'Aktiviraj'}
                            </button>`,
        },
      ],
      'initComplete': () => {
        const input = `
        <label class="d-none" for="datumArtikala">Odaberite datum za koji želite aktivirati pojedinačne artikle</label>
        <div class="input-group input-group-lg d-inline-flex w-50 pr-4">
            <input type="date" id="datumArtikala" name="datumArtikala" class="form-control input-dark-f rounded-0" value="${datumi(0)}" min="${datumi(0)}" max="${datumi(31)}">
        </div>
        `;
        $('#popisArtikalaTable_wrapper .dt-art').append(input);
        $('#popisArtikalaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
        $('#datumArtikala').on('change', async (e) => {
          await this.ponoviProcesZaDatum(e.currentTarget.value);
        });
      },
    } );
  }

  async aktivirajDeaktivirajArtikl() {
    $('#popisArtikalaTable tbody').on('click', 'button', async (e) => {
      const aktivirajDeaktiviraj = e.currentTarget.dataset.aktivan;
      // TODO: upisati adresu za aktivaciju pojedinacnog artikla
      const ajaxURL = ``;
      const tokenData = Object.freeze({
        'Aktiviraj': aktivirajDeaktiviraj === 'true' ? 'false' : 'true',
        'Datum': document.getElementById('datumArtikala').value,
        'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
        'Artikli': [{'SifraArtikla': e.currentTarget.dataset.id}],
      });

      let err; let data;

      [err, data] = await to(zakljucajToken(tokenData));
      if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

      // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
      [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
      if (err) return new Error(appStatus(new ErrorView().getError(err), true));

      if (aktivirajDeaktiviraj === 'true') {
        e.currentTarget.dataset.aktivan = 'false';
        e.currentTarget.classList.add('btn-dark-f');
        e.currentTarget.classList.remove('btn-success');
        e.currentTarget.textContent = 'Aktiviraj';
        appStatus(`Artikl ${e.currentTarget.dataset.id} uspješno deaktiviran.`);
      } else {
        e.currentTarget.dataset.aktivan = 'true';
        e.currentTarget.classList.add('btn-success');
        e.currentTarget.classList.remove('btn-dark-f');
        e.currentTarget.textContent = 'Deaktiviraj';
        appStatus(`Artikl ${e.currentTarget.dataset.id} uspješno aktiviran.`);
      }
    });
  }
}
