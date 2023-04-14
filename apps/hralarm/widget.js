(() => {
  var settings = require('Storage').readJSON("hralarm.json", true) || {};
  if (!settings.enabled){ Bangle.setHRMPower(0, 'hralarm'); return; }
  Bangle.setHRMPower(1, 'hralarm');
  var hitLimit = 0;
  var checkHr = function(hr){
      NRF.setAdvertising({},{
      showName:true,
      manufacturer:0x0590,
      manufacturerData:[0x00,0x01,0x02] // your data here as a series of Bytes
      });
    
    
    if (hr.bpm > settings.warning && hr.bpm <= settings.upper){
      Bangle.buzz(100, 1)
      ;
    }
    if (hitLimit < getTime() && hr.bpm > settings.upper){
      hitLimit = getTime() + 10;
      Bangle.buzz(2000, 1);

    }
    if (hitLimit > 0 && hr.bpm < settings.lower){
      hitLimit = 0;
      Bangle.buzz(500, 1);
    }
    if (hitLimit < getTime() && hr.bpm > settings.bottom){
      hitLimit = getTime() + 10;
      Bangle.buzz(2000, 1);
  };
  Bangle.on("HRM", checkHr);
  Bangle.on("BTHRM", checkHr);

  WIDGETS["hralarm"]={
    area:"tl",
    width: 0,
    draw: function(){}
  };
})()
