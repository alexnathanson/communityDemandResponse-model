# Visualization

## Normative

* No prediction, only centralized alerts
* No sharing between nodes

Each event participation is determined by 
* battery capacity
* chance of manual curtailment


# to do
make full screen
define participant - what kind of legal entity are they in relation to ConEd 
create diagram that shows electrical flows


pattern of consumption
location


describe the lexus diagram


## Psuedo Code

Set up the model
* participants
* data

Each loop represents 1 hour

Each hour it 
* checks if event is happening
* checks if an alert has been issued
* predicts if an alert is likely based on weather
* determines what to do with available energy
* updates energy production and consumption stats


# Model Design

## Inputs
* Con Ed networks (DR event and program characteristics)
* DR event history
* 2022 Observed Weather (for event prediction) actual weather is required instead of TMY weather to match the event history
 * Source: National Weather Service NY-Kennedy https://www.weather.gov/wrh/Climate?wfo=okx
* NREL PV watts (primarily for sun hours)
* Load profiles 
* hardware packages to test


Gaps and Future Work
* include building geometry for more complex solar access numbers
* interactions between participants
* include various load profiles