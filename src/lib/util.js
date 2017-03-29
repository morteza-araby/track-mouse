export function createSubscriber(tag) {
    return {
        next(item) { console.log(`${tag}.next,`, item) },
        error(error) { console.log(`${tag}.error ${error}`) },
        complete() { console.log(`${tag}.complete`) }
    }
}

export function bubbleIframeMouseMove(iframe){
    // Save any previous onmousemove handler
    var existingOnMouseMove = iframe.contentWindow.onmousemove;

    // Attach a new onmousemove listener
    iframe.contentWindow.onmousemove = function(e){
        // Fire any existing onmousemove listener 
        if(existingOnMouseMove) existingOnMouseMove(e);

        // Create a new event for the this window
        var evt = document.createEvent("MouseEvents");

        // We'll need this to offset the mouse move appropriately
        var boundingClientRect = iframe.getBoundingClientRect();

        // Initialize the event, copying exiting event values
        // for the most part
        evt.initMouseEvent( 
            "mousemove", 
            true, // bubbles
            false, // not cancelable 
            window,
            e.detail,
            e.screenX,
            e.screenY, 
            e.clientX,// + boundingClientRect.left,  
            e.clientY,// + boundingClientRect.top, 
            e.ctrlKey, 
            e.altKey,
            e.shiftKey, 
            e.metaKey,
            e.button, 
            null // no related element
        );

        // Dispatch the mousemove event on the iframe element
        iframe.dispatchEvent(evt);
    };
}

function getIframRect(url) {
    var iframes = window.parent.document.getElementsByTagName('iframe');
    var yourURL = null;//window.location.origin +'/documentSharePlayground.html';
    var iframe;
    if (url.includes('http')) {
        yourURL = url;
    } else {
        yourURL = window.location.origin + '/' + url;
    }
    for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].src === yourURL) {
            iframe = iframes[i];
            break;
        }
    }
    if (iframe) {
        let rect = iframe.getBoundingClientRect();
        return rect;
    } else {
        return null;
    }
}

export function getIframePosition(id) {
     var iframepos = $("#frame").position();
     return iframepos;

    // var body = document.body,
    // html = document.documentElement;
    
    // var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    // var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    
    // h = Math.max( body.scrollHeight, body.offsetHeight, 
    //                    html.clientHeight, html.scrollHeight, html.offsetHeight );
    // w = Math.max( document.documentElement["clientWidth"],
    // document.body["scrollWidth"],
    // document.documentElement["scrollWidth"],
    // document.body["offsetWidth"],
    // document.documentElement["offsetWidth"]
//);
    var documentWidth = parent.window.innerWidth;
       var documentHeight = parent.window.innerHeight;
       var iframeWidth = window.innerWidth;
       var iframeHeight = window.innerHeight;
       // Get Left Position
       var iframeX = window.parent.document.getElementById(id).offsetLeft;
       // Get Top Position
       var iframeY = window.parent.document.getElementById(id).offsetTop;
       return  { 'left': iframeX, 'top': iframeY}
}
export function getIframePositionx(url) {
    var iframepos = $("#frame").position();
    return iframepos;

    let ifr = getIframRect(url);
    if (ifr) {
        return { 'left': ifr.left, 'top': ifr.top}
    } else {
        console.log("### No iframe found:");
        return null;
    }
}

