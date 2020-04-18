locals_config = Rails.application.config_for :locals
# mysql_config = Rails.application.config_for :database

Rails.application.configure do
  config.locals 				= ActiveSupport::OrderedOptions.new
  config.locals.daa_api_lib 	= locals_config[:daa_api_lib]
  config.locals.keys_path 		= locals_config[:keys_path]
  # config.database.adapter 	= 'mysql2'
  # config.database.encoding 	= 'utf8'
  # config.database.host 		= locals_config[:mysql_host]
  # config.database.database 	= locals_config[:mysql_database]
  # config.database.pool 		= '16'
  # config.database.username 	= locals_config[:mysql_username]
  # config.database.password 	= locals_config[:mysql_password]

end


# development:
#   <<: *default
#   adapter: mysql2
#   encoding: utf8
#   host: Rails.configuration.locals.mysql_host
#   database: Rails.configuration.locals.mysql_database
#   pool: 16
#   username: Rails.configuration.locals.mysql_username
#   password: Rails.configuration.locals.mysql_password