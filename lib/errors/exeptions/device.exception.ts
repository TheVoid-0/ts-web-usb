import { Device } from '../../device/device';
import { ErrorOptions } from '../base.error';
import { Exception } from './exception';

export class DeviceException extends Exception {
  constructor(device: Device<unknown, BufferSource>, message: string, errorOptions?: ErrorOptions) {
    super(errorOptions ?? message);

    this.message = `An error occurred in the driver communicator: ${Object.getPrototypeOf(device).constructor.name} - ${message}`;
  }
}
