import { mock } from 'jest-mock-extended';
import { Result } from '../../lib/@core/result/result';
import { DefaultDeviceCommunicator } from '../../lib/device/communicators/default-device.communicator';
import { Device } from '../../lib/device/device';
import { JsonToUint8Serializer } from '../../lib/serializers/json-uint8.serializer';

describe('Device', () => {
  const usbDeviceMock = mock<USBDevice>({
    opened: false,
  });

  usbDeviceMock.open.mockImplementation(async () => {
    (usbDeviceMock as { opened: boolean }).opened = true;
  });
  usbDeviceMock.close.mockImplementation(async () => {
    (usbDeviceMock as { opened: boolean }).opened = false;
  });
  const serializerMock = mock<JsonToUint8Serializer>();
  const deviceCommunicatorMock = mock<DefaultDeviceCommunicator>();
  const device = new Device(usbDeviceMock, serializerMock, deviceCommunicatorMock);

  it('should open device', async () => {
    const result = await device.open();
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.open).toBeCalled();
  });

  it('should close device', async () => {
    await device.open();
    const result = await device.close();
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.close).toBeCalled();
  });

  it('should claim interface', async () => {
    const result = await device.claimInterface(1);
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.claimInterface).toBeCalledWith(1);
  });

  it('should select configuration', async () => {
    const result = await device.selectConfiguration(1);
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.selectConfiguration).toBeCalledWith(1);
  });

  it('should check if device is opened', () => {
    expect(device.isOpen()).toBeFalsy();
  });

  it('should set default endpoints', () => {
    device.setDefaultEndpoints({ readEndpointNumber: 1, writeEndpointNumber: 2 });
    expect(device['defaultReadEndpointNumber']).toBe(1);
    expect(device['defaultWriteEndpointNumber']).toBe(2);
  });

  it('should send data', async () => {
    deviceCommunicatorMock.send.mockResolvedValueOnce(Result.ok(new ArrayBuffer(0)));
    const data = { test: 'test' };
    const response = await device.send({ payload: data, readOptions: { length: 2 } });

    expect(response.isFailure()).toBeFalsy();
  });
});
