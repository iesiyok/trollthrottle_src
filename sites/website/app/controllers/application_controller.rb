class ApplicationController < ActionController::Base
 
  protect_from_forgery except: ['save_comment']

   # protect_from_forgery except: ['nonce', 'save_comment', 'ledger_notify']

end
