import sys
from englisttohindi.englisttohindi import EngtoHindi

if __name__ == "__main__":
  try:
    text = sys.argv[1]
    print(EngtoHindi(text).convert)
  except Exception as e:
      raise TypeError(e)
