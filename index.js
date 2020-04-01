var socket = io('http://localhost:12345')
socket.emit('getRoms')
var keyState = new Array(16)
keyState.fill(false)
const PIXEL_SIZE = 10
let romsList = []
let ctx = document.getElementById('canvas')
let canvas = ctx.getContext('2d')
let width = ctx.width = 640
let height = ctx.height = 320
let cols = width / PIXEL_SIZE
let rows = height / PIXEL_SIZE
let canUpdate = true
let isHoldingKey = false
var audioCtx
const wrapper = document.getElementById('wrapper');
let romSelecter =  document.getElementsByTagName('select')[0]
let pauseButton = document.getElementById('pause')
let continueButton = document.getElementById('continue')

pauseButton.onclick = () => { 
    socket.emit('pause', false)
}
continueButton.onclick = () => { 
    socket.emit('pause', true)
}
romSelecter.onmousedown = () => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
   if(canUpdate){
    romsList.forEach(rom => {
        let optionNode = document.createElement('option')
        optionNode.text = rom
        romSelecter.appendChild(optionNode)
     })
   }
   canUpdate = false
}
romSelecter.onchange = () => {
    socket.emit('loadRom', this.event.target.value)
    romSelecter.blur()
    isRunning = true
}

wrapper.addEventListener('mousedown', (event) => {
    const isButton = event.target.nodeName === 'BUTTON';
  if (!isButton) {
    return;
  }
  keyStateManager(event.target.innerHTML, 'down')
})
wrapper.addEventListener('mouseup', (event) => {
  const isButton = event.target.nodeName === 'BUTTON';
  if (!isButton) {
    return;
  }
  keyStateManager(event.target.innerHTML, 'up')
})

window.addEventListener('keydown', evt => {
    if(!isHoldingKey) keyStateManager(keyBinder(evt.key), 'down')
    isHoldingKey = true
})
window.addEventListener('keyup', evt => {
    keyStateManager(keyBinder(evt.key), 'up')
    isHoldingKey = false
})

socket.on('getRomsResponse', romsListFetched => {
    romsList = romsListFetched
})  

socket.on('display', (data)=>{
   drawCanvas(data)
})

socket.on('beep', ()=>{
    beep(200)
})

function drawCanvas(raster){
    canvas.fillStyle = "#0F0F0F"
    canvas.fillRect(0,0,width,height)
    let x = y = 0
    
    raster.data.forEach( (pixel, i) => {
        if (pixel) {
            x = i % cols
            y = Math.floor(i / cols)
            canvas.fillStyle = '#D6D6D6'
            canvas.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
        }
    })

}

function keyStateManager(key, event){
    let keyValue = parseInt(key, 16)
    if (event == 'down'){
        keyState[keyValue] = true
        highlightKeyManager(keyValue, true)
        socket.emit('keyStateUpdate', {value: keyValue, state: true})
    } else if (event == 'up'){
        keyState[keyValue] = false
        highlightKeyManager(keyValue, false)
        socket.emit('keyStateUpdate',  {value: keyValue, state: false})
   }

}

function keyBinder(key){
  
    if(key == '4'){
        return 'C'
    }

    if(key == 'q'){
        return 4
    }
    if(key == 'w'){
        return 5
    }
    if(key == 'e'){
        return 6
    }
    if(key == 'r'){
        return 'D'
    }
    if(key == 'a'){
        return 7
    }
    if(key == 's'){
        return 8
    }
    if(key == 'd'){
        return 9
    }
    if(key == 'f'){
        return 'E'
    }
    if(key == 'z'){
        return 'A'
    }
    if(key == 'x'){
        return 0
    }
    if(key == 'c'){
        return 'B'
    }
    if(key == 'v'){
        return 'F'
    } 

    return key
}

function highlightKeyManager(keyValue, highlight){
    let buttonsList = wrapper.getElementsByTagName('button')
    for(let index = 0;index < buttonsList.length;index++){
        let button = buttonsList[index]
        if(button.id != 'continue'){
            if(parseInt(button.innerHTML, 16) == keyValue && highlight){
                button.style.backgroundColor = '#fff'
                button.style.color = '#000'
                button.style.boxShadow = 'none'
            } else if (parseInt(button.innerHTML, 16) == keyValue && !highlight){
                button.style.backgroundColor = '#36B300'
                button.style.color = '#fff'
                button.style.boxShadow = '2px 1px 1px white'
            }
        }
    }
}

var beep = (function () {
    var ctxClass = window.audioContext ||window.AudioContext || window.AudioContext || window.webkitAudioContext
    var ctx = new ctxClass()
    return function (duration, type, finishedCallback) {

        duration = +duration;

        // Only 0-4 are valid types.
        type = (type % 5) || 0

        if (typeof finishedCallback != "function") {
            finishedCallback = function () {}
        }

        var osc = ctx.createOscillator()

        
        osc.type = "sine";
        osc.connect(ctx.destination)
        if (osc.noteOn) osc.noteOn(0)
        if (osc.start) osc.start()

        setTimeout(function () {
            if (osc.noteOff) osc.noteOff(0)
            if (osc.stop) osc.stop()
            finishedCallback()
        }, duration)

    };
})();
