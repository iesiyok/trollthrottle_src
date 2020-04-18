require './lib/group'
require "rbnacl"
require 'stringio'
include Group

class VerifierController < ApplicationController


	def nonce

		respond_to :json
		key_bytes   = RbNaCl::SecretBox.key_bytes
		key         = RbNaCl::Random.random_bytes(key_bytes)
		sid         = Base64.strict_encode64(key)

		t           = Time.now + 10.minutes
		expires     = t.strftime("%Y-%m-%d %H:%M:%S.%6N") 

		session[:sid] = sid
		session[:expires] = expires


		pfc = Group::GroupClass.get_pfc_ptr

					
		nv = Group.create_g1_nonce(pfc)

		nonce_str = nv.get_string(0) 

		#for simulation purposes the nonce made to be hardcoded

		# nonce_str = "9AC564D68D1AE2D76281583FC488C96E85B9211CED9887238E33E01FAABAD7B4AD1FC4715DF4502F8749EF5FF515FBCA5341DB7FA888AED734AF116FD57906B367B0C079CC60DD5F1443B8A88B163\n14E5D7F1B47366557B2AEF2C96DE84EA3DD8DB454E1E6677B82ED4E5200FFAC82901510DDA475BB6B152863AA67CFDCB3702BB50EBAF845ACCD92E3F6A980A3095EB843D12DAC69A1E3B5D930E4AAB\n\n"


		nonce_str = "F8FFE55B3FB844752E275EAA0AD6F94E53149B2D1AFE21DF2620A4A30B714A3\n1C717240FF9C60618A32F4A86685DB47995058E670BA129570D302BF07F2BC\n\n"
		session[:nv] = nonce_str

		Group.release_char(nv)

		render json: {status: "okay", code: '1', nv: nonce_str }.to_json
	end

	# def save_comment


	# 	begin
	# 			start = Process.clock_gettime(Process::CLOCK_MONOTONIC)

	# 			respond_to :json



		
	# 	#we allowed operation without getting the sid from session for simulation purposes

	# 	# if !session[:sid].nil? 

	# 			data = JSON.parse request.body.read

	

	# 			# nv = "9AC564D68D1AE2D76281583FC488C96E85B9211CED9887238E33E01FAABAD7B4AD1FC4715DF4502F8749EF5FF515FBCA5341DB7FA888AED734AF116FD57906B367B0C079CC60DD5F1443B8A88B163\n14E5D7F1B47366557B2AEF2C96DE84EA3DD8DB454E1E6677B82ED4E5200FFAC82901510DDA475BB6B152863AA67CFDCB3702BB50EBAF845ACCD92E3F6A980A3095EB843D12DAC69A1E3B5D930E4AAB\n\n"
	# 			nv = "F8FFE55B3FB844752E275EAA0AD6F94E53149B2D1AFE21DF2620A4A30B714A3\n1C717240FF9C60618A32F4A86685DB47995058E670BA129570D302BF07F2BC\n\n"
	# 		# pfc = Group::GroupClass.get_pfc_ptr
	# 		# nvx = Group.create_g1_nonce(pfc)
	# 		# nonce_str = nvx.get_string(0) 
	# 		# nonce_str = "9AC564D68D1AE2D76281583FC488C96E85B9211CED9887238E33E01FAABAD7B4AD1FC4715DF4502F8749EF5FF515FBCA5341DB7FA888AED734AF116FD57906B367B0C079CC60DD5F1443B8A88B163\n14E5D7F1B47366557B2AEF2C96DE84EA3DD8DB454E1E6677B82ED4E5200FFAC82901510DDA475BB6B152863AA67CFDCB3702BB50EBAF845ACCD92E3F6A980A3095EB843D12DAC69A1E3B5D930E4AAB\n\n"
	# 		# session[:nv] = nonce_str
	# 		# Group.release_char(nvx)


	# 			comment = data['comment']


	# 			if comment.valid_encoding?

	# 				topic = data['topic_id']


	# 				q = "INSERT INTO website_temp_comments (topic_id, comment, nv, ts) VALUES ('" + topic.to_s + "',\"" + comment + "\",'" + nv + "','" + Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N") + "'); " 

	# 				ActiveRecord::Base.connection_pool.with_connection do |con|
	# 					con.exec_query( q )
	# 				end 
	# 				res1 = ActiveRecord::Base.connection_pool.with_connection do |con|
	# 					con.exec_query( "SELECT LAST_INSERT_ID() AS last_id;" )
						
	# 				end 

	# 				finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
	# 				elapsed = finish - start
	# 				id = res1[0]['last_id']
					
	# 				res = {code: '1', id: "#{id}", time: elapsed}
	# 			else
	# 				res = {code: '0', time: elapsed, status: "Invalid enconding"}
	# 				CUSTOM_LOGGER.error("[1] Invalid encoding")

	# 			end
				


	# 			render json: res.to_json
	# 	rescue
	# 			CUSTOM_LOGGER.error("[1] An error occured #{@error_message}")
	# 	ensure

				
	# 	end

	# end



	def ledger_notify

		begin


			respond_to :json

			nv 	= "F8FFE55B3FB844752E275EAA0AD6F94E53149B2D1AFE21DF2620A4A30B714A3\n1C717240FF9C60618A32F4A86685DB47995058E670BA129570D302BF07F2BC\n\n"

			epoch = "20190627"
			public_key = Keys::KeyClass.self_public_key
			private_key = Keys::KeyClass.self_private_key

			x = params[:list]

			res_all = []

			x.each do |y|

		    	  data = JSON.parse(y)

		    	  aenc 	= data['aenc']
			  topic 	= data['topic_id']
			  h_c 	= data['h_c']
			  w 		= data['W']
			  dom 	= data['dom']
			  nym		= data['nym']
			  id 		= data['id']
		    	

		    	  k = aenc.gsub(/../) { |pair| pair.hex.chr }
		    	  other_box = RbNaCl::SealedBox.new(public_key, private_key)

		    	  b_m1 	  = other_box.decrypt(k)
			  m1 		 = JSON.parse b_m1
			  daa_sign = m1['daaSign']

			  q = "SELECT COUNT(id) FROM website_temp_comments WHERE id = #{id}"

			  rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }

			  result = rs.to_a
			  d = result[0]["COUNT(id)"]

			  if d.eql? 0
			        res = {nym: nym, code: '-1', time: 0}
		    	  else
		    		start1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
	      			v = verify_signature(daa_sign, nv, h_c, dom, epoch)
	      			finish1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
	      			elapsed1 = finish1 - start1
                                elapsed = sprintf( "%0.17f", elapsed1)
	      			if v == 0
	      				res = {nym: nym, code: '1', time: elapsed }
	      			else
	      				res = {nym: nym, code: '0', time: elapsed }
	      			end

		    	  end

		    	  res_all.push(res)
		    	
		        end

		        res = {list: res_all }

		        #CUSTOM_LOGGER.error("Result ::  #{res}")

			

			# aenc 	= data['aenc']
			# topic 	= data['topic_id']
			# h_c 	= data['h_c']
			# w 		= data['W']
			# dom 	= data['dom']
			# nym		= data['nym']
			# id 		= data['id']


			# public_key = Keys::KeyClass.self_public_key
			# private_key = Keys::KeyClass.self_private_key

			
			# k = aenc.gsub(/../) { |pair| pair.hex.chr }


			# other_box = RbNaCl::SealedBox.new(public_key, private_key)


			# # other_box = RbNaCl::Box.new(y, private_key)
			# b_m1 	  = other_box.decrypt(k)


			# m1 		 = JSON.parse b_m1
			
			# daa_sign = m1['daaSign']



			# q = "SELECT COUNT(id) FROM website_temp_comments WHERE id = #{id}"

			# rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }

			# result = rs.to_a

			# d = result[0]["COUNT(id)"]


	  #     	if d.eql? 0

	  #     			CUSTOM_LOGGER.debug("A new request : id : #{id}, The comment has not arrived to the website (yet!)")
	  #     			res = {status: "The comment has not arrived to the website (yet!)", code: '-1'}

	  #     	else
	  #     			#the epoch made hardcoded for simulation purposes, easier to test
	  #     			epoch = "20190627"
	  #     			start1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
	  #     			v = verify_signature(daa_sign, nv, h_c, dom, epoch)
	  #     			finish1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
	  #     			elapsed1 = finish1 - start1
	      			
	  #     			finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
	  #     			elapsed = finish - start
					
	  #     			if v == 0

	  #     				CUSTOM_LOGGER.info("A new request : id : #{id}, The comment can be stored, time elapsed #{(elapsed)} seconds")
	  #     				res = {code: '1', status: 'The comment can be stored', time: elapsed, verify: elapsed1}
	  #     			else
	      				
	  #     				CUSTOM_LOGGER.error("A new request : id : #{id}, {Signature verification failed : #{v} }, time elapsed #{(elapsed)} seconds")
	  #     				res = {code: '0', status: "Signature verification failed : #{v}", time: elapsed, verify:elapsed1}
	  #     			end

	  #     	end




	      	render json: res.to_json

		rescue => @error_message
			CUSTOM_LOGGER.error("[2] An error occured #{@error_message}")
		ensure
		end

	end


	def verify_signature(daaSign, nv, comment, dom, epoch)

		begin


			data = JSON.parse daaSign

			sig_ptr = FFI::MemoryPointer.new :pointer, Signature.size

			sig_obj = Signature.new

			b_str = FFI::MemoryPointer.new :char, 520
			sig_obj[:bytes_B] = b_str.write_string(data['B'])
			k_str = FFI::MemoryPointer.new :char, 520
			sig_obj[:bytes_K] = k_str.write_string(data['K'])
			t_str = FFI::MemoryPointer.new :char, 520
			sig_obj[:bytes_T] = t_str.write_string(data['T'])
			c_str = FFI::MemoryPointer.new :char, 256
			sig_obj[:bytes_c] = c_str.write_string(data['c'])
			nt_str = FFI::MemoryPointer.new :char, 256
			sig_obj[:bytes_nt] = nt_str.write_string(data['nt'])
			sf_str = FFI::MemoryPointer.new :char, 256
			sig_obj[:bytes_sf] = sf_str.write_string(data['sf'])
			sx_str = FFI::MemoryPointer.new :char, 256
			sig_obj[:bytes_sx] = sx_str.write_string(data['sx'])
			sa_str = FFI::MemoryPointer.new :char, 256
			sig_obj[:bytes_sa] = sa_str.write_string(data['sa'])
			sb_str = FFI::MemoryPointer.new :char, 256
			sig_obj[:bytes_sb] = sb_str.write_string(data['sb'])

			sig_ptr.write_pointer(sig_obj)

			gpk_ptr = Group::GroupClass.get_gpk_ptr
			pfc = Group::GroupClass.get_pfc_ptr


			v = Group.verifier_verify( gpk_ptr, pfc, sig_ptr, nv, comment, dom, epoch )


			return v



		rescue
			CUSTOM_LOGGER.error("[3] An error occured #{@error_message}")
		ensure
		end


	end


	

end
