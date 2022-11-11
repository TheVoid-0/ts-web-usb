import { USBApi } from '../../../lib/usb-api';

describe('USBApi', () => {
  it('should create an instance of USBApi', () => {
    expect(USBApi.initialize()).toBeInstanceOf(USBApi);
  });

  it('should throw an error if WebUSB API is not available', () => {
    spyOn(USBApi, 'isWebUSBSupported').and.callFake(() => false);
    expect(USBApi.initialize).toThrowError();
  });

  it('should prompt available USB devices', async () => {
    const usbApi = USBApi.initialize();

    await usbApi.listPairedDevices();
  });
});
