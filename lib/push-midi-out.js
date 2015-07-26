// run with node-babel for ES6 syntax!
let midi = require('midi'),
    log = console.log;
import * as PushText from './push-text';

export class PushMidiOut {

  constructor(portName) {
    let midiOutput = new midi.output(),
        portCount = midiOutput.getPortCount();
    for(let i=0; i<portCount; i++) {
      if(midiOutput.getPortName(i) === portName) {
        log('opening MIDI out port', midiOutput.getPortName(i));
        midiOutput.openPort(i);
        process.on('SIGINT', () => midiOutput.closePort());
      }
    }
    this.midiOutput = midiOutput;
  }

  send(...bytes) {
    this.midiOutput.sendMessage(bytes);
  }

  gridButton(x,y,color) {
    let pitch = 36 + x + (7-y)*8;
    this.send(0x90,pitch,color);
  }

  gridClear() {
    for(let y=0; y<8; y++) {
      for(let x=0; x<8; x++) {
        this.gridButton(x,y,0);
      }
    }
  }

  lcdRow(index, text='') {
    if(index !== 0 && index !== 1 && index !== 2 && index !== 3) return;
    let bytes = [240, 71, 127, 21, 24+index, 0, 69, 0];
    for(let i=0; i<68; i++) {
      let charCode = PushText.MAPPING[text.charAt(i)];
      if(isNaN(charCode)) {
        charCode = text.charCodeAt(i);
        if(isNaN(charCode) || charCode > 127) {
          // convert non-displayable characters to spaces
          charCode = 32;
        }
      }
      bytes.push(charCode);
    }
    bytes.push(247);
    this.send(...bytes);
  }

  lcdClearRow(index) {
    if(index !== 0 && index !== 1 && index !== 2 && index !== 3) return;
    this.send(...[240, 71, 127, 21, 28+index, 0, 0, 247]);
  }

  lcdClear() {
    for(let i=0; i<4; i++) {
      this.lcdClearRow(i);
    }
  }
}



