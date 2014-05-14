#!/bin/sh

PATH=/usr/bin/:/usr/local/bin/:/sbin/:$PATH

LANG="en_US.UTF-8"; LC_ALL="en_US.UTF-8"; 

PID=`pidof cjserver`

LOGFILE=run.log

if [ ! -z "${PID}" ]
then
    kill ${PID}
    sleep 1
    echo "kill ${PID}"
    jekyll serve --port 80 >> $LOGFILE 2>&1 &
    echo "jekyll server started."
else
    jekyll serve --port 80 >> $LOGFILE 2>&1 &
    echo "jekyll server started."
fi

    
