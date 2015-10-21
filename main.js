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
        (symStack.top() === "<" ? true : false) :
    type === "comment" ?
        (symStack.top() === "<!--" ? true : false) :
    "";
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
    this.type = statElems.voidElm.indexOf(name) !== -1 ? "V" :
        statElems.autoClose.indexOf(name) !== -1 ? "A" :
        statElems.block.indexOf(name) !== -1 ? "B" :
        "O";
    this.parent = (typeof parent !== 'undefined' && parent !== null) ?
        parent : "GOD";
};

Tree.node.prototype = {
    constructor: Tree.node,
    addChild: function(childObj) {
        this.children.push(childObj);
    },
    getChildren: function() {
        return this.children;
    },
};

function printTree(root) {
    console.log(root);
}

// Static HTML for now..
// var HTML = "<html><head></head><body><div><span></span></div></body></html>";
// var HTML = "<html><head></head><body><div>This is a div</div></body></html>";
// var HTML = "<html><head></head><body><div>This is a div</div></html>";
var HTML = "<html><head></head><body></body></html>";

var symStack = new Stack();
    // indexStack = new Stack(),
    // nodesStack = new Stack();

var root, openElm, closeElm, errors = [], curr, matchArr = [];

if (typeof HTML !== 'undefined') {
    while (HTML.length >= 1) {
        if (!HTML) {
            break;
        }
        // Tag End
        else if (HTML.indexOf("</") === 0) {
            if (!assertStartBeforeEnd("tag")) {
                errors.push('Closing tag encountered before an opening one!');
                break;
            }
            symStack.pop();
            matchArr = HTML.match(TAG_END_REGEX);
            closeElm = matchArr[2].substr(1).toLowerCase();
            console.log('Close: ', closeElm);
            curr = curr.parent;
            HTML = HTML.split(matchArr[0])[1];
        }
        // Tag Start
        else if (HTML.indexOf("<") === 0) {
            symStack.push("<");
            matchArr = HTML.match(TAG_START_REGEX);
            openElm = matchArr[1].toLowerCase();
            console.log('Open: ', openElm);
            if (curr) {
                var newNode = new Tree.node(openElm, curr);
                curr.addChild(newNode);
                curr = newNode;
            }
            if (openElm === 'html') {
                if (root) {
                    errors.push('Multiple opening html tags encountered!');
                    break;
                }
                else {
                    root = new Tree.node('html');
                    curr = root;
                }
            }
            HTML = HTML.split(matchArr[0])[1];
        }
        // Comment Start
        else if (HTML.indexOf("<!--") === 0) {
        }
        // Comment End
        else if (HTML.indexOf("-->") === 0) {
            if (!assertStartBeforeEnd("comment")) continue;
        }
        else {
            HTML = HTML.substr(1);
        }
    }
    if (!symStack.isEmpty()) {
        errors.push('Invalid HTML');
    }
    if (errors.length !== 0) {
        console.log('Some errors:', errors);
    }
    printTree(root);
}

