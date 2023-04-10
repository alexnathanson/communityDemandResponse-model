# communityDemandResponse-model

Modeling community demand response in NYC

Goals:
estimate impact of community demand response programs

example test set up
50W pv + battery + with and without automated transfer switch based on 2022 data

Inputs:
Historic DR data
weather data


# Setup

##  Virtual environment

### To install
`python -m venv venv`

### To activate

`<venv>\Scripts\activate.bat`

### To freeze depencies

in the venv
`pip freeze > requirements.txt`

### to install

in venv
`pip install -r requirements.txt`

# Psuedo

Spec participant system, calculate how it would work for them over a 1 month period

## Context

1) Generate particant
* location
* production, storage, and load profiles
* dr programs

2) Environment
* Weather
* DR event schedule

3) Run Model
* loops through a given period of time
* checks if there is an event that day
* if no event, calculates how much energy is produced and updates battery status accordingly
* if event, calculates percentage of reservation can be covered by available battery storage and updates battery status accordingly
* prints report


## Run

# Research Problems

interviews

solve the problem without adding gadgets

state bias in intercviews
what i am getting at
what i expect the result to be
and if it proves or disproves

hypothesis: a group of people in a enrgy initiative...

software:
get a number
* whats the minimum amount of people i need to agregate?
* how does the uncertaintly of what kind of unit increase or decrease the amount of participants?
* now that I have detected I need X amount of units - what can't be done with automated tech economically
* if i don't have this tech, how many units are needed of X% of people manually participate

To do:
diagram code
diagram questions
reiterate on hypothesis, objective, goal, expected outcomes

software to do:
add weather
add grid for batteries

when to turn off battery output

## Present the high-level concepts

explain problem
how it tacjkes problem at a specific scale and how it expands
discuss the research by presenting what is difficult about what im doing
* what does no one know / what is the new thing
* methods

write a complete list of all features and functions (internal or external) to solve the problem
* history of participation
* phone
* email
* etc
* make it as exhaustive as possible - assume every feature is there to solve the problem in the most efficient way


goal: minimum amount of tech to solve the problem





to do:
add switch
add side bar