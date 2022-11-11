import { Result } from '../../@core/result/result';
import { CombinedError } from '../../errors/combined.error';
import { DeviceCommunicatorException } from '../../errors/exeptions/device-communicator.exception';
import { GuardUtil } from '../../utils/guard.util';
import { USBTransferResult } from './device-communicator.types';
import { DeviceCommunicator, CommunicatorReadOptions } from './device.communicator';

export class DefaultDeviceCommunicator extends DeviceCommunicator {
  constructor(usbDevice: USBDevice) {
    super(usbDevice);
  }

  protected clearHaltAutomatically = true;

  async emit(serializedData: BufferSource, endpointNumber: number): Promise<Result<USBOutTransferResult>> {
    try {
      const usbTransferOutResult = await this.usbDevice.transferOut(endpointNumber, serializedData);
      return this.handleTransferResultStatus(usbTransferOutResult, 'out', endpointNumber);
    } catch (error) {
      return Result.fail(new DeviceCommunicatorException(DefaultDeviceCommunicator, 'Could not emit data', error));
    }
  }

  protected async handleTransferResultStatus<TDirection extends USBDirection>(
    usbTransferResult: USBTransferResult[TDirection],
    direction: TDirection,
    endpointUsed: number,
  ): Promise<Result<USBTransferResult[TDirection]>> {
    if (usbTransferResult.status !== 'ok') {
      const transferResult = Result.fail(
        new DeviceCommunicatorException(DefaultDeviceCommunicator, `transfer result status is: ${usbTransferResult.status}`),
      );

      if (usbTransferResult.status === 'stall' && this.clearHaltAutomatically) {
        const clearHaltResult = await this.clearHalt(direction, endpointUsed);
        if (clearHaltResult.isFailure()) {
          return Result.mergeErrors(transferResult, clearHaltResult);
        }
      }
      return transferResult;
    }

    return Result.ok(usbTransferResult);
  }

  async read(readOptions: CommunicatorReadOptions): Promise<Result<DataView, CombinedError>> {
    const { length, endpointNumber } = readOptions;
    if (GuardUtil.isNil(length)) throw new TypeError(`Length is required for ${DefaultDeviceCommunicator.name}`); // TODO: Isso e ruim. verificar se existe outra maneira
    try {
      const usbTransferInResult = await this.usbDevice.transferIn(endpointNumber, length);

      if (!usbTransferInResult.data) {
        return Result.fail(new DeviceCommunicatorException(DefaultDeviceCommunicator, 'Data returned from device is empty'));
      }

      const handleStatusResult = await this.handleTransferResultStatus(usbTransferInResult, 'in', endpointNumber);
      if (handleStatusResult.isFailure()) {
        return handleStatusResult;
      }

      return Result.ok(usbTransferInResult.data);
    } catch (error) {
      return Result.fail(new DeviceCommunicatorException(DefaultDeviceCommunicator, 'Could not read data', error));
    }
  }

  async clearHalt(direction: USBDirection, endpointNumber: number): Promise<Result<void, DeviceCommunicatorException>> {
    try {
      await this.usbDevice.clearHalt(direction, endpointNumber);
      return Result.ok();
    } catch (error) {
      return Result.fail(new DeviceCommunicatorException(DefaultDeviceCommunicator, 'Could not clear halt', error));
    }
  }
}
