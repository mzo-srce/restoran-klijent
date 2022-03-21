/* eslint-disable max-len */
export const footer = (windowLocation) => `
<footer class="font-small font-weight-bold">
    <div class="container-fluid pb-2 z-depth-1">
        <div class="row text-center pt-3 pb-2">
            <div class="col">
                ISSP & ISAK | <img src="${windowLocation.replace(/\/?$/, '/')}dist/img/footer_logo.png?v1" class="srceLogoFooter"
                    alt="srce logo footer" height="20" width="60" />
            </div>
        </div>
    </div>
</footer>
`;
