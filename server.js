let express = require('express');
let app = express();
app.use(express.static('./'));
//RETURN HTML FILE
app.get("/", function (request, response) {
  response.sendFile('./index.html',{root:'./'});
});
//RETURN HTML STRING
app.get("/hello", function (request, response) {
  response.send('<h1>YHA IoT RULES!</h1>');
});
//RETURN JSON
app.get("/data", function (request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({board:"ESP32",sensor:"depth",value:"102m",location:"Auburn, ME",lastService:"02-12-2018"}));
});
app.listen(5000,function(){
  console.log('the server is listening...')
});