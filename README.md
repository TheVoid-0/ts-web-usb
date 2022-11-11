# TS WebUSB
This library is meant to provide some minimum abstraction for the webUSB API.

## Motivation
The WebUSB API is around for quite a long time but for my surprise it is still under the experimental features and is only available on the Chromium engine. For this very reason few people seems to be using and creating content for the webUSB API, resulting in lack of examples with an actual use case. 

I  realized this once I've been asked to do some research to find out if it was possible to migrate a desktop software that connects with an USB device, completly to the Web, and on this research I had a really bad time trying to figure out how to make a simple connection to work, while the examples on the internet where either too simple or too complex (some of them are using arduinos which by definition shouldn't even be accessible to the WebUSB API in the first place since it uses a high level Serial communication provided by the S.O)

Not only the initial proof of concept that the API actually works were hard to achieve, but I also got the feeling of "Ok, so how do I build a software around this" got me. SoI've decided to summarize what I learned through diving the API specifications and stackoverflow questions and build a library with examples and some documentation to maybe help guide someone on the same problem as me.

## Disclaimer
The library is not complete and it lacks some functionalities available on the native API, for this reason the native API is acessible through the library as well the abstraction were built to allow customization and extension. so I hope this can inspire someone to get going with their work.
## Can i use this?
Before you install this library let's firt assure the WebUSB api is what you need, a lot of people seems to be aware of the existence of such API but maybe not many know it's limitations

### Can I connect to any device that has an USB interface?
NO! That's right, you cannot. The WebUSB API was designed to handle unique USB devices with specific protocols (usually under the vendor specific device class) that are unknown to the S.O, this means that it is meant to be used for custom hardware with proprietary drivers on most of the time. Your mouse, keyboard and HDD are not custom hardware and they speak a very common protocol, your S.O can already control them and provide APIs for applications (including the browser) to use them, so this API is not needed for that.

How about microcontrollers (e.g Arduino) then? This is where things gets a little confusing, microcontrollers are "**technically**" custom hardware as you can attach any code to it and build whatever you want, **BUT** some of them have specific drivers to be recognized on the S.O, and the ones who have usually become available as a **serial** device (e.g available on COM3 on windows). This devices are also not accessible to this API, for them you can use the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) instead. While what you've read until here is true, it is also not really... Well, there are a few other ways to "hack your way around" and connect with **SOME** of this devices but keep in mind that it is not very simple, I've tried with an Arduino and failed but there is [proof](https://github.com/webusb/arduino) that it works.

Ok so what kind of hardware should I use on WebUSB? Any hardware that uses a raw USB interface that the S.O can identify as an **Universal Serial Bus Device** and **DO NOT** have an installed driver for it on the S.O, because even if your hardware IS using an USB interface but your S.O has a driver for it, the S.O will CLAIM the device and thus it will not be acessible for the WebUSB since your system is already using it.

### TL;DR
Checklist to know if the WebUSB can access my device
- ✅ It is recognized by the system as an Universal Serial Bus device and not as an Serial device (COM & LPT on windows)
- ✅ It does not have an installed driver, so the S.O didn't claim the device
- ✅ It is classified as any category other than Universal Serial Bus

If your hardware is connected but it's not being listed as an USB device on your S.O then it is probably because the [device descriptor](https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-device-descriptors) is not providing the correct information or enough information for it to be available without a driver installed (but if you install a driver the system will be able to claim it, to work around this without messing with the descriptor you can use tools like [zadig](https://zadig.akeo.ie/) to make your device available as a generic USB)
## Instalation

Instalation is simple as it gets
```bash
npm i ts-web-usb
```
