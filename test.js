// reformating jsonObject of an jsonArray

const loadcontacts = require('./contacts.json')
const fs = require('fs')

const contacts = JSON.stringify(loadcontacts)

const parsedContacts = JSON.parse(contacts)

let fullyParsedContacts = []

parsedContacts.forEach(contact => {
    const newContact = {...contact}
     newContact.numbers = JSON.parse(contact.numbers)
     fullyParsedContacts.push(newContact)

     console.log(newContact)
});

fs.writeFile(

    './test.json',

    JSON.stringify(fullyParsedContacts),

    function (err) {
        if (err) {
            console.error('Crap happens');
        }
    }
);

console.log(fullyParsedContacts)

//console.log(JSON.parse(parsedContacts[0].numbers))