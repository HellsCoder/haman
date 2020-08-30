const app = require('express')();

/*
    Haman - библиотека для лонг-пул реал-тайм соединений. Встраивается в любое express приложение
*/
const haman = require('./haman/haman')(app);


app.listen(7777, () => {
    console.info("Express listeing port 7777");
});


