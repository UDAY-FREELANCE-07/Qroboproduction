// Demo catalog data (generated from backend/postgres/seeds/*.sql by backend/scripts/extract_seed.py)

export const mockCategories: any[] = [
  {
    "name": "Robotics",
    "slug": "robotics",
    "description": "Robotics kits, robot arms, chassis, and automation components",
    "icon_name": "Bot",
    "is_featured": true,
    "sort_order": 1,
    "id": "cat-robotics"
  },
  {
    "name": "Development Boards",
    "slug": "development-boards",
    "description": "Microcontroller and single-board computer development boards",
    "icon_name": "Cpu",
    "is_featured": true,
    "sort_order": 2,
    "id": "cat-development-boards"
  },
  {
    "name": "Sensors",
    "slug": "sensors",
    "description": "Environmental, motion, proximity, and IoT sensor modules",
    "icon_name": "Radar",
    "is_featured": true,
    "sort_order": 3,
    "id": "cat-sensors"
  },
  {
    "name": "Microcontrollers",
    "slug": "microcontrollers",
    "description": "Standalone microcontroller chips and modules",
    "icon_name": "CircuitBoard",
    "is_featured": false,
    "sort_order": 4,
    "id": "cat-microcontrollers"
  },
  {
    "name": "Arduino",
    "slug": "arduino",
    "description": "Official Arduino boards and compatible alternatives",
    "icon_name": "CircuitBoard",
    "is_featured": true,
    "sort_order": 5,
    "id": "cat-arduino"
  },
  {
    "name": "ESP32 / ESP8266",
    "slug": "esp32-esp8266",
    "description": "Espressif ESP-series Wi-Fi and Bluetooth modules",
    "icon_name": "Wifi",
    "is_featured": true,
    "sort_order": 6,
    "id": "cat-esp32-esp8266"
  },
  {
    "name": "Raspberry Pi",
    "slug": "raspberry-pi",
    "description": "Raspberry Pi single-board computers and accessories",
    "icon_name": "Server",
    "is_featured": true,
    "sort_order": 7,
    "id": "cat-raspberry-pi"
  },
  {
    "name": "Electronics Components",
    "slug": "electronics-components",
    "description": "Resistors, capacitors, transistors, diodes, and passives",
    "icon_name": "Zap",
    "is_featured": true,
    "sort_order": 8,
    "id": "cat-electronics-components"
  },
  {
    "name": "Motors",
    "slug": "motors",
    "description": "DC motors, servo motors, stepper motors, and BLDC motors",
    "icon_name": "RotateCw",
    "is_featured": false,
    "sort_order": 9,
    "id": "cat-motors"
  },
  {
    "name": "Motor Drivers",
    "slug": "motor-drivers",
    "description": "H-bridge and stepper motor driver modules",
    "icon_name": "Settings2",
    "is_featured": false,
    "sort_order": 10,
    "id": "cat-motor-drivers"
  },
  {
    "name": "Displays",
    "slug": "displays",
    "description": "OLED, LCD, TFT, and e-ink display modules",
    "icon_name": "Monitor",
    "is_featured": false,
    "sort_order": 11,
    "id": "cat-displays"
  },
  {
    "name": "Communication Modules",
    "slug": "communication-modules",
    "description": "RF, Bluetooth, LoRa, Zigbee, and GPS modules",
    "icon_name": "Radio",
    "is_featured": false,
    "sort_order": 12,
    "id": "cat-communication-modules"
  },
  {
    "name": "IoT",
    "slug": "iot",
    "description": "Internet of Things modules and kits",
    "icon_name": "Wifi",
    "is_featured": true,
    "sort_order": 13,
    "id": "cat-iot"
  },
  {
    "name": "AI / ML Hardware",
    "slug": "ai-ml-hardware",
    "description": "Edge AI accelerators and machine learning hardware",
    "icon_name": "Brain",
    "is_featured": false,
    "sort_order": 14,
    "id": "cat-ai-ml-hardware"
  },
  {
    "name": "3D Printing",
    "slug": "3d-printing",
    "description": "3D printers, filament, and printer parts",
    "icon_name": "Box",
    "is_featured": true,
    "sort_order": 15,
    "id": "cat-3d-printing"
  },
  {
    "name": "3D Printer Parts",
    "slug": "3d-printer-parts",
    "description": "Nozzles, hotends, extruders, and upgrade parts",
    "icon_name": "Wrench",
    "is_featured": false,
    "sort_order": 16,
    "id": "cat-3d-printer-parts"
  },
  {
    "name": "DIY Kits",
    "slug": "diy-kits",
    "description": "Complete do-it-yourself project kits",
    "icon_name": "Package",
    "is_featured": true,
    "sort_order": 17,
    "id": "cat-diy-kits"
  },
  {
    "name": "Robotics Kits",
    "slug": "robotics-kits",
    "description": "Complete robotics build kits with all components",
    "icon_name": "Bot",
    "is_featured": true,
    "sort_order": 18,
    "id": "cat-robotics-kits"
  },
  {
    "name": "Student Project Kits",
    "slug": "student-project-kits",
    "description": "Educational kits for school and college projects",
    "icon_name": "GraduationCap",
    "is_featured": true,
    "sort_order": 19,
    "id": "cat-student-project-kits"
  },
  {
    "name": "Tools",
    "slug": "tools",
    "description": "Soldering irons, multimeters, wire strippers, and hand tools",
    "icon_name": "Wrench",
    "is_featured": true,
    "sort_order": 20,
    "id": "cat-tools"
  },
  {
    "name": "Accessories",
    "slug": "accessories",
    "description": "Cables, adapters, power supplies, and cases",
    "icon_name": "Plug",
    "is_featured": false,
    "sort_order": 21,
    "id": "cat-accessories"
  }
];

export const mockBrands: any[] = [
  {
    "name": "Arduino",
    "slug": "arduino",
    "description": "Official Arduino boards and accessories from Italy",
    "country": "Italy",
    "id": "brand-arduino"
  },
  {
    "name": "Raspberry Pi",
    "slug": "raspberry-pi",
    "description": "Raspberry Pi Foundation single-board computers",
    "country": "UK",
    "id": "brand-raspberry-pi"
  },
  {
    "name": "Espressif",
    "slug": "espressif",
    "description": "ESP32 and ESP8266 Wi-Fi/Bluetooth SoC manufacturer",
    "country": "China",
    "id": "brand-espressif"
  },
  {
    "name": "Adafruit",
    "slug": "adafruit",
    "description": "Open-source electronics and DIY hobby components",
    "country": "USA",
    "id": "brand-adafruit"
  },
  {
    "name": "SparkFun",
    "slug": "sparkfun",
    "description": "Electronics components and development kits for makers",
    "country": "USA",
    "id": "brand-sparkfun"
  },
  {
    "name": "NodeMCU",
    "slug": "nodemcu",
    "description": "Open-source Lua-based firmware development board",
    "country": "China",
    "id": "brand-nodemcu"
  },
  {
    "name": "Creality",
    "slug": "creality",
    "description": "3D printers and 3D printing accessories",
    "country": "China",
    "id": "brand-creality"
  },
  {
    "name": "Prusa",
    "slug": "prusa",
    "description": "Open-source 3D printers by Josef Prusa",
    "country": "Czech Republic",
    "id": "brand-prusa"
  },
  {
    "name": "DFRobot",
    "slug": "dfrobot",
    "description": "Robotics and electronic modules for education",
    "country": "China",
    "id": "brand-dfrobot"
  },
  {
    "name": "Seeed Studio",
    "slug": "seeed-studio",
    "description": "Grove modular electronics and IoT solutions",
    "country": "China",
    "id": "brand-seeed-studio"
  },
  {
    "name": "Waveshare",
    "slug": "waveshare",
    "description": "Display modules and development boards",
    "country": "China",
    "id": "brand-waveshare"
  },
  {
    "name": "HiLetgo",
    "slug": "hiletgo",
    "description": "Affordable Arduino and ESP modules",
    "country": "China",
    "id": "brand-hiletgo"
  },
  {
    "name": "Elegoo",
    "slug": "elegoo",
    "description": "Arduino-compatible starter kits and 3D printers",
    "country": "China",
    "id": "brand-elegoo"
  },
  {
    "name": "Anycubic",
    "slug": "anycubic",
    "description": "Consumer 3D printers and resin printers",
    "country": "China",
    "id": "brand-anycubic"
  },
  {
    "name": "YantraX",
    "slug": "yantrax",
    "description": "YantraX branded DIY kits and student project bundles",
    "country": "India",
    "id": "brand-yantrax"
  }
];

export const mockProducts: any[] = [
  {
    "name": "Arduino Uno R3 Development Board",
    "slug": "arduino-uno-r3",
    "description": "The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 6 analog inputs, a 16 MHz quartz crystal, USB connection, power jack, ICSP header, and reset button.",
    "short_description": "Official Arduino Uno R3 with ATmega328P microcontroller",
    "category_id": "cat-arduino",
    "brand_id": "brand-arduino",
    "sku": "ARD-UNO-R3",
    "price": 1299.0,
    "compare_at_price": 1599.0,
    "images": [
      "https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Microcontroller": "ATmega328P",
      "Operating Voltage": "5V",
      "Input Voltage (recommended)": "7-12V",
      "Digital I/O Pins": "14 (of which 6 provide PWM output)",
      "Analog Input Pins": "6",
      "Flash Memory": "32 KB",
      "SRAM": "2 KB",
      "EEPROM": "1 KB",
      "Clock Speed": "16 MHz",
      "Length": "68.6 mm",
      "Width": "53.4 mm",
      "Weight": "25 g"
    },
    "features": [
      "Open-source programmable board",
      "USB connectivity",
      "14 digital I/O pins",
      "6 analog inputs",
      "16 MHz clock speed"
    ],
    "whats_included": [
      "1x Arduino Uno R3 Board",
      "1x USB A-to-B cable"
    ],
    "compatibility": [
      "Arduino IDE",
      "Arduino Web Editor",
      "Most Arduino shields"
    ],
    "tags": [
      "arduino",
      "uno",
      "development board",
      "microcontroller",
      "atmega328p",
      "beginner"
    ],
    "rating": 4.8,
    "review_count": 342,
    "stock": 150,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 25,
    "id": "prod-arduino-uno-r3",
    "is_published": true
  },
  {
    "name": "Raspberry Pi 4 Model B 4GB RAM",
    "slug": "raspberry-pi-4-model-b-4gb",
    "description": "The Raspberry Pi 4 Model B is the latest version of the popular single-board computer. Featuring a quad-core 64-bit ARM Cortex-A72 CPU, 4GB LPDDR4 RAM, dual micro-HDMI ports, USB 3.0, Gigabit Ethernet, and dual-band Wi-Fi.",
    "short_description": "Quad-core 64-bit ARM CPU with 4GB RAM",
    "category_id": "cat-raspberry-pi",
    "brand_id": "brand-raspberry-pi",
    "sku": "RP-PI4-4GB",
    "price": 5499.0,
    "compare_at_price": 6499.0,
    "images": [
      "https://images.pexels.com/photos/7097230/pexels-photo-7097230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/1432794/pexels-photo-1432794.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/28675583/pexels-photo-28675583.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/7097230/pexels-photo-7097230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "CPU": "Broadcom BCM2711, Quad core Cortex-A72 @ 1.5GHz",
      "RAM": "4GB LPDDR4-3200",
      "Networking": "Gigabit Ethernet, 2.4GHz and 5GHz 802.11ac",
      "Bluetooth": "Bluetooth 5.0",
      "Video Output": "2x micro-HDMI (up to 4Kp60)",
      "USB": "2x USB 3.0, 2x USB 2.0",
      "GPIO": "40-pin",
      "Power": "5V DC via USB-C",
      "Dimensions": "88 x 56 x 19 mm"
    },
    "features": [
      "Quad-core 64-bit CPU",
      "4GB LPDDR4 RAM",
      "4K video output",
      "Gigabit Ethernet",
      "Dual-band Wi-Fi",
      "Bluetooth 5.0"
    ],
    "whats_included": [
      "1x Raspberry Pi 4 Model B"
    ],
    "compatibility": [
      "Raspberry Pi OS",
      "Ubuntu",
      "Kodi",
      "RetroPie"
    ],
    "tags": [
      "raspberry pi",
      "sbc",
      "single board computer",
      "linux",
      "iot",
      "media center"
    ],
    "rating": 4.9,
    "review_count": 521,
    "stock": 85,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 46,
    "id": "prod-raspberry-pi-4-model-b-4gb",
    "is_published": true
  },
  {
    "name": "ESP32 DevKit V1 Development Board",
    "slug": "esp32-devkit-v1",
    "description": "The ESP32 DevKit V1 is a powerful Wi-Fi + Bluetooth dual-core microcontroller development board. With 520KB SRAM, dual-core 240MHz CPU, and rich peripheral set, it is perfect for IoT applications.",
    "short_description": "Dual-core Wi-Fi + Bluetooth microcontroller board",
    "category_id": "cat-esp32-esp8266",
    "brand_id": "brand-espressif",
    "sku": "ESP-DEVKIT-V1",
    "price": 599.0,
    "compare_at_price": 899.0,
    "images": [
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Microcontroller": "ESP32-D0WDQ6",
      "CPU": "Xtensa dual-core 32-bit LX6",
      "Clock Speed": "240 MHz",
      "Flash Memory": "4 MB",
      "SRAM": "520 KB",
      "Wi-Fi": "802.11 b/g/n",
      "Bluetooth": "v4.2 BR/EDR and BLE",
      "Operating Voltage": "3.3V",
      "Input Voltage": "7-12V",
      "Digital I/O Pins": "30",
      "Analog Input Pins": "8",
      "Dimensions": "51 x 28 mm"
    },
    "features": [
      "Dual-core 240MHz CPU",
      "Wi-Fi + Bluetooth",
      "4MB Flash",
      "30 digital I/O pins",
      "8 analog inputs",
      "Low power modes"
    ],
    "whats_included": [
      "1x ESP32 DevKit V1 Board"
    ],
    "compatibility": [
      "Arduino IDE",
      "PlatformIO",
      "ESP-IDF",
      "MicroPython"
    ],
    "tags": [
      "esp32",
      "wifi",
      "bluetooth",
      "iot",
      "microcontroller",
      "dual-core"
    ],
    "rating": 4.7,
    "review_count": 218,
    "stock": 200,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": true,
    "is_deal": false,
    "weight": 10,
    "id": "prod-esp32-devkit-v1",
    "is_published": true
  },
  {
    "name": "Arduino Mega 2560 R3 Development Board",
    "slug": "arduino-mega-2560-r3",
    "description": "The Arduino Mega 2560 is a microcontroller board based on the ATmega2560. With 54 digital I/O pins, 16 analog inputs, 256KB flash, and 8KB SRAM, it is ideal for complex projects requiring many I/O pins.",
    "short_description": "ATmega2560 board with 54 digital I/O pins",
    "category_id": "cat-arduino",
    "brand_id": "brand-arduino",
    "sku": "ARD-MEGA-2560",
    "price": 2199.0,
    "compare_at_price": 2799.0,
    "images": [
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Microcontroller": "ATmega2560",
      "Operating Voltage": "5V",
      "Input Voltage": "7-12V",
      "Digital I/O Pins": "54 (15 PWM)",
      "Analog Input Pins": "16",
      "Flash Memory": "256 KB",
      "SRAM": "8 KB",
      "EEPROM": "4 KB",
      "Clock Speed": "16 MHz",
      "Length": "101.5 mm",
      "Width": "53.3 mm",
      "Weight": "37 g"
    },
    "features": [
      "54 digital I/O pins",
      "16 analog inputs",
      "256KB flash",
      "8KB SRAM",
      "16 MHz clock"
    ],
    "whats_included": [
      "1x Arduino Mega 2560 R3",
      "1x USB A-to-B cable"
    ],
    "compatibility": [
      "Arduino IDE",
      "Most Arduino shields"
    ],
    "tags": [
      "arduino",
      "mega",
      2560,
      "microcontroller",
      "development board"
    ],
    "rating": 4.8,
    "review_count": 178,
    "stock": 90,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 37,
    "id": "prod-arduino-mega-2560-r3",
    "is_published": true
  },
  {
    "name": "Arduino Nano V3.0 Development Board",
    "slug": "arduino-nano-v3",
    "description": "The Arduino Nano is a compact, breadboard-friendly microcontroller board based on the ATmega328P. Features 14 digital I/O pins, 8 analog inputs, and a mini-B USB port. Perfect for small projects and embedded applications.",
    "short_description": "Compact ATmega328P board for breadboards",
    "category_id": "cat-arduino",
    "brand_id": "brand-arduino",
    "sku": "ARD-NANO-V3",
    "price": 899.0,
    "compare_at_price": 1199.0,
    "images": [
      "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Microcontroller": "ATmega328P",
      "Operating Voltage": "5V",
      "Input Voltage": "7-12V",
      "Digital I/O Pins": "14 (6 PWM)",
      "Analog Input Pins": "8",
      "Flash Memory": "32 KB",
      "SRAM": "2 KB",
      "EEPROM": "1 KB",
      "Clock Speed": "16 MHz",
      "Dimensions": "45 x 18 mm",
      "Weight": "7 g"
    },
    "features": [
      "Compact breadboard-friendly design",
      "14 digital I/O pins",
      "8 analog inputs",
      "Mini-B USB",
      "16 MHz clock"
    ],
    "whats_included": [
      "1x Arduino Nano V3",
      "1x Mini-B USB cable"
    ],
    "compatibility": [
      "Arduino IDE",
      "Arduino Web Editor"
    ],
    "tags": [
      "arduino",
      "nano",
      "compact",
      "microcontroller",
      "breadboard"
    ],
    "rating": 4.7,
    "review_count": 134,
    "stock": 180,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 7,
    "id": "prod-arduino-nano-v3",
    "is_published": true
  },
  {
    "name": "NodeMCU ESP8266 WiFi Development Board",
    "slug": "nodemcu-esp8266-wifi",
    "description": "The NodeMCU ESP8266 is an open-source Lua-based firmware development board with WiFi capability. Features the ESP-12E module with 4MB flash, 80MHz clock, and built-in WiFi.",
    "short_description": "WiFi-enabled development board with ESP-12E",
    "category_id": "cat-esp32-esp8266",
    "brand_id": "brand-nodemcu",
    "sku": "ESP-NODEMCU-V3",
    "price": 349.0,
    "compare_at_price": 599.0,
    "images": [
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Microcontroller": "ESP-12E (ESP8266)",
      "CPU": "Tensilica L106 32-bit",
      "Clock Speed": "80 MHz (max 160 MHz)",
      "Flash Memory": "4 MB",
      "RAM": "50 KB",
      "Wi-Fi": "802.11 b/g/n",
      "Operating Voltage": "3.3V",
      "Input Voltage": "7-12V",
      "Digital I/O Pins": "11",
      "Analog Input Pins": "1",
      "Dimensions": "51 x 28 mm"
    },
    "features": [
      "Built-in WiFi",
      "4MB Flash",
      "Arduino IDE compatible",
      "MicroPython support",
      "Low cost"
    ],
    "whats_included": [
      "1x NodeMCU ESP8266 Board",
      "1x Micro USB cable"
    ],
    "compatibility": [
      "Arduino IDE",
      "PlatformIO",
      "MicroPython",
      "Lua"
    ],
    "tags": [
      "esp8266",
      "nodemcu",
      "wifi",
      "iot",
      "development board"
    ],
    "rating": 4.4,
    "review_count": 145,
    "stock": 250,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 10,
    "id": "prod-nodemcu-esp8266-wifi",
    "is_published": true
  },
  {
    "name": "ESP32-CAM Camera Development Board",
    "slug": "esp32-cam-module",
    "description": "The ESP32-CAM is a development board with an integrated OV2640 camera and microSD card slot. Features Wi-Fi and Bluetooth connectivity, making it perfect for IoT camera projects, video streaming, and face recognition.",
    "short_description": "ESP32 with OV2640 camera and microSD slot",
    "category_id": "cat-esp32-esp8266",
    "brand_id": "brand-espressif",
    "sku": "ESP-CAM-V1",
    "price": 599.0,
    "compare_at_price": 899.0,
    "images": [
      "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Microcontroller": "ESP32-D0WD",
      "CPU": "Dual-core 32-bit LX6 @ 240MHz",
      "Flash": "4MB",
      "Camera": "OV2640 (2MP)",
      "Resolution": "1600x1200 max",
      "Wi-Fi": "802.11 b/g/n",
      "Bluetooth": "v4.2 BR/EDR + BLE",
      "Storage": "MicroSD card slot",
      "Operating Voltage": "5V",
      "Dimensions": "40 x 27 x 10 mm"
    },
    "features": [
      "Integrated OV2640 camera",
      "Wi-Fi + Bluetooth",
      "MicroSD card slot",
      "Face recognition support",
      "Video streaming capable"
    ],
    "whats_included": [
      "1x ESP32-CAM Board",
      "1x OV2640 Camera Module",
      "1x Antenna"
    ],
    "compatibility": [
      "Arduino IDE",
      "ESP-IDF",
      "PlatformIO"
    ],
    "tags": [
      "esp32",
      "camera",
      "wifi",
      "iot",
      "video streaming",
      "ai"
    ],
    "rating": 4.4,
    "review_count": 123,
    "stock": 180,
    "is_featured": true,
    "is_bestseller": false,
    "is_new_arrival": true,
    "is_deal": true,
    "weight": 15,
    "id": "prod-esp32-cam-module",
    "is_published": true
  },
  {
    "name": "ESP8266 ESP-01 WiFi Module",
    "slug": "esp8266-esp-01-wifi",
    "description": "The ESP-01 is a minimal WiFi module based on the ESP8266 chip. Features 2 GPIO pins, 1MB flash, and AT firmware. Perfect for adding WiFi to existing Arduino projects with minimal cost.",
    "short_description": "Minimal ESP8266 WiFi module with AT firmware",
    "category_id": "cat-esp32-esp8266",
    "brand_id": "brand-espressif",
    "sku": "ESP-01-WIFI",
    "price": 99.0,
    "compare_at_price": 179.0,
    "images": [
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Chip": "ESP8266",
      "Flash": "1 MB",
      "Wi-Fi": "802.11 b/g/n",
      "Operating Voltage": "3.3V",
      "Digital I/O": "2",
      "Serial": "UART (AT commands)",
      "Antenna": "PCB trace",
      "Dimensions": "14.3 x 24.8 mm",
      "Weight": "2 g"
    },
    "features": [
      "Minimal WiFi module",
      "AT firmware included",
      "2 GPIO pins",
      "3.3V operation",
      "Ultra-low cost"
    ],
    "whats_included": [
      "1x ESP-01 Module",
      "1x 2x4 header pins"
    ],
    "compatibility": [
      "Arduino (via serial)",
      "ESP8266 toolchain"
    ],
    "tags": [
      "esp8266",
      "esp-01",
      "wifi",
      "module",
      "iot",
      "cheap"
    ],
    "rating": 4.2,
    "review_count": 78,
    "stock": 400,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 2,
    "id": "prod-esp8266-esp-01-wifi",
    "is_published": true
  },
  {
    "name": "Raspberry Pi Pico RP2040 Microcontroller Board",
    "slug": "raspberry-pi-pico",
    "description": "The Raspberry Pi Pico is a low-cost, high-performance microcontroller board built around the RP2040 chip. Features dual-core ARM Cortex-M0+ CPU, 264KB SRAM, 2MB flash, and 26 GPIO pins. Programmable in C/C++ and MicroPython.",
    "short_description": "RP2040 dual-core microcontroller board",
    "category_id": "cat-development-boards",
    "brand_id": "brand-raspberry-pi",
    "sku": "RP-PICO",
    "price": 449.0,
    "compare_at_price": 599.0,
    "images": [
      "https://images.pexels.com/photos/7097230/pexels-photo-7097230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/7097230/pexels-photo-7097230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Microcontroller": "RP2040",
      "CPU": "Dual-core ARM Cortex-M0+ @ 133MHz",
      "Flash": "2MB external QSPI",
      "SRAM": "264KB",
      "GPIO": "26 pins",
      "PWM Channels": "16",
      "ADC Channels": "4",
      "Interface": "USB 1.1",
      "Dimensions": "51 x 21 mm",
      "Weight": "3 g"
    },
    "features": [
      "Dual-core 133MHz CPU",
      "264KB SRAM",
      "2MB flash",
      "26 GPIO pins",
      "Programmable in C/C++ and MicroPython",
      "Low cost"
    ],
    "whats_included": [
      "1x Raspberry Pi Pico"
    ],
    "compatibility": [
      "MicroPython",
      "C/C++ SDK",
      "Arduino IDE (via community core)"
    ],
    "tags": [
      "raspberry pi",
      "pico",
      "rp2040",
      "microcontroller",
      "dual core",
      "micropython"
    ],
    "rating": 4.7,
    "review_count": 156,
    "stock": 300,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": true,
    "is_deal": false,
    "weight": 3,
    "id": "prod-raspberry-pi-pico",
    "is_published": true
  },
  {
    "name": "HC-SR04 Ultrasonic Distance Sensor",
    "slug": "hc-sr04-ultrasonic-sensor",
    "description": "The HC-SR04 is an ultrasonic distance sensor that provides 2cm to 400cm non-contact measurement with ranging accuracy of 3mm. Perfect for obstacle avoidance in robots and distance measurement projects.",
    "short_description": "Ultrasonic distance sensor for robotics",
    "category_id": "cat-sensors",
    "brand_id": "brand-hiletgo",
    "sku": "SEN-HCSR04",
    "price": 149.0,
    "compare_at_price": 249.0,
    "images": [
      "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686436/pexels-photo-35686436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Operating Voltage": "5V DC",
      "Operating Current": "15 mA",
      "Operating Frequency": "40 kHz",
      "Max Range": "4 m",
      "Min Range": "2 cm",
      "Measuring Angle": "15 degrees",
      "Trigger Input Pulse": "10 us TTL",
      "Dimensions": "45 x 20 x 15 mm",
      "Weight": "9 g"
    },
    "features": [
      "2cm to 400cm range",
      "3mm accuracy",
      "5V operation",
      "15 degree measuring angle",
      "Easy to interface"
    ],
    "whats_included": [
      "1x HC-SR04 Sensor",
      "1x Mounting Bracket"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "PIC",
      "STM32"
    ],
    "tags": [
      "sensor",
      "ultrasonic",
      "distance",
      "robotics",
      "obstacle detection"
    ],
    "rating": 4.6,
    "review_count": 156,
    "stock": 500,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 9,
    "id": "prod-hc-sr04-ultrasonic-sensor",
    "is_published": true
  },
  {
    "name": "DHT22 Temperature and Humidity Sensor",
    "slug": "dht22-temp-humidity-sensor",
    "description": "The DHT22 is a basic, low-cost digital temperature and humidity sensor. It uses a capacitive humidity sensor and a thermistor to measure the surrounding air. Temperature accuracy of plus or minus 0.5C and humidity accuracy of plus or minus 2%.",
    "short_description": "Digital temperature and humidity sensor module",
    "category_id": "cat-sensors",
    "brand_id": "brand-adafruit",
    "sku": "SEN-DHT22",
    "price": 249.0,
    "compare_at_price": 399.0,
    "images": [
      "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686432/pexels-photo-35686432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Temperature Range": "-40 to 80 C",
      "Temperature Accuracy": "+/- 0.5 C",
      "Humidity Range": "0-100% RH",
      "Humidity Accuracy": "+/- 2% RH",
      "Output": "Digital signal",
      "Power Supply": "3.3-6V DC",
      "Sampling Period": "2 seconds",
      "Dimensions": "15.1 x 12 x 5.5 mm",
      "Weight": "3 g"
    },
    "features": [
      "-40 to 80C temperature range",
      "0-100% RH humidity range",
      "High accuracy",
      "Digital output",
      "Low power"
    ],
    "whats_included": [
      "1x DHT22 Sensor",
      "1x 4.7K pull-up resistor"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "PIC",
      "STM32"
    ],
    "tags": [
      "sensor",
      "temperature",
      "humidity",
      "dht22",
      "weather station",
      "iot"
    ],
    "rating": 4.5,
    "review_count": 112,
    "stock": 350,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 3,
    "id": "prod-dht22-temp-humidity-sensor",
    "is_published": true
  },
  {
    "name": "IR Infrared Obstacle Avoidance Sensor Module",
    "slug": "ir-obstacle-sensor-module",
    "description": "An infrared obstacle avoidance sensor module with adjustable detection distance. Features an IR transmitter and receiver pair, potentiometer for distance adjustment, and digital output. Ideal for line following and obstacle avoidance robots.",
    "short_description": "Adjustable IR obstacle detection sensor",
    "category_id": "cat-sensors",
    "brand_id": "brand-hiletgo",
    "sku": "SEN-IR-OBS",
    "price": 79.0,
    "compare_at_price": 149.0,
    "images": [
      "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686436/pexels-photo-35686436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686430/pexels-photo-35686430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Operating Voltage": "3.3-5V",
      "Detection Distance": "2-30 cm (adjustable)",
      "Output Type": "Digital (HIGH/LOW)",
      "Current": "20 mA",
      "Frequency": "38 kHz",
      "Dimensions": "48 x 14 x 12 mm",
      "Weight": "5 g"
    },
    "features": [
      "Adjustable detection distance",
      "Digital output",
      "3.3-5V operation",
      "Low cost",
      "Easy to interface"
    ],
    "whats_included": [
      "1x IR Sensor Module",
      "1x 3-pin header"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "PIC"
    ],
    "tags": [
      "sensor",
      "ir",
      "infrared",
      "obstacle",
      "robotics",
      "line follower"
    ],
    "rating": 4.3,
    "review_count": 56,
    "stock": 600,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 5,
    "id": "prod-ir-obstacle-sensor-module",
    "is_published": true
  },
  {
    "name": "MPU6050 6-Axis Gyroscope Accelerometer Module",
    "slug": "mpu6050-gyro-accel",
    "description": "The MPU6050 is a 6-axis motion tracking device combining a 3-axis gyroscope and 3-axis accelerometer. Features I2C interface, built-in DMP, and programmable interrupt. Perfect for drone stabilization, robotics, and motion sensing projects.",
    "short_description": "6-axis gyroscope + accelerometer with I2C",
    "category_id": "cat-sensors",
    "brand_id": "brand-adafruit",
    "sku": "SEN-MPU6050",
    "price": 199.0,
    "compare_at_price": 349.0,
    "images": [
      "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686432/pexels-photo-35686432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Gyroscope Range": "+/- 250, 500, 1000, 2000 deg/s",
      "Accelerometer Range": "+/- 2g, 4g, 8g, 16g",
      "Interface": "I2C",
      "I2C Address": "0x68",
      "Operating Voltage": "3.3-5V",
      "DMP": "Yes (Digital Motion Processor)",
      "Dimensions": "20 x 15 x 2 mm",
      "Weight": "2 g"
    },
    "features": [
      "3-axis gyroscope + 3-axis accelerometer",
      "I2C interface",
      "Built-in DMP",
      "Programmable interrupt",
      "3.3-5V compatible"
    ],
    "whats_included": [
      "1x MPU6050 Module",
      "1x Header pins"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "PIC",
      "STM32"
    ],
    "tags": [
      "sensor",
      "gyroscope",
      "accelerometer",
      "mpu6050",
      "drone",
      "robotics",
      "imu"
    ],
    "rating": 4.6,
    "review_count": 112,
    "stock": 250,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 2,
    "id": "prod-mpu6050-gyro-accel",
    "is_published": true
  },
  {
    "name": "HC-SR501 PIR Motion Sensor Module",
    "slug": "pir-motion-sensor-hc-sr501",
    "description": "The HC-SR501 is a PIR (Passive Infrared) motion sensor module with adjustable sensitivity and delay. Detects human movement within a 7 meter range and 120 degree angle. Perfect for security, lighting, and automation projects.",
    "short_description": "Adjustable PIR motion sensor for security",
    "category_id": "cat-sensors",
    "brand_id": "brand-hiletgo",
    "sku": "SEN-PIR-501",
    "price": 99.0,
    "compare_at_price": 199.0,
    "images": [
      "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Detection Range": "7 meters",
      "Detection Angle": "120 degrees",
      "Delay Time": "5-200 seconds (adjustable)",
      "Trigger": "Adjustable",
      "Operating Voltage": "4.5-20V",
      "Output": "3.3V HIGH / 0V LOW",
      "Dimensions": "32 x 24 x 18 mm",
      "Weight": "7 g"
    },
    "features": [
      "7 meter detection range",
      "120 degree angle",
      "Adjustable sensitivity and delay",
      "3.3V digital output",
      "Low power consumption"
    ],
    "whats_included": [
      "1x HC-SR501 PIR Sensor"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "NodeMCU"
    ],
    "tags": [
      "sensor",
      "pir",
      "motion",
      "security",
      "automation",
      "home automation"
    ],
    "rating": 4.5,
    "review_count": 89,
    "stock": 400,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 7,
    "id": "prod-pir-motion-sensor-hc-sr501",
    "is_published": true
  },
  {
    "name": "L298N Dual H-Bridge Motor Driver",
    "slug": "l298n-motor-driver",
    "description": "The L298N is a dual H-Bridge motor driver that allows speed and direction control of two DC motors or one stepper motor. Can drive motors up to 35V at 2A per coil.",
    "short_description": "Dual H-bridge for DC/stepper motor control",
    "category_id": "cat-motor-drivers",
    "brand_id": "brand-hiletgo",
    "sku": "MOT-L298N",
    "price": 299.0,
    "compare_at_price": 499.0,
    "images": [
      "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686430/pexels-photo-35686430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Driver Chip": "L298N",
      "Operating Voltage": "5-35V",
      "Logic Voltage": "5V",
      "Max Continuous Current": "2A per channel",
      "Max Peak Current": "3A per channel",
      "Channels": "2",
      "Drive Type": "Dual H-Bridge",
      "Dimensions": "43 x 43 x 27 mm",
      "Weight": "30 g"
    },
    "features": [
      "Dual H-bridge driver",
      "5-35V motor voltage",
      "2A per channel",
      "PWM speed control",
      "Built-in 5V regulator"
    ],
    "whats_included": [
      "1x L298N Module"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "STM32"
    ],
    "tags": [
      "motor driver",
      "l298n",
      "h-bridge",
      "dc motor",
      "robotics"
    ],
    "rating": 4.5,
    "review_count": 98,
    "stock": 300,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 30,
    "id": "prod-l298n-motor-driver",
    "is_published": true
  },
  {
    "name": "SG90 Micro Servo Motor 9g",
    "slug": "sg90-micro-servo",
    "description": "The SG90 is a tiny and lightweight servo motor that can rotate approximately 180 degrees (90 in each direction). Perfect for small robot arms, RC vehicles, and automation projects.",
    "short_description": "9g micro servo for robotics and RC projects",
    "category_id": "cat-motors",
    "brand_id": "brand-elegoo",
    "sku": "MOT-SG90",
    "price": 99.0,
    "compare_at_price": 179.0,
    "images": [
      "https://images.pexels.com/photos/35686432/pexels-photo-35686432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686448/pexels-photo-35686448.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686439/pexels-photo-35686439.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686432/pexels-photo-35686432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Weight": "9g",
      "Dimensions": "22.2 x 11.8 x 31 mm",
      "Stall Torque": "1.8 kg-cm (4.8V)",
      "Operating Speed": "0.1s/60 degree (4.8V)",
      "Operating Voltage": "4.8-6V",
      "Temperature Range": "0 to 55 C",
      "Rotation": "0-180 degrees",
      "Gear Type": "Nylon"
    },
    "features": [
      "180 degree rotation",
      "1.8 kg-cm torque",
      "Lightweight 9g design",
      "Nylon gears",
      "4.8-6V operation"
    ],
    "whats_included": [
      "1x SG90 Servo Motor",
      "3x Horns",
      "1x Mounting hardware set"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "RC receivers"
    ],
    "tags": [
      "servo",
      "motor",
      "robotics",
      "sg90",
      "micro servo"
    ],
    "rating": 4.4,
    "review_count": 87,
    "stock": 400,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 9,
    "id": "prod-sg90-micro-servo",
    "is_published": true
  },
  {
    "name": "NEMA 17 Stepper Motor 42BYG",
    "slug": "nema17-stepper-motor",
    "description": "NEMA 17 stepper motor with 1.8 degree step angle, 1.5A current, and 4-wire connection. Perfect for 3D printers, CNC machines, and precision positioning applications.",
    "short_description": "NEMA 17 bipolar stepper motor for CNC/3D printing",
    "category_id": "cat-motors",
    "brand_id": "brand-dfrobot",
    "sku": "MOT-NEMA17",
    "price": 899.0,
    "compare_at_price": 1299.0,
    "images": [
      "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686432/pexels-photo-35686432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Step Angle": "1.8 degrees",
      "Holding Torque": "4.8 kg-cm",
      "Rated Current": "1.5A",
      "Phase Resistance": "2.1 ohm",
      "Phase Inductance": "3.2 mH",
      "Number of Phases": "4",
      "Frame Size": "42 x 42 mm (NEMA 17)",
      "Body Length": "40 mm",
      "Shaft Diameter": "5 mm",
      "Weight": "350 g"
    },
    "features": [
      "1.8 degree step angle",
      "4.8 kg-cm holding torque",
      "NEMA 17 standard size",
      "4-wire bipolar",
      "Low noise"
    ],
    "whats_included": [
      "1x NEMA 17 Stepper Motor"
    ],
    "compatibility": [
      "A4988 Driver",
      "DRV8825 Driver",
      "TMC2209 Driver",
      "Arduino",
      "Raspberry Pi"
    ],
    "tags": [
      "stepper motor",
      "nema17",
      "cnc",
      "3d printer",
      "precision"
    ],
    "rating": 4.7,
    "review_count": 67,
    "stock": 100,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 350,
    "id": "prod-nema17-stepper-motor",
    "is_published": true
  },
  {
    "name": "A4988 Stepper Motor Driver Module",
    "slug": "a4988-stepper-driver",
    "description": "The A4988 is a complete stepper motor driver module with built-in translator for easy operation. Can drive bipolar stepper motors up to 2A per coil. Perfect for 3D printers and CNC machines.",
    "short_description": "Stepper motor driver with built-in translator",
    "category_id": "cat-motor-drivers",
    "brand_id": "brand-hiletgo",
    "sku": "MOT-A4988",
    "price": 199.0,
    "compare_at_price": 349.0,
    "images": [
      "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Driver IC": "A4988",
      "Max Current": "2A per coil",
      "Min Logic Voltage": "3V",
      "Max Motor Voltage": "35V",
      "Microstepping": "Full, 1/2, 1/4, 1/8, 1/16",
      "Dimensions": "20 x 15 mm",
      "Weight": "3 g"
    },
    "features": [
      "Up to 2A per coil",
      "5 step resolutions",
      "Built-in translator",
      "Adjustable current limit",
      "Over-temperature protection"
    ],
    "whats_included": [
      "1x A4988 Driver Module",
      "1x Heatsink"
    ],
    "compatibility": [
      "Arduino",
      "Raspberry Pi",
      "NEMA 17 motors",
      "3D printers",
      "CNC machines"
    ],
    "tags": [
      "stepper driver",
      "a4988",
      "cnc",
      "3d printer",
      "motor driver"
    ],
    "rating": 4.5,
    "review_count": 78,
    "stock": 200,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 3,
    "id": "prod-a4988-stepper-driver",
    "is_published": true
  },
  {
    "name": "12V DC Motor 200 RPM with Encoder",
    "slug": "dc-motor-12v-200rpm",
    "description": "A 12V DC motor with 200 RPM speed and built-in encoder for precise speed and position control. Perfect for robotics, conveyor systems, and automation projects. Metal gearbox for durability.",
    "short_description": "12V DC motor with encoder, 200 RPM",
    "category_id": "cat-motors",
    "brand_id": "brand-dfrobot",
    "sku": "MOT-DC-12V-200",
    "price": 699.0,
    "compare_at_price": 999.0,
    "images": [
      "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686432/pexels-photo-35686432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Rated Voltage": "12V",
      "No-Load Speed": "200 RPM",
      "Stall Torque": "5 kg-cm",
      "Gear Ratio": "1:30",
      "Encoder": "Yes (11PPR)",
      "Shaft Diameter": "6 mm",
      "Body Diameter": "37 mm",
      "Length": "50 mm",
      "Weight": "120 g"
    },
    "features": [
      "200 RPM speed",
      "Built-in encoder",
      "Metal gearbox",
      "12V operation",
      "5 kg-cm stall torque"
    ],
    "whats_included": [
      "1x DC Motor with Encoder",
      "1x Mounting Bracket",
      "1x Wheel adapter"
    ],
    "compatibility": [
      "Arduino with motor driver",
      "ESP32 with motor driver",
      "Raspberry Pi with motor driver"
    ],
    "tags": [
      "dc motor",
      "encoder",
      "robotics",
      "12v",
      "gear motor"
    ],
    "rating": 4.4,
    "review_count": 34,
    "stock": 80,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": true,
    "is_deal": false,
    "weight": 120,
    "id": "prod-dc-motor-12v-200rpm",
    "is_published": true
  },
  {
    "name": "28BYJ-48 Stepper Motor with ULN2003 Driver",
    "slug": "28byj-48-stepper-uln2003",
    "description": "A 5V unipolar stepper motor with ULN2003 driver board. Perfect for Arduino and robotics projects. Low cost and easy to use with included driver board.",
    "short_description": "5V stepper motor with ULN2003 driver board",
    "category_id": "cat-motors",
    "brand_id": "brand-elegoo",
    "sku": "MOT-28BYJ-48",
    "price": 199.0,
    "compare_at_price": 349.0,
    "images": [
      "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686432/pexels-photo-35686432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Type": "Unipolar Stepper",
      "Rated Voltage": "5V",
      "Step Angle": "5.625 deg/step",
      "Reduction Ratio": "1:64",
      "In-traction Torque": "300 g-cm",
      "Driver": "ULN2003",
      "Phases": "4",
      "Dimensions": "28 x 24 x 20 mm",
      "Weight": "40 g"
    },
    "features": [
      "5V unipolar stepper",
      "ULN2003 driver included",
      "1:64 gear reduction",
      "Low cost",
      "Easy Arduino interface"
    ],
    "whats_included": [
      "1x 28BYJ-48 Stepper Motor",
      "1x ULN2003 Driver Board"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi"
    ],
    "tags": [
      "stepper",
      "28byj-48",
      "uln2003",
      "motor",
      "arduino",
      "robotics"
    ],
    "rating": 4.4,
    "review_count": 67,
    "stock": 300,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 40,
    "id": "prod-28byj-48-stepper-uln2003",
    "is_published": true
  },
  {
    "name": "0.96 inch OLED Display Module I2C",
    "slug": "oled-display-096-i2c",
    "description": "A 0.96 inch monochrome OLED display with I2C interface. 128x64 pixel resolution with SSD1306 driver chip. Perfect for displaying sensor data, menus, and UI elements in your projects.",
    "short_description": "128x64 OLED with SSD1306 I2C interface",
    "category_id": "cat-displays",
    "brand_id": "brand-waveshare",
    "sku": "DISP-OLED-096",
    "price": 249.0,
    "compare_at_price": 399.0,
    "images": [
      "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686430/pexels-photo-35686430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686436/pexels-photo-35686436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Display": "OLED",
      "Resolution": "128 x 64",
      "Driver IC": "SSD1306",
      "Interface": "I2C",
      "Screen Size": "0.96 inch",
      "Color": "White on Black",
      "Operating Voltage": "3.3-5V",
      "Viewing Angle": "160 degrees",
      "Dimensions": "27 x 27 x 4 mm"
    },
    "features": [
      "128x64 resolution",
      "I2C interface",
      "No backlight needed",
      "Low power consumption",
      "3.3-5V compatible"
    ],
    "whats_included": [
      "1x OLED Display Module",
      "1x 4-pin header"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "STM32"
    ],
    "tags": [
      "oled",
      "display",
      "i2c",
      "ssd1306",
      "128x64"
    ],
    "rating": 4.5,
    "review_count": 67,
    "stock": 250,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": true,
    "is_deal": false,
    "weight": 5,
    "id": "prod-oled-display-096-i2c",
    "is_published": true
  },
  {
    "name": "16x2 LCD Display with I2C Module",
    "slug": "lcd-16x2-i2c",
    "description": "A 16x2 character LCD display with I2C backpack module. Blue backlight with white text. I2C interface reduces pin usage to just 2 wires. Perfect for displaying sensor data, menus, and project interfaces.",
    "short_description": "16x2 character LCD with I2C backpack",
    "category_id": "cat-displays",
    "brand_id": "brand-waveshare",
    "sku": "DISP-LCD-1602-I2C",
    "price": 199.0,
    "compare_at_price": 349.0,
    "images": [
      "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686430/pexels-photo-35686430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Display": "16x2 Character LCD",
      "Backlight": "Blue",
      "Text Color": "White",
      "Driver": "HD44780",
      "Interface": "I2C (PCF8574)",
      "Address": "0x27 or 0x3F",
      "Operating Voltage": "5V",
      "Dimensions": "80 x 36 x 11 mm",
      "Weight": "40 g"
    },
    "features": [
      "16x2 character display",
      "I2C interface (2 pins)",
      "Blue backlight",
      "Adjustable contrast",
      "HD44780 compatible"
    ],
    "whats_included": [
      "1x 16x2 LCD Display",
      "1x I2C Backpack (soldered)"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "PIC",
      "STM32"
    ],
    "tags": [
      "lcd",
      "display",
      "16x2",
      "i2c",
      "character display"
    ],
    "rating": 4.5,
    "review_count": 98,
    "stock": 200,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 40,
    "id": "prod-lcd-16x2-i2c",
    "is_published": true
  },
  {
    "name": "Creality Ender 3 V2 3D Printer",
    "slug": "creality-ender-3-v2",
    "description": "The Creality Ender 3 V2 is an upgraded version of the popular Ender 3 3D printer. Features a 220x220x250mm build volume, silent mainboard, carborundum glass bed, and a meanwell power supply. Perfect for makers and hobbyists.",
    "short_description": "FDM 3D printer with 220x220x250mm build volume",
    "category_id": "cat-3d-printing",
    "brand_id": "brand-creality",
    "sku": "3DP-END3V2",
    "price": 18999.0,
    "compare_at_price": 22999.0,
    "images": [
      "https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/30658383/pexels-photo-30658383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/20552667/pexels-photo-20552667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Print Technology": "FDM",
      "Build Volume": "220 x 220 x 250 mm",
      "Layer Resolution": "0.1-0.4 mm",
      "Nozzle Diameter": "0.4 mm",
      "Max Print Speed": "180 mm/s",
      "Filament Diameter": "1.75 mm",
      "Bed Type": "Carborundum Glass",
      "Connectivity": "USB, SD Card",
      "Power Supply": "24V Meanwell",
      "Dimensions": "475 x 470 x 620 mm",
      "Weight": "8 kg"
    },
    "features": [
      "220x220x250mm build volume",
      "Silent mainboard",
      "Carborundum glass bed",
      "Meanwell power supply",
      "Resume print function",
      "Open source firmware"
    ],
    "whats_included": [
      "1x Ender 3 V2 3D Printer",
      "1x Glass bed",
      "1x SD card with files",
      "1x Tool kit",
      "1x Power cable"
    ],
    "compatibility": [
      "Cura",
      "PrusaSlicer",
      "Creality Slicer"
    ],
    "tags": [
      "3d printer",
      "creality",
      "ender 3",
      "fdm",
      "maker",
      "hobbyist"
    ],
    "rating": 4.7,
    "review_count": 189,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 8000,
    "id": "prod-creality-ender-3-v2",
    "is_published": true
  },
  {
    "name": "Anycubic Photon Mono SE Resin 3D Printer",
    "slug": "anycubic-photon-mono-se",
    "description": "The Anycubic Photon Mono SE is a high-resolution resin 3D printer with a 6.06-inch monochrome LCD, 4.5 second layer exposure, and 2K resolution. Perfect for detailed miniatures, jewelry, and dental models.",
    "short_description": "Resin 3D printer with 2K monochrome LCD",
    "category_id": "cat-3d-printing",
    "brand_id": "brand-anycubic",
    "sku": "3DP-PHOTON-MONO-SE",
    "price": 16999.0,
    "compare_at_price": 19999.0,
    "images": [
      "https://images.pexels.com/photos/30720501/pexels-photo-30720501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/33977820/pexels-photo-33977820.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/30658383/pexels-photo-30658383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/30720501/pexels-photo-30720501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Print Technology": "MSLA Resin",
      "Resolution": "2K (1620 x 2560)",
      "Build Volume": "130 x 78 x 160 mm",
      "Layer Height": "0.025-0.1 mm",
      "Light Source": "UV LED",
      "Exposure Time": "1.5-4 seconds",
      "Screen": "6.06 inch monochrome",
      "Connectivity": "USB",
      "Dimensions": "220 x 225 x 415 mm",
      "Weight": "8 kg"
    },
    "features": [
      "2K monochrome LCD",
      "Fast 1.5-4s exposure",
      "High-resolution resin printing",
      "130x78x160mm build volume",
      "USB connectivity"
    ],
    "whats_included": [
      "1x Anycubic Photon Mono SE",
      "1x Power Adapter",
      "1x Resin Vat",
      "1x Build Platform",
      "1x Tools Kit",
      "1x Manual"
    ],
    "compatibility": [
      "Anycubic Photon Workshop",
      "Chitubox"
    ],
    "tags": [
      "3d printer",
      "resin",
      "anycubic",
      "photon",
      "sls",
      "detailed"
    ],
    "rating": 4.6,
    "review_count": 56,
    "stock": 15,
    "is_featured": true,
    "is_bestseller": false,
    "is_new_arrival": true,
    "is_deal": true,
    "weight": 8000,
    "id": "prod-anycubic-photon-mono-se",
    "is_published": true
  },
  {
    "name": "PLA 3D Printer Filament 1.75mm 1kg - White",
    "slug": "pla-filament-175-white",
    "description": "High-quality PLA 3D printer filament in 1.75mm diameter. 1kg spool in white color. Low warping, easy to print, and biodegradable. Perfect for prototyping and decorative prints.",
    "short_description": "1kg PLA filament spool, 1.75mm, white",
    "category_id": "cat-3d-printing",
    "brand_id": "brand-creality",
    "sku": "3DP-PLA-WHT-1KG",
    "price": 999.0,
    "compare_at_price": 1499.0,
    "images": [
      "https://images.pexels.com/photos/20552667/pexels-photo-20552667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/31137405/pexels-photo-31137405.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/19871842/pexels-photo-19871842.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/20552667/pexels-photo-20552667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Material": "PLA",
      "Diameter": "1.75 mm",
      "Diameter Tolerance": "+/- 0.03 mm",
      "Weight": "1 kg",
      "Color": "White",
      "Print Temperature": "190-220 C",
      "Bed Temperature": "50-60 C",
      "Density": "1.25 g/cm3",
      "Tensile Strength": "60 MPa",
      "Biodegradable": "Yes"
    },
    "features": [
      "1.75mm diameter",
      "Low warping",
      "Easy to print",
      "Biodegradable",
      "Consistent diameter"
    ],
    "whats_included": [
      "1x 1kg PLA Filament Spool"
    ],
    "compatibility": [
      "Most FDM 3D printers",
      "Creality Ender 3",
      "Prusa MK3",
      "Anycubic"
    ],
    "tags": [
      "filament",
      "pla",
      "3d printing",
      "1.75mm",
      "white"
    ],
    "rating": 4.6,
    "review_count": 78,
    "stock": 150,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 1000,
    "id": "prod-pla-filament-175-white",
    "is_published": true
  },
  {
    "name": "PLA 3D Printer Filament 1.75mm 1kg - Black",
    "slug": "pla-filament-175-black",
    "description": "High-quality PLA 3D printer filament in 1.75mm diameter. 1kg spool in black color. Low warping, easy to print, and biodegradable. Perfect for functional parts and decorative prints.",
    "short_description": "1kg PLA filament spool, 1.75mm, black",
    "category_id": "cat-3d-printing",
    "brand_id": "brand-prusa",
    "sku": "3DP-PLA-BLK-1KG",
    "price": 1099.0,
    "compare_at_price": 1599.0,
    "images": [
      "https://images.pexels.com/photos/19871842/pexels-photo-19871842.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/20552667/pexels-photo-20552667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/19871842/pexels-photo-19871842.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Material": "PLA",
      "Diameter": "1.75 mm",
      "Diameter Tolerance": "+/- 0.03 mm",
      "Weight": "1 kg",
      "Color": "Black",
      "Print Temperature": "190-220 C",
      "Bed Temperature": "50-60 C",
      "Density": "1.25 g/cm3",
      "Tensile Strength": "60 MPa",
      "Biodegradable": "Yes"
    },
    "features": [
      "1.75mm diameter",
      "Low warping",
      "Easy to print",
      "Biodegradable",
      "Consistent diameter"
    ],
    "whats_included": [
      "1x 1kg PLA Filament Spool"
    ],
    "compatibility": [
      "Most FDM 3D printers",
      "Creality Ender 3",
      "Prusa MK3",
      "Anycubic"
    ],
    "tags": [
      "filament",
      "pla",
      "3d printing",
      "1.75mm",
      "black"
    ],
    "rating": 4.7,
    "review_count": 67,
    "stock": 120,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 1000,
    "id": "prod-pla-filament-175-black",
    "is_published": true
  },
  {
    "name": "3D Printer Nozzle Set 0.4mm - 10 Pieces",
    "slug": "3d-printer-nozzle-set-10",
    "description": "A set of 10 brass 3D printer nozzles in 0.4mm diameter. Compatible with most FDM 3D printers including Creality Ender 3, Prusa, and Anycubic. Easy to install and replace.",
    "short_description": "10x 0.4mm brass nozzles for FDM printers",
    "category_id": "cat-3d-printer-parts",
    "brand_id": "brand-creality",
    "sku": "3DP-NOZZLE-04-10",
    "price": 249.0,
    "compare_at_price": 449.0,
    "images": [
      "https://images.pexels.com/photos/31137405/pexels-photo-31137405.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/20688553/pexels-photo-20688553.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/31137405/pexels-photo-31137405.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Material": "Brass",
      "Nozzle Diameter": "0.4 mm",
      "Thread": "M6",
      "Quantity": "10 pieces",
      "Compatibility": "MK8 style",
      "Temperature": "Up to 260 C",
      "Weight": "4 g each"
    },
    "features": [
      "10 brass nozzles",
      "0.4mm diameter",
      "M6 thread",
      "MK8 compatible",
      "Up to 260C"
    ],
    "whats_included": [
      "10x 0.4mm Brass Nozzles",
      "1x Cleaning needle"
    ],
    "compatibility": [
      "Creality Ender 3",
      "Prusa MK3",
      "Anycubic i3",
      "Most MK8-style hotends"
    ],
    "tags": [
      "3d printer",
      "nozzle",
      "parts",
      "brass",
      "0.4mm",
      "mk8"
    ],
    "rating": 4.5,
    "review_count": 45,
    "stock": 300,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 40,
    "id": "prod-3d-printer-nozzle-set-10",
    "is_published": true
  },
  {
    "name": "BLTouch Auto Bed Leveling Sensor for 3D Printers",
    "slug": "bltouch-auto-leveling-sensor",
    "description": "The BLTouch is an auto bed leveling sensor for 3D printers. Uses a Hall effect sensor to detect the bed surface with high precision. Compatible with most 3D printers including Creality Ender 3, Prusa, and Anycubic.",
    "short_description": "Auto bed leveling sensor for 3D printers",
    "category_id": "cat-3d-printer-parts",
    "brand_id": "brand-creality",
    "sku": "3DP-BLTOUCH-V3",
    "price": 1299.0,
    "compare_at_price": 1999.0,
    "images": [
      "https://images.pexels.com/photos/30658383/pexels-photo-30658383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/30658383/pexels-photo-30658383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Type": "Hall Effect Sensor",
      "Operating Voltage": "5V",
      "Probe Range": "2.5 mm",
      "Precision": "+/- 0.005 mm",
      "Mounting": "Standard bracket included",
      "Compatibility": "Most 3D printers",
      "Cable Length": "1 m",
      "Weight": "10 g"
    },
    "features": [
      "High precision (+/- 0.005mm)",
      "Auto bed leveling",
      "Compatible with most printers",
      "Easy installation",
      "Includes mounting bracket"
    ],
    "whats_included": [
      "1x BLTouch Sensor",
      "1x Mounting Bracket",
      "1x Extension Cable",
      "1x Screws pack"
    ],
    "compatibility": [
      "Creality Ender 3",
      "Prusa MK3",
      "Anycubic i3",
      "SKR mainboards"
    ],
    "tags": [
      "3d printer",
      "bltouch",
      "auto level",
      "sensor",
      "parts",
      "upgrade"
    ],
    "rating": 4.7,
    "review_count": 89,
    "stock": 80,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 10,
    "id": "prod-bltouch-auto-leveling-sensor",
    "is_published": true
  },
  {
    "name": "Soldering Iron Kit 60W Adjustable Temperature",
    "slug": "soldering-iron-kit-60w",
    "description": "A complete soldering iron kit with 60W adjustable temperature soldering iron, 5 soldering tips, solder wire, desoldering pump, stand, and tweezers. Perfect for electronics repair and DIY projects.",
    "short_description": "60W adjustable temperature soldering kit with accessories",
    "category_id": "cat-tools",
    "brand_id": "brand-elegoo",
    "sku": "TOOL-SOL-60W",
    "price": 799.0,
    "compare_at_price": 1299.0,
    "images": [
      "https://images.pexels.com/photos/4709377/pexels-photo-4709377.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/4709369/pexels-photo-4709369.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/3520692/pexels-photo-3520692.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/4709377/pexels-photo-4709377.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Power": "60W",
      "Temperature Range": "200-450 C",
      "Temperature Control": "Adjustable",
      "Input Voltage": "220V AC",
      "Tip Type": "900M series",
      "Heating Element": "Ceramic",
      "Cable Length": "150 cm",
      "Weight": "200 g (iron only)"
    },
    "features": [
      "60W adjustable temperature",
      "5 replacement tips",
      "Ceramic heating element",
      "Fast heat-up",
      "Complete accessory kit"
    ],
    "whats_included": [
      "1x Soldering Iron",
      "5x Soldering Tips",
      "1x Solder Wire",
      "1x Desoldering Pump",
      "1x Stand",
      "1x Tweezers",
      "1x Carrying Case"
    ],
    "compatibility": [
      "Electronics repair",
      "PCB soldering",
      "DIY projects"
    ],
    "tags": [
      "soldering",
      "iron",
      "tool",
      "electronics",
      "repair",
      "kit"
    ],
    "rating": 4.5,
    "review_count": 92,
    "stock": 120,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": false,
    "is_deal": true,
    "weight": 500,
    "id": "prod-soldering-iron-kit-60w",
    "is_published": true
  },
  {
    "name": "Digital Multimeter with AC/DC Voltage and Current",
    "slug": "digital-multimeter-dt830b",
    "description": "A compact digital multimeter for measuring AC/DC voltage, DC current, resistance, and transistor hFE. Features a 3.5 digit LCD display, continuity buzzer, and diode test. Perfect for electronics troubleshooting.",
    "short_description": "Digital multimeter for voltage, current, resistance",
    "category_id": "cat-tools",
    "brand_id": "brand-elegoo",
    "sku": "TOOL-MM-DT830B",
    "price": 199.0,
    "compare_at_price": 349.0,
    "images": [
      "https://images.pexels.com/photos/4709369/pexels-photo-4709369.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/3520692/pexels-photo-3520692.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/4709369/pexels-photo-4709369.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Display": "3.5 digit LCD",
      "DC Voltage": "200mV-600V",
      "AC Voltage": "200-600V",
      "DC Current": "2mA-10A",
      "Resistance": "200 ohm-2M ohm",
      "Battery": "9V (included)",
      "Continuity": "Yes (buzzer)",
      "Diode Test": "Yes",
      "Dimensions": "126 x 70 x 25 mm",
      "Weight": "150 g"
    },
    "features": [
      "Measures AC/DC voltage",
      "DC current and resistance",
      "Continuity buzzer",
      "Diode test",
      "3.5 digit LCD",
      "Compact and portable"
    ],
    "whats_included": [
      "1x Digital Multimeter",
      "1x 9V Battery",
      "2x Test Probes"
    ],
    "compatibility": [
      "Electronics repair",
      "DIY projects",
      "Automotive testing"
    ],
    "tags": [
      "multimeter",
      "tool",
      "measurement",
      "electronics",
      "diy"
    ],
    "rating": 4.3,
    "review_count": 78,
    "stock": 150,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 150,
    "id": "prod-digital-multimeter-dt830b",
    "is_published": true
  },
  {
    "name": "YantraX Arduino Starter Kit for Beginners",
    "slug": "yantrax-arduino-starter-kit",
    "description": "Complete Arduino starter kit with Arduino Uno R3 compatible board, 200+ components including sensors, motors, displays, jumper wires, breadboard, and a detailed project tutorial guide. Perfect for students and hobbyists.",
    "short_description": "Complete Arduino kit with 200+ components and tutorial guide",
    "category_id": "cat-student-project-kits",
    "brand_id": "brand-yantrax",
    "sku": "KIT-ARD-START-200",
    "price": 2499.0,
    "compare_at_price": 3999.0,
    "images": [
      "https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Board": "Arduino Uno R3 Compatible",
      "Components": "200+",
      "Projects": "15 included",
      "Breadboard": "830-point",
      "Jumper Wires": "65 pieces",
      "Sensors": "HC-SR04, DHT11, IR, PIR",
      "Display": "16x2 LCD",
      "Motor": "SG90 Servo",
      "Storage": "Plastic organizer case"
    },
    "features": [
      "200+ electronic components",
      "15 project tutorials",
      "Arduino Uno R3 compatible board",
      "830-point breadboard",
      "Plastic organizer case",
      "Step-by-step guide"
    ],
    "whats_included": [
      "1x Arduino Uno R3 Compatible Board",
      "1x 830-point Breadboard",
      "65x Jumper Wires",
      "1x HC-SR04 Ultrasonic Sensor",
      "1x DHT11 Sensor",
      "1x IR Sensor",
      "1x PIR Sensor",
      "1x 16x2 LCD Display",
      "1x SG90 Servo Motor",
      "1x L298N Motor Driver",
      "1x DC Motor",
      "1x Buzzer",
      "1x LED Pack",
      "1x Resistor Pack",
      "1x Project Guide PDF",
      "1x Storage Case"
    ],
    "compatibility": [
      "Arduino IDE",
      "STEM education",
      "School projects",
      "College projects"
    ],
    "tags": [
      "arduino",
      "starter kit",
      "beginner",
      "student",
      "education",
      "stem",
      "kit"
    ],
    "rating": 4.8,
    "review_count": 234,
    "stock": 80,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": true,
    "is_deal": true,
    "weight": 1500,
    "id": "prod-yantrax-arduino-starter-kit",
    "is_published": true
  },
  {
    "name": "YantraX 4-DOF Robot Arm Kit",
    "slug": "yantrax-robot-arm-kit",
    "description": "A 4-degree-of-freedom robot arm kit with acrylic frame, 4 SG90 servo motors, and Arduino-compatible control board. Perfect for learning robotics, inverse kinematics, and automation. Includes a joystick controller.",
    "short_description": "4-DOF servo robot arm kit with Arduino control",
    "category_id": "cat-robotics-kits",
    "brand_id": "brand-yantrax",
    "sku": "KIT-ROBOT-ARM-4DOF",
    "price": 2999.0,
    "compare_at_price": 4499.0,
    "images": [
      "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/8439074/pexels-photo-8439074.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/8439000/pexels-photo-8439000.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Degrees of Freedom": "4",
      "Material": "Acrylic",
      "Servo Motors": "4x SG90",
      "Control": "Joystick + Arduino",
      "Power": "5V DC (USB or adapter)",
      "Payload": "100g max",
      "Reach": "25 cm",
      "Assembly": "Required (approx 2 hours)"
    },
    "features": [
      "4 degrees of freedom",
      "Acrylic frame",
      "4 SG90 servo motors",
      "Joystick controller",
      "Arduino-compatible",
      "Learn inverse kinematics"
    ],
    "whats_included": [
      "4x SG90 Servo Motors",
      "1x Arduino-compatible Board",
      "1x Joystick Module",
      "1x Acrylic Frame Set",
      "1x USB Cable",
      "1x Assembly Guide"
    ],
    "compatibility": [
      "Arduino IDE",
      "Custom Arduino code"
    ],
    "tags": [
      "robotics",
      "robot arm",
      "kit",
      "servo",
      "arduino",
      "automation",
      "stem"
    ],
    "rating": 4.6,
    "review_count": 78,
    "stock": 60,
    "is_featured": true,
    "is_bestseller": true,
    "is_new_arrival": true,
    "is_deal": true,
    "weight": 800,
    "id": "prod-yantrax-robot-arm-kit",
    "is_published": true
  },
  {
    "name": "YantraX Arduino Smart Dustbin DIY Kit",
    "slug": "yantrax-smart-dustbin-kit",
    "description": "A complete DIY kit to build an Arduino-based smart dustbin that opens automatically when you bring your hand near it. Includes an Arduino-compatible board, HC-SR04 ultrasonic sensor, SG90 servo motor, and all necessary components. Perfect for student projects.",
    "short_description": "Arduino smart dustbin project kit with all components",
    "category_id": "cat-diy-kits",
    "brand_id": "brand-yantrax",
    "sku": "KIT-SMART-DUSTBIN",
    "price": 1499.0,
    "compare_at_price": 2299.0,
    "images": [
      "https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Board": "Arduino Uno R3 Compatible",
      "Sensor": "HC-SR04 Ultrasonic",
      "Motor": "SG90 Servo",
      "Power": "USB or 9V battery",
      "Assembly Time": "2-3 hours",
      "Difficulty": "Beginner",
      "Code": "Included (Arduino sketch)"
    },
    "features": [
      "Complete smart dustbin kit",
      "Auto-open with hand detection",
      "Arduino-based",
      "Beginner friendly",
      "Includes code and guide"
    ],
    "whats_included": [
      "1x Arduino Uno Compatible Board",
      "1x HC-SR04 Ultrasonic Sensor",
      "1x SG90 Servo Motor",
      "1x Servo Mounting Bracket",
      "1x Dustbin Body (acrylic)",
      "1x Jumper Wires",
      "1x USB Cable",
      "1x Project Guide"
    ],
    "compatibility": [
      "Arduino IDE"
    ],
    "tags": [
      "arduino",
      "smart dustbin",
      "diy kit",
      "student project",
      "ultrasonic",
      "servo",
      "beginner"
    ],
    "rating": 4.8,
    "review_count": 67,
    "stock": 40,
    "is_featured": true,
    "is_bestseller": false,
    "is_new_arrival": true,
    "is_deal": true,
    "weight": 500,
    "id": "prod-yantrax-smart-dustbin-kit",
    "is_published": true
  },
  {
    "name": "YantraX IoT Weather Station Kit with ESP8266",
    "slug": "yantrax-iot-weather-station",
    "description": "Build your own IoT weather station with ESP8266 WiFi module, DHT22 temperature/humidity sensor, BMP280 pressure sensor, and OLED display. Upload data to the cloud and monitor from anywhere. Complete kit with all components.",
    "short_description": "ESP8266-based IoT weather station with cloud monitoring",
    "category_id": "cat-diy-kits",
    "brand_id": "brand-yantrax",
    "sku": "KIT-IOT-WEATHER",
    "price": 1999.0,
    "compare_at_price": 2999.0,
    "images": [
      "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Controller": "NodeMCU ESP8266",
      "Sensors": "DHT22, BMP280",
      "Display": "0.96 OLED I2C",
      "Connectivity": "WiFi",
      "Power": "USB or 5V adapter",
      "Assembly Time": "3-4 hours",
      "Difficulty": "Intermediate",
      "Cloud": "ThingsBoard / custom server"
    },
    "features": [
      "WiFi-connected weather station",
      "Temperature",
      "humidity",
      "pressure sensors",
      "OLED display",
      "Cloud data upload",
      "Intermediate level"
    ],
    "whats_included": [
      "1x NodeMCU ESP8266 Board",
      "1x DHT22 Sensor",
      "1x BMP280 Sensor",
      "1x 0.96 OLED Display",
      "1x Breadboard",
      "1x Jumper Wires",
      "1x USB Cable",
      "1x Project Guide"
    ],
    "compatibility": [
      "Arduino IDE",
      "PlatformIO",
      "ThingsBoard",
      "Custom IoT platforms"
    ],
    "tags": [
      "iot",
      "weather station",
      "esp8266",
      "wifi",
      "sensors",
      "cloud",
      "intermediate"
    ],
    "rating": 4.7,
    "review_count": 45,
    "stock": 35,
    "is_featured": true,
    "is_bestseller": false,
    "is_new_arrival": true,
    "is_deal": true,
    "weight": 300,
    "id": "prod-yantrax-iot-weather-station",
    "is_published": true
  },
  {
    "name": "830-Point Solderless Breadboard with Power Rails",
    "slug": "breadboard-830-point",
    "description": "A high-quality 830-point solderless breadboard with power rails. Perfect for prototyping circuits without soldering. Compatible with standard jumper wires and electronic components.",
    "short_description": "830-point solderless breadboard for prototyping",
    "category_id": "cat-electronics-components",
    "brand_id": "brand-elegoo",
    "sku": "COMP-BB-830",
    "price": 99.0,
    "compare_at_price": 199.0,
    "images": [
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Points": "830",
      "Power Rails": "4",
      "Dimensions": "165 x 55 x 9 mm",
      "Material": "ABS Plastic",
      "Wire Gauge": "AWG 21-26",
      "Color": "White",
      "Self-Adhesive": "Yes"
    },
    "features": [
      "830 tie-points",
      "Power rails on both sides",
      "Self-adhesive backing",
      "Standard spacing",
      "Reusable"
    ],
    "whats_included": [
      "1x 830-point Breadboard"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "All through-hole components"
    ],
    "tags": [
      "breadboard",
      "prototyping",
      "solderless",
      "electronics",
      "diy"
    ],
    "rating": 4.7,
    "review_count": 145,
    "stock": 800,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 50,
    "id": "prod-breadboard-830-point",
    "is_published": true
  },
  {
    "name": "40-Piece M-M Jumper Wire Dupont Cable Set",
    "slug": "jumper-wires-m-m-40",
    "description": "A set of 40 male-to-male jumper wires in 10cm length. 20 different colors. Perfect for breadboard prototyping and connecting components to development boards.",
    "short_description": "40pc male-to-male Dupont jumper wires",
    "category_id": "cat-electronics-components",
    "brand_id": "brand-elegoo",
    "sku": "COMP-JW-MM-40",
    "price": 79.0,
    "compare_at_price": 149.0,
    "images": [
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Type": "Male to Male",
      "Length": "10 cm / 20 cm",
      "Quantity": "40 pieces",
      "Wire Gauge": "AWG 26",
      "Colors": "10 different colors",
      "Connector": "Dupont",
      "Material": "Copper + PVC"
    },
    "features": [
      "40 pieces",
      "10 colors",
      "Standard Dupont spacing",
      "Compatible with breadboards",
      "Flexible PVC insulation"
    ],
    "whats_included": [
      "1x 40-piece Jumper Wire Set"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "Breadboards"
    ],
    "tags": [
      "jumper wires",
      "dupont",
      "breadboard",
      "prototyping",
      "cables"
    ],
    "rating": 4.6,
    "review_count": 89,
    "stock": 1000,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 80,
    "id": "prod-jumper-wires-m-m-40",
    "is_published": true
  },
  {
    "name": "4-Channel 5V Relay Module",
    "slug": "relay-module-4ch-5v",
    "description": "A 4-channel 5V relay module with optocoupler isolation. Can control high-voltage appliances up to 250V AC / 10A. Perfect for home automation, IoT, and industrial control projects.",
    "short_description": "4-channel isolated relay module for automation",
    "category_id": "cat-electronics-components",
    "brand_id": "brand-hiletgo",
    "sku": "COMP-RELAY-4CH",
    "price": 299.0,
    "compare_at_price": 499.0,
    "images": [
      "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686442/pexels-photo-35686442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Channels": "4",
      "Trigger Voltage": "5V DC",
      "Max Switching": "250V AC / 10A",
      "Optocoupler": "Yes",
      "Trigger Mode": "Active LOW",
      "Dimensions": "75 x 55 x 20 mm",
      "Weight": "60 g"
    },
    "features": [
      "4 independent relay channels",
      "Optocoupler isolation",
      "250V AC / 10A switching",
      "Active LOW trigger",
      "Status LEDs"
    ],
    "whats_included": [
      "1x 4-Channel Relay Module"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "NodeMCU"
    ],
    "tags": [
      "relay",
      "home automation",
      "iot",
      "5v",
      "4 channel"
    ],
    "rating": 4.5,
    "review_count": 67,
    "stock": 200,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 60,
    "id": "prod-relay-module-4ch-5v",
    "is_published": true
  },
  {
    "name": "Resistor Kit 1/4W 600-Piece 30 Values",
    "slug": "resistor-kit-600pc-30val",
    "description": "A complete resistor kit with 600 pieces in 30 different values from 10 ohm to 1M ohm. 1/4W carbon film resistors with 5% tolerance. Organized in a labeled storage bag for easy selection.",
    "short_description": "600-piece 1/4W resistor assortment kit",
    "category_id": "cat-electronics-components",
    "brand_id": "brand-elegoo",
    "sku": "COMP-RES-600-30",
    "price": 349.0,
    "compare_at_price": 599.0,
    "images": [
      "https://images.pexels.com/photos/4584612/pexels-photo-4584612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/4584612/pexels-photo-4584612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Type": "Carbon Film",
      "Power Rating": "1/4W",
      "Tolerance": "+/- 5%",
      "Values": "30 different (10 ohm to 1M ohm)",
      "Quantity": "600 pieces (20 each value)",
      "Organization": "Labeled storage bag"
    },
    "features": [
      "600 pieces total",
      "30 different values",
      "1/4W power rating",
      "5% tolerance",
      "Organized storage"
    ],
    "whats_included": [
      "1x Resistor Kit (600 pieces)",
      "1x Storage Bag"
    ],
    "compatibility": [
      "All through-hole PCB projects",
      "Breadboard prototyping"
    ],
    "tags": [
      "resistor",
      "component",
      "kit",
      "electronics",
      "carbon film"
    ],
    "rating": 4.6,
    "review_count": 56,
    "stock": 100,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 200,
    "id": "prod-resistor-kit-600pc-30val",
    "is_published": true
  },
  {
    "name": "7805 5V Voltage Regulator - 10 Pack",
    "slug": "7805-voltage-regulator-10pk",
    "description": "A pack of 10 7805 5V positive voltage regulator ICs. Provides fixed 5V output from 7-35V input. Essential component for powering 5V circuits from higher voltage sources.",
    "short_description": "10x 7805 5V linear voltage regulator ICs",
    "category_id": "cat-electronics-components",
    "brand_id": "brand-sparkfun",
    "sku": "COMP-7805-10",
    "price": 99.0,
    "compare_at_price": 199.0,
    "images": [
      "https://images.pexels.com/photos/4584612/pexels-photo-4584612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/3520692/pexels-photo-3520692.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/4584612/pexels-photo-4584612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Type": "Linear Voltage Regulator",
      "Output Voltage": "5V DC",
      "Input Voltage": "7-35V DC",
      "Max Output Current": "1A",
      "Dropout Voltage": "2V",
      "Package": "TO-220",
      "Operating Temperature": "0 to 125 C",
      "Quantity": "10 pieces"
    },
    "features": [
      "Fixed 5V output",
      "Up to 1A output current",
      "TO-220 package",
      "7-35V input range",
      "10 pieces included"
    ],
    "whats_included": [
      "10x 7805 Voltage Regulator ICs"
    ],
    "compatibility": [
      "Arduino projects",
      "Power supply circuits",
      "Breadboard prototyping"
    ],
    "tags": [
      "voltage regulator",
      7805,
      "5v",
      "component",
      "power supply"
    ],
    "rating": 4.6,
    "review_count": 45,
    "stock": 500,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 50,
    "id": "prod-7805-voltage-regulator-10pk",
    "is_published": true
  },
  {
    "name": "WS2812B Addressable LED Strip 1m 60 LEDs",
    "slug": "neopixel-led-strip-1m-60",
    "description": "A 1-meter addressable RGB LED strip with 60 WS2812B LEDs. Each LED is individually addressable for stunning lighting effects. Perfect for IoT displays, ambient lighting, and creative projects.",
    "short_description": "Addressable RGB LED strip, 60 LEDs/meter",
    "category_id": "cat-electronics-components",
    "brand_id": "brand-adafruit",
    "sku": "COMP-LED-WS2812-1M",
    "price": 499.0,
    "compare_at_price": 799.0,
    "images": [
      "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "LED Type": "WS2812B",
      "LEDs per meter": "60",
      "Strip Length": "1 meter",
      "Operating Voltage": "5V DC",
      "Power": "18W per meter",
      "Interface": "Single-wire digital",
      "Colors": "16.7 million",
      "Waterproof": "IP30",
      "Width": "10 mm"
    },
    "features": [
      "60 individually addressable LEDs",
      "16.7 million colors",
      "Single-wire interface",
      "5V operation",
      "Chainable"
    ],
    "whats_included": [
      "1x 1m LED Strip",
      "1x 3-pin connector"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "NeoPixel library"
    ],
    "tags": [
      "led",
      "neopixel",
      "ws2812",
      "rgb",
      "addressable",
      "lighting"
    ],
    "rating": 4.7,
    "review_count": 89,
    "stock": 150,
    "is_featured": false,
    "is_bestseller": true,
    "is_new_arrival": true,
    "is_deal": false,
    "weight": 50,
    "id": "prod-neopixel-led-strip-1m-60",
    "is_published": true
  },
  {
    "name": "LoRa SX1278 433MHz Long Range Module",
    "slug": "lora-sx1278-433mhz",
    "description": "The SX1278 LoRa module provides long-range, low-power wireless communication up to 15km. Operating at 433MHz with SPI interface. Perfect for IoT, remote sensing, and long-range telemetry applications.",
    "short_description": "Long-range LoRa wireless module 433MHz",
    "category_id": "cat-communication-modules",
    "brand_id": "brand-seeed-studio",
    "sku": "COMM-LORA-433",
    "price": 399.0,
    "compare_at_price": 599.0,
    "images": [
      "https://images.pexels.com/photos/35686436/pexels-photo-35686436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686430/pexels-photo-35686430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35686436/pexels-photo-35686436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Frequency": "433 MHz",
      "Modulation": "LoRa / FSK",
      "Range": "Up to 15 km",
      "Max Data Rate": "300 kbps",
      "Interface": "SPI",
      "Operating Voltage": "3.3V",
      "Output Power": "+20 dBm",
      "Sensitivity": "-148 dBm",
      "Dimensions": "24 x 24 x 3 mm",
      "Weight": "3 g"
    },
    "features": [
      "Up to 15km range",
      "Low power consumption",
      "SPI interface",
      "433MHz frequency",
      "LoRa modulation"
    ],
    "whats_included": [
      "1x SX1278 LoRa Module",
      "1x Antenna",
      "1x Header pins"
    ],
    "compatibility": [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "STM32"
    ],
    "tags": [
      "lora",
      "wireless",
      "433mhz",
      "iot",
      "long range",
      "telemetry"
    ],
    "rating": 4.5,
    "review_count": 34,
    "stock": 100,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": true,
    "is_deal": false,
    "weight": 3,
    "id": "prod-lora-sx1278-433mhz",
    "is_published": true
  },
  {
    "name": "5V 3A USB Power Supply Adapter",
    "slug": "usb-power-supply-5v-3a",
    "description": "A reliable 5V 3A USB power supply adapter for powering development boards, Raspberry Pi, and other electronics projects. Features over-current and short-circuit protection.",
    "short_description": "5V 3A USB power adapter for dev boards",
    "category_id": "cat-accessories",
    "brand_id": "brand-sparkfun",
    "sku": "ACC-USB-5V3A",
    "price": 349.0,
    "compare_at_price": 499.0,
    "images": [
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "primary_image": "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "specifications": {
      "Output Voltage": "5V DC",
      "Output Current": "3A (max)",
      "Input Voltage": "100-240V AC",
      "Connector": "USB-A",
      "Cable Length": "1.5 m",
      "Protection": "Over-current, Short-circuit",
      "Certification": "CE, FCC",
      "Weight": "100 g"
    },
    "features": [
      "5V 3A output",
      "Over-current protection",
      "Short-circuit protection",
      "1.5m cable",
      "CE/FCC certified"
    ],
    "whats_included": [
      "1x 5V 3A USB Power Adapter"
    ],
    "compatibility": [
      "Raspberry Pi 4",
      "Arduino",
      "ESP32",
      "Most USB-powered devices"
    ],
    "tags": [
      "power supply",
      "adapter",
      "usb",
      "5v",
      "accessories"
    ],
    "rating": 4.4,
    "review_count": 45,
    "stock": 200,
    "is_featured": false,
    "is_bestseller": false,
    "is_new_arrival": false,
    "is_deal": false,
    "weight": 100,
    "id": "prod-usb-power-supply-5v-3a",
    "is_published": true
  }
];

export const mockBanners: any[] = [
  {
    "title": "BUILD SOMETHING AMAZING",
    "subtitle": "Robotics & Electronics",
    "description": "Explore robotics kits, development boards, sensors and smart hardware for your next project. From Arduino to Raspberry Pi, we have everything you need to bring your ideas to life.",
    "image_url": "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "category_label": "Robotics & Automation",
    "cta_text": "Shop Now",
    "cta_link": "/shop?category=robotics",
    "sort_order": 1,
    "is_active": true,
    "id": "banner-1"
  },
  {
    "title": "3D PRINT YOUR IDEAS",
    "subtitle": "3D Printing Collection",
    "description": "Discover a wide range of 3D printers, filaments, and upgrade parts. From beginner-friendly models to professional-grade machines, find the perfect 3D printer for your maker journey.",
    "image_url": "https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "category_label": "3D Printing",
    "cta_text": "Explore 3D Printing",
    "cta_link": "/shop?category=3d-printing",
    "sort_order": 2,
    "is_active": true,
    "id": "banner-2"
  },
  {
    "title": "SMART IOT PROJECTS",
    "subtitle": "IoT & Connected Devices",
    "description": "Build connected IoT projects with ESP32, sensors, and cloud platforms. Everything you need for home automation, weather stations, and smart devices.",
    "image_url": "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "category_label": "IoT & Electronics",
    "cta_text": "Build IoT Projects",
    "cta_link": "/shop?category=iot",
    "sort_order": 3,
    "is_active": true,
    "id": "banner-3"
  }
];

export const mockPromoCards: any[] = [
  {
    "title": "Daily Deals",
    "description": "Up to 40% off on selected electronics and robotics components. Limited time offers with new deals every day.",
    "image_url": "https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "cta_text": "View Deals",
    "cta_link": "/deals",
    "background_color": "bg-blue-50",
    "sort_order": 1,
    "is_active": true,
    "id": "promo-1"
  },
  {
    "title": "Projects & Lab",
    "description": "Explore student projects, DIY kits, and tutorials. Build amazing electronics projects with our curated kits and guides.",
    "image_url": "https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "cta_text": "Browse Projects",
    "cta_link": "/projects",
    "background_color": "bg-amber-50",
    "sort_order": 2,
    "is_active": true,
    "id": "promo-2"
  }
];

export const mockDeals: any[] = [
  {
    "product_id": "prod-arduino-uno-r3",
    "title": "Arduino Uno R3 Deal",
    "description": "20% off the popular Arduino Uno R3 development board",
    "discount_percentage": 20.0,
    "sale_price": 1299.0,
    "original_price": 1599.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-1"
  },
  {
    "product_id": "prod-esp32-devkit-v1",
    "title": "ESP32 DevKit Sale",
    "description": "33% off ESP32 dual-core WiFi+BT board",
    "discount_percentage": 33.0,
    "sale_price": 599.0,
    "original_price": 899.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-2"
  },
  {
    "product_id": "prod-hc-sr04-ultrasonic-sensor",
    "title": "Sensor Sale",
    "description": "40% off HC-SR04 ultrasonic distance sensor",
    "discount_percentage": 40.0,
    "sale_price": 149.0,
    "original_price": 249.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-3"
  },
  {
    "product_id": "prod-sg90-micro-servo",
    "title": "Servo Motor Deal",
    "description": "44% off SG90 micro servo motor",
    "discount_percentage": 44.0,
    "sale_price": 99.0,
    "original_price": 179.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-4"
  },
  {
    "product_id": "prod-yantrax-arduino-starter-kit",
    "title": "Starter Kit Deal",
    "description": "37% off complete Arduino starter kit",
    "discount_percentage": 37.0,
    "sale_price": 2499.0,
    "original_price": 3999.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-5"
  },
  {
    "product_id": "prod-soldering-iron-kit-60w",
    "title": "Tool Deal",
    "description": "38% off 60W soldering iron kit",
    "discount_percentage": 38.0,
    "sale_price": 799.0,
    "original_price": 1299.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-6"
  },
  {
    "product_id": "prod-yantrax-robot-arm-kit",
    "title": "Robot Arm Sale",
    "description": "33% off 4-DOF robot arm kit",
    "discount_percentage": 33.0,
    "sale_price": 2999.0,
    "original_price": 4499.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-7"
  },
  {
    "product_id": "prod-raspberry-pi-4-model-b-4gb",
    "title": "Raspberry Pi 4 Deal",
    "description": "15% off Raspberry Pi 4 Model B 4GB",
    "discount_percentage": 15.0,
    "sale_price": 5499.0,
    "original_price": 6499.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-8"
  },
  {
    "product_id": "prod-nodemcu-esp8266-wifi",
    "title": "NodeMCU Sale",
    "description": "41% off NodeMCU ESP8266 WiFi board",
    "discount_percentage": 41.0,
    "sale_price": 349.0,
    "original_price": 599.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-9"
  },
  {
    "product_id": "prod-oled-display-096-i2c",
    "title": "OLED Display Deal",
    "description": "37% off 0.96 inch OLED display",
    "discount_percentage": 37.0,
    "sale_price": 249.0,
    "original_price": 399.0,
    "starts_at": "2026-10-23T10:00:00Z",
    "ends_at": "2026-11-23T10:00:00Z",
    "is_active": true,
    "id": "deal-10"
  }
];

export const mockCoupons: any[] = [
  {
    "code": "WELCOME10",
    "description": "10% off your first order",
    "discount_type": "percentage",
    "discount_value": 10.0,
    "min_order_value": 500.0,
    "max_discount": 500.0,
    "usage_limit": 1000,
    "used_count": 0,
    "is_active": true,
    "expires_at": "2026-11-23T10:00:00Z",
    "id": "coupon-1"
  },
  {
    "code": "YANTRA50",
    "description": "Rs 50 off orders above Rs 500",
    "discount_type": "fixed",
    "discount_value": 50.0,
    "min_order_value": 500.0,
    "max_discount": null,
    "usage_limit": 500,
    "used_count": 0,
    "is_active": true,
    "expires_at": "2026-11-23T10:00:00Z",
    "id": "coupon-2"
  },
  {
    "code": "ROBOTICS20",
    "description": "20% off robotics category",
    "discount_type": "percentage",
    "discount_value": 20.0,
    "min_order_value": 1000.0,
    "max_discount": 1000.0,
    "usage_limit": 200,
    "used_count": 0,
    "is_active": true,
    "expires_at": "2026-11-23T10:00:00Z",
    "id": "coupon-3"
  },
  {
    "code": "FREESHIP",
    "description": "Free shipping on orders above Rs 999",
    "discount_type": "fixed",
    "discount_value": 49.0,
    "min_order_value": 999.0,
    "max_discount": 49.0,
    "usage_limit": 1000,
    "used_count": 0,
    "is_active": true,
    "expires_at": "2026-11-23T10:00:00Z",
    "id": "coupon-4"
  }
];

export const mockProjects: any[] = [
  {
    "title": "Arduino Smart Dustbin",
    "slug": "arduino-smart-dustbin",
    "description": "Build an automated smart dustbin that opens its lid when your hand approaches. Using an HC-SR04 ultrasonic sensor to detect hand movement and an SG90 servo motor to open the lid. A perfect beginner project for learning sensors and actuators.",
    "difficulty": "beginner",
    "estimated_cost": 1499.0,
    "estimated_time": "2-3 hours",
    "image_url": "https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "images": [
      "https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "tutorial": "1. Connect the HC-SR04 sensor to the Arduino: VCC to 5V, GND to GND, Trig to pin 9, Echo to pin 10.\n2. Connect the SG90 servo to pin 11 with 5V power.\n3. Mount the servo to the dustbin lid using the bracket.\n4. Upload the Arduino sketch which measures distance and opens the lid when an object is detected within 30cm.\n5. Test by bringing your hand close to the sensor.",
    "tags": [
      "arduino",
      "smart dustbin",
      "ultrasonic",
      "servo",
      "beginner",
      "automation"
    ],
    "is_published": true,
    "id": "proj-arduino-smart-dustbin"
  },
  {
    "title": "IoT Weather Station",
    "slug": "iot-weather-station",
    "description": "Build a WiFi-connected weather station that measures temperature, humidity, and atmospheric pressure. Upload data to the cloud and monitor conditions from anywhere using the ESP8266 and multiple sensors.",
    "difficulty": "intermediate",
    "estimated_cost": 1999.0,
    "estimated_time": "3-4 hours",
    "image_url": "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "images": [
      "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "tutorial": "1. Connect the DHT22 sensor to the ESP8266 for temperature and humidity.\n2. Connect the BMP280 sensor via I2C for atmospheric pressure.\n3. Connect the OLED display via I2C for local display.\n4. Upload the ESP8266 sketch that reads sensors and sends data to a cloud platform.\n5. Configure WiFi credentials and cloud endpoint.\n6. Monitor weather data from your phone or web dashboard.",
    "tags": [
      "iot",
      "weather",
      "esp8266",
      "wifi",
      "sensors",
      "cloud",
      "intermediate"
    ],
    "is_published": true,
    "id": "proj-iot-weather-station"
  },
  {
    "title": "Bluetooth Controlled Robot Car",
    "slug": "bluetooth-robot-car",
    "description": "Build a robot car controlled via Bluetooth from your smartphone. Uses an Arduino Uno, L298N motor driver, HC-05 Bluetooth module, and two DC motors. Control direction and speed from your phone.",
    "difficulty": "intermediate",
    "estimated_cost": 2499.0,
    "estimated_time": "4-5 hours",
    "image_url": "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "images": [
      "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "tutorial": "1. Assemble the robot chassis with two DC motors and a caster wheel.\n2. Connect the L298N motor driver to the Arduino and motors.\n3. Connect the HC-05 Bluetooth module to the Arduino serial pins.\n4. Upload the Arduino sketch that receives Bluetooth commands and controls motor direction and speed.\n5. Download a Bluetooth RC car app on your phone.\n6. Pair with the HC-05 module and drive your robot.",
    "tags": [
      "robotics",
      "bluetooth",
      "arduino",
      "robot car",
      "dc motor",
      "intermediate"
    ],
    "is_published": true,
    "id": "proj-bluetooth-robot-car"
  },
  {
    "title": "Home Automation with ESP32",
    "slug": "esp32-home-automation",
    "description": "Create a home automation system using ESP32 that controls lights and appliances via WiFi. Use relays to switch AC loads and monitor temperature/humidity. Control everything from a web interface.",
    "difficulty": "advanced",
    "estimated_cost": 2999.0,
    "estimated_time": "5-6 hours",
    "image_url": "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "images": [
      "https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "tutorial": "1. Connect the 4-channel relay module to the ESP32.\n2. Connect the DHT22 sensor for temperature/humidity monitoring.\n3. Upload the ESP32 sketch that creates a web server.\n4. Configure WiFi credentials in the code.\n5. Access the web interface from any browser on your network.\n6. Control relays (lights, fans, appliances) from the web UI.\n7. Monitor temperature and humidity readings.",
    "tags": [
      "esp32",
      "home automation",
      "iot",
      "relay",
      "wifi",
      "advanced"
    ],
    "is_published": true,
    "id": "proj-esp32-home-automation"
  },
  {
    "title": "3D Printed Robotic Arm",
    "slug": "3d-printed-robotic-arm",
    "description": "Design and build a 3D printed robotic arm with 4 degrees of freedom. Print the parts using PLA filament, assemble with SG90 servos, and program inverse kinematics with Arduino. A complete mechatronics project.",
    "difficulty": "advanced",
    "estimated_cost": 3999.0,
    "estimated_time": "8-10 hours",
    "image_url": "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "images": [
      "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/8439074/pexels-photo-8439074.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "tutorial": "1. Download the STL files for the robotic arm parts.\n2. Print all parts using PLA filament (estimated 15-20 hours of printing).\n3. Assemble the arm using 4 SG90 servo motors and the printed parts.\n4. Connect servos to the Arduino via a servo shield or directly.\n5. Upload the Arduino sketch with inverse kinematics calculations.\n6. Use the joystick controller to move the arm.\n7. Program automated sequences for pick-and-place tasks.",
    "tags": [
      "3d printing",
      "robotics",
      "robot arm",
      "servo",
      "arduino",
      "advanced",
      "mechatronics"
    ],
    "is_published": true,
    "id": "proj-3d-printed-robotic-arm"
  },
  {
    "title": "Line Following Robot",
    "slug": "line-following-robot",
    "description": "Build an autonomous line following robot using Arduino, IR sensors, and DC motors. The robot detects and follows a black line on a white surface using infrared sensors. A classic robotics project for students.",
    "difficulty": "beginner",
    "estimated_cost": 1799.0,
    "estimated_time": "3-4 hours",
    "image_url": "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "images": [
      "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    "tutorial": "1. Assemble the robot chassis with two DC motors and a caster wheel.\n2. Mount 3-5 IR sensors at the front of the robot, facing down.\n3. Connect the L298N motor driver and IR sensors to the Arduino.\n4. Upload the line following algorithm (PID recommended).\n5. Create a track with black electrical tape on a white surface.\n6. Place the robot on the line and watch it follow the path.",
    "tags": [
      "robotics",
      "line follower",
      "arduino",
      "ir sensor",
      "dc motor",
      "beginner"
    ],
    "is_published": true,
    "id": "proj-line-following-robot"
  }
];

export const mockTutorials: any[] = [
  {
    "title": "Getting Started with Arduino: Blink LED",
    "slug": "getting-started-with-arduino-blink-led",
    "description": "Learn the basics of Arduino programming by building the classic Blink LED project. This tutorial covers setup, installation, and your first sketch.",
    "category": "Arduino Tutorials",
    "content": "Arduino is an open-source electronics platform based on easy-to-use hardware and software. In this tutorial, you will learn how to:\n\n1. Install the Arduino IDE\n2. Connect your Arduino board\n3. Write your first sketch\n4. Upload the Blink LED program\n5. Modify the blink rate\n\nThe Blink sketch is the Hello World of electronics. It turns an LED on and off at a set interval, teaching you the basics of digital output and timing.",
    "image_url": "https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "beginner",
    "read_time": 10,
    "tags": [
      "arduino",
      "led",
      "beginner",
      "blink",
      "basics"
    ],
    "is_published": true,
    "id": "tut-getting-started-with-arduino-blink-led"
  },
  {
    "title": "ESP32 WiFi Connectivity Guide",
    "slug": "esp32-wifi-connectivity-guide",
    "description": "Learn how to connect your ESP32 to WiFi, create a web server, and control GPIO pins from a browser. A comprehensive guide to IoT networking.",
    "category": "ESP32 Tutorials",
    "content": "The ESP32 is a powerful WiFi+Bluetooth microcontroller. This tutorial covers:\n\n1. Setting up the ESP32 in Arduino IDE\n2. Connecting to WiFi networks\n3. Creating a simple web server\n4. Controlling GPIO pins via web interface\n5. Handling multiple client connections\n\nBy the end of this tutorial, you will be able to control LEDs, read sensors, and build IoT applications with web interfaces.",
    "image_url": "https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "intermediate",
    "read_time": 15,
    "tags": [
      "esp32",
      "wifi",
      "iot",
      "web server",
      "intermediate"
    ],
    "is_published": true,
    "id": "tut-esp32-wifi-connectivity-guide"
  },
  {
    "title": "Raspberry Pi Setup and Configuration",
    "slug": "raspberry-pi-setup-guide",
    "description": "A complete guide to setting up your Raspberry Pi. From OS installation to SSH access and GPIO programming, get your Pi running in minutes.",
    "category": "Raspberry Pi Tutorials",
    "content": "The Raspberry Pi is a versatile single-board computer. This tutorial covers:\n\n1. Downloading and flashing Raspberry Pi OS\n2. Initial boot and configuration\n3. Connecting to WiFi\n4. Enabling SSH for remote access\n5. GPIO pin overview and basic programming\n6. Installing Python libraries\n\nPerfect for beginners getting started with Raspberry Pi for the first time.",
    "image_url": "https://images.pexels.com/photos/7097230/pexels-photo-7097230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "beginner",
    "read_time": 12,
    "tags": [
      "raspberry pi",
      "setup",
      "beginner",
      "linux",
      "gpio"
    ],
    "is_published": true,
    "id": "tut-raspberry-pi-setup-guide"
  },
  {
    "title": "Understanding Sensors: A Complete Guide",
    "slug": "understanding-sensors-complete-guide",
    "description": "Learn about different types of sensors used in electronics projects. From temperature to motion sensors, understand how they work and how to interface them.",
    "category": "Electronics Basics",
    "content": "Sensors are the eyes and ears of your electronics projects. This guide covers:\n\n1. Temperature sensors (DHT22, DS18B20, LM35)\n2. Distance sensors (HC-SR04, IR)\n3. Motion sensors (PIR, MPU6050)\n4. Light sensors (LDR, TSL2561)\n5. Gas sensors (MQ-series)\n6. How to read analog and digital sensor data\n7. Interfacing with Arduino and ESP32\n\nEach sensor type includes a wiring diagram and sample code.",
    "image_url": "https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "beginner",
    "read_time": 20,
    "tags": [
      "sensors",
      "electronics",
      "basics",
      "arduino",
      "esp32"
    ],
    "is_published": true,
    "id": "tut-understanding-sensors-complete-guide"
  },
  {
    "title": "3D Printing Basics: From STL to Print",
    "slug": "3d-printing-basics-guide",
    "description": "New to 3D printing? This tutorial covers everything from choosing a printer to slicing models and achieving your first successful print.",
    "category": "3D Printing",
    "content": "3D printing opens up a world of possibilities for makers. This tutorial covers:\n\n1. Types of 3D printing (FDM, SLA, SLS)\n2. Choosing the right filament/material\n3. Downloading and creating STL files\n4. Using slicer software (Cura, PrusaSlicer)\n5. Setting up your printer\n6. Bed leveling and first layer calibration\n7. Common print problems and solutions\n8. Post-processing techniques\n\nBy the end, you will be ready to print your first 3D model with confidence.",
    "image_url": "https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "beginner",
    "read_time": 15,
    "tags": [
      "3d printing",
      "beginner",
      "fdm",
      "slicer",
      "cura"
    ],
    "is_published": true,
    "id": "tut-3d-printing-basics-guide"
  },
  {
    "title": "Motor Control with Arduino",
    "slug": "motor-control-with-arduino",
    "description": "Learn how to control DC motors, servo motors, and stepper motors with Arduino. Covers motor drivers, PWM speed control, and direction control.",
    "category": "Arduino Tutorials",
    "content": "Motors are essential for robotics and automation. This tutorial covers:\n\n1. Types of motors (DC, servo, stepper, BLDC)\n2. Motor drivers (L298N, A4988, DRV8825)\n3. PWM speed control for DC motors\n4. Position control for servo motors\n5. Stepper motor control with A4988\n6. Bidirectional control with H-bridge\n7. Power supply considerations\n\nIncludes complete wiring diagrams and Arduino code for each motor type.",
    "image_url": "https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "intermediate",
    "read_time": 18,
    "tags": [
      "arduino",
      "motor",
      "servo",
      "stepper",
      "robotics",
      "intermediate"
    ],
    "is_published": true,
    "id": "tut-motor-control-with-arduino"
  },
  {
    "title": "Introduction to IoT and Cloud Platforms",
    "slug": "introduction-to-iot-cloud-platforms",
    "description": "Learn how to connect your electronics projects to the cloud. Compare popular IoT platforms and build your first connected device.",
    "category": "IoT",
    "content": "The Internet of Things (IoT) connects physical devices to the internet. This tutorial covers:\n\n1. IoT architecture overview\n2. Popular IoT platforms (ThingsBoard, Blynk, AWS IoT, Google Cloud IoT)\n3. MQTT vs HTTP protocols\n4. Sending sensor data to the cloud\n5. Building dashboards and visualizations\n6. Security considerations for IoT devices\n7. Building a complete IoT weather station\n\nLearn to build connected devices that send data to the cloud and can be monitored from anywhere in the world.",
    "image_url": "https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "intermediate",
    "read_time": 25,
    "tags": [
      "iot",
      "cloud",
      "mqtt",
      "wifi",
      "intermediate"
    ],
    "is_published": true,
    "id": "tut-introduction-to-iot-cloud-platforms"
  },
  {
    "title": "Robotics Fundamentals: Kinematics",
    "slug": "robotics-fundamentals-kinematics",
    "description": "Understand forward and inverse kinematics for robotic arms. Learn the math behind robot movement and implement it in code.",
    "category": "Robotics",
    "content": "Kinematics is the foundation of robotics. This tutorial covers:\n\n1. Degrees of freedom\n2. Forward kinematics (joint angles to end-effector position)\n3. Inverse kinematics (position to joint angles)\n4. DH parameters\n5. Jacobian matrices\n6. Implementing kinematics in Python and Arduino\n7. Practical example: 4-DOF robot arm\n\nThis is an advanced tutorial that requires basic understanding of trigonometry and matrix math.",
    "image_url": "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "difficulty": "advanced",
    "read_time": 30,
    "tags": [
      "robotics",
      "kinematics",
      "math",
      "advanced",
      "robot arm"
    ],
    "is_published": true,
    "id": "tut-robotics-fundamentals-kinematics"
  }
];

export const mockDataMap: Record<string, any[]> = {
  categories: mockCategories,
  brands: mockBrands,
  products: mockProducts,
  banners: mockBanners,
  promo_cards: mockPromoCards,
  deals: mockDeals,
  coupons: mockCoupons,
  projects: mockProjects,
  tutorials: mockTutorials,
};
