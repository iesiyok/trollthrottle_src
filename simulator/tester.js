
/**
**	A Sequential tester of the application
**  Works with a text file containing user names and other information
**	Creates a new user and later creates 'locals.max_seq' comments for the user
**/

const async         = require('async'),
	  fs			= require('fs'),
	  app 			= require('./app'),
	  consts		= require('./consts'),
	  crypto 		= require('crypto'),
	  locals		= require('./locals'),
	  wait          = require('wait-for-stuff')



/**
**	A text file for receiving user names and other information for test
**	An example of this file is user_data.txt
**/
var lines = fs.readFileSync('/simulator/user_data.txt', "utf8").split('\n');

// a precaution to ensure Daa library has started
wait.for.time(1);


console.log("TESTER");

/**
**	Tester Starter
**/
async.waterfall([

		/**
		**	Create pointers 
		**			'gpk_ptr' : group public key pointer for the DAA API,
		**          'pfc' : Pairing friendly curve pointer for the DAA API, 
		**/


		function(callback){
			app.async_daa_gpk_pointer(function(gpk_ptr, pfc){
				callback(null, gpk_ptr, pfc);
			});
		},
		//Call tester function
		function(gpk_ptr, pfc, callback){
			tester(0, 0, gpk_ptr, pfc);
		}

	], function(err, res){

	});


/**  
**	A recursive tester function
**	Reads the text file line by line, creates new identity first and creates comments (locals.max_seq) times
**/
async function tester(counter, sequence, gp_x, pfc){ 
		
	let line = lines[counter];
	// console.log(line);
	let j = JSON.parse(line);
	login = j.login;
	pwd   = j.pwd;
	bd 	  = j.bd;
	comment = j.comment;
	topic = 1;//random_int(locals.min_random, locals.max_seq);
	new_user = false;
	if (sequence == 0){
		new_user = true;
	}
	// console.log('login=', login, ' new user? = ', new_user, ' seq = ', sequence);
	await _tester(gp_x, pfc, login, pwd, bd, topic, comment, sequence, new_user, function(logger, code){


		console.log("login:", login, ", counter:", counter, ", seq:", sequence);
		if(code == 1){
			fs.appendFile('./logger.log', logger, function (err) {
				  if (err) throw err;
			});
			if (sequence < locals.max_seq) {
				sequence++;
				//counter = counter+1;
				
				
			}else{
				// if (counter < locals.max_random){
				// 	//counter = counter+1;
				// 	sequence = 0;
				// }
				sequence = 0;
			}
		}else{
			//if error occurs, take another user
			//counter = counter+1;
			sequence = 0;

		}
		tester(++counter, sequence, gp_x, pfc );//recursive call
		
	});

}

/**
**	Applies testing requests 
**/
function _tester( gp_x, pfc, login, pwd, bd, topic, comment, sequence, new_user, callback ){

	

	var hrstart = process.hrtime();

	domain = get_date() + "_" + sequence ;

	cookie_path = locals.cookies_path_prefix + login + '_' + bd + '.json' ;
	
	//runs issuing procedure which includes registering with Issuer and Verifier, then joining to the Group
	if (new_user){


		login_pwd 	= login + pwd;
		derived_key = crypto.pbkdf2Sync(login_pwd, locals.salt, 2048, 16, 'sha256').toString('hex');

		is_verify_key = fs.readFileSync(locals.issuer_verify_key);
        is = Buffer.from(is_verify_key.toString(),'hex');

        ver_verify_key = fs.readFileSync(locals.verifier_verify_key);
        ver = Buffer.from(ver_verify_key.toString(),'hex');

		app.async_new_user(gp_x, pfc, login, pwd, derived_key, bd, is, ver, cookie_path, function(code, status){

			// gpk_ptr, pfc, login, pwd, derived_key, bd, is_verify_key, ver_verify_key

				var exec_time = 0;
      			
      			if (code == 1){

      				console.log("Register new user: ", login);

           			exec_time = parseHrtimeToSeconds(process.hrtime(hrstart));
      				logger = 'Result for :: ' + login + ' :: code : ' + code + ', status : ' + status + ', exec_time : ' + exec_time + ' ms. \n';
      				callback(logger, code);

      			}else{

      				console.log("Register new user: ", login, ', error:', status);
      				// console.log("Process finished but an error occurred .. ", status);
      				logger = 'Result for :: ' + login + ' :: code : ' + code + ', status : ' + status + ', exec_time : ' + exec_time + ' ms. \n';
      				callback(logger,  code);
      				
      			}

 	 	});

	}
	//runs commenting requests
	else{

		// console.log("commenting");

		cookie_path = locals.cookies_path_prefix + login + '_' + bd + ".json";

	    var fstart = process.hrtime();

	    fs.readFile(cookie_path, function (err, data) {
	    	var exec_time = 0;
	        if (err){
	          	  console.log('Cookie file doesn\'t exist for this user =', login);
		          logger = 'Result for :: ' + login + " :: code : 0, status : Cookie file doesn\'t exist for this user, exec_time : 0 ms. \n"; 
				  callback(logger, 0);

	        }else{
		          cookie = data.toString();
		          //console.log("cookie:", cookie);

		          
		          
		          app.async_commenting(gp_x, pfc, cookie, topic, comment, domain, function(code, status, headers){

			      			
		      			if (code == 1){
		      				console.log("User:", login, ' commented.');
	           				exec_time = parseHrtimeToSeconds(process.hrtime(fstart));
		      				logger = 'Result for :: ' + login + ' :: code : ' + code + ', status : ' + status + ', exec_time : ' + exec_time + ' ms. \n';
		      				callback(logger, code);
		      			}else{
		      				console.log("User:", login, ', comment error:', status);
		      				// console.log("Process finished but an error occurred .. ", status);
		      				logger = 'Result for :: ' + login + ' :: code : ' + code + ', status : ' + status + ', exec_time : ' + exec_time + ' ms. \n';
		      				callback(logger, code);

		      				
		      			}


	 	 		  });
	        }
	        
	    });

	}
 	

}


//The rest are helper methods can be used if necessary

/**
**	A function for getting random number between two numbers
**/
function random_int(mn, mx) {
  	mn = Math.ceil(mn);
  	mx = Math.floor(mx);
  	r  = Math.floor(Math.random() * (mx - mn)) + mn;
  	return r; 
}

/**
**	A function for getting today's date
**/
function get_today(){

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	today = yyyy.toString() + mm.toString() + dd.toString();//yyyymmdd
	return today;

}

/**
**	A function for getting a hardcoded date for testing purposes
**/
function get_date(){
	
	today = locals.epoch_hard;
	return today;
}
/**
**	A function for parsing time to seconds
**/
function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}
