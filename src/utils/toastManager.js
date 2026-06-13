let toastRef;

export const setToastRef = (ref) => {
  toastRef = ref;
};

export const showToast = (message, type = 'info') => {
  if (toastRef) {
    // Nettoyage des messages techniques Firebase pour l'utilisateur
    let userMessage = message;
    if (message.includes('requires an index')) {
      userMessage = "Optimisation de la base de données en cours... Réessayez dans une minute.";
    } else if (message.includes('network-request-failed')) {
      userMessage = "Problème de connexion réseau.";
    } else if (message.includes('User not found')) {
      userMessage = "Utilisateur introuvable.";
    }

    toastRef.show(userMessage, type);
  } else {
    console.warn('Toast ref is not set');
  }
};

export default { showToast, setToastRef };
