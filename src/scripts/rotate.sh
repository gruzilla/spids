#!/bin/bash
if [ "$#" -ne 2 ] ; then
    echo "$0: USAGE: rotate.sh [where to find postlogfiles] [where to put the tar.bz2]"
    exit 3
fi

path=$1

if [ "${path: -1}" != "/" ] ; then
    path="$path/"
fi

output=$2

if [ "${output: -1}" != "/" ] ; then
    output="$output/"
fi

cwd=`pwd`

if [ "${output:0:1}" != "/" ] ; then
    output="$cwd/$output"
fi

echo "compressing logfiles in ${path}..."

cd ${path}
tar --ignore-failed-read -cjf "${output}logs-$(date +%Y%m%d).tar.bz2" ids.log post*
rm -f post*
rm -f ids.log
touch ids.log
cd $cwd