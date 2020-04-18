/**
**	Runs the simulation in parallel
**	Requires number of workers given from the terminal
**	Each worker will work on different data file based on the argument given,
**	months in nodejs start from 0
**	e.g 'node simulation_spawner.js 5, 2020 0 1 12 30' will create 5 simulation workers working in parallel:
**				node simulation.js 0 2020 0 1 12 30
**				node simulation.js 1 2020 0 1 12 30
**				node simulation.js 2 2020 0 1 12 30
**				node simulation.js 3 2020 0 1 12 30
**				node simulation.js 4 2020 0 1 12 30
**
**/

const wait = require('wait-for-stuff');
const spawn = require("child_process").spawn;

const num_core = process.argv[2];
const sim_type = process.argv[3];
const year = process.argv[4];
const month = process.argv[5];
const date = process.argv[6];
const hour = process.argv[7];
const minute = process.argv[8];


for (var i = 0; i < num_core; i++){

	var cp = spawn("node", ["simulation.js", i, sim_type, year, month, date, hour, minute]);

	display_error(cp);

	wait.for.time(10);


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



