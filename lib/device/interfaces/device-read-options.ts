// import { DataStructure } from '../communicators/device.communicator';

// TODO: add explanation for the options
export interface DeviceReadOptions {
  length?: number;
  // TODO: develop a better way to handle the data structure by a user defined protocol
  // dataStructure?: DataStructure;
  timeout?: number;
  endpointNumber?: number;
}
