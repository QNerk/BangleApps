var hrAlertWidget = {
  name: "HR Alert by Q_Nerk",
  width: 24, // Width of widget in pixels
  height: 24, // Height of widget in pixels
  lastAlert: 0,
  render: function(display) {
    // Get the current heart rate from the monitor
    var hr = E.HRM.get().raw;

    // Check if the heart rate is out of range
    if (hr < 60 || hr > 100) {
      // Send a Bluetooth message if it has been at least 10 seconds since the last alert
      if ((Date.now() - this.lastAlert) > 10000) {
        var message = "Heart rate out of range: " + hr.toString();
        NRF.requestDevice({ filters: [{ namePrefix: 'ESP32' }] })
          .then(function(device) {
            device.gatt.connect()
              .then(function(server) {
                server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e')
                  .then(function(service) {
                    service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e')
                      .then(function(characteristic) {
                        characteristic.writeValue(message);
                        console.log("Bluetooth message sent: " + message);
                      });
                  });
              });
          });
        this.lastAlert = Date.now();
      }
    }

    // Draw the heart rate value on the widget
    display.setFontAlign(-1,-1); // Align text to top-left corner
    display.drawString(hr.toString(), 0, 0);
  },
  interval: 1000 // Update interval in milliseconds
};

// Add the widget to the widget list
Bangle.loadWidgets();
Bangle.addWidgets([hrAlertWidget]);
