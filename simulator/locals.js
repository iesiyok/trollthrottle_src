/*
** Configurations
*/

 
module.exports={ 
      issuer_host             : {host: "nginx", port: '4000'},
      verifier_host           : {host: "nginx", port: '4001'},
      ledger_host             : {host: "nginx", port: '4002'},
      website_host            : {host: "nginx", port: '4003'},
      sign_verifier_host      : {host: "nginx", port: '4004'},
      mysql_host              : 'db',
      mysql_uname             : 'root',
      mysql_pwd               : 'rootpassword',
      mysql_db                : 'trollthrottle',
      epoch_hard              : '20190627',
      min_random              : 1,
      max_random              : 1830,
      max_seq                 : 9,
      salt                    : 'SodiumChloride',
      website_name            : 'website.org',
      key_file                : '/simulator/keys_and_certs/client_key.pem',
      cert_file               : '/simulator/keys_and_certs/client_cert.pem',
      issuer_verify_key       : '/simulator/keys_and_certs/issuer_ver.key',
      verifier_verify_key     : '/simulator/keys_and_certs/verifier_ver.key',
      verifier_bot_verify_key : '/simulator/keys_and_certs/verifier_bot_ver.key',
      self_public_key         : '/simulator/keys_and_certs/client_public.key',
      self_private_key        : '/simulator/keys_and_certs/client_private.key',
      verifier_bot_public_key : '/simulator/keys_and_certs/verifier_bot_public.key',
      daa_lib_path            : '/usr/lib/daa_front.dylib',
      cookies_path_prefix     : '/simulator/cookies/'
 };
