var el = document.createElement('script');

el.src = '<%= path %>/app.js';
document.body.appendChild(el);


function onElementHeightChange(elm, callback) {
    var lastHeight = elm.clientHeight, newHeight;
    (function run(){
        newHeight = elm.clientHeight;
        if( lastHeight != newHeight )
            callback();
        lastHeight = newHeight;

        if( elm.onElementHeightChangeTimer )
            clearTimeout(elm.onElementHeightChangeTimer);

        elm.onElementHeightChangeTimer = setTimeout(run, 250);
    })();
}

if (window.frameElement) {

    // console.log("We are inside an iframe universe.")
    document.querySelector(".interactive-container").style.overflow = "hidden";
    document.querySelector(".interactive-container").style.borderTop = "solid 1px #dfdfdf";
    document.querySelector(".interactive-container").style.borderBottom = "solid 1px #dfdfdf";
    document.querySelector(".interactive-container").style.paddingTop = "2px";
    document.querySelector("#controls").style.maxWidth = "none";

    onElementHeightChange(document.body, function() {
        window.frameElement.height = document.body.offsetHeight + 150
    });

}