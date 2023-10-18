import { EventEmitterEvents } from './events.interface';
import EventEmitter from './base';
import setupUserEvents from './user.events';

function setupEvents() {
  setupUserEvents();
}

export { EventEmitter, EventEmitterEvents, setupEvents };
