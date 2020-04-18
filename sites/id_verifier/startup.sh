
#! /bin/sh

# Wait for DB services
sh /id_verifier/wait-for-services.sh


rm -f /id_verifier/config/pids/unicorn.pid

cd /id_verifier && taskset -c 0 bundle exec unicorn_rails -c config/unicorn.rb -E production -d