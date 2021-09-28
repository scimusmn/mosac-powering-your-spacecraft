//Library for Powering Your Spacecraft
// a 3 position selector (2 digital pins) that reports it's state via serial.
// also updates a digital output based on a serial message.

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
    int pinOutput;
    int state;
    int solarAvailable = 1;
    int batteryAvailable = 1;

  public:
    SerialSelector(SerialController *_serialC, char _message[30], int _p, int _p2, int _p3)
    {
      pinSolar = _p;
      pinBattery = _p2;
      pinOutput = _p3;
      message = _message;
      serialController = _serialC;
      pinMode(_p, INPUT_PULLUP);
      pinMode(_p2, INPUT_PULLUP);
      pinMode(_p3, OUTPUT);
    }

    void update()
    {
      if (digitalRead(pinSolar) && digitalRead(pinBattery) && state != 0)
      {
        // Off mode
        digitalWrite(pinOutput, LOW);
        state = 0;
        sendState();
      }
      else if (!digitalRead(pinSolar) && state != 1)
      {
        // Solar mode
        state = 1;
        sendState();
        if (solarAvailable == 1) // Turn on if simulated solar power available
        {
          digitalWrite(pinOutput, HIGH);
        }
        else if (solarAvailable == 0) {
          digitalWrite(pinOutput, LOW);
        }
      }
      else if (!digitalRead(pinBattery) && state != 2)
      {
        // Battery mode
        state = 2;
        sendState();
        if (batteryAvailable == 1) // Turn on if simulated battery power available
        {
          digitalWrite(pinOutput, HIGH);
        }
        else if (batteryAvailable == 0) {
          digitalWrite(pinOutput, LOW);
        }
      }
    }

    void sendState()
    {
      if (state == 0)
        serialController->sendMessage(message, "off");
      else if (state == 1)
        serialController->sendMessage(message, "solar");
      else if (state == 2)
        serialController->sendMessage(message, "battery");
    }

    void setSolarAvailability(int _solarAvailable)
    {
      solarAvailable = _solarAvailable;

      // By setting state to -1, we force
      // a state refresh on next update.
      state = -1;
    }

    void setBatteryAvailability(int _batteryAvailable)
    {
      batteryAvailable = _batteryAvailable;

      // By setting state to -1, we force
      // a state refresh on next update.
      state = -1;
    }

    bool checkMessageForUpdate(char *serialMessage, char *serialValue)
    {
      if (strcmp(serialMessage, message) == 0)
      {
        if (strcmp(serialValue, "on") == 0)
        {
          digitalWrite(pinOutput, HIGH);
          return (1);
        }
        else if (strcmp(serialValue, "off") == 0)
        {
          digitalWrite(pinOutput, LOW);
          return (1);
        }
      }
      else
        return (0);
    }
};

#endif
