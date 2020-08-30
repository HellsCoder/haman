const app = require('express')();

/*
    Haman - библиотека для лонг-пул реал-тайм соединений. Встраивается в любое express приложение

    haman.send(to, event, data) - отправить данные конкретном клиенту, где to - его ключ
    haman.broadcast(from, event, data) - отправить данные всем клиентам кроме from, from - тот
    от кого данные пришли, оставьте null если данные идут от сервера
*/
const haman = require('./haman/haman')(app);


app.listen(7777, () => {
    console.info("Express listeing port 7777");
});


