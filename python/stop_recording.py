import socket

UDP_IP = "127.0.0.1"
UDP_PORT = 1234

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

sock.sendto(
    b's',
    (UDP_IP, UDP_PORT)
)

sock.close()

print("Recording Stopped")