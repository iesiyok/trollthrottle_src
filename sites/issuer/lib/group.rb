require 'ffi'
require 'json'

class Gpk_string < FFI::Struct
  layout   :g1, :pointer,
           :h1, :pointer,
           :h2, :pointer,
           :g2, :pointer,
           :w,  :pointer,
           :t4, :pointer,
           :order, :pointer,
           :prec_hash, :pointer  
   
end

class M1 < FFI::Struct
    layout :bytes_F,   :pointer,
           :bytes_c,   :pointer,
           :bytes_sf,  :pointer,
           :bytes_ni,  :pointer
end

class Cre < FFI::Struct
    layout :bytes_A,  :pointer,
           :bytes_x,  :pointer
end


module Group
  extend FFI::Library
  ffi_lib FFI::Platform::LIBC
  attach_function :free, [ :pointer ], :void

  ffi_lib Rails.configuration.locals.daa_api_lib
  attach_function :pfc_setup, [:pointer], :void
  attach_function :issuer_setup, [:pointer, :pointer, :pointer], :long
  attach_function :create_nonce, [:pointer], :pointer
  attach_function :issuer_join_verify, [ :pointer, :pointer, :pointer, :pointer ], :int
  attach_function :release_gpk, [:pointer ], :void
  attach_function :release_pfc, [:pointer ], :void
  attach_function :release_char, [:pointer ], :void
  # attach_function :create_g1_nonce, [:pointer], :pointer
  # attach_function :precomp_tester, [:pointer, :pointer ], :pointer
  

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
