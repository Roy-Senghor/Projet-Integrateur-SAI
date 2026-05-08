from pydantic_settings import BaseSettings
from typing import Optional
 
 
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883
    MQTT_TOPIC: str = "agriculture/#"
    APP_NAME: str = "Agriculture Intelligente API"
    DEBUG: bool = True
    
    # Email settings
    GMAIL_ADDRESS: Optional[str] = None
    GMAIL_APP_PASSWORD: Optional[str] = None
    ALERT_RECIPIENT: Optional[str] = None

    class Config:
        env_file = ".env"
 
 
settings = Settings()