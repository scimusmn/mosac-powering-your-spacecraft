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
#include "Ramp.h"

// Pin assignments
const int level_pin = 10;

const int oxygen_solar_pin = 12;
const int oxygen_battery_pin = 13;
const int oxygen_pin = 9;

const int fan_solar_pin = 44;
const int fan_battery_pin = 42;
const int fan_pin = 8;

const int grow_solar_pin = 40;
const int grow_battery_pin = 38;
const int grow_pin = 7;

const int communication_solar_pin = 36;
const int communication_battery_pin = 34;
const int communication_pin = 18; // No connection. sound will be played from PC

const int cook_solar_pin = 32;
const int cook_battery_pin = 30;
const int cook_pin = 19;

const int interior_solar_pin = 22;
const int interior_battery_pin = 21;
const int interior_pin = 20;

const int sun_pwm_pin = 2;

bool is_hard = 0;
bool solar_available = 0;
bool battery_available = 0;

//part of set up for serial communication with React
SerialController serialController;
const long baudrate = 115200;

Ramp sun(false, sun_pwm_pin); // create sun object that can fade on and off.

// Array of selectors
int NUMBER_OF_SELECTORS = 6;
SerialSelector Selectors[] = {
    SerialSelector(&serialController, "interior", interior_solar_pin, interior_battery_pin, interior_pin),
    SerialSelector(&serialController, "cook", cook_solar_pin, cook_battery_pin, cook_pin),
    SerialSelector(&serialController, "communication", communication_solar_pin, communication_battery_pin, communication_pin),
    SerialSelector(&serialController, "grow", grow_solar_pin, grow_battery_pin, grow_pin),
    SerialSelector(&serialController, "fan", fan_solar_pin, fan_battery_pin, fan_pin),
    SerialSelector(&serialController, "oxygen", oxygen_solar_pin, oxygen_battery_pin, oxygen_pin)};

void setup()
{
    pinMode(level_pin, INPUT_PULLUP);

    // Ensure Serial Port is open and ready to communicate
    serialController.setup(baudrate, &onParse);
}

void loop()
{
    //loop to check and send any updates to selector inputs.
    for (int i = 0; i < NUMBER_OF_SELECTORS; i++)
    {
        Selectors[i].update();
    }
    updateLevel(); //check and send update to level selector
    delay(20);     // slow down loop a little to minimize selector noise.
    serialController.update();
    sun.update();
}

void updateLevel() //check and send update to level selector
{
    if (is_hard != digitalRead(level_pin)) //the state has changed since last update
    {
        is_hard = digitalRead(level_pin); // update the state.

        //send the new state of the selector.
        if (is_hard)
            serialController.sendMessage("level", "hard");
        if (!is_hard)
            serialController.sendMessage("level", "easy");
    }
}

// this function will run when serialController reads new data
void onParse(char *message, char *value)
{
    bool match = false; //flag to monitor if message was a match to outputs.
    for (int i = 0; i < NUMBER_OF_SELECTORS; i++)
    {
        // if a message matches, match will become true.
        match = match | Selectors[i].checkMessageForUpdate(message, value);
    }

    if (strcmp(message, "wake-arduino") == 0 && strcmp(value, "1") == 0)
    {
        // you must respond to this message, or else
        // stele will believe it has lost connection to the arduino
        serialController.sendMessage("arduino-ready", "1");
    }
    else if (strcmp(message, "sun") == 0)
    {
        if (strcmp(value, "on") == 0)
            sun.rampTo(100, 1000); //fade sun to 100% in 1000 millisec.
        else if (strcmp(value, "off") == 0)
            sun.rampTo(0, 1000); //fade sun to 0% in 1000 millisec.
    }

    // sends the current state of the controll board selectors.
    else if (strcmp(message, "get-all-states") == 0)
    {
        for (int i = 0; i < NUMBER_OF_SELECTORS; i++)
        {
            Selectors[i].sendState();
        }
        is_hard = !digitalRead(level_pin);
        updateLevel();
    }
    else
    {
        // helpfully alert us if we've sent something wrong :)
        if (match == false)
            serialController.sendMessage(message, "ERROR");
    }
}
