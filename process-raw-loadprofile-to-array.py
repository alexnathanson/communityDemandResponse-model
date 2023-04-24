#format the lines of text from Con Ed into CSV

import re
from datetime import datetime, timedelta
import csv

# Using readlines()
file = open('additional-raw-data/energy-usage-multifamilyresidential-1.txt', 'r')
Lines = file.readlines()
  
hourlyArrayString = ''

count =0

maxLoad = 0

# get max load
for line in Lines:
    maxLoad = max(maxLoad, float(line))

for line in Lines:
    #remove trailing or leading white spaces
    line = line.strip()

    print(line)

    #print(line)

    if count >= 2880 & count < 6528:
        if hourlyArrayString != '':
            hourlyArrayString = hourlyArrayString + ','
        hourlyArrayString = hourlyArrayString + str(float(line)/maxLoad)
    count = count + 1

print(hourlyArrayString)
 
l = 0
with open('energyuse-multifamily-scaler-may-sept.txt', 'w',newline="") as f:
    #writer = csv.writer(f)
    #writer.writerows(hourlyArray)
    # for line in newLines:
    #     l = l + 1
    #     f.write(line)
    #     if l < len(newLines):
    #         f.write('\n')

#with open('readme.txt', 'w') as f:
    f.write(hourlyArrayString)
    #f.write('\n')