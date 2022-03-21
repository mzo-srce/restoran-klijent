/* eslint-disable max-len */
export const header = (korisnickoIme, admin = false, autoblagajna = false, windowLocation) => `
<div class="container-fluid z-depth-1">
    <nav class="navbar navbar-expand-lg z-depth-0 pt-2 pb-0">
        <a class="skip-main text-white" href="#skipToMain" aria-label="skoči na glavni sadržaj">Skoči na glavni
            sadržaj</a>
        <div class="container-fluid p-0">
            <span class="mr-auto pb-3 d-md-none">
                <h1 class="h5 m-0">Studentski restoran</h1>
            </span>
            <button class="navbar-toggler mt-1" type="button" data-toggle="collapse" data-target="#navbarCollapse">
                <span class="navbar-toggler-icon mt-1">☰</span>ISSP & ISAK
            </button>
            <div class="collapse navbar-collapse flex-column align-items-start ml-0" id="navbarCollapse">
                <span class="h6 mr-auto py-0">
                    <p class="p-0 m-0 d-none d-lg-block">
                        <a class="showLoader" asp-area="" asp-controller="Home" asp-action="Index"
                            aria-label="Naslovnica">
                            <span class="material-icons pb-1 pr-1">home</span>Informacijski
                            sustav studentskih prava (ISSP) & Informacijski sustav akademskih kartica (ISAK)
                        </a>
                    </p>
                    <p class="pl-5 m-0 d-lg-none">
                        <a class="showLoader" asp-area="" asp-controller="Home" asp-action="Index"
                            aria-label="Naslovnica">
                            <span class="material-icons pb-1 pr-1">home</span>ISSP &
                            ISAK
                        </a>
                    </p>
                </span>

                <ul class="navbar-nav mb-auto mt-0 mr-auto">

                    <li class="nav-item">
                        <a class="pl-5 nav-link showLoader" id="blagajna" aria-label="blagajna">
                            Blagajna
                        </a>
                    </li>

                    ${!autoblagajna ? `
                        <li class="nav-item">
                            <a class="pl-5 nav-link showLoader" id="ponuda" aria-label="današnja ponuda">
                                Ponuda
                            </a>
                        </li>

                        <li class="nav-item dropdown">
                            <a class="pl-5 nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Artikli</a>
                            <div class="dropdown-menu">
                                <a class="pl-5 nav-link showLoader" id="popisPojedinacnihArtikala" aria-label="popis pojedinačnih artikala">
                                    Popis pojedinačnih artikala
                                </a>
                                <a class="pl-5 nav-link showLoader" id="popisMenia" aria-label="popis menia">
                                    Popis menija
                                </a>
                                ${admin ? `<a class="pl-5 nav-link showLoader" id="izmjenaSastavnica" aria-label="izmjena sastavnica menia">Izmjena sastavnica menija</a>` : ''}
                            </div>
                        </li>
                    ` : ''}
                    
                    ${!autoblagajna ? `
                        <li class="nav-item dropdown">
                            <a class="pl-5 nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Obračun</a>
                            <div class="dropdown-menu">
                                <a class="pl-5 nav-link showLoader" id="obracunBlagajne" aria-label="obračun blagajne">
                                    Obračun blagajne
                                </a>
                                ${admin ? `<a class="pl-5 nav-link showLoader" id="obracunObjekta" aria-label="obračun objekta">Obračun objekta</a>` : ''}
                                <a class="pl-5 nav-link showLoader" id="storniranjeRacuna" aria-label="storniranje računa">
                                    Storniranje računa
                                </a>
                                ${admin ? `<a class="pl-5 nav-link showLoader" id="povijestRacuna" aria-label="povijest računa">Povijest računa</a>` : ''}
                            </div>
                        </li>

                        ${admin ? `
                        <li class="nav-item dropdown">
                            <a class="pl-5 nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Djelatnici</a>
                            <div class="dropdown-menu">
                                <a class="pl-5 nav-link showLoader" id="dodajDjelatnika" aria-label="dodaj djelatnika">
                                    Novi djelatnik
                                </a>
                                <a class="pl-5 nav-link showLoader" id="administracijaDjelatnika" aria-label="administracija djelatnika">
                                    Izmjena djelatnika
                                </a>
                            </div>
                        </li>
                        ` : ''}

                        <li class="nav-item">
                            <a class="pl-5 nav-link showLoader" id="odjavaSustav" aria-label="odjava iz sustava">
                                Odjava - ${korisnickoIme}
                            </a>
                        </li>
                    ` : ''}                   
                </ul>
            </div>
            <a href="https://www.srce.unizg.hr/" target="_self" aria-label="srce naslovnica">
                <img src="${windowLocation.replace(/\/?$/, '/')}dist/img/srce-logo-bijeli-150x50.png" class="srceLogoHeader" alt="srce logo header" />
            </a>
        </div>
    </nav>
</div>
`;
