/**
**  An API for the user side applications
**  Can be used for: 
**      creating a pointer for the DAA library,
**      creating a new user (Issuing),
**      or commenting
**/

const reg           = require('./register.js'),
      async         = require('async'),
      vars          = require('./vars.js'),
      join_g        = require('./join_group.js'),
      commenting    = require('./commenting.js'),
      fs            = require('fs'),
      locals        = require('./locals.js'),
      consts        = require('./consts.js'),
      http          = require('http')




/**
**  DAA library pointer
**/
exports.async_daa_gpk_pointer = function(callback_outer_async){

  join_g.async_daa_gpk_data(function(gpk_ptr, pfc){

      callback_outer_async(gpk_ptr, pfc);

  });
}

/**
**  Issuing procedure
**  Variables: 
**             'gpk_ptr' : group public key pointer for the DAA API,
**             'pfc' : Pairing friendly curve pointer for the DAA API, 
**             'login' : user nick_name,
**             'pwd' : user password,
**             'derived_key' : the key derived from the user nick_name and password,
**             'bd' : user birth date,
**             'cookie_path' : The cookies can be stored in a directory
**  
**  'callback_outer_async': returns process code, status 
**                          and resulting data to the caller function in the end
**
**/
exports.async_new_user = function (gpk_ptr, pfc, login, pwd, derived_key, bd, is_verify_key, ver_verify_key, cookie_path, callback_outer_async){


    async.waterfall([



            function( callback){

                    let start = process.hrtime();
                    
             
                    reg.async_call_register(login, pwd, bd, is_verify_key, ver_verify_key, function(code, status, cookies, is_time, ver_time, js_time){

                          
                          if(code == '1'){
                              elapsed = process.hrtime(start)[1] / 1000000;
                              callback(null, cookies, is_time, ver_time, elapsed - js_time);
                          }else{
                              callback_outer_async(code, status, 'logger');
                          }
                          
                    });

            },
            function(cookies, is_time, ver_time, reg_time, callback){

                    let start = process.hrtime();


                    join_g.async_join_daa_group(gpk_ptr, pfc, login, pwd, derived_key, cookies, function(code, status, j_cre, is_time_2, led_time, js_time){

                      

                        issuer_time = is_time + is_time_2;

                        total = parseFloat(issuer_time) + parseFloat(ver_time) + parseFloat(led_time);

                        

                        if (code == 1) {

                            if (cookie_path != ''){
                              //for simulation, we removed the saving cookies to file option, 
                              fs.writeFileSync(cookie_path, j_cre, { flag: 'w' }, function (err) {
                                if (err) throw err;
                              });
                            }

                            

                            elapsed = process.hrtime(start)[1] / 1000000;
                            
                            client_time = elapsed - js_time + reg_time;
                            logger = "[Identity] : " + login + ", client_total: " + client_time + ", issuer_time: " + issuer_time + ", verifier_time: " + ver_time + ", ledger_time: " + led_time + ", [S_TOTAL] : " + total + " sec.";
                            
                            callback_outer_async('1', 'User account created and cookies saved..', logger);

                        }
                        else{
                            callback_outer_async(code, status, 'logger');
                        }
                    });
                  
            }


      ], function (err, result) {
            callback_outer_async(err, result, 'logger');
  });

}

/**
**  Commenting procedure
**  Variables: 
**             'gpk_ptr' : group public key pointer for the DAA API,
**             'pfc' : Pairing friendly curve pointer for the DAA API, 
**             'j_cre' : user credentials,
**             'topic' : topic id,
**             'comment' : user's comment,
**             'domain' : Domain string for the message (date+'_'+seq) e.g 20180528_12
**  
**  'callback_outer_async': returns process code, status 
**                          and resulting data to the caller function in the end
**
**/
exports.async_commenting = function (gpk_ptr, pfc, j_cre, topic, comment, domain, callback_outer_async){

      

      async.waterfall([

            function(callback){

                  async.parallel({

                        web_key: function(callback){
                          callback(null, fs.readFileSync(locals.verifier_bot_public_key).toString() );
                        },
                        verifier_bot_nonce: function(callback){
                          
                          // callback(null, "9AC564D68D1AE2D76281583FC488C96E85B9211CED9887238E33E01FAABAD7B4AD1FC4715DF4502F8749EF5FF515FBCA5341DB7FA888AED734AF116FD57906B367B0C079CC60DD5F1443B8A88B163\n14E5D7F1B47366557B2AEF2C96DE84EA3DD8DB454E1E6677B82ED4E5200FFAC82901510DDA475BB6B152863AA67CFDCB3702BB50EBAF845ACCD92E3F6A980A3095EB843D12DAC69A1E3B5D930E4AAB\n\n");
                          callback(null, "F8FFE55B3FB844752E275EAA0AD6F94E53149B2D1AFE21DF2620A4A30B714A3\n1C717240FF9C60618A32F4A86685DB47995058E670BA129570D302BF07F2BC\n\n");
                        }

                  },function(err, results){

                        callback(null, results.web_key, results.verifier_bot_nonce);

                  });


            }, function(web_ver_key, nv, callback){

                let start = process.hrtime();

                

                commenting.async_commenting(gpk_ptr, pfc, j_cre, web_ver_key, nv, function(code, status, netw_time, website_time, led_time){
                        elapsed = process.hrtime(start)[1] / 1000000;

                        x = elapsed - netw_time;
                        total = website_time  + led_time;
                        
                        callback_outer_async(code, status, elapsed-netw_time, website_time, led_time);
                });

            }
        ], function(err, res){

      });




        

}













































