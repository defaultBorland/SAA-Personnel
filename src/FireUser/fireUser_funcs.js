function fireUser(callsign, comment) {

  var userData = getUserData(callsign);
  if (typeof userData === "undefined") {
    Logger.log(callsign);
    throw 'Invalid data provided';
  };
  
  FIRED_USERS_SHEET.appendRow([userData.mail, userData.steamid, userData.name, userData.balance, userData.rank,  userData.medals, comment]);
  modifiedLog(FIRED_USERS_SHEET.getLastRow(), "Демобилизованные");

  USERS_SHEET.deleteRow(getUserRow(callsign, "Пользователи"));

  if (!isOfficerRank(userData.rank)) {
    if (userData.rank === "SPC") {
      QUALIFICATIONS_SHEET.getRange(getUserRow(callsign, "Квалификации"), 4, 1, 10).setValue(""); // DONT ERASE KMB IF SPC
    } else {
      QUALIFICATIONS_SHEET.getRange(getUserRow(callsign, "Квалификации"), 3, 1, 11).setValue("");
    };
  };

  OPS_SHEET.deleteRow(OPS_SHEET.getLastRow());
  
  createLogEntry("Увольнение оперативника", callsign);

  return true;
};