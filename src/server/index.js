const express = require('express');
const app = express();
const proxy = require('express-http-proxy');
const port = process.env.PORT || 4000;

app.use(
  '/api',
  proxy('https://api.prod.headspace.com', {
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
      return new Promise(function(resolve, reject) {
        proxyReqOpts.headers['Access-Control-Allow-Origin'] = '*';
        resolve(proxyReqOpts);
      });
    },
  })
);
app.use(express.static('build'));

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
