#!/bin/bash
if [ "$#" -ne 2 ] ; then
    echo "$0: USAGE: trip.sh [which folder to scan] [where to put the tar.bz2]"
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

echo "calculating md5sum in $path ..."

rm -f trip.txt
find $1 -type f -print0 | xargs --null md5sum >> trip.txt;
sed -i "s/$(echo $path | sed -e 's/[]\/$*.^|[]/\\&/g')/\.\//g" trip.txt
tar -cjf "${output}trip-$(date +%Y%m%d)".tar.bz2 trip.txt
rm trip.txt