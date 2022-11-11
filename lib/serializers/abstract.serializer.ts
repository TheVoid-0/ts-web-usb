// TODO: Allow the serializer to deserialize to a different type than the one it was serialized from i.e different from TInput
export abstract class DeviceSerializer<TInput, TOutput extends BufferSource> {
  abstract serialize(data: TInput): TOutput | Promise<TOutput>;
  abstract deserialize(serializedData: DataView): TInput | Promise<TInput>;
}
