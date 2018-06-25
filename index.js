'use strict';

var path = require('path');
var fs = require('fs');
var frontMatter = require('front-matter');
var camelize = require('camelize');

function build(markdown) {
  return new Promise((resolve, reject) => {
    var doImports = '';
    var codeFiles = markdown.attributes.imports || [];
    var mods = [];
    var linkPromise = [];
    if (Object.keys(markdown.attributes).length === 0) {
      resolve(`export default ${raw(markdown.body)}`);
    } else {
      codeFiles.forEach((c, i) => {
        var codeFilePath = path.resolve(this.context, c);
        doImports += `import mod_${i} from '${codeFilePath}';\n`;
        mods.push(`mod_${i}`);
        this.addDependency(codeFilePath);
        linkPromise.push(new Promise((rs, rj) => {
          try {
            fs.readFile(codeFilePath, 'utf-8', function(err, code) {
              if(err) rj(err);
              rs(raw('```\n' + code + '\n```\n'));
            });
          } catch (err) {
            return rj(err);
          }
        }));
      });
      try {
        Promise.all(linkPromise).then((...arg) => {
          resolve(`
            ${doImports}
            
            export var attributes = ${JSON.stringify(camelize(markdown.attributes))};
            export var modules = [${mods}];
            export var codes = [${[...arg]}];
            export default {
              attributes: attributes,
              modules: modules,
              codes: codes,
              body: ${raw(markdown.body)},
            };
            `
          );
        })
      } catch (err) {
        return reject(err);
      }
    }
  })
}

function raw(markdown) {
  return JSON.stringify(markdown)
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
};

function parse(markdown) {
  return build.call(this, frontMatter(markdown));
};

module.exports = function (source) {
  var callback = this.async();

  parse.call(this, source).then(m => {
    return callback(null, m)
  }).catch(callback)
}