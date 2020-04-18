require './lib/keys.rb'
# require "mysql2"
include Keys




@self_signing_key = nil
@self_verify_key = nil
@self_public_key = nil
@self_private_key = nil


parent_dir = File.expand_path('../') 

keys_main_folder = Rails.configuration.locals.keys_path

sk_source = File.join(parent_dir, keys_main_folder, '/verifier_bot_sign.key')
vk_source = File.join(parent_dir, keys_main_folder, '/verifier_bot_ver.key')

pb_source = File.join(parent_dir, keys_main_folder, '/verifier_bot_public.key')
prv_source = File.join(parent_dir, keys_main_folder, '/verifier_bot_private.key')


sk_b = File.read(sk_source)
vk_b = File.read(vk_source)
pb_b = File.read(pb_source)
prv_b = File.read(prv_source)

@self_signing_key = RbNaCl::SigningKey.new sk_b.gsub(/../) { |pair| pair.hex.chr }
@self_verify_key = RbNaCl::VerifyKey.new vk_b.gsub(/../) { |pair| pair.hex.chr }

@self_public_key = RbNaCl::PublicKey.new pb_b.gsub(/../) { |pair| pair.hex.chr }
@self_private_key = RbNaCl::PrivateKey.new prv_b.gsub(/../) { |pair| pair.hex.chr }


Keys::KeyClass.new(@self_signing_key, @self_verify_key, vk_b, @self_public_key, @self_private_key)


