/**
**	Runs the precomputation in parallel
**	Requires number of workers given from the terminal
**	Each worker will work on different data file based on the argument given
**	e.g 'node sim_prec_spawner.js 5' will create 5 workers working in parallel:
**				node sim_prec.js 0
**				node sim_prec.js 1
**				node sim_prec.js 2
**				node sim_prec.js 3
**				node sim_prec.js 4
**
**/

const wait = require('wait-for-stuff');

const spawn = require("child_process").spawn;

const num_core = process.argv[2];

const sim_type = process.argv[3];




for (var i = 0; i < num_core; i++){

	var cp = spawn("node", ["sim_prec.js", i, sim_type]);

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



