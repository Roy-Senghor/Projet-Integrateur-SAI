# Shared state for MQTT data
actuator_states = {
    "pompe": {"commande": False, "timestamp": None},
    "ventilateur": {"commande": False, "timestamp": None},
    "lampe": {"commande": False, "timestamp": None},
}
