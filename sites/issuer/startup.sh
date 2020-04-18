
#! /bin/sh

# Wait for DB services
sh /issuer/wait-for-services.sh


rm -f /issuer/config/pids/unicorn.pid

cd /issuer && taskset -c 0 bundle exec unicorn_rails -c config/unicorn.rb -E production -d