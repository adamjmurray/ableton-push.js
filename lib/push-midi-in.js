// run with node-babel for ES6 syntax!
let midi = require('midi'),
    log = console.log;

export class PushMidiIn {

  constructor(portname) {
    let midiInput = new midi.input(),
        portCount = midiInput.getPortCount();
    for(let i=0; i<portCount; i++) {
      if(midiInput.getPortName(i) === portname) {
        log('opening MIDI port', midiInput.getPortName(i));
        midiInput.openPort(i);
        process.on('SIGINT', () => midiInput.closePort());
      }
    }
    midiInput.on('message', this.message.bind(this));
  }

  static toXYAmount(pitch, velocity) {
    return [
      (pitch - 36) % 8,
      7 - Math.floor((pitch - 36) / 8),
      velocity / 127
    ];
  }

  message(deltaTime, [byte1,byte2,byte3]) {
    switch(byte1) {
      case 0x80: this.noteOff(byte2,byte3); break;
      case 0x90: this.noteOn(byte2,byte3); break;
      case 0xB0: this.control(byte2,byte3); break;
      case 0xA0: this.pressure(byte2,byte3); break;
      case 0xE0: this.bend(byte2+(byte3<<7)); break;
    }
  }

  noteOn(pitch, velocity) {
    // log('noteon:', pitch, velocity);
    if(pitch >= 36 && pitch < 100) {
      this.gridOn(...PushMidiIn.toXYAmount(pitch,velocity));
    }
    else if(pitch >= 0 && pitch < 9) {
      this.continuousRotaryPress(pitch, velocity/127);
    }
    else if(pitch === 9 || pitch === 10) {
      this.steppedRotaryPress(10-pitch, velocity/127)
    }
    else if(pitch === 12) {
      this.touchStripPress(velocity/127);
    }
  }

  noteOff(pitch, velocity) {
    if(pitch >= 36 && pitch < 100) {
      this.gridOff(...PushMidiIn.toXYAmount(pitch,velocity));
    }
    // log('noteoff:', pitch, velocity);
  }

  control(number, value) {
    log('control:', number, value);
  }

  pressure(pitch, pressure) {
    //log('pressure', pitch, pressure);
    this.gridPress(...PushMidiIn.toXYAmount(pitch,pressure));
  }

  bend(amount) {
    // log('bend:', amount);
    this.touchStripSlide(amount/16383);
  }

  gridOn(x, y, amount) {
    log(`gridOn: [${x},${y}], ${amount}`);
  }

  gridPress(x, y, amount) {
    log(`gridPress: [${x},${y}], ${amount}`);
  }

  gridOff(x, y) {
    log(`gridOff: [${x},${y}]`);
  }

  touchStripPress(amount) {
    log('touchStripPress:', amount);
  }

  touchStripSlide(amount) {
    log('touchStripSlide:', amount)
  }

  continuousRotaryPress(index, amount) {
    log(`continuousRotaryPress: [${index}], ${amount}`);
  }

  steppedRotaryPress(index, amount) {
    log(`steppedRotaryPress: [${index}], ${amount}`);
  }
}



