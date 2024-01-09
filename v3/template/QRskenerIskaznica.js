/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export default class QRSkenerIskaznica {
  constructor() {
    this.pressed = false;
    this.chars = [];
    this.unosBrKartice = document.getElementById('unosBrKartice');
    this.manualAuto = parseInt($('input[type=\'radio\'][name=\'manualAuto\']:checked').val(), 10);
  }

  dohvatiBrojIskaznice(e) {
    let brKartice = '';

    this.chars.push(String.fromCharCode(e.which));

    return new Promise((resolve, reject) => {
      if (this.pressed === false) {
        setTimeout(() => {
          if (this.chars.length > 20) {
            brKartice = this.chars.join('');
            brKartice = brKartice.split(',')[2].replace(/[^0-9\.]+/g, '');
            console.log(`Broj kartice iz qr skener modula: ${brKartice}`);
            // global.brKartice = brKartice;
            resolve(brKartice);
          }
          this.chars = [];
          this.pressed = false;
          // 1000 stavljeno jer su neka računala prespora i ne mogu obraditi broj kartice
        }, 1000);
      }

      this.pressed = true;
    });
  }
}
