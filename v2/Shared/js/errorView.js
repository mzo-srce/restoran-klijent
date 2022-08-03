export default class ErrorView {
  constructor() {
    this.error0 = 0;
    this.error400 = 400;
    this.error401 = 401;
    this.error403 = 403;
    this.error404 = 404;
    this.error408 = 408;
    this.error500 = 500;
    this.error503 = 503;
    this.parserError = 'parsererror';
    this.timeout = 'timeout';
    this.abort = 'abort';
  }

  getError({readyState, responseText, responseJSON, status}) {
    if ((responseJSON === '' || responseJSON === undefined) && (responseText === '' || responseText === undefined || responseText.includes('<!DOCTYPE'))) {
      if (readyState === this.error0) {
        return 'Servis nedostupan ili provjerite Internet konekciju!';
      } else if (status === this.error400) {
        return 'Kriva adresa zahtjeva!';
      } else if (status === this.error401) {
        return 'Potrebna autorizacija, prijavite se u sustav!';
      } else if (status === this.error403) {
        return 'Pristup zabranjen!';
      } else if (status === this.error404) {
        return 'Datoteka ne postoji!';
      } else if (status === this.error408) {
        return 'Server preopterećen, pokušajte za par minuta!';
      } else if (status === this.error500) {
        return 'Greška na serveru, kontaktirajte administratora!';
      } else if (status === this.error503) {
        return 'Servis nedostupan!';
      } else if (status === this.parserError) {
        return 'Neuspješno dohvaćanje JSON podataka!';
      } else if (status === this.timeout) {
        return 'Isteklo vrijeme zahtjeva!';
      } else if (status === this.abort) {
        return 'Zahtjev otkazan!';
      }
    } else if ((responseJSON === '' || responseJSON === undefined)) {
      return responseText;
    } else {
      return responseJSON;
    }
  }
}
