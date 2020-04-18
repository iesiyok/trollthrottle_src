
/**
**  Precomputation worker for creating user cookies in mysql database
**  Tools:  'daa_module' - Library for Big numbers
**          'https' - https request library
**          'sodium-universal' - Nodejs Libsodium Crypto Library
**          'async' - Running functions asynchronously in waterfall or parallel mode
**          'vars'  - Variables used thrrought the app
**          'consts' - Constants used throughout the app
**          'locals' - local configurations
**          'line-by-line' - a tool for reading from a file line by line
**          'mysql' - used for mysql database connection, 
**          'join_group' - used for non-interactive issuing procedure
**          'faker' - creates fake birthdate and password for the user
**          'wait-for-stuff' - used to ensure some pointers and database connections have started
**
**  Requirements: 
**          'p_id' : as we run the simulation in parallel, we chose siplitting data into chunks, so that each worker can process different files
**          'data_path': a data file in the form of a lines os JSON objects including 'timestamp', 'author', 'comment', 'sequence' and 'index'
**
**  Example :   We run the precomputation in node-spawn, but this program still can work with arguments given
**          e.g ' node sim_id_creator.js 1 '  
**          To run it with node-spawn, look at sim_id_spawner.js file              
**/





const daa_module = require("./daa_front");
const join_g = require('./join_group');
const mysql = require('mysql');
const faker = require('faker');
const app = require('./app');
const crypto = require('crypto');
const locals = require('./locals');
const vars = require('./vars');
const consts = require('./consts');
const fs = require('fs');
const http = require('http');
const async = require('async');
// const wait = require('wait-for-stuff');
const LineByLineReader = require('line-by-line');
const delay = require('delay');




// var log_path = pref + 'log/log_' + p_id + '.log';

//options = {encoding: 'utf8', flags: 'a'};
// log_stream = fs.createWriteStream(log_path, options);

// wait.for.time(1);

(async () => {

    var p_id = process.argv[2];

    var sim_folder = process.argv[3];

    var pref = `/simulator/data/${sim_folder}/raw/`;

    var data_path = pref + 'raw_' + p_id + '.json';

    console.log(`id:: ${p_id}, pid:: ${process.pid}`);

    var pool = mysql.createPool({
              connectionLimit : 100, 
              host: locals.mysql_host,
              user: locals.mysql_uname,
              password: locals.mysql_pwd,
              database: locals.mysql_db,
              debug:  false
                 
    });

    await delay(5000);



    var pfc, gpk_ptr;
// wait.for.time(1);

    pfc = daa_module.pfc_setup();
// console.log('gpk_str');
    await delay(5000);
// console.log("gpk_str");


    retrieve_gpk(function(gpk_str){

       gpk_ptr = daa_module.gpk_setup(gpk_str, pfc);

    });


// gpk_ptr = daa_module.gpk_setup(gpk_str, pfc);

    await delay(5000);

    // console.log(data_path);
    

    var author_array = [];
    var query_str = "INSERT IGNORE INTO website_cookies (t_login, A, x, sk, bd, pwd) VALUES ";


    pool.getConnection(function(err, con){

        var lr = new LineByLineReader(data_path);

        lr.pause();
        

        lr.resume();

        lr.on('line', function (line) {


              lr.pause();

              let l = JSON.parse(line);
              let author = l.author;

              if(!author_array.includes(author)){

                
                    if (err) throw err;

                    author_array.push(author);

                    execCreateUser(author, gpk_ptr, pfc, con, function(c, s){

                        // log_stream.write(author, ' : Result: ', c, ' : ', s);
                        // let str = JSON.stringify({'author': author, 'code': c, 'status': s});
                        // log_stream.write(str);
                        // log_stream.write("\n");
                        query_str += s + ",";

                        //console.log("Process ", p_id, ", author:: ", author);
                        // wait.for.time(0.005);
                        // console.log(str);
                        lr.resume();
                      

                    });
                    
           
                  
              }else{

                lr.resume();
              }
              
        });

        lr.on('end', function () {
            console.log("Process ", p_id, " file ended.");

            sql = query_str.substring(0, query_str.length - 1);

            //console.log("Process:", p_id, " query::", sql );
            //await delay(1000);

            con.query(sql, function (err2, result) {
                    if (err2) throw err;

                    console.log("Process:", p_id,  " Script executed!");
                    setTimeout(function(){
                      process.exit(1);
                    }, 2000);
            });
            
        });

    });


})();

function execCreateUser(login, gpk_ptr, pfc, con, callback_inner_async){

      bd = faker.date.between('1959-01-01', '2000-12-31').toISOString().substring(0,10);
      pwd = faker.internet.password();
      
      login_pwd   = login + pwd;
      // derived_key = crypto.pbkdf2Sync(login_pwd, locals.salt, 2048, 32, 'sha512').toString('hex');
      derived_key = crypto.pbkdf2Sync(login_pwd, locals.salt, 2048, 16, 'sha256').toString('hex');

      join_g.async_join_daa_group_demo(gpk_ptr, pfc, con, login, bd, pwd, derived_key, function(code, query){

        // console.log(code, status);

        if(code == '1'){
            callback_inner_async(code, query);
        }else{
            console.log('Error::', query)
        }
        
            

      });
        

}

// function get_cookies(con, author, callback) {

//           sql = "SELECT t_login FROM website_cookies where t_login='" + author + "'";

//           con.query(sql, function (err, result) {
//                           if (err) throw err;
//                           callback(result);
//           });

// }


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











