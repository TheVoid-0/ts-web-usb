import { BaseError } from './errors/base.error';
import { USBApiInstanceStorage } from './usb-api-instance.storage';

// TODO: Make this class only return information about devices instead of classes with behavior?
export class USBApi {
  private constructor(private readonly nativeUsbApi: typeof navigator.usb) {}

  async requestDevice(filterOptions: USBDeviceFilter[]): Promise<USBDevice> {
    const device = await this.nativeUsbApi.requestDevice({ filters: filterOptions });
    return device;
  }

  async findPairedDevice(filterOptions: USBDeviceFilter[]): Promise<USBDevice | undefined> {
    const pairedDevices = await this.listPairedDevices();
    const pairedDevice = pairedDevices.find(device => {
      return filterOptions.some(filter => {
        return device.productId === filter.productId && device.vendorId === filter.vendorId;
      });
    });
    if (!pairedDevice) {
      return undefined;
    }
    return pairedDevice;
  }

  listPairedDevices(): Promise<USBDevice[]> {
    return this.nativeUsbApi.getDevices();
  }

  /**
   * @returns The native WebUSB API {@link https://developer.mozilla.org/en-US/docs/Web/API/USB}
   */
  exposeNativeAPI(): typeof navigator.usb {
    return this.nativeUsbApi;
  }

  static initialize(): USBApi {
    if (USBApiInstanceStorage.isSet()) return USBApiInstanceStorage.get();
    if (!this.isWebUSBSupported()) {
      throw new BaseError(`WebUSB API is not available. Check support at https://caniuse.com/?search=webusb `);
    }
    const usbApi = new USBApi(navigator.usb);
    USBApiInstanceStorage.set(usbApi);
    return usbApi;
  }

  static isWebUSBSupported(): boolean {
    return !!navigator.usb && navigator.usb instanceof USB;
  }
}
