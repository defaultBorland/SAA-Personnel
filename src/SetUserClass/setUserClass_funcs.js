function changeClasses(callsign, newPrimClass, newSecClass) {

    setClass(callsign, newPrimClass, true);
    setClass(callsign, newSecClass, false);

    createLogEntry("Смена специализации", callsign + ' (' + newPrimClass + ', ' + newSecClass + ')');

    return true;
};

function setClass(callsign, specialisation, isPrimary) {

    var userRow = getUserRow(callsign, "Пользователи");
    var coloumnName = "";
    if (isPrimary) {coloumnName = "Primary"} else {coloumnName = "Secondary"};

    var classCol = getHeaderColoumnNum(coloumnName, "Пользователи");

    if (userRow < 2 || classCol < 1) {
        Logger.log([callsign, gmail]);
        throw 'Invalid data provided';
    };

    USERS_SHEET.getRange(userRow, classCol).setValue(specialisation);
    
    return true;
};