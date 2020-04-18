class ApplicationController < ActionController::Base
 
  protect_from_forgery except: ['retrieve_gpk', 'save_comment', 'store_info']

end
