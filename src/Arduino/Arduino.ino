//**************************************************************//
//  Component: Powering Your Spacecraft                         //
//  Project: Powerhouse MoSAC                                   //
//  Author  : Joe Meyer                                         //
//  Date    : 06/14/2021                                        //
//  Version : 1.0                                               //
//  Description : Arduino Only Sketch                           //
//****************************************************************

#include "SerialSelector.h"
#include "arduino-base/Libraries/SerialController.hpp"

// Pin assignments
const int interior_solar_pin = 6;
const int interior_battery_pin = 5;
const int interior_pin = 4;

const int heat_solar_pin = 6;
const int heat_battery_pin = 5;
const int heat_pin = 4;

const int communication_solar_pin = 6;
const int communication_battery_pin = 5;
const int communication_pin = 0; // sound will be played from PC

const int food_solar_pin = 6;
const int food_battery_pin = 5;
const int food_pin = 3;

const int fan_solar_pin = 6;
const int fan_battery_pin = 5;
const int fan_pin = 3;

const int oxygen_solar_pin = 6;
const int oxygen_battery_pin = 5;
const int oxygen_pin = 3;

const int easy_hard_pin = 6;

bool is_hard = 0;

SerialController serialController;
const long baudrate = 115200;

// Array of selectors
int NUMBER_OF_SELECTORS = 6;
SerialSelector Selectors[] = { // TODO REMOVE OUTPUT PIN FROM SELECTOR SETUP
    SerialSelector(&serialController, "interior", interior_solar_pin, interior_battery_pin, interior_pin),
    SerialSelector(&serialController, "heat", heat_solar_pin, heat_battery_pin, heat_pin),
    SerialSelector(&serialController, "communication", communication_solar_pin, communication_battery_pin, communication_pin),
    SerialSelector(&serialController, "food", food_solar_pin, food_battery_pin, food_pin),
    SerialSelector(&serialController, "fan", fan_solar_pin, fan_battery_pin, fan_pin),
    SerialSelector(&serialController, "oxygen", oxygen_solar_pin, oxygen_battery_pin, oxygen_pin)};

void setup()
{
    pinMode(easy_hard_pin, INPUT_PULLUP);
    is_hard = !digitalRead(easy_hard_pin);

    // Ensure Serial Port is open and ready to communicate
    serialController.setup(baudrate, &onParse);
}

void loop()
{
    for (int i = 0; i < NUMBER_OF_SELECTORS; i++)
    {
        Selectors[i].update();
    }
    updateEasyHard();
    delay(20);
    serialController.update();
}

void updateEasyHard()
{
    if (is_hard != digitalRead(easy_hard_pin))
    {
        if (is_hard)
            serialController.sendMessage("level", "hard");
        if (!is_hard)
            serialController.sendMessage("level", "easy");

        is_hard = digitalRead(easy_hard_pin);
    }
}

// this function will run when serialController reads new data
void onParse(char *message, char *value)
{
    if (strcmp(message, "wake-arduino") == 0 && strcmp(value, "1") == 0)
    {
        // you must respond to this message, or else
        // stele will believe it has lost connection to the arduino
        serialController.sendMessage("arduino-ready", "1");
    }
    // TODO: ADD else if ACTIONS FOR OUTPUT ON/OFF COMMANDS
    else
    {
        // helpfully alert us if we've sent something wrong :)
        serialController.sendMessage(message, "X");
    }
}