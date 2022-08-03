export const doAjax = async (ajaxURL, ajaxDATA, method = 'POST') => {
  const result = await $.ajax({
    'xhrFields': {'withCredentials': true},
    'data': ajaxDATA,
    'dataType': 'json',
    'method': method,
    'url': ajaxURL,
  });

  return result;
};

export const to = (promise) => {
  debugger;
  return promise.then((data) => {
    return [null, data];
  })
      .catch((err) => [err]);
};

export const dateOptions = Object.freeze({
  'day': '2-digit',
  'month': '2-digit',
  'year': 'numeric',
});

export const appStatus = (poruka, greska = false) => {
  if (greska) {
    notyf.error(poruka.replace('Error: ', ''));
  } else {
    notyf.success(poruka);
  }
};

export const divStatusCard = (msg = 'Učitavam..') => `
<div id="statusLoadingCard" class="card bg-dark z-depth-0 rounded-0">
    <div class="card-body rounded-0">
        <div class="row">
            <div class="pl-4"><span class="material-icons md-48 text-white spin-md">settings</span></div>
            <div><div class="text-center textLoader pl-5 pr-1">${msg}</div></div>
        </div>
    </div>
</div>
`;

export const divChildCard = (msg = 'Učitavam..') => `
<div id="statusLoadingChildCard" class="card bg-dark z-depth-0 rounded-0">
    <div class="card-body rounded-0">
        <div class="row">
            <div class="pl-4"><span class="material-icons md-48 text-white spin-md">settings</span></div>
            <div><div class="text-center textLoader pl-5 pr-1">${msg}</div></div>
        </div>
    </div>
</div>
`;

export const hideStatusCard = async () => {
  $('#statusLoadingCard').fadeOut(1300, () => {
    document.querySelector('.content-card').classList.remove('d-none');
  });
};

export const hideChildCard = async () => {
  $('#statusLoadingChildCard').fadeOut(800, () => {
    document.querySelector('.child-content').classList.remove('d-none');
    if (document.querySelector('#popisPojedinacnihTable_filter input')) {
      document.querySelector('#popisPojedinacnihTable_filter input').focus();
    }
  });
};

export const ugasiTImere = async () => {
  if (isspVrijeme.nefiskrac) {
    clearInterval(isspVrijeme.nefiskrac);
    isspVrijeme.nefiskrac = null;
  }
  if (isspVrijeme.prikazStudenta) {
    clearTimeout(isspVrijeme.prikazStudenta);
    isspVrijeme.prikazStudenta = null;
  }
};

export const dtOptions = Object.freeze({
  'dom': '<\'row px-3 pb-3\'<\'col-sm-12 dt-art\'>>' +
        '<\'row px-3\'<\'col-sm-12 \'f>>' +
        '<\'row\'<\'col-sm-12\'tr>>' +
        '<\'row px-3 py-3\'<\'col-sm-12 col-md-5\'i><\'col-sm-12 col-md-7\'p>>',
  'domExport': '<\'row px-3 pb-3\'<\'col-sm-12\'B>>' +
          '<\'row px-3\'<\'col-sm-12\'f>>' +
          '<\'row\'<\'col-sm-12\'tr>>' +
          '<\'row px-3 py-3\'<\'col-sm-12 col-md-5\'i><\'col-sm-12 col-md-7\'p>>',
  'domShort': '<\'row\'<\'col-sm-12\'tr>>' +
        '<\'row px-3 py-3\'<\'col-sm-12 col-md-5\'i><\'col-sm-12 col-md-7\'p>>',
  'language': {
    'sEmptyTable': 'Nema podataka u tablici',
    'sInfo': 'Prikazano _START_ do _END_ od ukupno _TOTAL_ rezultata',
    'sInfoEmpty': 'Prikazano 0 do 0 od 0 rezultata',
    'sInfoFiltered': '(filtrirano iz _MAX_ ukupnih rezultata)',
    'sInfoPostFix': '',
    'sInfoThousands': ',',
    'sLengthMenu': 'Prikaži _MENU_ rezultata po stranici',
    'sLoadingRecords': `<div class="text-center">Obrađujem...</div>`,
    'sProcessing': `<div class="text-center">Obrađujem...</div>`,
    'sZeroRecords': 'Ništa nije pronađeno',
    'paginate': {
      'next': '&#9655;',
      'previous': '&#9665;',
      'first': 'Prva',
      'last': 'Zadnja',
    },
    'search': '_INPUT_',
    'searchPlaceholder': 'Pretraži tablicu',
    'oAria': {
      'sSortAscending': ': aktiviraj za rastući poredak',
      'sSortDescending': ': aktiviraj za padajući poredak',
    },
  },
  'pageLength': 25,
  'pagingType': 'full_numbers',
  'processing': true,
  'responsive': true,
  'lengthChange': false,
});

export const datumi = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);

  let month = '' + (date.getMonth() + 1);
  let day = '' + date.getDate();
  const year = date.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
};

export const dateTimeFormatT = () => {
  const now = new Date();
  const currentDate = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
  const currentMonth = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
  const currentYear = now.getFullYear() < 10 ? `0${now.getFullYear()}` : now.getFullYear();
  const currentHrs = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
  const currentMins = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  const currentSecs = now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds();

  return {
    'databaseTime': `${currentYear}-${currentMonth}-${currentDate}T${currentHrs}:${currentMins}:${currentSecs}`,
    'viewTime': `${currentDate}.${currentMonth}.${currentYear}. ${currentHrs}:${currentMins}:${currentSecs}`,
  };
};

export const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});


const display = () => {
  const refresh=1000; // Refresh rate in milli seconds
  isspVrijeme.prikazSata=setTimeout(displayClock, refresh);
};

export const displayClock = () => {
  const x = new Date();

  let hours=x.getHours().toString();
  hours=hours.length==1 ? 0+hours : hours;

  let minutes=x.getMinutes().toString();
  minutes=minutes.length==1 ? 0+minutes : minutes;

  let seconds=x.getSeconds().toString();
  seconds=seconds.length==1 ? 0+seconds : seconds;

  let month=(x.getMonth() +1).toString();
  month=month.length==1 ? 0+month : month;

  let dt=x.getDate().toString();
  dt=dt.length==1 ? 0+dt : dt;

  const x1 = `${dt}.${month}.${x.getFullYear()}. ${hours}:${minutes}`;
  const clockDiv = Array.from(document.querySelectorAll('.clock'));
  clockDiv.forEach((e) => {
    e.innerText = x1;
  });
  display();
};

export const statusBlagajne = async (status) => {
  if (status) {
    const statusBlagajne = Array.from(document.querySelectorAll('.statusBlagajne'));
    statusBlagajne.forEach((e) => {
      e.classList.add('text-success');
      e.classList.remove('text-danger');
      e.innerText = 'online';
    });
  } else {
    const statusBlagajne = Array.from(document.querySelectorAll('.statusBlagajne'));
    statusBlagajne.forEach((e) => {
      e.classList.add('text-danger');
      e.classList.remove('text-success');
      e.innerText = 'offline';
    });
  }

  const brojOfflineRacunaSpan = Array.from(document.querySelectorAll('.brojOfflineRacuna'));

  if (localStorage.offlineRacuni) {
    document.getElementById('posaljiRacune').classList.remove('d-none');
    brojOfflineRacunaSpan.forEach((element) => {
      element.textContent = JSON.parse(localStorage.offlineRacuni).length;
    });
  } else {
    document.getElementById('posaljiRacune').classList.add('d-none');
    brojOfflineRacunaSpan.forEach((element) => {
      element.textContent = 0;
    });
  }
};

export const zaokruziNaDvije = (num) => {
  return +(Math.round(Number(num) + 'e+2') + 'e-2');
};

export const toEuro = {
  'num': (num) => +(Math.round(parseFloat(isNaN(num) ? (num.replace(',', '.').replace(' ', '')/7.53450) : num/7.53450) + 'e+2') + 'e-2'),
  'init': ({currency = true, dot = true} = {}) => Array.from(document.querySelectorAll('.toEuro')).forEach((e) => e.textContent = `${dot ? toEuro.num(e.textContent) : (toEuro.num(e.textContent)).toString().replace('.', ',')} ${currency ? '€' : ''}`),
};
