import Net from './Net';
import EventBus from '../event/EventBus';


export default class Bridge {

    private host: string;
    private key : string;

    constructor(host : string, key : string){
        this.host = host;
        this.key = key;
    }

    public connectWhile(eventBus: EventBus){
        Net.process(this.host + '/' + this.key + '/updates', (data) => {
            let json = JSON.parse(decodeURIComponent(atob(data))); //{ts: 99999999, d: {e: 'eventName', dt: 'data'}}
            if(!json.d){
                return this.connectWhile(eventBus);
            }
            eventBus.invokeEvent(json.d.e, json.d.dt);
            return this.connectWhile(eventBus);
        });
    }

}