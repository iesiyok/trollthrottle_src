
/**
**  Precomputation noninteractive functions for simulation
**  Tools:  'daa_module' - Library for Big numbers
**          'https' - https request library
**          'sodium-universal' - Nodejs Libsodium Crypto Library
**          'async' - Running functions asynchronously in waterfall or parallel mode
**          'vars'  - Variables used thrrought the app
**          'consts' - Constants used throughout the app
**          'locals' - local configurations
**/



const   daa_module      = require("./daa_front.js")
        crypto 			= require('crypto'),
		vars            = require('./vars.js'),
		consts          = require('./consts.js'),
		async           = require('async'),
		https           = require('https'),
	  	sodium          = require('sodium-universal'),
        fs              = require('fs'),
        locals          = require('./locals.js')
        




exports.async_prec_commenting = function (gp_ptr, pfc, topic, comment, domain, web_ver_key, nv, A, x, f, callback_inner_async){


                async.waterfall([


                        function(callback){


                            
                                b_hc = Buffer.alloc(sodium.crypto_generichash_BYTES);

                                sodium.crypto_generichash(b_hc, Buffer.from(comment));
                      

                                var m3p = new Object();
                                m3p.bytes_f = f.toString('hex');
                                m3p.bytes_x = x; 
                                m3p.bytes_A = A;
                                m3p.domain = domain;
                                com  = b_hc.toString('hex');
                                m3p.comment = com;
                                m3p.bytes_nv = nv;

                              

                                callback(null, m3p, com);

                        },
                        function(m3p, com, callback){

                                var sig_res = daa_module.user_sign(m3p, gp_ptr, pfc);


                                j_web = JSON.stringify({ 'topic_id' : '1', 'comment' : comment});

                                daaSign = JSON.stringify({'B': sig_res.bytes_B, 'K': sig_res.bytes_K, 'T': sig_res.bytes_T, 'c': sig_res.bytes_c, 
                                                'nt': sig_res.bytes_nt, 'sf': sig_res.bytes_sf, 'sx': sig_res.bytes_sx, 'sa': sig_res.bytes_sa, 'sb': sig_res.bytes_sb, 'b_hc': com});



                                r = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);//random number?
                                sodium.randombytes_buf(r);

                                W = locals.website_name;

                                m1 = JSON.stringify({  'daaSign'   : daaSign, 'r' : r.toString('hex')});

                                b_m1 = Buffer.alloc(sodium.crypto_box_SEALBYTES + m1.length);

                                sodium.crypto_box_seal(b_m1, Buffer.from(m1), Buffer.from(web_ver_key,'hex'));

                          

                                j_ledger = JSON.stringify({ 'topic_id' : topic, 'aenc' : b_m1.toString('hex'), 
                                            'h_c' : m3p.comment, 'W' : W, 'dom' : domain, 
                                            'nym' : sig_res.bytes_K  });

                                

                                callback_inner_async('1', j_web, j_ledger); 


                        }



                  ], function (err, result) {
                        callback_inner_async(err, result);

                });



}




