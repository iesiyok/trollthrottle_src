
# Set the working application directory
app_path = "/id_verifier"
working_directory "#{app_path}"

pid "#{app_path}/config/pids/unicorn.pid"

stderr_path "#{app_path}/log/unicorn.stderr.log"
stdout_path "#{app_path}/log/unicorn.stdout.log"


worker_processes 2
preload_app true


before_fork do |server, worker|
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.connection.disconnect!
  end
end

listen 3001, :tcp_nopush => true

after_fork do |server, worker|

	

	# addr = "127.0.0.1:#{13010 + worker.nr + 1}"
	# server.listen(addr, :tries => -1, :delay => 5, :tcp_nopush => true)

	config = Rails.application.config.database_configuration[Rails.env]
	ActiveRecord::Base.establish_connection(config)

end

# Time-out
timeout 30


