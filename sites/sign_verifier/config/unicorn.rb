



# Set the working application directory

app_path = "/sign_verifier"

working_directory "#{app_path}"

pid "#{app_path}/config/pids/unicorn.pid"

stderr_path "#{app_path}/log/unicorn.stderr.log"
stdout_path "#{app_path}/log/unicorn.stdout.log"


worker_processes 6
preload_app true


listen 3004, :tcp_nopush => true

before_fork do |server, worker|
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.connection.disconnect!
  end
end


after_fork do |server, worker|

    require './lib/group.rb'

    # addr = "127.0.0.1:#{14020 + worker.nr + 1}"
    # server.listen(addr, :tries => -1, :delay => 5, :tcp_nopush => true)

    config = Rails.application.config.database_configuration[Rails.env]
    ActiveRecord::Base.establish_connection(config)

    q = "SELECT seed, w FROM issuer_gpk"
    rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
    rs = rs.to_a;
    data = rs[0]

    pfc = FFI::MemoryPointer.new :pointer
    Group.pfc_setup(pfc)
    gpk_ptr = FFI::MemoryPointer.new :pointer
    Group.verifier_bot_setup(gpk_ptr, pfc, data["seed"], data["w"])
    Group::GroupClass.new(gpk_ptr, pfc)

end


timeout 30
