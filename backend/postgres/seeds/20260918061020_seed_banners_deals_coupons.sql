/*
# YantraX Seed Data Part 5: Banners, Promo Cards, Deals, Coupons
*/

-- BANNERS
INSERT INTO banners (title, subtitle, description, image_url, category_label, cta_text, cta_link, sort_order, is_active) VALUES
('BUILD SOMETHING AMAZING', 'Robotics & Electronics', 'Explore robotics kits, development boards, sensors and smart hardware for your next project. From Arduino to Raspberry Pi, we have everything you need to bring your ideas to life.', 'https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Robotics & Automation', 'Shop Now', '/shop?category=robotics', 1, true),
('3D PRINT YOUR IDEAS', '3D Printing Collection', 'Discover a wide range of 3D printers, filaments, and upgrade parts. From beginner-friendly models to professional-grade machines, find the perfect 3D printer for your maker journey.', 'https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '3D Printing', 'Explore 3D Printing', '/shop?category=3d-printing', 2, true),
('SMART IOT PROJECTS', 'IoT & Connected Devices', 'Build connected IoT projects with ESP32, sensors, and cloud platforms. Everything you need for home automation, weather stations, and smart devices.', 'https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'IoT & Electronics', 'Build IoT Projects', '/shop?category=iot', 3, true)
ON CONFLICT DO NOTHING;

-- PROMO CARDS
INSERT INTO promo_cards (title, description, image_url, cta_text, cta_link, background_color, sort_order, is_active) VALUES
('Daily Deals', 'Up to 40% off on selected electronics and robotics components. Limited time offers with new deals every day.', 'https://images.pexels.com/photos/35673122/pexels-photo-35673122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'View Deals', '/deals', 'bg-blue-50', 1, true),
('Projects & Lab', 'Explore student projects, DIY kits, and tutorials. Build amazing electronics projects with our curated kits and guides.', 'https://images.pexels.com/photos/33373082/pexels-photo-33373082.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Browse Projects', '/projects', 'bg-amber-50', 2, true)
ON CONFLICT DO NOTHING;

-- DEALS
INSERT INTO deals (product_id, title, description, discount_percentage, sale_price, original_price, starts_at, ends_at, is_active) VALUES
((SELECT id FROM products WHERE slug='arduino-uno-r3'), 'Arduino Uno R3 Deal', '20% off the popular Arduino Uno R3 development board', 20.00, 1299.00, 1599.00, now(), now() + interval '7 days', true),
((SELECT id FROM products WHERE slug='esp32-devkit-v1'), 'ESP32 DevKit Sale', '33% off ESP32 dual-core WiFi+BT board', 33.00, 599.00, 899.00, now(), now() + interval '5 days', true),
((SELECT id FROM products WHERE slug='hc-sr04-ultrasonic-sensor'), 'Sensor Sale', '40% off HC-SR04 ultrasonic distance sensor', 40.00, 149.00, 249.00, now(), now() + interval '3 days', true),
((SELECT id FROM products WHERE slug='sg90-micro-servo'), 'Servo Motor Deal', '44% off SG90 micro servo motor', 44.00, 99.00, 179.00, now(), now() + interval '4 days', true),
((SELECT id FROM products WHERE slug='yantrax-arduino-starter-kit'), 'Starter Kit Deal', '37% off complete Arduino starter kit', 37.00, 2499.00, 3999.00, now(), now() + interval '10 days', true),
((SELECT id FROM products WHERE slug='soldering-iron-kit-60w'), 'Tool Deal', '38% off 60W soldering iron kit', 38.00, 799.00, 1299.00, now(), now() + interval '6 days', true),
((SELECT id FROM products WHERE slug='yantrax-robot-arm-kit'), 'Robot Arm Sale', '33% off 4-DOF robot arm kit', 33.00, 2999.00, 4499.00, now(), now() + interval '8 days', true),
((SELECT id FROM products WHERE slug='raspberry-pi-4-model-b-4gb'), 'Raspberry Pi 4 Deal', '15% off Raspberry Pi 4 Model B 4GB', 15.00, 5499.00, 6499.00, now(), now() + interval '5 days', true),
((SELECT id FROM products WHERE slug='nodemcu-esp8266-wifi'), 'NodeMCU Sale', '41% off NodeMCU ESP8266 WiFi board', 41.00, 349.00, 599.00, now(), now() + interval '3 days', true),
((SELECT id FROM products WHERE slug='oled-display-096-i2c'), 'OLED Display Deal', '37% off 0.96 inch OLED display', 37.00, 249.00, 399.00, now(), now() + interval '7 days', true)
ON CONFLICT DO NOTHING;

-- COUPONS
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, is_active, expires_at) VALUES
('WELCOME10', '10% off your first order', 'percentage', 10.00, 500.00, 500.00, 1000, 0, true, now() + interval '365 days'),
('YANTRA50', 'Rs 50 off orders above Rs 500', 'fixed', 50.00, 500.00, NULL, 500, 0, true, now() + interval '180 days'),
('ROBOTICS20', '20% off robotics category', 'percentage', 20.00, 1000.00, 1000.00, 200, 0, true, now() + interval '90 days'),
('FREESHIP', 'Free shipping on orders above Rs 999', 'fixed', 49.00, 999.00, 49.00, 1000, 0, true, now() + interval '365 days')
ON CONFLICT (code) DO NOTHING;
