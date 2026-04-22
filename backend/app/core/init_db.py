from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.user import User, RoleEnum
from app.models.mesure import Mesure        # noqa
from app.models.action import Action        # noqa
from app.models.alerte import Alerte        # noqa
from app.models.seuil_config import SeuilConfig
 
 
def create_tables():
    print("Création des tables...")
    Base.metadata.create_all(bind=engine)
    print("  Tables créées.")
 
 
def seed_seuils(db):
    if db.query(SeuilConfig).count() > 0:
        print("  Seuils déjà présents.")
        return
    seuils = [
        SeuilConfig(type_mesure="humidite_sol",  valeur_min=20.0,  valeur_max=90.0,   unite="%"),
        SeuilConfig(type_mesure="temperature",   valeur_min=10.0,  valeur_max=40.0,   unite="°C"),
        SeuilConfig(type_mesure="humidite_air",  valeur_min=30.0,  valeur_max=85.0,   unite="%"),
        SeuilConfig(type_mesure="co2",           valeur_min=None,  valeur_max=1500.0, unite="ppm"),
        SeuilConfig(type_mesure="luminosite",    valeur_min=200.0, valeur_max=None,   unite="lux"),
        SeuilConfig(type_mesure="niveau_eau",    valeur_min=10.0,  valeur_max=None,   unite="%"),
    ]
    db.add_all(seuils)
    db.commit()
    print(f"  {len(seuils)} seuils insérés.")
 
 
def seed_admin(db):
    if db.query(User).count() > 0:
        print("  Utilisateurs déjà présents.")
        return
    admin = User(
        nom="Administrateur",
        email="admin@agriculture.local",
        password=hash_password("Admin1234!"),
        role=RoleEnum.admin,
    )
    db.add(admin)
    db.commit()
    print("  Admin créé — email: admin@agriculture.local / mdp: Admin1234!")
 
 
def main():
    create_tables()
    db = SessionLocal()
    try:
        seed_seuils(db)
        seed_admin(db)
        print("\nBase de données prête ✓")
    finally:
        db.close()
 
 
if __name__ == "__main__":
    main()