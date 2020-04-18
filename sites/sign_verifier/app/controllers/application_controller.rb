class ApplicationController < ActionController::Base
 
  protect_from_forgery except: ['nonce', 'ledger_notify']

  #protect_from_forgery except: ['nonce', 'save_comment', 'ledger_notify']

end
