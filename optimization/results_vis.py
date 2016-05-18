import matplotlib.pyplot as plt

def main():
  with open('ga_results', 'r') as data_file:  
    res = [[float(x) for x in line.split()][0] for line in data_file]
    
    def chunks(l, n):
      """Yield successive n-sized chunks from l."""
      for i in range(0, len(l), n):
	yield l[i:i+n]
    
    arr = []
    for chunk in chunks(res, 10):
      arr.append(min(chunk))
    
    plt.plot(arr, color='r', marker='o', linestyle='--')
    plt.ylabel('avg waiting time')
    plt.show()
    
if __name__ == "__main__":
  main()