import { DeviceReadOptions } from './device-read-options';

export interface DeviceSendOptions<TInput> {
  timeoutBeforeRead?: number;
  payload: TInput;
  emitEndpointNumber?: number;
  readOptions: DeviceReadOptions;
}
