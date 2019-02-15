'use strict';

const VERSION = '0.7';

// Set up the canvases: one for the image, one for the turtle atop it (this means we only need to
// routinely clear the turtle's canvas)
const imageCanvas = document.getElementById('image');
const turtleCanvas = document.getElementById('turtle');
const imageCx = image.getContext('2d');
const turtleCx = turtleCanvas.getContext('2d');

// Fake-focus input used to trick mobile devices into showing soft-keyboards
const fakeFocus = document.getElementById('fake-focus');

// Buttons and their results
const resetBtn = document.getElementById('reset');
const showCode = document.getElementById('show-code');
const showHelp = document.getElementById('show-help');
const code = document.getElementById('code');
const runCode = document.getElementById('run-code');
const help = document.getElementById('help');

// Set up the console
const trrtlConsole = document.getElementById('console');
let trrtlCommandBuffer = false; // false = don't accept input, string = input value

// Set up constants for turtle size etc.
const turtleWidth = 15, turtleHeight = 20;
const turtleLegLength = Math.sqrt(Math.pow(turtleWidth / 2, 2) * 2);
const turtleUpstretch = turtleHeight - (turtleWidth / 2);

// Command constants
const up = false;
const hide = false;
const down = true;
const show = true;

// Store command history
let commandHistory = [];

// Degrees to Radians
const deg2rad = deg=>deg*0.017453292519943295;

// Handle resizing of the viewport
const resize = ()=>{
  imageCanvas.width = imageCanvas.offsetWidth;
  imageCanvas.height = imageCanvas.offsetHeight;
  turtleCanvas.width = turtleCanvas.offsetWidth;
  turtleCanvas.height = turtleCanvas.offsetHeight;
};
//window.addEventListener('resize', resize);
resize();

// Set the turtle's starting location, pen colour etc.
const turtleStartX = Math.floor(turtleCanvas.width / 2), turtleStartY = Math.floor(turtleCanvas.height / 2);
let turtleX = turtleStartX, turtleY = turtleStartY, turtleAngle = 0;
let penPosition = down, penColor = 'white';

// Render loop
const render = ()=>{
  // Render the turtle
  turtleCx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  turtleCx.clearRect(0, 0, turtleCanvas.width, turtleCanvas.height);
  turtleCx.beginPath();
  turtleCx.moveTo(turtleX, turtleY);
  turtleCx.lineTo(turtleX + (Math.cos(deg2rad(turtleAngle + 45)) * turtleLegLength), turtleY + (Math.sin(deg2rad(turtleAngle + 45)) * turtleLegLength));
  turtleCx.lineTo(turtleX - (Math.cos(deg2rad(turtleAngle + 90)) * turtleUpstretch), turtleY - (Math.sin(deg2rad(turtleAngle + 90)) * turtleUpstretch));
  turtleCx.lineTo(turtleX - (Math.cos(deg2rad(turtleAngle - 45)) * turtleLegLength), turtleY - (Math.sin(deg2rad(turtleAngle - 45)) * turtleLegLength));
  turtleCx.lineTo(turtleX, turtleY);
  turtleCx.fill();
  window.requestAnimationFrame(render);
};
render();

// Commands
const forward = distance=>{
  imageCx.beginPath();
  imageCx.strokeStyle = penColor;
  imageCx.moveTo(turtleX, turtleY);
  turtleX = turtleX - (Math.cos(deg2rad(turtleAngle + 90)) * distance), turtleY = turtleY - (Math.sin(deg2rad(turtleAngle + 90)) * distance);
  if(penPosition == down) imageCx.lineTo(turtleX, turtleY);
  imageCx.stroke();
  imageCx.closePath();
};
const fwd = forward;
const fd = forward;

const backward = distance=>{
  imageCx.beginPath();
  imageCx.strokeStyle = penColor;
  imageCx.moveTo(turtleX, turtleY);
  turtleX = turtleX + (Math.cos(deg2rad(turtleAngle + 90)) * distance), turtleY = turtleY + (Math.sin(deg2rad(turtleAngle + 90)) * distance);
  if(penPosition == down) imageCx.lineTo(turtleX, turtleY);
  imageCx.stroke();
  imageCx.closePath();
};
const bwd = backward;
const bd = backward;

const right = deg=>{
  turtleAngle = (turtleAngle + deg) % 360;
};
const rt = right;

const left = deg=>{
  turtleAngle = (turtleAngle - deg) % 360;
};
const lt = left;

const arc = (deg,radius)=>{
  if(penPosition != down) return; // arc impossible with pen up
  imageCx.beginPath();
  imageCx.strokeStyle = penColor;
  imageCx.arc(turtleX, turtleY, radius, deg2rad((turtleAngle - 90) % 360), deg2rad((turtleAngle + deg - 90) % 360));
  imageCx.stroke();
  imageCx.closePath();
}

const pen = up_down=>{
  penPosition = up_down;
};

const color = color=>{
  penColor = color;
};
const colour = color;

const turtle = show_hide=>{
  turtleCanvas.style.display = (show_hide ? 'block' : 'none')
};

const clear = ()=>{
  imageCx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
};

const home = ()=>{
  turtleX = turtleStartX, turtleY = turtleStartY, turtleAngle = 0;
  pen(down);
  turtle(show);
  color('white');
}

const reset = ()=>{
  clear();
  home();
  commandHistory = [];
  saveCommandHistory();
};

const moveX = x=>{
  turtleX=turtleStartX+x;
}
const moveY = y=>{
  turtleY=turtleStartY+y;
}
const move = (x,y)=>{
  moveX(x); moveY(y);
}
const setAngle = angle=>turtleAngle=angle;

// Console
const print = string=>{
  trrtlConsole.innerText += `${string}\n`;
  trrtlConsole.scrollTop = trrtlConsole.scrollHeight; // scroll to bottom when outputting
};

const consoleAwaitCommand = ()=>{
  trrtlConsole.innerText += `> `;
  trrtlCommandBuffer = '';
  trrtlConsole.scrollTop = trrtlConsole.scrollHeight; // scroll to bottom when outputting
};

const executeCommand = (command, writeToHistory=true)=>{
  if(writeToHistory){
    commandHistory.push(command);
    saveCommandHistory();
  }
  try {
    return CoffeeScript.eval(command);
  } catch(err) {
    return err.message;
  }
}

// Writes the command history buffer, via ZIP compression and Base64-encoding, to the URL hash
const saveCommandHistory = ()=>{
  if(commandHistory.length == 0){
    window.location.hash = '';
    return;
  }
  const zip = new JSZip();
  zip.file('_', JSON.stringify(commandHistory)).generateAsync({type: 'base64'}).then(o=>window.location.hash=o);
}
// Loads the command history from the hash and executes it
const loadCommandHistory = ()=>{
  const o = window.location.hash.replace(/^#/,'');
  if(o == '') return;
  const zip = new JSZip();
  zip.loadAsync(o, {"base64": true}).then(f=>{
    f.files['_'].async('string').then(t=>{
      commandHistory = JSON.parse(t);
      commandHistory.forEach(c=>executeCommand(c, false)); // don't write to history when executing from load
    })
  });
}
// Monitor for 'execute' clicks from the help system
window.addEventListener('hashchange', e=>{
  if(help.classList.contains('visible')){
    loadCommandHistory();
    help.classList.remove('visible');
  }
});

const consoleExecuteCommand = ()=>{
  const command = trrtlCommandBuffer;
  trrtlCommandBuffer = false;
  let commandResult = '';
  try {
    commandResult = executeCommand(command)
  } catch (e) {
    console.log(e);
    commandResult = e.message;
  }
  if(commandResult){
    commandResult = `${commandResult}`;
    if(commandResult.length > 0); print(commandResult);
  }
  trrtlConsole.scrollTop = trrtlConsole.scrollHeight; // scroll to bottom when possibly outputting
  consoleAwaitCommand();
}

// Clicking on "reset" icon resets state
resetBtn.addEventListener('click', reset);

// Clicking on the "code" icon toggles visibility of the code editor
const toggleCodeEditor = ()=>{
  code.classList.toggle('visible');
  runCode.classList.toggle('visible', code.classList.contains('visible'));
  help.classList.remove('visible');
  setFakeFocus();
}
showCode.addEventListener('click', toggleCodeEditor);

// Clicking the "run" icon runs the code in the code editor
const runCodeInEditor = ()=>{
  code.classList.remove('visible');
  runCode.classList.remove('visible');
  setFakeFocus();
  const result = executeCommand(code.value);
  if(result) print(result);
};
runCode.addEventListener('click', runCodeInEditor);

// Clicking on the "help" icon toggles visibility of the help viewer
const toggleHelpEditor = ()=>{
  help.classList.toggle('visible');
  code.classList.remove('visible');
  runCode.classList.remove('visible');
}
showHelp.addEventListener('click', toggleHelpEditor);

// Convenience function: focusses on a fake <input> in order to trick
// mobile devices into showing a soft-keyboard. We try to deter
// autocompletion and autocapitalisation by e.g. making it a password field.
const setFakeFocus = ()=>{
  (code.classList.contains('visible') ? code : fakeFocus).focus();
}
fakeFocus.addEventListener('blur', setFakeFocus);
document.addEventListener('click', setFakeFocus);
setFakeFocus();

document.addEventListener('keydown', e=>{
  if(code.classList.contains('visible')) return; // don't intercept when code editor is open
  if(e.ctrlKey || e.altKey || e.metaKey) return; // don't intercept special keys probably meant for the browser
  if(/^F\d+$/.test(e.key)) return; // don't intercept function keys
  e.preventDefault();
  trrtlConsole.scrollTop = trrtlConsole.scrollHeight; // scroll to bottom when typing
  if(trrtlCommandBuffer === false) return; // don't accept input when busy
  if(e.keyCode == 8){
    // backspace
    if(trrtlCommandBuffer.length == 0) return; // don't accept delete when buffer empty
    trrtlCommandBuffer = trrtlCommandBuffer.substr(0, trrtlCommandBuffer.length - 1);
    trrtlConsole.innerText = trrtlConsole.innerText.substr(0, trrtlConsole.innerText.length - 1);
  } else if(e.keyCode == 9){
    // tab - show code editor
    toggleCodeEditor();
  } else if(e.keyCode == 13){
    // enter
    if(trrtlCommandBuffer.length == 0) return; // don't accept enter when buffer empty
    trrtlConsole.innerText += "\n";
    consoleExecuteCommand();
  } else if(e.key.length == 1) { // only add to the buffer keys that result in a length-1 string (not key NAMES like Esc, Shift)
    trrtlConsole.innerText += e.key;
    trrtlCommandBuffer += e.key;
  } else {
    console.log(e.keyCode);
  }
});

// If hash available, execute from hash
if(window.location.hash.length > 1) loadCommandHistory();

print(`TRRTL.COM v${VERSION} Ready`);
consoleAwaitCommand();

// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
trrtlConsole.addEventListener('dragover', e=>{
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

// Get file data on drop
trrtlConsole.addEventListener('drop', e=>{
  e.stopPropagation();
  e.preventDefault();
  const files = e.dataTransfer.files; // Array of all files

  for (let i=0, file; file=files[i]; i++) {
    const reader = new FileReader();
    reader.onload = e2=>{
      code.value = e2.target.result;
      print("\nExecuting dropped file...");
      runCodeInEditor();
      consoleAwaitCommand();
    }
    reader.readAsText(file); // start reading the file data.
  }
});

// Get file data on paste
document.addEventListener('paste', e=>{
  if(code.classList.contains('visible')) return; // don't intercept pasting into the code editor
  e.stopPropagation();
  e.preventDefault();
  const clipboardData = e.clipboardData || window.clipboardData;
  const pastedData = clipboardData.getData('Text');
  if(!(pastedData.length && pastedData.length > 0)) return; // ignore paste if no text data
  code.value = pastedData;
  print("\nExecuting pasted file...");
  runCodeInEditor();
  consoleAwaitCommand();
});
