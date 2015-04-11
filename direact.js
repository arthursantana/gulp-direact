var htmlparser = require("htmlparser2");
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var result;
var counter = 0;
var components = [];

var a2s = function (attribs) {
   attributeStrings = "";
   for (var key in attribs) {
      attributeStrings += " " + key + "=\"" + attribs[key] + "\"";
   }
   return attributeStrings;
};

function isComponent(string) {
   return string[0] >= 'A' && string[0] <= 'Z'
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
         toBuf("<" + tagname + a2s(attribs) + ">");
      }
   },

   ontext: function(text){
      toBuf(text)
   },

   oncomment: function (text) {
      toBuf("<!--" + text + "-->");
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
   return through.obj(function (chunk, enc, callback) {
      if (gutil.isNull(chunk)) {
         callback(null, chunk);
      }
      if (gutil.isStream(chunk)) {
         throw new PluginError(PLUGIN_NAME, 'Streams not supported.');
      }

      // isBuffer() == true
      result = chunk.clone();
      result.contents = new Buffer("");

      parser.write(chunk.contents.toString());

      this.push(result);
      callback()
   });
};
