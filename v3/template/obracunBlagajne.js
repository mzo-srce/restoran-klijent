/* eslint-disable max-len */

import {appStatus, datumi, divStatusCard, doAjax, dtOptions, hideStatusCard, to, ugasiTImere, toEuro, toHrk} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';

/* eslint-disable require-jsdoc */
export default class ObracunBlagajne {
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
    await this.constructor.events();
    await this.initDataTable();
    await this.ponoviProcesZaDatum();
    await hideStatusCard();
  }

  async ponoviProcesZaDatum(datumVrijemeOd = `${datumi(-1)}T00:00`, datumVrijemeDo = `${datumi(0)}T00:00`) {
    await this.dohvatiPodatke(datumVrijemeOd, datumVrijemeDo);
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
                              <th scope="col" class="align-middle w-25" data-class-name="align-middle w-25" data-sortable="true">Naziv</th>    
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Količina pojedinačno</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Količina u meniju</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Količina ukupno</th>                              
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Iznos pojedinačnih ukupno [€]</th>
                          </tr>
                      </thead>
                      <tbody></tbody>
                      <tfoot>
                        <tr>
                          <td class="align-middle text-right"></td>
                          <td class="align-middle text-right"></td>
                          <td class="align-middle text-right"></td>
                          <td class="align-middle text-right"></td>
                          <td class="align-middle text-right"></td>
                          <td class="align-middle text-right"></td>
                        </tr>
                      </tfoot>
                  </table>
              </div> 
              <div id="print-receipt">
                <div id="datumVrijemeIspisaInfo" class="pb-2 d-none"></div>
                <div class="table-responsive pt-3">
                  <table class="table table-dark w-100" id="dodatneInfoTable">
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col" class="align-middle text-left" data-class-name="align-middle">Dodatne informacije <button type="button" class="btn btn-md btn-dark-f rounded-0 d-print-none" id="print-dodatne-info"><span class="material-icons md-18 ">print</span> Ispiši dodatne informacije</button> </th>
                            </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Nema dodatnih informacija</td>
                          </tr>
                        </tbody>
                    </table>
                </div>  
              </div>             
            </div>
        </div>
      </div>
    </div>
    `;
  }

  static async events() {
    $('#print-dodatne-info').on('click', async () => {
      document.getElementById('datumVrijemeIspisaInfo').innerText = `Datum/vrijeme: od ${new Date(document.getElementById('datumVrijemeOd').value).toLocaleString('de-AT')} do ${new Date(document.getElementById('datumVrijemeDo').value).toLocaleString('de-AT')}`;
      printJS({
        'printable': 'print-receipt',
        'style': 'body{color:#000!important}#print-receipt{color:#000!important,font-size:10px,font-family:"Times New Roman"}.d-print-none{display:none!important}.d-print-block{display:block!important}.align-middle{vertical-align:middle!important}.text-right{text-align:right!important}.text-left{text-align:left!important}.text-center{text-align:center!important}table th{font-weight:700!important}table.table td,table.table th{padding-top:.2rem!important;padding-bottom:.2rem!important}.table td,.table>thead td,.table>thead th{padding:.2rem!important;vertical-align:bottom!important;border-top:1px solid #000!important}.table>thead td,.table>thead th{padding:.2rem!important;vertical-align:bottom!important;border-bottom:1px solid #000!important}.p-0{padding:0!important}.pb-2,.py-2{padding-bottom:.5rem!important}.pt-2,.py-2{padding-top:.5rem!important}.m-0{margin:0!important}.table-responsive{display:block!important;width:100%!important}.w-100,table{width:100%!important}.border-top{border-top:1px dashed #000}.border-bottom{border-bottom:1px dashed #000}.small,small{font-size:80%;font-weight:400}.h5,h5{font-size:1.25rem}.srceLogoFooter{height: 20px}',
        'type': 'html',
        'scanStyles': false,
      });
    });
  }

  async dohvatiPodatke(datumVrijemeOd, datumVrijemeDo) {
    const table = $('#popisArtikalaTable').DataTable();
    const dodatneInfo = document.querySelector('#dodatneInfoTable > tbody');
    // TODO: upisati adresu
    const ajaxURL = ``;
    const tokenData = Object.freeze({
      'DatumVrijemeOd': datumVrijemeOd,
      'DatumVrijemeDo': datumVrijemeDo,
      'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
    });
    let err; let data;
    debugger;
    [err, data] = await to(zakljucajToken(tokenData));
    if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

    // TODO: upisati adresu
    [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) return new Error(appStatus('Greška kod otključavanja tokena.', true));

    console.log(data);

    const {
      Artikli,
      UstanovaNaziv,
      RestoranNaziv,
      BlagajnaNaziv,
      BrojOdbijenihRacuna,
      RacuniUkupno,
      SubvencijaUkupno,
      PorezUkupno,
      BrojRacuna,
      BrojStorniranihRacuna,
      BrojStavki,
      VrijemePrvogRacuna,
      VrijemeZadnjegRacuna,
      BrojNesubvencioniranihRacuna,
      BrojRacunaSRucnoUnesenimParametrima,
      StanjeBlagajne,
    } = data;
    dodatneInfo.innerHTML = `
    <tr>
      <td class="align-middle">Ustanova: ${UstanovaNaziv}, restoran: ${RestoranNaziv}, blagajna: ${BlagajnaNaziv}</td>
    </tr>
    <tr>
      <td class="align-middle">Ukupni iznos računa (sa PDV-om i bez subvencije): ${RacuniUkupno} €</td>
    </tr>
    <tr>
      <td class="align-middle">Ukupni iznos subvencije: ${SubvencijaUkupno} €</td>
    </tr>
    <tr>
      <td class="align-middle">Ukupni iznos poreza: ${PorezUkupno} €</td>
    </tr>
    <tr>
      <td class="align-middle">Ukupni broj računa (nalaze i odbijeni računi): ${BrojRacuna + BrojStorniranihRacuna}, od toga broj izdanih: ${BrojRacuna} i broj storniranih: ${BrojStorniranihRacuna}</td>
    </tr>
    <tr>
      <td class="align-middle">Ukupni broj stavki na izdanim računima: ${BrojStavki}</td>
    </tr>
    <tr>
      <td class="align-middle">Datum i vrijeme prvog računa iz odabranog perioda: ${VrijemePrvogRacuna}</td>
    </tr>
    <tr>
      <td class="align-middle">Datum i vrijeme zadnjeg računa iz odabranog perioda: ${VrijemeZadnjegRacuna}</td>
    </tr>
    <tr>
      <td class="align-middle">Broj računa bez subvencije: ${BrojNesubvencioniranihRacuna}</td>
    </tr>
    <tr>
      <td class="align-middle">Broj odbijenih računa (računi koji nisu prihvaćeni, a izdani za vrijeme offline-a): ${BrojOdbijenihRacuna}</td>
    </tr>
    <tr>
      <td class="align-middle">Broj računa sa ručno unesenim brojem iskaznice: ${BrojRacunaSRucnoUnesenimParametrima}</td>
    </tr>
    <tr>
      <td class="align-middle">Stanje blagajne (iznos gotovine): ${StanjeBlagajne} €</td>
    </tr>
    `;

    table.clear();
    table.rows.add(Artikli).draw();
  }

  async initDataTable() {
    const {domExport, language, pageLength, pagingType, responsive} = dtOptions;
    $('#popisArtikalaTable').DataTable( {
      'dom': domExport,
      language,
      pageLength,
      pagingType,
      responsive,
      'buttons': {
        'dom': {
          button: {
            tag: 'button',
            className: '',
          },
        },
        'buttons': [
          {
            extend: 'excel',
            filename: 'ObracunZaRazdoblje',
            text: '<span class="material-icons md-18 ">file_present</span> Izvoz tablice u excel (.xslx)',
            title: 'Obračun za razdoblje',
            messageTop: `
            Datum kreiranja datoteke: ${(new Date()).toLocaleDateString('de-AT')}.
            `,
            header: true,
            footer: true,
            exportOptions: {
              columns: [0, 1, 2, 3, 4, 5],
            },
            className: 'btn btn-lg buttons-excel buttons-html5 btn-dark-f z-depth-0 rounded-0',
            customize: (xlsx) => {
              const sheet = xlsx.xl.worksheets['sheet1.xml'];
              $('row:last', sheet).html($('row:last', sheet).html().replace(/ *\([^)]*\) */g, ''));
            },
          },
          {
            extend: 'print',
            text: '<span class="material-icons md-18 ">print</span> Ispis obračuna',
            title: 'Obračun blagajne',
            messageTop: `
            Datum ispisa obračuna: ${(new Date()).toLocaleDateString('de-AT')}.
            `,
            header: true,
            footer: true,
            exportOptions: {
              columns: [0, 1, 2, 3, 4, 5],
              stripHtml: false,
            },
            className: 'btn btn-lg buttons-print btn-dark-f z-depth-0 rounded-0',
            customize: (win) => {
              const body = $(win.document.body).css({'background-color': '#fff', 'color': '#000'});
              body.find('table th').each((i, e) => {
                e.textContent = e.textContent.replace('Količina', 'Kol.');
              });
              body.find('table').addClass('display').css({'font-size': '10px', 'width': '100%', 'vertical-align': 'middle'});
              body.find('table th:nth-child(1), table td:nth-child(1)').addClass('text-right').css({'text-align': 'right'});
              body.find('table th:nth-child(2), table td:nth-child(2)').addClass('text-left').css({'text-align': 'left'});
              body.find('table th:nth-child(3), table td:nth-child(3)').addClass('text-right').css({'text-align': 'right'});
              body.find('table th:nth-child(4), table td:nth-child(4)').addClass('text-right').css({'text-align': 'right'});
              body.find('table th:nth-child(5), table td:nth-child(5)').addClass('text-right').css({'text-align': 'right'});
              body.find('table th:nth-child(6), table td:nth-child(6)').addClass('text-right').css({'text-align': 'right'});
              body.find('tr:nth-child(odd) td').each((index, element) => {
                $(element).css('background-color', '#D0D0D0');
              });
              body.find('h1').css({'text-align': 'center', 'font-size': '1rem'});
              body.find('table tr:last').html(body.find('table tr:last').html().replace(/ *\([^)]*\) */g, ''));
            },
          },
        ],
      },
      'columns': [
        {'data': 'SifraArtikla'},
        {'data': 'NazivArtikla'},
        {'data': 'KolicinaPojedinacno', 'searchable': false},
        {'data': 'KolicinaMenu', 'searchable': false},
        {'data': 'KolicinaUkupno', 'searchable': false},
        {'data': 'IznosPojedinacnihUkupno', 'searchable': false},
      ],
      'footerCallback': function( row, data, start, end, display ) {
        const api = this.api();

        const intVal = ( i ) => {
          return typeof i === 'string' ?
              i.replace(/[^0-9\.]+/g, '')*1 :
              typeof i === 'number' ?
                  i : 0;
        };

        const kolPo1 = api
            .column(2)
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );
        const kolMe1 = api
            .column(3)
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );
        const kolUk1 = api
            .column(4)
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );
        const iznosPo1 = api
            .column(5)
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );

        const kolPo2 = api
            .column(2, {page: 'current'})
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );
        const kolMe2 = api
            .column(3, {page: 'current'})
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );
        const kolUk2 = api
            .column(4, {page: 'current'})
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );
        const iznosPo2 = api
            .column(5, {page: 'current'})
            .data()
            .reduce((a, b) => {
              return intVal(a) + intVal(b);
            }, 0 );

        $( api.column(2).footer() ).html(`${kolPo1} (${kolPo2})`);
        $( api.column(3).footer() ).html(`${kolMe1} (${kolMe2})`);
        $( api.column(4).footer() ).html(`${kolUk1} (${kolUk2})`);
        $( api.column(5).footer() ).html(`${iznosPo1.toFixed(2)} (${iznosPo2.toFixed(2)})`);
        document.querySelector('#popisArtikalaTable > tfoot td:nth-of-type(3)').innerHTML = `${kolPo1} (${kolPo2})`;
        document.querySelector('#popisArtikalaTable > tfoot td:nth-of-type(4)').innerHTML = `${kolMe1} (${kolMe2})`;
        document.querySelector('#popisArtikalaTable > tfoot td:nth-of-type(5)').innerHTML = `${kolUk1} (${kolUk2})`;
        document.querySelector('#popisArtikalaTable > tfoot td:nth-of-type(6)').innerHTML = `${iznosPo1.toFixed(2)} (${iznosPo2.toFixed(2)})`;
      },
      'initComplete': () => {
        const input = `
        <label class="d-none" for="datumVrijemeOd">Početni i završni datum obračuna</label>
        <div class="input-group input-group-lg d-inline-flex w-50 pr-4">
            <input type="datetime-local" id="datumVrijemeOd" name="datumVrijemeOd" class="form-control input-dark-f rounded-0" value="${datumi(-1)}T00:00" min="${datumi(-31)}T00:00" max="${datumi(0)}T23:59">
            <input type="datetime-local" id="datumVrijemeDo" name="datumVrijemeDo" class="form-control input-dark-f rounded-0" value="${datumi(0)}T00:00" min="${datumi(-31)}T00:00" max="${datumi(0)}T23:59">
        </div>
        `;
        $('#popisArtikalaTable_wrapper .dt-buttons.btn-group.flex-wrap').parent().prepend(input);
        $('#popisArtikalaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
        $('input[type="datetime-local"]').on('change', async (e) => {
          await this.ponoviProcesZaDatum(document.getElementById('datumVrijemeOd').value, document.getElementById('datumVrijemeDo').value);
        });
      },
    } );
  }
}
