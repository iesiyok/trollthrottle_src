

Rails.application.config.after_initialize do
	  ActiveRecord::Base.connection_pool.disconnect!

	  ActiveSupport.on_load(:active_record) do
	  	puts Rails.application.config.database_configuration[Rails.env]
	    config = Rails.application.config.database_configuration[Rails.env]
	    ActiveRecord::Base.establish_connection(config)
	  end
end

ActiveRecord::Base.connection # Calls connection object
  puts "CONNECTED!" if ActiveRecord::Base.connected? 
  puts "NOT CONNECTED!" unless ActiveRecord::Base.connected?