# app.py
from flask import Flask, request, Response
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

user_messages = []

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    user_message = request.json.get('message')
    user_messages.append(user_message)
    return {'status': 'Message received'}

@app.route('/api/chatbot/stream', methods=['GET'])
def stream():
    def generate_responses():
        while user_messages:
            user_message = user_messages.pop(0)
            responses = [
                f" Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since  of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. This is a response to: {user_message}"
                
            ]
            for response in responses:
                for word in response.split():
                    print(word)
                    yield f"data: {word}\n\n"
                    time.sleep(0.15)  # Simulate typing delay
    return Response(generate_responses(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)
