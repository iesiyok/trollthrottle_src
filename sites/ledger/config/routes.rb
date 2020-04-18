Rails.application.routes.draw do
  # get 'welcome/index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html


  match 'ledger/retrieve_gpk' , :defaults => { :format => 'json' }, via: [ :get]

  match 'ledger/store_info', :defaults => { :format => 'json' }, via: [ :post]

  match 'ledger/save_comment', :defaults => { :format => 'json' }, via: [ :post]

  get 'welcome/index'
end
