require './lib/group.rb'

require "mysql2"
require 'json'

include Group


	pfc = FFI::MemoryPointer.new :pointer
	Group.pfc_setup(pfc)
	gpk_ptr = FFI::MemoryPointer.new :pointer
	gpk_str = FFI::MemoryPointer.new :pointer
	seed = Group.issuer_setup(gpk_ptr, pfc, gpk_str)

	# nv = Group.create_g1_nonce(pfc)

	# nonce_str = nv.get_string(0) 

	# puts nonce_str

	# xx_str = Group.precomp_tester(gpk_ptr, pfc)

	#puts "xx_str is #{xx_str.get_string(0)}"

	gpk_str = Gpk_string.new(gpk_str.read_pointer)
	g1 = gpk_str[:g1].get_string(0)
	
	h1 = gpk_str[:h1].get_string(0)
	h2 = gpk_str[:h2].get_string(0)
	g2 = gpk_str[:g2].get_string(0)
	w = gpk_str[:w].get_string(0)
	t4 = gpk_str[:t4].get_string(0)
	order = gpk_str[:order].get_string(0)
	prec_hash = gpk_str[:prec_hash].get_string(0)


	time = Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N")
	q1 = "DELETE FROM issuer_gpk;"
	ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q1 ) }

	q2 = "INSERT INTO issuer_gpk VALUES (" + seed.to_s + ",'" + g1 + "','" + h1 + "','" + h2 + "','" + g2 + "','" + w  + "','" + t4 + "','" + order + "','" + prec_hash + "','" + time + "');" 
	ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q2 ) }



	Group::GroupClass.new(gpk_ptr, pfc)




Rails.logger.debug "New Gpk has been defined .."





