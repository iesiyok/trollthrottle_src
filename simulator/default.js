console.log("Please select one of the actions:");
console.log("1. sim_id_spawner");
console.log("2. sim_prec_spawner");
console.log("3. simulation_spawner");



const http         	= require('http'),
	  consts		= require('./consts'),
	  locals		= require('./locals'),
	  fs 			= require('fs');


	  

server        = locals.ledger_host;
server.path   = consts.gpk_path;

console.log(server);


http.get(server, (res) => {
  var obj;
  res.on('data', (chunk)=>{
      obj = JSON.parse(chunk);
  }).on('end',()=>{

  		console.log("OBJ::", obj);
      
      
  });
});

const options = {encoding: 'utf8', flags: 'a'};
const log_path = '/simulator/data/test.txt'
var log_stream = fs.createWriteStream(log_path, options);

log_stream.write("TEST");

