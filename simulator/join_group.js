/**
**  DAA Javascript API
**  Tools:  'daa_module' - Library for Big numbers
**          'https' - https request library
**          'sodium-universal' - Nodejs Libsodium Crypto Library
**          'async' - Running functions asynchronously in waterfall or parallel mode
**          'vars'  - Variables used thrrought the app
**          'consts' - Constants used throughout the app
**/



const daa_module      = require('./daa_front'),
      // https           = require('https'),
      http            = require('http'),
      sodium          = require('sodium-universal'),
      async           = require('async'),
      vars            = require('./vars.js'),
      consts          = require('./consts.js'),
      locals          = require('./locals.js')
      

      

/**
**  initialise Pairing Friendly Curve (pfc),
**  Receive Group Public key(gpk) from the Ledger,
**  Run DAA setup
**/
exports.async_daa_gpk_data = function(callback){

            


            var pfc = daa_module.pfc_setup();
        
            

            server        = locals.ledger_host;
            server.path   = consts.gpk_path;

            console.log(server);



            http.get(server, (res) => {
              var obj;
              res.on('data', (chunk)=>{
                  obj = JSON.parse(chunk);
              }).on('end',()=>{

                  
                  gpk_ptr = daa_module.gpk_setup(obj, pfc);
                  
                  callback(gpk_ptr, pfc);
              });
            });
            // req.end();
     
}

/**
**  User side Interactive join DAA
**
**  Requirements: The user should have passed the 'Register' process and she should have cookies
**
**  Each functions in async.waterfall run in order
**
**  Variables: 'gpk_ptr' : group public key pointer for the DAA API,
**             'pfc' : Pairing friendly curve pointer for the DAA API, 
**             'login' : user nick_name,
**             'pwd' : user password,
**             'derived_key' : the key derived from the user nick_name and password,
**             'headers' : User side cookies [from the Issuer, after registering process],
**             
**
**  'callback_inner_async': returns process code, status 
**                          and resulting data to the caller function in the end
**/

exports.async_join_daa_group = function (gpk_ptr, pfc, login, pwd, derived_key, cookies, callback_inner_async){



   async.waterfall([

        function(callback){

          let j_login = JSON.stringify({'t_login' : login});


          var headers = {
            'Cookie'        : cookies,
            'Content-Type'  : 'application/json',
            'Content-Length' : Buffer.byteLength(j_login)
          };

          server          = locals.issuer_host;
          server.method   = 'POST';
          server.path     = consts.gr_join_start_p;
          server.headers  = headers;

          
          let start1 = process.hrtime();
          req = http.request(server, (res) => {
            elapsed1 = process.hrtime(start1)[1] / 1000000;
            
            res.on('data', (chunk)=>{
                obj = JSON.parse(chunk);
            
                if (obj.code == 1){


                    callback(null, obj.ni, obj.time, elapsed1, server);
                }else{
                    callback_inner_async(obj.code, obj.status, null, null);
                }

                
            });
          });
          req.write(j_login);
          req.end();
        },
        function(ni, is_time, netw_time, server, callback){
        

                m1 = daa_module.user_join_protocol(derived_key.toString('hex'), ni.toString('ascii'), gpk_ptr, pfc);
                
                callback(null, m1.bytes_F, m1.bytes_sk, m1.bytes_c, m1.bytes_ni, m1.bytes_sf, is_time, netw_time, server);
                
    
        },
        function( F, sk, c, ni, sf, is_time, netw_time, server, callback){


          
          let j_login = JSON.stringify({'t_login' : login , 
                'F'  : F, 
                'sk' : sk, 
                'c'  : c, 
                'ni' : ni, 
                'sf' : sf });


          var headers = {
            'Cookie'        : cookies,
            'Content-Type'  : 'application/json',
            'Content-Length' : Buffer.byteLength(j_login)
          };
          server          = locals.issuer_host;
          server.method   = 'POST';
          server.path    = consts.gr_join_check_p;
          server.headers = headers;

          let start1 = process.hrtime();
          req = http.request(server, (res) => {
            elapsed1 = process.hrtime(start1)[1] / 1000000;
            res.on('data', (chunk) =>{
                js = JSON.parse(chunk);

                
                if (js.code == '1') {
                    
                    var m2p = new Object();
                    m2p.bytes_F = F; 
                    m2p.bytes_x = js.x; 
                    m2p.bytes_A = js.a;


                    r = daa_module.user_join_verify(m2p, gpk_ptr, pfc);



                    if (r == 1){
                        is_time += js.time;

                        callback(null, js.x, js.a, sk, is_time, netw_time + elapsed1);
                    }else{
                        
                        callback_inner_async('0', 'Error occured in User join verify process in the library.', null, null);
                    }

                }else{
                  callback_inner_async(js.status, 'Error occured in User join verify process.', null, null);
                }

            });
          });
          req.write(j_login);
          req.on('error', function(err){
              callback_inner_async('0', err);
          });
          req.end();
        },
        function(x, A, sk, is_time, netw_time, callback ){

              h_login = Buffer.alloc(sodium.crypto_generichash_BYTES_MAX);
              i_login = Buffer.from(login);

              sodium.crypto_generichash(h_login, i_login);

              j_cre = JSON.stringify({'h_login': h_login.toString('base64'), 'A': A, 'x': x}); 


              var headers = {
                'Content-Type'  : 'application/json',
                'Content-Length' : Buffer.byteLength(j_cre)
              };

              server          = locals.ledger_host;
              server.method   = 'POST';
              server.path     = consts.ledger_store_info;
              server.headers  = headers;


              let start1 = process.hrtime();
              req = http.request(server, (res) => {
                  elapsed1 = process.hrtime(start1)[1] / 1000000;
                  res.on('data', (chunk)=>{
                       js  = JSON.parse(chunk);
                      
                  

                        if (js.code == '1'){
                           
                              j_cre = JSON.parse(j_cre);
                              j_cre.sk = sk; 
                              j_cre = JSON.stringify(j_cre);
                              
                              callback_inner_async(js.code, 'User account created', j_cre, is_time, js.time, netw_time+elapsed1);

                        }else{
                              
                              callback_inner_async(js.code, js.status, null, null);
                        }
                  });
              });
              req.write(j_cre);
              req.on('error', function(err){
                  callback_inner_async('0', err);
              });
              req.end();

        }


   ],function (err, result) {
          callback_inner_async(err, result, null);
      }
    );

}//async join daa group end




/**
**  User side Non-Interactive join DAA
**  Designed for testing purposes, it doesn't require the 'Register' process being done by the user in advance
**
**  Each functions in async.waterfall run in order
**  
**  Variables: 'gpk_ptr' : group public key pointer for the DAA API,
**             'pfc' : Pairing friendly curve pointer for the DAA API, 
**             'login' : user nick_name,
**             'pwd' : user password,
**             'derived_key' : the key derived from the user nick_name and password,
**             
**
**  'callback_inner_async': returns process code, status 
**                          and resulting data to the caller function in the end
**/

exports.async_join_daa_group_demo = function (gpk_ptr, pfc, con, login, bd, pwd, derived_key, callback_inner_async){


   async.waterfall([

        function(callback){

          let server      = locals.issuer_host;
          server.method   = 'GET';
          server.path     = consts.gr_join_start_demo_p;
          server.headers  = '';
          
          let start1 = process.hrtime();
          let req = http.request(server, (res) => {
            elapsed1 = process.hrtime(start1)[1] / 1000000;
            res.on('data', (chunk)=>{
                obj = JSON.parse(chunk);
            
                if (obj.code == 1){
                    
                    callback(null, obj.ni, obj.time, elapsed1);
                }else{
                    callback_inner_async(obj.code, obj.status);
                }

                
            });
          });
          // req.write(j_login);
          req.end();
        },
        function(ni, is_time, netw_time, callback){

                m1 = daa_module.user_join_protocol(derived_key.toString('hex'), ni.toString('ascii'), gpk_ptr, pfc);
                // console.log('m1:', m1);
                callback(null, m1.bytes_F, m1.bytes_sk, m1.bytes_c, m1.bytes_ni, m1.bytes_sf, is_time, netw_time);
                
    
        },
        
        function( F, sk, c, ni, sf, is_time, netw_time, callback){


          
          let server      = locals.issuer_host;
          server.path = consts.gr_join_check_demo_p;
          server.method = 'POST';
          // server.gzip = true;
          
          let j_login = JSON.stringify({
                'F' : F, 
                'sk' : sk, 
                'c' : c, 
                'ni' : ni, 
                'sf' : sf });

          

          let headers = {
                'Content-Type'  : 'application/json',
                'Content-Length' : Buffer.byteLength(j_login)
          };
          server.headers  = headers;

          

          let start1 = process.hrtime();
          req = http.request(server, function(res) {
            elapsed1 = process.hrtime(start1)[1] / 1000000;
            res.on('data', (chunk) =>{
                js = JSON.parse(chunk);
                
            

                if (js.code == '1') {
                    
                    let m2p = new Object();
                    m2p.bytes_F = F; 
                    m2p.bytes_x = js.x; 
                    m2p.bytes_A = js.a;

                    r = daa_module.user_join_verify(m2p, gpk_ptr, pfc);


                    if (r == 1){

                        //is_time += js.time;




                        // var sql = "INSERT INTO website_cookies (t_login, A, x, sk, bd, pwd) VALUES ('" + login + "', '" + js.a + "', '" + js.x + "', '" + sk + "', '" + bd + "', '" + pwd +  "');";

                        // con.query(sql, function (err, result) {
                        //     if (err) throw err;

                        //     callback_inner_async('1', 'Account created and cookies saved.');
                        // });

                        var sql = "('" + login + "', '" + js.a + "', '" + js.x + "', '" + sk + "', '" + bd + "', '" + pwd +  "')";
                        callback_inner_async('1', sql);

                    }else{
                      
                        callback_inner_async('0', 'Error occured in User join verify process in the library.');
                    }

                }else{
                  callback_inner_async(js.status, 'Error occured in User join verify process.');
                }

            });
          });
          req.write(j_login);
          req.on('error', function(err){
              callback_inner_async('0', err);
          });
          req.end();
        }


   ],function (err, result) {
          callback_inner_async('0', err);
      }
    );

}//async join daa group end


