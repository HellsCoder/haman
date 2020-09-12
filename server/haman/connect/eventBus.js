const { connect } = require("http2");

module.exports = EventBus = () => {
    
    const connectionsQueue = [];

    return {
        contains: (key) => {
            for(let i = 0; i < connectionsQueue.length; i++){
                let connection = connectionsQueue[i];
                if(connection.key === key){
                    return true;
                }
            }
            return false;
        },

        terminate: (key) => {
            for(let i = 0; i < connectionsQueue.length; i++){
                let connection = connectionsQueue[i];
                if(connection.key === key){
                    connectionsQueue.splice(i, 1);
                }
            }
        },

        broadcast: (key, event, data) => {
            for(let i = 0; i < connectionsQueue.length; i++){
                let connection = connectionsQueue[i];
                if(connection.key === key){
                    continue;
                }
                connection.callback({
                    event: event,
                    data: data
                });
            }
        },

        call: (key, event, data) => {
            for(let i = 0; i < connectionsQueue.length; i++){
                let connection = connectionsQueue[i];
                if(connection.key === key){
                    connection.callback({
                        event: event,
                        data: data
                    });
                    return true;
                }
            }
            return false;
        },

        wait: (key, callback) => {

            let containsConnect = (key) => {
                for(let i = 0; i < connectionsQueue.length; i++){
                    let connection = connectionsQueue[i];
                    if(connection.key === key){
                        return i;
                    }
                }
                return false;
            };

            let i = containsConnect(key)
            if(i !== false){
                connectionsQueue[i].callback = callback;
                connectionsQueue[i].time = Math.floor(new Date().getTime()/1000);
                return;
            }

            connectionsQueue.push({
                key: key,
                callback: callback,
                time: Math.floor(new Date().getTime()/1000)
            });
        }
    }

};
