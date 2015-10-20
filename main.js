var VOID_ELEMS = "area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr",
    AUTOCLOSE_ELEMS = "colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr",
    BLOCK_ELEMS = "address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul",
    TAG_START_REGEX = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    TAG_END_REGEX = /(<(\/[^>]+)>)/,
    TAG_ATTRS_REGEX = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;

var statElems = {};
statElems.voidElm = makeObj(VOID_ELEMS);
statElems.autoClose = makeObj(AUTOCLOSE_ELEMS);
statElems.block = makeObj(BLOCK_ELEMS);

var parserErr = {};

function makeObj(str) {
    var obj = {};
    obj = str.split(',').map(function(elem) { return elem; });
    return obj;
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

// Static HTML for now..
// var HTML = "<html><head></head><body><div><span></span></div></body></html>";
// var HTML = "<html><head></head><body><div>This is a div</div></body></html>";
var HTML = "<html><head></head><body><div>This is a div</div></html>";

var symStack = new Stack();
var indexStack = new Stack();

if (typeof HTML !== 'undefined') {
    while (HTML.length >= 1) {
        if (!HTML) {
            break;
        }
        // Tag start
        else if (HTML.indexOf("</") === 0) {
            if (!assertStartBeforeEnd("tag")) break;
            symStack.pop();
            var elm = HTML.match(TAG_END_REGEX);
            console.log('Close: ', elm[2].substr(1));
            HTML = HTML.split(elm[0])[1];
        }
        // Tag End
        else if (HTML.indexOf("<") === 0) {
            symStack.push("<");
            var elm = HTML.match(TAG_START_REGEX);
            console.log('Open: ', elm[1]);
            HTML = HTML.split(elm[0])[1];
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
        console.log('Some error');
    }
}

function assertStartBeforeEnd(type) {
    return type === "tag" ?
        (symStack.top() === "<" ? true : false) :
    type === "comment" ?
        (symStack.top() === "<!--" ? true : false) :
    "";
};
