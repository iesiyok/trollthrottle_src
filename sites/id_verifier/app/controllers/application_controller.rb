class ApplicationController < ActionController::Base
 
  protect_from_forgery except: ['verify_identity']

end
