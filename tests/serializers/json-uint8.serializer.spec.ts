import { JsonToUint8Serializer } from '../../lib/serializers/json-uint8.serializer';

describe('JsonToUint8Serializer', () => {
  it('should serialize a simple message', () => {
    const objectMessage = {
      type: 'test',
      payload: {
        test: 'test',
      },
    };

    const serializer = new JsonToUint8Serializer();

    const serializedObjectMessage = serializer.serialize(objectMessage);

    expect(serializer.deserialize(serializedObjectMessage)).toEqual(objectMessage);
  });
});
