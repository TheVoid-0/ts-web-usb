import { DeviceCommunicator } from '../../device/communicators/device.communicator';
import { Class } from '../../utils/type.util';
import { ErrorOptions } from '../base.error';
import { Exception } from './exception';

export class DeviceCommunicatorException extends Exception {
  // TODO: Verificar outra maneira de pegar o contexto da classe atual, talves passando o this para ficar menos verboso?
  constructor(communicatorClass: Class<DeviceCommunicator>, message: string, errorOptions?: ErrorOptions) {
    super(errorOptions ?? message);

    this.message = `An error occurred in the driver communicator: ${communicatorClass.name} - ${message}`;
  }
}
