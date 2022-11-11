import { DeviceSerializer } from '../../serializers/abstract.serializer';
import { Class } from '../../utils/type.util';
import { ErrorOptions } from '../base.error';
import { Exception } from './exception';

export class DeviceSerializerException extends Exception {
  constructor(serializerClass: Class<DeviceSerializer<unknown, BufferSource>>, errorOptions: ErrorOptions) {
    super(errorOptions);

    this.message = `An error occurred in the driver serializer: ${serializerClass.name}${this.message}`;
  }
}
