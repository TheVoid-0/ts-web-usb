import { DefaultDeviceCommunicator } from '../../lib/device/communicators/default-device.communicator';
import { Device } from '../../lib/device/device';
import { DeviceConfigurationBuilder } from '../../lib/device/device.builder';
import { JsonToUint8Serializer } from '../../lib/serializers/json-uint8.serializer';
import { USBApi } from '../../lib/usb-api';
import { USBApiInstanceStorage } from '../../lib/usb-api-instance.storage';

describe('DeviceBuilder', () => {
  const usbApi = {
    requestDevice: jest.fn().mockResolvedValue({} as USBDevice),
    findPairedDevice: jest.fn().mockResolvedValue(null),
  } as unknown as USBApi;
  USBApiInstanceStorage.get = jest.fn().mockReturnValue(usbApi);

  it('should build device', async () => {
    const builder = new DeviceConfigurationBuilder()
      .useDeviceFilter({ vendorId: 1, productId: 1 })
      .useSerializer(JsonToUint8Serializer)
      .useCommunicator(DefaultDeviceCommunicator);

    const device = await builder.getDevice();

    expect(device).toBeInstanceOf(Device);
  });

  it('should throw error when No device filter options provided', async () => {
    const builder = new DeviceConfigurationBuilder().useSerializer(JsonToUint8Serializer).useCommunicator(DefaultDeviceCommunicator);

    await expect(builder.getDevice()).rejects.toThrow('No device filter options provided');
  });

  it('should build device with custom DeviceClass', async () => {
    class CustomDevice extends Device<unknown, Uint8Array> {}

    const builder = new DeviceConfigurationBuilder().useDeviceFilter({ vendorId: 1, productId: 1 }).useClass(CustomDevice);

    const device = await builder.getDevice();
    expect(device).toBeInstanceOf(CustomDevice);
  });

  it('should build device with custom factory', async () => {
    const device = {} as Device<unknown, Uint8Array>;
    const builder = new DeviceConfigurationBuilder()
      .useDeviceFilter({ vendorId: 1, productId: 1 })
      .useFactory(() => device as unknown as Device<unknown, Uint8Array>);

    const deviceBuilt = await builder.getDevice();
    expect(deviceBuilt).toBe(device);
  });
});
