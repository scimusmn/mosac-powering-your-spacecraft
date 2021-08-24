/**
 * Define the serial port ID for the specific USB to serial adapter
 * in use for this component. This is a unique ID for each install.
 */
exports.serialPort = function () {
  return "/dev/tty.usbserial-XXXXXXX";
};