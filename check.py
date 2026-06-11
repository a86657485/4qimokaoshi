import json, urllib.request
base = "http://10.9.129.17:3000"
data = json.dumps({"name":"test","className":"四(1)班"}).encode()
req = urllib.request.Request(base+"/api/login",data=data,headers={"Content-Type":"application/json"})
r = json.loads(urllib.request.urlopen(req,timeout=5).read())
print("Login OK:",r["success"])
print("Student:",r["student"]["name"])
print("Session:",r["sessionId"])
