/**
**  Issuing procedure
**  Tools:  'https' - https request library
**          'fs' - Access to file system 
**          'async' - Running functions asynchronously in waterfall or parallel mode
**          'vars'  - Variables used thrrought the app
**          'sodium-universal' - Nodejs Libsodium Crypto Library
**          'consts' - Constants used throughout the app
**          'locals' - The platform specific variables which could be defined by testers
**          
**/




/*Libraries */
const http           = require('http'),
      // fs              = require('fs'),
      async           = require('async'),
      // vars            = require('./vars.js'),
      sodium          = require('sodium-universal'),
      consts          = require('./consts.js'),
      locals          = require('./locals.js')



/**
**  Issuing process
**  Parameters : 'login' - user nick name
**                 'pwd' - user password
**                 'bd' - user birthday
**
**  'callback_inner_async': returns process code, status 
**                          and resulting data to the caller function in the end
**/     


exports.async_call_register = function (login, pwd, bd, is_verify_key, ver_verify_key, callback_inner_async){


  var b_rU = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
  sodium.randombytes_buf(b_rU);  //insert random bytes into buffer (rU)

  var   login_pwd     = login + pwd; //used in key derivation function

  
  async.waterfall([
      /*
      ** Create tls session with the issuer. Put the session_id and verify_key in cookie.
      ** Session id is in obj.sid
      ** Verify key is in obj.verify_key 
      */

      function(callback){



        //Run sub-functions in parallel
        async.parallel({

          one: function(callback){

              

              let server      = locals.issuer_host;
              server.method = 'GET';
              server.path = consts.create_tls_path;
              server.headers = '';
              
              let start1 = process.hrtime();

              http.get(server, function(res){
                elapsed1 = process.hrtime(start1)[1] / 1000000;
                //var obj;
                res.on('data', (chunk)=>{
                    
                    obj = JSON.parse(chunk);
                    
                    
                    cookies = res.headers['set-cookie'];
                    
                    callback(null, obj.sid, obj.time, cookies, elapsed1);
                });

            });


          },
          two: function(callback){

            

            b_h1    = Buffer.alloc(sodium.crypto_generichash_BYTES)

            j_rU    = JSON.stringify({  't_ru'    : b_rU.toString('base64'), 
                                        't_nbd'   : login + '-' + bd, 
                                        't_level' : '1'}),
            b_j_rU  = Buffer.from(j_rU)

            sodium.crypto_generichash(b_h1, b_j_rU);

            

            callback(null, b_h1.toString('base64'));

          }


        },function(err, results){
            
            callback(null, results.one[0], results.one[1], results.one[2], results.two, results.one[3]);
        });
      },
      /*
      ** Issue user data.
      */
      function(sid, is_time, cookies, b_h1, netw_time, callback){

          
          j_m1 = JSON.stringify({     't_sid'     : sid, 
                                      't_login'   : login,
                                      't_hrU'     : b_h1
          });
          headers = {
            'Cookie'        : cookies,
            'Content-Type'  : 'application/json',
            'Content-Length' : Buffer.byteLength(j_m1)
          };
          // vars.issuer_options['path']    = consts.issue_path;
          // vars.issuer_options['method']  = 'POST';
          // vars.issuer_options['headers'] = headers;

          let server      = locals.issuer_host;
          server.method   = 'POST'
          server.path     = consts.issue_path;
          server.headers  = headers;
          // server.json     = j_m1;

          
          
          
          let start1 = process.hrtime();
          req = http.request(server, (res) => {
            elapsed1 = process.hrtime(start1)[1] / 1000000;
            // var js;
            res.on('data', (chunk) => {
                // start2 = process.hrtime();
                js = JSON.parse(chunk);
            
                
                
                if (js.code == '1') {
                  if (sodium.crypto_sign_verify_detached(
                      Buffer.from(js.signature, 'base64'), 
                      Buffer.from(js.message,'base64'), 
                      is_verify_key)) {

                      // The first message is verified
                      is_time += js.time;
                      cookies = res.headers['set-cookie'];
                      

                      callback(null, js.signature, js.message, cookies, is_time, elapsed1+netw_time );

                  }else {
                    console.log('The first message not verified. Issuer is cheating.. Exit');
                    callback_inner_async(js.code, 'The message not verified');
                  }
                }else{
                  
                  callback_inner_async(js.code, js.status);
                }
            });
          });
          
          req.write(j_m1);
          req.on('error', function(err){
              callback_inner_async('0', err);
          });
          req.end();
          
      },

      /*
      ** Simulation of sending legal documents to the Verifier for identification
      */
      function(sign, mes, cookies, is_time, netw_time, callback){

        
        var   j_v1      = JSON.stringify({  't_nbd'     : login + '-' + bd, 
                                            't_cI'      : mes,
                                            't_rU'      : b_rU.toString('hex'),
                                            't_sig_cI'  : sign

        });
        headers = {
            'Cookie'        : cookies,
            'Content-Type'  : 'application/json',
            'Content-Length' : Buffer.byteLength(j_v1)
        };
        // vars.verifier_options['path']    = consts.verify_id_path;
        // vars.verifier_options['method']  = 'POST';

        let server    = locals.verifier_host;
        server.method = 'POST';
        server.path   = consts.verify_id_path;
        server.headers = headers;

        
        let start1 = process.hrtime();
        req = http.request(server, (res) => {
            elapsed1 = process.hrtime(start1)[1] / 1000000;
            res.on('data', (chunk) => {
              
              j = JSON.parse(chunk);         
            
                if (j.code == '1') {

                  if (sodium.crypto_sign_verify_detached(
                          Buffer.from(j.sig_m2,'base64'), 
                          Buffer.from(j.m2,'base64'), 
                          ver_verify_key)) {
                    
                    callback(null, j.sig_m2, j.m2, cookies, is_time, j.time, netw_time+elapsed1);

                  }else {
                    callback_inner_async(j.code, 'There is a problem with verification');
                  }
                }else{
                  callback_inner_async(j.code, j.status);
                }
                
            });
          });
          req.write(j_v1);

          req.on('error', function(err){
              callback_inner_async('0', err);
          });
          req.end();

      },
      /*
      **  Send the challenge signed by verifier to the issuer
      */
      function(sign, mes, cookies, is_time, verifier_time, netw_time, callback){
      	  
          j_m3      = JSON.stringify({ 't_sig_cI' : sign.toString('hex'), 
                                       't_cI'     : mes.toString('hex')

          });
          var headers = {
            'Cookie'        : cookies,
            'Content-Type'  : 'application/json',
            'Content-Length' : Buffer.byteLength(j_m3)
          };
          server          = locals.issuer_host;
          server.method   = 'POST'
          server.path     = consts.verify_path;
          server.headers  = headers;


      	  // vars.issuer_options['path']    = consts.verify_path;
         //  vars.issuer_options['method']  = 'POST';
         //  vars.issuer_options['headers'] = headers;
          
          
          let start1 = process.hrtime();
          req = http.request(server, (res) => {
            elapsed1 = process.hrtime(start1)[1] / 1000000;
            
            res.on('data', (chunk)=>{
                j   = JSON.parse(chunk);
                
            
                //Issuing process successfully ended
                is_time += j.time;
                callback_inner_async(j.code, '', cookies, is_time, verifier_time, netw_time+elapsed1);
            });
          });
          req.write(j_m3);
          req.on('error', function(err){
              callback_inner_async('0', err);
          });
          req.end();
      }
  ], function (err, result) {
          callback_inner_async(err, result);
      }
  );


}//end of async_call_register

