from random import random
import pandas
from datetime import datetime

class Model:
  def __init__(self, participants, month):
    self.eventHistory = self.csvToDf("data/coned/DR-activitylog-cleaned.csv")
    self.participants = participants
    self.month = month
    self.daysInMonth = self.getDIM(self.month)
    self.weather = self.toyWeatherData(self.daysInMonth)

  def runModel(self):
    print('')
    print("*** RUNNING MODEL ***")
    participationRate = []

    #assumes battery starts at 100% and is based on usable capacity with dod
    batStatus = 1.0
    runningBatStatus = []
    #watt hours = amp hours * volts * dod
    batCapacity = self.participants[0].storage.wattHours * self.participants[0].storage.dod 
    print("bat cap: " + str(batCapacity) + "Wh")
    #loop through month
    for i in range(self.daysInMonth):
      #check if event occurs
      eventInfo = self.eventToday(i) 

      if type(eventInfo) != bool:
        print('')
        print("***EVENT INFO***")
        print(eventInfo)
        #check if event occurs after PSH (3pm) in order to add energy produced that day
        if self.afterPSH(eventInfo['Start Time']):
          print("event occurs after PSH")
          #check energy production and update battery status
          energyToday = self.energyProducedToday(self.weather[i])
          batStatus = self.updateBatStatus(batStatus, batCapacity, energyToday)
          runningBatStatus.append[batStatus]

        #get % of stored energy to reserved amount
        reservedWh = self.participants[0].demandResponseCapcity_W*4
        participationRate.append(self.getParticipationRate(batStatus,batCapacity,reservedWh))
        #store participation rate
        batStatus = self.updateBatStatusEventLoad(batStatus,batCapacity,reservedWh)
        print("available stored energy: " + str(batStatus * batCapacity) + "Wh")
        #there is a  redancy in the classes because each program also has a reservation amount
        print("required energy for reserved power:" + str(self.participants[0].demandResponseCapcity_W * 4) + "Wh")
        print("Participation Rate: " + str(participationRate[len(participationRate)-1]))
        #participationRate.append()

        #get tot participation rate for month
        
        #self.replacement()
      #if no event, update battery status
      else:  
        #check energy production and update battery status
        energyToday = self.energyProducedToday(self.weather[i])
        batStatus = self.updateBatStatus(batStatus, batCapacity, energyToday)
        runningBatStatus.append(batStatus)
    print(runningBatStatus)
    print(self.printReport(participationRate))

  #returns the estimated amount of energy generated
  def energyProducedToday(self, weather):
    #energy produced today = PV Watts * PSH * solarAccess * weather
    WhDay = 50 * 5 * 1 * weather

    return WhDay

  #returns the percentage of watt hours replaced by battery storage
  def getParticipationRate(self, bS, bC, reservationWh):
    return max(min((bS * bC)/ reservationWh,1.0),0.0)

  #returns the percentage of battery capacity with the addition of energy production
  def updateBatStatus(self, bS, bC, producedWhDay):
    bS = ((bS * bC) + producedWhDay) / bC
    return max(min(bS,1.0),0.0)

  #returns the percentage of battery capacity after load
  def updateBatStatusEventLoad(self, bS, bC, loadWhDay):
    bS = ((bS * bC) - loadWhDay) / bC
    return max(min(bS,1.0),0.0)

  #returns the amount of days in a given month
  def getDIM(self,m):
    days = [31,28,31,31,30,31,30,31,30,31,30,31]
    return days[m-1]

  def toyWeatherData(self,amtD):
    weatherByDay = []
    for i in range(amtD):
      weatherByDay.append((random() * .25) + .75)
    print("toy weather:")
    print(weatherByDay)
    return  weatherByDay

  #check if DR event occurs on given date
  #return info for the event
  def eventToday(self, date):
    eH = self.eventHistory

    # print(date)
    # #format as 2 digit day
    # if date < 10:
    #   date = '0' + str(date)
    # else:
    #   date = str(date)

    # print(date)
    event = eH[(eH['Event Date'] == '2022-08-' + str(date)) & (eH['Program'] == 'CSRP')]
    if event.shape[0] > 0:
      # print('DR event on ')
      # print(event.iloc[0])
      #this only returns the first line, which is fine for all networks but needs to be reworked
      return event.iloc[0]
    # for d in range(len(self.eventHistory)):
    #   if date == self.eventHistory[d][0]:
    #     print("DR event on " + str(self.month) + "/" + str(self.eventHistory[d][0]))
    #     return self.eventHistory[d]
    return False

  #check if DR event occurs after peak sun hours
  def afterPSH(self,eventStartTime):
    #will need to be updated with actual PSH time - also should account for partial coverage
    if datetime.strptime(eventStartTime, '%H:%M') > datetime.strptime('15:00', '%H:%M'):
      return True
    else:
      return False 
  
  def csvToDf(self,csvFile):
    df = pandas.read_csv(csvFile)
    print(df.head())
    print(df.columns)

    #convert str to date
    df['Event Date']=df['Event Date'].astype('datetime64[ns]')

    print(df.head())

    return df

  #FIX THIS
  def filterLogTime(self,fullLogDF):
    # if datetime.strptime(fullLogDF.column['Event Date'], "%M/%D/%Y") > datetime.strptime("1/1/2022", "%M/%D/%Y"):
    #   print
    # line[i]=  (datetime.strptime(line[i], "%H:%M")+timedelta(hours=12)).strftime('%H:%M')

    return filteredLogDF

  def printReport(self, pL):
    tp = "August 2022"
    nE = len(pL)
    print('')
    print("*** Demand Response Aggregation Model Report ***")
    print("Time period: " + str(tp))
    print("# Events: " + str(nE))

    tP = 0
    for p in pL:
      tP = tP + p
    tP = tP / len(pL)

    print("Participation History: " + str(pL))
    print("Overall Participation Rate: " + str(tP))
  
class Participant:
  def __init__(self, network):
    #self.zone = zone #zone is only used by NYISO
    self.network = network
    self.programs = []
    self.latlong = []
    self.demandResponseCapcity_W = 500
    self.storage = {}
    self.production = {}
    self.load = {}
    self.solarAccess = 50 #% of solar exposure for location
  
  #def __repr__(self):
   # return f'Participant("{self.dlrp}","{self.csrp}","{self.zone}", "{self.network}",{self.demandResponseCapacity_W},{self.production})'

  def __repr__(self):
          return "<{klass} @{id:x} {attrs}>".format(
              klass=self.__class__.__name__,
              id=id(self) & 0xFFFFFF,
              attrs=" ".join("{}={!r}".format(k, v) for k, v in self.__dict__.items()),
              )

class Production:
  def __init__(self):
    self.pvProductionCapacity_W = 50 #PV array size in watts
    self.pvExposure = 50 #percentage of peak sun hours
    self.windProductionCapcity_W = 0

  def __repr__(self):
        return "<{klass} @{id:x} {attrs}>".format(
            klass=self.__class__.__name__,
            id=id(self) & 0xFFFFFF,
            attrs=" ".join("{}={!r}".format(k, v) for k, v in self.__dict__.items()),
            )

#reserved load
class Load:
  def __init__(self):
    #type options: fridge, windowAC, centralHVAC, light, other
    self.type = windowAC
    #control types: 0= on/off, 1=gradient
    self.controlType = 0
    self.wattage = 500
    self.dutyCycle = 1
    self.shiftable = False

class Storage:
  def __init__(self, ah, v):
    self.voltage = v
    self.ampHours = ah
    self.wattHours = self.voltage * self.ampHours
    self.type = 'SLA' #types: SLA, LION
    self.dod = self.setDod(self.type) # depth of discharge percentage
    self.chargePercentage = 100 #percentage of discharge

  def setDod(self, bType):
    if bType == 'SLA':
      return 0.50
    elif bType == 'LION':
      return 0.80

# class windowAC(Load):
#   def __init__(self):
#     super().__init__()
#     self.dutyCycle = .75
