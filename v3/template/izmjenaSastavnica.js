/* eslint-disable max-len */

import {appStatus, datumi, divChildCard, divStatusCard, doAjax, dtOptions, hideChildCard, hideStatusCard, to, toBase64, ugasiTImere} from '../../Shared/js/asyncAjax';
import ErrorView from '../../Shared/js/errorView';
import {otkljucajToken, zakljucajToken} from './jwt';

/* eslint-disable require-jsdoc */
export default class IzmjenaSastavnica {
  constructor(server, windowLocation, admin, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.admin = admin;
    this.mainDiv = document.getElementById('mainDivContent');
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
    this.PopisPojedinacnihArtikala = {};
  }

  async init() {
    if (!window.navigator.onLine) return new Error(appStatus('Provjerite Internet konekciju!', true));
    await ugasiTImere();
    await this.postaviStranicu();
    if (this.admin) {
      await this.initDataTable();
      await this.ponoviProcesZaDatum();
      await this.prikupiSastavnice();
      await hideStatusCard();
    }
  }

  async ponoviProcesZaDatum(datum = datumi(-1)) {
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
                <table class="table table-dark w-100" id="popisArtikalaTable" data-order='[[ 0, "asc" ]]'>
                      <thead class="thead-dark">
                          <tr>
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-middle" data-sortable="true">Šifra</th>
                              <th scope="col" class="align-middle" data-class-name="align-middle" data-sortable="true">Naziv</th>    
                              <th scope="col" class="align-middle w-50" data-class-name="align-middle w-50" data-sortable="false">Sastavnice</th>                               
                              <th scope="col" class="text-center w-50px align-middle" data-class-name="text-center w-50px clickable align-middle" data-sortable="false">Izmjena sastavnica</th>  
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
    const {Meni} = ponuda;
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


    console.log(spojiMeniPonuda);

    table.clear();
    table.rows.add(spojiMeniPonuda).draw();

    this.PopisPojedinacnihArtikala = PopisPojedinacnihArtikala;
  }

  async initDataTable() {
    const {dom, language, pageLength, pagingType, responsive} = dtOptions;
    const {
      BlagajnaNaziv,
      Djelatnik,
      ObveznikPDV,
      RestoranAdresa,
      RestoranNaziv,
      UstanovaAdresa,
      UstanovaNaziv,
      UstanovaOIB,
    } = JSON.parse(localStorage.blagajnaInfo);

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
                  <strong>Ukoliko je pogrešno definirana sastavnica menija, bilo da je pogrešno unesena količina pojedinog artikla ili da je pogrešno unesena šifra artikla unutar sastavnice.</strong>
                  <br/><br/>Potrebno je dostaviti novo definirani meni i izjavu. Sve sastavnice menija i količine pojedinačnih artikala potrebno je ponovo definirati. Izjava je PDF datoteka koja sadrži ispravno definirani meni i opis nastale greške potpisan od strane šefa kuhinje te blagajnika.
                  Izmjena će biti odobrena (odbijena) tek kada Ministarstvo znanosti i obrazovanja ručno provjeri dostavljeni dokument.
                  <br/><br/>Izmjena je dozvoljena samo za 31 dan u prošlost. Ukoliko ste krivo definirali meni za datum u budućnosti, isti možete deaktivirati pa ponovo definirati.
                  <br/><br/>Ako meni sadrži više jednakih sastavnica, kliknite na tipku "Dodaj" pored odabrane sastavnice više puta i količina u meniju će se uvećati za +1.
                </p>
                <div id="print-izmjena-sastavnica">
                  <div class="d-none d-print-block">
                    <p class="p-0 m-0">${UstanovaNaziv}<br/>${UstanovaAdresa}<br/>OIB: ${UstanovaOIB}</p>
                    <h4 class="text-center pt-2 m-0">${RestoranNaziv}</h4>
                    <p class="text-center pb-2 m-0">${RestoranAdresa}<br/>${BlagajnaNaziv}</p>
                  </div>
                  <p class="h4 text-center d-none d-print-block font-weight-bold">ZAHTJEV ZA IZMJENOM SASTAVNICA</p>
                  <p>Ispravno definiran meni: <span class="d-none d-print-block">(${d.SifraMenija} - ${d.NazivMenija})</span></p>
                  <div id="sastavniceWrapper">
                    

                  </div>                  
                    <p class="py-2 m-0">Opis nastale pogreške:</p>
                    <textarea class="pb-2 form-control form-control-lg input-dark-f rounded-0 w-100" rows="5"></textarea>
                  <div class="d-none d-print-block">
                    <p>Datum pogreške: ${(new Date(document.getElementById('datumArtikala').value)).toLocaleDateString('de-AT')}.</p>
                    <p>Blagajnik (${Djelatnik}):</p>
                    <p>${'_'.repeat(40)}</p>
                    <p>Šef kuhinje:</p>
                    <p>${'_'.repeat(40)}</p>
                  </div>
                </div>
                <div class="custom-file">
                  <input type="file" class="custom-file-input" id="customFile" accept="application/pdf">
                  <label class="custom-file-label form-control-lg input-dark-f" for="customFile">PDF izjava</label>
                </div>
                <br/><br/>
                <button type="button" class="btn btn-md btn-dark-f text-center" id="zahtjevZaIzmjenom" data-id="${d.SifraMenija}" >
                  Pošalji zahtjev za izmjenom
                </button>
                <button type="button" class="btn btn-md btn-dark-f text-center" id="zahtjevZaIzmjenomPrint" >
                  <span class="material-icons md-18 ">print</span> Ispiši izjavu za potpis
                </button>
              </div>
            </div>
        </div>
      `;
    };

    $('#popisArtikalaTable').DataTable( {
      dom,
      language,
      pageLength,
      pagingType,
      responsive,
      'columns': [
        {'data': 'Sifra'},
        {'data': 'Naziv'},
        {
          'className': 'align-middle',
          'data': 'Sastavnice',
          'searchable': false,
          'render': (data) => {
            let sastavnice = '';
            data.forEach((el) => {
              sastavnice += `${el.NazivArtikla.toLocaleLowerCase()} (${el.Kolicina} kom.), `;
            });

            return sastavnice.replace(/,\s*$/, '');
          },
        },
        {
          'className': 'details-control text-center align-middle',
          'data': null,
          'searchable': false,
          'render': (data) => {
            return `<button type="button" class="btn btn-md btn-dark-f rounded-0 sastavniceButton" data-id="${data.Sifra}" >
                          Definiraj
                      </button>`;
          },
        },
      ],
      'initComplete': () => {
        const input = `
        <label class="d-none" for="datumArtikala">Odaberite datum za koji želite aktivirati pojedinačne artikle</label>
        <div class="input-group input-group-lg d-inline-flex w-50 pr-4">
            <input type="date" id="datumArtikala" name="datumArtikala" class="form-control input-dark-f rounded-0" value="${datumi(-1)}" min="${datumi(-31)}" max="${datumi(-1)}">
        </div>
        `;
        $('#popisArtikalaTable_wrapper .dt-art').append(input);
        $('#popisArtikalaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
        $('#datumArtikala').on('change', async (e) => {
          await this.ponoviProcesZaDatum(e.currentTarget.value);
        });
      },
    } );

    $('#popisArtikalaTable tbody').on('click', 'td.details-control', async (e) => {
      debugger;
      const table = $('#popisArtikalaTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );
      if ( row.child.isShown() ) {
        row.child.hide();
        tr.removeClass('shown');
      } else {
        if ( table.row( '.shown' ).length ) {
          $('.details-control', table.row( '.shown' ).node()).trigger('click');
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
    } );

    $('#popisArtikalaTable tbody').on('click', '#popisPojedinacnihTable tbody button.dodajSastavnicuButton', (e) => {
      const table = $('#popisPojedinacnihTable').DataTable();
      const tr = $(e.currentTarget).closest('tr');
      const row = table.row( tr );
      if (document.querySelector(`#sastavniceWrapper #sastavnica_${row.data().SifraArtikla}`)) {
        const broj = document.querySelector(`#sastavniceWrapper #sastavnica_${row.data().SifraArtikla}`).closest('.alert').querySelector('.kolicinaSastavnica');
        broj.textContent = parseInt(broj.textContent, 10) + 1;
      } else {
        document.querySelector('#sastavniceWrapper').innerHTML += `
          <div class="alert alert-default alert-dismissible fade show" role="alert">
            <strong id="sastavnica_${row.data().SifraArtikla}">${row.data().SifraArtikla}</strong> - ${row.data().NazivArtikla}, količina = <span class="kolicinaSastavnica">1</span>
            <button type="button" class="close d-print-none" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        `;
      }
      document.querySelector('#popisPojedinacnihTable_filter input').focus();
    });

    $('#popisArtikalaTable tbody').on('change', '.custom-file-input', function() {
      const fileName = $(this).val().split('\\').pop();
      $(this).siblings('.custom-file-label').addClass('selected').html(fileName);
    });
  }

  async prikupiSastavnice() {
    $('#popisArtikalaTable tbody').on('click', 'button#zahtjevZaIzmjenom', async (e) => {
      debugger;
      const alertovi = Array.from(document.querySelectorAll('#sastavniceWrapper .alert'));
      const sastavnice = [];
      alertovi.forEach((element) => {
        sastavnice.push({
          'SifraArtikla': parseInt(element.querySelector('strong').textContent, 10),
          'Kolicina': parseInt(element.querySelector('.kolicinaSastavnica').textContent, 10),
        });
      });

      const izjava = document.getElementById('customFile').files[0];

      if (!izjava || izjava.type !== 'application/pdf') return new Error(appStatus('Potrebno je učitati .PDF datoteku.', true));

      console.log(sastavnice);

      const [err, data] = await to(toBase64(izjava));
      if (err) return new Error(appStatus('Greška kod obrade datoteke.', true));

      await this.posaljiZahtjev({'SifraMenija': e.currentTarget.dataset.id, 'sastavnice': sastavnice, 'izjava': data});
    });

    $('#popisArtikalaTable tbody').on('click', 'button#zahtjevZaIzmjenomPrint', async () => {
      printJS({
        'printable': 'print-izmjena-sastavnica',
        'style': 'body{color:#000!important}#print-receipt{color:#000!important,font-size:10px,font-family:"Times New Roman"}.d-print-none{display:none!important}.d-print-block{display:block!important}.align-middle{vertical-align:middle!important}.text-right{text-align:right!important}.text-left{text-align:left!important}.text-center{text-align:center!important}table th{font-weight:700!important}table.table td,table.table th{padding-top:.2rem!important;padding-bottom:.2rem!important}.table td,.table>thead td,.table>thead th{padding:.2rem!important;vertical-align:bottom!important;border-top:1px solid #000!important}.table>thead td,.table>thead th{padding:.2rem!important;vertical-align:bottom!important;border-bottom:1px solid #000!important}.p-0{padding:0!important}.pb-2,.py-2{padding-bottom:.5rem!important}.pt-2,.py-2{padding-top:.5rem!important}.m-0{margin:0!important}.table-responsive{display:block!important;width:100%!important}.w-100,table{width:100%!important}.border-top{border-top:1px dashed #000}.border-bottom{border-bottom:1px dashed #000}.small,small{font-size:80%;font-weight:400}.h5,h5{font-size:1.25rem}.srceLogoFooter{height: 20px}',
        'type': 'html',
        'scanStyles': false,
      });
    });
  }

  async posaljiZahtjev({SifraMenija, sastavnice = [], izjava}) {
    // TODO: upisati adresu
    const ajaxURL = ``;
    const tokenData = Object.freeze({
      'Izjava': izjava.split(',')[1],
      'Datum': document.getElementById('datumArtikala').value,
      'SifraMenija': SifraMenija,
      'KontrolniBrojDjelatnika': this.kontrolniBrojDjelatnika,
      'Artikli': sastavnice,
    });

    let err; let data;
    debugger;
    [err, data] = await to(zakljucajToken(tokenData));
    if (err) return new Error(appStatus('Greška kod zaključavanja tokena.', true));

    // TODO: upisati adresu
    [err, data] = await to(doAjax(ajaxURL, Object.freeze({'token': data, 'putanja': ''})));
    if (err) return new Error(appStatus(new ErrorView().getError(err), true));

    appStatus(`Zahtjev za izmjenom menija ${SifraMenija} uspješno poslan.`);
  }
}
