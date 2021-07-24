#!/bin/bash

number=$RANDOM
let "number%=400"
count=1

echo "$MAXCOUNT random numbers:"
echo "-----------------"
while [ "$count" -le $number ]      # Generate 10 ($MAXCOUNT) random integers.
do
  curl -H "User-Agent:Safari 3.15" "http://click.laikad.com/click?offerguid=3D7DEE00-463C-E911-85B3-2818780EF331&ClickID=test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604&Android_AdID=test20190604&subpubid=99999" &
  echo $count
  let "count += 1"  # Increment count.
done
echo "-----------------"