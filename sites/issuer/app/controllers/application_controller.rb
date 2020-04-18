require 'json'
require 'rubygems'
require 'sessions'
require './lib/group.rb'
include Group

class ApplicationController < ActionController::Base

  protect_from_forgery except: ['create_tls', 'issue', 'verify', 'join', 'join_check', 'join_demo', 'join_check_demo']
  before_action :init_session
  after_action :assign_session



	def init_session 

		@start = Process.clock_gettime(Process::CLOCK_MONOTONIC)

	    ses = session[:ses_object]
	    if ses.nil? 
	        # logger.debug "START PROTOCOL :: Sid not set before"

	        @key_bytes   = RbNaCl::SecretBox.key_bytes
	        @key         = RbNaCl::Random.random_bytes(@key_bytes)
	        @sid         = Base64.strict_encode64(@key)
	        @t           = Time.now + 10.minutes
	        @expires     = @t.strftime("%Y-%m-%d %H:%M:%S.%6N") 
	        @login       = ''
	        @ni            = ''
	        @identity_data = ''
	        # @exec_time 	   = 0


	    else
	        @sid         = ses["sid"]
	        @expires     = ses["expires"]
	        @login       = ses["login"]
	        @ni            = ses["ni"]
	        @identity_data = ses["identity_data"]
	        # @exec_time 	   = ses["exec_time"]
	        
	    end

	    # logger.debug "#{@sid} #{@expires} #{@login} #{@ni} #{@identity_data} "

	end


	def assign_session
		# elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - @start
		# @exec_time = @exec_time + elapsed
      	# s_obj = Sessions::Ses_key.new(@sid, @expires, @login, @ni, @identity_data, @exec_time)
      	s_obj = Sessions::Ses_key.new(@sid, @expires, @login, @ni, @identity_data)
      	session[:ses_object] = s_obj

      	cred = {A: @cred_A, x: @cred_x}.to_json
      	cookies[:cred] = {value: cred, expires: Time.now + 1.month}
  	end

end
