import os
import resend
from dotenv import load_dotenv

load_dotenv()

def test_send():
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("SMTP_FROM", "onboarding@resend.dev")
    
    # NOTE: You must change this to your verified email or the one you signed up with
    to_email = "shreyashmishra700@gmail.com"
    
    if not api_key:
        print("ERROR: RESEND_API_KEY not found in .env")
        return

    print(f"Attempting to send test email from {from_email}...")
    
    try:
        resend.api_key = api_key
        result = resend.Emails.send({
            "from": f"HackStorm AI Test <{from_email}>",
            "to": [to_email],
            "subject": "Resend Connectivity Test",
            "html": "<h1>It works!</h1><p>Your Resend configuration is correct.</p>"
        })
        print("SUCCESS! Email sent.")
        print(f"Resend Response ID: {result.get('id')}")
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == "__main__":
    # Check if user updated the test script
    test_send()
