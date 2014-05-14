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
else
    echo "hehe"
    jekyll serve --port 80 >> $LOGFILE 2>&1 &
fi

if [ $? = 0 ]
then
    echo "jekyll server started ok."
else
    echo "jekyll server started failed. please see details in ${LOGFILE}"
fi
    
