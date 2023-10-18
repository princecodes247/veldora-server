import { IUser } from "./../modules/user";
export enum EventEmitterEvents {
  USER_CREATED = "user-created",
}

// Define a mapping from enum values to data types
export type EventDataMap = {
  [EventEmitterEvents.USER_CREATED]: IUser;
};

// Define the interface that maps enum values to data types
export interface EventData<T extends EventEmitterEvents> {
  type: T;
  data: EventDataMap[T];
}
