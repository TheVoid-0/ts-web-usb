# **TS WebUSB**

This library is meant to provide some minimum abstraction for the [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/USB). It only works on environments that support the native WebUSB API

# Motivation

The WebUSB API is around for quite a long time but for my surprise it is still under the experimental features and is only available on the Chromium engine. For this very reason few people seems to be using and creating content for the webUSB API, resulting in lack of examples with an actual use case.

I  realized this once I've been asked to do some research to find out if it was possible to migrate a desktop software that connects with an USB device, completly to the Web, and on this research I had a really bad time trying to figure out how to make a simple connection to work, while the examples on the internet where either too simple or too complex (some of them are using arduinos which by definition shouldn't even be accessible to the WebUSB API in the first place since it uses a high level Serial communication provided by the S.O)

Not only the initial proof of concept that the API actually works were hard to achieve, but I also got the feeling of "Ok, so how do I build a software around this". So I've decided to summarize what I learned through diving the API specifications and stackoverflow questions and build a library with examples and some documentation to maybe help guide someone on the same problem as me.

# Disclaimer

The library is not complete and it lacks some functionalities available on the native API, for this reason the native API is acessible through the library as well, and the abstractions were built to allow customization and extension. So I hope this can inspire someone to get going with their work.

# Can i use this?

Before you install this library let's first assure the WebUSB api is what you need, a lot of people seems to be aware of the existence of such API but maybe not many know it's limitations

## Can I connect to any device that has an USB interface?

NO! That's right, you cannot. The WebUSB API was designed to handle unique USB devices with specific protocols (usually under the [vendor specific device](https://www.usb.org/defined-class-codes) class) that are unknown to the S.O, this means that it is meant to be used for custom hardware with proprietary drivers on most of the time. Your mouse, keyboard and HDD are not custom hardware and they speak a very common protocol, your S.O can already control them and provide APIs for applications (including the browser) to use them, so this API is not needed for that.

How about microcontrollers (e.g Arduino) then? This is where things gets a little confusing, microcontrollers are "**technically**" custom hardware as you can attach any code to it and build whatever you want, **BUT** some of them have specific drivers to be recognized on the S.O, and the ones who have usually become available as a **serial** device (e.g available on COM3 on windows). This devices are also not accessible to this API, for them you can use the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) instead. While what you've read until here is true, it is also not really... Well, there are a few other ways to "hack your way around" and connect with **SOME** of this devices but keep in mind that it is not very simple, I've tried with an Arduino and failed but there is [proof](https://github.com/webusb/arduino) that it works.

Ok so what kind of hardware should I use on WebUSB? Any hardware that uses a raw USB interface that the S.O can identify as an **Universal Serial Bus Device** and **DO NOT** have an installed driver for it on the S.O, because even if your hardware IS using an USB interface but your S.O has a driver for it, the S.O will CLAIM the device and thus it will not be acessible for the WebUSB since your system is already using it.

## TL;DR

Checklist to know if the WebUSB can access my device

- ✅ It is recognized by the system as an Universal Serial Bus device and not as an Serial device (COM & LPT on windows)
- ✅ It does not have an installed driver, so the S.O didn't claim the device
- ✅ It is classified as any category other than Universal Serial Bus

If your hardware is connected but it's not being listed as an USB device on your S.O then it is probably because the [device descriptor](https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-device-descriptors) is not providing the correct information or enough information for it to be available without a driver installed (but if you install a driver the system will be able to claim it, to work around this without messing with the descriptor you can use tools like [zadig](https://zadig.akeo.ie/) to make your device available as a generic USB)

# Instalation

Instalation is simple as it gets

```bash
npm i ts-web-usb
```

Currently the WebUSB API types doesn't come included, so for a better experience please also use [w3c-web-usb](https://www.npmjs.com/package/@types/w3c-web-usb)

# Usage

## Initializing the library

Before being able to use other methods, first you need to initialize the library like this:

```ts
if(USBApi.isWebUSBSupported()) {
    const usbApi = USBApi.initialize();
}
```

The `usbApi` variable will contain an instance of the library and expose methods that right now only support the native USB API, so I don't recommend using them directly unless needed.

## Getting a device

This library aims to make it easier to implement your own logic while maintaining code readability and separation of concerns, later into the docs there will be examples of how to customize your device, but for now let's work with the default implmentation.

To connect with your device you will need to create a class for it, and for that it is necessary to use the `DeviceConfigurationBuilder`

```ts
const myDeviceConfiguration = new DeviceConfigurationBuilder()
                                    .useSerializer(JsonToUint8Serializer)
                                    .useCommunicator(DefaultDeviceCommunicator)
                                    .useDeviceFilter({vendorId: 101})

const device = await myDeviceConfiguration.getDevice()                        
```

The above code configured the device class to use a JsonToUint8Serializer and a DeviceCommunicator. The `useDeviceFilter` function will make the `getDevice` method to use a filter when asking for a device so only devices that match the filter will be displayed for the user to select. The selected device will then be returned do the `device` variable

The `getDevice` function automatically looks for already paired devices, and if it finds it will not ask the user to select a device. However if the filter is not restrictive enough and resolves to multiple paired devices, then none will be returned and the prompt will be asked

The serializer is responsible for serializing the data you are sending to a buffer and deserializing the buffer into some other data structure. The default one serializes any JSON compatible object and deserializes the buffer assuming it has a JSON on it.

The device communicator is responsible for accessing the native API and issuing the data transfers on both directions. The default one supports reads by length of bytes and checks for errors and stalls (if stalled it clears the halt).

## Communicating with device

Having the device configured and selected you can now access it's methods to select the needed configuration and interface

```ts
await device.selectConfiguration(1 /* configuration number starts from 1 */);
await device.selectInterface(0 /* interface number starts from 0 */);
```

Now the device should be ready for usage. For emitting and reading data you need to specify an endpoint, you can do this on the device class to be used by default or specify on each method call.

```ts
await device.setDefaultEndpoints({readEndpointNumber: 1, writeEndpointNumber: 1})
const result = await device.emit({foo:'bar'} /*, or set here on the second parameter*/)
const bytesWritten = result.getValueOrThrow().bytesWritten

```

Reading data is a little bit more verbose and could be improved specially on the typings. The read method accepts more parameters that **could** be used for a read operation logic, but **right now** the default implementation only supports reading a static number of bytes.

```ts
const result = await device.read({length: 1024 /* in bytes */})
const data = result.getValueOrThrow()
```

The send method issues an emit and read soon after. By default, the read happens after 200ms but can be overridden by changin the DeviceCommunicator or by parameter on the sendMethod

```ts
const result = await device.send({payload: {foo: 'bar'}, readOptions: {length: 1024}});
const data = result.getValueOrThrow()
```

# Customizing implementation

When I was using the WebUSB API I stopped several times to think about things like "how am I going to make this look less ugly" I don't know if I achieved that, but I like to think that this:

```ts
const result = await sandwichMakerDevice.makeMeASandwich({ingredients: ['bread', 'ham']})
if(result.isError()) {
    // oops! Something went wrong
}
// proceed
```

is better than this:

```ts
const json = JSON.stringify({ingredients: ['bread', 'ham']});
const bytes = new TextEncoder().encode(json);
const usbTransferResult = await device.transferOut(1, bytes)
if (usbTransferResult.status !== 'ok')  {
    // oops! Something went wrong
    if (usbTransferResult.status === 'stall') {
        try {
            await this.usbDevice.clearHalt('out', 1);
        } catch (error) {
            // what do I do now?? O_O
        }
      }
}
// proceed
```

There's nothing magic about this, anyone can wrap these operations on a function or class to hide all these details, but let's be honest, that will need some time, a little knowledge about the API and can be annoying to decide where to keep what in order to reduce the boilerplate.

The customization allow you to use the logic you need without having to worry about the all the steps involved, it does this by discriminating these steps into classes that can be either overrided or extended.

# Caveats and common pitfalls

This topic will contain information that is usefull to know when dealing with USB connection in javascript. Feel free to add more information to this topic.

## USBTransferInResult

The WebUSB returns an `USBTransferInResult` type when reading data from the device, this data structure contains a `data` property that is a `DataView` instance. This property holds the actual information received from the device in bytes i.e a buffer. What is weird about this buffer is that in every test I made, the buffer always had 2 bytes more than expected, even when the device didn't send any data those 2 bytes were there, always at the beginning of the buffer. Because of this, the default serializer sets an offset of 2 bytes before deserializing the data, so keep that in mind when changing the serializer or the device communicator.

## Endianness

When dealing with low level data access like buffers, you need to be pay close attention to the [endianness](https://developer.mozilla.org/en-US/docs/Glossary/Endianness). The `DataView` class let you choose how to read the data, but the [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) always will read considering the native byte-order, and this order **may** be different from the order your device send the data. So be sure your device is sending the data in the correct order when using the default serializer, if it is not, then you will need to either read the data in the correct order by changing the serializer or applying some transformation on the data before it reaches the serializer.

## Customizing the serializer

To understand how to customize the serializer you can just take a look at the JsonToUint8Serializer built in serializer

```ts
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
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    } catch (error) {
      throw new DeviceSerializerException(JsonToUint8Serializer, error);
    }
  }
}
```

And to use it you just neet to set the serializer on the DeviceConfigurationBuilder

```ts
new DeviceConfigurationBuilder().useSerializer(JsonToUint8Serializer)
```

## Customizing the DeviceCommunicator

Same as the serializer

```ts
export class MyDeviceCommunicator extends DeviceCommunicator {
    async emit(serializedData: BufferSource, endpointNumber: number): Promise<Result<USBOutTransferResult>> {
    // here you have access to the native device API
    this.usbDevice.transferOut(...)
    // Do stuff as you need
  }

  async read(readOptions: CommunicatorReadOptions): Promise<Result<DataView, Error>> {
    // do stuff
  }
}
```

And then:

```ts
new DeviceConfigurationBuilder().useCommunicator(MyDeviceCommunicator)
```

## Customizing the Device

You will probably want to set your own methods within the device to hold maybe a set of oberations, so you can override the Device class and add new methods.

```ts
export class MyDevice extends Device<unknown, Uint8Array> {
    static create() {
    return new DeviceConfigurationBuilder()
      .useDeviceFilter({
        vendorId: 104,
      })
      .useClass(MyDevice)
      .getDevice();
  }

  myMethod(){
    // do stuff
  }
}

const myDevice = await MyDevice.create();

myDevice.myMethod();
```
