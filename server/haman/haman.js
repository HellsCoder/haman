const config = require('./config');
const { RSA_PKCS1_OAEP_PADDING } = require('constants');
const { ifError } = require('assert');

const eventBus = require('./connect/eventBus')();

let lastSuccess = [];
let dataQueue = [];

/*
    app - express app with listening port
*/
module.exports = listen = (app) => {
    console.info("Haman listening express port");

    const events = [];

    function pushSuccess(key, time){
        if(lastSuccess.length > 30){
            lastSuccess = [];
        }
        lastSuccess.push({key: key, time: time});
    }

    function pushDataQueue(key, data){
        if(dataQueue.length > 128){
            dataQueue = [];
        }
        dataQueue.push({
            key: key,
            data: data
        });
    }

    function getDataQueue(key){
        for(let i = 0; i < dataQueue.length; i++){
            let d = dataQueue[i];
            if(d.key === key){
                return d.data;
            }
        }
        return false;
    }

    function removeDataInQueue(key){
        for(let i = 0; i < dataQueue.length; i++){
            let d = dataQueue[i];
            if(d.key === key){
                dataQueue.splice(i, 1);
            }
        }
        return false;
    }

    function isSuccess(key){
        for(let i = 0; i < lastSuccess.length; i++){
            let sc = lastSuccess[i];
            if(!(sc.time + 20 > Math.floor(new Date().getTime()))){
                lastSuccess.slice(i,1);
                continue;
            }
            if(sc.key === key && sc.time + 20 > Math.floor(new Date().getTime())){
                lastSuccess.slice(i,1);
                return true;
            }
        }
        return false;
    }

    function atob(data){
        return decodeURIComponent(Buffer.from(data, 'base64').toString());
    }
    
    function btoa(data){
        return Buffer.from(encodeURIComponent(data)).toString('base64');
    }

    function callEvent(event, data){
        for(let i = 0; i < events.length; i++){
            let ev = events[i];
            if(ev.event === event){
                ev.callback(data);
            }
        }
    }

    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    
    app.get('/:key/push/:data', function(req, res){
        let key = req.params.key;

        let data = JSON.parse(atob(req.params.data));
        let event = data.event;

        for(let i = 0; i < events.length; i++){
            let currentEvent = events[i];
            if(currentEvent.event === event){
                currentEvent.callback({
                    getKey: () => {
                        return key;
                    },

                    send: (event, data) => {
                        eventBus.call(key, event, data);
                    }
                }, data.data);
            }
        }

        res.sendStatus(200);
    });

    app.get('/:key/broadcast/:data', function(req, res){
        let key = req.params.key;

        let data = JSON.parse(atob(req.params.data));
        
        eventBus.broadcast(key, data.event, data.data);

        res.sendStatus(200);
    });
    
    app.get('/:key/updates', function(req, res){
        let key = req.params.key;
        let out;

        req.on("close", () => {
            eventBus.terminate(key);
            clearTimeout(out);
            if(isSuccess(key)){
                return;
            }
            callEvent("disconnect", key);
        });

        let data = getDataQueue(key);
        if(data !== false){
            removeDataInQueue(key);
            return res.send(btoa(JSON.stringify({
                ts: Math.round((new Date().getTime()/1000)),
                d: {
                    e: data.event,
                    dt: data.data
                } 
            })));
        }
        
        eventBus.wait(key, (data) => {
            clearTimeout(out);
            pushSuccess(key, Math.floor(new Date().getTime()));
            if(res.headersSent){
                pushDataQueue(key, data);
                return;
            }
            return res.send(btoa(JSON.stringify({
                ts: Math.round((new Date().getTime()/1000)),
                d: {
                    e: data.event,
                    dt: data.data
                } 
            })));
        });
        out = setTimeout(() => {
            pushSuccess(key, Math.floor(new Date().getTime()));
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
        },

        subscribe: (event, callback) => {
            events.push({
                event: event, 
                callback: callback
            });
        }
    }
}
