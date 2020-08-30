const config = require('./config');
const e = require('express');

const eventBus = require('./connect/eventBus')();

/*
    app - express app with listening port
*/
module.exports = listen = (app) => {
    console.info("Haman listening express port");

    function atob(data){
        return decodeURIComponent(Buffer.from(data, 'base64').toString());
    }
    
    function btoa(data){
        return Buffer.from(encodeURIComponent(data)).toString('base64');
    }

    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    app.get('/:key/broadcast/:data', function(req, res){
        let key = req.params.key;

        let data = JSON.parse(atob(req.params.data));
        
        eventBus.broadcast(key, data.event, data.data);

        res.send(200);
    });
    
    app.get('/:key/updates', function(req, res){
        let key = req.params.key;
        let out;
        eventBus.wait(key, (data) => {
            clearTimeout(out);
            eventBus.terminate(key);
            return res.send(btoa(JSON.stringify({
                ts: Math.round((new Date().getTime()/1000)),
                d: {
                    e: data.event,
                    dt: data.data
                } 
            })));
        });
        out = setTimeout(() => {
            eventBus.terminate(key);
            return res.send(btoa(JSON.stringify({
                ts: Math.round((new Date().getTime()/1000)),
            })));
        }, config.timeout * 1000);
    });

    return {

        send: (to, event, data) => {
            eventBus.call(to, event, data);
        },

        broadcast: (from, event, data) => {
            eventBus.broadcast(from, event, data);
        }
    }
}