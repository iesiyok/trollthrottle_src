
#! /bin/sh

# Wait for DB services
sh /sign_verifier/wait-for-services.sh


rm -f /sign_verifier/config/pids/unicorn.pid

cd /sign_verifier && taskset -c 1-3 bundle exec unicorn_rails -c config/unicorn.rb -E production -d