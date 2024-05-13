import cv2
import easyocr
from thefuzz import fuzz
from thefuzz import process
from qreader import QReader
from pyaadhaar.decode import AadhaarSecureQr
from pyaadhaar.utils import Qr_img_to_text, isSecureQr

enums ={
    "1":"aadhar",
    "2":"dl",
    "3":"pan",
    "4":"passport",
    "5":"cgovt",
    "6":"voterid"
}
class scan():
    def __init__(self,basepath=""):
        self.basepath=basepath
        self.qreader = QReader()
        self.reader = easyocr.Reader(['en'], model_storage_directory='models', detect_network='dbnet18', download_enabled=True)

    def aadhar(self,file,data):
        print(file)

        try:
            qrData = Qr_img_to_text(file)
        except Exception as e:
            return {}
        matched={}
        try:
            if (len(qrData)==0):
                image = cv2.cvtColor(cv2.imread(file), cv2.COLOR_BGR2RGB)
                qrData = self.qreader.detect_and_decode(image=image)
                if (qrData[0] is  None): qrData=[]
            if (len(qrData)>0):
                isSecureQR = (isSecureQr(qrData[0]))
                if isSecureQR:
                    secure_qr = AadhaarSecureQr(int(qrData[0]))
                    result = secure_qr.decodeddata()
                    if 'gender' in result: matched['gender']=result['gender'].lower()
                    for (k,v) in data.items():
                        score=fuzz.token_set_ratio(v, result)
                        matched[f"{k}_score"]=score
                    return matched
        except Exception as e:
            e='1'
        if (len(matched)==0):
            return self.imageTextMapper(file,data)
             

    def imageTextMapper(self,file,data):
        try:
            data.update({
                "gender_m":" male",
                "gender_f":" female",
                "gender_t":" transgender"
            })
            image = cv2.cvtColor(cv2.imread(file), cv2.COLOR_BGR2GRAY)
            ratio=image.shape[1]/image.shape[0]
            # if (image.shape[1] >1000) :
            #     image=cv2.resize(image,(int(1000*ratio),1000))
            result = self.reader.readtext(file, detail=0)
            print(result)
            result=" ".join(result).lower()
            matched={}
            for k, v in data.items():
                score=fuzz.token_set_ratio(v, result)
                if ('gender' in k ):
                    if (score == 100): matched['gender']=k[-1]
                    continue
                matched[f"{k}_score"]=score
        except Exception as e:
            e=1
            #print(e)   
        return matched


    