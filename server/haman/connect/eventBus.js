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
                    connection.connected = false;
                    setTimeout(() => {
                        connectionsQueue.splice(i, 1);
                    }, 500);
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
            connectionsQueue.push({
                key: key,
                callback: callback,
                connected: true
            });
        }
    }

};
