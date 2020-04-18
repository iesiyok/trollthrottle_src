
require './lib/keys.rb'
include Keys


@self_signing_key = nil
@self_verify_key = nil
@is_verify_key = nil


parent_dir = File.expand_path('../') 

keys_main_folder = Rails.configuration.locals.keys_path

sk_source = File.join(parent_dir, keys_main_folder, '/verifier_sign.key')
vk_source = File.join(parent_dir, keys_main_folder, '/verifier_ver.key')


sk_b = File.read(sk_source)
vk_b = File.read(vk_source)

@self_signing_key = RbNaCl::SigningKey.new sk_b.gsub(/../) { |pair| pair.hex.chr }
@self_verify_key = RbNaCl::VerifyKey.new vk_b.gsub(/../) { |pair| pair.hex.chr }

ik_source = File.join(parent_dir, keys_main_folder, '/issuer_ver.key')

ik_b = File.read(ik_source)
@is_verify_key = RbNaCl::VerifyKey.new ik_b.gsub(/../) { |pair| pair.hex.chr }

Keys::KeyClass.new(@self_signing_key, @self_verify_key, @is_verify_key)







