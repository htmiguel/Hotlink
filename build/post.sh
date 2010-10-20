#!/bin/bash

package=$1
server=$2

if [ $server == "lab" ]
then
    serverPath="/var/www"
    scp -P9128 $package root@haigo.dyndns.org:$serverPath
    ssh root@haigo.dyndns.org -p9128 "cd $serverPath/hotlinks; rm -dr *; mv ../$package .; tar -xzf $package; rm $package;"
    echo ""
    echo "Posted to $server:$serverPath"
    echo ""
else
    echo "Invalid Server."
fi
