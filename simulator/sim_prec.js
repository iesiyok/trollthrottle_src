

/**
**  Precomputation worker
**  Tools:  'daa_module' - Library for Big numbers
**          'https' - https request library
**          'sodium-universal' - Nodejs Libsodium Crypto Library
**          'async' - Running functions asynchronously in waterfall or parallel mode
**          'vars'  - Variables used thrrought the app
**          'consts' - Constants used throughout the app
**          'locals' - local configurations
**          'line-by-line' - a tool for reading from a file line by line
**          'precomp' - provides functions for precomputation
**          'mysql' - used for mysql database connection, 
**
**  Requirements: 
**          'p_id' : as we run the simulation in parallel, we chose siplitting data into chunks, so that each worker can process different files
**          'data_path': a data file in the form of a lines os JSON objects including 'timestamp', 'author', 'comment', 'sequence' and 'index'
**          'new_user_path': a data file in the form of a lines os JSON objects including 'author'
**          'log_path' : a file path for output data
**
**  Output: Creates the request data to be sent to the website and to the ledger and puts them into the log files 
**
**  Example :   We run the precomputation in node-spawn, but this program still can work with arguments given
**          e.g ' node sim_prec.js 1 '  
**          To run it with node-spawn, look at sim_prec_spawner.js file              
**/


const fs = require('fs');
const daa_module = require("./daa_front");
const LineByLineReader = require('line-by-line');
const wait = require('wait-for-stuff');
const mysql = require('mysql');
const locals = require('./locals');
const prec_app = require('./precomp');
const vars = require('./vars');
const consts = require('./consts');
const http  = require('http');
const async = require('async');
const delay = require('delay');


(async () => {


    const p_id = process.argv[2];

    var sim_folder = process.argv[3];

    var pref = `/simulator/data/${sim_folder}/`;

    var data_path = pref + 'raw/raw_' + p_id + '.json';

    var log_path = pref + 'precomp/prec_' + p_id + '.json';

    await delay(1000);

    var pool = mysql.createPool({
              connectionLimit : 100, 
              host: locals.mysql_host,
              user: locals.mysql_uname,
              password: locals.mysql_pwd,
              database: locals.mysql_db,
              debug:  false
                 
    });
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Process:", p_id,  " Mysql Connected!");
// });

    var pfc, gpk_ptr;
    await delay(3000);

    pfc = daa_module.pfc_setup();

    await delay(3000);

    gpk_str = retrieve_gpk(function(gpk_str){

       gpk_ptr = daa_module.gpk_setup(gpk_str, pfc);

    });
    await delay(3000);



      //console.log('Process:', p_id, ' The new user information has ended.');
      
      //The nonce from the issuer chosen hardcoded in order to be non-interactive
      // const nv = "9AC564D68D1AE2D76281583FC488C96E85B9211CED9887238E33E01FAABAD7B4AD1FC4715DF4502F8749EF5FF515FBCA5341DB7FA888AED734AF116FD57906B367B0C079CC60DD5F1443B8A88B163\n14E5D7F1B47366557B2AEF2C96DE84EA3DD8DB454E1E6677B82ED4E5200FFAC82901510DDA475BB6B152863AA67CFDCB3702BB50EBAF845ACCD92E3F6A980A3095EB843D12DAC69A1E3B5D930E4AAB\n\n";
    const nv = "F8FFE55B3FB844752E275EAA0AD6F94E53149B2D1AFE21DF2620A4A30B714A3\n1C717240FF9C60618A32F4A86685DB47995058E670BA129570D302BF07F2BC\n\n";
    web_ver_key = fs.readFileSync(locals.verifier_bot_public_key).toString();


    const date = locals.epoch_hard;

    
    options = {encoding: 'utf8', flags: 'a'};
    log_stream = fs.createWriteStream(log_path, options);


    index = 0;

    


    console.log('[' + p_id + '] the precomp has started.');

    pool.getConnection(function(err, con){

          var lr_n = new LineByLineReader(data_path);

          lr_n.pause();

          lr_n.resume();

          lr_n.on('line', function (line) {

                  lr_n.pause();

                  let l = JSON.parse(line);
                  let ts = parseInt(l.ts);
                  let author = l.author;
                  let seq   = parseInt(l.seq);
                  
                  let comment = l.body.replace(/[\\$'"]/g, "\\$&");

                  let domain = date + "_" + seq.toString();

                  
                  if(seq == 1) {

                        getData(con, author, function(resx){

                              if(resx.length > 0){

                                    let new_u_js = JSON.stringify({'type': '0', 'created_utc': ts, 'author': author});
                                    log_stream.write(new_u_js);
                                    log_stream.write('\n');
                              }

                              setTimeout(function(){
                                
                                  get_cookies(con, author, function(result){


                                          if(result.length > 0){

                                              let start = process.hrtime();
                                              prec_app.async_prec_commenting(gpk_ptr, pfc, '1', comment, domain, web_ver_key, nv, result[0].A, result[0].x, result[0].sk, function(code, j_web, j_ledger) {

                                                  let total = process.hrtime(start)[1] / 1000000;

                                                  if(code == '1' ){

                                                      let new_com_js = JSON.stringify({'type': '1', 'created_utc': ts, 'author': author,  'index': index, 'j_web': j_web, 'j_ledger': j_ledger, 'u_time': total.toString()});
                                                      log_stream.write(new_com_js.toString());
                                                      log_stream.write('\n');
                                                      lr_n.resume();

                                                  }else{
                                                      logger = '[Process: ' + p_id + '][ERROR] index: ' + index + ', author: ' + author + ', ts: ' + ts + ', error occured in precomp. [Commenting] \n';
                                                      console.log(logger);
                                                      lr_n.resume();
                                                  }

                                              });       

                                          }else{
                                              logger = '[Process: ' + p_id +'] [ERROR] author:' + author + ', ts:' + ts + ' could not be found \n';
                                              console.log(logger);
                                              lr_n.resume();
                                          }

                                  }); 

                              }, 100);

                        });


                  }else{


                        get_cookies(con, author, function(result){

                                  if(result.length > 0){

                                    // function (gp_ptr, pfc, topic, comment, domain, web_ver_key, nv, A, x, f, callback_inner_async){

                                      let start = process.hrtime();
                                      prec_app.async_prec_commenting(gpk_ptr, pfc, '1', comment, domain, web_ver_key, nv, result[0].A, result[0].x, result[0].sk, function(code, j_web, j_ledger) {

                                          let total = process.hrtime(start)[1] / 1000000;

                                          if(code == '1' ){

                                              let new_com_js = JSON.stringify({'type': '1', 'created_utc': ts, 'author': author,  'index': index, 'j_web': j_web, 'j_ledger': j_ledger, 'u_time': total.toString()});
                                              log_stream.write(new_com_js.toString());
                                              log_stream.write('\n');
                                              lr_n.resume();

                                          }else{
                                              logger = '[Process: ' + p_id + '][ERROR] index: ' + index + ', author: ' + author + ', ts: ' + ts + ', error occured in precomp. [Commenting] \n';
                                              console.log(logger);
                                              lr_n.resume();
                                          }

                                      });       

                                  }else{
                                      logger = '[Process: ' + p_id +'] [ERROR] author:' + author + ', ts:' + ts + ' could not be found \n';
                                      console.log(logger);
                                      lr_n.resume();
                                  }

                        }); 

                  }

                index++;

                
          });

          lr_n.on('end', function () {

               console.log('[' + p_id + '] the precomp has ended.');
               setTimeout(function(){
                      process.exit(1);
               }, 2000);
          });


    });

})();

function get_cookies(con, author, callback) {

      sql = "SELECT A, x, sk FROM website_cookies where t_login='" + author + "'";

      con.query(sql, function (err, result) {
            if (err) throw err;
            callback(result);
      });

}

function getData(con, author, callback) {

      sql = "SELECT author FROM new_user where author ='" + author + "'";

      con.query(sql, function (err, result) {
            if (err) throw err;
            callback(result);
      });

}



function retrieve_gpk(callback){
  

            server        = locals.ledger_host;
            server.path   = consts.gpk_path;

            http.get(server, (res) => {
              var obj;
              res.on('data', (chunk)=>{
                  obj = JSON.parse(chunk);
              }).on('end',()=>{
                  callback(obj);
              });
            });

}





