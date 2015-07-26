import * as MIDI from './midi-constants';
let midi = require('midi');

function toXYAmount(pitch, velocity) {
  return [
    (pitch - 36) % 8,
    7 - Math.floor((pitch - 36) / 8),
    velocity / 127
  ];
}

function toRotaryTurnValue(value) {
  if(value > 64) {
    return value - 128;
  }
  else return value;
}


class MidiInputInterpreter {

  constructor(pushInput) {
    this.grid = pushInput.grid;
    this.rotary = pushInput.rotary;
    this.ribbon = pushInput.ribbon;
    this.button = pushInput.button;

    pushInput.midiInput.on('message', (deltaTime, [byte1,byte2,byte3]) => {
      switch(byte1) {
        case MIDI.NOTE_OFF:
          this.onNoteOff(byte2, byte3);
          break;

        case MIDI.NOTE_ON:
          this.onNoteOn(byte2, byte3);
          break;

        case MIDI.CONTROL_CHANGE:
          this.onControlChange(byte2, byte3);
          break;

        case MIDI.POLY_PRESSURE:
          this.onPolyPressure(byte2, byte3);
          break;

        case MIDI.PITCH_BEND:
          this.onPitchBend( byte2+(byte3<<7) );
          break;

        default:
          console.error('Unexpected MIDI input message:',byte1,byte2,byte3);
      }
    });
  }

  onNoteOff(pitch, velocity) {
    if(pitch >= 36 && pitch < 100) {
      this.grid.onUp(...toXYAmount(pitch,velocity));
    }
    else console.error('unexpected noteOff', pitch);
  }

  onNoteOn(pitch, velocity) {
    if(pitch >= 36 && pitch < 100) {
      this.grid.onDown(...toXYAmount(pitch,velocity));
    }
    else if(pitch >= 0 && pitch <= 10) {
      velocity > 0 ? this.rotary.onDown(pitch) : this.rotary.onUp(pitch);
    }
    else if(pitch === 12) {
      velocity > 0 ? this.ribbon.onDown() : this.ribbon.onUp();
    }
    else console.error('unexpected noteOn', pitch);
  }

  onControlChange(number, value) {
    if(number >= 71 && number <= 79) {
      // make consistent with rotary.onDown/onUp indexes
      this.rotary.onTurn(number-71, toRotaryTurnValue(value));
    }
    else if(number >= 14 && number <= 15) {
      // make consistent with rotary.onDown/onUp indexes
      this.rotary.onTurn(24-number, toRotaryTurnValue(value));
    }
    if(number === 3 || number === 9 || // tap tempo and metronome (very upper left buttons)
      (number >= 116 && number <= 119) || // top 4 left buttons
      (number >= 85 && number <= 90) || // lower left buttons
      (number >= 20 && number <= 27) || // 1st button row below lcd
      (number >= 102 && number <= 109) || // 2nd button row below lcd
      (number >= 110 && number <= 115) || // very upper right buttons
      number === 28 || number <= 29 || // master and stop (above scene launch)
      (number >= 36 && number <= 43) || // scene launch
      (number >= 54 && number <= 63) || // top 10 right buttons
      (number >= 44 && number <= 53) // lower right buttons
    ) {
      value > 0 ? this.button.onDown(number) : this.button.onUp(number);
    }
    else console.error('unexpected controlChange', number);
  }

  onPolyPressure(pitch, pressure) {
    this.grid.onPress(...toXYAmount(pitch,pressure));
  }

  onPitchBend(amount) {
    this.ribbon.onSlide(amount/MIDI.MAX_PITCH_BEND);
  }
}


class Observable {
  constructor() {
    this.handlers = {};
  }
  on(event, handler) {
    let handlers = this.handlers[event] || (this.handlers[event] = []);
    handlers.push(handler);
  }
  fire(event, ...data) {
    (this.handlers[event] || []).forEach(handler => handler(...data));
  }
}


class PushGridInput extends Observable {
  onDown(x, y, amount) {
    this.fire('down', x, y, amount);
  }
  onUp(x, y) {
    this.fire('up', x, y);
  }
  onPress(x, y, amount) {
    this.fire('press', x, y, amount);
  }
}


class PushRotaryInput extends Observable {

  onDown(index) {
    this.fire('down', index);
  }

  onUp(index) {
    this.fire('up', index);
  }

  onTurn(index, amount) {
    this.fire('turn', index, amount);
  }
}


class PushRibbonInput extends Observable {
  onDown() {
    this.fire('down');
  }
  onUp() {
    this.fire('up');
  }
  onSlide(position) {
    this.fire('slide', position);
  }
}


class PushButtonInput extends Observable {
  // TODO: a lot more effort can be put into providing logical names for the various buttons,
  // instead of the somewhat arbitrary CC numbers (called "index" in this class))
  onDown(index) {
    this.fire('down', index);
  }
  onUp(index) {
    this.fire('up', index);
  }
}


export class PushInput {
  constructor(portName) {
    let midiInput = new midi.input(),
        portCount = midiInput.getPortCount();

    for(let i=0; i<portCount; i++) {
      if(midiInput.getPortName(i) === portName) {
        console.log('opening MIDI in port', midiInput.getPortName(i));
        midiInput.openPort(i);
        process.on('SIGINT', () => midiInput.closePort());
      }
    }

    this.midiInput = midiInput;
    this.grid = new PushGridInput();
    this.rotary = new PushRotaryInput();
    this.ribbon = new PushRibbonInput();
    this.button = new PushButtonInput()

    new MidiInputInterpreter(this);
  }
}
