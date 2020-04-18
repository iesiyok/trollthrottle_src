
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



const mysql = require('mysql');
const locals = require('./locals');
// const wait = require('wait-for-stuff');
const LineByLineReader = require('line-by-line');
const async = require('async');
const delay = require('delay');


var sim_folder = process.argv[2];


(async () => {

    var pref = `/simulator/data/${sim_folder}/raw/`;

    var data_path = pref + 'new_users.json';

    var pool = mysql.createPool({
              connectionLimit : 100, 
              host: locals.mysql_host,
              user: locals.mysql_uname,
              password: locals.mysql_pwd,
              database: locals.mysql_db,
              debug:  false
                 
    });

    await delay(2000);


    var author_array = [];
    var query_str = "INSERT INTO new_user (author) VALUES ";

    pool.getConnection(function(err, con){

          var lr = new LineByLineReader(data_path);

          lr.pause();
          lr.resume();

          lr.on('line', function (line) {

                lr.pause();

                let l = JSON.parse(line);

                query_str += "('" + l.author + "'),";

                lr.resume();
                
          });

          lr.on('end', function () {
              

              sql = query_str.substring(0, query_str.length - 1);

              console.log(sql);


              con.query(sql, function (err, result) {
                  if (err) throw err;

                  console.log("New user script executed!");
              });
              
              setTimeout(function(){
                  process.exit(1);
              }, 2000);
          });
    });

})();








