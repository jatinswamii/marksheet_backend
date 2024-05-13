import matplotlib.pyplot as plt
from deepface import DeepFace
import cv2

models = [
  "VGG-Face", 
  "Facenet", 
  "Facenet512", 
  "OpenFace", 
  "DeepFace", 
  "DeepID", 
  "ArcFace", 
  "Dlib", 
  "SFace",
]

backends = [
  'opencv', 
  'ssd', 
  'dlib', 
  'mtcnn', 
  'retinaface', 
  'mediapipe',
  'yolov8',
  'yunet',
  'fastmtcnn',
]

class myPic():
  def __init__(self,basepath="",model_name="VGG-Face",detector_backend = 'retinaface'):
      self.basepath=basepath
      self.model_name=model_name
      self.detector_backend=detector_backend

  def verify(self,img1,img2):
    img1=f"{self.basepath}{img1}"
    img2=f"{self.basepath}{img2}"
    images=[img1,img2]
    try:
      vData = DeepFace.verify(images[0],images[1]
                , model_name = self.model_name, detector_backend = self.detector_backend)
      return vData
    except Exception as e:
          print(e)

  def saveCropImage(self,images,vData):
    if 'facial_areas' in vData:
      for i in range(2):
        _img=f"img{i+1}"
        if _img in vData['facial_areas']:
          image=f"{self.basepath}{images[i]}"
          faceimg=f"{self.basepath}face_{images[i]}"
          b=vData['facial_areas'][_img]
          img=cv2.imread(image)
          img= img[b['y']:b['y']+b['h'], b['x']:b['x']+b['w']]
          cv2.imwrite(faceimg,img)

  def analize(self,img):
    img=f"{self.basepath}{img}"
    try:
      objs = DeepFace.analyze(img_path = img, actions = ['age', 'gender'])
      return objs
    except Exception as e:
          print(e)

  
