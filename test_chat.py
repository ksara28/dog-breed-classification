import time
import requests
for i in range(12):
    try:
        r = requests.post('http://127.0.0.1:5001/chat', json={'question':'Are you up on 5001?'}, timeout=10)
        print('status', r.status_code)
        print(r.text)
        break
    except Exception as e:
        print('try', i, 'failed', repr(e))
        time.sleep(1)
else:
    print('all attempts failed')
