// This file is meant to hold an instance of the USB API, so that other files can reference it once it has initialized, without requiring it to be passed directly to them.

import type { USBApi } from './usb-api';

export class USBApiInstanceStorage {
  private static usbApi: USBApi | null = null;

  private constructor() {
    //
  }

  public static set(usbApi: USBApi): void {
    USBApiInstanceStorage.usbApi = usbApi;
  }

  public static get(): USBApi {
    if (USBApiInstanceStorage.usbApi === null) {
      throw new Error('USBApi is not initialized. Make sure the `USBApi.initialize()` method was called first.');
    }

    return USBApiInstanceStorage.usbApi;
  }

  public static isSet(): boolean {
    return !!this.usbApi;
  }
}
