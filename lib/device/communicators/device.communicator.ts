import { Result } from '../../@core/result/result';

export interface CommunicatorSendOptions {
  serializedData: BufferSource;
  emitEndpointNumber: number;
  readOptions: CommunicatorReadOptions;
}

// TODO: Verificar se existe como utilizar decoradores para adquirir informacoes sobre o tipo de dado que a estrutura de dados possui
// @DataStructure
export abstract class DataStructure {
  getBytes(): number {
    return 1;
  }
}

export interface CommunicatorReadOptions {
  length?: number;
  dataStructure?: DataStructure;
  timeout?: number;
  endpointNumber: number;
}

/**
 * O DeviceCommunicator é o responsável pela lógica de comunicação direta com o dispositivo i.e a maneira como os dados são enviados e como os resultados são tratados.
 */
export abstract class DeviceCommunicator {
  constructor(protected readonly usbDevice: USBDevice) {}

  exposeNativeDevice(): USBDevice {
    return this.usbDevice;
  }

  abstract emit(serializedData: BufferSource, endpointNumber: number): Promise<Result<USBOutTransferResult>>;
  abstract read(readOptions: CommunicatorReadOptions): Promise<Result<DataView, Error>>;
  abstract send(sendOptions: CommunicatorSendOptions): Promise<Result<DataView>>;
}
