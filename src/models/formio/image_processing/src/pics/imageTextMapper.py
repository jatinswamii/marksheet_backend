
import psycopg2
import pandas as pd
import cv2
import easyocr
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

def aadhar(file,data):
    qrData = Qr_img_to_text(file)
    if (len(qrData)==0):
        image = cv2.cvtColor(cv2.imread(file), cv2.COLOR_BGR2RGB)
        qreader = QReader()
        qrData = qreader.detect_and_decode(image=image)
        if (qrData[0] is  None): qrData=[]
    if (len(qrData)>0):
        isSecureQR = (isSecureQr(qrData[0]))
        if isSecureQR:
            matched=[]
            secure_qr = AadhaarSecureQr(int(qrData[0]))
            rd = secure_qr.decodeddata()
            print(rd)
            for (k,v) in data.items():
                if (k in rd):
                    if (v.lower() in rd[k].lower()):
                        matched.append(k)        
            return matched
    return imageTextMapper(file,data)

def imageTextMapper(file,data):
    image = cv2.cvtColor(cv2.imread(file), cv2.COLOR_BGR2GRAY)
    ratio=image.shape[1]/image.shape[0]
    # if (image.shape[1] >700) :
    #     image=cv2.resize(image,(int(600*ratio),600))
    reader = easyocr.Reader(['en']) # this needs to run only once to load the model into memory
    result = reader.readtext(image)
    print(result)
    found=[]
    for k, v in data.items():
        for item in result:
            if (v.lower() in item[1].lower()): 
                found.append(k)
                break
    return found

def run():
    try:
        # conn = psycopg2.connect(database="upsc_db",
        #                     host="13.214.115.241",
        #                     user="upsc",
        #                     password="up$c@2023",
        #                     port="5432")
        
        # cursor = conn.cursor()
        # sql="select c.registrationid,candidate_name,father_name,mother_name,TO_CHAR(dob, 'DD-MM-YYYY') dob from cms.candidate_master c left join cms.candidate_photo_id_validations cp on (c.registrationid=cp.registrationid)  where COALESCE(c.photo_id_type,'')!='' and (cp.updated_at is null or cp.updated_at < c.updated_at)"
        # cursor.execute(sql)
        # rows = cursor.fetchone()
        # cols = [desc[0] for desc in cursor.description]
        
        #df = pd.DataFrame((rows) , columns=[cols])
        #print(cols,rows)
        # json_data = []
        # for row in rows:
        #     json_data.append(row)


        file="pics/sanjayaadhar.jpg"
        IDtype="aadhar"
        data={ 
            "name":"Sanjay Garg", 
            "dob":'05-02-1988', 
            "dob1":'26/08/1996', 
            "father":"sushil"
        }
        if (IDtype =="aadhar"):
            matched=aadhar(file,data)
        else:
            matched=imageTextMapper(file,data)

        print("Macthed",matched)
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    # finally:
    #     if conn is not None:
    #         conn.close()

if __name__ == '__main__':
    run()
    




