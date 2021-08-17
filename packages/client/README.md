# Journey to Space - 0504 - Powering your Spacecraft

A spacecraft’s energy system must be engineered to keep power flowing to vital life support systems at all times. This game/simulation let's you explore that situation.

## Automatic install instructions

You can install this application using the private SMM Boxen repo. This requires an internal SMM account.
First, install the basic boxen repo, using our [Boxen setup script](https://github.com/scimusmn/boxen-setup). 
Once the Boxen script has run through without errors, you can run the custom Powering you Spacecraft install.

    boxen space_0504_power_spacecraft
    
After running the Boxen install script you will still need to manually configure the software. 

## Configure the application

    cd ~/Desktop/power-spacecraft/data
    cp settings.default.xml settings.xml

Edit the settings.xml file, defining the correct values for this physical
install of the Energy Management component. Most of the default values are
fine, but you may need to adjust the wiring toggle and the solar panel
multipliers, depending on the physical exhibit.

    cp serialPort.default.js serialPort.js
    
Edit the serialPort.js file, defining the name of the USB serial device.

TODO: Define how to find this.


### Secondary Language
To change the secondary language (English is always primary), edit the `secondaryLanguage` setting in settings.xml:

Spanish:
```xml
<setting id="secondaryLanguage" value="es" />
```
French:
```xml
<setting id="secondaryLanguage" value="fr" />
```


# Run the application
The application should start correctly after rebooting the computer.
