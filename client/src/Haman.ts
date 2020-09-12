import EventBus from './event/EventBus';
import Bridge from './net/Bridge';
import Net from './net/Net';

export default class Haman {

    private host : string;
    private key : string;
    private eventBus : EventBus;
    private longPoolBridge : Bridge;
    private logging : boolean = false;

    constructor(host : string){
        this.host = host;
        this.key = this.genKey();
        this.eventBus = new EventBus();
        this.longPoolBridge = new Bridge(this.host, this.key, this);
    }

    private genKey() : string {
        let result = '';
        let characters = 'abcdefmo0123456789';
        let charactersLength = characters.length;
        for(let i = 0; i < 8; i++){
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return btoa(result + '.' + Math.floor((new Date().getTime()/1000)) + '.' + Math.random().toString(36).substr(2));
    }

    public connect() : void {
        if(this.isLogging()){
            console.info("Haman-key connect " + this.key);
        }
        this.longPoolBridge.connectWhile(this.eventBus);
        this.send("connect", {});
    }

    public subscribe(event : string, callback : Function) : void {
        this.eventBus.pushEvent(event, callback);
    }

    public setLogging(logging : boolean){
        this.logging = logging;        
    }

    public isLogging() : boolean {
        return this.logging;
    }
    
    public send(event : string, data: any) : void {
        if(this.logging){
            console.group('PacketSend');
            console.info(event);
            console.info(data);
            console.groupEnd();
        }
        let encoded = btoa(encodeURIComponent(JSON.stringify({event: event, data: data})));
        Net.process(this.host + '/' + this.key + '/push/' + encoded);
    }

}
