import serial
import time
import threading
from aiohttp import web
import socketio
import asyncio
# import redis
import eventlet
# import aiohttp_cors

from flask import Flask, render_template

# r = redis.StrictRedis(host='localhost', port=6379, db=0)

# Async server setup
# mgr = socketio.KombuManager('redis://')
# mgr = socketio.RedisManager('redis://')
# mgr = socketio.AsyncRedisManager('redis://')
# external_sio = socketio.KombuManager('redis://', write_only=True)

# mgr = socketio.AsyncRedisManager('redis://', write_only=True)
# sio = socketio.AsyncServer(client_manager=mgr)

# sio = socketio.AsyncServer(client_manager=mgr)
sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)
# cors = aiohttp_cors.setup(app)


# sio = socketio.Server(client_manager=external_sio)

# @asyncio.coroutine
# def handler(request):
#     return web.Response(
#         text="Hello!",
#         headers={
#             "X-Custom-Server-Header": "Custom data",
# })


# `aiohttp_cors.setup` returns `aiohttp_cors.CorsConfig` instance.
# The `cors` instance will store CORS configuration for the
# application.
# cors = aiohttp_cors.setup(app)

# To enable CORS processing for specific route you need to add
# that route to the CORS configuration object and specify its
# CORS options.
# resource = cors.add(app.router.add_resource("/"))
# route = cors.add(
#     resource.add_route("GET", handler), {
#         "http://client.example.org": aiohttp_cors.ResourceOptions(
#             allow_credentials=True,
#             expose_headers=("X-Custom-Server-Header",
#                             "Access-Control-Allow-Origin"),
#             allow_headers=("X-Requested-With", "Content-Type"),
#             max_age=3600,
#         )
#     })

# sio = socketio.Server(async_mode='eventlet', client_manager=external_sio)
# app = Flask(__name__)


# @app.route('/')
# def index():
#     """Serve the client-side application."""
# return render_template('index.html')


# async def index(request):
#     """Serve the client-side application."""
#     with open('index.html') as f:
#         return web.Response(text=f.read(), content_type='text/html')


read_flag = True
sample_id_flag = False


@sio.on('connect')
async def connect(sid, environ):
    print("connect ", sid)
    print('I have a client!!')
    await sio.emit('hello', 'data')


@sio.on('update')
def message(sid, data):
    global read_flag
    print("message ", data)

    if(data == 'resume'):
        resume_scan()
    elif(data == 'pause'):
        pause_scan()
    elif(data == 'stop'):
        pause_scan()
        print('STOP')
        read_flag = False
        time.sleep(1)
        t.join()


@sio.on('request')
async def client_request(sid, data):
    print("message ", data)

    if(data == 'timestamp'):
        timestamp = str(round(time.time() - start_time, 2))
        await sio.emit('reply', timestamp)

    elif(data == 'scan-id'):
        scan_and_send_next_id()

    elif(data == 'stop'):
        pause_scan()
        print('STOP')
        read_flag = False
        time.sleep(1)
        t.join()


@sio.on('disconnect')
def disconnect(sid):
    print('disconnect ', sid)


# app.router.add_static('/static', 'static')
# app.router.add_get('/', index)

global_loop = asyncio.new_event_loop()
asyncio.set_event_loop(global_loop)


def startSocket():
    global sio
    global app
    web.run_app(app, host='127.0.0.1', port=3000)
    # wrap Flask application with socketio's middleware
    # app = socketio.Middleware(sio, app)
    # deploy as an eventlet WSGI server
    # eventlet.wsgi.server(eventlet.listen(('localhost', 3000)), app)


def scan_and_send_next_id():
    global sample_id_flag
    sample_id_flag = True


def reading_loop():
    # loop = asyncio.new_event_loop()
    # asyncio.set_event_loop(loop)
    while 1:
        print('in the loop')
        time.sleep(1)


ser = None
ports = ['/dev/ttyUSB0', '/dev/ttyUSB1']
for p in ports:
    ser = None
    try:
        ser = serial.Serial(p, 115200, timeout=1)  # open serial port
    except serial.serialutil.SerialException:
        print('Not at ' + p)
    if ser != None:
        # check which port was really used
        print("Connected to device at " + ser.name)
        break
# ser.write('hello\n'.encode())     # write a string

saved = {}
currently_scanning = {}
last_time_stamp = {}

start_time = round(time.time(), 2)
paused = False
resumed = False

time_to_recycle = 4
min_lap_time = 30
list_to_delete = []


def remove_keys(dic, keys):
    global last_time_stamp, currently_scanning
    for k in keys:
        last_time_stamp[k] = currently_scanning[k]
        del dic[k]
    return dic


def future_callback(result):
    print('got future callback')
    print(result)


def emit_from_read(name, data):
    # global sio
    global global_loop
    print('emit_from_read:' + name + '-' + data)
    asyncio.run_coroutine_threadsafe(sio.emit(name, data), global_loop)


def pause_scan():
    global sio  # external_sio

    if ser:
        print('** pausing **')
        cmd = b"\x89"
        ser.write(cmd)
        paused = True
        # await sio.emit('scanning', False)
    else:
        print('** no device to pause **')
    # emit_from_read('reply', 'hello')
    # external_sio.emit('reply', 'hello')

    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(sio.emit('reply', 'hello'))
    # eventloop.close()

    # sio.emit('result', 'hello')
    # print('got passed the emit')
    # print(ser.readline().decode("utf-8"))
    # print(ser.readline().decode("utf-8"))


def resume_scan():

    if ser:
        print('resuming')
        cmd = b"\x99"
        ser.write(cmd)
        paused = False
        # await sio.emit('scanning', True)

    else:
        print('* no device to resume *')
    # print(ser.readline().decode("utf-8"))
    # print(ser.readline().decode("utf-8"))
    # print(ser.readline().decode("utf-8"))
    # print(ser.readline().decode("utf-8"))


def find_closest_time(data_list):
    lowest_signal, lowest_time = None, None
    split_string, signal, timestamp = None, None, None
    for i in data_list:
        split_string = i.split(':')
        signal = split_string[0]
        timestamp = split_string[1]
        if lowest_signal == None:
            lowest_signal = signal
            lowest_time = timestamp
        else:
            if signal < lowest_signal:
                lowest_signal = signal
                lowest_time = timestamp
    return lowest_time


def send_result_time(id, timestamp):
    emit_from_read('result', id + ':' + str(timestamp))


def read_loop():
    global read_flag, saved, currently_scanning, list_to_delete, start_time, paused, resumed
    global sample_id_flag
    try:
        # this will store the line
        line = []
        while read_flag:
            line = "empty"
            if ser:
                try:
                    line = ser.readline().decode("utf-8").rstrip('\r\n').split(',')
                except serial.serialutil.SerialException:
                    print('*** SerialException ***')

                t = round(time.time(), 2)

                for i in currently_scanning:
                    if t - currently_scanning[i] > time_to_recycle:
                        print('done with iid:' + i)
                        print('data: ' + str(saved[i]))

                        ###
                        # TODO: Now do something with this data to estimate crossing time!
                        ###
                        # data: ['-56', '-56', '-53', '-52', '-50', '-50', '-50',
                        # '-50', '-50', '-50', '-50', '-50', '-50', '-52', '-54',
                        # '-56']
                        closest_time = find_closest_time(saved[i])
                        print('closest time: ' + str(closest_time))
                        # emit_from_read('result', i + ':' + str(timestamp))
                        send_result_time(i, closest_time)
                        # loop = asyncio.get_event_loop()
                        # loop.run_until_complete(send_result_time(i, closest_time))
                        # loop.close()

                        list_to_delete.append(i)

                if len(list_to_delete) > 0:
                    print('deleting: ' + str(list_to_delete))
                    currently_scanning = remove_keys(
                        currently_scanning, list_to_delete)
                    for id in list_to_delete:
                        saved[id] = []
                    list_to_delete = []

                if len(line) == 2:  # tag scan data from arduino
                    rssi = int(line[0].split(':')[1])
                    iid = line[1].split(':')[1].rstrip('\r\n')
                    timestamp = round(t - start_time, 2)
                    print('got id:' + str(iid) + ' rssi:' + str(rssi))

                    if sample_id_flag:
                        emit_from_read('scan-id', iid)
                        sample_id_flag = False

                    if iid not in last_time_stamp:
                        last_time_stamp[iid] = 0 - min_lap_time

                    if t - last_time_stamp[iid] < min_lap_time:
                        print('not greater than min lap time!')
                        print(t)
                        print(last_time_stamp[iid])
                        print(t - last_time_stamp[iid])
                    else:
                        if iid in saved:
                            saved[iid] = saved[iid] + \
                                [str(rssi) + ':' + str(timestamp)]
                        else:
                            saved[iid] = [str(rssi) + ':' + str(timestamp)]

                        currently_scanning[iid] = t
                        print(saved)
                        print(currently_scanning)

                else:
                    line = line[0]
                    # print('line:' + line)
                # printype(line))
                # print('got here at ' + str(t))
                # print('time:' + str(round(t - start_time, 2)))

                if t - start_time > 5 and not paused:
                    print('got here')
                    pause_scan()
                    paused = True

                elif t - start_time > 10 and not resumed:
                    # resume_scan()
                    resumed = True

                if('begin scanning' in line):
                    print('Starting to scan')
                    # gotime = input("Want to start scanning?")
                    start_time = time.time()

                    ser.write('hello\r\n'.encode())

            else:
                print('not connected to device')
                time.sleep(5)

            # for c in ser.read():
            #     print(c.encode())
            #     line.append(c)
            #     if c == '\n':
            #         print("Line: " + line)
            #         line = []
            #         break

    except KeyboardInterrupt:
        print('closing port')
        cmd = b"\x89"
        ser.write(cmd)
        print(ser.readline().decode("utf-8"))
        print(ser.readline().decode("utf-8"))
        print(ser.readline().decode("utf-8"))
        print(ser.readline().decode("utf-8"))
        print(ser.readline().decode("utf-8"))

        ser.close()    # close port


t = threading.Thread(target=read_loop)
# t2 = threading.Thread(target=startSocket)

try:
    t.start()
    # startSocket()

except KeyboardInterrupt:
    print("attempting to close threads")
    t.join()
    print("threads successfully closed")

startSocket()
