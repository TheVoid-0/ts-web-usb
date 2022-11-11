import { DataStructure } from '../communicators/device.communicator';

// TODO: add explanation for the options
export interface DeviceReadOptions {
  length?: number;
  dataStructure?: DataStructure;
  timeout?: number;
  endpointNumber?: number;
}
