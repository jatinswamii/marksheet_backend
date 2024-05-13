
import sys
from pathlib import Path
from ast import literal_eval
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import idOcr 


enums ={
    "1":"aadhar",
    "2":"dl",
    "3":"pan",
    "4":"passport",
    "5":"cgovt",
    "6":"voterid"
}

def run(service,basepath,data):
    resp=[]
    resp=matchText(data)
    return resp
        

def matchText(data):
  
    if (len(data)==0): return
    basepath=Path('uploads').absolute()
    
    ocr= idOcr.scan(basepath)
    resp={}
    try:
        for key,row in data[0].items():
            idtype=row['photo_id_type']
            photo_id=f"{basepath}/{str(key)[:2]}/{key}/{row['photo_id']}"
            del row['photo_id']
            del row['photo_id_type']
            rc={}
            print(row)
            if (str(idtype)=='1'):
                rc=ocr.aadhar(photo_id,row) 
            else:
                rc=ocr.imageTextMapper(photo_id,row) 
            if len(rc) > 0:
                rc ={k:v for k, v in rc.items() if isinstance(v, int)==False or v >50}
            resp[key] = rc
    except Exception as e:
        e=1
        #print(e)
    return resp


def dbrun():
    try:
        conn = psycopg2.connect(database="upsc_db",
                            host="13.214.115.241",
                            user="upsc",
                            password="up$c@2023",
                            port="5432")
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        fetch_all_as_dict = lambda cursor: [dict(row) for row in cursor]
        sql="select c.registrationid,candidate_name,father_name,mother_name,TO_CHAR(c.dob, 'DD-MM-YYYY') dob,TO_CHAR(c.dob, 'DD/MM/YYYY') dob1,c.gender,profilephoto,photo_id_type,photo_id,changed_name,namechange_cert,dob_cert from cms.candidate_master c left join cms.candidate_photo_id_validations cp on (c.registrationid=cp.registrationid)  where COALESCE(c.photo_id_type,'')!='' and COALESCE(c.photo_id,'')!='' and (cp.updated_at is null or cp.updated_at < c.updated_at) and c.registrationid='231000000000397' limit 10"
        cur.execute(sql)
        rows=fetch_all_as_dict(cur)
        print("rows")
        print(rows)
        fieldsToMatch=["candidate_name","father_name","mother_name","dob","photo_id","photo_id_type"]
        toMatchedRows = []
        for row in rows:
            _row={key: row[key] for key in fieldsToMatch}
            toMatchedRows.append({row['registrationid']:_row})
        if (len(toMatchedRows)==0): return
        print(toMatchedRows)
        resp=matchText(toMatchedRows)
        fields=["candidate_name_score","father_name_score","mother_name_score","dob_score","gender"]
        setfields=[]
        for f in fields:
            setfields.append(f"{f} = excluded.{f}")
        setfields=",".join(setfields)
        allvalues=[]
        for key,row in resp.items():
            if (len(row)==0): continue
            values=[str(key)]
            for f in fields:
                if f in row:
                    values.append(str(row[f]))
                else: values.append("0")
            values="','".join(values)
            allvalues.append(f"('{values}')")
        if (len(allvalues) >0):
            allvalues=",".join(allvalues)
            sql=f"insert into cms.candidate_photo_id_validations (registrationid,{','.join(fields)}) values {allvalues} ON CONFLICT (registrationid) DO UPDATE SET {setfields}"
            #print(sql)
            cur.execute(sql)
            conn.commit()
        return resp
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            cur.close()
            conn.close()

if __name__ == '__main__':
    if (len(sys.argv) > 0) :
        try:
            rc=dbrun()
            rc=json.dumps({"result":rc})
            print(rc)
        except Exception as e:
            print(e)
    else:
        print("Arguments service plus data json string")
    
    #run()
    




