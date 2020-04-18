# Set the working application directory

app_path = "/issuer"


working_directory "#{app_path}"


pid "#{app_path}/config/pids/unicorn.pid"

stderr_path "#{app_path}/log/unicorn.stderr.log"
stdout_path "#{app_path}/log/unicorn.stdout.log"


worker_processes 2
preload_app true


timeout 30

listen 3000, :tcp_nopush => true

before_fork do |server, worker|

  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.connection.disconnect!
  end
end

after_fork do |server, worker|

  # addr = "127.0.0.1:#{13000 + worker.nr + 1}"
  # server.listen(addr, :tries => -1, :delay => 5, :tcp_nopush => true)

  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.establish_connection
  end

end


