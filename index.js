// run with node-babel for ES6 syntax!

import {PushMidiIn} from './lib/push-midi-in';
import {PushMidiOut} from './lib/push-midi-out';
import {COLORS} from './lib/push-colors';
import * as PushText from './lib/push-text';

let portName = 'Ableton Push User Port',
    pushMidiIn = new PushMidiIn(portName),
    pushMidiOut = new PushMidiOut(portName);

//for(let y=0; y<8; y++) {
//  for(let x=0; x<8; x++) {
//    pushMidiOut.gridButton(x,y,x+y*8);
//  }
//}

pushMidiOut.gridClear();

pushMidiOut.gridButton(0,0, COLORS.RED);
pushMidiOut.gridButton(1,0, COLORS.highlight(COLORS.RED));
pushMidiOut.gridButton(0,1, COLORS.dim(COLORS.RED));
pushMidiOut.gridButton(0,2, COLORS.dimmer(COLORS.RED));

pushMidiOut.lcdRow(0, 'hello world');
pushMidiOut.lcdRow(1, 'just testing');
pushMidiOut.lcdRow(2, Object.values(PushText.CHARS).join(''));
pushMidiOut.lcdRow(3, '↑↓≡┣┫║╍⏍¦°ÄÇÖÜßàäçèéêîñö÷øü♭…█→←▶');

