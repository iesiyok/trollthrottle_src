
#! /bin/sh

# Wait for DB services
sh /simulator/wait-for-db.sh

sh /simulator/wait-for-services.sh


tail -f /dev/null