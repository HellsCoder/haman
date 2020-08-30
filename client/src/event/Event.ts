export default class Event {

    private event : string;
    private callback : Function;

    constructor(event : string, callback : Function){
        this.callback = callback;
        this.event = event;
    }

    public getEvent(){ 
        return this.event;
    }

    public fireCallback(data: any){
        this.callback(data);
    }

}