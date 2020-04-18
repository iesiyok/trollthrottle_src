locals_config = Rails.application.config_for :locals

Rails.application.configure do
  config.locals 				= ActiveSupport::OrderedOptions.new
  config.locals.daa_api_lib 	= locals_config[:daa_api_lib]
  config.locals.keys_path 		= locals_config[:keys_path]
end