
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

    var data = new cct.DataShare({ ownerId: call.ownId })
    call.attach('data', data)


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
                 $("#result").html("x:" + update.value.value.x + ", y:" + update.value.value.y + ", iframepos.top:" + iframepos.top +  ", iframepos.left:" + iframepos.left);
                updateEl.style.left =  "" + x + "px"
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
                console.log('##Received resize: ', update)
                iframepos = getIframePosition('frame');
                resizeFrameContainer(size);
                break;
            default:
                break;
        }
    })

    iframe.addEventListener('mousemove', function (event) {
        let payload = {
            'event': 'mousemove',
            value: { x: event.clientX, y: event.clientY }
        }
        data.set(call.ownId, payload)
    })

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
    logError('Error: ' + error)
})


function resizeFrameContainer(size) {
    //Set the size of the container
    let fc = document.getElementById('frameContainer');
    fc.style.width = "" + size.width + "px";
    fc.style.height = "" + size.height + "px";
}
