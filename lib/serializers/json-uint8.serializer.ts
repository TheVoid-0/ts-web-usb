import { DeviceSerializerException } from '../errors/exeptions/device-serializer.exception';
import { DeviceSerializer } from './abstract.serializer';

export class JsonToUint8Serializer extends DeviceSerializer<unknown, Uint8Array> {
  serialize(data: unknown): Uint8Array {
    try {
      const json = JSON.stringify(data);
      const bytes = new TextEncoder().encode(json);
      return bytes;
    } catch (error) {
      throw new DeviceSerializerException(JsonToUint8Serializer, error);
    }
  }

  deserialize(bytes: DataView): unknown {
    try {
      const json = new TextDecoder().decode(new DataView(bytes.buffer, 2));
      return JSON.parse(json);
    } catch (error) {
      throw new DeviceSerializerException(JsonToUint8Serializer, error);
    }
  }
}
