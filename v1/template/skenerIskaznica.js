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
            console.log(brKartice);
            resolve(brKartice);
          }
          this.chars = [];
          this.pressed = false;
        }, 200);
      }

      this.pressed = true;
    });
  }
}
