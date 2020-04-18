/**
**  Commenting procedure
**  Tools:  'https' - https request library
**          'fs' - Access to file system 
**          'async' - Running functions asynchronously in waterfall or parallel mode
**          'vars'  - Variables used thrrought the app
**          'sodium-universal' - Nodejs Libsodium Crypto Library
**          'consts' - Constants used throughout the app
**          'locals' - The platform specific variables which could be defined by testers
**          
**/





const   daa_module    = require('./daa_front'),
        vars          = require('./vars.js'),
		    consts        = require('./consts.js'),
		    async         = require('async'),
		    http          = require('http'),
	  	  sodium        = require('sodium-native'),
        fs            = require('fs'),
        locals        = require('./locals.js')



/**
**  User side Commenting
**
**  Requirements: The user should have passed the 'Join group' process and she should have cookies for his identities
**
**  Each functions in async.waterfall run in order and async.parallel runs subfunctions in parallel
**
**  Variables: 'daa_module' : The DAA library API for Big Numbers
**             'gpk_ptr' : group public key pointer for the DAA API,
**             'pfc' : Pairing friendly curve pointer for the DAA API, 
**             'j_cre' : user's credentials,
**             'topic' : the topic id is hardcoded '1' for testing,
**             'comment' : user's comment,
**             'domain' : Domain string for the message (date+'_'+seq) e.g 20180528_12
**
**  'callback_inner_async': returns process code, status 
**                          and resulting data to the caller function in the end
**/

exports.async_commenting = function (gpk_ptr, pfc, j_cre, web_ver_key, nv, callback_inner_async){


	async.waterfall([



    function(callback){


          j_cre = JSON.parse(j_cre);
                      
          b_hc = Buffer.alloc(sodium.crypto_generichash_BYTES);
          sodium.crypto_generichash(b_hc, Buffer.from(comment));

          var m3p = new Object();
          m3p.bytes_f = j_cre.sk;
          m3p.bytes_x = j_cre.x; 
          m3p.bytes_A = j_cre.A;
          m3p.domain = domain;
          m3p.comment = b_hc.toString('hex');
          m3p.bytes_nv = nv;

          //create signature  with the comment and the credentials
          // let startx = process.hrtime();
          sig_res = daa_module.user_sign(m3p, gpk_ptr, pfc);
          
          
          async.parallel({
                  /**
                  **  Prepare data to be sent to the website (raw comment and the nonce)
                  **  Prepare data to be sent to the ledger (encrypted signature, nonce, self publickey, domain, pseudonym)
                  **/

                  send2website: function(callback){

                      let start = process.hrtime();

                      j_m = JSON.stringify({ 'topic_id' : topic, 'comment' : comment });


                      headers = {
                        // 'Cookie'        : cookie,
                        'Content-Type'   : 'application/json',
                        'Content-Length' : Buffer.byteLength(j_m)
                      };

                      server        = locals.website_host;
                      server.method = 'POST';
                      server.path   = consts.ver_save_comment_p;
                      server.headers = headers;
                      

                      let start1 = process.hrtime();
                      req = http.request(server, (res) => {
                        elapsed1 = process.hrtime(start1)[1] / 1000000;
                        res.on('data', (chunk)=>{
                             js  = JSON.parse(chunk);
                            

                              elapsed = process.hrtime(start)[1] / 1000000;
                              

                              callback(null, js.code, js.status, js.id, elapsed, elapsed1, js.time);
                        });
                      });
                      req.write(j_m);
                      req.end();

                  },
                  prepare_ledger_data: function(callback){


                      let start = process.hrtime();

                      c = sig_res.bytes_c;
                      nt = sig_res.bytes_nt;
                      sf = sig_res.bytes_sf;
                      sx = sig_res.bytes_sx;
                      sa = sig_res.bytes_sa;
                      sb = sig_res.bytes_sb;

                      daaSign = JSON.stringify({'B': sig_res.bytes_B, 'K': sig_res.bytes_K, 'T': sig_res.bytes_T, 'c': c, 
                        'nt': nt, 'sf': sf, 'sx': sx, 'sa': sa, 'sb':sb, 'b_hc': m3p.comment});

                      r = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
                      sodium.randombytes_buf(r);

                      W = locals.website_name;

                      m1 = JSON.stringify({  'daaSign'   : daaSign, 'r' : r.toString('hex')});


                      b_m1 = Buffer.alloc(sodium.crypto_box_SEALBYTES + m1.length);

                      // encrytion of signature
                      sodium.crypto_box_seal(b_m1, Buffer.from(m1), Buffer.from(web_ver_key,'hex'));

                      j_m = JSON.stringify({ 'topic_id' : topic, 'aenc' : b_m1.toString('hex'), 
                                    'h_c' : m3p.comment, 'W' : W, 'dom' : domain, 
                                    'nym' : sig_res.bytes_K  });

                      elapsed = process.hrtime(start)[1] / 1000000;
                      

                      callback(null, j_m, elapsed);


                  }

              


          },function(err, res){

              
                  if( res.send2website[0] == '1'){

                      let netw_time = 0;
                      if(res.send2website[3]-res.send2website[4] >  res.prepare_ledger_data[1]){
                         netw_time = res.send2website[4] ;
                      }


                      callback(null, res.prepare_ledger_data[0], res.send2website[2], netw_time, res.send2website[5]);
                  }else{
                      callback_inner_async(res.send2website[0], res.send2website[1]);

                  }

          });
          //async parallel end


    },
    function(j_m, id, netw_time, website_time, callback){

                  

                  x = JSON.parse(j_m);
                  x.id = id;

                  j_m = JSON.stringify(x);

                  


                  headers = {
                        'Content-Type'   : 'application/json',
                        'Content-Length' : Buffer.byteLength(j_m)
                      };

                  server        = locals.ledger_host;
                  server.method = 'POST';
                  server.path   = consts.save_comment_p;
                  server.headers = headers;

                  
                  let start1 = process.hrtime();
                  req = http.request(server, (res) => {
                        elapsed1 = process.hrtime(start1)[1] / 1000000;
                        res.on('data', (chunk)=>{
                             js  = JSON.parse(chunk);
                            
                        
                              callback_inner_async(js.code, js.status, netw_time+elapsed1, website_time, js.time);
                        });
                  });
                  req.write(j_m);
                  req.end();
    }
    




	],function (err, result) {
          callback_inner_async(err, result);
      });



}

