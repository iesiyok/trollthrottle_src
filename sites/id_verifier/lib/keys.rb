
module Keys
	class KeyClass
		def initialize(_self_signing_key, _self_verify_key, _issuer_verify_key)
			@@self_signing_key  = _self_signing_key
			@@self_verify_key   = _self_verify_key
			@@issuer_verify_key = _issuer_verify_key
		end
		def self.self_signing_key
			@@self_signing_key
		end
		def self.self_verify_key
			@@self_verify_key
		end
		def self.issuer_verify_key
			@@issuer_verify_key
		end
	end
end