/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {appStatus, divStatusCard, dtOptions, hideStatusCard, ugasiTImere} from '../../Shared/js/asyncAjax';

export default class OfflineRacuni {
  constructor(server, windowLocation, kontrolniBrojDjelatnika) {
    this.server = server;
    this.windowLocation = windowLocation;
    this.kontrolniBrojDjelatnika = kontrolniBrojDjelatnika;
    this.mainDiv = document.getElementById('mainDivContent');
    this.prikazTestnihPodataka = this.server.includes('test') ? true : false;
  }

  async init() {
    if (!localStorage.offlineRacuni) return new Error(appStatus('Svi računi uspješno sinkronizirani.'));
    await ugasiTImere();
    await this.postaviStranicu();
    await this.initDataTable();
    await this.dohvatiPodatke();
    await hideStatusCard();
  }

  async postaviStranicu() {
    this.mainDiv.innerHTML = `
    <div class="row py-3">
      <div class="col">
      ${divStatusCard()}
        <div class="card bg-dark z-depth-0 rounded-0 d-none content-card">
            <div class="card-body p-0 rounded-0">
              <div class="px-3 pt-3">
                <p class="text-white"><strong>Pregled računa izdanih za vrijeme offline rada blagajne. Računi nisu obrađeni od strane centralnog sustava te ne sadrže financijske podatke.
                <br/>Tablica će se automatski isprazniti kada pošaljete račune na sinkronizaciju.
                <br/>Ako u glavnom izborniku nije vidljiva tipka "Pošalji offline račune", svi računi su poslani i njihov status provjerite na povijesti računa.</strong></p>
              </div>              
              <div class="table-responsive">
                <table class="table table-dark w-100" id="popisOfflineRacunaTable" data-order='[[ 0, "desc" ]]'>
                      <thead class="thead-dark">
                          <tr>   
                              <th scope="col" class="text-center align-middle" data-class-name="text-center align-top" data-sortable="true">Vrijeme računa</th>  
                              <th scope="col" class="text-right align-middle" data-class-name="text-right align-top" data-sortable="false">Broj kartice</th>                           
                              <th scope="col" class="align-middle w-75" data-class-name="align-top w-75" data-sortable="false">Artikli</th>                              
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

  async dohvatiPodatke() {
    const data = JSON.parse(localStorage.offlineRacuni);
    const table = $('#popisOfflineRacunaTable').DataTable();
    table.clear();
    table.rows.add(data).draw();
    table.columns.adjust().draw();
    return data;
  }

  async initDataTable() {
    const sviArtikli = JSON.parse(localStorage.sviArtikli);
    const {dom, language, pageLength, pagingType, responsive} = dtOptions;
    $('#popisOfflineRacunaTable').DataTable( {
      dom,
      language,
      pageLength,
      pagingType,
      responsive,
      'columns': [
        {'data': 'ViewTime', 'searchable': false},
        {'data': 'BrKartice'},
        {
          'data': 'Artikli',
          'searchable': false,
          'render': (data) => {
            let spoji = '';
            for (const i of data) {
              const foundIndex = sviArtikli.findIndex((x) => x.Id === i.SifraArtikla);
              spoji += `${sviArtikli[foundIndex].Naziv} - količina ${i.Kolicina}<br/>`;
            }
            return spoji;
          },
        },
      ],
      'initComplete': () => {
        $('#popisOfflineRacunaTable_filter input').removeClass('form-control-sm').addClass('form-control-lg input-dark-f rounded-0');
      },
    } );
  }
}
