export interface DeviceInfo {
  pid: number;
  vid: number;
  serialNumber?: string;
  manufacturerName?: string;
  productName?: string;
  usbMinorVersion: number;
  usbMajorVersion: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  deviceVersionMajor: number;
  deviceVersionMinor: number;
  deviceVersionSubMinor: number;
}
