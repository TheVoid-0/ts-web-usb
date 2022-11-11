export type USBTransferResult = {
  in: USBInTransferResult;
  out: USBOutTransferResult;
};

export interface SendOptions {
  serializedData: BufferSource;
  emitEndpointNumber?: number;
  readLength: number;
  readEndpointNumber?: number;
}
