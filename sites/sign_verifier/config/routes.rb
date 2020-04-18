Rails.application.routes.draw do
  get 'welcome/index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html


  match 'verifier/nonce' , :defaults => { :format => 'json' }, via: [ :get]

  match 'verifier/save_comment', :defaults => { :format => 'json' }, via: [ :post]

  # match 'verifier/verify_signature', :defaults => { :format => 'json' }, via: [ :post]

  match 'verifier/ledger_notify', :defaults => { :format => 'json' }, via: [ :post]


end
