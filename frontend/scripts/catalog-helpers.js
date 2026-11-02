/**
 * Complete PDF Electronics Component Catalog Generator
 * Source of truth: "Hi Technology Electronics Shop - Component List" (32 pages, 51 categories, 1187 products, 520 highlighted)
 */

const fs = require('fs');
const path = require('path');

// Image mapping helper for realistic electronics component visuals
function getComponentImage(name, categoryName) {
  const n = name.toLowerCase();
  const c = categoryName.toLowerCase();

  if (n.includes('resistor kit') || n.includes('capacitor kit') || n.includes('diodes and transistors kit')) {
    return 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('potentiometer') || n.includes('trimpot') || n.includes('slide pot')) {
    return 'https://images.unsplash.com/photo-1580584126903-c17d41830450?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('resistor')) {
    return 'https://images.unsplash.com/photo-1608555817751-494d55dd63cc?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('electrolytic capacitor') || n.includes('capacitor')) {
    return 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('zener') || n.includes('bridge rectifier') || n.includes('diode')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('led strip') || n.includes('ws2812b')) {
    return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('led') || n.includes('optocoupler') || n.includes('photodiode')) {
    return 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('transistor') || n.includes('mosfet') || n.includes('igbt') || n.includes('triac') || n.includes('scr')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('regulator') || n.includes('7805') || n.includes('lm317') || n.includes('ams1117')) {
    return 'https://images.unsplash.com/photo-1608555817751-494d55dd63cc?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('op-amp') || n.includes('comparator') || n.includes('ic 74') || n.includes('ic cd') || n.includes('ic ') || n.includes('driver')) {
    return 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('atmega') || n.includes('pic1') || n.includes('stm32') || n.includes('attiny')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('arduino uno')) {
    return 'https://images.unsplash.com/photo-1608555817751-494d55dd63cc?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('arduino nano') || n.includes('pro mini')) {
    return 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('esp32') || n.includes('esp8266') || n.includes('nodemcu') || n.includes('wemos')) {
    return 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('raspberry pi 4') || n.includes('raspberry pi 5')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('raspberry pi pico') || n.includes('zero')) {
    return 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80';
  }
  if (c.includes('sensor')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('lcd') || n.includes('oled') || n.includes('display') || n.includes('tft') || n.includes('matrix')) {
    return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('bluetooth') || n.includes('lora') || n.includes('wifi') || n.includes('antenna') || n.includes('rfid') || n.includes('nfc') || n.includes('gsm')) {
    return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('servo') || n.includes('stepper') || n.includes('motor') || n.includes('pump') || n.includes('fan')) {
    return 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('relay') || n.includes('switch') || n.includes('keypad')) {
    return 'https://images.unsplash.com/photo-1580584126903-c17d41830450?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('buck') || n.includes('boost') || n.includes('smps') || n.includes('bms') || n.includes('power bank') || n.includes('adapter')) {
    return 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('battery') || n.includes('lipo') || n.includes('18650') || n.includes('charger')) {
    return 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('breadboard') || n.includes('perfboard') || n.includes('pcb') || n.includes('jumper wire') || n.includes('cable') || n.includes('connector')) {
    return 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('soldering') || n.includes('multimeter') || n.includes('drill') || n.includes('cutter') || n.includes('plier') || n.includes('tool')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('drone') || n.includes('robot') || n.includes('chassis') || n.includes('3d printer')) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('enclosure') || n.includes('box')) {
    return 'https://images.unsplash.com/photo-1580584126903-c17d41830450?auto=format&fit=crop&w=600&q=80';
  }

  return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
}

function getPriceForProduct(name, categoryNo) {
  const n = name.toLowerCase();
  if (n.includes('resistor kit') || n.includes('capacitor kit') || n.includes('diodes and transistors kit')) return 299;
  if (categoryNo === 1) {
    if (n.includes('power resistor')) return 35;
    if (n.includes('potentiometer') || n.includes('slide pot')) return 28;
    if (n.includes('trimpot') || n.includes('multi-turn')) return 32;
    if (n.includes('thermistor') || n.includes('ldr') || n.includes('varistor')) return 18;
    return 3; // Resistors
  }
  if (categoryNo === 2) {
    if (n.includes('supercapacitor')) return 180;
    if (n.includes('fan/motor run')) return 95;
    if (n.includes('tantalum')) return 25;
    if (n.includes('electrolytic')) return 12;
    return 5; // Ceramic / Film
  }
  if (categoryNo === 3) {
    if (n.includes('bridge rectifier')) return 45;
    if (n.includes('zener')) return 8;
    return 6; // Standard diodes
  }
  if (categoryNo === 4) {
    if (n.includes('led strip') || n.includes('ws2812b') || n.includes('apa102')) return 349;
    if (n.includes('high power led') || n.includes('cob led')) return 85;
    if (n.includes('laser module')) return 75;
    if (n.includes('optocoupler')) return 22;
    return 4; // LEDs
  }
  if (categoryNo === 5) {
    if (n.includes('2n3055') || n.includes('2sc5200') || n.includes('2sa1943')) return 75;
    if (n.includes('tip') || n.includes('bd139') || n.includes('bd140')) return 25;
    return 8; // BC547 etc
  }
  if (categoryNo === 6) {
    if (n.includes('igbt')) return 180;
    if (n.includes('irfp')) return 140;
    return 55; // MOSFETs
  }
  if (categoryNo === 7) return 35; // SCR, TRIAC
  if (categoryNo === 8) {
    if (n.includes('ams1117')) return 18;
    return 28; // 7805 etc
  }
  if (categoryNo === 9) {
    if (n.includes('audio amplifier')) return 65;
    if (n.includes('timer') || n.includes('ne555')) return 20;
    return 35; // Op-amps
  }
  if (categoryNo === 10 || categoryNo === 11) return 32; // Logic ICs
  if (categoryNo === 12) {
    if (n.includes('driver module')) return 180;
    return 48; // Special ICs
  }
  if (categoryNo === 13) {
    if (n.includes('atmega2560')) return 380;
    if (n.includes('atmega328p')) return 195;
    if (n.includes('stm32')) return 160;
    return 95; // Microcontroller ICs
  }
  if (categoryNo === 14) {
    if (n.includes('raspberry pi 5')) return 7899;
    if (n.includes('raspberry pi 4')) return 5499;
    if (n.includes('jetson nano')) return 14500;
    if (n.includes('fpga') || n.includes('tang nano')) return 2800;
    if (n.includes('teensy')) return 2600;
    if (n.includes('mega 2560')) return 980;
    if (n.includes('uno')) return 540;
    if (n.includes('nano')) return 280;
    if (n.includes('esp32')) return 380;
    if (n.includes('pico')) return 420;
    return 450;
  }
  if (categoryNo >= 15 && categoryNo <= 22) {
    if (n.includes('rplidar')) return 8999;
    if (n.includes('camera')) return 650;
    if (n.includes('gps')) return 480;
    if (n.includes('thermal') || n.includes('ecg')) return 1200;
    if (n.includes('dust') || n.includes('co2')) return 950;
    return 190;
  }
  if (categoryNo === 23) {
    if (n.includes('nextion')) return 2400;
    if (n.includes('e-paper')) return 1450;
    if (n.includes('tft')) return 680;
    if (n.includes('oled')) return 260;
    if (n.includes('lcd')) return 180;
    return 95;
  }
  if (categoryNo === 24) {
    if (n.includes('4g') || n.includes('7600') || n.includes('7670')) return 2200;
    if (n.includes('gsm') || n.includes('sim800') || n.includes('sim900')) return 850;
    if (n.includes('lora')) return 550;
    if (n.includes('xbee')) return 1800;
    return 160;
  }
  if (categoryNo === 25) {
    if (n.includes('bldc')) return 750;
    if (n.includes('nema23')) return 1650;
    if (n.includes('nema17')) return 780;
    if (n.includes('775')) return 420;
    if (n.includes('mg996') || n.includes('linear actuator')) return 480;
    if (n.includes('servo')) return 150;
    return 120;
  }
  if (categoryNo === 26) {
    if (n.includes('8-channel')) return 420;
    if (n.includes('4-channel')) return 240;
    if (n.includes('2-channel')) return 140;
    if (n.includes('relay')) return 80;
    return 25;
  }
  if (categoryNo === 27) {
    if (n.includes('smps 24v 10a')) return 1450;
    if (n.includes('smps')) return 450;
    if (n.includes('solar')) return 350;
    return 95;
  }
  if (categoryNo === 28 || categoryNo === 46) {
    if (n.includes('12v 7ah')) return 1450;
    if (n.includes('lipo 3s')) return 1200;
    if (n.includes('lipo')) return 450;
    if (n.includes('18650 cell')) return 220;
    return 45;
  }
  if (categoryNo === 29) {
    if (n.includes('transformer')) return 280;
    if (n.includes('peltier')) return 240;
    return 25;
  }
  if (categoryNo === 30 || categoryNo === 45 || categoryNo === 51) {
    if (n.includes('breadboard 830')) return 160;
    if (n.includes('breadboard')) return 90;
    if (n.includes('jumper wires')) return 85;
    return 35;
  }
  if (categoryNo === 31 || categoryNo === 34 || categoryNo === 47) {
    if (n.includes('oscilloscope')) return 4800;
    if (n.includes('bench power')) return 5200;
    if (n.includes('soldering station') || n.includes('hot air')) return 2400;
    if (n.includes('multimeter')) return 450;
    if (n.includes('soldering iron')) return 250;
    return 150;
  }
  if (categoryNo === 33 || categoryNo === 43 || categoryNo === 44) {
    if (n.includes('3d printer (fdm)')) return 18500;
    if (n.includes('drone') || n.includes('beast')) return 7500;
    if (n.includes('robotic arm')) return 3400;
    if (n.includes('robot')) return 1200;
    if (n.includes('starter kit')) return 1850;
    return 650;
  }
  if (categoryNo === 50) return 180;
  return 99;
}

function extractSpecs(name, categoryName) {
  const specs = {
    Category: categoryName,
    Model: name,
  };
  const mVolt = name.match(/(\d+(?:\.\d+)?)\s*V(?:olt)?/i);
  if (mVolt) specs['Voltage'] = mVolt[0];
  const mAmp = name.match(/(\d+(?:\.\d+)?)\s*(?:A|mA)/i);
  if (mAmp) specs['Current Rating'] = mAmp[0];
  const mRes = name.match(/(\d+(?:\.\d+)?)\s*(?:ohm|K|M)/i);
  if (mRes && (categoryName.includes('Resistor') || name.includes('ohm') || name.includes('Pot'))) {
    specs['Resistance'] = mRes[0];
  }
  const mCap = name.match(/(\d+(?:\.\d+)?)\s*(?:pF|nF|uF|F)/i);
  if (mCap && (categoryName.includes('Capacitor') || name.includes('uF') || name.includes('pF') || name.includes('nF'))) {
    specs['Capacitance'] = mCap[0];
  }
  const mWatt = name.match(/(\d+(?:\/\d+)?)\s*W/i);
  if (mWatt) specs['Power Rating'] = mWatt[0];
  specs['RoHS Compliant'] = 'Yes';
  return specs;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

module.exports = {
  getComponentImage,
  getPriceForProduct,
  extractSpecs,
  generateSlug
};
