import { EventEmitter } from "events";
import { EventEmitterEvents } from ".";
import { EventData, EventDataMap } from "./events.interface";

class BaseEventEmitter {
  // Create a new instance of EventEmitter
  private eventEmitter: EventEmitter;
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  emit<T extends EventEmitterEvents>(event: T, data: EventDataMap[T]) {
    console.log("eniiism");
    this.eventEmitter.emit(event, data);
  }

  on<T extends EventEmitterEvents>(
    event: T,
    callback: (data: EventDataMap[T]) => void
  ) {
    this.eventEmitter.on(event, callback);
  }
}

export default new BaseEventEmitter();
