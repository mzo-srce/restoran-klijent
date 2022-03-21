/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import QRCode from 'qrcode-svg';


export default class Racun {
  constructor() {
    this.mainDiv = document.getElementById('mainDivContent');
  }

  async init(data, storno = false, online) {
    $('#racun-holder').remove();
    if (online) await this.constructor.postaviCore(data, storno);
  }

  static async postaviCore(data, storno) {
    const {
      Artikli,
      BlagajnaNaziv,
      BrRacuna,
      Djelatnik,
      DatumVrijemeRacuna,
      RestoranAdresa,
      RestoranNaziv,
      UkupniIznosPoreza,
      UkupniIznosSubvencije,
      UkupniIznosZaPlatiti,
      UstanovaAdresa,
      UstanovaNaziv,
      UstanovaOIB,
      ObveznikPDV,
      RacunOdgovor = {},
      ListaPoreza,
    } = data;

    const {ZKI = null, JIR = null, HasGreska = null, HasJIR = false, BrojRacuna = null, QrKodUrl = null} = RacunOdgovor;

    const qr = () => {
      const qrcode = new QRCode({
        content: QrKodUrl,
        container: 'svg',
        join: true,
        width: 120,
        height: 120,
      });

      return qrcode.svg();
    };

    const artikliTablica = () => {
      let row = '';
      Artikli.forEach(({NazivArtikla, KolicinaArtikla, CijenaArtikla, CijenaArtiklaSKolicinom, PostoParticipacije}) => {
        row += `<tr>
          <td class="text-left align-middle">${NazivArtikla} (${PostoParticipacije}%) ${parseInt(KolicinaArtikla, 10) > 1 ? `<br/>(1 = ${CijenaArtikla} kn)` : ''}</td>
          <td class="text-center align-middle">${KolicinaArtikla}</td>
          <td class="text-right align-middle text-nowrap">${CijenaArtiklaSKolicinom}</td>
        </tr>`;
      });
      return row;
    };

    const poreziTablica = () => {
      let row = '';
      ListaPoreza.forEach(({PoreznaStopa, IznosPoreza, Osnovica}) => {
        row += `<tr>
          <td class="text-left align-middle">PDV</td>
          <td class="text-center align-middle">${PoreznaStopa}</td>
          <td class="text-right align-middle text-nowrap">${Osnovica}</td>
          <td class="text-right align-middle text-nowrap">${IznosPoreza}</td>
        </tr>`;
      });
      return row;
    };


    const core = `
    <div class="d-none card z-depth-0 rounded-0" id="racun-holder">
      <div class="card-body pt-0 border-light-left-f border-light-right-f" id="print-receipt">
        <p class="p-0 m-0">${UstanovaNaziv}<br/>${UstanovaAdresa}<br/>OIB: ${UstanovaOIB}</p>
        <h4 class="text-center pt-2 m-0">${RestoranNaziv}</h4>
        <p class="text-center pb-2 m-0">${RestoranAdresa}<br/>${BlagajnaNaziv}</p>
        <p class="py-2 m-0">Broj dnevnika: ${BrRacuna}</p>
        ${storno ? `<p class="h5">STORNIRANO</p>` : ''}
        <div class="table-responsive">
            <table class="table table-borderd w-100 mb-0">
                <thead>
                    <tr>
                        <th scope="col" class="text-left align-middle">Naziv artikla</th>
                        <th scope="col" class="text-center align-middle">Kol.</th>
                        <th scope="col" class="text-right align-middle text-nowrap">Cijena [kn]</th>
                        <td scope="col" class="text-right align-middle d-print-none"></td>
                    </tr>
                </thead>
                <tbody>
                  ${artikliTablica()}
                </tbody>
                <tfoot>
                  <tr>
                      <td colspan="4" class="text-right align-middle">Ukupno: ${(Number(UkupniIznosSubvencije) + Number(UkupniIznosZaPlatiti)).toFixed(2)} kn</td>
                  </tr>
                  <tr>
                      <td colspan="4" class="text-right align-middle">Ukupni iznos subvencije: ${UkupniIznosSubvencije} kn</td>
                  </tr>
                  <tr>
                      <td colspan="4" class="text-right align-middle h5">Ukupno za platiti: ${UkupniIznosZaPlatiti} kn</td>
                  </tr>
                </tfoot>
            </table>
        </div>
        ${ObveznikPDV ? `
          <div class="pb-2">
            <p class="text-center py-2 m-0"><small>Način plaćanja: novčanice<br />----- Obračun poreza -----</small></p>
            <div class="table-responsive">
                <table class="table table-borderd w-100 mb-0">
                    <thead>
                        <tr>
                            <td scope="col" class="align-middle">Porez</td>
                            <td scope="col" class="text-right align-middle">Stopa [%]</td>
                            <td scope="col" class="text-right align-middle">Osnovica [kn]</td>
                            <td scope="col" class="text-right align-middle">Iznos [kn]</td>
                        </tr>
                    </thead>
                    <tbody>
                      ${poreziTablica()}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="4" class="text-right align-middle">Ukupni iznos poreza: ${UkupniIznosPoreza} kn</td>
                      </tr>
                    </tfoot>
                </table>
            </div>
          </div> 
        ` : `
          <div class="pb-2">
              <p class="text-center py-2 m-0 border-top border-bottom"><small>PDV nije zaračunat po čl. 39 Zakona o PDV-u</small></p>
          </div>
        `}     
          <p class="p-0 m-0">
            Datum i vrijeme: ${DatumVrijemeRacuna}<br/>
            Blagajnik: ${Djelatnik}<br/>
          </p>
          ${ObveznikPDV ? `
            <p class="p-0 m-0">
              Broj računa: ${BrojRacuna ? BrojRacuna : 'Račun nije fiskaliziran.'}<br/>
              ZKI: ${ZKI ? ZKI : 'Račun nije fiskaliziran.'}<br/>
              JIR: ${JIR ? JIR : 'Račun nije fiskaliziran.'}<br/>
              <div class="text-center pt-2 pb-1" id="qrcode">${qr()}</div>
            </p>
          ` : ''}    
          Ograničena je dnevna kupovina artikala po skupinama. Za podnošenje predstavke o usluzi obratite se na: studentski-standard@mzo.hr. Vaša studentska prava provjerite na issp.srce.hr.      
      </div>
    </div>
    `;

    $('#mainDivContent').append(core);

    printJS({
      'printable': 'print-receipt',
      'style': 'body{color:#000!important}#print-receipt{font-size:10px}.d-print-none{display:none!important}.d-print-block{display:block!important}.align-middle{vertical-align:middle!important}.text-right{text-align:right!important}.text-left{text-align:left!important}.text-center{text-align:center!important}table th{font-weight:700!important}table.table td,table.table th{padding-top:.2rem!important;padding-bottom:.2rem!important}.table td,.table>thead td,.table>thead th{padding:.2rem!important;vertical-align:bottom!important;border-top:1px solid #000!important}.table>thead td,.table>thead th{padding:.2rem!important;vertical-align:bottom!important;border-bottom:1px solid #000!important}.p-0{padding:0!important}.pb-2,.py-2{padding-bottom:.5rem!important}.pt-2,.py-2{padding-top:.5rem!important}.m-0{margin:0!important}.table-responsive{display:block!important;width:100%!important}.w-100,table{width:100%!important}.border-top{border-top:1px dashed #000}.border-bottom{border-bottom:1px dashed #000}.small,small{font-size:80%;font-weight:400}.h5,h5{font-size:1.25rem}.srceLogoFooter{height: 20px}',
      'type': 'html',
      'scanStyles': false,
      'onPrintDialogClose': () => $('#racun-holder').remove(),
    });
  }
}
