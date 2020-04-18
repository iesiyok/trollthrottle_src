# Set the working application directory

app_path = "/ledger"

working_directory "#{app_path}"

pid "#{app_path}/config/pids/unicorn.pid"

stderr_path "#{app_path}/log/unicorn.stderr.log"
stdout_path "#{app_path}/log/unicorn.stdout.log"

worker_processes 20
preload_app true

listen 3002, :tcp_nopush => true


timeout 30


before_fork do |server, worker|
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.connection.disconnect!
  end
end




after_fork do |server, worker|

	require 'rufus-scheduler'

	# addr = "127.0.0.1:#{13020 + worker.nr + 1}"
	# server.listen(addr, :tries => -1, :delay => 5, :tcp_nopush => true)

  	config = Rails.application.config.database_configuration[Rails.env]
  	ActiveRecord::Base.establish_connection(config)

    log_path = "#{app_path}/log/custom_#{worker.nr+1}_0.log"
    logfile = File.open( log_path, 'a')  
    logfile.sync = true  
    $custom_log = CustomLogger.new(logfile) 

  	$TASKS = []

	s = Rufus::Scheduler.new

	uri = URI.parse(Rails.configuration.locals.website_notify)
	
	# http = http.start
	http = Net::HTTP.new(uri.host, uri.port)
	http.read_timeout = 6
	    
	req = Net::HTTP::Post.new(uri.path, initheader = {'Content-Type' =>'application/json'})


	s1 = Rufus::Scheduler.new

	inde = 1;

	#to escape from IO errors, create new custom log file for each worker
	#every 3d for example

	s1.every '12h' do

		log_path = "#{app_path}/log/custom_#{worker.nr+1}_#{inde}.log"
	    logfile = File.open( log_path, 'a')  
	    logfile.sync = true  
	    $custom_log = CustomLogger.new(logfile) 
	    inde = inde + 1

	end

	# s2 = Rufus::Scheduler.new
	# s2.every '1h' do


 #  		http = Net::HTTP.new(uri.host, uri.port)
	# 	http = http.start
		
 #  	end

	s.every '1s' do


		unless $TASKS.nil? || $TASKS.empty?

			# http = Net::HTTP.new(uri.host, uri.port)

			x = $TASKS.shift(120)


		    req.body = {list: x}.to_json

		    response = http.request(req)

		    dict = {}

		    x.each do |y|



		    	y1 = JSON.parse(y)
		    	
		    	v = {topic: y1["topic_id"], aenc: y1["aenc"], comment: y1["h_c"], W: y1["W"], dom: y1["dom"], ts: Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N") }.to_json
		    	
		    	dict[y1["nym"]] = v
		    	
		    end

		    

		    if response.code == '200'

		    	r = JSON.parse(response.body)
		    	rx = r["list"]
		    	zz = ""
		    	q = "INSERT INTO website_comments (topic_id, aenc, comment, W, domain, ts, nym, status) VALUES "
		    	qq = ""
		    	rx.each do |z|



                    zz += "#{z["nym"].gsub(/\n/,'<br>')}, code: #{z["code"]}, time: #{z["time"]} \n"
		    		if z["code"] == '1' 
		    			y1 = JSON.parse(dict[z["nym"]])
		    			qq += "(#{y1["topic"]}, \"#{y1["aenc"]}\", \"#{y1["comment"]}\", \"#{y1["W"]}\", \"#{y1["dom"]}\", \"#{y1["ts"]}\", \"#{z["nym"]}\", \"1\"),"

		    		end

		    	end

		    	

		    	if qq.length > 0 
		    		xxx = qq.gsub /.$/, ";"
		    		
		    		ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q + xxx ) }
		    		
		    		
		    	end

		    	$custom_log.info("#{zz}")
		    	
		    else
		    	$custom_log.error("#{Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N")} Problem with website notification system #{response.code}")
		    end


			
		end


		

	end

end
