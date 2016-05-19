import numpy as np
import json
import os
from scipy import optimize
from pprint import pprint
from pyevolve import *
import pyevolve

wi = []
T = 3.0
B = 0.1

results = []

def run_experiment(delays):
  data = None
  i = 0
  print(delays)
  # load data and create new configuration
  with open('../experiments/map.copy.json', 'r') as data_file:    
    data = json.load(data_file)
    for intersection in wi:
      for j in range(4):
	data["intersections"][intersection]["controlSignals"]["delayMultiplier"][j] = delays[i]
	i += 1
  # save new configuration
  with open('../experiments/map.copy.json', 'w') as data_file:
    json.dump(data, data_file)
  # run experiment
  os.system('coffee ../coffee/runner.coffee')
  # load experiment's result
  res = 0
  with open('../experiments/0.data', 'r') as data_file:  
    res = [float(x) for x in next(data_file).split()][0]
  results.append(res)
  return 1000.0-res
  

def GA():
  # Genome instance
  genome = G1DList.G1DList(len(wi) * 4)

  # The evaluator function (objective function)
  genome.evaluator.set(run_experiment)
  genome.setParams(rangemin=B, rangemax=T)
  genome.mutator.set(Mutators.G1DListMutatorRealGaussian) # G1DListMutatorRealRange 
  genome.crossover.set(Crossovers.G1DListCrossoverTwoPoint) # Single
  genome.initializator.set(Initializators.G1DListInitializatorReal)
  
  ga = GSimpleGA.GSimpleGA(genome)
  ga.selector.set(Selectors.GRouletteWheel)
  
  ga.setPopulationSize(10)
  ga.setGenerations(50)
  ga.setMutationRate(0.05)
  # Do the evolution, with stats dump
  # frequency of 5 generations
  
  ga.evolve(freq_stats=5)

  # Best individual
  print ga.bestIndividual()

def main():
  np.random.seed(555)   # Seeded to allow replication.
  
  with open('../experiments/map.copy.json', 'r') as data_file:    
    data = json.load(data_file)
    for i in data["workingIntersections"]:
      wi.append(i["id"])
  #global wi
  #wi = ['intersection282', 'intersection283', 'intersection285']
  
  print(wi)
  
  GA()
  #run_experiment([1] * (len(wi)*4))
  
  with open('ga_results_map_2', 'w') as data_file:
    for r in results:
      data_file.write(str(r)+"\n")

if __name__ == "__main__":
  main()