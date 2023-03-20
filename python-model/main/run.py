from datetime import datetime
from DemandResponsePrograms import ConEd
from DemandResponseAggregation import Model, Participant, Production, Storage
import json

# testEvent =[[4,"Con Edison","CSRP",11,15,4,"All","Event","Planned"],
# 	[5,"Con Edison","CSRP",11,15,4,"All","Event","Planned"],
# 	[16,"Con Edison","CSRP",11,15,4,"All","Event","Planned"]]

#testHardware = {'pvW': 50, 'batAh':50,'batVol':24}

def main():
	print('running')

	# Instantiate Participant(s)
	participants = generateParticipant(1)

	#setup test conditions
	model = Model(participants, 8)

	model.runModel()

def generateParticipant(amount):

	#instantiate participants
	participants = []

	for i in range(amount):
		#instantiate participants in Crown Heights with 500W reservation
		participants.append(Participant('crown heights', 500))
		#add production capacity (pv W, wind W)
		participants[i].production = Production(50,0)
		#add storage capacity (aH,voltage)
		participants[i].storage = Storage(50, 24)
		#add DR programs
		participants[i].programs.append(ConEd('CSRP',participants[i].network, participants[i].demandResponseCapcity_W))
		participants[i].programs.append(ConEd('DLRP',participants[i].network, participants[i].demandResponseCapcity_W))

	return participants

if __name__ == '__main__':
	main()