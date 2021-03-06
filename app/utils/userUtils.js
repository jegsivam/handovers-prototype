function getListOfAvailableUsers(team, allUsersList) {

    let availableUsers = [];
    let allUsers = allUsersList;

    for (let i=0; i < allUsers.length; i++) {
        if (checkIfUserAlreadyInTeam(allUsers[i], team) === false) {
            let availableUser = allUsers[i];
            availableUsers.push(availableUser);
        }
    }
    return availableUsers;
}

function checkIfUserAlreadyInTeam(user, team) {
    let result = false;
    let inputTeamUsers = team.userList;

    for (let j=0; j < inputTeamUsers.length; j++) {
        if (user.staffId === inputTeamUsers[j].staffId) {
            result = true;
        }
    }

    return result;
}

function getUserByStaffIdFromListOfUsers(listOfUsers, staffId) {
    let user = {};
    let userList = listOfUsers;
    let listLength = userList.length;
    let userFound = false;

    for (let i=0; i < listLength; i++) {
        if (userList[i].staffId == staffId) {
            userFound = true;
            user.staffId = userList[i].staffId;
            user.firstName = userList[i].firstName;
            user.lastName = userList[i].lastName;
            user.telNum = userList[i].telNum;
            user.owningOfficeId = userList[i].owningOfficeId;
            user.role = userList[i].role;
        }
    }

    if (userFound === false) {
        // console.log("In userUtils: User with staff id: " + staffId + " was not found");
    } else {
        return user;
    }
}

module.exports.getListOfAvailableUsers = getListOfAvailableUsers;
module.exports.getUserByStaffIdFromListOfUsers = getUserByStaffIdFromListOfUsers;