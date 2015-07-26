export class PushLogger {

  constructor(pushMidiInput, {log=console.log, exclude=[]}={}) {
    if(!exclude.includes('grid.down')) {
      pushMidiInput.grid.on('down', (x,y,amount) => {
        log(`grid[${x},${y}].down(${amount.toFixed(2)})`);
      });
    }
    if(!exclude.includes('grid.up')) {
      pushMidiInput.grid.on('up', (x,y) => {
        log(`grid[${x},${y}].up`);
      });
    }
    if(!exclude.includes('grid.press')) {
      pushMidiInput.grid.on('press', (x,y,amount) => {
        log(`grid[${x},${y}].press(${amount.toFixed(2)})`);
      });
    }

    if(!exclude.includes('rotary.down')) {
      pushMidiInput.rotary.on('down', (index) => {
        log(`rotary[${index}].down`);
      });
    }
    if(!exclude.includes('rotary.up')) {
      pushMidiInput.rotary.on('up', (index) => {
        log(`rotary[${index}].up`);
      });
    }
    if(!exclude.includes('rotary.turn')) {
      pushMidiInput.rotary.on('turn', (index,amount) => {
        log(`rotary[${index}].turn(${amount})`);
      });
    }

    if(!exclude.includes('touchStrip.down')) {
      pushMidiInput.ribbon.on('down', () => {
        log('ribbon.down');
      });
    }
    if(!exclude.includes('touchStrip.up')) {
      pushMidiInput.ribbon.on('up', () => {
        log('ribbon.up');
      });
    }
    if(!exclude.includes('touchStrip.slide')) {
      pushMidiInput.ribbon.on('slide', (position) => {
        log(`ribbon.slide(${position})`)
      });
    }

    if(!exclude.includes('button.down')) {
      pushMidiInput.button.on('down', (index) => {
        log(`button[${index}].down`);
      });
    }
    if(!exclude.includes('button.up')) {
      pushMidiInput.button.on('up', (index) => {
        log(`button[${index}].up`);
      });
    }
  }

}