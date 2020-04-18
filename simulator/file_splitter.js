

/***
**	A simple program for determining line numbers.
**	@file_name = file name
**	@space = number of lines from each file
**	@num_core = the number of pieces
**	@total = total lines in a file
**	
**	The default values, 'data_file' that has 1000 lines in total, splitted into 10 pieces, 100 lines for each.
**	If the 'data_file' includes more than 'num_core*space' lines, than the last file will include the rest of the lines.
**	The application doesn't split any data for caution, it only writes the scripts into console.
**	You can split the data in the directory when you run the output 
**/

var file_name='data_file';
var space = 100;
var num_core = 10;
var total = 1000;

var j = 0;
for(var i=0; i < num_core; i++){


	if(i == num_core - 1 && j+space > total ){
		console.log(`sed -n '${j+1}, ${total}p' ${file_name} > raw_${i}.json`);
	}else{
		
		console.log(`sed -n '${j+1}, ${j+space}p' ${file_name} > raw_${i}.json`);
		j += space;
	}


} 