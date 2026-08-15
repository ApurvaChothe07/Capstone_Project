import socket
import sys

UDP_IP = "127.0.0.1"
UDP_PORT = 1234


def send_command(command):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.sendto(command.encode(), (UDP_IP, UDP_PORT))
    sock.close()


if len(sys.argv) != 3:
    print("Usage: python start_recording.py <candidate_id> <question>")
    sys.exit(1)

candidate_id = sys.argv[1]
question = sys.argv[2]

command = f"c|{candidate_id}|{question}"

print("Starting Tobii recording...")
print("Candidate ID:", candidate_id)
print("Question:", question)

send_command(command)

print("Recording command sent successfully.")