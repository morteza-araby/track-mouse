//http://www.jacklmoore.com/notes/mouse-position/
//https://www.kirupa.com/html5/get_element_position_using_javascript.htm
//http://stackoverflow.com/questions/5645485/detect-mousemove-when-over-an-iframe


import Rx from "rxjs/Rx"
var socket = io('http://localhost:1340');

function init() {
    socket.on('connected', (msg) => {
        console.log('connected: ', msg);
        let result = JSON.stringify(msg);
    });

    let value = { width: window.innerWidth, height: window.innerHeight }
    let msg = { 'event': 'windowsize', 'value': value }

    let iframe = document.getElementById('frame');
    bubbleIframeMouseMove(iframe);

    //send the size of the window
    socket.emit('message', msg);
    resizeObservable();
}

function resizeObservable() {   
    let source = Rx.Observable.fromEvent(window, 'resize')
        .map(e => {
            return {
                width: e.target.window.innerWidth,
                height: e.target.window.innerHeight
            }
        })
        .delay(300)

    source.subscribe(
        onNextResize,
        e => console.error('error ', e),
        () => console.info('complete')
    )
}

function onNextResize(value) {
    //console.log("### onNextResize", value)
    var iframepos = getIframePosition('documentSharePlayground.html');
    //let wSize = { width: window.innerWidth - iframepos.left, height: window.innerHeight - iframepos.top }
    //let wSize = { width: value.width, height: value.height }
    let wSize = { width: Math.min(lastRemoteSize.width, value.width), height: Math.min(lastRemoteSize.height, value.height) }    
    resizeFrameContainer(wSize);
    let msg = { 'event': 'resize', 'value': wSize }
    socket.emit('message', msg)

}
function runMe() {
    let circle = document.getElementById('circle')
    if (!circle) return

    var iframepos = getIframePosition('documentSharePlayground.html');

    let iframe = document.getElementById('frame');
    


    //let iframe = $('#frame').contents().find('html');
    // $('#frame').contents().find('html').on('mousemove', function (e) { 
    //     var x = e.clientX + iframepos.left; 
    //     var y = e.clientY + iframepos.top;
    //     console.log(x + " " + y);
    // })

    //let source = Rx.Observable.fromEvent(document, 'mousemove')
    let source = Rx.Observable.fromEvent(iframe, 'mousemove')
        .map(e => {
            return {
                x: e.clientX,
                y: e.clientY + iframepos.top
            }
        })
        .delay(300)
    source.subscribe(
        onNext,
        e => console.error('error ', e),
        () => console.info('complete')
    )
}

function resizeFrameContainer(size) {
    //Set the size of the container to minimum size
    let fc = document.getElementById('frameContainer');
    fc.style.width = "" + size.width + "px";
    fc.style.height = "" + size.height + "px";
}


function onNext(value) {
    if (!circle) return

    var iframepos = getIframePosition('documentSharePlayground.html');
    let x = value.x + iframepos.left
    let y = value.y
    circle.style.left = "" + x + "px"
    circle.style.top = "" + y + "px"
    let msg = { 'event': 'mousemove', 'value': value }
    socket.emit('message', msg)
}

function onMessage() {
    socket.on('message', function (msg) {
        if (!msg || Object.keys(msg).length === 0) return;
        let value = msg;
        let wSize = { width: window.innerWidth, height: window.innerHeight }
        switch (msg.event) {
            case 'mousemove':
                console.log('##RECEIVED: ', msg)
                let circle = document.getElementById('circle')
                if (!circle) return
                var iframepos = getIframePosition('documentSharePlayground.html');
                let x = msg.value.x + iframepos.left
                let y = msg.value.y
                circle.style.left = "" + x + "px"
                circle.style.top = "" + y + "px"
                break;
            case 'windowsize':
                console.log('##Received window Size: ', msg)
                wSize = { width: Math.min(msg.value.width, window.innerWidth), height: Math.min(msg.value.height, window.innerHeight) }
                console.log('### Got min size window: ', wSize)
                let m = { 'event': 'resize', 'value': wSize }
                resizeFrameContainer(wSize);
                socket.emit('message', m);
            case 'resize':
                wSize = { width: Math.min(msg.value.width, window.innerWidth), height: Math.min(msg.value.height, window.innerHeight) }
                lastRemoteSize = msg.value;
                resizeFrameContainer(msg.value);
                break;
            default:
                break;
        }

    });
}

function bubbleIframeMouseMove(iframe){
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
            e.clientX ,//+ boundingClientRect.left, 
            e.clientY ,//+ boundingClientRect.top, 
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

function getIframePosition(url) {
    let ifr = getIframRect(url);
    if (ifr) {
        return { 'left': ifr.left, 'top': ifr.top }
    } else {
        console.log("### No iframe found:");
        return null;
    }
}

let lastRemoteSize = { width: window.innerWidth, height: window.innerHeight }

init()
let sender = $('#sender')
sender.change((event) => {
    if (event.target.checked) {
        runMe()
    }
})

onMessage();

////If we want to sender control the size change
// let receiver = $('#receiver')
// receiver.change((event) => {
//     if (event.target.checked) {
//         onMessage()
//     }
// })




