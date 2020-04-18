#! /bin/sh

#Wait for MySQL
until nc -z -v -w30 nginx 4002; do
 echo 'Waiting for Ledger...'
 sleep 1
done
echo "Ledger is up and running!"