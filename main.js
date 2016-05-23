var VOID_ELEMS = "area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr",
    AUTOCLOSE_ELEMS = "colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr",
    BLOCK_ELEMS = "address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul",
    TAG_START_REGEX = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    TAG_END_REGEX = /(<(\/[^>]+)>)/,
    TAG_ATTRS_REGEX = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    TREEID = 0;

var statElems = {};
statElems.voidElm = makeObj(VOID_ELEMS);
statElems.autoClose = makeObj(AUTOCLOSE_ELEMS);
statElems.block = makeObj(BLOCK_ELEMS);

function makeObj(str) {
  var obj = {};
  obj = str.split(',').map(function(elem) { return elem; });
  return obj;
}

function assertStartBeforeEnd(type) {
  return type === "tag" ?
    (symStack.top() === "<" ? true : false):
  type === "comment" ?
    (symStack.top() === "<!--" ? true : false):
  "";
}

function isDoctypePresent(str) {
  return str.indexOf('<!') !== 0 ? false :
    str.substr(str.indexOf('<!'), str.indexOf('>')).toLowerCase().indexOf('doctype html') !== -1 ?
    true : false;
}

var Stack = function() {
  this.data = [];
  this.size = 0;
};

Stack.prototype = {
  constructor: Stack,
  top: function() {
    return this.data[this.size-1];
  },
  push: function(val) {
    return this.data.push(val) && this.size++;
  },
  pop: function() {
    return this.data.pop() && this.size--;
  },
  print: function() {
    for (var i = 0; i < this.size; i++) {
      console.log(this.data[i]);
      // print(this.data[i]);
    }
  },
  isEmpty: function() {
    return this.size === 0 ? true : false;
  }
};

var Tree = {};
Tree.node = function(name, parent) {
  this.id = TREEID++;
  this.name = name;
  this.children = [];
  this.type = statElems.voidElm.indexOf(name) !== -1 ?
    "V": statElems.autoClose.indexOf(name) !== -1 ?
    "A": statElems.block.indexOf(name) !== -1 ?
    "B": "O";
  this.parent = (typeof parent !== 'undefined' && parent !== null) ?
    parent : "GOD";
  this.attrs = [];
};

Tree.node.prototype = {
  constructor: Tree.node,
  addChild: function(childObj) {
    this.children.push(childObj);
  },
  getChildren: function() {
    return this.children;
  }
};

function printTree(root) {
  console.log(root);
}

function readInputHTML() {
  var elem = document.getElementById('input');
  parseHTML(elem.value);
  elem.value = '';
}

var symStack = new Stack();

var root = {}, openElm, closeElm, errors = [], curr, matchArr = [], warnings = [];

var DOCTYPE_WARNING_TEXT = 'No <!DOCTYPE html> declaration found';

function parseHTML(HTML) {
  console.log(HTML);

  if (typeof HTML !== 'undefined') {
    if(!isDoctypePresent(HTML) && warnings.indexOf(DOCTYPE_WARNING_TEXT) === -1) {
      warnings.push(DOCTYPE_WARNING_TEXT);
    }
    while (HTML.length >= 1) {
      if (!HTML) {
        break;
      }
      // Tag End
      else if (HTML.indexOf("</") === 0) {
        if (!assertStartBeforeEnd("tag")) {
          errors.push('Closing tag encountered before an opening one!');
          // break;
        }
        symStack.pop();
        matchArr = HTML.match(TAG_END_REGEX);
        closeElm = matchArr[2].substr(1).toLowerCase();
        console.log('Close: ', closeElm);
        if (curr) {
          curr = curr.parent;
        }
        HTML = HTML.split(matchArr[0])[1];
      }
      // Comment Start
      else if (HTML.indexOf("<!--") === 0) {
        var commentCloseIndex = HTML.indexOf('-->');
        HTML = (commentCloseIndex === -1) ? "" :
          HTML.substr(commentCloseIndex);
      }
      // Tag Start
      else if (HTML.indexOf("<") === 0) {
        symStack.push("<");
        matchArr = HTML.match(TAG_START_REGEX);
        openElm = matchArr[1].toLowerCase();
        console.log('Open: ', openElm);
        // print('Open: ', openElm);
        if (openElm === 'html') {
          if (Object.keys(root).length !== 0) {
            errors.push('Multiple opening html tags encountered!');
            // break;
          }
          root = new Tree.node('html');
          curr = root;
        } else {
          if (curr) {
            var newNode = new Tree.node(openElm, curr);
            curr.addChild(newNode);
            curr = newNode;
            // console.log('Current: ', curr);
            // print('Current: ', curr.name, curr.type);
            if (curr.type === 'V') {
              symStack.pop();
              curr = curr.parent;
            }
          } else {
            warnings.push(openElm + ' found before html');
          }
        }
        HTML = HTML.split(matchArr[0])[1];
      }
      else {
        HTML = HTML.substr(1);
      }
    }
    if (!symStack.isEmpty()) {
      errors.push('Invalid HTML');
    }
    if (warnings.length > 0) {
      console.log('warnings: ', warnings);
      // print('warnings: ', warnings);
    }
    if (errors.length > 0) {
      console.log('Errors:', errors);
      // print('Errors:', errors);
    }
    printTree(root);
  }
}

// Static HTML for now..
var HTML = window.HTML;
// var HTML = "<html><head></head><body><div>This is a div</div></body></html>";
// var HTML = "<html><head></head><body><div></div></body></html>";

// var HTML = "<html><head></head><body><div><span></span></div></body></html>";
// var HTML = "<HTML><head></head><body><!--This is a comment, this should be ignored .. <br></body></HTML>";
// var HTML = "<HTML><head></head><body><!--This is a comment, this should be ignored .. --><br></body></HTML>";
// var HTML = ">HTML><head></head><body><!--This is a comment, this should be ignored .. --></body></HTML>";
// var HTML = "<HTML><head><head><body><!--This is a comment, this should be ignored .. --></body></HTML>";
// print(HTML);
