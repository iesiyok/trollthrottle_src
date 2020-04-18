

class VerifierController < ApplicationController

	def save_comment


		begin
				start = Process.clock_gettime(Process::CLOCK_MONOTONIC)

				respond_to :json

				data = JSON.parse request.body.read

				# nv = "9AC564D68D1AE2D76281583FC488C96E85B9211CED9887238E33E01FAABAD7B4AD1FC4715DF4502F8749EF5FF515FBCA5341DB7FA888AED734AF116FD57906B367B0C079CC60DD5F1443B8A88B163\n14E5D7F1B47366557B2AEF2C96DE84EA3DD8DB454E1E6677B82ED4E5200FFAC82901510DDA475BB6B152863AA67CFDCB3702BB50EBAF845ACCD92E3F6A980A3095EB843D12DAC69A1E3B5D930E4AAB\n\n"
				nv = "F8FFE55B3FB844752E275EAA0AD6F94E53149B2D1AFE21DF2620A4A30B714A3\n1C717240FF9C60618A32F4A86685DB47995058E670BA129570D302BF07F2BC\n\n"

				comment = data['comment']

				if comment.valid_encoding?

					topic = data['topic_id']

					q = "INSERT INTO website_temp_comments (topic_id, comment, nv, ts) VALUES ('" + topic.to_s + "',\"" + comment + "\",'" + nv + "','" + Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N") + "'); " 

					ActiveRecord::Base.connection_pool.with_connection do |con|
						con.exec_query( q )
					end 
					res1 = ActiveRecord::Base.connection_pool.with_connection do |con|
						con.exec_query( "SELECT LAST_INSERT_ID() AS last_id;" )
						
					end 

					finish = Process.clock_gettime(Process::CLOCK_MONOTONIC)
					elapsed = finish - start
					id = res1[0]['last_id']
					
					res = {code: '1', id: "#{id}", time: elapsed}
				else
					res = {code: '0', time: elapsed, status: "Invalid enconding"}
					CUSTOM_LOGGER.error("[1] Invalid encoding")

				end

				render json: res.to_json
		rescue
				CUSTOM_LOGGER.error("[1] An error occured #{@error_message}")
		ensure

				
		end

	end



end
