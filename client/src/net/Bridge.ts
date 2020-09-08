import Net from './Net';
import EventBus from '../event/EventBus';
import Haman from './../Haman';


export default class Bridge {

    private host: string;
    private key : string;
    private haman : Haman;

    constructor(host : string, key : string, haman : Haman){
        this.host = host;
        this.key = key;
        this.haman = haman;
    }

    public connectWhile(eventBus: EventBus){
        Net.process(this.host + '/' + this.key + '/updates', (data) => {
            let json = JSON.parse(decodeURIComponent(atob(data))); //{ts: 99999999, d: {e: 'eventName', dt: 'data'}}
            if(!json.d){
                return this.connectWhile(eventBus);
            }
            if(this.haman.isLogging()){
                console.group('PacketRecive');
                console.info(json.d.e);
                console.info(json.d.dt);
                console.groupEnd();
            }
            eventBus.invokeEvent(json.d.e, json.d.dt);
            return this.connectWhile(eventBus);
        });
    }

}
