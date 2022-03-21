/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

export default class Kosarica {
  constructor(obveznikPDV) {
    this.obveznikPDV = obveznikPDV;
  }

  set iznosi({SubvencijaDnevniIznosRaspoloziv = 0, SubvencijaDvostrukiDnevniIznos = 0, RazinaPrava = null}) {
    this.dnevni = SubvencijaDnevniIznosRaspoloziv;
    this.dvostrukiDnevni = SubvencijaDvostrukiDnevniIznos;
    this.razinaPrava = RazinaPrava;
  }

  dodaj(e) {
    const el = e.currentTarget;

    if (el.querySelector('.potrosenoDanas')) {
      const [PotrosenoDanas, GrupaArtiklaMaxKolicina] = el.querySelector('.potrosenoDanas').innerText.split('/');

      if (parseInt(PotrosenoDanas, 10) < parseInt(GrupaArtiklaMaxKolicina, 10)) {
        const Id = parseInt(el.querySelector('.textID').innerText.split(':')[1], 10);
        const Naziv = el.querySelector('.textNaziv').innerText;
        let {postoparticipacije, subvencija, stopaporeza, pdviznos} = el.querySelector('.menu-item').dataset;
        let CijenaSaSubvencijom = el.querySelector('.textCijenaSaSubvencijom').innerText.split(':')[1];
        let Cijena = el.querySelector('.textCijena').innerText.split(':')[1];

        CijenaSaSubvencijom = Number(CijenaSaSubvencijom.replace(/[^0-9\.]+/g, ''));
        Cijena = Number(Cijena.replace(/[^0-9\.]+/g, ''));
        subvencija = Number(subvencija.replace(/[^0-9\.]+/g, ''));
        pdviznos = Number(pdviznos.replace(/[^0-9\.]+/g, ''));
        const GrupaArtiklaId = parseInt(el.dataset.grupaartiklaid, 10);

        this.constructor.povecajKosaricu(Object.freeze({
          Id, Naziv, Cijena, CijenaSaSubvencijom, GrupaArtiklaId,
          postoparticipacije, subvencija, stopaporeza, pdviznos, obveznikPDV: this.obveznikPDV,
        }));
        this.constructor.povecajZaGrupu(GrupaArtiklaId);
        this.constructor.kosaricaUkupno(this.dnevni, this.dvostrukiDnevni, this.razinaPrava, this.obveznikPDV);
      }
    }
  }

  ukloni(e) {
    const row = e.currentTarget.closest('tr');
    const GrupaArtiklaId = parseInt(row.querySelector('td:nth-of-type(1)').dataset.grupaartiklaid, 10);
    const kolicina = parseInt(row.querySelector('td:nth-of-type(2)').innerText, 10);

    this.constructor.smanjiZaGrupu(GrupaArtiklaId, kolicina);
    this.constructor.smanjiKosaricu(row, this.obveznikPDV);
    this.constructor.kosaricaUkupno(this.dnevni, this.dvostrukiDnevni);
  }

  static smanjiZaGrupu(grupa, kolicina) {
    const artikli = Array.from(document.querySelectorAll('#menuHolder .menuArtikl'));

    artikli.forEach((e) => {
      const {boja} = e.querySelector('.menu-item').dataset;
      const GrupaArtiklaId = parseInt(e.dataset.grupaartiklaid, 10);
      let [PotrosenoDanas, GrupaArtiklaMaxKolicina] = e.querySelector('.potrosenoDanas').innerText.split('/');

      if (GrupaArtiklaId === grupa) {
        PotrosenoDanas = parseInt(PotrosenoDanas, 10) - kolicina;
        e.querySelector('.potrosenoDanas').innerText = `${PotrosenoDanas}/${GrupaArtiklaMaxKolicina}`;
        e.querySelector('.menu-item').className = e.querySelector('.menu-item').className.replace(/iskoristenArtikl/gi, boja);
        e.querySelector('.posCijenaBottom').classList.remove('d-none');
        e.querySelector('.centerParent').classList.add('d-none');
      }
    });
  }

  static povecajZaGrupu(grupa) {
    const artikli = Array.from(document.querySelectorAll('#menuHolder .menuArtikl'));

    artikli.forEach((e) => {
      const GrupaArtiklaId = parseInt(e.dataset.grupaartiklaid, 10);
      let [PotrosenoDanas, GrupaArtiklaMaxKolicina] = e.querySelector('.potrosenoDanas').innerText.split('/');

      if (GrupaArtiklaId === grupa) {
        PotrosenoDanas = parseInt(PotrosenoDanas, 10) + 1;
        e.querySelector('.potrosenoDanas').innerText = `${PotrosenoDanas}/${GrupaArtiklaMaxKolicina}`;

        if (PotrosenoDanas >= parseInt(GrupaArtiklaMaxKolicina, 10)) {
          e.querySelector('.menu-item').className = e.querySelector('.menu-item').className.replace(/doručak|ručak|večera|ostalo/gi, 'iskoristenArtikl');
          e.querySelector('.posCijenaBottom').classList.add('d-none');
          e.querySelector('.centerParent').classList.remove('d-none');
        }
      }
    });
  }

  static smanjiKosaricu(row, obveznikPDV) {
    const index = row.rowIndex;

    document.querySelector('#kosaricaCol #kosaricaTable').deleteRow(index);

    if (obveznikPDV) {
      const printObracunPorezaTable = document.querySelector('#kosaricaCol #printObracunPorezaTable > tbody');
      let {stopaporeza, pdviznos} = row.querySelector('button').dataset;
      let cijena = row.querySelector('td:nth-of-type(3)').innerText;
      pdviznos = Number(pdviznos.replace(/[^0-9\.]+/g, ''));
      cijena = Number(cijena.replace(/[^0-9\.]+/g, ''));

      if (document.querySelector(`#kosaricaCol #kosaricaTable > tbody > tr button[data-stopaporeza="${stopaporeza}"]`)) {
        const tr = printObracunPorezaTable.querySelector(`td[data-stopaporeza="${stopaporeza}"]`).parentElement;
        const zbrojOsnovica = Number(tr.querySelector('td:nth-of-type(3)').innerText) - (cijena - pdviznos);
        const zbrojPdvIznosa = Number(tr.querySelector('td:nth-of-type(4)').innerText) - pdviznos;

        tr.querySelector('td:nth-of-type(3)').innerText = zbrojOsnovica.toFixed(2);
        tr.querySelector('td:nth-of-type(4)').innerText = zbrojPdvIznosa.toFixed(2);
      } else {
        const pdvRowIndex = printObracunPorezaTable.querySelector(`td[data-stopaporeza="${stopaporeza}"]`).parentElement.rowIndex;
        document.querySelector('#kosaricaCol #printObracunPorezaTable').deleteRow(pdvRowIndex);
      }
    }
  }

  static povecajKosaricu({Id, Naziv, Cijena, GrupaArtiklaId, postoparticipacije, subvencija, stopaporeza, pdviznos, obveznikPDV}) {
    const kosaricaTable = document.querySelector('#kosaricaCol #kosaricaTable > tbody');
    const tableKosaricaRow = `
    <tr>
        <td data-tdid="${Id}" data-grupaartiklaid="${GrupaArtiklaId}" class="text-left align-middle">${Naziv} (${postoparticipacije}%)<br/>(1 = ${Cijena.toFixed(2)} kn)</td>
        <td class="text-center align-middle">1</td>
        <td class="text-right align-middle" data-subvencija="${subvencija}">${Cijena.toFixed(2)}</td>
        <td class="text-right align-middle d-print-none">
            <button class="btn btn-md btn-light-f m-0 px-3 z-depth-0 waves-effect ukloniIzKosarice" data-stopaporeza="${stopaporeza}" data-pdviznos="${pdviznos}" type="button">
            <span class="material-icons">
            highlight_off
            </span></button>
        </td>
    </tr>`;

    if (kosaricaTable.querySelector(`td[data-tdid="${Id}"]`)) {
      const tr = kosaricaTable.querySelector(`td[data-tdid="${Id}"]`).parentElement;
      const zbroj = Number(tr.querySelector('td:nth-of-type(3)').innerText) + Cijena;
      const zbrojSubvencija = Number(tr.querySelector('td:nth-of-type(3)').dataset.subvencija) + subvencija;
      const zbrojPdvIznosa = Number(tr.querySelector('button').dataset.pdviznos) + pdviznos;

      tr.querySelector('td:nth-of-type(2)').innerText = parseInt(tr.querySelector('td:nth-of-type(2)').innerText, 10) + 1;
      tr.querySelector('td:nth-of-type(3)').innerText = zbroj.toFixed(2);
      tr.querySelector('td:nth-of-type(3)').dataset.subvencija = zbrojSubvencija.toFixed(2);
      tr.querySelector('button').dataset.pdviznos = zbrojPdvIznosa.toFixed(2);
    } else {
      kosaricaTable.innerHTML += tableKosaricaRow;
    }

    if (obveznikPDV) {
      const printObracunPorezaTable = document.querySelector('#kosaricaCol #printObracunPorezaTable > tbody');
      const tableObracunRow = `
      <tr>
          <td class="align-middle" data-stopaporeza="${stopaporeza}">PDV</td>
          <td class="text-right align-middle">${stopaporeza}</td>
          <td class="text-right align-middle">${(Cijena - pdviznos).toFixed(2)}</td>
          <td class="text-right align-middle">${pdviznos.toFixed(2)}</td>
      </tr>
      `;

      if (printObracunPorezaTable.querySelector(`td[data-stopaporeza="${stopaporeza}"]`)) {
        const tr = printObracunPorezaTable.querySelector(`td[data-stopaporeza="${stopaporeza}"]`).parentElement;
        const zbrojOsnovica = Number(tr.querySelector('td:nth-of-type(3)').innerText) + (Cijena - pdviznos);
        const zbrojPdvIznosa = Number(tr.querySelector('td:nth-of-type(4)').innerText) + pdviznos;

        tr.querySelector('td:nth-of-type(3)').innerText = zbrojOsnovica.toFixed(2);
        tr.querySelector('td:nth-of-type(4)').innerText = zbrojPdvIznosa.toFixed(2);
      } else {
        printObracunPorezaTable.innerHTML += tableObracunRow;
      }
    }
  }

  static kosaricaUkupno(dnevni, dvostrukiDnevni, razinaPrava, obveznikPDV) {
    const kosarica = document.getElementById('kosaricaCol');
    const printRacunPotrosnjaInfo = document.getElementById('printRacunPotrosnjaInfo');
    const kolicina = Array.from(kosarica.querySelectorAll('#kosaricaTable > tbody tr td:nth-of-type(2)'));
    const cijena = Array.from(kosarica.querySelectorAll('#kosaricaTable > tbody tr td:nth-of-type(3)'));
    const _dnevni = Number(dnevni.replace(/[^0-9\.]+/g, ''));
    const _dvostrukiDnevni = Number(dvostrukiDnevni.replace(/[^0-9\.]+/g, ''));
    let cijenaUkupno = 0.00;
    let subvencijaUkupno = 0.00;

    if (kolicina.length > 0) {
      cijena.forEach((e) => {
        cijenaUkupno += Number(e.innerText);
        if (razinaPrava > 0) {
          subvencijaUkupno += Number(e.dataset.subvencija);
        }
      });
    }

    if ((subvencijaUkupno > _dnevni && subvencijaUkupno <= _dvostrukiDnevni) || (dnevni < 0 && subvencijaUkupno <= _dvostrukiDnevni)) {
      printRacunPotrosnjaInfo.innerText = 'Ukupni iznos subvencije je veći od raspoloživog dnevnog iznosa. Subvencija će biti oduzeta i od idućeg dana!';
      printRacunPotrosnjaInfo.classList.remove('d-none');
    } else if (subvencijaUkupno > _dvostrukiDnevni) {
      printRacunPotrosnjaInfo.innerText = 'Ukupni iznos subvencije je veći od rasploživog dvostrukog dnevnog iznosa. Naplata će biti izvršena po obračunskoj cijeni nakon prekoračenja iznosa.';
      printRacunPotrosnjaInfo.classList.remove('d-none');
    } else {
      printRacunPotrosnjaInfo.classList.add('d-none');
    }

    const tableKosaricaRow =`
    <tr>
      <td colspan="4" class="text-right align-middle">Ukupno: ${cijenaUkupno.toFixed(2)} kn</td>
    </tr>
    <tr>
      <td colspan="4" class="text-right align-middle">Ukupni iznos subvencije: ${subvencijaUkupno > _dvostrukiDnevni ? `${_dvostrukiDnevni} kn` : `${subvencijaUkupno.toFixed(2)} kn`}</td>
    </tr>
    <tr>
      <td colspan="4" class="text-right align-middle h5">Ukupno za platiti: ${subvencijaUkupno > _dvostrukiDnevni ? `${(cijenaUkupno.toFixed(2) - _dvostrukiDnevni.toFixed(2)).toFixed(2)} kn` : `${(cijenaUkupno.toFixed(2) - subvencijaUkupno.toFixed(2)).toFixed(2)} kn`}</td>
    </tr>`;


    kosarica.querySelector('#kosaricaTable > tfoot').innerHTML = tableKosaricaRow;

    if (obveznikPDV) {
      const porez = Array.from(kosarica.querySelectorAll('#printObracunPorezaTable > tbody tr td:nth-of-type(4)'));
      let porezUkupno = 0.00;

      if (kolicina.length > 0) {
        porez.forEach((e) => {
          porezUkupno += Number(e.innerText);
        });
      }

      const tableObracunRow = `
      <tr>
        <td colspan="4" class="text-right align-middle">Ukupni iznos poreza: ${porezUkupno.toFixed(2)} kn</td>
      </tr>
      `;

      kosarica.querySelector('#printObracunPorezaTable > tfoot').innerHTML = tableObracunRow;
    }
  }
}
