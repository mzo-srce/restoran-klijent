/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export default class SkenerIskaznica {
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
          if (this.chars.length >= 8) {
            brKartice = this.chars.join('');
            console.log(`Broj kartice iz skener modula: ${brKartice}`);
            // global.brKartice = brKartice;
            resolve(brKartice);
          }
          this.chars = [];
          this.pressed = false;
          // 500 stavljeno jer su neka računala prespora i ne mogu obraditi broj kartice
        }, 500);
      }

      this.pressed = true;
    });
  }
}
