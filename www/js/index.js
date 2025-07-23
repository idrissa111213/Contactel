// Variables globales
let currentContact = null;
let allContacts = [];
let isEditMode = false;
let isAppReady = false;

// Configuration jQuery Mobile AVANT l'initialisation
$(document).bind('mobileinit', function() {
    $.mobile.defaultPageTransition = 'slide';
    $.mobile.defaultDialogTransition = 'pop';
    $.mobile.phonegapNavigationEnabled = true;
    $.mobile.hashListeningEnabled = false;
});

// Initialisation de l'application
document.addEventListener("deviceready", function() {
    console.log("Device ready - Chargement des contacts...");
    isAppReady = true;
    initializeApp();
}, false);

// Pour le test dans le navigateur (sans Cordova)
$(document).ready(function() {
    // Attendre que jQuery Mobile soit initialisé
    setTimeout(function() {
        if (!window.cordova && !isAppReady) {
            console.log("Mode test navigateur - Simulation des contacts");
            isAppReady = true;
            initializeApp();
        }
    }, 1000);
});

/**
 * Initialise l'application une fois que tout est prêt
 */
function initializeApp() {
    console.log("Initialisation de l'application...");
    showDebugInfo("Application initialisée - Chargement des contacts...");
    
    if (navigator.contacts) {
        loadContacts();
    } else {
        console.log("API Contacts non disponible - Mode simulation");
        simulateContacts();
    }
}

/**
 * Charge les contacts depuis l'appareil
 */
function loadContacts() {
    showDebugInfo("Tentative de chargement des contacts...");
    
    if (!navigator.contacts) {
        console.error("API Contacts non disponible");
        showDebugInfo("API Contacts non disponible. Basculement en mode simulation.");
        simulateContacts();
        return;
    }

    try {
        const options = new ContactFindOptions();
        options.multiple = true;
        options.hasPhoneNumber = false; // Changé à false pour récupérer TOUS les contacts
        
        const fields = ["displayName", "name", "phoneNumbers", "emails"];
        
        showDebugInfo("Recherche en cours...");
        navigator.contacts.find(fields, 
            function(contacts) {
                console.log("Contacts trouvés:", contacts.length);
                showContacts(contacts);
            }, 
            function(error) {
                console.error("Erreur lors du chargement:", error);
                showDebugInfo("Erreur de chargement - Basculement en mode simulation");
                simulateContacts();
            }, 
            options
        );
    } catch (error) {
        console.error("Exception lors du chargement des contacts:", error);
        showDebugInfo("Exception capturée - Mode simulation activé");
        simulateContacts();
    }
}

/**
 * Simule des contacts pour les tests en mode navigateur
 */
function simulateContacts() {
    const demoContacts = [
        {
            id: "1",
            displayName: "Jean Dupont",
            name: { givenName: "Jean", familyName: "Dupont" },
            phoneNumbers: [{ value: "+33 6 12 34 56 78", type: "mobile" }],
            emails: [{ value: "jean.dupont@email.com", type: "home" }]
        },
        {
            id: "2",
            displayName: "Marie Martin",
            name: { givenName: "Marie", familyName: "Martin" },
            phoneNumbers: [{ value: "+33 6 98 76 54 32", type: "mobile" }],
            emails: [{ value: "marie.martin@email.com", type: "work" }]
        },
        {
            id: "3",
            displayName: "Pierre Durand",
            name: { givenName: "Pierre", familyName: "Durand" },
            phoneNumbers: [{ value: "+33 6 11 22 33 44", type: "mobile" }]
        },
        {
            id: "4",
            displayName: "Sophie Leroy",
            name: { givenName: "Sophie", familyName: "Leroy" },
            phoneNumbers: [{ value: "+33 6 55 66 77 88", type: "mobile" }],
            emails: [{ value: "sophie.leroy@email.com", type: "home" }]
        },
        {
            id: "5",
            displayName: "Michel Blanc",
            name: { givenName: "Michel", familyName: "Blanc" },
            phoneNumbers: [{ value: "+33 6 99 88 77 66", type: "mobile" }]
        }
    ];
    showContacts(demoContacts);
}

/**
 * Affiche la liste des contacts dans l'interface
 * @param {Array} contacts - Liste des contacts à afficher
 */
function showContacts(contacts) {
    console.log("Affichage de", contacts.length, "contacts");
    allContacts = contacts;
    
    // Cacher les infos de debug après succès
    setTimeout(() => $("#debugInfo").fadeOut(), 2000);
    
    if (contacts.length === 0) {
        $("#noContacts").show();
        $("#contactList").hide().empty();
        return;
    }
    
    $("#noContacts").hide();
    $("#contactList").show();
    
    // Trier les contacts par nom
    contacts.sort((a, b) => {
        const nameA = getContactName(a).toLowerCase();
        const nameB = getContactName(b).toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    // Construire le HTML de la liste
    let html = "";
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const name = getContactName(contact);
        const number = getContactPhone(contact);
        
        html += `
            <li data-contact-index="${i}">
                <a href="#detailPage" onclick='showContactDetail(${i}); return false;'>
                    <h2>${name}</h2>
                    <p>${number}</p>
                </a>
            </li>
        `;
    }
    
    $("#contactList").html(html);
    
    // Rafraîchir la listview si elle existe déjà
    try {
        $("#contactList").listview("refresh");
    } catch (e) {
        // Si la listview n'est pas encore initialisée, l'initialiser
        $("#contactList").trigger("create");
    }
    
    console.log("Liste des contacts mise à jour avec", contacts.length, "éléments");
}

/**
 * Affiche les détails d'un contact
 * @param {number} index - Index du contact dans la liste
 */
function showContactDetail(index) {
    currentContact = allContacts[index];
    const name = getContactName(currentContact);
    const phone = getContactPhone(currentContact);
    const email = getContactEmail(currentContact);
    
    let detailHtml = `
        <h2>${name}</h2>
        <p><strong>Téléphone :</strong> ${phone}</p>
    `;
    
    if (email) {
        detailHtml += `<p><strong>Email :</strong> ${email}</p>`;
    }
    
    if (currentContact.id) {
        detailHtml += `<p><small>ID : ${currentContact.id}</small></p>`;
    }
    
    $("#contactDetail").html(detailHtml);
}

/**
 * Prépare l'interface pour créer un nouveau contact
 */
function newContact() {
    currentContact = null;
    isEditMode = false;
    $("#formTitle").text("Nouveau Contact");
    clearForm();
}

/**
 * Prépare l'interface pour modifier le contact actuel
 */
function editCurrentContact() {
    if (!currentContact) return;
    
    isEditMode = true;
    $("#formTitle").text("Modifier Contact");
    
    // Remplir le formulaire avec les données existantes
    $("#contactId").val(currentContact.id || "");
    $("#name").val(getContactName(currentContact));
    $("#phone").val(getContactPhone(currentContact));
    $("#email").val(getContactEmail(currentContact));
    
    $.mobile.changePage("#formPage");
}

/**
 * Retourne à la liste des contacts
 */
function backToList() {
    currentContact = null;
    $.mobile.changePage("#pageContacts");
}

/**
 * Annule l'édition et retourne à la page précédente
 */
function cancelForm() {
    if (currentContact) {
        $.mobile.changePage("#detailPage");
    } else {
        $.mobile.changePage("#pageContacts");
    }
}

/**
 * Vide le formulaire de contact
 */
function clearForm() {
    $("#contactForm")[0].reset();
    $("#contactId").val("");
}

/**
 * Initie un appel téléphonique vers le contact actuel
 */
function callContact() {
    if (currentContact) {
        const phone = getContactPhone(currentContact);
        if (phone && phone !== "Pas de téléphone") {
            window.open(`tel:${phone}`);
        } else {
            alert("Aucun numéro de téléphone disponible pour ce contact.");
        }
    }
}

/**
 * Supprime le contact actuel après confirmation
 */
function deleteCurrentContact() {
    if (!currentContact) return;
    
    const contactName = getContactName(currentContact);
    if (confirm(`Êtes-vous sûr de vouloir supprimer le contact "${contactName}" ?`)) {
        if (navigator.contacts && currentContact.remove) {
            // Suppression via l'API Cordova
            currentContact.remove(
                function() {
                    alert("Contact supprimé !");
                    $.mobile.changePage("#pageContacts");
                    loadContacts();
                },
                onContactError
            );
        } else {
            // Mode simulation - suppression de la liste locale
            allContacts = allContacts.filter(c => c.id !== currentContact.id);
            alert("Contact supprimé !");
            $.mobile.changePage("#pageContacts");
            showContacts(allContacts);
        }
    }
}

/**
 * Crée un nouveau contact
 * @param {string} name - Nom du contact
 * @param {string} phone - Numéro de téléphone
 * @param {string} email - Adresse email (optionnel)
 */
function createContact(name, phone, email) {
    try {
        const contact = navigator.contacts.create();
        contact.displayName = name;
        
        const nameParts = name.split(' ');
        contact.name = {
            givenName: nameParts[0],
            familyName: nameParts.slice(1).join(' ')
        };
        
        contact.phoneNumbers = [new ContactField("mobile", phone, true)];
        
        if (email) {
            contact.emails = [new ContactField("home", email, false)];
        }
        
        contact.save(
            function(savedContact) {
                console.log("Contact créé avec succès:", savedContact);
                $("#saveBtn").prop('disabled', false).text('Enregistrer');
                alert("Contact ajouté avec succès !");
                $.mobile.changePage("#pageContacts");
                // Recharger tous les contacts
                setTimeout(() => {
                    if (navigator.contacts) {
                        loadContacts();
                    } else {
                        // En mode simulation, ajouter à la liste existante
                        allContacts.push(savedContact);
                        showContacts(allContacts);
                    }
                }, 500);
            },
            function(error) {
                console.error("Erreur création contact:", error);
                $("#saveBtn").prop('disabled', false).text('Enregistrer');
                onContactError(error);
            }
        );
    } catch (error) {
        console.error("Exception création contact:", error);
        $("#saveBtn").prop('disabled', false).text('Enregistrer');
        // Fallback en mode simulation
        saveContactSimulation(name, phone, email);
    }
}

/**
 * Met à jour un contact existant
 * @param {Object} contact - Contact à mettre à jour
 * @param {string} name - Nouveau nom
 * @param {string} phone - Nouveau numéro de téléphone
 * @param {string} email - Nouvelle adresse email
 */
function updateContact(contact, name, phone, email) {
    contact.displayName = name;
    
    const nameParts = name.split(' ');
    contact.name = {
        givenName: nameParts[0],
        familyName: nameParts.slice(1).join(' ')
    };
    
    contact.phoneNumbers = [new ContactField("mobile", phone, true)];
    
    if (email) {
        contact.emails = [new ContactField("home", email, false)];
    } else {
        contact.emails = [];
    }
    
    contact.save(
        function() {
            alert("Contact mis à jour !");
            $.mobile.changePage("#detailPage");
            loadContacts();
        },
        onContactError
    );
}

// === FONCTIONS UTILITAIRES ===

/**
 * Extrait le nom d'affichage d'un contact
 * @param {Object} contact - Objet contact
 * @returns {string} Nom du contact
 */
function getContactName(contact) {
    return contact.displayName || 
           (contact.name && contact.name.formatted) || 
           (contact.name && `${contact.name.givenName || ''} ${contact.name.familyName || ''}`.trim()) ||
           "Sans nom";
}

/**
 * Extrait le numéro de téléphone principal d'un contact
 * @param {Object} contact - Objet contact
 * @returns {string} Numéro de téléphone
 */
function getContactPhone(contact) {
    return (contact.phoneNumbers && contact.phoneNumbers[0] && contact.phoneNumbers[0].value) || "Pas de téléphone";
}

/**
 * Extrait l'adresse email principale d'un contact
 * @param {Object} contact - Objet contact
 * @returns {string} Adresse email
 */
function getContactEmail(contact) {
    return (contact.emails && contact.emails[0] && contact.emails[0].value) || "";
}

/**
 * Affiche des informations de debug
 * @param {string} message - Message à afficher
 */
function showDebugInfo(message) {
    $("#debugInfo").html(`<strong>Debug :</strong> ${message}`).show();
    console.log("Debug:", message);
}

/**
 * Gestionnaire d'erreurs pour les opérations sur les contacts
 * @param {Object} error - Objet erreur
 */
function onContactError(error) {
    console.error("Erreur contact:", error);
    showDebugInfo(`Erreur : ${error.code} - ${error.message || 'Erreur inconnue'}`);
    
    // Messages d'erreur spécifiques
    switch (error.code) {
        case 20:
            showDebugInfo("Permission refusée. Vérifiez les autorisations de l'application pour accéder aux contacts.");
            break;
        case 1:
            showDebugInfo("Erreur inconnue lors de l'opération sur les contacts.");
            break;
        case 2:
            showDebugInfo("Argument invalide fourni à l'API contacts.");
            break;
        case 3:
            showDebugInfo("Opération annulée par l'utilisateur.");
            break;
        default:
            showDebugInfo(`Erreur inattendue : ${error.code}`);
    }
}

// === GESTIONNAIRES D'ÉVÉNEMENTS ===

// Gestionnaire de soumission du formulaire
$(document).on('submit', '#contactForm', function(e) {
    e.preventDefault();
    
    console.log("Soumission du formulaire");
    
    const name = $("#name").val().trim();
    const phone = $("#phone").val().trim();
    const email = $("#email").val().trim();
    const id = $("#contactId").val();
    
    // Validation des champs obligatoires
    if (!name || !phone) {
        alert("Veuillez remplir au minimum le nom et le téléphone.");
        return false;
    }
    
    // Validation du format de l'email si fourni
    if (email && !isValidEmail(email)) {
        alert("Veuillez entrer une adresse email valide.");
        return false;
    }
    
    // Désactiver le bouton de soumission pour éviter les doubles soumissions
    $("#saveBtn").prop('disabled', true).text('Enregistrement...');
    
    if (navigator.contacts && window.ContactField) {
        // Mode Cordova - utilisation de l'API native
        try {
            if (id && currentContact && currentContact.save) {
                updateContact(currentContact, name, phone, email);
            } else {
                createContact(name, phone, email);
            }
        } catch (error) {
            console.error("Erreur API Cordova:", error);
            saveContactSimulation(name, phone, email, id);
        }
    } else {
        // Mode simulation pour les tests
        console.log("Mode simulation - sauvegarde locale");
        saveContactSimulation(name, phone, email, id);
    }
    
    return false;
});

/**
 * Sauvegarde un contact en mode simulation
 */
function saveContactSimulation(name, phone, email, id) {
    try {
        if (id && currentContact) {
            // Modification
            const index = allContacts.findIndex(c => c.id === currentContact.id);
            if (index !== -1) {
                allContacts[index].displayName = name;
                allContacts[index].name = { 
                    givenName: name.split(' ')[0], 
                    familyName: name.split(' ').slice(1).join(' ') 
                };
                allContacts[index].phoneNumbers = [{ value: phone, type: "mobile" }];
                if (email) {
                    allContacts[index].emails = [{ value: email, type: "home" }];
                } else {
                    allContacts[index].emails = [];
                }
                currentContact = allContacts[index];
            }
            alert("Contact modifié avec succès !");
            $.mobile.changePage("#detailPage");
        } else {
            // Création
            const newContact = {
                id: Date.now().toString(),
                displayName: name,
                name: { 
                    givenName: name.split(' ')[0], 
                    familyName: name.split(' ').slice(1).join(' ') 
                },
                phoneNumbers: [{ value: phone, type: "mobile" }],
                emails: email ? [{ value: email, type: "home" }] : []
            };
            allContacts.push(newContact);
            alert("Contact ajouté avec succès !");
            $.mobile.changePage("#pageContacts");
        }
        
        // Mettre à jour l'affichage
        showContacts(allContacts);
        
    } catch (error) {
        console.error("Erreur simulation:", error);
        alert("Erreur lors de la sauvegarde : " + error.message);
    } finally {
        // Réactiver le bouton
        $("#saveBtn").prop('disabled', false).text('Enregistrer');
    }
}

/**
 * Valide le format d'une adresse email
 * @param {string} email - Adresse email à valider
 * @returns {boolean} True si l'email est valide
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// === GESTIONNAIRES D'ÉVÉNEMENTS DE PAGE ===

// Avant d'afficher la page formulaire
$(document).on("pagebeforeshow", "#formPage", function() {
    if (!isEditMode && !currentContact) {
        clearForm();
    }
    // Réactiver le bouton au cas où
    $("#saveBtn").prop('disabled', false).text('Enregistrer');
});

// Avant d'afficher la page de liste des contacts
$(document).on("pagebeforeshow", "#pageContacts", function() {
    console.log("Affichage page contacts, nombre de contacts:", allContacts.length);
    // Actualiser la liste si elle est vide et que l'app est prête
    if (allContacts.length === 0 && isAppReady) {
        console.log("Liste vide, rechargement...");
        if (navigator.contacts) {
            loadContacts();
        } else {
            simulateContacts();
        }
    }
});

// Avant d'afficher la page de détail
$(document).on("pagebeforeshow", "#detailPage", function() {
    // S'assurer qu'un contact est sélectionné
    if (!currentContact) {
        console.log("Aucun contact sélectionné, retour à la liste");
        $.mobile.changePage("#pageContacts");
        return false;
    }
    // Mettre à jour l'affichage du détail
    showContactDetail(allContacts.indexOf(currentContact));
});

// Événement de changement de page
$(document).on("pagechange", function(event, data) {
    console.log("Changement de page vers:", data.toPage.attr('id'));
});

// Gestion du bouton retour physique (Android)
$(document).on("backbutton", function() {
    const activePage = $.mobile.activePage.attr('id');
    
    switch (activePage) {
        case 'detailPage':
            backToList();
            break;
        case 'formPage':
            cancelForm();
            break;
        case 'pageContacts':
        default:
            // Quitter l'application
            if (navigator.app && navigator.app.exitApp) {
                navigator.app.exitApp();
            }
            break;
    }
});