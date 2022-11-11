import { Result } from '../@core/result/result';
import { DeviceException } from '../errors/exeptions/device.exception';
import { DeviceSerializer } from '../serializers/abstract.serializer';
import { DeviceCommunicator } from './communicators/device.communicator';
import { DeviceInfo } from './interfaces/device-info';
import { DeviceReadOptions } from './interfaces/device-read-options';
import { DeviceSendOptions } from './interfaces/device-send-options';

// TODO: find a way to easily create an alias type for the Device<> Generic class notation so it can be referenced without such verbosity
export class Device<TInput, TOutput extends BufferSource> {
  protected defaultWriteEndpointNumber = 1;

  protected defaultReadEndpointNumber = 1;

  private serializer: DeviceSerializer<TInput, TOutput>;

  private communicator: DeviceCommunicator;

  constructor(private readonly usbDevice: USBDevice, serializer: DeviceSerializer<TInput, TOutput>, communicator: DeviceCommunicator) {
    this.setSerializer(serializer);
    this.setCommunicator(communicator);
  }

  // TODO: this method should uptade the Device instance Type
  setSerializer(serializer: DeviceSerializer<TInput, TOutput>): void {
    this.serializer = serializer;
  }

  setCommunicator(communicator: DeviceCommunicator): void {
    this.communicator = communicator;
  }

  getPid(): number {
    return this.usbDevice.productId;
  }

  getVid(): number {
    return this.usbDevice.vendorId;
  }

  async open(): Promise<Result<void, Error>> {
    if (this.isOpen()) {
      return Result.ok();
    }
    try {
      await this.usbDevice.open();
      return Result.ok();
    } catch (error) {
      return Result.fail(new DeviceException(this, 'Could not open device', error));
    }
  }

  async close(): Promise<Result<void, Error>> {
    if (!this.isOpen()) {
      return Result.ok();
    }
    try {
      await this.usbDevice.close();
      return Result.ok();
    } catch (error) {
      return Result.fail(new DeviceException(this, 'Could not close device', error));
    }
  }

  isOpen(): boolean {
    return this.usbDevice.opened;
  }

  async claimInterface(interfaceNumber: number): Promise<Result<void, Error>> {
    try {
      await this.usbDevice.claimInterface(interfaceNumber);
      return Result.ok();
    } catch (error) {
      return Result.fail(new DeviceException(this, 'Could not claim interface', error));
    }
  }

  async selectConfiguration(configurationValue: number): Promise<Result<void, Error>> {
    try {
      await this.usbDevice.selectConfiguration(configurationValue);
      return Result.ok();
    } catch (error) {
      return Result.fail(new DeviceException(this, 'Could not select configuration', error));
    }
  }

  setDefaultEndpoints(endpoints: { readEndpointNumber: number; writeEndpointNumber: number }): void {
    this.defaultReadEndpointNumber = endpoints.readEndpointNumber;
    this.defaultWriteEndpointNumber = endpoints.writeEndpointNumber;
  }

  get deviceInfo(): DeviceInfo {
    return {
      pid: this.getPid(),
      vid: this.getVid(),
      serialNumber: this.usbDevice.serialNumber,
      manufacturerName: this.usbDevice.manufacturerName,
      productName: this.usbDevice.productName,
      usbMinorVersion: this.usbDevice.usbVersionMinor,
      usbMajorVersion: this.usbDevice.usbVersionMajor,
      deviceClass: this.usbDevice.deviceClass,
      deviceSubclass: this.usbDevice.deviceSubclass,
      deviceProtocol: this.usbDevice.deviceProtocol,
      deviceVersionMajor: this.usbDevice.deviceVersionMajor,
      deviceVersionMinor: this.usbDevice.deviceVersionMinor,
      deviceVersionSubMinor: this.usbDevice.deviceVersionSubminor,
    };
  }

  async send(sendOptions: DeviceSendOptions<TInput>): Promise<Result<TInput, Error>> {
    const { payload: data, readOptions, emitEndpointNumber } = sendOptions;
    const writeEndpointNumber = emitEndpointNumber ?? this.defaultWriteEndpointNumber;
    const readEndpointNumber = readOptions.endpointNumber ?? this.defaultReadEndpointNumber;

    const serializedData = await this.serializer.serialize(data);

    const sendResult = await this.communicator.send({
      readOptions: { ...readOptions, endpointNumber: readEndpointNumber },
      serializedData,
      emitEndpointNumber: writeEndpointNumber,
    });

    if (sendResult.isFailure()) {
      return sendResult;
    }

    const deserializedData = await this.serializer.deserialize(sendResult.getValue());

    return Result.ok(deserializedData);
  }

  async emit(data: TInput, endpointNumber?: number): Promise<Result<USBOutTransferResult, Error>> {
    const serializedData = await this.serializer.serialize(data);
    return this.communicator.emit(serializedData, endpointNumber ?? this.defaultWriteEndpointNumber);
  }

  async read(readOptions: DeviceReadOptions): Promise<Result<TInput, Error>> {
    const readResult = await this.communicator.read({ ...readOptions, endpointNumber: readOptions.endpointNumber ?? this.defaultReadEndpointNumber });
    if (readResult.isFailure()) {
      return readResult;
    }
    const deserializedData = await this.serializer.deserialize(readResult.getValue());
    return Result.ok(deserializedData);
  }

  /**
   * @returns USBDevice created by the native WebUSB API
   */
  exposeNativeDevice(): USBDevice {
    return this.usbDevice;
  }
}
