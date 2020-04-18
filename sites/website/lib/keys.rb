module Keys
	class KeyClass
		def initialize(_self_signing_key, _self_verify_key, _self_ver_key_bytes, _self_pub_key, _self_priv_key)
			@@self_signing_key   = _self_signing_key
			@@self_verify_key    = _self_verify_key
			@@self_ver_key_bytes = _self_ver_key_bytes
			@@self_public_key 	 = _self_pub_key
			@@self_private_key 	 = _self_priv_key
			
 		end
		def self.self_signing_key
			@@self_signing_key
		end
		def self.self_verify_key
			@@self_verify_key
		end
		def self.self_public_key
			@@self_public_key
		end
		def self.self_private_key
			@@self_private_key
		end
		def self.self_ver_key_bytes
			@@self_ver_key_bytes
		end
	end
end