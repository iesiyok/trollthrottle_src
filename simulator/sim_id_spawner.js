/**
**	Runs the user cookie precomputation in parallel
**	Requires number of workers given from the terminal
**	Each worker will work on different data file based on the argument given
**	e.g 'node sim_id_spawner.js 5' will create 5 workers working in parallel:
**				node sim_id_creator.js 0
**				node sim_id_creator.js 1
**				node sim_id_creator.js 2
**				node sim_id_creator.js 3
**				node sim_id_creator.js 4
**
**/

const locals = require('./locals');
const consts = require('./consts');
const http = require('http');

var spawn = require("child_process").spawn;
const wait = require('wait-for-stuff');
const num_cores = process.argv[2];

const sim_type = process.argv[3];
// console.log(num_cores);


for (var i=0; i < num_cores; i++){

			// console.log("core: ", i);

		var cp = spawn("node", ["sim_id_creator.js", i, sim_type ]);
		display_error(cp);

		wait.for.time(15);


		


}


function display_error(cp){
    	cp.stdout.on("data", function(data){
			console.log(`${cp.pid} :: STDOUT: ${data.toString()}`);
		}); 


		cp.stdout.on("close", function(code){
			console.log(`${cp.pid} :: Child process has ended ~  ${code}`);
		}); 

		cp.stderr.on('data', (data) => {
		  console.error(`${cp.pid} :: Child stderr: ${data} \n`);
		});
}
