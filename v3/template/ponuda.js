/* eslint-disable max-len */

import {appStatus, datumi, divChildCard, divStatusCard, doAjax, dtOptions, hideChildCard, hideStatusCard, to, ugasiTImere, toEuro, toHrk} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken} from './jwt';

/* eslint-disable require-jsdoc */
export default class Ponuda {
  constructor(server, kontrolniBrojDjelatnika) {
    this.server = server;
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
                <table class="table table-dark w-100" id="popisArtikalaTable" data-order='[[ 2, "asc" ]]'>
                      <thead class="thead-dark">
                          <tr>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra</th>
                              <th scope="col" class="align-middle w-25" data-class-name="align-middle w-25" data-sortable="true">Naziv</th>    
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Tip</th>  
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">PDV iznos</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Stopa poreza [%]</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Subvencija</th>  
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Posto participacije [%]</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Cijena</th>                           
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Cijena uz iskaznicu</th>                              
                              <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="false">Sastavnice</th>  
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
    // TODO: upisati adresu
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;
    debugger;
    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err) throw new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) throw new Error(appStatus('Greška kod otključavanja tokena.', true));

    return data;
  }

  async dohvatiPonudu(datumPonude) {
    console.log(`Datum ponude: ${datumPonude}`);
    // TODO: upisati adresu
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;
    debugger;
    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err) throw new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) throw new Error(appStatus('Greška kod otključavanja tokena.', true));

    return data;
  }

  async spojiArtiklePonuda(artikli, ponuda) {
    debugger;
    const table = $('#popisArtikalaTable').DataTable();
    const {PopisPojedinacnihArtikala, PopisMenija} = artikli;
    const {Meni, Pojedinacno} = ponuda;
    const spojiArtiklePonuda = Pojedinacno;
    const spojiMeniPonuda = Meni;

    for (const i of spojiMeniPonuda) {
      const foundIndex = PopisMenija.findIndex((x) => x.SifraMenija === i.SifraMenija);
      i.Cijena = PopisMenija[foundIndex].CijenaMenija;
      i.Subvencija = PopisMenija[foundIndex].SubvencijaMenija;
      i.ZaPlatiti = PopisMenija[foundIndex].ZaPlatiti;
      i.PDVIznos = PopisMenija[foundIndex].PDVIznos;
      i.StopaPoreza = PopisMenija[foundIndex].StopaPoreza;
      i.PostoParticipacije = PopisMenija[foundIndex].PostoParticipacije;
      i.Naziv = i.NazivMenija;
      i.Sifra = i.SifraMenija;
      i.Tip = 'Meni';
    }

    for (const i of spojiArtiklePonuda) {
      const foundIndex = PopisPojedinacnihArtikala.findIndex((x) => x.SifraArtikla === i.SifraArtikla);
      i.Cijena = PopisPojedinacnihArtikala[foundIndex].CijenaArtikla;
      i.Subvencija = PopisPojedinacnihArtikala[foundIndex].SubvencijaArtikla;
      i.ZaPlatiti = PopisPojedinacnihArtikala[foundIndex].ZaPlatiti;
      i.PDVIznos = PopisPojedinacnihArtikala[foundIndex].PDVIznos;
      i.StopaPoreza = PopisPojedinacnihArtikala[foundIndex].StopaPoreza;
      i.PostoParticipacije = PopisPojedinacnihArtikala[foundIndex].PostoParticipacije;
      i.Naziv = i.NazivArtikla;
      i.Sifra = i.SifraArtikla;
      i.Tip = 'Pojedinačno';
    }

    table.clear();
    table.rows.add([...spojiArtiklePonuda, ...spojiMeniPonuda]).draw();
  }

  async initDataTable() {
    const {dom, domExport, language, pageLength, pagingType, responsive} = dtOptions;

    const format = (d) => {
      return `
        ${divChildCard()}
        <div class="card bg-dark rounded-0 z-depth-0 d-none child-content">
          <div class="card-header rounded-0">
            Sastavnice menija <strong>${d.Naziv}</strong>
          </div>
          <div class="card-body rounded-0">
            <div class="table-responsive">
              <table id="popisPojedinacnihTable" class="table table-dark w-100" data-order='[[ 1, "asc" ]]'>
                    <thead class="thead-dark">
                        <tr>
                            <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra</th>
                            <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Naziv</th>    
                            <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Količina</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
          </div>
        </div>             
      `;
    };

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
            filename: 'CjenikArtikala',
            text: '<span class="material-icons md-18 ">file_present</span> Izvoz tablice u excel (.xslx)',
            title: 'Cjenik artikala studentske prehrane',
            messageTop: `Datum kreiranja datoteke: ${(new Date()).toLocaleDateString('de-AT')}.`,
            header: true,
            exportOptions: {
              columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            },
            className: 'btn btn-lg buttons-excel buttons-html5 btn-dark-f z-depth-0 rounded-0',
          },
          {
            extend: 'print',
            text: '<span class="material-icons md-18 ">print</span> Ispis cjenika',
            title: 'Cjenik artikala studentske prehrane',
            messageTop: `Datum ispisa cjenika: ${(new Date()).toLocaleDateString('de-AT')}.`,
            header: true,
            exportOptions: {
              columns: [0, 1, 6, 7, 8],
            },
            className: 'btn btn-lg buttons-print btn-dark-f z-depth-0 rounded-0',
            customize: function(win) {
              const body = $(win.document.body);
              body.find('table').addClass('display').css({'font-size': '1rem', 'width': '100%', 'vertical-align': 'middle'});
              body.find('table th:nth-child(1), table td:nth-child(1)').addClass('text-right').css({'text-align': 'right'});
              body.find('table th:nth-child(2), table td:nth-child(2)').addClass('text-left').css({'text-align': 'left'});
              body.find('table th:nth-child(3), table td:nth-child(3)').addClass('text-right').css({'text-align': 'right'});
              body.find('table th:nth-child(4), table td:nth-child(4)').addClass('text-right').css({'text-align': 'right'});
              body.find('table th:nth-child(5), table td:nth-child(5)').addClass('text-right').css({'text-align': 'right'});
              body.find('tr:nth-child(odd) td').each((index, element) => {
                $(element).css('background-color', '#D0D0D0');
              });
              body.find('h1').css('text-align', 'center');
            },
          },
        ],
      },
      'rowGroup': {
        dataSrc: 'Tip',
      },
      'columns': [
        {'data': 'Sifra'},
        {'data': 'Naziv'},
        {'data': 'Tip', 'searchable': false},
        {'data': 'PDVIznos', 'searchable': false, 'render': (data) => `${data} €`},
        {'data': 'StopaPoreza', 'searchable': false},
        {'data': 'Subvencija', 'searchable': false, 'render': (data) => `${data} €`},
        {'data': 'PostoParticipacije', 'searchable': false},
        {'data': 'Cijena', 'searchable': false, 'render': (data) => `${data} €`},
        {'data': 'ZaPlatiti', 'searchable': false, 'render': (data) => `${data} €`},
        {
          'className': 'details-control text-center align-middle',
          'data': null,
          'searchable': false,
          'render': (data) => {
            if (data.Tip === 'Meni') {
              return `<button type="button" class="btn btn-md btn-dark-f rounded-0 sastavniceButton" data-id="${data.Sifra}" >
                          Sastavnice
                      </button>`;
            }
            return `<button type="button" class="btn btn-md btn-dark-f rounded-0 invisible" data-id="${data.Sifra}" >
                        -
                    </button>`;
          },
        },
      ],
      'initComplete': () => {
        const input = `
        <label class="d-none" for="datumArtikala">Odaberite datum za koji želite aktivirati pojedinačne artikle</label>
        <div class="input-group input-group-lg d-inline-flex w-50 pr-4">
            <input type="date" id="datumArtikala" name="datumArtikala" class="form-control input-dark-f rounded-0" value="${datumi(0)}" min="${datumi(-31)}" max="${datumi(31)}">
        </div>
        `;
        $('#popisArtikalaTable_wrapper .dt-buttons.btn-group.flex-wrap').parent().prepend(input);
        $('#popisArtikalaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
        $('#datumArtikala').on('change', async (e) => {
          await this.ponoviProcesZaDatum(e.currentTarget.value);
        });
      },
    } );

    $('#popisArtikalaTable tbody').on('click', 'button.sastavniceButton', async (e) => {
      debugger;
      const table = $('#popisArtikalaTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );

      if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        if ( table.row( '.shown' ).length ) {
          $('button.sastavniceButton', table.row( '.shown' ).node()).trigger('click');
        }
        row.child( format(row.data())).show();
        $('#popisPojedinacnihTable').DataTable( {
          language,
          pagingType,
          responsive,
          dom,
          'lengthChange': false,
          'paging': false,
          'searching': false,
          'data': row.data().Sastavnice,
          'pageLength': 10,
          'columns': [
            {'data': 'SifraArtikla'},
            {'data': 'NazivArtikla'},
            {'data': 'Kolicina', 'searchable': false},
          ],
          'initComplete': () => {
            $('#popisPojedinacnihTable_filter input').removeClass('form-control-sm').addClass('form-control-lg');
          },
        } );
        tr.addClass('shown');
        await hideChildCard();
      }
    } );
  }
}
