import { mock } from 'jest-mock-extended';
import { DefaultDeviceCommunicator } from '../../../lib/device/communicators/default-device.communicator';

describe('DefaultDeviceCommunicator', () => {
  const usbDeviceMock = mock<USBDevice>();

  usbDeviceMock.transferIn.mockReturnValue(Promise.resolve({ data: new DataView(new ArrayBuffer(1)), status: 'ok' }));
  usbDeviceMock.transferOut.mockReturnValue(Promise.resolve({ bytesWritten: 1, status: 'ok' }));

  const deviceCommunicator = new DefaultDeviceCommunicator(usbDeviceMock);

  it('should be able to clear halt', async () => {
    const result = await deviceCommunicator.clearHalt('in', 1);
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.clearHalt).toBeCalledWith('in', 1);
  });

  it('should emit data', async () => {
    const result = await deviceCommunicator.emit(new ArrayBuffer(1), 1);
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.transferOut).toBeCalledWith(1, new ArrayBuffer(1));
  });

  it('should read data', async () => {
    const result = await deviceCommunicator.read({ length: 1, endpointNumber: 1 });
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.transferIn).toBeCalledWith(1, 1);
  });

  it('should emit and read data using send', async () => {
    const result = await deviceCommunicator.send({
      serializedData: new ArrayBuffer(1),
      emitEndpointNumber: 1,
      readOptions: { length: 1, endpointNumber: 1 },
    });
    expect(result.isFailure()).toBeFalsy();
    expect(usbDeviceMock.transferOut).toBeCalledWith(1, new ArrayBuffer(1));
    expect(usbDeviceMock.transferIn).toBeCalledWith(1, 1);
  });
});
