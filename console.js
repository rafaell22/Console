
( function(factory) {
  "use strict";
  const version = '1.2.0';

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
    /**
     * Get a value's raw type
     * @param  {any}      value  Value to be evaluated
     * @return {string}          String representing the raw type of the value
     */
    function toRawType (value) { 
        return Object.prototype.toString.call(value).slice(8, -1); 
    }

    const _console = {};
    // Threshold to enable the user to drag the console button
    const buttonPressThreshold = 500; // in ms
    let momentButtonWasPressed = null;
    let touchId = null;
    
    // add the button that opens the console
    const btnOpenConsole = document.createElement('INPUT');
    btnOpenConsole.type = 'button';
    btnOpenConsole.id = 'debug-button';
    btnOpenConsole.value = '?';
    
    // the console components are appended directly to the body
    const body = document.getElementsByTagName('body')[0];
  
    /**
     * Create a copy of the touch object (to break the references)
     * @param  {string} identifier               Touch unique id
     * @param  {number} pageX                    Position of the touch relative to the user's screen
     * @param  {number} pageY                    Position of the touch relative to the user's screen
     * @return {object}                          Copy of the touch object
     */
    function copyTouch({ identifier, pageX, pageY }) { 
        return { identifier, pageX, pageY }; 
    }
    
    /**
     * Gets a touch from an array of touches, filtering by touch id
     * @param  {string} idToFind               The id to find
     * @param  {array}  touches                Array of touches (returned from a touch event)
     * @return {number}                        Index of the touch in the array, or -1 if not found
     */
    function ongoingTouchIndexById(idToFind, touches) { 
        for (let touchIndex = 0; touchIndex< touches.length; touchIndex++) {
            const id = touches[touchIndex].identifier; 
            if (id == idToFind) { 
                return touchIndex; 
            }
        } 
        return -1; // not found 
    }
    
    /**
     * Handle touchstart and mousedown events.
     * @param  {object} eventTouchStart               Event properties
     */
    function handleTouchStart(eventTouchStart) {
        eventTouchStart.preventDefault();
        // prevents bubbling of event
        eventTouchStart.stopPropagation();
        if(!momentButtonWasPressed) {
            // Save the time the user touched/clicked the button
            momentButtonWasPressed = (new Date()).getTime();
            if(eventTouchStart.changedTouches) {
                touchId = eventTouchStart.changedTouches[0].identifier;
            }
            // Create a timeout to check if the user touches/clicks the button more then the threshold
            setTimeout(function () {
                // We check if momentButtonWasPressed because this variable is cleared on touchend/mouseup
                if(momentButtonWasPressed) {
                    // add events to the document instead of the button.
                    // this is done to continue to drag the button even if the user moves too fast 
                    // (and the event listener/dragging is not able to keep up)
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('mousemove', handleTouchMove);
                    
                    btnOpenConsole.classList.add('dragging');
                }
            }, buttonPressThreshold);
        }
    }
    
    /**
     * Handle touchmove and mousemove events.
     * @param  {object} eventTouchMove               Event properties
     */
    function handleTouchMove(eventTouchMove) {
        if (eventTouchMove.changedTouches) {
            const currentTouchIndex = ongoingTouchIndexById(touchId, eventTouchMove.changedTouches);
          
            btnOpenConsole.style.top = eventTouchMove.changedTouches[currentTouchIndex].pageY;
            btnOpenConsole.style.left = eventTouchMove.changedTouches[currentTouchIndex].pageX
        } else {
            btnOpenConsole.style.top = eventTouchMove.pageY - btnOpenConsole.getBoundingClientRect().height / 2;
            btnOpenConsole.style.left = eventTouchMove.pageX - btnOpenConsole.getBoundingClientRect().width / 2;
        }
    }
    
    /**
     * Handle touchend and mouseup events.
     * @param  {object} eventTouchEnd               Event properties
     */
    function handleTouchEnd(eventTouchEnd) {
        if(
            momentButtonWasPressed &&
            (new Date()).getTime() - momentButtonWasPressed < buttonPressThreshold
        ) {
            document.querySelector('#debug').classList.remove('collapsed');
            eventTouchEnd.target.classList.add('hidden');
        }
        btnOpenConsole.classList.remove('dragging');
        momentButtonWasPressed = null;
        touchId = null;
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mousemove', handleTouchMove);
    }

    /**
     * Event to handle a touch cancel (for example when the user's finger drags to outside the element)
     * @param  {[type]} eventTouchCancel               [description]
     * @return {[type]}                  [description]
     */
    function handleTouchCancel(eventTouchCancel) {
        momentButtonWasPressed = null;
        touchId = null;
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mousemove', handleTouchMove);
    }
  
  body.appendChild(btnOpenConsole);

  btnOpenConsole.addEventListener('mousedown', handleTouchStart);
  btnOpenConsole.addEventListener('touchstart', handleTouchStart);
  
  btnOpenConsole.addEventListener('touchend', handleTouchEnd);
  btnOpenConsole.addEventListener('mouseup', handleTouchEnd);

  btnOpenConsole.addEventListener('touchcancel', handleTouchCancel);

  const isNullOrUndefined = (value) => value === null || typeof value === typeof void 0;

  const isIterable = (obj) => {
    // checks for null and undefined
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
  }
  
  const getAttributes = (obj) => {
      const attributes = {
          own: [],
          inherited: [],
      };
      if(toRawType(obj) === 'Object') {
          for(const attr in obj) {
              if(obj.hasOwnProperty(attr)) {
                  attributes.own.push({
                      key: attr,
                      value: obj[attr],
                  });
              } else {
                  attributes.inherited.push({
                      key: attr,
                      value: obj[attr],
                  })
              }
          }
      }
      
      attributes.own.sort((a, b) => {
          return a.key - b.key;
      });
      
      attributes.inherited.sort((a, b) => {
          return a.key - b.key;
      });
      
      return attributes;
  }
  
  const getArgumentHtml = (arg) => {
    const argsContent = document.createElement('SPAN');
    const argType = toRawType(arg);
    
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
          argsContent.textContent = arg;
        break;
      case 'Number':
      argsContent.classList = 'variable number';  
        argsContent.textContent = arg;
        break;
      case 'Array':
        argsContent.classList = 'variable array';
        argsContent.textContent = JSON.stringify(arg).trim(50);
        
        // TODO - add class with pointer style
        argsContent.addEventListener('click', (function(arr, clickEvent) {
          const parent = clickEvent.target.parentElement;
          const pElements = parent.querySelectorAll(':scope > p');
          
          if (pElements.length > 0) {
            for (const child of pElements) {
              parent.removeChild(child);
            }
          } else {
            let elAttr;
            for(let valueIndex = 0; valueIndex < arr.length; valueIndex++) {
              elAttr = document.createElement('p');
              elAttr.classList = 'variable-internal-values'
              elAttr.innerHTML = `${valueIndex}: `;
              elAttr.appendChild(getArgumentHtml(arr[valueIndex]));
              clickEvent.target.parentElement.appendChild(elAttr);
            }
            
            const varPrototype = Object.getPrototypeOf(arg);
            if (varPrototype) {
              elAttr = document.createElement('p');
              elAttr.classList = 'variable-prototype-values'
              elAttr.innerHTML = `${varPrototype.constructor.name}: `;
              elAttr.appendChild(getArgumentHtml(Object.getOwnPropertyNames(varPrototype).sort().reduce((properties, propertyName) => {
                properties[propertyName] = varPrototype[propertyName];
                return properties;
              }, {})));
              clickEvent.target.parentElement.appendChild(elAttr);
            }
          }
        }).bind(null, arg));
        
        break;
      case 'Object':
        argsContent.classList = 'variable object';
        argsContent.textContent = JSON.stringify(arg).trim(50);
        argsContent.addEventListener('click', (function(obj, clickEvent) {
          const parent = clickEvent.target.parentElement;
          const pElements = parent.querySelectorAll(':scope > p');
          
          if (pElements.length > 0) {
            for (const child of pElements) {
              parent.removeChild(child);
            }
          } else {
            const objAttributes = getAttributes(obj);
            let elAttr;
            for (const attr of objAttributes.own) {
              elAttr = document.createElement('p');
              elAttr.classList = 'variable-internal-values'
              elAttr.innerHTML = `${attr.key}: `;
              elAttr.appendChild(getArgumentHtml(attr.value));
              clickEvent.target.parentElement.appendChild(elAttr);
            }
            
            for (const attr of objAttributes.inherited) {
              elAttr = document.createElement('p');
              elAttr.classList = 'variable-inherited-values'
              elAttr.innerHTML = `${attr.key}: `;
              elAttr.appendChild(getArgumentHtml(attr.value));
              clickEvent.target.parentElement.appendChild(elAttr);
            }
            
            const varPrototype = Object.getPrototypeOf(arg);
            if (varPrototype) {
              elAttr = document.createElement('p');
              elAttr.classList = 'variable-prototype-values'
              elAttr.innerHTML = `${varPrototype.constructor.name}: `;
              elAttr.appendChild(getArgumentHtml(Object.getOwnPropertyNames(varPrototype).reduce((properties, propertyName) => {
                properties[propertyName] = varPrototype[propertyName];
                return properties;
              }, {})));
              clickEvent.target.parentElement.appendChild(elAttr);
            }
          }
        }).bind(null, arg));
        break;
      case 'Function':
        argsContent.classList = 'variable function';
        argsContent.textContent = arg;
        break;
      case 'Boolean':
        argsContent.classList = 'variable boolean';
        argsContent.textContent = arg;
        break;
      default:
        if (argType.match(/HTML.*/)) {
          argsContent.classList = 'variable html';
          argsContent.textContent = arg.outerHTML;
        }
    }
    
    return argsContent;
  };
  
  
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
  
  // Overwrite the window.console.log function
  _console.log = function() {
    let container = document.querySelector('#logging');
    let previousLog = container.querySelector('.last');
    if(previousLog) {
      previousLog.classList.remove('last');
    }
  
    let newLog = document.createElement('P');
    newLog.classList.add('log');
    
    for(let argIndex = 0; argIndex < arguments.length; argIndex++) {
      newLog.appendChild(getArgumentHtml(arguments[argIndex]));
    }
    container.appendChild(newLog);
  }
  
  // Overwrites the window.console.error function
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
