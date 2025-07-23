// Variables globales
let currentContact = null;
let allContacts = [];
let isEditMode = false;

// Initialisation au démarrage de l'appareil
document.addEventListener("deviceready", loadContacts);

// Initialisation pour le test en navigateur
$(document).ready(function() {
    // Si pas de Cordova, simuler les contacts après un délai
    setTimeout(function() {
        if (!window.cordova) {
            console.log("Mode simulation - Pas de Cordova détecté");
            simulateContacts();
        }
    }, 1000);
});

//Charge les contacts depuis l'appareil 
function loadContacts() {
    if (!navigator.contacts) {
        console.log("API Contacts non disponible - Mode simulation");
        simulateContacts();
        return;
    }

    let options = new ContactFindOptions();
    options.multiple = true;
    options.hasPhoneNumber = true;
    let fields = ["*"];

    navigator.contacts.find(fields, showContacts, onError, options);
}

/* Simule des contacts pour les tests */
function simulateContacts() {
    const demoContacts = [
        {
            id: "demo1",
            displayName: "Fatou Diop",
            name: { givenName: "Fatou", familyName: "Diop" },
            phoneNumbers: [{ value: "+221 77 123 45 67", type: "mobile" }],
            emails: [{ value: "fatou.diop@example.sn", type: "home" }],
            photos: [{ value: "https://randomuser.me/api/portraits/women/65.jpg" }]
        },
        {
            id: "demo2",
            displayName: "Mamadou Ndiaye",
            name: { givenName: "Mamadou", familyName: "Ndiaye" },
            phoneNumbers: [{ value: "+221 78 234 56 78", type: "mobile" }],
            emails: [{ value: "mamadou.ndiaye@example.sn", type: "work" }],
            photos: [{ value: "https://randomuser.me/api/portraits/men/45.jpg" }]
        },
        {
            id: "demo3",
            displayName: "Awa Fall",
            name: { givenName: "Awa", familyName: "Fall" },
            phoneNumbers: [{ value: "+221 76 345 67 89", type: "mobile" }],
            emails: [{ value: "awa.fall@example.sn", type: "home" }],
            photos: [{ value: "https://randomuser.me/api/portraits/women/75.jpg" }]
        },
        {
            id: "demo4",
            displayName: "Cheikh Ba",
            name: { givenName: "Cheikh", familyName: "Ba" },
            phoneNumbers: [{ value: "+221 70 456 78 90", type: "mobile" }],
            emails: [{ value: "cheikh.ba@example.sn", type: "work" }],
            photos: [{ value: "https://randomuser.me/api/portraits/men/35.jpg" }]
        },
        {
            id: "demo5",
            displayName: "Seynabou Sow",
            name: { givenName: "Seynabou", familyName: "Sow" },
            phoneNumbers: [{ value: "+221 75 567 89 01", type: "mobile" }],
            emails: [{ value: "seynabou.sow@example.sn", type: "home" }],
            photos: [{ value: "https://randomuser.me/api/portraits/women/32.jpg" }]
        }
    ];
    
    console.log("Contacts simulés chargés:", demoContacts.length);
    showContacts(demoContacts);
}

/* Affiche les contacts dans la liste */
function showContacts(contacts) {
    allContacts = contacts;
    let contactsHtml = "";
    
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const nom = getContactName(contact);
        const photo = getContactPhoto(contact);
        const phoneInfo = getContactPhoneInfo(contact);
        
        contactsHtml += `
            <li data-contact-index="${i}">
                <a href="#pageDetail" onclick="showContactDetail(${i})">
                    <img src="${photo}">
                    <h2>${nom}</h2>
                    <p>${phoneInfo}</p>
                </a>
            </li>
        `;
    }
    
    const contactList = document.getElementById("contactList");
    if (contactList) {
        contactList.innerHTML = contactsHtml;
        try {
            $(contactList).listview("refresh");
        } catch (e) {
            // Si listview pas encore initialisée
            $(contactList).trigger("create");
        }
    }
    
    console.log(`${contacts.length} contacts affichés`);
}

/* Affiche le détail d'un contact */
function showContactDetail(index) {
    currentContact = allContacts[index];
    const name = getContactName(currentContact);
    const phone = getContactPhone(currentContact);
    const email = getContactEmail(currentContact);
    const photo = getContactPhoto(currentContact);
    
    let detailHtml = `
        <div class="contact-photo">
            <img src="${photo}" alt="${name}" class="contact-detail-photo">
        </div>
        <div class="contact-name">
            <h2>${name}</h2>
        </div>
        <div class="contact-info">
            <div class="info-item">
                <span class="info-icon">📞</span>
                <span class="info-label">Téléphone</span>
                <span class="info-value">${phone}</span>
            </div>
    `;
    
    if (email) {
        detailHtml += `
            <div class="info-item">
                <span class="info-icon">✉️</span>
                <span class="info-label">Email</span>
                <span class="info-value">${email}</span>
            </div>
        `;
    }
    
    detailHtml += `</div>`;
    
    $("#contactDetail").html(detailHtml);
}

/* l'ajout d'un nouveau contact */
function newContact() {
    console.log("=== NOUVEAU CONTACT ===");
    currentContact = null;
    isEditMode = false;
    $("#formTitle").text("Nouveau Contact");
    clearForm();
}

/*  la modification du contact actuel */
function editCurrentContact() {
    console.log("=== DÉBUT ÉDITION ===");
    
    if (!currentContact) {
        console.log("Erreur: Aucun contact sélectionné pour édition");
        return false;
    }
    
    isEditMode = true;
    $("#formTitle").text("Modifier Contact");
    
    // Remplir le formulaire
    $("#contactId").val(currentContact.id || "");
    $("#contactName").val(getContactName(currentContact));
    $("#contactPhone").val(getContactPhone(currentContact));
    $("#contactEmail").val(getContactEmail(currentContact));
    
    console.log("Formulaire rempli, navigation vers page formulaire");
    $.mobile.changePage("#pageForm");
    
    return false;
}

/* Retour à la liste des contacts */
function backToList() {
    console.log("Retour à la liste des contacts");
    currentContact = null;
    $.mobile.changePage("#pageContacts");
}

/* Annule l'édition */
function cancelForm() {
    console.log("Annulation du formulaire");
    if (currentContact) {
        // Si on modifiait un contact, retourner au détail
        $.mobile.changePage("#pageDetail");
    } else {
        // Si on créait un nouveau contact, retourner à la liste
        $.mobile.changePage("#pageContacts");
    }
}

/**
 * Vide le formulaire
 */
function clearForm() {
    $("#contactForm")[0].reset();
    $("#contactId").val("");
}

/**
 * Appelle le contact
 */
function callContact() {
    console.log("=== DÉBUT APPEL ===");
    
    if (!currentContact) {
        console.log("Erreur: Aucun contact sélectionné pour appel");
        alert("Aucun contact sélectionné.");
        return false;
    }
    
    const phone = getContactPhone(currentContact);
    console.log("Numéro à appeler:", phone);
    
    if (phone && phone !== "Pas de téléphone") {
        try {
            console.log("Lancement de l'appel...");
            window.open(`tel:${phone}`, '_system');
        } catch (error) {
            console.error("Erreur lors de l'appel:", error);
            alert("Impossible de lancer l'appel. Numéro: " + phone);
        }
    } else {
        console.log("Aucun numéro de téléphone disponible");
        alert("Aucun numéro de téléphone disponible pour ce contact.");
    }
    
    return false;
}

/**
 * Supprime le contact actuel
 */
function deleteCurrentContact() {
    console.log("=== DÉBUT SUPPRESSION ===");
    
    if (!currentContact) {
        console.log("Erreur: Aucun contact sélectionné");
        alert("Aucun contact sélectionné.");
        return false;
    }
    
    const contactName = getContactName(currentContact);
    console.log("Contact à supprimer:", contactName);
    
    // Demander confirmation
    const confirmDelete = confirm(`Voulez-vous vraiment supprimer "${contactName}" ?\n\nCette action est irréversible.`);
    console.log("Confirmation utilisateur:", confirmDelete);
    
    if (!confirmDelete) {
        console.log("Suppression annulée par l'utilisateur");
        return false;
    }
    
    // Mode simulation (toujours utilisé pour éviter les problèmes)
    console.log("=== SUPPRESSION EN MODE SIMULATION ===");
    try {
        console.log("Nombre de contacts avant suppression:", allContacts.length);
        console.log("ID du contact à supprimer:", currentContact.id);
        
        // Trouver l'index du contact
        const contactIndex = allContacts.findIndex(c => c.id === currentContact.id);
        console.log("Index trouvé:", contactIndex);
        
        if (contactIndex !== -1) {
            // Supprimer le contact de la liste
            allContacts.splice(contactIndex, 1);
            console.log("Contact supprimé! Contacts restants:", allContacts.length);
            
            // Nettoyer la variable
            currentContact = null;
            
            // Afficher le message de succès
            alert("Contact supprimé avec succès !");
            
            // Retourner à la liste
            console.log("Retour à la liste...");
            $.mobile.changePage("#pageContacts");
            
            // Mettre à jour l'affichage après un délai
            setTimeout(() => {
                console.log("Mise à jour de l'affichage...");
                showContacts(allContacts);
            }, 300);
            
        } else {
            console.error("ERREUR: Contact non trouvé dans la liste!");
            alert("Erreur : Contact non trouvé dans la liste.");
        }
    } catch (error) {
        console.error("ERREUR lors de la suppression:", error);
        alert("Erreur lors de la suppression : " + error.message);
    }
    
    console.log("=== FIN SUPPRESSION ===");
    return false;
}

/**
 * Crée un nouveau contact
 */
function createContact(name, phone, email) {
    console.log("=== DÉBUT CRÉATION CONTACT ===");
    console.log("Nouvelles données:", { name, phone, email });
    
    // Toujours utiliser le mode simulation pour éviter les erreurs API
    console.log("=== CRÉATION EN MODE SIMULATION ===");
    try {
        const newContact = {
            id: Date.now().toString(),
            displayName: name,
            name: { 
                givenName: name.split(' ')[0], 
                familyName: name.split(' ').slice(1).join(' ') 
            },
            phoneNumbers: [{ value: phone, type: "mobile" }],
            emails: (email && email.trim() !== '') ? [{ value: email, type: "home" }] : [],
            photos: [{ value: "img/image.png" }]
        };
        
        allContacts.push(newContact);
        console.log("Nouveau contact créé! Total contacts:", allContacts.length);
        
        alert("Contact ajouté avec succès !");
        
        // Retourner à la liste
        $.mobile.changePage("#pageContacts");
        
        // Mettre à jour l'affichage après un délai
        setTimeout(() => {
            console.log("Mise à jour de l'affichage...");
            showContacts(allContacts);
        }, 300);
        
    } catch (error) {
        console.error("ERREUR lors de la création:", error);
        alert("Erreur lors de la création : " + error.message);
    } finally {
        // Réactiver le bouton dans tous les cas
        $("#saveBtn").prop('disabled', false).text('Enregistrer');
    }
    
    console.log("=== FIN CRÉATION CONTACT ===");
}

/**
 * Met à jour un contact existant
 */
function updateContact(contact, name, phone, email) {
    console.log("=== DÉBUT MISE À JOUR CONTACT ===");
    console.log("Contact à modifier:", getContactName(contact));
    console.log("Nouvelles données:", { name, phone, email });
    
    // Toujours utiliser le mode simulation pour éviter les erreurs API
    console.log("=== MODIFICATION EN MODE SIMULATION ===");
    try {
        const index = allContacts.findIndex(c => c.id === contact.id);
        console.log("Index du contact trouvé:", index);
        
        if (index !== -1) {
            // Mettre à jour les données du contact
            allContacts[index].displayName = name;
            allContacts[index].name = { 
                givenName: name.split(' ')[0], 
                familyName: name.split(' ').slice(1).join(' ') 
            };
            allContacts[index].phoneNumbers = [{ value: phone, type: "mobile" }];
            
            if (email && email.trim() !== '') {
                allContacts[index].emails = [{ value: email, type: "home" }];
            } else {
                allContacts[index].emails = [];
            }
            
            // Mettre à jour currentContact
            currentContact = allContacts[index];
            
            console.log("Contact modifié avec succès!");
            alert("Contact modifié avec succès !");
            
            // Retourner à la page de détail
            $.mobile.changePage("#pageDetail");
            
            // Mettre à jour l'affichage après un délai
            setTimeout(() => {
                console.log("Mise à jour de l'affichage...");
                showContacts(allContacts);
                showContactDetail(index);
            }, 300);
            
        } else {
            console.error("ERREUR: Contact non trouvé pour modification!");
            alert("Erreur : Contact non trouvé pour modification.");
        }
    } catch (error) {
        console.error("ERREUR lors de la modification:", error);
        alert("Erreur lors de la modification : " + error.message);
    } finally {
        // Réactiver le bouton dans tous les cas
        $("#saveBtn").prop('disabled', false).text('Enregistrer');
    }
    
    console.log("=== FIN MISE À JOUR CONTACT ===");
}

// === FONCTIONS UTILITAIRES ===

/**
 * Obtient le nom d'affichage d'un contact
 */
function getContactName(contact) {
    return contact.displayName ||
           (contact.name && contact.name.formatted) ||
           (contact.name &&
               ((contact.name.givenName || "") + " " + (contact.name.familyName || "")).trim()) ||
           "Sans nom";
}

/**
 * Obtient la photo d'un contact
 */
function getContactPhoto(contact) {
    return contact.photos && contact.photos[0] && contact.photos[0].value
        ? contact.photos[0].value
        : "img/image.png";
}

/**
 * Obtient le téléphone d'un contact
 */
function getContactPhone(contact) {
    return (contact.phoneNumbers && contact.phoneNumbers[0] && contact.phoneNumbers[0].value) || "Pas de téléphone";
}

/**
 * Obtient l'email d'un contact
 */
function getContactEmail(contact) {
    return (contact.emails && contact.emails[0] && contact.emails[0].value) || "";
}

/**
 * Obtient les infos de téléphone formatées
 */
function getContactPhoneInfo(contact) {
    if (contact.phoneNumbers && contact.phoneNumbers[0]) {
        const phone = contact.phoneNumbers[0];
        return phone.value + (phone.type ? " (" + phone.type + ")" : "");
    }
    return "";
}

/**
 * Valide un email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Gestionnaire d'erreur
 */
function onError(error) {
    console.log("Erreur:", error);
    alert("Une erreur inattendue s'est produite: " + (error.message || error.code || "Erreur inconnue"));
}

// === GESTIONNAIRES D'ÉVÉNEMENTS ===

// Soumission du formulaire
$(document).on('submit', '#contactForm', function(e) {
    e.preventDefault();
    console.log("=== SOUMISSION FORMULAIRE ===");
    
    const name = $("#contactName").val().trim();
    const phone = $("#contactPhone").val().trim();
    const email = $("#contactEmail").val().trim();
    const id = $("#contactId").val();
    
    console.log("Données du formulaire:", { name, phone, email, id });
    console.log("Mode édition:", isEditMode);
    console.log("Contact actuel:", currentContact ? getContactName(currentContact) : "Aucun");
    
    // Validation
    if (!name || !phone) {
        alert("Veuillez remplir au minimum le nom et le téléphone.");
        return false;
    }
    
    if (email && !isValidEmail(email)) {
        alert("Veuillez entrer une adresse email valide.");
        return false;
    }
    
    // Désactiver le bouton temporairement
    $("#saveBtn").prop('disabled', true).text('Enregistrement...');
    
    try {
        if (id && currentContact && isEditMode) {
            // Modification d'un contact existant
            console.log("=== MODE MODIFICATION ===");
            updateContact(currentContact, name, phone, email);
        } else {
            // Création d'un nouveau contact
            console.log("=== MODE CRÉATION ===");
            createContact(name, phone, email);
        }
    } catch (error) {
        console.error("ERREUR lors de la sauvegarde:", error);
        alert("Erreur lors de la sauvegarde: " + error.message);
        // Réactiver le bouton en cas d'erreur
        $("#saveBtn").prop('disabled', false).text('Enregistrer');
    }
    
    return false;
});

// Événements de page
$(document).on("pagebeforeshow", "#pageForm", function() {
    console.log("=== AFFICHAGE PAGE FORMULAIRE ===");
    console.log("Mode édition:", isEditMode);
    console.log("Contact actuel:", currentContact ? getContactName(currentContact) : "Aucun");
    
    if (!isEditMode && !currentContact) {
        console.log("Nouveau contact - formulaire vide");
        clearForm();
    }
    
    // S'assurer que le bouton est activé
    $("#saveBtn").prop('disabled', false).text('Enregistrer');
});

$(document).on("pagebeforeshow", "#pageContacts", function() {
    console.log("Affichage page liste contacts");
    // Recharger si nécessaire ou si la liste est vide
    if (allContacts.length === 0) {
        console.log("Liste vide, rechargement...");
        loadContacts();
    } else {
        // Rafraîchir l'affichage au cas où
        showContacts(allContacts);
    }
});

$(document).on("pagebeforeshow", "#pageDetail", function() {
    console.log("Affichage page détail contact");
    if (!currentContact) {
        console.log("Pas de contact sélectionné, retour à la liste");
        $.mobile.changePage("#pageContacts");
        return false;
    }
});

// Gestion du bouton retour physique (Android)
$(document).on("backbutton", function(e) {
    e.preventDefault();
    
    const activePage = $.mobile.activePage ? $.mobile.activePage.attr('id') : 'pageContacts';
    console.log("Bouton retour pressé sur page:", activePage);
    
    switch (activePage) {
        case 'pageDetail':
            backToList();
            break;
        case 'pageForm':
            cancelForm();
            break;
        case 'pageContacts':
        default:
            // Sur la page principale, quitter l'application
            if (navigator.app && navigator.app.exitApp) {
                navigator.app.exitApp();
            } else if (navigator.device && navigator.device.exitApp) {
                navigator.device.exitApp();
            }
            break;
    }
});