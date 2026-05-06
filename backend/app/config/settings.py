import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    PROJECT_TITLE: str = "AutoProof Check IA - Enterprise Backend"
    REPORTS_DIR: str = "reports"
    IS_AI_ACTIVE: bool = False
    MODEL = None

    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "465"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASS: str = os.getenv("SMTP_PASS", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "false").lower() in ["1", "true", "yes"]
    SMTP_USE_SSL: bool = os.getenv("SMTP_USE_SSL", "true").lower() in ["1", "true", "yes"]
    SEND_EMAILS: bool = True

    @classmethod
    def init_ai(cls):
        try:
            import vertexai
            from vertexai.generative_models import GenerativeModel
            vertexai.init()
            cls.MODEL = GenerativeModel("gemini-1.5-flash")
            cls.IS_AI_ACTIVE = True
            print("Vertex AI Active (Direct Authentication)")
        except Exception as e:
            print(f"Vertex AI Initialization Failed: {str(e)}")
            try:
                import google.generativeai as genai
                GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
                if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
                    genai.configure(api_key=GEMINI_API_KEY)
                    cls.MODEL = genai.GenerativeModel('gemini-flash-latest')
                    cls.IS_AI_ACTIVE = True
                    print("Gemini AI Active (API Key Fallback)")
            except Exception as e2:
                print(f"Simulation Mode Active: {str(e2)}")

settings = Settings()
settings.init_ai()
