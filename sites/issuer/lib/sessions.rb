

module Sessions
	class Ses_key


	
		def initialize(_sid, _expires, _login, _ni, _identity_data)

      			@sid = _sid
      			@expires = _expires
      			@login = _login
      			@ni = _ni
      			@identity_data = _identity_data
      			# @exec_time = _exec_time
				
		end
		def sid
			@sid
		end
		def sid=(si)
			@sid = si
		end
		def expires
			@expires
		end
		def expires=(exp)
			@expires = exp
		end
		def login
			@login
		end
		def login=(log)
			@login = log
		end
		def ni
			@ni
		end
		def ni=(n)
			@ni = n
		end
		def identity_data
			@identity_data
		end
		def identity_data=(id_d)
			@identity_data = id_d
		end
		# def exec_time
		# 	@exec_time
		# end
		# def exec_time=(et)
		# 	@exec_time = et
		# end

	end
end