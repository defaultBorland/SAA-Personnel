function getQualifications() {

    let values = QUALIFICATIONS_SHEET.getRange(2, 1, QUALIFICATIONS_SHEET.getLastRow(), 12).getValues();
    let notes = QUALIFICATIONS_SHEET.getRange(2, 1, QUALIFICATIONS_SHEET.getLastRow(), 12).getNotes();
    let usersObjects = [];

    // So...fucking mess?
    values.forEach(function(element, index) {
        object = {
            steamid: element[0],
            name: element[1],
            KMBQualifier: element[2],
            KMBQualifierNote: notes[index][2],
            medicQualifier: element[3],
            medicQualifierNote: notes[index][3],
            ATQualifier: element[4],
            ATQualifierNote: notes[index][4],
            engineerQualifier: element[5],
            engineerQualifierNote: notes[index][5],
            sniperQualifier: element[6],
            sniperQualifierNote: notes[index][6],
            armoredVehicleQualifier: element[7],
            armoredVehicleQualifierNote: notes[index][7],
            transportHeliQualifier: element[8],
            transportHeliQualifierNote: notes[index][8],
            lightHeliQualifier: element[9],
            lightHeliQualifierNote: notes[index][9],
            attackHeliQualifier: element[10],
            attackHeliQualifierNote: notes[index][10],
            jetQualifier: element[11],
            jetQualifierNote: notes[index][11]
        };

        usersObjects.push(object);
    });

    return usersObjects;
};

function getUserQualifications(callsign) {
    let row = getUserRow(callsign, "Квалификации");
    let qualificationsArray = QUALIFICATIONS_SHEET.getRange(row, 3, 1, 10).getValues()[0];

    return {
        "КМБ": qualificationsArray[0] !== "",
        "Медик": qualificationsArray[1] !== "",
        "ПТ/ПВО-Специалист": qualificationsArray[2] !== "",
        "Сапёр-инженер": qualificationsArray[3] !== "",
        "Снайпер": qualificationsArray[4] !== "",
        "Оператор Бронетехники": qualificationsArray[5] !== "",
        "Пилот транспортного вертолёта": qualificationsArray[6] !== "",
        "Пилот лёгкого вертолёта": qualificationsArray[7] !== "",
        "Пилот боевого вертолёта": qualificationsArray[8] !== "",
        "Пилот Самолёта": qualificationsArray[9] !== "",
    };
};


function setQualifications(callsign, qual, whom, comment) {
    let row = getUserRow(callsign, "Квалификации");
    let col = getHeaderColoumnNum(qual, "Квалификации");

    if (row < 2 || col < 1) {
        Logger.log([callsign, qual, whom]);
        throw 'Invalid data provided';
    };

    QUALIFICATIONS_SHEET.getRange(row, col).setValue(whom);
    QUALIFICATIONS_SHEET.getRange(row, col).setNote(comment);

    let eventName = "";
    let targetInfo = callsign;
    if (whom !== "") {
        eventName = "Выдача квалификации";
        targetInfo = targetInfo + " (" + qual + ", " + whom + ")"; 
    } else {
        eventName = "Отзыв квалификации";
        targetInfo = targetInfo + " (" + qual + ")"; 
    };

    createLogEntry(eventName, targetInfo);

    SpreadsheetApp.flush();
    return true;
};