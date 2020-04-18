# require './lib/group'
require "rbnacl"

class LedgerController < ApplicationController


    def retrieve_gpk

      respond_to :json

      q = "SELECT g1, h1, h2, g2, w, t4, or_der, prec_hash FROM issuer_gpk"
      rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
      rs = rs.to_a
      data = rs[0]

      # $TASKS.push("okay")
      # $TASKS.push("push")

      render json: {g1: data["g1"], h1: data["h1"], h2: data["h2"], g2: data["g2"], w: data["w"], t4: data["t4"], order: data["or_der"], prec_hash: data["prec_hash"]}.to_json



    end

    def store_info

    	respond_to :json

    	start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        h_login = params['h_login']
        a       = params['A']
        x       = params['x']

        h_login = Base64.urlsafe_encode64(h_login).to_s
        cred_obj = {a: a, x: x}.to_json
        ts = Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N")

        q = "SELECT COUNT(h_login) FROM user_daa_signatures WHERE h_login='" + h_login + "'";

        rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
        rs = rs.to_a
        d = rs[0]["COUNT(h_login)"]

        q = ""
        res = ""

        if  d.eql? 0 
            q = "INSERT INTO user_daa_signatures VALUES ('" + h_login + "','" +  cred_obj.to_s + "','" + ts + "')"  
            q_res = "Okay"

        else
            q = "UPDATE user_daa_signatures SET cred = '" + cred_obj.to_s + "', ts = '" + ts + "' WHERE h_login = '" + h_login + "'"
            q_res = "Okay. Warning :: The identity was updated for this user!"
            
        end

        ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }

        finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        elapsed = finish - start

        res = {status: q_res, code: '1', time: "#{elapsed}"}

        render json: res.to_json
    end

	
    def save_comment

		respond_to :json

		start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
		x = request.body.read
      	data = JSON.parse x


      	nym  = data['nym']

		q = "SELECT COUNT(nym) FROM website_comments WHERE nym ='#{nym.to_s}'"
		rs = ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }
		rs = rs.to_a
		d = rs[0]["COUNT(nym)"]

		res = ""

		if d.eql? 0

			
		    
			$TASKS.push(x)
			finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
			elapsed_0 = finish - start
			res = {status: "Okay.", code: '1', time: elapsed_0 }

		    # uri = URI.parse(Rails.configuration.locals.website_notify)
		    # http = Net::HTTP.new(uri.host, uri.port)
		    
		    # req = Net::HTTP::Post.new(uri.path, initheader = {'Content-Type' =>'application/json', 'http_version' => '1.1', 'Connection' => '' })

		    # req.body = x
		    # finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
		    # elapsed_0 = finish - start
		    # response = http.request(req)

		    # if response.code == '200'

		    #   start_0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
		    #   r = JSON.parse(response.body)
		    #   nym_s = nym.gsub("\n", "")
		      
		    #   if r['code'] == '1'
		    #       topic_id = data['topic_id']
		    #       aenc     = data['aenc']
		    #       comment  = data['h_c']
		    #       w        = data['W']
		    #       dom      = data['dom']
		    #       ts = Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N")
		    #       q = "INSERT INTO website_comments VALUES (" + topic_id.to_s + ",'" + aenc + "',\"" + comment + "\",'" + w + "','" + dom + "','" + ts + "','" + nym + "','1');"


		    #       ActiveRecord::Base.connection_pool.with_connection { |con| con.exec_query( q ) }

		    #       finish_0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
		    #       elapsed_1 = finish_0 - start_0
		          
		    #       res = {status: "Comment stored..", code: '1', ledger_time: elapsed_0+elapsed_1, website_time: r['time'], sig_ver: r['verify'] }

		    #   else
		    #       finish_0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
		    #       elapsed_1 = finish_0 - start_0
		    #       res = {status: r['status'], code: r['code'], ledger_time: elapsed_0+elapsed_1, website_time: r['time'], sig_ver: r['verify'] }
		    #   end

		    # else
		    #   logger.debug "[11][Comment: #{nym_s}] error: {Problem with website notification system..#{response.code}}"
		    #   res = {status: "Problem with website notification system..#{response.code}", code: '0', ledger_time: elapsed_0, website_time: '0', sig_ver: '0'}
		    # end

		else

		    finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
		    elapsed_0 = finish - start
		    res = {status: "Duplicate nym.", code: '0', time: elapsed_0 }
		    # res = {status: "Duplicate nym", code: '0', ledger_time: elapsed_0, website_time: '0', sig_ver: '0' }
		end

		render json: res.to_json

    end
	
	

end
