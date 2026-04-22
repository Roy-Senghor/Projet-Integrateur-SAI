from pydantic_settings import BaseSettings
 
 
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
 
    class Config:
        env_file = ".env"
 
 
settings = Settings()