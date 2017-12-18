const handoverUtils = require('../utils/handoverUtils');
const officeUtils = require('../utils/officeUtils');
const claimantUtils = require('../utils/claimantUtils');
const userUtils = require('../utils/userUtils');
const sIDU = require('../utils/setInitialDataUtils');
const dateUtils = require('../utils/dateUtils');
const commonUtils = require('../utils/commonUtils');

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
/*                                        Handover Controllers
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*/

function viewHandoverPage(req, res) {

    let officesList = sIDU.setInitialOfficesData();
    let users = req.session.user ? req.session.user : sIDU.setInitialUsersData();
    let user = req.session.user ? req.session.user : users[0];
    let handoversList = req.session.handovers ? req.session.handovers : sIDU.setInitialBenefitsAndHandoversData().initialHandovers;
    let errorsIn = req.session.errors ? req.session.errors : [];
    let handover;
    if (req.query.id === null) {
        handover = req.session.handover ? req.session.handover : handoversList[0];
    } else {
        handover = handoverUtils.getHandoverByIdFromListOfHandovers(handoversList, req.query.id);
    }
    let handoverNotes = [];
    let handoverTextDetails = handoverUtils.getHandoverDetails(handover);
    let claimants = req.session.claimants ? req.session.claimants : sIDU.setInitialClaimantsData();
    let claimant = claimantUtils.getClaimantByNinoFromListOfClaimants(claimants, handover.nino);
    let claimantOfficeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, claimant.claimantOfficeId);
    let officeId = claimant.claimantOfficeId || "3";
    let officeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, officeId);
    let officeTypes = sIDU.setInitialOfficeTypesData();
    let officeTypesIndex = commonUtils.findPositionOfObjectInArray(officeDetails.officeTypeId, officeTypes);
    let officeTypeId = officeTypes[officeTypesIndex].id;
    let officeTypeName = officeTypes[officeTypesIndex].officeType;
    let officeType = {
        id : officeTypeId,
        officeType : officeTypeName
    }

    let receivingOfficeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, handover.receivingOfficeId);

    let userWhoRaisedHandover = userUtils.getUserByStaffIdFromListOfUsers(users, handover.raisedByStaffId);
    userWhoRaisedHandover.officeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, userWhoRaisedHandover.owningOfficeId);
    let userOfficeTypeIndex = commonUtils.findPositionOfObjectInArray(userWhoRaisedHandover.officeDetails.officeTypeId, officeTypes);
    userWhoRaisedHandover.officeDetails.officeType = officeTypes[userOfficeTypeIndex].officeType;

    handover.dateAndTimeRaisedForDisplay = dateUtils.formatDateAndTimeForDisplay(handover.dateAndTimeRaised);
    handover.targetDateAndTimeForDisplay = dateUtils.formatDateAndTimeForDisplay(handover.targetDateAndTime);

    if (handover.notes === null) {
        handoverNotes = null;
    } else {
        let handNoteLen = handover.notes.length;
        for (let i=0; i < handNoteLen; i++) {
            let handoverNote = {
                id: handover.notes[i].id,
                dateNoteAdded: dateUtils.formatDateAndTimeForDisplay(handover.notes[i].dateNoteAdded),
                userWhoAddedNote: userUtils.getUserByStaffIdFromListOfUsers(users, handover.notes[i].userWhoAddedNote),
                updateResultedFromCustomerContactIndicator: handover.notes[i].updateResultedFromCustomerContactIndicator,
                noteContent: handover.notes[i].noteContent
            }
            handoverNotes.push(handoverNote);
        }
    }
    req.session.claimant = claimant;
    req.session.handovers = handoversList;
    req.session.handover = handover;
    req.session.officeDetails = officeDetails;

    res.render('handover', {
        benefitName : handoverTextDetails.benefitName,
        handoverType : handoverTextDetails.handoverType,
        handoverReason : handoverTextDetails.handoverReason,
        handoverNotes : handoverNotes,
        officeDetails : officeDetails,
        receivingOfficeDetails : receivingOfficeDetails,
        claimantOfficeDetails : claimantOfficeDetails,
        officeTypes : officeTypes,
        officeType : officeType,
        claimant : claimant,
        handover : handover,
        userWhoRaisedHandover : userWhoRaisedHandover,
        user : user,
        errors : errorsIn,
        errorsLength : errorsIn.length
    });

}

function viewHandoverPageAction(req, res) {

    let handover = req.session.handover;
    let claimantNino = req.session.claimant && req.session.claimant.nino || console.log("No claimant in session, or no nino in claimant");
    let handoverClaimant = req.session.claimant;

    req.session.claimant = handoverClaimant;
    req.session.handover = handover;

    res.redirect('/handover/edit?nino=' + claimantNino);

}

function createHandoverPage(req, res) {
    let editOrCreate = 'create';
    let initialData = sIDU.setInitialBenefitsAndHandoversData();
    let users = req.session.user ? req.session.user : sIDU.setInitialUsersData();
    let user = req.session.user ? req.session.user : users[0];
    let benefitsList = initialData.initialBenefits;
    let handoverTypesList = initialData.initialHandoverTypes;
    let handoverReasonsList = initialData.initialHandoverReasons;
    let handovers = req.session.handovers ? req.session.handovers : initialData.initialHandovers;
    let officesList = sIDU.setInitialOfficesData();
    let claimants = req.session.claimants ? req.session.claimants : sIDU.setInitialClaimantsData();
    let claimant = claimantUtils.getClaimantByNinoFromListOfClaimants(claimants, req.query.nino);
    let claimantOfficeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, claimant.claimantOfficeId);
    let officeTypes = sIDU.setInitialOfficeTypesData();
    let officeId = 3;  // Change to let officeId = handover.raisedOnBehalfOfOfficeId || "3" once got different offices sorted
    let officeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, officeId);

    user.officeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, user.owningOfficeId);
    let userOfficeTypeIndex = commonUtils.findPositionOfObjectInArray(user.officeDetails.officeTypeId, officeTypes);
    user.officeDetails.officeType = officeTypes[userOfficeTypeIndex].officeType;

    req.session.claimant = claimant;
    req.session.handovers = handovers;
    req.session.claimants = claimants;

    res.render('handover-edit', {
        benList : benefitsList,
        handTypesList : handoverTypesList,
        handReasonsList : handoverReasonsList,
        claimant : claimant,
        user : user,
        officeDetails : officeDetails,
        claimantOfficeDetails : claimantOfficeDetails,
        officesList : officesList,
        officeTypes : officeTypes,
        editOrCreate : editOrCreate
    });

}

function createHandoverPageAction(req, res) {

    let newHandover = new Object();
    let handoversList = req.session.handovers ? req.session.handovers : sIDU.setInitialBenefitsAndHandoversData();
    let users = sIDU.setInitialUsersData();
    let newDate = new Date();
    let newHandoversList = handoversList;
    let handoverNote = req.body['handover-note'];
    let updateResultedFromCustomerContactIndicator = req.body['handover-contact-indicator'];
    let claimant = req.session.claimant;
    let newId = handoversList.length + 1;

    newHandover.id = newId;
    newHandover.nino = claimant.nino;
    newHandover.raisedByStaffId = '40001001';

    let user = userUtils.getUserByStaffIdFromListOfUsers(users, newHandover.raisedByStaffId);
    newHandover.raisedOnBehalfOfOfficeId = user.owningOfficeId;
    newHandover.benefitId = req.body['benefit'];

    if (newHandover.benefitId === "5") {
        newHandover.benSubType = req.body['benefit-sub'];
    } else {
        newHandover.benSubType = null;
    }

    // Set office the new handover is routed to this value on handover creation until/unless prototype changed to show some kind of routing rules
    newHandover.receivingOfficeId = 4;

    newHandover.typeId = req.body['handover-type'];;
    newHandover.reasonId = req.body['handover-reason'];
    newHandover.callback = req.body['handover-callback'];
    newHandover.priority = req.body['handover-priority'];
    newHandover.status = "Not allocated";
    newHandover.inQueueOfStaffId = "";
    newHandover.dateAndTimeRaised = newDate;
    newHandover.targetDateAndTime = newDate;
    newHandover.notes = [];

    if (newHandover.callback === 'Yes') {
        newHandover.targetDateAndTime.setHours(newHandover.dateAndTimeRaised.getHours() + 3);
    }

    newHandover.dateAndTimeRaisedForDisplay = dateUtils.formatDateAndTimeForDisplay(newHandover.dateAndTimeRaised);
    newHandover.targetDateAndTimeForDisplay = dateUtils.formatDateAndTimeForDisplay(newHandover.targetDateAndTime);

    if (handoverNote === "" || handoverNote === null) {
        // Do nothing
    } else {
        let newHandoverNote = new Object();
        newHandoverNote.id = '1';
        newHandoverNote.handoverId = newHandover.id;
        newHandoverNote.dateNoteAdded = newDate;
        newHandoverNote.userWhoAddedNote = newHandover.raisedByStaffId;
        newHandoverNote.updateResultedFromCustomerContactIndicator = updateResultedFromCustomerContactIndicator;
        newHandoverNote.noteContent = handoverNote;
        newHandover.notes.push(newHandoverNote);
    }

    newHandoversList.push(newHandover);
    req.session.handover = newHandover;
    req.session.handovers = newHandoversList;
    req.session.claimant = claimant;

    res.redirect('/handover/view?id=' + newId);

}

function editHandoverPage(req, res) {

    let editOrCreate = 'edit';
    let initialData = sIDU.setInitialBenefitsAndHandoversData();
    let users = req.session.user ? req.session.user : sIDU.setInitialUsersData();
    let user = req.session.user ? req.session.user : users[0];
    let benefitsList = initialData.initialBenefits;
    let handoverTypesList = initialData.initialHandoverTypes;
    let handoverReasonsList = initialData.initialHandoverReasons;
    let handovers = req.session.handovers ? req.session.handovers : initialData.initialHandovers;
    let handover = req.session.handover ? req.session.handover : handoverUtils.getHandoverByIdFromListOfHandovers(handovers, req.query.id);
    let handoverNotes = [];
    let handoverTextDetails = handoverUtils.getHandoverDetails(handover);
    let claimants = req.session.claimants ? req.session.claimants : sIDU.setInitialClaimantsData();
    let officesList = sIDU.setInitialOfficesData();
    let officeId = handover.raisedOnBehalfOfOfficeId || "3";
    let officeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, officeId);
    let officeTypes = sIDU.setInitialOfficeTypesData();
    let officeTypesIndex = commonUtils.findPositionOfObjectInArray(officeDetails.officeTypeId, officeTypes);
    let officeTypeId = officeTypes[officeTypesIndex].id;
    let officeTypeName = officeTypes[officeTypesIndex].officeType;
    let officeType = {
        officeTypeId : officeTypeId,
        officeTypeName : officeTypeName
    }

    let receivingOfficeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, handover.receivingOfficeId);

    let errorsIn = req.session.errors ? req.session.errors : [];

    let claimant = claimantUtils.getClaimantByNinoFromListOfClaimants(claimants, handover.nino);
    let claimantOfficeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, claimant.claimantOfficeId)

    let userWhoRaisedHandover = userUtils.getUserByStaffIdFromListOfUsers(users, handover.raisedByStaffId);
    userWhoRaisedHandover.officeDetails = officeUtils.getOfficeByIdFromListOfOffices(officesList, userWhoRaisedHandover.owningOfficeId);
    let userOfficeTypeIndex = commonUtils.findPositionOfObjectInArray(userWhoRaisedHandover.officeDetails.officeTypeId, officeTypes);
    userWhoRaisedHandover.officeDetails.officeType = officeTypes[userOfficeTypeIndex].officeType;

    handover.dateAndTimeRaisedForDisplay = dateUtils.formatDateAndTimeForDisplay(handover.dateAndTimeRaised);
    handover.targetDateAndTimeForDisplay = dateUtils.formatDateAndTimeForDisplay(handover.targetDateAndTime);

    if (handover.notes === null) {
        handoverNotes = null
    } else {
        for (let i=0; i < handover.notes.length; i++) {
            let handoverNote = {
                id: handover.notes[i].id,
                dateNoteAdded: dateUtils.formatDateAndTimeForDisplay(handover.notes[i].dateNoteAdded),
                userWhoAddedNote: userUtils.getUserByStaffIdFromListOfUsers(users, handover.notes[i].userWhoAddedNote),
                updateResultedFromCustomerContactIndicator: handover.notes[i].updateResultedFromCustomerContactIndicator,
                noteContent: handover.notes[i].noteContent
            }
            handoverNotes.push(handoverNote);
        }
    }
    req.session.claimant = claimant;
    req.session.handover = handover;
    req.session.handovers = handovers;
    req.session.claimants = claimants;

    res.render('handover-edit', {
        benList : benefitsList,
        benefitName : handoverTextDetails.benefitName,
        handoverType : handoverTextDetails.handoverType,
        handoverReason : handoverTextDetails.handoverReason,
        handTypesList : handoverTypesList,
        handReasonsList : handoverReasonsList,
        handoverNotes : handoverNotes,
        receivingOfficeDetails : receivingOfficeDetails,
        claimant : claimant,
        handover : handover,
        userWhoRaisedHandover : userWhoRaisedHandover,
        user: user,
        officesList : officesList,
        officeDetails : officeDetails,
        claimantOfficeDetails : claimantOfficeDetails,
        officeType : officeType,
        officeTypes : officeTypes,
        editOrCreate : editOrCreate,
        errors : errorsIn,
        errorsLength : errorsIn.length
    });
}

function editHandoverPageAction(req, res) {

    let users = req.session.user ? req.session.user : sIDU.setInitialUsersData();
    let user = req.session.user ? req.session.user : users[0];
    let handoversList = req.session.handovers ? req.session.handovers : sIDU.setInitialBenefitsAndHandoversData();
    let handover = req.session.handover ? req.session.handover : handoverUtils.getHandoverByIdFromListOfHandovers(handoversList, req.query.id);
    let editedHandover = new Object();
    let errorsOut = [];
    let newHandoverNotes = [];
    let handoverNote = req.body['handover-note'];
    let editedHandoverNote = new Object();
    let updateResultedFromCustomerContactIndicator = req.body['handover-contact-indicator'];
    let claimant = req.session.claimant;
    let handoverIndex = commonUtils.findPositionOfObjectInArray(handover.id, handoversList);
    let editedDate = new Date();

    editedHandover.id = handover.id
    editedHandover.nino = handover.nino;
    editedHandover.raisedByStaffId = handover.raisedByStaffId;
    editedHandover.raisedOnBehalfOfOfficeId = handover.raisedOnBehalfOfOfficeId;
    editedHandover.receivingOfficeId = handover.receivingOfficeId;

    editedHandover.benefitId = req.body['benefit'] || handover.benefitId;

    if (editedHandover.benefitId === "5") {
        editedHandover.benSubType = req.body['benefit-sub'] || handover.benSubType;
    } else {
        editedHandover.benSubType = null;
    }

    editedHandover.typeId = req.body['handover-type'] || handover.typeId;
    editedHandover.reasonId = req.body['handover-reason'] || handover.reasonId;
    editedHandover.callback = req.body['handover-callback'];
    editedHandover.status = req.body['handover-status'] || handover.status;
    editedHandover.dateAndTimeRaised = new Date(handover.dateAndTimeRaised);

    if (editedHandover.callback === 'Yes') {
        editedHandover.targetDateAndTime = new Date(handover.dateAndTimeRaised);
        editedHandover.targetDateAndTime.setHours(editedHandover.dateAndTimeRaised.getHours() + 3);
    } else {
        editedHandover.targetDateAndTime = handover.targetDateAndTime;
    }

    if (handoverNote === "" || handoverNote === null) {
        newHandoverNotes = handover.notes;
    } else {
        editedHandoverNote.handoverId = handover.id;
        editedHandoverNote.dateNoteAdded = editedDate;
        editedHandoverNote.userWhoAddedNote = user.staffId;
        editedHandoverNote.updateResultedFromCustomerContactIndicator = updateResultedFromCustomerContactIndicator;
        editedHandoverNote.noteContent = handoverNote;
        if (handover.notes === null) {
            editedHandoverNote.id = "1";
            newHandoverNotes.push(editedHandoverNote);
        } else {
            editedHandoverNote.id = handover.notes.length + 1;
            newHandoverNotes = handover.notes;
            newHandoverNotes.unshift(editedHandoverNote);
        }
    }
    editedHandover.notes = newHandoverNotes;

    handoversList[handoverIndex] = editedHandover;

    req.session.errors = errorsOut;
    req.session.handovers = handoversList;
    req.session.handover = editedHandover;
    req.session.claimant = claimant;

    res.redirect('/handover/edit?id=' + editedHandover.id);

}

module.exports.viewHandoverPage = viewHandoverPage;
module.exports.viewHandoverPageAction = viewHandoverPageAction;
module.exports.createHandoverPage = createHandoverPage;
module.exports.createHandoverPageAction = createHandoverPageAction;
module.exports.editHandoverPage = editHandoverPage;
module.exports.editHandoverPageAction = editHandoverPageAction;
