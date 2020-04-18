Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  match 'issuer/create_tls' , :defaults => { :format => 'json' }, via: [ :get]

  match 'issuer/issue', :defaults => { :format => 'json' }, via: [ :post]
  match 'issuer/verify', :defaults => { :format => 'json' }, via: [ :post]

  match 'group/join', :defaults => { :format => 'json' }, via: [ :post]
  match 'group/join_check', :defaults => { :format => 'json' }, via: [ :post]

  match 'group/join_demo', :defaults => { :format => 'json' }, via: [ :get]
  match 'group/join_check_demo', :defaults => { :format => 'json' }, via: [ :post]

  get 'welcome/index'

end
