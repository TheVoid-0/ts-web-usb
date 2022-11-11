import { DeviceReadOptions } from './device-read-options';

export interface DeviceSendOptions<TInput> {
  // TODO: change data field name to payload
  payload: TInput;
  emitEndpointNumber?: number;
  readOptions: DeviceReadOptions;
}
