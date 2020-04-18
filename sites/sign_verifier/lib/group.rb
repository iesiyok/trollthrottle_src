
require 'ffi'
require 'json'


class Signature < FFI::Struct
  layout  :bytes_B, :pointer,
          :bytes_K, :pointer,
          :bytes_T, :pointer,
          :bytes_c, :pointer,
          :bytes_nt, :pointer,
          :bytes_sf, :pointer,
          :bytes_sx, :pointer,
          :bytes_sa, :pointer,
          :bytes_sb, :pointer
end




module Group
  extend FFI::Library
  ffi_lib FFI::Platform::LIBC
  attach_function :free, [ :pointer ], :void

  ffi_lib Rails.configuration.locals.daa_api_lib
  attach_function :pfc_setup, [:pointer], :void
  attach_function :verifier_bot_setup, [:pointer, :pointer, :long, :pointer], :int
  attach_function :create_g1_nonce, [:pointer], :pointer
  attach_function :verifier_verify, [:pointer, :pointer, :pointer, :pointer, :pointer, :pointer, :pointer], :int
  attach_function :release_char, [:pointer ], :void


  class GroupClass

      @@gpk_ptr = FFI::MemoryPointer.new :char
      @@pfc_ptr = FFI::MemoryPointer.new :char

      def self.get_gpk_ptr
        @@gpk_ptr
      end
      def self.get_pfc_ptr
        @@pfc_ptr
      end

      def initialize(_gpk, _pfc)
        @@gpk_ptr = _gpk
        @@pfc_ptr = _pfc
        
      end

  end
  
  


end


