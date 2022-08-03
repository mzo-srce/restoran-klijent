/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {appStatus, datumi, divChildCard, divStatusCard, doAjax, dtOptions, hideChildCard, hideStatusCard, to, ugasiTImere, toEuro} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';


export default class PopisMenia {
  constructor(server, windowLocation, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.mainDiv = document.getElementById('mainDivContent');
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
    this.PopisPojedinacnihArtikala = {};
  }

  async init() {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    await ugasiTImere();
    await this.postaviStranicu();
    await this.initDataTable();
    await this.ponoviProcesZaDatum();
    await this.prikupiSastavnice();
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
                <table id="popisMeniaTable" class="table table-dark w-100" data-order='[[ 1, "asc" ]]'>
                      <thead class="thead-dark">
                          <tr>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra grupe</th>
                              <th scope="col" class="align-middle w-20" data-class-name="align-middle w-20" data-sortable="true">Naziv</th>    
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Naziv grupe</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">PDV iznos</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Stopa poreza [%]</th>                              
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Subvencija</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Posto participacije [%]</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Cijena</th>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Cijena uz iskaznicu</th>  
                              <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="false">Definiraj</th>
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
    if (err) throw new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) throw new Error(appStatus('Greška kod otključavanja tokena.', true));

    return data;
  }

  async dohvatiPonudu(datumPonude) {
    // TODO: upisati adresu za dohvat ponude po datumu
    const ajaxURL = ``;
    const ajaxDATA = null;
    const method = 'GET';
    let err; let data;

    [err, data] = await to(doAjax(ajaxURL, ajaxDATA, method));
    if (err) throw new Error(appStatus(new ErrorView().getError(err), true));

    [err, data] = await to(otkljucajToken(data.jwtToken));
    if (err) throw new Error(appStatus('Greška kod otključavanja tokena.', true));

    const {Meni} = data;
    return Meni;
  }

  async spojiArtiklePonuda(artikli, ponuda) {
    const {PopisPojedinacnihArtikala, PopisMenija} = artikli;
    const table = $('#popisMeniaTable').DataTable();
    const spojiArtiklePonuda = PopisMenija;
    for (const i of spojiArtiklePonuda) {
      i.Aktivan = false;
    }

    for (const i of ponuda) {
      const foundIndex = spojiArtiklePonuda.findIndex((x) => x.SifraMenija === i.SifraMenija);
      spojiArtiklePonuda[foundIndex].Aktivan = true;
    }

    table.clear();
    table.rows.add(spojiArtiklePonuda).draw();

    this.PopisPojedinacnihArtikala = PopisPojedinacnihArtikala;
  }

  async initDataTable() {
    const {dom, language, pageLength, pagingType, responsive} = dtOptions;

    const format = (d) => {
      return `
      ${divChildCard()}
      <div class="card-group d-none child-content">
            <div class="card bg-dark rounded-0 z-depth-0">
              <div class="card-header rounded-0">
                Odaberite sastavnice koje želite dodati u meni <strong>${d.NazivMenija}</strong>
              </div>
              <div class="card-body rounded-0">
                <div class="table-responsive">
                  <table id="popisPojedinacnihTable" class="table table-dark w-100" data-order='[[ 1, "asc" ]]'>
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra</th>
                                <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra grupe</th>
                                <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Naziv</th>    
                                <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Naziv grupe</th>
                                <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="false">Dodaj na popis sastavnica</th>  
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
              </div>
            </div>             


            <div class="card bg-dark rounded-0 z-depth-0">
              <div class="card-header rounded-0">
                Odabrane sastavnice za <strong>${d.NazivMenija}</strong>
              </div>
              <div class="card-body rounded-0">
                <p>
                  <strong>Prilikom definiranja menija pridržavajte se važećeg Pravilnika i Kuharice Ministarstva znanosti i obrazovanja.</strong>
                  <br/>Definirani meni moguće je izmjeniti isključivo odabirom <strong>Izmjena sastavnica</strong>. Ukoliko ste krivo definirali meni za datum u budućnosti, isti možete deaktivirati pa ponovo definirati.
                  <br/><br/>Ako meni sadrži više jednakih sastavnica, kliknite na tipku "Dodaj" pored odabrane sastavnice više puta i količina u meniju će se uvećati za +1.
                </p>
                <div id="sastavniceWrapper">

                </div>
                <button type="button" class="btn btn-md btn-dark-f text-center" id="aktivirajMeni" data-id="${d.SifraMenija}" >
                  Aktiviraj
                </button>
              </div>
            </div>
        </div>
      `;
    };

    $('#popisMeniaTable').DataTable( {
      dom,
      language,
      pageLength,
      pagingType,
      responsive,
      'columns': [
        {'data': 'SifraMenija'},
        {'data': 'SifraGrupeMenija'},
        {'data': 'NazivMenija'},
        {'data': 'NazivGrupeMenija'},
        {'data': 'PDVIznos', 'searchable': false, 'render': (data) => `${toEuro.num(data)} € <hr class="m-0 p-0"/> ${data} Kn`},
        {'data': 'StopaPoreza', 'searchable': false},
        {'data': 'SubvencijaMenija', 'searchable': false, 'render': (data) => `${toEuro.num(data)} € <hr class="m-0 p-0"/> ${data} Kn`},
        {'data': 'PostoParticipacije', 'searchable': false},
        {'data': 'CijenaMenija', 'searchable': false, 'render': (data) => `${toEuro.num(data)} € <hr class="m-0 p-0"/> ${data} Kn`},
        {'data': 'ZaPlatiti', 'searchable': false, 'render': (data) => `${toEuro.num(data)} € <hr class="m-0 p-0"/> ${data} Kn`},
        {
          'className': 'details-control text-center align-middle',
          'data': null,
          'searchable': false,
          'render': ({Aktivan, SifraMenija}) => `<button type="button" class="btn btn-md definirajDeaktiviraj ${Aktivan ? 'btn-success' : 'btn-dark-f'}" data-aktivan="${Aktivan}" data-id="${SifraMenija}" >
                                ${Aktivan ? 'Deaktiviraj' : 'Definiraj'}
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
        $('#popisMeniaTable_wrapper .dt-art').append(input);
        $('#popisMeniaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
        $('#datumArtikala').on('change', async (e) => {
          await this.ponoviProcesZaDatum(e.currentTarget.value);
        });
      },
    } );

    $('#popisMeniaTable tbody').on('click', 'button.definirajDeaktiviraj', async (e) => {
      const table = $('#popisMeniaTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );
      const Aktivan = e.currentTarget.dataset.aktivan;
      const SifraMenija = row.data().SifraMenija;

      if (Aktivan === 'true') {
        await this.aktivirajDeaktivirajArtikl({'SifraMenija': SifraMenija});
      } else {
        if ( row.child.isShown() ) {
          row.child.hide();
          tr.removeClass('shown');
        } else {
          if ( table.row( '.shown' ).length ) {
            $('button.definirajDeaktiviraj', table.row( '.shown' ).node()).trigger('click');
          }
          row.child( format(row.data())).show();
          $('#popisPojedinacnihTable').DataTable( {
            language,
            pagingType,
            responsive,
            dom,
            'data': this.PopisPojedinacnihArtikala,
            'pageLength': 10,
            'columns': [
              {'data': 'SifraArtikla'},
              {'data': 'SifGrupeArtikla'},
              {'data': 'NazivArtikla'},
              {'data': 'NazivGrupeArtikla'},
              {
                'data': 'SifraArtikla',
                'searchable': false,
                'render': (data) => `<button type="button" class="btn btn-md btn-dark-f dodajSastavnicuButton" data-id="${data}" >
                                      Dodaj <span class="material-icons md-18">forward</span>
                                  </button>`,
              },
            ],
            'initComplete': () => {
              $('#popisPojedinacnihTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
              $('#popisPojedinacnihTable_filter input').attr('autofocus', true);
            },
          } );
          tr.addClass('shown');
          await hideChildCard();
        }
      }
    } );

    $('#popisMeniaTable tbody').on('click', '#popisPojedinacnihTable tbody button.dodajSastavnicuButton', (e) => {
      const table = $('#popisPojedinacnihTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );
      if (document.querySelector(`#sastavniceWrapper #sastavnica_${row.data().SifraArtikla}`)) {
        const broj = document.querySelector(`#sastavniceWrapper #sastavnica_${row.data().SifraArtikla}`).closest('.alert').querySelector('.kolicinaSastavnica');
        broj.textContent = parseInt(broj.textContent, 10) + 1;
      } else {
        document.querySelector('#sastavniceWrapper').innerHTML += `
          <div class="alert alert-default alert-dismissible fade show" role="alert">
            <strong id="sastavnica_${row.data().SifraArtikla}">${row.data().SifraArtikla}</strong> - ${row.data().NazivArtikla}, količina u meniju = <span class="kolicinaSastavnica">1</span>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        `;
      }
      document.querySelector('#popisPojedinacnihTable_filter input').focus();
    });
  }

  async prikupiSastavnice() {
    $('#popisMeniaTable tbody').on('click', 'button#aktivirajMeni', async (e) => {
      const alertovi = Array.from(document.querySelectorAll('#sastavniceWrapper .alert'));
      const sastavnice = [];
      alertovi.forEach((element) => {
        sastavnice.push({
          'SifraArtikla': parseInt(element.querySelector('strong').textContent, 10),
          'Kolicina': parseInt(element.querySelector('.kolicinaSastavnica').textContent, 10),
        });
      });

      console.log(sastavnice);
      await this.aktivirajDeaktivirajArtikl({'SifraMenija': e.currentTarget.dataset.id, 'sastavnice': sastavnice, 'Aktiviraj': 'true'});
    });
  }

  async aktivirajDeaktivirajArtikl({SifraMenija, sastavnice = [], Aktiviraj = 'false'}) {
    const table = $('#popisMeniaTable').DataTable();
    const button = document.querySelector(`button.definirajDeaktiviraj[data-id="${SifraMenija}"]`);
    const tr = $(button).closest('tr');
    const row = table.row( tr );
    // TODO: upisati adresu za dodavanje sastavnica menija
    const ajaxURL = ``;
    const tokenData = Object.freeze({
      'Aktiviraj': Aktiviraj,
      'Datum': document.getElementById('datumArtikala').value,
      'SifraMenija': SifraMenija,
      'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
      'Artikli': sastavnice,
    });

    let err; let data;

    [err, data] = await to(zakljucajToken(tokenData));
    if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

    // TODO: upisati dodatnu putanju do akcije (ako je potrebno)
    [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    if (Aktiviraj === 'true') {
      button.dataset.aktivan = 'true';
      button.classList.add('btn-success');
      button.classList.remove('btn-dark-f');
      button.textContent = 'Deaktiviraj';
      row.child.hide();
      tr.removeClass('shown');
      appStatus(`Artikl ${SifraMenija} uspješno aktiviran.`);
    } else {
      button.dataset.aktivan = 'false';
      button.classList.add('btn-dark-f');
      button.classList.remove('btn-success');
      button.textContent = 'Definiraj';
      appStatus(`Artikl ${SifraMenija} uspješno deaktiviran.`);
    }
  }
}
