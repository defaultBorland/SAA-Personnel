function getUsersParticipation() {
    let usersData = getUsersData('Пользователи');

    let usersParticipation = usersData
    .filter(user => user.name !== '')
    .map(user => {
        return {
            callsign: user.name, 
            steamid: user.steamid, 
            missionRole: user.missionParticipation
        }
    })
    .sort((a, b) => a.callsign.localeCompare(b.callsign, 'en', { sensitivity: 'base' }));

    return usersParticipation;
};

function setUsersParticipation(usersParticipation) {
    let missionRoleCol = getHeaderColoumnNum("LMS", "Пользователи");
    let values = usersParticipation.map(user => [user.missionRole]);

    USERS_SHEET.getRange(2, missionRoleCol, usersParticipation.length, 1).setValues(values);

    MAIN_SHEET.getRange(18, 6).setValue("✘");
    SpreadsheetApp.flush();

    return true;
};