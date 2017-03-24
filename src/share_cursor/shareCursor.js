
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
    let msg = { 'event': 'windowsize', 'value': value }

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
        // if (me) {
        //     size = { x: update.value.x, y: update.value.y }
        // } else {
        //     size = { x: update.value.x + iframepos.left, y: update.value.y + iframepos.top }
        // }

        switch (update.value.event) {
            case 'mousemove':
                iframepos = getIframePosition('frame');
                // if (me) {
                //     
                // size = { x: update.value.value.x + iframepos.left, y: update.value.value.y +100 }
                // } else {
                //     size = { x: update.value.value.x , y: update.value.value.y }
                // }
                size = { x: update.value.value.x + iframepos.left, y: update.value.value.y +100 }
                //size = { x: update.value.value.x, y: update.value.value.y }
                updateEl.style.left = size.x + 'px'
                updateEl.style.top = size.y + 'px'
                break;
            case 'windowsize':
                console.log('##Received window Size: ', update)
                iframepos = getIframePosition('frame');
                size = { width: Math.min(update.value.value.width, window.innerWidth), height: Math.min(update.value.value.height, window.innerHeight) }
                console.log('### Got min size window: ', size)
                let payload = { 'event': 'resize', 'value': size }
                resizeFrameContainer(size);
                data.set(call.ownId, payload)
            case 'resize':
             console.log('##Received resize: ', update)
                iframepos = getIframePosition('frame');
                size = { width: Math.min(update.value.value.width, window.innerWidth), height: Math.min(update.value.value.height, window.innerHeight) }
                lastRemoteSize = update.value.value;
                resizeFrameContainer(update.value.value);
                break;
            default:
                break;
        }


    })

    iframe.addEventListener('mousemove', function (event) {
        //if (event.target === el.shareBox) {
            iframepos = getIframePosition('frame');
            //console.log("### iframpos: ", iframepos);
        let payload = {
            'event': 'mousemove',
            //value: { x: event.clientX + iframepos.left, y: event.clientY + iframepos.top }
            value: { x: event.clientX , y: event.clientY }
        }
        data.set(call.ownId, payload)
        //}
    })

    window.addEventListener('resize', function (event) {
        //let wSize = { width: Math.min(lastRemoteSize.width, event.target.window.innerWidth), height: Math.min(lastRemoteSize.height, event.target.window.innerHeight) }
        //let wSize = { width: Math.min(event.target.window.innerWidth, window.innerWidth), height: Math.min( event.target.window.innerHeight, window.innerHeight) }
        let wSize = {width: event.target.window.innerWidth, height: event.target.window.innerHeight};
        resizeFrameContainer(wSize);
        
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
    //Set the size of the container to minimum size
    let fc = document.getElementById('frameContainer');
    fc.style.width = "" + size.width + "px";
    fc.style.height = "" + size.height + "px";
}
