import pandas as pd
from matplotlib import pyplot as plt

#Max Hardware Sizes
pvMaxW = 500
batMaxWh = 2000

#80% depth of discharge for LiFePO4 batteries
LiFePOdod = .8

CSRPratePerkW = 18
DLRPratePerkW = 18

# check against list of hardware
inverterEfficiency = .9

#calculate energy production
# Wh = sun hours * PV Watts * derating * shading

annualkWh = 1000

# GRID ELECTRICITY COSTS
supplyChargeDollarsPerkWh = .09453
deliveryChargeDollarsPerkWh = .15653
systemBenefitChargeDollarsPerkWh = .00520
salesTax = .045
gridDollarPerkW = (supplyChargeDollarsPerkWh + deliveryChargeDollarsPerkWh + systemBenefitChargeDollarsPerkWh) * (1 + salesTax)
print("Con Ed $ per kWh = " + str(gridDollarPerkW))

annualAvoidedCosts = annualkWh * gridDollarPerkW

# should weather be factored in here?
print("Estimated voided Annual Grid Costs " + str(annualAvoidedCosts))


# HARDWARE COSTS
def hardwareCosts(pvW, batWh):
	#variable hardware costs
	# average cost of LiFePO4 batteries currently on market
	batteryDollarPerWh = 2.0
	# average cost of PV modules per kW
	pvDollarPerW = 1.0

	#fixed costs
	bosCost = 10
	mountingCost = 100
	smartController = 100
	operatingCosts = 0
	fixedHardwareCosts = bosCost + mountingCost + smartController + operatingCosts

	c = fixedHardwareCosts + (pvW * pvDollarPerW) + (batWh * batteryDollarPerWh)
	return c

'''
maximum amount of DR participation based on sum of:
battery capacity (assumes battery is full at start of DR event)
PV generation during event
'''
'''
maxAutoParticipation= (batterykWh * .25) + (pvWatts * eventSunHours * derating)
maxAutoDRGross = maxAutoParticipation * (CSRPratePerkW + DLRPratePerkW)

maxAvoidedEnergyConsumption = annualPVWatts

'''

data = {
	'pvW':[],
	'batWh':[],
	'hardwareDollars':[],
	'annualPVWh':[]
}

#pv watts loop 10-500 incrementing by 10
# is there a more complex relationship between PV and battery required? YES!
for p in range(1,int(pvMaxW / 10)+1):
	pW = p * 10
	#print(p * 10)
	#battery watt hour loop 50 - 2000 incrementing by 50
	for b in range(1,int(batMaxWh / 50)+1):
		bWh = b * 50
		data['pvW'].append(pW)
		data['batWh'].append(bWh)
		data['hardwareDollars'].append(hardwareCosts(pW,bWh))
		data['annualPVWh'].append('NaN')

#load data into a DataFrame object:
df = pd.DataFrame(data)

print(df.head())

df.plot(kind = 'scatter', x = 'batWh', y = 'pvW')

df.show()

df.savefig('foo.png')