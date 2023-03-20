import pandas

#Demand Response program structure
# class DRProgram:
#   def __init__(self, program):
#     self.program = program

# Con Ed demand response parent class
# DR program info: https://www.coned.com/-/media/files/coned/documents/save-energy-money/rebates-incentives-tax-credits/smart-usage-rewards/demand-response-forum.pdf
# DR network info
class ConEd:
	def __init__(self, program, network, reservation):
	    self.program = program
	    self.network = network
	    self.networkInfoFile = 'data/coned/conEdNetworks-cleaned.csv'
	    self.networkInfo = self.csvToDf(self.networkInfoFile)
	    self.tier = self.getTier(self.networkInfo)
	    self.minimumReservation = 50000 #Watts
	    self.voluntary = False
	    self.reservation = reservation #Watts
	    self.programFirst = 5 # number of start month (May)
	    self.programLength = 5 # number of months
	    self.programLast = 9 #number of end month (September)
	    self.reservationRate = self.setReservationRate(self.voluntary, self.program, self.network, self.tier)
	    self.participationRate = self.setParticipationRate(self.voluntary)
	    self.participation = {}
	    self.events = {}
	    
	    self.CSRPwindowStart = 6 #start time
	    self.CSRPwindowEnd = 10 #sohuld this be duration instead?

	#set reservation rate based on network or region
	#USD per kW
	def setReservationRate(self, v, p, n, t):
		if v == True:
				#voluntary participation only pays the participation rate
				return 0
		else:
			if p == 'CSRP':
				if n != 'westchester' or 'staten island':
					return 18
				else:
					return 6
			elif p == 'DLRP':
				if t == 1:
					return 18
				elif t == 2:
					return 25

	#set participation rate based on network or region
	#USD per kW
	def setParticipationRate(self, v):
			if v == True:
				#voluntary participation only pays the participation rate
				return 3
			else:
				return 1

	#return the event window for a given zone
	def setCSRPWindow(self):
		return 4

	def getTier(self,niDF):
		return 1

	def csvToDf(self,csvFile):
		df = pandas.read_csv(csvFile)
		print(df.head())
		return df

# NYISO demand response parent class
# class NYISO:
#   def __init__(self, program):
#     self.program = program