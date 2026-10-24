/*
# YantraX Seed Data Part 6: Projects, Project Components, Tutorials
*/

-- PROJECTS
INSERT INTO projects (title, slug, description, difficulty, estimated_cost, estimated_time, image_url, images, tutorial, tags, is_published) VALUES
('Arduino Smart Dustbin', 'arduino-smart-dustbin', 'Build an automated smart dustbin that opens its lid when your hand approaches. Using an HC-SR04 ultrasonic sensor to detect hand movement and an SG90 servo motor to open the lid. A perfect beginner project for learning sensors and actuators.', 'beginner', 1499.00, '2-3 hours', 'https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], '1. Connect the HC-SR04 sensor to the Arduino: VCC to 5V, GND to GND, Trig to pin 9, Echo to pin 10.
2. Connect the SG90 servo to pin 11 with 5V power.
3. Mount the servo to the dustbin lid using the bracket.
4. Upload the Arduino sketch which measures distance and opens the lid when an object is detected within 30cm.
5. Test by bringing your hand close to the sensor.', ARRAY['arduino','smart dustbin','ultrasonic','servo','beginner','automation'], true),
('IoT Weather Station', 'iot-weather-station', 'Build a WiFi-connected weather station that measures temperature, humidity, and atmospheric pressure. Upload data to the cloud and monitor conditions from anywhere using the ESP8266 and multiple sensors.', 'intermediate', 1999.00, '3-4 hours', 'https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], '1. Connect the DHT22 sensor to the ESP8266 for temperature and humidity.
2. Connect the BMP280 sensor via I2C for atmospheric pressure.
3. Connect the OLED display via I2C for local display.
4. Upload the ESP8266 sketch that reads sensors and sends data to a cloud platform.
5. Configure WiFi credentials and cloud endpoint.
6. Monitor weather data from your phone or web dashboard.', ARRAY['iot','weather','esp8266','wifi','sensors','cloud','intermediate'], true),
('Bluetooth Controlled Robot Car', 'bluetooth-robot-car', 'Build a robot car controlled via Bluetooth from your smartphone. Uses an Arduino Uno, L298N motor driver, HC-05 Bluetooth module, and two DC motors. Control direction and speed from your phone.', 'intermediate', 2499.00, '4-5 hours', 'https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], '1. Assemble the robot chassis with two DC motors and a caster wheel.
2. Connect the L298N motor driver to the Arduino and motors.
3. Connect the HC-05 Bluetooth module to the Arduino serial pins.
4. Upload the Arduino sketch that receives Bluetooth commands and controls motor direction and speed.
5. Download a Bluetooth RC car app on your phone.
6. Pair with the HC-05 module and drive your robot.', ARRAY['robotics','bluetooth','arduino','robot car','dc motor','intermediate'], true),
('Home Automation with ESP32', 'esp32-home-automation', 'Create a home automation system using ESP32 that controls lights and appliances via WiFi. Use relays to switch AC loads and monitor temperature/humidity. Control everything from a web interface.', 'advanced', 2999.00, '5-6 hours', 'https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['https://images.pexels.com/photos/5276099/pexels-photo-5276099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], '1. Connect the 4-channel relay module to the ESP32.
2. Connect the DHT22 sensor for temperature/humidity monitoring.
3. Upload the ESP32 sketch that creates a web server.
4. Configure WiFi credentials in the code.
5. Access the web interface from any browser on your network.
6. Control relays (lights, fans, appliances) from the web UI.
7. Monitor temperature and humidity readings.', ARRAY['esp32','home automation','iot','relay','wifi','advanced'], true),
('3D Printed Robotic Arm', '3d-printed-robotic-arm', 'Design and build a 3D printed robotic arm with 4 degrees of freedom. Print the parts using PLA filament, assemble with SG90 servos, and program inverse kinematics with Arduino. A complete mechatronics project.', 'advanced', 3999.00, '8-10 hours', 'https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8439074/pexels-photo-8439074.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], '1. Download the STL files for the robotic arm parts.
2. Print all parts using PLA filament (estimated 15-20 hours of printing).
3. Assemble the arm using 4 SG90 servo motors and the printed parts.
4. Connect servos to the Arduino via a servo shield or directly.
5. Upload the Arduino sketch with inverse kinematics calculations.
6. Use the joystick controller to move the arm.
7. Program automated sequences for pick-and-place tasks.', ARRAY['3d printing','robotics','robot arm','servo','arduino','advanced','mechatronics'], true),
('Line Following Robot', 'line-following-robot', 'Build an autonomous line following robot using Arduino, IR sensors, and DC motors. The robot detects and follows a black line on a white surface using infrared sensors. A classic robotics project for students.', 'beginner', 1799.00, '3-4 hours', 'https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/35686444/pexels-photo-35686444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], '1. Assemble the robot chassis with two DC motors and a caster wheel.
2. Mount 3-5 IR sensors at the front of the robot, facing down.
3. Connect the L298N motor driver and IR sensors to the Arduino.
4. Upload the line following algorithm (PID recommended).
5. Create a track with black electrical tape on a white surface.
6. Place the robot on the line and watch it follow the path.', ARRAY['robotics','line follower','arduino','ir sensor','dc motor','beginner'], true)
ON CONFLICT (slug) DO NOTHING;

-- PROJECT COMPONENTS
INSERT INTO project_components (project_id, product_id, name, quantity) VALUES
((SELECT id FROM projects WHERE slug='arduino-smart-dustbin'), (SELECT id FROM products WHERE slug='yantrax-smart-dustbin-kit'), 'Smart Dustbin Kit (all-in-one)', 1),
((SELECT id FROM projects WHERE slug='iot-weather-station'), (SELECT id FROM products WHERE slug='nodemcu-esp8266-wifi'), 'NodeMCU ESP8266 WiFi Board', 1),
((SELECT id FROM projects WHERE slug='iot-weather-station'), (SELECT id FROM products WHERE slug='dht22-temp-humidity-sensor'), 'DHT22 Temperature & Humidity Sensor', 1),
((SELECT id FROM projects WHERE slug='iot-weather-station'), (SELECT id FROM products WHERE slug='oled-display-096-i2c'), '0.96 inch OLED Display', 1),
((SELECT id FROM projects WHERE slug='bluetooth-robot-car'), (SELECT id FROM products WHERE slug='arduino-uno-r3'), 'Arduino Uno R3', 1),
((SELECT id FROM projects WHERE slug='bluetooth-robot-car'), (SELECT id FROM products WHERE slug='l298n-motor-driver'), 'L298N Motor Driver', 1),
((SELECT id FROM projects WHERE slug='bluetooth-robot-car'), (SELECT id FROM products WHERE slug='dc-motor-12v-200rpm'), '12V DC Motor', 2),
((SELECT id FROM projects WHERE slug='esp32-home-automation'), (SELECT id FROM products WHERE slug='esp32-devkit-v1'), 'ESP32 DevKit V1', 1),
((SELECT id FROM projects WHERE slug='esp32-home-automation'), (SELECT id FROM products WHERE slug='relay-module-4ch-5v'), '4-Channel Relay Module', 1),
((SELECT id FROM projects WHERE slug='esp32-home-automation'), (SELECT id FROM products WHERE slug='dht22-temp-humidity-sensor'), 'DHT22 Sensor', 1),
((SELECT id FROM projects WHERE slug='3d-printed-robotic-arm'), (SELECT id FROM products WHERE slug='yantrax-robot-arm-kit'), '4-DOF Robot Arm Kit', 1),
((SELECT id FROM projects WHERE slug='3d-printed-robotic-arm'), (SELECT id FROM products WHERE slug='pla-filament-175-white'), 'PLA Filament 1kg', 1),
((SELECT id FROM projects WHERE slug='line-following-robot'), (SELECT id FROM products WHERE slug='arduino-uno-r3'), 'Arduino Uno R3', 1),
((SELECT id FROM projects WHERE slug='line-following-robot'), (SELECT id FROM products WHERE slug='ir-obstacle-sensor-module'), 'IR Obstacle Sensor', 3),
((SELECT id FROM projects WHERE slug='line-following-robot'), (SELECT id FROM products WHERE slug='l298n-motor-driver'), 'L298N Motor Driver', 1),
((SELECT id FROM projects WHERE slug='line-following-robot'), (SELECT id FROM products WHERE slug='dc-motor-12v-200rpm'), 'DC Motor', 2)
ON CONFLICT DO NOTHING;

-- TUTORIALS
INSERT INTO tutorials (title, slug, description, category, content, image_url, difficulty, read_time, tags, is_published) VALUES
('Getting Started with Arduino: Blink LED', 'getting-started-with-arduino-blink-led', 'Learn the basics of Arduino programming by building the classic Blink LED project. This tutorial covers setup, installation, and your first sketch.', 'Arduino Tutorials', 'Arduino is an open-source electronics platform based on easy-to-use hardware and software. In this tutorial, you will learn how to:

1. Install the Arduino IDE
2. Connect your Arduino board
3. Write your first sketch
4. Upload the Blink LED program
5. Modify the blink rate

The Blink sketch is the Hello World of electronics. It turns an LED on and off at a set interval, teaching you the basics of digital output and timing.', 'https://images.pexels.com/photos/15470542/pexels-photo-15470542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'beginner', 10, ARRAY['arduino','led','beginner','blink','basics'], true),
('ESP32 WiFi Connectivity Guide', 'esp32-wifi-connectivity-guide', 'Learn how to connect your ESP32 to WiFi, create a web server, and control GPIO pins from a browser. A comprehensive guide to IoT networking.', 'ESP32 Tutorials', 'The ESP32 is a powerful WiFi+Bluetooth microcontroller. This tutorial covers:

1. Setting up the ESP32 in Arduino IDE
2. Connecting to WiFi networks
3. Creating a simple web server
4. Controlling GPIO pins via web interface
5. Handling multiple client connections

By the end of this tutorial, you will be able to control LEDs, read sensors, and build IoT applications with web interfaces.', 'https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'intermediate', 15, ARRAY['esp32','wifi','iot','web server','intermediate'], true),
('Raspberry Pi Setup and Configuration', 'raspberry-pi-setup-guide', 'A complete guide to setting up your Raspberry Pi. From OS installation to SSH access and GPIO programming, get your Pi running in minutes.', 'Raspberry Pi Tutorials', 'The Raspberry Pi is a versatile single-board computer. This tutorial covers:

1. Downloading and flashing Raspberry Pi OS
2. Initial boot and configuration
3. Connecting to WiFi
4. Enabling SSH for remote access
5. GPIO pin overview and basic programming
6. Installing Python libraries

Perfect for beginners getting started with Raspberry Pi for the first time.', 'https://images.pexels.com/photos/7097230/pexels-photo-7097230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'beginner', 12, ARRAY['raspberry pi','setup','beginner','linux','gpio'], true),
('Understanding Sensors: A Complete Guide', 'understanding-sensors-complete-guide', 'Learn about different types of sensors used in electronics projects. From temperature to motion sensors, understand how they work and how to interface them.', 'Electronics Basics', 'Sensors are the eyes and ears of your electronics projects. This guide covers:

1. Temperature sensors (DHT22, DS18B20, LM35)
2. Distance sensors (HC-SR04, IR)
3. Motion sensors (PIR, MPU6050)
4. Light sensors (LDR, TSL2561)
5. Gas sensors (MQ-series)
6. How to read analog and digital sensor data
7. Interfacing with Arduino and ESP32

Each sensor type includes a wiring diagram and sample code.', 'https://images.pexels.com/photos/35686438/pexels-photo-35686438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'beginner', 20, ARRAY['sensors','electronics','basics','arduino','esp32'], true),
('3D Printing Basics: From STL to Print', '3d-printing-basics-guide', 'New to 3D printing? This tutorial covers everything from choosing a printer to slicing models and achieving your first successful print.', '3D Printing', '3D printing opens up a world of possibilities for makers. This tutorial covers:

1. Types of 3D printing (FDM, SLA, SLS)
2. Choosing the right filament/material
3. Downloading and creating STL files
4. Using slicer software (Cura, PrusaSlicer)
5. Setting up your printer
6. Bed leveling and first layer calibration
7. Common print problems and solutions
8. Post-processing techniques

By the end, you will be ready to print your first 3D model with confidence.', 'https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'beginner', 15, ARRAY['3d printing','beginner','fdm','slicer','cura'], true),
('Motor Control with Arduino', 'motor-control-with-arduino', 'Learn how to control DC motors, servo motors, and stepper motors with Arduino. Covers motor drivers, PWM speed control, and direction control.', 'Arduino Tutorials', 'Motors are essential for robotics and automation. This tutorial covers:

1. Types of motors (DC, servo, stepper, BLDC)
2. Motor drivers (L298N, A4988, DRV8825)
3. PWM speed control for DC motors
4. Position control for servo motors
5. Stepper motor control with A4988
6. Bidirectional control with H-bridge
7. Power supply considerations

Includes complete wiring diagrams and Arduino code for each motor type.', 'https://images.pexels.com/photos/11579194/pexels-photo-11579194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'intermediate', 18, ARRAY['arduino','motor','servo','stepper','robotics','intermediate'], true),
('Introduction to IoT and Cloud Platforms', 'introduction-to-iot-cloud-platforms', 'Learn how to connect your electronics projects to the cloud. Compare popular IoT platforms and build your first connected device.', 'IoT', 'The Internet of Things (IoT) connects physical devices to the internet. This tutorial covers:

1. IoT architecture overview
2. Popular IoT platforms (ThingsBoard, Blynk, AWS IoT, Google Cloud IoT)
3. MQTT vs HTTP protocols
4. Sending sensor data to the cloud
5. Building dashboards and visualizations
6. Security considerations for IoT devices
7. Building a complete IoT weather station

Learn to build connected devices that send data to the cloud and can be monitored from anywhere in the world.', 'https://images.pexels.com/photos/35673127/pexels-photo-35673127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'intermediate', 25, ARRAY['iot','cloud','mqtt','wifi','intermediate'], true),
('Robotics Fundamentals: Kinematics', 'robotics-fundamentals-kinematics', 'Understand forward and inverse kinematics for robotic arms. Learn the math behind robot movement and implement it in code.', 'Robotics', 'Kinematics is the foundation of robotics. This tutorial covers:

1. Degrees of freedom
2. Forward kinematics (joint angles to end-effector position)
3. Inverse kinematics (position to joint angles)
4. DH parameters
5. Jacobian matrices
6. Implementing kinematics in Python and Arduino
7. Practical example: 4-DOF robot arm

This is an advanced tutorial that requires basic understanding of trigonometry and matrix math.', 'https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'advanced', 30, ARRAY['robotics','kinematics','math','advanced','robot arm'], true)
ON CONFLICT (slug) DO NOTHING;
