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

    //send the size of the window
    socket.emit('message', msg);
    var iframepos = $("#frame").position();
    let iframe = $('#frame').contents().find('html');
    let source = Rx.Observable.fromEvent(window, 'resize')
        .map(e => {
            return {
                width:e.target.window.innerWidth,
                height: e.target.window.innerHeigh
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
    console.log("### onNextResize", value)
    let wSize = { width: window.innerWidth, height: window.innerHeight }

    resizeFrameContainer(wSize)

    let msg = { 'event': 'resize', 'value': wSize }
    socket.emit('message', msg)

}
function runMe() {
    let circle = document.getElementById('circle')
    if (!circle) return

    var iframepos = $("#frame").position();
    let iframe = $('#frame').contents().find('html');
    // $('#frame').contents().find('html').on('mousemove', function (e) { 
    //     var x = e.clientX + iframepos.left; 
    //     var y = e.clientY + iframepos.top;
    //     console.log(x + " " + y);
    // })

    //let source = Rx.Observable.fromEvent(document, 'mousemove')
    let source = Rx.Observable.fromEvent(iframe, 'mousemove')
        .map(e => {
            return {
                x: e.clientX + iframepos.left,
                y: e.clientY + iframepos.top
            }
        })
        .delay(300)
    // .map(e => {
    //     return {
    //         x: e.clientX,
    //         y: e.clientY
    //     }
    // })
    // .delay(300)

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
    circle.style.left = "" + value.x + "px"
    circle.style.top = "" + value.y + "px"
    console.log("### Emitted", value)
    let msg = { 'event': 'mousemove', 'value': value }
    socket.emit('message', msg)

}

function onMessage() {

    socket.on('message', function (msg) {
        if (!msg || Object.keys(msg).length === 0) return;
        let value = msg;
        switch (msg.event) {
            case 'mousemove':
                console.log('##RECEIVED: ', msg)
                let circle = document.getElementById('circle')
                if (!circle) return
                circle.style.left = "" + msg.value.x + "px"
                circle.style.top = "" + msg.value.y + "px"
                break;
            case 'windowsize':
                console.log('##Received window Size: ', msg)
                let wSize = { width: Math.min(msg.value.width, window.innerWidth), height: Math.min(msg.value.height, window.innerHeight) }
                console.log('### Got min size window: ', wSize)
                resizeFrameContainer(wSize);
            case 'resize':
                wSize = { width: Math.min(msg.value.width, window.innerWidth), height: Math.min(msg.value.height, window.innerHeight) }
                resizeFrameContainer(wSize);
            break;
            default:
                break;
        }


    });
}




init()
let sender = $('#sender')
sender.change((event) => {
    if (event.target.checked) {
        runMe()
    }
})

onMessage()


// let receiver = $('#receiver')
// receiver.change((event) => {
//     if (event.target.checked) {
//         socket.on('message', function (msg) {
//             let value = msg;
//             console.log('##RECEIVED: ', msg)
//             let circle = document.getElementById('circle')
//             if (!circle) return
//             circle.style.left = "" + value.x + "px"
//             circle.style.top = "" + value.y + "px"
//             console.log("### Emitted", value)
//             //socket.emit('message', value)
//         });
//     }
// })


