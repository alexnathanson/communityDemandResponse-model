//get model settings from query string
const urlParams = new URLSearchParams(location.search);
let testSettings = {};

let qString = '?';
for (const [key, value] of urlParams.entries()) {
  if(qString != '?'){
    qString = qString + "&";
  }
  testSettings[key]=value;
  qString=qString + key + '=' + value
}

//rewrite nav links
document.getElementById('network').href = document.getElementById('network').href + qString
document.getElementById('settings').href = document.getElementById('settings').href + qString
document.getElementById('single').href = document.getElementById('single').href + qString

//instantiate new model
let model = new Model()

model.setupModel(testSettings);