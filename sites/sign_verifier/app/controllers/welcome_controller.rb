class WelcomeController < ApplicationController
  def index
  		cookies[:sid]={
			value: "sid123",
			expires: 10.days.from_now
		}
  end
end
