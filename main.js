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

var stack = [];
stack.top = function() {
    return stack[this.length - 1];
};

stack.pop = function() {
    var returnVal = stack.top();
    stack.splice(stack.length-1, 1);
    return returnVal;
};

function printStack() {
    stack.map(function(elm) {console.log(elm)});
}

// Static HTML for now..
var HTML = "<html><head></head><body><div>This is a div</div></body></html>";
var prevTagStartIndex = 0,
    prevTagEndIndex = 0,
    currTagStartIndex = 0,
    currTagEndIndex = 0;

var tempStripStart = 1;

// while (HTML) {
for (var i = 0; i < 100; i++) {

    if (!HTML) {
        break;
    }
    
    // Tag start
    else if (HTML.indexOf("</") === 0) {
        if (!assertStartBeforeEnd("tag")) continue;
        stack.pop();
        currTagEndIndex = HTML.indexOf("</", prevTagEndIndex);
        var elm = HTML.match(TAG_END_REGEX);
        if (elm) {
            elem = elm[0];
        }
        console.log('Close: ', elem);
        HTML = HTML.split(elem)[1];
    }
    // Tag End
    else if (HTML.indexOf("<") === 0) {
        stack.push("<");
        currTagStartIndex = HTML.indexOf("<", prevTagStartIndex);
        var elm = HTML.match(TAG_START_REGEX);
        if (elm) {
            elem = elm[0];
        }
        console.log('Open: ', elem);
        HTML = HTML.split(elem)[1];
    }
    
    // Comment Start
    else if (HTML.indexOf("<!--") === 0) {
    }
    // Comment End
    else if (HTML.indexOf("-->") === 0) {
        if (!assertStartBeforeEnd("comment")) continue;
    }
    else {
        // validateHTML();
        HTML = HTML.substr(tempStripStart);
    }
}

function assertStartBeforeEnd(type) {
    if (type !== "tag" && type !== "comment") {
        return;
    }
    if (type === "tag") {
        return stack.top() === "<" ? true : false;
    }
    else {
        return stack.top() === "<!--" ? true : false;
    }
};
