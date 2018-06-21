'use strict';

const path = require('path');
const fs = require('fs');
const frontMatter = require('front-matter');
const camelize = require('camelize');

function build(markdown) {
  return new Promise((resolve, reject) => {
    let doImports = '';
    const codeFiles = markdown.codeFiles;
    const mods = [];
    const linkPromise = [];
    if (codeFiles.length === 0) {
      resolve(`export default ${raw(markdown.body)}`);
    } else {
      codeFiles.forEach((c, i) => {
        const codeFilePath = path.resolve(this.context, c);
        doImports += `import mod_${i} from '${codeFilePath}';\n`;
        mods.push(`mod_${i}`);
        this.addDependency(codeFilePath);
        linkPromise.push(new Promise((rs, rj) => {
          try {
            fs.readFile(codeFilePath, 'utf-8', function(err, code) {
              if(err) rj(err);
              rs(raw(code));
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
            
            export const attributes = ${JSON.stringify(camelize(markdown.attributes))};
            export const modules = [${mods}];
            export const codes = [${[...arg]}];
            export default {
              attributes,
              modules,
              codes,
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

function parseCode(markdown) {
  const body = markdown.body;
  const codes = body.match(/```jsx\n+(\s*import\s+((\'.+\')|(\".+\"));?\s*\n+)*```\n*/g) || [];
  const codeFiles = codes.map(c =>
    c.replace(/(```jsx\n+(\s*import\s+(\'|\")))|((\'|\");?\s*\n+)|(```\n*)/g, '')
  );
  return {
    attributes: markdown.attributes,
    codeFiles,
    body,
  };
}

function raw(markdown) {
  return JSON.stringify(markdown)
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
};

function parse(markdown) {
  return build.call(this,parseCode(frontMatter(markdown)));
};

module.exports = function (source) {
  const callback = this.async();

  parse.call(this, source).then(m => {
    return callback(null, m)
  }).catch(callback)
}