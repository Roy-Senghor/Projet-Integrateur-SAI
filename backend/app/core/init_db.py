from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.user       import User, RoleEnum
from app.models.capteur    import Capteur, TypeCapteurEnum
from app.models.actionneur import Actionneur, TypeActionneurEnum
from app.models.seuil      import Seuil
from app.models.mesure     import Mesure   # noqa
from app.models.action     import Action   # noqa
from app.models.alerte     import Alerte   # noqa
from app.models.audit      import Audit    # noqa
 
 
def create_tables():
    print("Création des tables...")
    Base.metadata.create_all(bind=engine)
    print("  Tables créées.")
 
 
def seed_users(db):
    if db.query(User).count() > 0:
        print("  Utilisateurs déjà présents.")
        return
    users = [
        User(nom="Admin",    prenom="System",  email="admin@agriculture.local",    mot_de_passe=hash_password("Admin1234!"),   role=RoleEnum.admin),
        User(nom="Operateur",prenom="Test",    email="operateur@agriculture.local", mot_de_passe=hash_password("Oper1234!"),    role=RoleEnum.operateur),
        User(nom="Viewer",   prenom="Test",    email="viewer@agriculture.local",    mot_de_passe=hash_password("View1234!"),    role=RoleEnum.consultation),
    ]
    db.add_all(users)
    db.commit()
    print("  3 utilisateurs créés.")
 
 
def seed_capteurs(db):
    if db.query(Capteur).count() > 0:
        print("  Capteurs déjà présents.")
        return
    capteurs = [
        Capteur(nom="YL-69",   type=TypeCapteurEnum.humidite_sol, unite_mesure="%"),
        Capteur(nom="DHT22-T", type=TypeCapteurEnum.temperature,  unite_mesure="°C"),
        Capteur(nom="DHT22-H", type=TypeCapteurEnum.humidite_sol, unite_mesure="%"),
        Capteur(nom="BH1750",  type=TypeCapteurEnum.luminosite,   unite_mesure="lux"),
        Capteur(nom="SEN0159", type=TypeCapteurEnum.co2,          unite_mesure="ppm"),
        Capteur(nom="WTR-01",  type=TypeCapteurEnum.niveau_eau,   unite_mesure="%"),
    ]
    db.add_all(capteurs)
    db.commit()
    print("  6 capteurs créés.")
 
 
def seed_actionneurs(db):
    if db.query(Actionneur).count() > 0:
        print("  Actionneurs déjà présents.")
        return
    actionneurs = [
        Actionneur(nom="Pompe principale",  type=TypeActionneurEnum.pompe),
        Actionneur(nom="Ventilateur serre", type=TypeActionneurEnum.ventilateur),
        Actionneur(nom="Éclairage LED",     type=TypeActionneurEnum.led),
    ]
    db.add_all(actionneurs)
    db.commit()
    print("  3 actionneurs créés.")
 
 
def seed_seuils(db):
    if db.query(Seuil).count() > 0:
        print("  Seuils déjà présents.")
        return
    capteurs = db.query(Capteur).all()
    seuils_data = {
        TypeCapteurEnum.humidite_sol: (20.0,  90.0),
        TypeCapteurEnum.temperature:  (10.0,  40.0),
        TypeCapteurEnum.luminosite:   (200.0, None),
        TypeCapteurEnum.co2:          (None,  1500.0),
        TypeCapteurEnum.niveau_eau:   (10.0,  None),
    }
    for capteur in capteurs:
        bornes = seuils_data.get(capteur.type)
        if bornes:
            db.add(Seuil(valeur_min=bornes[0], valeur_max=bornes[1], id_capteur=capteur.id))
    db.commit()
    print("  Seuils insérés.")
 
 
def main():
    create_tables()
    db = SessionLocal()
    try:
        seed_users(db)
        seed_capteurs(db)
        seed_actionneurs(db)
        seed_seuils(db)
        print("Base de données prête ✓")
        print("  admin@agriculture.local     / Admin1234!")
        print("  operateur@agriculture.local / Oper1234!")
        print("  viewer@agriculture.local    / View1234!")
    finally:
        db.close()
 
 
if __name__ == "__main__":      
    main()