//Library for monitoring a 3 position selector (2 digital pins) that reports it's state via serial.

#include "Arduino.h"
#include "arduino-base/Libraries/SerialController.hpp"

// ensure this library description is only included once
#ifndef SerialSelector_h
#define SerialSelector_h

class SerialSelector
{
private:
    SerialController *serialController;
    char *message;
    int pinSolar;
    int pinBattery;
    int pinOutput; //TODO REMOVE THIS LINE
    int state;

public:
    SerialSelector(SerialController *_serialC, char _message[30], int _p, int _p2, int _p3) //TODO REMOVE _p3
    {
        pinSolar = _p;
        pinBattery = _p2;
        pinOutput = _p3; //TODO REMOVE THIS LINE
        message = _message;
        serialController = _serialC;
        pinMode(_p, INPUT_PULLUP);
        pinMode(_p2, INPUT_PULLUP);
        pinMode(_p3, OUTPUT); //TODO REMOVE THIS LINE
    }

    void update()
    {
        if (!digitalRead(pinSolar) && !digitalRead(pinBattery) && state != 0)
        {
            digitalWrite(pinOutput, LOW); //TODO REMOVE THIS LINE
            state = 0;
            serialController->sendMessage(message, "Off");
        }
        else if (digitalRead(pinSolar) && state != 1)
        {
            digitalWrite(pinOutput, HIGH); //TODO REMOVE THIS LINE
            state = 1;
            serialController->sendMessage(message, "Solar");
        }
        else if (digitalRead(pinBattery) && state != 2)
        {
            digitalWrite(pinOutput, HIGH); //TODO REMOVE THIS LINE
            state = 2;
            serialController->sendMessage(message, "Battery");
        }
    }
};

#endif
