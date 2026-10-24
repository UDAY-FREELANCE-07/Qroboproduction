/*
# YantraX Seed Data Part 1: Categories and Brands
*/

INSERT INTO categories (name, slug, description, icon_name, is_featured, sort_order) VALUES
('Robotics', 'robotics', 'Robotics kits, robot arms, chassis, and automation components', 'Bot', true, 1),
('Development Boards', 'development-boards', 'Microcontroller and single-board computer development boards', 'Cpu', true, 2),
('Sensors', 'sensors', 'Environmental, motion, proximity, and IoT sensor modules', 'Radar', true, 3),
('Microcontrollers', 'microcontrollers', 'Standalone microcontroller chips and modules', 'CircuitBoard', false, 4),
('Arduino', 'arduino', 'Official Arduino boards and compatible alternatives', 'CircuitBoard', true, 5),
('ESP32 / ESP8266', 'esp32-esp8266', 'Espressif ESP-series Wi-Fi and Bluetooth modules', 'Wifi', true, 6),
('Raspberry Pi', 'raspberry-pi', 'Raspberry Pi single-board computers and accessories', 'Server', true, 7),
('Electronics Components', 'electronics-components', 'Resistors, capacitors, transistors, diodes, and passives', 'Zap', true, 8),
('Motors', 'motors', 'DC motors, servo motors, stepper motors, and BLDC motors', 'RotateCw', false, 9),
('Motor Drivers', 'motor-drivers', 'H-bridge and stepper motor driver modules', 'Settings2', false, 10),
('Displays', 'displays', 'OLED, LCD, TFT, and e-ink display modules', 'Monitor', false, 11),
('Communication Modules', 'communication-modules', 'RF, Bluetooth, LoRa, Zigbee, and GPS modules', 'Radio', false, 12),
('IoT', 'iot', 'Internet of Things modules and kits', 'Wifi', true, 13),
('AI / ML Hardware', 'ai-ml-hardware', 'Edge AI accelerators and machine learning hardware', 'Brain', false, 14),
('3D Printing', '3d-printing', '3D printers, filament, and printer parts', 'Box', true, 15),
('3D Printer Parts', '3d-printer-parts', 'Nozzles, hotends, extruders, and upgrade parts', 'Wrench', false, 16),
('DIY Kits', 'diy-kits', 'Complete do-it-yourself project kits', 'Package', true, 17),
('Robotics Kits', 'robotics-kits', 'Complete robotics build kits with all components', 'Bot', true, 18),
('Student Project Kits', 'student-project-kits', 'Educational kits for school and college projects', 'GraduationCap', true, 19),
('Tools', 'tools', 'Soldering irons, multimeters, wire strippers, and hand tools', 'Wrench', true, 20),
('Accessories', 'accessories', 'Cables, adapters, power supplies, and cases', 'Plug', false, 21)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO brands (name, slug, description, country) VALUES
('Arduino', 'arduino', 'Official Arduino boards and accessories from Italy', 'Italy'),
('Raspberry Pi', 'raspberry-pi', 'Raspberry Pi Foundation single-board computers', 'UK'),
('Espressif', 'espressif', 'ESP32 and ESP8266 Wi-Fi/Bluetooth SoC manufacturer', 'China'),
('Adafruit', 'adafruit', 'Open-source electronics and DIY hobby components', 'USA'),
('SparkFun', 'sparkfun', 'Electronics components and development kits for makers', 'USA'),
('NodeMCU', 'nodemcu', 'Open-source Lua-based firmware development board', 'China'),
('Creality', 'creality', '3D printers and 3D printing accessories', 'China'),
('Prusa', 'prusa', 'Open-source 3D printers by Josef Prusa', 'Czech Republic'),
('DFRobot', 'dfrobot', 'Robotics and electronic modules for education', 'China'),
('Seeed Studio', 'seeed-studio', 'Grove modular electronics and IoT solutions', 'China'),
('Waveshare', 'waveshare', 'Display modules and development boards', 'China'),
('HiLetgo', 'hiletgo', 'Affordable Arduino and ESP modules', 'China'),
('Elegoo', 'elegoo', 'Arduino-compatible starter kits and 3D printers', 'China'),
('Anycubic', 'anycubic', 'Consumer 3D printers and resin printers', 'China'),
('YantraX', 'yantrax', 'YantraX branded DIY kits and student project bundles', 'India')
ON CONFLICT (slug) DO NOTHING;
