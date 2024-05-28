var base = 'https://reidcameron.github.io/pages-test/'; //TODO: Debug - https://searchspring.github.io/angular-drafts/sites/;
(()=>{
    //Get preview from context
    var preview = document.currentScript.dataset.preview;
    
    //Create Modal
    window.addEventListener('load', async ()=>{
        //CSS
        document.querySelector('head').innerHTML += '<style name="searchspring-preview">' + require('./modal.css').default + '</style>';

        //HTML
        var modal_html = require('./modal.html').default;
        const mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light';
        const response = await fetch(base + 'sites/' + window.SearchSpring?.Catalog.site.id + '/' + preview + '.json'); //TODO: REMOVE DEBUG
        const error = response.status != '200';
        const meta = error ? {} : await response.json();
        const props = {
            mode_class: (error && ' ss__branch-override--error') || (mode == 'dark' && ' ss__branch-override--dark') || '',
            logo_src: (mode == 'dark' || error) ? 'https://snapui.searchspring.io/searchspring_light.svg':'https://snapui.searchspring.io/searchspring.svg',
            preview: error ? "branch not found": preview,
            time: error ? preview : meta.time || "V3 Preview", //TODO: add time func or erase
            stop_message: error ? "REMOVE" : 'STOP PREVIEW',
            message: error ? 'Incorrect branch name or branch no longer exists.' : 'Preview functionality may differ from production.',
            warning_icon: error ? '<svg class="ss__icon ss__icon--warn ss__branch-override__bottom__left__icon" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><polygon points="28,6 52.2,48 3.8,48" stroke="#be9628" stroke-linejoin="round" stroke-width="7.5"/><polygon points="25.8,18 30.2,18 29.8,35 26.2,35" fill="#820606" stroke="#820606" stroke-linejoin="round" stroke-width="2"/><polygon points="26.2,39.5 29.8,39.5 29.8,44 26.2,44" fill="#820606" stroke="#820606" stroke-linejoin="round" stroke-width="2"/></svg>' : '',
        };
        Object.entries(props).forEach((kv)=>{
            modal_html = modal_html.replaceAll('{{'+kv[0]+'}}', kv[1]); //Poor man's templating
        });
        document.querySelector('body').innerHTML += modal_html;

        //JS
        const wrapper = document.querySelector('.ss__branch-override');
        //Stop Preview
        document.querySelector('.ss__branch-override__top__button').addEventListener('click', (ev)=>{
            //Remove Cookie
            document.cookie = "ssPreviewOverride=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 

            //Remove URL Parameter
            const url = new URL(location.href);
            url.searchParams.delete('ss_preview');
            window.location.search = url.search;

            ev.stopImmediatePropagation();
        });
        //Collapse
        document.querySelector('.ss__branch-override__top__collapse').addEventListener('click', (ev)=>{
            wrapper?.classList.add('ss__branch-override--collapsed');
            ev.stopImmediatePropagation();
        });
        //Uncollapse
        wrapper.addEventListener('click', (ev)=>{
            wrapper?.classList.remove('ss__branch-override--collapsed');
            ev.stopImmediatePropagation();
        });
    });
})()