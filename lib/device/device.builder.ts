/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeviceSerializer } from '../serializers/abstract.serializer';
import { JsonToUint8Serializer } from '../serializers/json-uint8.serializer';
import type { USBApi } from '../usb-api';
import { USBApiInstanceStorage } from '../usb-api-instance.storage';
import { GuardUtil } from '../utils';
import { Class } from '../utils/type.util';
import { DefaultDeviceCommunicator } from './communicators/default-device.communicator';
import { DeviceCommunicator } from './communicators/device.communicator';
import { Device } from './device';

type DeviceFactoryArguments<TInput, TOutput extends BufferSource> = {
  nativeUsbDevice: USBDevice;
  serializer: DeviceSerializer<TInput, TOutput>;
  communicator: DeviceCommunicator;
};

type DeviceFactoryFunction<TInput, TOutput extends BufferSource, TDeviceClass extends Device<any, any>> = (
  factoryArguments: DeviceFactoryArguments<TInput, TOutput>,
) => TDeviceClass;

// TODO: Perhaps this class could return an variable with the type of the device Generated for later reference. Like what NestJs does with the ConfigurableModuleBuilder class
// TODO: Instantiate DeviceConfigurationBuilder with the Default type considering the default DeviceSerializer
// TODO: Perhaps is possible to change the TInput and TOutput to the DeviceSerializer type
export class DeviceConfigurationBuilder<TInput, TOutput extends BufferSource, TDeviceClass extends Device<any, any> = Device<TInput, TOutput>> {
  private deviceFilterOptions: USBDeviceFilter[];

  private serializer: Class<DeviceSerializer<TInput, TOutput>> = JsonToUint8Serializer as unknown as Class<DeviceSerializer<TInput, TOutput>>;

  private communicator: Class<DeviceCommunicator> = DefaultDeviceCommunicator;

  private deviceClass: Class<TDeviceClass> = Device as Class<TDeviceClass>;

  private customFactory: DeviceFactoryFunction<TInput, TOutput, TDeviceClass> | null = null;

  useDeviceFilter(deviceFilter: USBDeviceFilter | USBDeviceFilter[]): this {
    this.deviceFilterOptions = GuardUtil.isArray(deviceFilter) ? deviceFilter : [deviceFilter];
    return this;
  }

  useClass<TDeviceClassLocal extends TDeviceClass>(
    deviceClass: Class<TDeviceClassLocal>,
  ): DeviceConfigurationBuilder<TInput, TOutput, TDeviceClassLocal> {
    this.deviceClass = deviceClass;
    return this as unknown as DeviceConfigurationBuilder<TInput, TOutput, TDeviceClassLocal>;
  }

  useFactory<TDeviceClassLocal extends TDeviceClass>(
    factory: DeviceFactoryFunction<TInput, TOutput, TDeviceClassLocal>,
  ): DeviceConfigurationBuilder<TInput, TOutput, TDeviceClassLocal> {
    this.customFactory = factory;
    return this as unknown as DeviceConfigurationBuilder<TInput, TOutput, TDeviceClassLocal>;
  }

  useSerializer<TInputLocal extends TInput, TOutputLocal extends TOutput>(
    serializer: Class<DeviceSerializer<TInputLocal, TOutputLocal>>,
  ): DeviceConfigurationBuilder<TInputLocal, TOutputLocal, TDeviceClass> {
    this.serializer = serializer as Class<DeviceSerializer<TInputLocal, TOutputLocal>>;
    return this as unknown as DeviceConfigurationBuilder<TInputLocal, TOutputLocal, TDeviceClass>;
  }

  useCommunicator(communicator: Class<DeviceCommunicator>): this {
    this.communicator = communicator;
    return this;
  }

  async getDevice(): Promise<TDeviceClass> {
    this.validateBuilder();
    const usbDevice = await this.findUSBDevice();

    const serializer = new this.serializer();
    const deviceCommunicator = new this.communicator(usbDevice);

    if (this.customFactory) {
      try {
        return this.customFactory({ nativeUsbDevice: usbDevice, serializer, communicator: deviceCommunicator });
      } catch (error) {
        // TODO: add dedicated error
        throw new Error(`Error while creating device with custom factory: ${error}`);
      }
    }

    try {
      return new this.deviceClass(usbDevice, serializer, deviceCommunicator);
    } catch (error) {
      // TODO: add dedicated error
      throw new Error(`Error while creating device: ${error}`);
    }
  }

  private validateBuilder(): this is Required<this> {
    // TODO: add dedicated error
    if (GuardUtil.isNil(this.deviceFilterOptions)) {
      throw new Error('No device filter options provided');
    }
    if (!this.serializer) {
      throw new Error('Serializer is not set');
    }
    if (!this.communicator) {
      throw new Error('Communicator is not set');
    }

    return true;
  }

  private async findUSBDevice(): Promise<USBDevice> {
    const usbApi = this.getUSBApi();
    const pairedDevice = await usbApi.findPairedDevice(this.deviceFilterOptions);
    if (!pairedDevice) {
      return await usbApi.requestDevice(this.deviceFilterOptions);
    }

    return pairedDevice;
  }

  private getUSBApi(): USBApi {
    return USBApiInstanceStorage.get();
  }
}
