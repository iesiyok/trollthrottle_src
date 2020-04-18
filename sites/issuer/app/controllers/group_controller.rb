
require 'mysql2'

class GroupController < ApplicationController

	def join
		respond_to :json

  		_login    = params[:t_login]

		q = "SELECT COUNT(t_login) FROM issuer_identities WHERE t_login='" + _login +"' AND t_sid='" + @sid + "'";

		# logger.debug "SQL query : #{q}"
		rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
   	  	rs = rs.to_a
   	  	id_res = rs[0]["COUNT(t_login)"]

  		if id_res.eql? 0
  			res = {status: "The user could not be found", code: '0'}.to_json
  		else

			pfc = Group::GroupClass.get_pfc_ptr
			
			nonce = Group.create_nonce( pfc )
			ni = nonce.get_string(0)
			Group.release_char(nonce)

			# finish = Time.now - @start
			finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start

			res = {status: "Start joining the group DAA", code: '1', ni: ni, time: finish }.to_json
  		end
		render json: res

	end

	def join_demo
		#This is special method for the performance evaluation which doesn't require the user has an identity with Issuer and Verifier
		respond_to :json
		
		pfc = Group::GroupClass.get_pfc_ptr
		
		nonce = Group.create_nonce( pfc )
		ni = nonce.get_string(0)
		Group.release_char(nonce)

		finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start

		res = {status: "Start joining the group DAA", code: '1', ni: ni, time: finish }.to_json
  		
		render json: res

	end

	def join_check
		respond_to :json

		_login = params[:t_login]

		if _login.eql? @login

			c  = params[:c]
			sf = params[:sf]
			ni = params[:ni]
			f  = params[:F]

			m1_ptr = FFI::MemoryPointer.new :pointer, M1.size, false

		    m1_obj = M1.new
		    f_str = FFI::MemoryPointer.new :char, 520
			m1_obj[:bytes_F] = f_str.write_string(f)
			c_str = FFI::MemoryPointer.new :char, 256
			m1_obj[:bytes_c] = c_str.write_string(c)
			sf_str = FFI::MemoryPointer.new :char, 256
			m1_obj[:bytes_sf] = sf_str.write_string(sf)
			ni_str = FFI::MemoryPointer.new :char, 256
			m1_obj[:bytes_ni] = ni_str.write_string(ni)

			cre_ptr = FFI::MemoryPointer.new :pointer

			m1_ptr.write_pointer(m1_obj)

			# CUSTOM_LOGGER.info("******************************************************")
			#CUSTOM_LOGGER.info("m1_obj: #{params}")

			gpk_ptr = Group::GroupClass.get_gpk_ptr
			pfc = Group::GroupClass.get_pfc_ptr

			v = Group.issuer_join_verify( m1_ptr, cre_ptr, pfc, gpk_ptr)

			if v == 0 
				obj1 = Cre.new(cre_ptr.read_pointer()) 
				# elapsed = Time.now - @start
				# @exec_time = @exec_time + elapsed
				# finish = Time.now - @start
				finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start
				if !obj1.nil?
					a = obj1[:bytes_A].get_string(0)
					x = obj1[:bytes_x].get_string(0)

					res = {status: "First part has been verified", code: '1', a: a, x: x, time: finish }.to_json
				else
					res = {status: "First part verified, but an error occurred!", code: '0', time: finish }.to_json
				end
			else
				# elapsed = Time.now - @start
				# @exec_time = @exec_time + elapsed
				res = {status: "First part could not be verified!", code: '0', time: '0'}.to_json
			end


		else

			res = {status: "The user could not be found", code: '0'}
		end
		render json: res

	end

#This is special method for the evaluation which doesn't require the user has an identity with Issuer and Verifier
	def join_check_demo
		respond_to :json

		c  = params[:c]
		sf = params[:sf]
		ni = params[:ni]
		f  = params[:F]

		CUSTOM_LOGGER.info("m1_obj: #{params}")

		m1_ptr = FFI::MemoryPointer.new :pointer, M1.size, false

    	m1_obj = M1.new
	    f_str = FFI::MemoryPointer.new :char, 520
		m1_obj[:bytes_F] = f_str.write_string(f)
		c_str = FFI::MemoryPointer.new :char, 256
		m1_obj[:bytes_c] = c_str.write_string(c)
		sf_str = FFI::MemoryPointer.new :char, 256
		m1_obj[:bytes_sf] = sf_str.write_string(sf)
		ni_str = FFI::MemoryPointer.new :char, 256
		m1_obj[:bytes_ni] = ni_str.write_string(ni)

		cre_ptr = FFI::MemoryPointer.new :pointer

		m1_ptr.write_pointer(m1_obj)

		gpk_ptr = Group::GroupClass.get_gpk_ptr
		pfc = Group::GroupClass.get_pfc_ptr

		v = Group.issuer_join_verify( m1_ptr, cre_ptr, pfc, gpk_ptr)

		if v == 0 
			obj1 = Cre.new(cre_ptr.read_pointer()) 
			# elapsed = Time.now - @start
			# @exec_time = @exec_time + elapsed
			
			if !obj1.nil?
				a = obj1[:bytes_A].get_string(0)
				x = obj1[:bytes_x].get_string(0)
				@cred_A = a
				@cred_x = x
				finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start
				res = {code: '1', a: a, x: x, time: finish }.to_json
			else
				# finish = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start
				res = {status: "First part verified, but an error occurred!", code: '0', time: '0' }.to_json
			end
		else
			# elapsed = Time.now - @start
			# @exec_time = @exec_time + elapsed
			res = {status: "First part could not be verified!", code: '-1', time: '0'}.to_json
		end


		render json: res

	end



end
