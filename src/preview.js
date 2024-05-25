(()=>{
    //Find Preview URL Parameter
    const preview = (new URL(location.href)).searchParams.get('ss_preview');
    if (!preview) {
        var cookie = getCookie('ssPreviewOverride');
        if (!cookie) return;
    }

    //Observe Catalog Script
    var observer = new MutationObserver(function(mutations) {
        for (var i=0; i<mutations.length; i++) {
            var mutationAddedNodes = mutations[i].addedNodes;
            for (var j=0; j<mutationAddedNodes.length; j++) {
                var node = mutationAddedNodes[j];
                if(node.src?.includes('searchspring.catalog.js')){
                    //Add draft as external angular.js resource
                    node.setAttribute('external', 'https://searchspring.github.io/angular-drafts/sites/' + node.src.slice(-6) + '/' + (preview || cookie) + '.js');
                    // node.setAttribute('external', `https://cdn.searchspring.net/ajax_search/sites/${node.src.slice(-6)}/js/angular.js`); //TODO: REMOVE DEBUG
                    observer.disconnect();
                }
            }
        }
    });
    observer.observe(document, {childList: true, subtree: true});

    //Set Cookie to make preview persistable
    if(preview) setCookie('ssPreviewOverride', preview);
    
    //Create Modal
    window.addEventListener('load', async ()=>{
        //CSS
        document.querySelector('head').innerHTML += '<style name="searchspring-preview">' + require('./modal.css').default + '</style>';

        //HTML
        var modal_html = require('./modal.html').default;
        const mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light';
        const response = await fetch('https://searchspring.github.io/snap/v3pv-test'); //TODO: REMOVE DEBUG
        // const response = await fetch('https://searchspring.github.io/angular-drafts/sites/' + window.SearchSpring?.Catalog.site.id + '/' + (preview || cookie) + '-meta.js');
        const error = response.status != '200';
        const meta = error ? {} : await response.json();
        const props = {
            mode_class: (error && ' ss__branch-override--error') || (mode == 'dark' && ' ss__branch-override--dark') || '',
            logo_src: (mode == 'dark' || error) ? 'https://snapui.searchspring.io/searchspring_light.svg':'https://snapui.searchspring.io/searchspring.svg',
            preview: error ? "branch not found": preview || cookie,
            time: error ? preview || cookie : meta.time || "V3 Preview", //TODO: add time func or erase
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

//Helpers
function getCookie(name){
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.at(0)?.split('=')[1] || '';
}

function setCookie(name, value){
    document.cookie = name + '=' + value + '; path=/;';
}