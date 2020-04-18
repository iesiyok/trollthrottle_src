
require "rbnacl"

class VerifierController < ApplicationController


    def verify_identity

    		respond_to :json
			start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
			# content_type :json
			# request.body.rewind
			# data = JSON.parse request.body.read
			nbd  = params['t_nbd']
			cI   = params['t_cI']
			rU   = params['t_rU']
			sigCI = params['t_sig_cI']
			
			q = "SELECT t_nbd FROM verified_identities WHERE t_nbd='" + nbd + "'"
			
			rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }

			rs = rs.to_a

		  	signing_key = Keys::KeyClass.self_signing_key
		  	sign_m2     = signing_key.sign(Base64.decode64(cI))

			is_ver_key = Keys::KeyClass.issuer_verify_key

			# finish = 0	

			res = ""

			if is_ver_key.verify(Base64.decode64(sigCI), Base64.decode64(cI)) 

				if rs.count.eql? 0
					q = "INSERT INTO verified_identities VALUES ('" + cI + "','" + rU + "','" + nbd + "','" + sigCI + "')"
					ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
					finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
					elapsed = finish - start
					res = { m2: cI, sig_m2: Base64.encode64(sign_m2), code: '1', time: elapsed}
				else
					
					q = "UPDATE verified_identities SET t_cI='"+ cI + "', t_rU='" + rU + "', t_nbd='" + nbd + "', t_sig_cI='" + sigCI + "' WHERE t_nbd='" + nbd + "'"
					rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
					finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
					elapsed = finish - start
					logger.info "[Identity verification] {nbd: #{nbd}}, user exists, data updated"
					res = { m2: cI, sig_m2: Base64.encode64(sign_m2), code: '1', time: elapsed}

				end
			  	
			else
				# finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
				# elapsed = finish - start
				logger.info "[Identity verification] {nbd: #{nbd}}, failed "
				res = { code: '0', time: '0'}
				
			end

			# logger.info "[Identity verification] {nbd: #{nbd}}, time elapsed #{(finish)} seconds "
			render json: res.to_json

	end

	
    

end
