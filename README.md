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

in the ve
`pip freeze > requirements.txt`

### to install

in ve
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

