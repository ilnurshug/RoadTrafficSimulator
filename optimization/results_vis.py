import matplotlib.pyplot as plt

def main():
  with open('ga_results', 'r') as data_file:  
    res = [[float(x) for x in line.split()][0] for line in data_file]
    plt.plot(res)
    plt.ylabel('avg waiting time')
    plt.show()
    
if __name__ == "__main__":
  main()