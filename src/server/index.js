const express = require('express');
const app = express();
const SDK = require('../lib/headspace-sdk');
const port = process.env.PORT || 4000;

app.get('/completions', (req, res) => {
  const token = req.query && req.query.token;
  const sdk = new SDK(); // creat new to avoid contamination
  sdk.setAuth(token);
  sdk
    .getCompletionsByDay()
    .then(completions => res.json(completions))
    .catch(err => {
      res
        .status(500)
        .send({ error: 'We were unable to get users completions' });
    });
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
