class model:
  def __init__(self, logFile):
    self.activityLog = logFile
    
class Participant:
  def __init__(self, zone, network):
    self.dlrp = True
    self.csrp = True
    self.zone = zone
    self.network = network
    self.demandResponseCapcity_W = 500
    self.storageCapacity_SLA_Wh = 2000
    self.storageCapacity_LiOn_Wh = 0
    
class Production:
  def __init__(self):
    self.pvProductionCapacity_W = 50
    self.windProductionCapcity_W = 0

class Load:
  def __init__(self):
    #type options: fridge, windowAC, centralHVAC, light, other
    self.type = windowAC
    #control types: 0= on/off, 1=gradient
    self.controlType = 0
    self.wattage = 500
    self.dutyCycle = 1
    self.shiftable = False

class windowAC(Load):
  def __init__(self):
    super().__init__()
    self.dutyCycle = .75
