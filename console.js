
( function(factory) {
  "use strict";
  const version = '1.0.3';
  let w;
  if (typeof window !== typeof void 0) {
    w = window;
  } else if (typeof global !== typeof void 0) {
    w = global;
  } else if (typeof self !== typeof void 0) {
    w = self;
  }
  
  factory(w);
// Pass this if window is not defined yet
} )(function(global){
  "use strict";
  
  // function to get a value's raw type
  function toRawType (value) { 
      return Object.prototype.toString.call(value).slice(8, -1); 
  }
  
    function copyTouch({ identifier, pageX, pageY }) { 
        return { identifier, pageX, pageY }; 
    }
    
    function ongoingTouchIndexById(idToFind, touches) { 
        for (let touchIndex = 0; touchIndex< touches.length; touchIndex++) {
            const id = touches[i].identifier; 
            if (id == idToFind) { 
                return i; 
            }
        } 
        return -1; // not found 
    }
    
    function handleTouchStart(eventTouchStart) {
        eventTouchStart.preventDefault();
        eventTouchStart.stopPropagation();
        if(!momentButtonWasPressed) {
            momentButtonWasPressed = (new Date()).getTime();
            previousTouch = eventTouchStart.changedTouches[0];
            setTimeout(function () {
                if(momentButtonWasPressed) {
                    console.log('Lets drag!');
                    btnOpenConsole.addEventListener('touchMove', handleTouchMove);
                }
            }, buttonPressThreshold);
        }
    }
    function handleTouchMove(eventTouchMove) {
        eventTouchMove.prefentDefault();
        console.log('Moving...');
urrentToconsole.log(eventTouchMove);
        const currentTouchIndex = ongoingTouchIndexById(touchId, eventTouchMove.changedTouches);
        
        btnOpenConsole.top = eventTouchMove.changedTouches[currentTouchIndex].pageY;
       btnOpenConsole.right = eventTouchMove.changedTouches[currentTouchIndex].pageX
    }
    function handleTouchEnd(eventTouchEnd) {
        if(
            momentButtonWasPressed &&
            momentButtonWasPressed - (new Date()).getTime() < buttonPressThreshold
        ) {
            momentButtonWasPressed = null;
            touchId = null;
            document.querySelector('#debug').classList.remove('collapsed');
            eventTouchEnd.target.classList.add('hidden');
        }
    }
    function handleTouchCancel(eventTouchCancel) {}
  
  const _console = {};
  const buttonPressThreshold = 1000; // in ms
  let momentButtonWasPressed = null;
  let touchId = null;
  let previousTouch = null;
  
  // the console components are appended directly to the body
  const body = document.getElementsByTagName('body')[0];
  
  // add the button that opens the console
  const btnOpenConsole = document.createElement('DIV');
  btnOpenConsole.id = 'debug-button';
  btnOpenConsole.innerText = '?';
  body.appendChild(btnOpenConsole);

  btnOpenConsole.addEventListener('touchStart', handleTouchStart);
  
  btnOpenConsole.addEventListener('touchEnd', function(e) {
    
  });

  /* btnOpenConsole.addEventListener('click', function(e) {
    document.querySelector('#debug').classList.remove('collapsed');
    e.target.classList.add('hidden');
  });
  */
  
  // add the console tab
  const tabOpenConsole = document.createElement('DIV');
  tabOpenConsole.id = 'debug';
  tabOpenConsole.classList = 'collapsed';
  tabOpenConsole.innerHTML = `
    <div id="tab-buttons">
      <div id="tab-logging" class="button selected">
        Logging
      </div>

      <div id="tab-close">
        &#10006;
      </div>
      <div id="tab-clear">
        &#x1F5D1;
      </div>
    </div>
    <div id="tab-body">
      <div id="logging">
      </div>
    </div>
  `;
  body.appendChild(tabOpenConsole);

  // add event to close the console tab
  document.getElementById('tab-close').addEventListener('click', function(e) {
    document.querySelector('#debug').classList.add('collapsed');
    setTimeout(function() {
      document.querySelector('#debug-button').classList.remove('hidden');
    }, 1000);
  });
  
  // event to clear the content of the console tab
  document.getElementById('tab-clear').addEventListener('click', function(e) {
    document.querySelector('#logging').innerHTML = '';
  });
  
  _console.log = function() {
    let container = document.querySelector('#logging');
    let previousLog = container.querySelector('.last');
    if(previousLog) {
      previousLog.classList.remove('last');
    }
  
    let newLog = document.createElement('P');
    newLog.classList.add('log');
    
    for(let argIndex = 0; argIndex < arguments.length; argIndex++) {
      const argsContent = document.createElement('SPAN');
      const argType = toRawType(arguments[argIndex]);
      
      // add specific styling depending of the value argument type
      switch (argType) {
        case 'Undefined':
          argsContent.classList = 'variable undefined';
          argsContent.textContent = 'undefined';
          break;
        case 'Null':
          argsContent.classList = 'variable null';
          argsContent.textContent = 'null';
          break;
        case 'String':
            argsContent.textContent = arguments[argIndex];
          break;
        case 'Number':
        argsContent.classList = 'variable number';  
          argsContent.textContent = arguments[argIndex];
          break;
        case 'Array':
          argsContent.classList = 'variable array';
          argsContent.textContent = JSON.stringify(arguments[argIndex]);
          break;
        case 'Object':
          argsContent.classList = 'variable object';
          argsContent.textContent = JSON.stringify(arguments[argIndex]);
          break;
        case 'Function':
          argsContent.classList = 'variable function';
          argsContent.textContent = arguments[argIndex];
          break;
        case 'Boolean':
          argsContent.classList = 'variable boolean';
          argsContent.textContent = arguments[argIndex];
          break;
        default:
      }
      newLog.appendChild(argsContent);
    }
    container.appendChild(newLog);
  }
  
  _console.error = function(err) {
    let container = document.querySelector('#logging');
    let previousLog = container.querySelector('.last');
    if(previousLog) {
      previousLog.classList.remove('last');
      previousLog.parentNode.classList.add('before-error');
    }
  
    let newError = document.createElement('P');
    newError.classList.add('error');
  
    let cursor = document.createElement('DIV');
    cursor.classList = 'cursor-error';
    cursor.innerHTML = '&#10006;';
  
    let textNode = document.createTextNode(err);
  
    newError.appendChild(cursor);
    newError.appendChild(textNode);
  
    container.appendChild(newError);
  }
  
  // window.onerror = null;
  // add listener to the global error event. Intercepts and log errors to the console tab
  window.addEventListener('error', function(event) {
    event.preventDefault();

    var message = null;
    var errorObject = {};
    if (event) {
      errorObject.error = event.error;
      if (event.error) {
        errorObject.stack = event.error.stack;
      }
      errorObject.source = event.filename;
      errorObject.lineno = event.lineno;
      errorObject.colno = event.colno;
      errorObject.type = event.type;

      message = event.message;
    } else {
      message = 'Error event is null or undefined.';
    }
    errorObject.code = 'Unhandled Error Exception';

    _console.error(JSON.stringify(errorObject));
  });

  // add listener to the global unhandled rejection event. Intercepts and log errors to the console tab
  window.addEventListener('unhandledrejection', function(event) {
      console.log(arguments)
      console.log(event)
      event.preventDefault();
      var errorObject = {
        code: 'Unhandled Promise Rejection',
      };

      if (event) {
        errorObject.message = event.reason && event.reason.message ? event.reason.message : 'Error event is null or undefined.';
        errorObject.stack = event.reason && event.reason.stack ? event.reason.stack : 'Error stack is null or undefined.';
        errorObject.type = event.type;
      } else {
        errorObject.message = 'Error event is null or undefined.';
      }
      _console.error(JSON.stringify(errorObject));
    }
  );
  
  // save reference to the original console methods
  _console.__console = {
    log: global.console.log,
    error: global.console.error
  };
  
  // redefine the global console.log method to add any logs to the console tab
  global.console.log = function() {
      _console.__console.log.apply(null, arguments);
      _console.log.apply(null, arguments);
  }
  
  // redefine the global console.error method to add any errors to the console tab
  global.console.error = function(text) {
      _console.__console.error(text);
      _console.error(text);
  }
  
  return _console;
});