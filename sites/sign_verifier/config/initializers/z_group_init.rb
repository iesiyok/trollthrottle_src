#send verification key to ledger

require 'rbnacl'
require 'json'
require './lib/group.rb'
require 'objspace'
require 'mysql2'

include Group


q = "SELECT seed, w FROM issuer_gpk"

rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }

rs = rs.to_a;

data = rs[0]



pfc = FFI::MemoryPointer.new :pointer
Group.pfc_setup(pfc)

gpk_ptr = FFI::MemoryPointer.new :pointer

Group.verifier_bot_setup(gpk_ptr, pfc, data["seed"], data["w"])

Group::GroupClass.new(gpk_ptr, pfc)

CUSTOM_LOGGER.info("******************************************************")

CUSTOM_LOGGER.info("A new application started!")

