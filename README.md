# __Work in progress__

# Server monitor and power switch

By Mikael Andersson (ma225gn at Linnaeus University)

This project aims to aid people to manage their computers, servers and other electronics devices.

In these times of remote working, traveling and otherwise not having physical access to one's electronic devices it can be a problem to access important information.

One might also find it useful to monitor server performance, uptime, memory usage and other important statistics.

This project solves these problems and also helps save on electricity.

**Estimated time: 1-2 days**. I've tried to keep the project as accessible as possible for people without a technical background.

## Objective
My motivation for choosing this particular project and use case is that i needed a way to power on/off my main workstation and server when i'm not at home. It was important for me that the project actually solves a real problem for me or someone else.

Other use cases could include complex network architectures where something like wake-on-lan wouldn't be possible to use or where we don't have permissions.

Monitoring of specific events on the server. The possibilities here are endless.

Gaming server for you and your friends where they can login to the web-portal and start the server and stop when they're done as opposed to keep it running 24/7.

Or in vacation times needing to access something on the computer.

Someone might ask, why not just use wake-on-lan? Well, even if we are able to route the magic packet correctly or use a tunnel, my experience from using WOL throughout the years is that it's not reliable and sometimes just stops working, it's not sufficient for me.

Also if something hangs we might not be able to restart the computer.

## Material
As i'm attending two IoT courses i bought two microcontrollers.
I was originally gonna use a Node MCU v3 - 8266 as it seemed to fit this project.
After having some problems flashing it with micropython I tried with my other microcontroller "Adafruit Feather HUZZAH32 – ESP32" which worked so I stuck with it.

![](https://i.imgur.com/0LH2m63.jpg#center =x300) Size comparison.

By sawing the breadboard in half we can fit bigger microcontrollers(The NodeMCU otherwise takes the entire width).

1x 5v Relay - for shorting the power pins on the computer when activated.
1x DHT11 - inexpensive temperature sensor.

Adafruit already has a temperature sensor built in, but I wanted to do some wiring.

### Links to material
| Product | Link | Price(rounded up) |
| -------- | -------- | -------- |
| Adafruit esp-32(unsoldered) | [Electrokit](https://www.electrokit.com/en/product/adafruit-feather-huzzah32-esp32-2/) | 27$ |
| Relay module 5V | [Electrokit](https://www.electrokit.com/en/product/relay-module-5v/) | 4$ |
| DHT11 | [Electrokit](https://www.electrokit.com/en/product/digital-temperature-and-humidity-sensor-dht11/) | 5$ |
| Breadboard | [Electrokit](https://www.electrokit.com/en/product/solderless-breadboard-840-tie-points-2/) | 7$ |
| USB-cable | [Electrokit](https://www.electrokit.com/en/product/usb-cable-a-male-microb-male-1-8m/) | 4$ |

Miscellaneous: a multimeter is always nice to have, jumper cables, soldering iron etc.

## Computer setup
I used Thonny for the programming of the microcontroller to micropython.

VSCode and Node.js for a simple lightweight web-portal with no fancy React frontend or database. This makes it so we could potentially modify it to run on the esp-32 itself. Authentication, displaying of the power buttons and information like cpu and memory usage, temperature etc.

VSCode and python for retrieving the data from the server(PSutil) and sending it to the microcontroller through USB serial communication.

I used Ngrok for development and Heroku for production.

Note: i have only tested this project in Linux but should be similar in windows too.

#### Flashing the microcontroller
Im using esptool for flashing the microcontroller with micropython:
Installation instructions: 
https://docs.espressif.com/projects/esptool/en/latest/esp32/index.html

Erasing the flash. For Windows it's COM1, COM2... instead of /dev/ttyUSB*
`sudo esptool.py --chip esp32 --port /dev/ttyUSB0 erase_flash`

`sudo esptool.py --chip esp32 --port /dev/ttyUSB0 --baud 460800 write_flash -z 0x1000 esp32-*.bin` <- Replace bin file.

The specific .bin file for the Adafruit feather esp32 can be found here:
https://micropython.org/download/esp32/

#### Development
Since we're already using VSCode for Node.js and Python it can be nice to have Thonny for a separate development environment.
Thonny is pretty easy to install and work with: https://thonny.org/

In Linux no additional drivers are needed. Windows users needs: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

![](https://i.imgur.com/lOCoYNw.png#center =x400)

As for installing Node.js and Python it's very specific to what operating system you use. Here are the instructions for Linux: https://github.com/nodesource/distributions/blob/master/README.md
Python is already built into Linux in most cases.

By using NGROK we can simulate a production server by using a tunnel to localhost.
This is a good way to test things during development.

`./ngrok http 8080 --scheme http --scheme https`

We need both http and https as Urequests throws a "out of memory" error. I'm not sure why but might have to do with not having the proper TLS certificate.
Do note that using http our communication is not encrypted and potentially this introduces a security risk.

# Putting everything together
![](https://i.imgur.com/wsOCJ8J.jpg#center =x300)

This particular temperature sensor already has a built in resistor but some don't.
The relay was advertised to work on 3.3v but it didn't, the led comes on but the relay doesn't activate.


![](https://i.imgur.com/yhKxCPX.jpg#center =x300)

I only soldered the pins I needed as I don't think I will keep the break away headers.

![](https://i.imgur.com/KDjsxBp.jpg#center =x400)

![](https://i.imgur.com/J5kYYCl.jpg#center =x400)

Peferably test with an old computer and double check the power pins on the motherboard.
I used a computer fan cable and connected it to the power pins(white is not used).



# Platform
As I previously mentioned I used Ngrok in development.
In production I use Heroku, which is a cloud hosting service(free).

I think it would be possible to run the webportal from the microcontroller with some small modifications.

# The Code
Github repo: https://github.com/Lnuplugg/iot
The code is separated in its respective folder.

Parts marked with **** needs to be replaced. For example **Password **

## Microcontroller
https://github.com/Lnuplugg/iot/tree/main/microcontroller
I've tried to keep it simple and for the most part I think it's pretty self explanatory.

![](https://i.imgur.com/8u5AhOt.jpg#center =x300)

Let's focus on the main loop.
I had big troubles getting UART to work so I could communicate between the microcontroller and the computer. Instead the Python script sends a serial message to the port occupied by REPL and we parse it from there.
This is similar to when we write a message in the command prompt and pressing enter, like using input() in Python or the Scanner in Java.

We then make a post request to the web-portal with the credentials to match the ones specified in the "database" mockup.

We then get a response from the web-portal and if a user has clicked on the shutdown/poweron buttons the response also contains that information.

## Monitoring
https://github.com/Lnuplugg/iot/tree/main/monitoring
Psutil makes it super easy to gather information about the computer.
We could also provide custom hooks for all sorts of activities.

![](https://i.imgur.com/91gtdA2.jpg#center =x300)

We then send the data serially to the microcontroller.
![](https://i.imgur.com/BWSU33T.jpg)

## The web-portal
https://github.com/Lnuplugg/iot/tree/main/portal

Or the user interface. If we want to run the portal on the microcontroller in the future we can't really have databases or things that take too much resources.

We simulate a database for one user by providing a simple object.
![](https://i.imgur.com/izvx8O1.jpg#center =x300)

In the password field we need to provide a hashed password.
We can use a tool like https://bcrypt-generator.com/ for generation.
In Heroku we can also set environment variables to make it more secure. We would then set something like process.env.password instead and the hash on the Heroku backend.

But for development we can just insert the hash.

![](https://i.imgur.com/vmOJ9bq.jpg#center =x300)
In app.js we setup a simple express webserver, defines some routes.
The login route is where the microcontroller logs in and sends it's data.

We compare the sent password(plaintext) with the hashed counterpart.

# Transmitting the data / connectivity
I've already discussed how the data is sent, the microcontroller itself is connected to the internet via my wifi router. Alternatives could be to share the internet with the host computer via the usb cable, 5G or one of many other choices.

As we use the power supply from the usb port we dont have to worry about batteries, power consumption and such.

The data is being sent once every 10th second, this is however easy to modify by just changing the sleep value in the main loop of the microcontroller.

# Presenting the data
Yes, the interface is god awful, some parsing and CSS would make it alot better but the course deadline is approaching fast.
![](https://i.imgur.com/bnmIPqv.png#center =x300)

The data is limited to 10 entries as i'm only interested in the recent data to see if computer resource usage is constantly close to 100% meaning something is wrong and the power state.
This is however easy to change.


# Finalizing the design

Youtube:
[![IMAGE ALT TEXT](https://i.imgur.com/lAMT4dP.jpg#center =x500)](https://youtube.com/shorts/v73vwFeD6jE?feature=share "Video Title")
It's Alive!


Although I consider the project to work as expected there's still a lot to do and improve. For example a nicer interface, hard shutdown, better error handling, security and a 3D printed case.