#format the lines of text from Con Ed into CSV

import re

# Using readlines()
file1 = open('DR-activitylog-raw.csv', 'r')
Lines = file1.readlines()
  
newLines = []

# Strips the newline character
for line in Lines:
    #remove trailing or leading white spaces
    line = line.strip()
    
    if "Event Date" in line:
        line = line.replace('\t',',')
    else:
        #remove , " except for header line
        line = re.sub(',|\"', '', line)
        #replace ' ' with , (This is where the CSV magic happens)
        line = line.replace(" ", ",")
        #Con Ed formatting
        line = line.replace("Con,Ed", "Con Ed")
        #scr (icap) formatting
        line = line.replace('SCR,(', "SCR (")
        #CSRP-Night formatting
        line = line.replace(',-,', "-")
        line = line.replace(',SC,', " SC ")
        line = line.replace('Smart,AC', 'Smart AC')
        line = line.replace('Term,DLM', 'Term DLM')
        #line = line.replace('Zone,', "Zone ")
    
    #Zone/Network Formatting
        zS = line.find(line.split(',')[6])

        if "Test" in line:
            zE = line.find("Test") - 1
        else:
            zE = line.find("Event") - 1
        #print(zS)
        #print(zE)

        zone = line[zS:zE].replace(","," ")

        line = line.replace(zone.replace(' ',','),zone)

        #fix multi-day dates!!!
        #currently this is done manually after the fact
        if '-' in line.split(',')[0]:
            lineList = line.split(',')
            line.replace(lineList[0],lineList[0].split('-')[0])

    print(line)
    newLines.append(line)

print(newLines)
        #f.write(line)
    #print("Line{}: {}".format(count, line.strip()))

l = 0
with open('DR-program-history-cleaned.csv', 'w') as f:
    for line in newLines:
        l = l + 1
        f.write(line)
        if l < len(newLines):
            f.write('\n')
