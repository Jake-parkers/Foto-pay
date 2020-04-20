require('dotenv').config();
const app = require('./components/app');
const port = 8000;
// const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log('App listening on port %s', port);
})

module.exports = app;
