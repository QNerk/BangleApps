(() => {
  var settings = require('Storage').readJSON("hralarm.json", true) || {};
  if (!settings.enabled){ Bangle.setHRMPower(0, 'hralarm'); return; }
  Bangle.setHRMPower(1, 'hralarm');
  var hitLimit = 0;
  var checkHr = function(hr)if (hr < 60 || hr > 100) {
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
      };
  Bangle.on("HRM", checkHr);
  Bangle.on("BTHRM", checkHr);

  WIDGETS["hralarm"]={
    area:"tl",
    width: 0,
    draw: function(){}
  };
})()
