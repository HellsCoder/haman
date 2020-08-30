import Event from './Event';

export default class EventBus {

    registredEvents : Array<Event>;

    constructor(){
        this.registredEvents = [];
    }

    public pushEvent(event : string, callback: Function) : void {
        let eventPush : Event = new Event(event, callback);
        this.registredEvents.push(eventPush);
    }

    public invokeEvent(event : string, data : any) : void {
        for(let i = 0; i < this.registredEvents.length; i++){
            let currentEvent = this.registredEvents[i];
            if(currentEvent.getEvent() === event){
                currentEvent.fireCallback(data);
            }
        }
    }

}