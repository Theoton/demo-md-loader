# demo-md-loader
Webpack loader that parses markdown files and converts them to a useful javascript object.

## Usage
```
$ yarn add demo-md-loader
```

*webpack.config.js*
```js
module: {
  loaders: [
    {
      test: /\.md$/,
      use: [
        {
          loader: require.resolve('demo-md-loader'),
        }
      ]
    }
  ]
}
```

[*demo.js*](https://github.com/Theoton/demo-markdown-loader/blob/master/test/examples/demo.js)

```js
export default { demo: 0 }
```

[*demo.md*](https://github.com/Theoton/demo-markdown-loader/blob/master/test/examples/demo.md)

```markdown
01  ---
02  title: demo
03  ---
04  
05  ```jsx
06  import './demo.js';
07  ```
08  
09  ## demo
10  this is body
```

[*output.js*](https://github.com/Theoton/demo-markdown-loader/blob/master/test/examples/output.js)

```js

import demo from 'demo.md';

console.log(demo);
/* 
* demo: {
*   attributes: {
*     title: demo
*   },
*   body: "## demo\r this is body",
*   codes: ["export default { demo: 0 }"]
*   modules: [{ demo: 0 }]
* }
*/

```