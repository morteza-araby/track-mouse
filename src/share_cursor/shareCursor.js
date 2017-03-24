
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
var iframepos = getIframePosition('documentSharePlayground.html');

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

    data.on('update', function (update) {
        let me = call.ownId ? true : false
        var updateEl = update.key === call.ownId ? el.self : el.remote
        let size = {}
        if (me) {
            size = { x: update.value.x, y: update.value.y }
        } else {
            size = { x: update.value.x + iframepos.left, y: update.value.y + iframepos.top }
        }
        updateEl.style.left = size.x + 'px'
        updateEl.style.top = size.y + 'px'
    })




    iframe.addEventListener('mousemove', function (event) {
        //if (event.target === el.shareBox) {
        data.set(call.ownId, { x: event.clientX + event.target.offsetLeft, y: event.clientY + 100 })
        //}
    })
}).catch(function (error) {
    cct.log.error('example', '' + error)
    logError('Error: ' + error)
})