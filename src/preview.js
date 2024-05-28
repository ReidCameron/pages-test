var base = 'https://reidcameron.github.io/pages-test/'; //TODO: Debug - https://searchspring.github.io/angular-drafts/sites/;
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
                    node.setAttribute('external', base + 'sites/' + (node.getAttribute('searchspring') || node.src.slice(-6)) + '/' + (preview || cookie) + '.js');
                    observer.disconnect();
                }
            }
        }
    });
    observer.observe(document, {childList: true, subtree: true});

    //Set Cookie to make preview persistable
    if(preview) setCookie('ssPreviewOverride', preview);

    //Add Modal Script
    var script = document.createElement('script');
    script.src = base + 'preview-modal.js';
    script.setAttribute('data-preview', preview || cookie);
    document.currentScript.after(script);
})()

//Helpers
function getCookie(name){
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.at(0)?.split('=')[1] || '';
}

function setCookie(name, value){
    document.cookie = name + '=' + value + '; path=/;';
}