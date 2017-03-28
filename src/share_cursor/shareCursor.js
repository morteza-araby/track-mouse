
import { bubbleIframeMouseMove, getIframePosition } from '../lib/util'


cct.log.setLogLevel('example', cct.log.ALL)
cct.log.color = true

var el = {
    exampleStatus: document.getElementById('exampleStatus'),
    instructions: document.getElementById('instructions'),
    shareBox: document.getElementById('shareBox'),
    self: document.getElementById('self'),
    remote: document.getElementById('remote'),
}

var client = new cct.Client()
let iframe = document.getElementById('frame');
bubbleIframeMouseMove(iframe);
var iframepos = getIframePosition('frame');
let lastRemoteSize = { width: window.innerWidth, height: window.innerHeight }
let sender = false;
let receiver = false;
var documentReader = null;
var documentRenderer = null;
var data = null;

function domSend(call) {
    if (sender) {

        iframe.src = "";
        iframe.src = "../documentSharePlayground.html";
        //     documentReader = new cct.DocumentReader();
        //      //documentReader.setWebMessagingSource(iframe, '*'); 
        //      documentReader.setImmediateSource(iframe, {scrollSyncSelector:'*'}); 
        //     call.attach('content', documentReader);

        //documentReader = new cct.DocumentReader();
        //call.attach('content', documentReader);
        // iframe.addEventListener('mousemove', function (event) {});
        // iframe.addEventListener('mousemove', function (event) {
        // let payload = {
        //     'event': 'mousemove',
        //     value: { x: event.clientX, y: event.clientY }
        // }
        // data.set(call.ownId, payload)
        //})
        iframe.addEventListener('load', (e) => {
            console.log('iframe loaded....', e);
            //var reader = new cct.dom.WebMessagingDocumentLinkSource(iframe, '*')
            documentReader = new cct.DocumentReader();
            documentReader.setWebMessagingSource(iframe, '*');
            call.attach('content', documentReader);

            bubbleIframeMouseMove(iframe);
            iframe.addEventListener('mousemove', function (event) {
                console.log('iframe mousemove....', event);
                let payload = {
                    'event': 'mousemove',
                    value: { x: event.clientX, y: event.clientY }
                }
                data.set(call.ownId, payload)

            });
        });

    } else {
        call.detach('content', documentReader);
        iframe.removeEventListener('load', () => { });
        iframe.removeEventListener('mousemove', function (event) {});
        iframe.src = "";
        documentReader = null;
    }
}
function domReceive(call) {
    if (receiver) {
        documentRenderer = new cct.DocumentRenderer()
        documentRenderer.setTarget(iframe)
        call.attach('content', documentRenderer);
        documentRenderer.on('readyState', function (documentRenderer) {
            console.log('Renderer documentRenderer: ' + documentRenderer)
        });
        //      iframe.addEventListener('mousemove', function (event) {
        //     let payload = {
        //         'event': 'mousemove',
        //         value: { x: event.clientX, y: event.clientY }
        //     }
        //     data.set(call.ownId, payload)

        // })
    } else {
        documentRenderer.off('readyState', (documentRenderer) => {
            console.log('Renderer documentRenderer: ' + documentRenderer)
        });
        documentRenderer.setTarget(null);
        documentRenderer = null;
        call.detach('content', documentRenderer);
    }

}

PeerConnecter.clientInCall(client).then(function (connecter) {
    var call = connecter.call

    call.on('connectionState', function (connectionState) {
        if (connectionState === 'connected') {
            el.exampleStatus.textContent = 'Sharing enabled'
            el.instructions.textContent = 'Move your mouse inside the grey box to send cursor data.'
        } else {
            el.exampleStatus.textContent = ''
            el.instructions.textContent = ''
        }
    })

    data = new cct.DataShare({ ownerId: call.ownId })
    call.attach('data', data)
    window.call = call;
    console.log("caller: ", call.ownId, call.peerId);
    // if (call.peerId) {
    //     sender = true;
    //     domSend(call);
    //     document.getElementById('sender').checked = true;
    // } else {
    //     receiver = true;
    //     domReceive(call);
    //     document.getElementById('receiver').checked = true;
    // }
    //checkbox
    document.getElementById('sender').onchange = function (event) {
        sender = event.target.checked;
        domSend(call);
    }
    document.getElementById('receiver').onchange = function (event) {
        receiver = event.target.checked;
        domReceive(call);
    }



    let value = { width: window.innerWidth, height: window.innerHeight }
    //let msg = { 'event': 'windowsize', 'value': value }

    //send the size of the window    
    let payload = {
        'event': 'windowsize',
        value: value
    }
    data.set(call.ownId, payload)

    data.on('update', function (update) {
        let me = (call.ownId === update.key) ? true : false
        var updateEl = update.key === call.ownId ? el.self : el.remote
        let size = {}
        switch (update.value.event) {
            case 'mousemove':
                var iframepos = getIframePosition('frame');
                let x = update.value.value.x + iframepos.left
                let y = update.value.value.y + iframepos.top
                //console.log("##x, y: ", x, y)
                $("#result").html("x:" + update.value.value.x + ", y:" + update.value.value.y + ", iframepos.top:" + iframepos.top + ", iframepos.left:" + iframepos.left);
                updateEl.style.left = "" + x + "px"
                updateEl.style.top = "" + y + "px"
                break;
            case 'windowsize':
                if (!me) {
                    lastRemoteSize = update.value.value;
                    console.log('##Received window Size Others: ', size)
                }
                size = { width: Math.min(lastRemoteSize.width, window.innerWidth), height: Math.min(lastRemoteSize.height, window.innerHeight) }
                let payload = { 'event': 'resize', 'value': size }
                resizeFrameContainer(size);
                data.set(call.ownId, payload)
            case 'resize':
                if (!me) {
                    lastRemoteSize = update.value.value;
                }
                size = { width: Math.min(lastRemoteSize.width, window.innerWidth), height: Math.min(lastRemoteSize.height, window.innerHeight) }
                iframepos = getIframePosition('frame');
                resizeFrameContainer(size);
                break;
            default:
                break;
        }
    })

    // iframe.addEventListener('mousemove', function (event) {
    //     let payload = {
    //         'event': 'mousemove',
    //         value: { x: event.clientX, y: event.clientY }
    //     }
    //     data.set(call.ownId, payload)

    // })

    window.addEventListener('resize', function (event) {
        let wSize = { width: event.target.window.innerWidth, height: event.target.window.innerHeight };
        let payload = {
            'event': 'resize',
            value: wSize
        }
        data.set(call.ownId, payload)
    })
}).catch(function (error) {
    cct.log.error('example', '' + error)
    console.log('Error: ', error)
})


function resizeFrameContainer(size) {
    //Set the size of the container
    let fc = document.getElementById('frameContainer');
    fc.style.width = "" + size.width + "px";
    fc.style.height = "" + size.height + "px";
}
