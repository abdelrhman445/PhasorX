// ==========================================================
// Component catalog seed
// ==========================================================
// Populates the generic `Component` collection (backend/src/modules/components)
// with a broad electronics/electrical parts catalog — the "basic components"
// meant to be browsed/served via GET /api/components for a sidebar parts
// library. This is a reference catalog (name/type/pins/defaultParams), and
// is independent from the interactive ladder-logic component types wired
// into the live circuit simulator (see modules/simulation/componentDefinitions.ts) —
// several categories below (fuse, isolator switch, contactor, relay, timer,
// push buttons, resistor/capacitor/inductor, terminal block, pilot lamp,
// motor) overlap with those on purpose, since those ARE both real catalog
// parts and live simulator nodes.
//
// Run with: npm run seed:components (from backend/)

import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import Component, { IComponent } from '../modules/components/component.model';

type SeedComponent = Pick<IComponent, 'name' | 'type' | 'pins' | 'defaultParams'>;

const COMPONENTS: SeedComponent[] = [
  // ---- Basic passives ----
  { name: 'Resistor', type: 'passive', pins: ['IN', 'OUT'], defaultParams: { resistanceOhms: 220, tolerance: '5%' } },
  { name: 'Ceramic Capacitor', type: 'passive', pins: ['IN', 'OUT'], defaultParams: { capacitanceFarad: 1e-8, voltageRating: 50 } },
  { name: 'Electrolytic Capacitor', type: 'passive', pins: ['+', '-'], defaultParams: { capacitanceFarad: 1e-4, voltageRating: 25 } },
  { name: 'Inductor', type: 'passive', pins: ['IN', 'OUT'], defaultParams: { inductanceHenry: 0.01 } },
  { name: 'Potentiometer', type: 'passive', pins: ['P1', 'WIPER', 'P2'], defaultParams: { resistanceOhms: 10000 } },

  // ---- Semiconductors ----
  { name: 'Diode (1N4007)', type: 'semiconductor', pins: ['ANODE', 'CATHODE'], defaultParams: { forwardVoltage: 0.7 } },
  { name: 'Zener Diode', type: 'semiconductor', pins: ['ANODE', 'CATHODE'], defaultParams: { zenerVoltage: 5.1 } },
  { name: 'LED', type: 'semiconductor', pins: ['ANODE', 'CATHODE'], defaultParams: { color: 'red', forwardVoltage: 2.0 } },
  { name: 'Bridge Rectifier', type: 'semiconductor', pins: ['AC1', 'AC2', '+', '-'], defaultParams: {} },
  { name: 'Transistor NPN (2N2222)', type: 'semiconductor', pins: ['BASE', 'COLLECTOR', 'EMITTER'], defaultParams: {} },
  { name: 'Transistor PNP (2N2907)', type: 'semiconductor', pins: ['BASE', 'COLLECTOR', 'EMITTER'], defaultParams: {} },
  { name: 'MOSFET (IRF540N)', type: 'semiconductor', pins: ['GATE', 'DRAIN', 'SOURCE'], defaultParams: {} },

  // ---- ICs ----
  { name: '555 Timer IC', type: 'ic', pins: ['GND', 'TRIG', 'OUT', 'RESET', 'CTRL', 'THRES', 'DISCH', 'VCC'], defaultParams: {} },
  { name: 'Op-Amp (LM358)', type: 'ic', pins: ['OUT1', 'IN1-', 'IN1+', 'VCC', 'IN2+', 'IN2-', 'OUT2', 'GND'], defaultParams: {} },
  { name: 'Voltage Regulator (7805)', type: 'ic', pins: ['IN', 'GND', 'OUT'], defaultParams: { outputVoltage: 5 } },
  { name: 'Microcontroller IC (ATmega328P)', type: 'ic', pins: ['VCC', 'GND', 'RESET', 'XTAL1', 'XTAL2'], defaultParams: {} },

  // ---- Protection ----
  { name: 'Fuse', type: 'protection', pins: ['IN', 'OUT'], defaultParams: { ratingAmps: 5 } },
  { name: 'Circuit Breaker (MCB)', type: 'protection', pins: ['IN', 'OUT'], defaultParams: { ratingAmps: 16, poles: 1 } },
  { name: 'Isolator Switch', type: 'protection', pins: ['IN', 'OUT'], defaultParams: {} },
  { name: 'Thermal Overload Relay', type: 'protection', pins: ['95', '96'], defaultParams: { tripCurrentAmps: 9 } },
  { name: 'Surge Protector (SPD)', type: 'protection', pins: ['L', 'N', 'PE'], defaultParams: {} },

  // ---- Switching / control ----
  { name: 'Push Button (NO)', type: 'switch', pins: ['IN', 'OUT'], defaultParams: {} },
  { name: 'Push Button (NC)', type: 'switch', pins: ['IN', 'OUT'], defaultParams: {} },
  { name: 'Emergency Stop Button', type: 'switch', pins: ['IN', 'OUT'], defaultParams: {} },
  { name: 'Limit Switch (NO)', type: 'switch', pins: ['IN', 'OUT'], defaultParams: {} },
  { name: 'Limit Switch (NC)', type: 'switch', pins: ['IN', 'OUT'], defaultParams: {} },
  { name: 'Selector Switch (2-Position)', type: 'switch', pins: ['COM', 'OUT1', 'OUT2'], defaultParams: {} },
  { name: 'Toggle Switch', type: 'switch', pins: ['IN', 'OUT'], defaultParams: {} },
  { name: 'Contactor', type: 'control', pins: ['A1', 'A2', 'L1', 'L2', 'L3', 'T1', 'T2', 'T3', '13', '14', '21', '22'], defaultParams: {} },
  { name: 'Electromechanical Relay', type: 'control', pins: ['A1', 'A2', '13', '14', '21', '22'], defaultParams: {} },
  { name: 'Timer Relay (TON)', type: 'control', pins: ['A1', 'A2', '15', '16', '17', '18'], defaultParams: { delaySeconds: 5 } },
  { name: 'Relay Module (4-Channel)', type: 'module', pins: ['VCC', 'GND', 'IN1', 'IN2', 'IN3', 'IN4'], defaultParams: {} },

  // ---- Power ----
  { name: 'Battery (9V)', type: 'power', pins: ['+', '-'], defaultParams: { voltage: 9 } },
  { name: 'Battery Holder (2xAA)', type: 'power', pins: ['+', '-'], defaultParams: { voltage: 3 } },
  { name: 'AC-DC Power Supply Module', type: 'power', pins: ['AC_L', 'AC_N', 'DC+', 'DC-'], defaultParams: { outputVoltage: 12 } },
  { name: 'Control Transformer (220/24V)', type: 'power', pins: ['P1', 'P2', 'S1', 'S2'], defaultParams: { primaryVoltage: 220, secondaryVoltage: 24 } },
  { name: 'Solar Panel Module', type: 'power', pins: ['+', '-'], defaultParams: { wattage: 10 } },
  { name: '3-Phase Power Source', type: 'power', pins: ['L1', 'L2', 'L3'], defaultParams: {} },

  // ---- Boards / prototyping / dev modules ----
  { name: 'Prototyping PCB Board', type: 'board', pins: [], defaultParams: {} },
  { name: 'Breadboard', type: 'board', pins: [], defaultParams: {} },
  { name: 'DIN Rail', type: 'board', pins: [], defaultParams: {} },
  { name: 'Terminal Block', type: 'board', pins: ['T1', 'T2', 'T3', 'T4'], defaultParams: {} },
  { name: 'Distribution Board (Busbar)', type: 'board', pins: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'], defaultParams: {} },
  { name: 'Arduino Uno Board', type: 'module', pins: ['VIN', 'GND', '5V', '3V3', 'D0..D13', 'A0..A5'], defaultParams: {} },
  { name: 'ESP32 Dev Board', type: 'module', pins: ['VIN', 'GND', '3V3', 'GPIO0..GPIO39'], defaultParams: {} },
  { name: 'Raspberry Pi Module', type: 'module', pins: ['5V', '3V3', 'GND', 'GPIO0..GPIO27'], defaultParams: {} },
  { name: 'PLC I/O Module', type: 'module', pins: ['IN1', 'IN2', 'IN3', 'IN4', 'OUT1', 'OUT2', 'OUT3', 'OUT4'], defaultParams: {} },
  { name: 'Motor Driver Module (L298N)', type: 'module', pins: ['IN1', 'IN2', 'IN3', 'IN4', 'ENA', 'ENB', 'OUT1', 'OUT2', 'OUT3', 'OUT4'], defaultParams: {} },
  { name: 'PIR Motion Sensor Module', type: 'module', pins: ['VCC', 'GND', 'OUT'], defaultParams: {} },
  { name: 'Ultrasonic Sensor Module (HC-SR04)', type: 'module', pins: ['VCC', 'TRIG', 'ECHO', 'GND'], defaultParams: {} },

  // ---- Electromechanical / misc ----
  { name: 'DC Motor', type: 'electromechanical', pins: ['+', '-'], defaultParams: {} },
  { name: 'Induction Motor (3-Phase)', type: 'electromechanical', pins: ['U1', 'V1', 'W1'], defaultParams: {} },
  { name: 'Buzzer', type: 'electromechanical', pins: ['+', '-'], defaultParams: {} },
  { name: 'Cooling Fan', type: 'electromechanical', pins: ['+', '-'], defaultParams: {} },
  { name: 'Solenoid Valve', type: 'electromechanical', pins: ['+', '-'], defaultParams: {} },
  { name: 'Crystal Oscillator', type: 'misc', pins: ['XTAL1', 'XTAL2'], defaultParams: { frequencyHz: 16000000 } },
  { name: 'Heat Sink', type: 'misc', pins: [], defaultParams: {} },
  { name: 'Header Connector (2.54mm)', type: 'misc', pins: ['P1..Pn'], defaultParams: {} },
  { name: 'Jumper Wire Set', type: 'misc', pins: [], defaultParams: {} },
  { name: 'Pilot Lamp (Indicator)', type: 'misc', pins: ['L'], defaultParams: { color: 'green' } },
];

async function seed() {
  await connectDB();

  let created = 0;
  let updated = 0;

  for (const c of COMPONENTS) {
    const res = await Component.findOneAndUpdate(
      { name: c.name },
      { $set: c },
      { upsert: true, new: false }
    );
    if (res) updated++;
    else created++;
  }

  console.log(`✅ Component catalog seeded: ${created} created, ${updated} updated, ${COMPONENTS.length} total.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Failed to seed components:', err);
  process.exit(1);
});
