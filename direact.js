var htmlparser = require("htmlparser2");
var through = require('through2');
var gutil = require('gulp-util');

var result;
var counter;
var components;

var tags = ["!doctype", "a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];

var a2s = function (attribs) {
   attributeStrings = "";
   for (var key in attribs) {
      attributeStrings += " " + key + "=\"" + attribs[key] + "\"";
   }
   return attributeStrings;
};

function isComponent(string) {
   return (tags.indexOf(string.toLowerCase()) == -1)
};

var toBuf = function (string) {
   result.contents = Buffer.concat([result.contents, Buffer(string)]);
}

var parser = new htmlparser.Parser({
   onopentag: function(tagname, attribs){
      if(isComponent(tagname)){
         var id = "ReactComponent" + counter; counter++;
         components.push({id: id, name: tagname, att: attribs});
         toBuf("<div id=\"" + id + "\"></div>");
      }
      else {
         toBuf("<" + tagname.toLowerCase() + a2s(attribs) + ">");
      }
   },

   ontext: function(text){
      toBuf(text)
   },

   oncomment: function (text) {
      toBuf("<!--" + text + "-->");
   },

   onprocessinginstruction: function (name, value) {
      toBuf("<" + value + ">")
   },

   onclosetag: function(tagname){
      if(tagname === "br" || isComponent(tagname)){
      }
      else if(tagname === "body"){
         if (components.length != 0) {
            toBuf("\n<script type=\"text/javascript\">\n");
            for (var i in components) {
               c = components[i];
               toBuf("React.renderComponent(React.createElement(" + c.name + ", " + JSON.stringify(c.att) + "), document.getElementById('" + c.id + "'));\n");
            }
            toBuf("</script>\n");
         }
         toBuf("</body>");
      }
      else {
         toBuf("</" + tagname + ">");
      }
   }
}, {
   lowerCaseTags: false,
   recognizeSelfClosing: true,
});

module.exports = function () {
   counter = 0;
   components = [];

   return through.obj(function (chunk, enc, callback) {
      if (gutil.isNull(chunk)) {
         callback(null, chunk);
      }
      if (gutil.isStream(chunk)) {
         throw new gutil.PluginError(PLUGIN_NAME, 'Streams not supported.');
      }

      // isBuffer() == true
      result = chunk.clone();
      result.contents = new Buffer("");

      parser.write(chunk.contents.toString());

      this.push(result);
      callback()
   });
};
