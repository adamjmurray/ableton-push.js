// run with node-babel for ES6 syntax!

import {PushInput} from './lib/push-input';
import {PushOutput} from './lib/push-output';
import {PushLogger} from './lib/push-logger';
import {PushColors} from './lib/push-colors';
import * as PushText from './lib/push-text';

let portName = 'Ableton Push User Port',
    pushInput = new PushInput(portName),
    pushOutput = new PushOutput(portName),
    log = console.log,
    {highlight,dim,dimmer} = PushColors;

pushOutput.grid.clear();
pushOutput.lcd.clear();

//pushOutput.grid.button(0,0, PushColors.RED);
//pushOutput.grid.button(1,0, highlight(PushColors.RED));
//pushOutput.grid.button(0,1, dim(PushColors.RED));
//pushOutput.grid.button(0,2, dimmer(PushColors.RED));
//
//pushOutput.lcd.row(0, 'hello world');

new PushLogger(pushInput); // , {exclude:'grid.press'});

