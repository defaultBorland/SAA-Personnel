function changeRank(callsign, rank) {

    userData = setRank(callsign, rank)

    if (userData.newRank === "SGT") {
        setClass(callsign, "-", false);
    };

    createLogEntry("Смена ранга", callsign  + ' (' + userData.oldRank + " -> " + userData.newRank + ')');

    return true;
};

/**
 * Changes current user rank to the passed one and clears the medals field
 * @param {String} callsign 
 * @param {String} newRank
 * 
 * @return {{callsign: number, oldRank: string, newRank:string}}
 */

function setRank(callsign, newRank) {

    let userRow = getUserRow(callsign, "Пользователи");
    let rankCol = getHeaderColoumnNum("Rank", "Пользователи");
    let medalsCol = getHeaderColoumnNum("Medals", "Пользователи");

    if (userRow < 2 || rankCol < 1 || rankCol < 1) {
        Logger.log([callsign, gmail]);
        throw 'Invalid data provided';
    };

    let oldRank = USERS_SHEET.getRange(userRow, rankCol).getValue();
    USERS_SHEET.getRange(userRow, rankCol).setValue(newRank);

    USERS_SHEET.getRange(userRow, medalsCol).clearContent();
    
    return {'name':callsign, 'oldRank':oldRank, 'newRank':newRank}
};