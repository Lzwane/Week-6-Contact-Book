// Global variables
let apiKey = '';
const rootPath = 'https://mysite.itvarsity.org/api/ContactBook/';

// Check if API key if already exist when page loads
function checkApiKey() {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
        apiKey = storedApiKey;

        // Show Contacts (Show page)
        showContacts();

        // Get Contacts (API call)
        getContacts();
    }
}

// Set the API Key and store it
function setApiKey() {
    const inputApiKey = document.getElementById('apiKeyInput').value.trim();

    if(!inputApiKey) {
        alert('Please enter an API key!');
        return;
    }

    // Validate API key first
    fetch(rootPath + "controller/api-key/?apiKey=" + inputApiKey)
    .then(function (response) {
        return response.text();
    })
    
    .then(function (data) {
        if (data == "1") {  //If you get 1, then API is successful
            apiKey = inputApiKey;
            localStorage.setItem("apiKey", apiKey);
            showContacts();
            getContacts();
        } 
        else {
            alert("Invalid API key entered!");
        }
    })

    .catch(function (error) {
        alert('Error validation your API key. Please try again.');
    });
}

// Show different pages
function showPage(pageId) {
    //Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    document.getElementById(pageId).classList.add('active');
}

function showContacts() {
    showPage('contactsPage');
}

function showAddContacts() {
    showPage('assContactPage');
    // Clear the form
    document.getElementById('addContactForm').reset();
}

function showEditContact(contactId) {
    showPage('editContactPage');
    // Load contact data for editing
    loadContactForEdit(contactId);
}

function getContacts() {
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '<div class="loading"> Loading Contacts... </div>';

    fetch(rootPath + "controller/get-contacts/")
        .then(function (response){
            return response.json();
        })
        .then(function (data) {
            displayContacts(data);
        })
        .catch(function (error) {
            contactList.innerHTML = '<div class="error"> Something went wrong, Please try again later. </div>'
        });
}

function displayContacts(contacts) {
    const contactList = document.getElementById('contactsList');

    if (!contacts || contacts.length === 0) {
        contactsList.innerHTML = '<div class="loading"> No contacts found. Add your first contact! </div>';
        return;
    }

    let html = '<div class = "contact-grid">';

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];

        let avatarSrc = contact.avatar ?
        `${rootPath}controller/uploads/${contact.avatar}` : 
        `https://ui-avatars.com/api/?name=${contact.firstname}+${contact.lastname}$background=ff6b6b&color=fff&size=120`;

        html += `
            <div class="contact-card">
                <img src="${avatarSrc}" alt="Avatar" class="contact-avatar">
                <div class="contact-name">${contact.firstname} ${contact.lastname} </div>
                <div class="contact-details">
                    <p><strong> Mobile: </strong> ${contact.mobile}</p>
                    <p><strong> Email: </strong> ${contact.email}</p>
                </div>

                <div class="contact-actions">
                    <button class="btn btn-secondary" onclick="showEditContact('${contact.id}')"> Edit </button>
                    <button class="btn btn-danger" onclick="deleteContact('${contact.id}')"> Delete </button>
                </div>
            </div
        `;
    } // This whole part above allows this code to be ran multiple times

    html += '</div>';
    contactsList.innerHTML = html;
}

function refreshContacts() {
    getContacts();
}

// CRUD ->  Create   Read    Update    Delete
// We were doing the "R" Read, so now we are doing the "C" Create.

function addContact(event) {
    event.preventDefault();

    const form = new FormData(document.querySelector('#addContactForm'));
    form.append('apiKey', apiKey);

    fetch(rootPath + 'controller/insert-contact/', {
        method: 'POST',  //Push data into API
        header: {'Accept': 'application/json, *.*'},
        body: form
    })
    .then(function (response) {   
        return response.text();
    })                               // It will only be successful if its at 1
    .then( function (data) {
        if (data == "1") {
            alert("Contact added successfully!");
            showContacts();
            getContacts();
        } else {
            alert ('Error adding contact: ' + data);
        }
    })
    .catch (function (error) {
        alert('Something went wrong. Please try again.');
    });
}