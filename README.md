A voice-enabled web application that allows users to search for products, add them to a shopping list, and proceed to checkout—all through voice commands.



🚀 Features

Voice Search: Utilize speech recognition to search for products.

Product Recommendations: Get suggestions based on your voice queries.

Shopping List Management: Add items to your shopping list seamlessly.

Checkout Flow: Proceed to checkout with a simple voice command.

🧪 Technologies Used

Backend: Flask (Python 3.13.4)

Voice Recognition: Integrated with browser-based speech recognition APIs

Deployment: Render (Free Tier)

Version Control: Git, GitHub

📦 Setup & Installation
1. Clone the Repository
git clone https://github.com/anushka04-j/Voice-Shopping-Assistant.git
cd Voice-Shopping-Assistant

2. Install Dependencies

Ensure you have Python 3.13.4 installed. Then, install the required packages:

pip install -r requirements.txt

3. Run the Application Locally

Start the Flask development server:

python app.py


Access the app at http://127.0.0.1:5000 in your browser.

🌐 Deployment on Render

The application is deployed on Render, a cloud platform for hosting web services.

Live URL: https://voice-shopping-assistant-39qm.onrender.com

Service ID: srv-d2qc0v7diees73cr5tog

Environment: Python 3.13.4

Web Server: Gunicorn (via python app.py)

Note: The free instance may experience delays due to inactivity.

🛠️ Development Notes

Flask Configuration: The app uses Flask's built-in development server. For production, consider using Gunicorn or another WSGI server.

Voice Recognition: Utilizes the browser's speech recognition capabilities. Ensure microphone permissions are granted.

Port Binding: For deployment, ensure the app binds to 0.0.0.0 to be accessible externally.
