
/**
**  Simulation worker
**  Tools:  'daa_module' - Library for Big numbers
**          'https' - https request library
**          'sodium-universal' - Nodejs Libsodium Crypto Library
**          'async' - Running functions asynchronously in waterfall or parallel mode
**          'vars'  - Variables used thrrought the app
**          'consts' - Constants used throughout the app
**          'locals' - local configurations
**          'line-by-line' - a tool for reading from a file line by line
**          'mysql' - used for mysql database connection, 
**          'line-by-line' - a tool for reading from a file line by line
**          'join_group' - used for non-interactive issuing procedure
**          'faker' - creates fake birthdate and password for the user
**          'wait-for-stuff' - used to ensure some pointers and database connections have started
**          'schedule' - used for scheduling request tasks to the website and the ledger
**
**  Requirements: 
**          'p_id' : as we run the simulation in parallel, we chose siplitting data into chunks, so that each worker can process different files
**          'prec_path': a data file in the form of a lines os JSON objects including 'created_utc', 'author', 'comment', 'j_web' and 'j_ledger'
**          'sched_path' : a file path for outputting the schedule information about requests, 
**                          we used this to ensure we had the same request pattern with reddit
**          'log_path' : a file path for result data 
**
**  Output: Creates the result data e.g how much time spent for precomputation in the user side and server side for each request
**
**  Example :   We run the precomputation in node-spawn, but this program still can work with arguments given
**          arguments should be given in order: 
**          1. argument is the process_id, and the others are required for execution start date and time, e.g year month day hour minute
**          In nodejs, month starts from 0
**          e.g ' node simulation.js 1 2019 0 1 12 30'  
**          After reading all precomputation, this execution will start at "01.01.2019 12:30"
**          To ensure all of the file precomputations are read by the simulation ensure enough time given
**          for a simulation like 100k comments 20-25 minutes should be enough
**          for 3.5M comments at least 2.5 - 3 hours should be given
**          To run it with node-spawn, look at simulation_spawner.js file              
**/




const daa_module = require("./daa_front");

const http = require('http');
const Agent = require('agentkeepalive');
const app = require('./app');
const fs = require('fs');
const consts = require('./consts.js');
const vars = require('./vars.js');
const async = require('async');

const schedule = require('node-schedule');
const LineByLineReader = require('line-by-line');
const mysql = require('mysql');
const faker = require('faker');
const crypto = require('crypto');
const locals = require('./locals');
const delay = require('delay');

var p_id = process.argv[2];
var sim_type = process.argv[3];

var year = process.argv[4];
var month = process.argv[5];
var day = process.argv[6];
var hour = process.argv[7];
var minute = process.argv[8];
var second = 0;


// var minus = process.argv[9];

const keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 20 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 10 seconds
});

setTimeout(() => {
  if (keepaliveAgent.statusChanged) {
    console.log('[%s] agent status changed: %j', Date(), keepaliveAgent.getCurrentStatus());
  }
}, 2000);

var pool = mysql.createPool({
          connectionLimit : 100, 
          host: locals.mysql_host,
          user: locals.mysql_uname,
          password: locals.mysql_pwd,
          database: locals.mysql_db,
          debug:  false
             
});


(async () => {



        var pref = `/simulator/data/${sim_type}/`;

        
        var prec_path  = pref + 'precomp/prec_' + p_id + '.json';
        
        var sched_path = pref + 'result/schedule_log_' + p_id + '.log';
        
        var id_log_path   = pref + 'result/id_log_' + p_id + '.log';
        var ver_log_path   = pref + 'result/ver_log_' + p_id + '.log';
        var err_log_path   = pref + 'result/err_log_' + p_id + '.log';


        var pfc, gpk_ptr;


        await delay(3000);

        pfc = daa_module.pfc_setup();


        await delay(3000);


        gpk_str = retrieve_gpk(function(gpk_str){

           gpk_ptr = daa_module.gpk_setup(gpk_str, pfc);

        });

        

        await delay(3000);

        var is_verify_key = fs.readFileSync(locals.issuer_verify_key);
        var is_key = Buffer.from(is_verify_key.toString(),'hex');
        var ver_verify_key = fs.readFileSync(locals.verifier_verify_key);
        var ver_key = Buffer.from(ver_verify_key.toString(),'hex');

        

        var exec_start = new Date(year, month, day, hour, minute, second );
        
        await delay(1000);


        
        options = {encoding: 'utf8', flags: 'a'};
        id_log_stream = fs.createWriteStream(id_log_path, options);
        ver_log_stream = fs.createWriteStream(ver_log_path, options);
        err_log_stream = fs.createWriteStream(err_log_path, options);
        sch_stream = fs.createWriteStream(sched_path, options);

        
        console.log(process.pid, ": Process_", p_id, " started reading : ", prec_path);
        
        await delay(1000);
        
        

        pool.getConnection(function(err, con){

            var lr = new LineByLineReader(prec_path);


            lr.pause();
            lr.resume();

            lr.on('line', function (line) {

                lr.pause();

                var l = JSON.parse(line);
                xx = parseInt(l.created_utc);
                // ts = xx - minus;
                ts = xx;
                // last_ts = ts;
                // ts = parseInt(l.created_utc)-minus;
                o_type = l.type; 
                author = l.author;
                l_index = l.index;
                
                //if it's a new user
                if (o_type == '0'){

                      //1. schedule for creating a  new user 2 minutes earlier
                      let exec_ts = new Date(exec_start.getTime() + (ts*1000)-120000);

                      schedule.scheduleJob(exec_ts, function(_index, _ts, _author ){

                                  let s_time = process.hrtime();

                                  execCreateUser(_author, gpk_ptr, pfc, is_key, ver_key, function(code, status, logger){

                                      let e_time = process.hrtime(s_time)[1] / 1000000;
                                      // let total = (parseFloat(e_time) - parseFloat(s_time))/1000;

                                      if(code == '1'){
                                            log = "[DONE] index: " + _index + ", ts: " + _ts + ", author: " + _author + ', [WHOLE]: ' + e_time + " sec., scheduled: " + exec_ts + ", [SERVER] : " + logger + " \n";
                                            id_log_stream.write(log);
                                            
                                      }else{
                                            log = "[ERROR] index: " + _index + ", ts: " + _ts + ", author: " + _author + ', [WHOLE]: ' + e_time + " sec.," + ", error:" + status + ", scheduled: " + exec_ts + ", [SERVER] : " + logger + " \n";
                                            id_log_stream.write(log);
                                      }

                                });
                                      

                      }.bind(exec_ts, l_index, xx, author));
                      log = '[Schedule] [P_'+ p_id + '] [Identity] index: ' + l_index + ', author: ' + author + ' at : ' + exec_ts + "\n";
                      sch_stream.write(log);

                      
                }
                else {//it's for commenting

                    j_web = l.j_web;
                    j_ledger = l.j_ledger;

                    n = JSON.parse(j_ledger);
                    nym = n.nym;

                    


                    let i_exec_ts = new Date(exec_start.getTime() + (ts*1000));

                    schedule.scheduleJob(i_exec_ts, function(_nym, _index, _ts, _author, _j_web, _j_ledger ){

                          
                           let s_time = process.hrtime();


                           execCommenting(_index, _author, _j_web, _j_ledger, function(_code, _status, _save_comm_time, _led_time, _author_){

                                let e_time = process.hrtime(s_time)[1] / 1000000;
                                

                                if(_code == '1'){
                                      log = "nym:: " + _nym.replace(/\n/g, '<br>') + ", index: " + _index + ", ts: " + _ts + ", author: " + _author + ', [WHOLE]: ' + e_time + " sec." + ", scheduled: " + ", [SERVER] : website save_comment time : " + _save_comm_time + ", ledger_time : " + _led_time + " \n";
                                      ver_log_stream.write(log);
                                      
                                      
                                }else{
                                      log = "nym:: " + _nym.replace(/\n/g, '<br>') + ", index: " + _index + ", ts: " + _ts + ", author: " + _author + ', [WHOLE]: ' + e_time + " sec." + ", error:" + _status + ", scheduled: "  + ", [SERVER] : website save_comment time : " + _save_comm_time + ", ledger_time : " + _led_time + " \n";
                                      err_log_stream.write(log);
                                      
                                }

                           });
                       
                       
                    }.bind(i_exec_ts, nym, l_index, xx, author, j_web, j_ledger ));
                    log = '[Schedule] [P_'+ p_id + '] [Commenting] index: '+ l_index + ', author: ' + author + ' at : ' + i_exec_ts + "\n";
                    sch_stream.write(log);

                }


                setTimeout(function () {
                    lr.resume();
                }, 10);
            });

            lr.on('end', function () {

                 console.log('The simulation on process: ', p_id, ' has finished reading file.');
                 
            });
        });

})();


function execCreateUser(login, gpk_ptr, pfc, is_key, ver_key, callback_inner_async){

              
              bd = faker.date.between('1959-01-01', '2000-12-31').toISOString().substring(0,10);
              pwd = faker.internet.password();

              login = 'xx_fake_' + login + '_' + bd + '_x';
              
              login_pwd   = login + pwd;
              derived_key = crypto.pbkdf2Sync(login_pwd, locals.salt, 2048, 16, 'sha256').toString('hex');
              app.async_new_user(gpk_ptr, pfc, login, pwd, derived_key, bd, is_key, ver_key, "", function(code, status, logger){


                    callback_inner_async(code, status, logger);


              });


}


function execCommenting(index, author, j_web, j_ledger, callback_inner_async){

 console.log("Index::", index, ", author::", author);

    try{

        async.waterfall([

              function(callback){

                      let headers = {
                        'Content-Type'   : 'application/json',
                        'Content-Length' : Buffer.byteLength(j_web),
                        // 'author_id' : index + "_" + author
                      };

                      let server        = locals.website_host;
                      server.method = 'POST';
                      server.path   = consts.ver_save_comment_p;
                      server.headers = headers;
                      server.agent = keepaliveAgent;
                      
                      req = http.request(server, (res) => {

                        console.log("0. Index::", index, ", author::", author);
                       

                        res.on('data', (chunk)=>{
                            
                             js  = JSON.parse(chunk);
                             
                              callback(null, js.code, js.status, js.id, js.time);
                        });
                        res.on('error', (err)=>{
                            console.log('error occured:', err);
                        });
                      });
                      req.write(j_web);
                      req.end();


              },
              function(code, status, id, save_comment_time, callback){

                console.log("1. Index::", index, ", author::", author);

                  if(code == '1'){



                      x = JSON.parse(j_ledger);
                      x.id = id;

                      j_ledger = JSON.stringify(x);


                      let headers = {
                            // 'Cookie'        : cookie,
                            'Content-Type'   : 'application/json',
                            'Content-Length' : Buffer.byteLength(j_ledger)
                          };

                      let server        = locals.ledger_host;
                      server.method = 'POST';
                      server.path   = consts.save_comment_p;
                      server.headers = headers;

                      req = http.request(server, (res) => {
                            
                            res.on('data', (chunk)=>{
                                  js  = JSON.parse(chunk);
                                
                                  callback_inner_async(js.code, js.status, save_comment_time, js.time, author);
                                  // callback_inner_async(js.code, js.status, save_comment_time, js.ledger_time, js.website_time, js.sig_ver, author);
                            });
                      });
                      req.write(j_ledger);
                      req.end();


                  }else{

                    callback_inner_async(code, status, save_comment_time, js.time,  author);
                    
                  }
              }
          ], function (err, result) {
            callback_inner_async('-1', err, null,null,  null);
        });

      }catch(e){
        console.log('ERROR: ', e, ', author:', author);
    }



}


function retrieve_gpk(callback){
  

            server        = locals.ledger_host;
            server.path   = consts.gpk_path;

            http.get(server, (res) => {
              var obj;
              res.on('data', (chunk)=>{
                  obj = JSON.parse(chunk);
              }).on('end',()=>{
                // console.log(obj);
                  callback(obj);
              });
            });

}
