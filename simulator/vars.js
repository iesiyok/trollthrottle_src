const fs              = require('fs'),
      locals          = require('./locals.js')

/*Local and Remote Paths */
module.exports={ 

      issuer_options  : {
              hostname            : locals.issuer_host, //rails local address
              port                : locals.issuer_port,
              rejectUnauthorized  : false,
              requestCert         : true,
              key                 : fs.readFileSync(locals.key_file),
              cert                : fs.readFileSync(locals.cert_file),
              cookieJar           : true,
              headers             : {'Content-Type': 'application/json'}
      },
      verifier_options  : {
              hostname            : locals.verifier_host, //sinatra local address
              port                : locals.verifier_port,
              rejectUnauthorized  : false,
              requestCert         : true,
              key                 : fs.readFileSync(locals.key_file),
              cert                : fs.readFileSync(locals.cert_file),
              cookieJar           : true,
              headers             : {'Content-Type': 'application/json'}
      },
      ledger_options  : {
              hostname            : locals.ledger_host, //sinatra local address
              port                : locals.ledger_port,
              rejectUnauthorized  : false,
              requestCert         : true,
              key                 : fs.readFileSync(locals.key_file),
              cert                : fs.readFileSync(locals.cert_file),
              cookieJar           : true,
              headers             : {'Content-Type': 'application/json'}
      },
      website_options  : {
              hostname            : locals.website_host, //sinatra local address
              port                : locals.website_port,
              rejectUnauthorized  : false,
              requestCert         : true,
              key                 : fs.readFileSync(locals.key_file),
              cert                : fs.readFileSync(locals.cert_file),
              cookieJar           : true,
              headers             : {'Content-Type': 'application/json'}
      },
      sign_verifier_options  : {
              hostname            : locals.sign_verifier_host, //sinatra local address
              port                : locals.sign_verifier_port,
              rejectUnauthorized  : false,
              requestCert         : true,
              key                 : fs.readFileSync(locals.key_file),
              cert                : fs.readFileSync(locals.cert_file),
              cookieJar           : true,
              headers             : {'Content-Type': 'application/json'}
      }

    }