locals_config = Rails.application.config_for :locals

Rails.application.configure do
  config.locals 				= ActiveSupport::OrderedOptions.new 
  config.locals.website_notify 	= locals_config[:website_notify]
end
