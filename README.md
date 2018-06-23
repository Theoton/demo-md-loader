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

*demo.js*

```js
export default { demo: 0 }
```

*demo.md*

```markdown
---
title: demo
---

```jsx
import './demo.js';
```

## demo

this is body

```

*output.js*

```js

import demo from 'demo.md';

/* 
* console.log(demo);
*
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