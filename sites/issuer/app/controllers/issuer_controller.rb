require "rbnacl"
require "mysql2"

class IssuerController < ApplicationController

	def create_tls
	    respond_to :json
	    finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start
	    res = {sid: @sid, time: finish}.to_json
	    render json: res

  	end 

  	def issue
  		  
    	  respond_to :json

    	  # CUSTOM_LOGGER.info("******************************************************")

	      _sid      = params[:t_sid]
	      _login    = params[:t_login]
	      _hash_rU  = params[:t_hrU]

	      # CUSTOM_LOGGER.info("Info: #{_sid} #{_login} #{_hash_rU}")
			

	      key_bytes = RbNaCl::SecretBox.key_bytes
	      key       = RbNaCl::Random.random_bytes(key_bytes)
	      r_I       = Base64.encode64(key)

	      message   = r_I + _sid + _hash_rU 


       	  q = "SELECT COUNT(t_login) FROM issuer_identities WHERE t_login='" + _login +"'";
       	  rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
       	  rs = rs.to_a
       	  id_res = rs[0]["COUNT(t_login)"]

		  
	      if !id_res.eql? 0 
	        
	        output = {status: "User exists!", code: '0'}.to_json
	      else
	      	signing_key = Keys::KeyClass.self_signing_key
	      	hash_m = RbNaCl::Hash.sha512(message) #the message = cI
	        id_data = {t_sid: _sid, t_login: _login, t_hrU: _hash_rU, t_cI: Base64.strict_encode64(hash_m) }

	        @login = _login
	        @identity_data = id_data
	        m1 = signing_key.sign(hash_m) #the signature of the message
	        finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start
	        output = {message: Base64.strict_encode64(hash_m), signature: Base64.strict_encode64(m1), code: '1', time: finish}.to_json
	        
	      end

	

	      
	      render json: output

  	end

  	def verify
	    respond_to :json
	  
	    if @identity_data == ''
	
	      output = {status: "Session data error!", code: '0'}.to_json
	      
	    else

	          cI       = params[:t_cI]
	          sigCI    = params[:t_sig_cI]

	          
	          verifier_verify_key = Keys::KeyClass.verifier_verify_key


	          if verifier_verify_key.verify(Base64.decode64(sigCI), Base64.decode64(cI))

		  			q = "INSERT INTO issuer_identities VALUES ('" + @identity_data['t_cI']  + "','" +  @identity_data['t_hrU'] + "','" + @identity_data['t_sid'] + "','" +  @identity_data['t_login'] + "')" 

		  			ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }

		  			finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start
		  			output = {code: '1', time: finish}.to_json

	          else
	              output = {status: "verify not okay", code: '-1'}.to_json
	          end

	      

	    end
	    render json: output

  	end


end
