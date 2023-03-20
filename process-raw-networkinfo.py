#format the lines of text from Con Ed into CSV

import re
from datetime import datetime, timedelta
import csv

# Using readlines()
file = open('conEdNetworks-raw.csv', 'r')
Lines = file.readlines()
  
newLines = []

# Strips the newline character
for line in Lines:

    line = line.lower()

    #remove trailing or leading white spaces
    line = line.strip()

    #turn string into list
    line = line.split(',')

    if 'borough' not in line:
        
        #remove borough from Network Column
        line[1] = line[1].replace(line[0], "").strip()
        #print(line)

        #moved data to other columns
        tempLine=line[1].split(' ')

        #end time
        line[3]=tempLine[len(tempLine)-2] + tempLine[len(tempLine)-1]
        #start time
        line[2]=tempLine[len(tempLine)-5] + tempLine[len(tempLine)-4]

        new1 = ''
        for i in range(len(tempLine)-5):
            new1= new1 + ' ' + tempLine[i]
        line[1] = new1.strip()

        #scale PM times to military time
        for i in [2,3]:
            if 'pm' in line[i]:
                line[i]=line[i].replace('pm',"")
                line[i]=  (datetime.strptime(line[i], "%H:%M")+timedelta(hours=12)).strftime('%H:%M')

            else:
                line[i]=line[i].replace("am","")

        #print(line)

    print(line)

    newLines.append(line)

print(newLines)
 
l = 0
with open('conEdNetworks-cleaned.csv', 'w',newline="") as f:
    writer = csv.writer(f)
    writer.writerows(newLines)
    # for line in newLines:
    #     l = l + 1
    #     f.write(line)
    #     if l < len(newLines):
    #         f.write('\n')