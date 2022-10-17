function rehireUser(callsign) {

  var userData = getUserData(callsign);
  let secondClass = "Н/Д";
  if (isOfficerRank(userData.rank)) {secondClass = "-"};
  
  OPS_SHEET.appendRow([""]);
  
  USERS_SHEET.appendRow([userData.mail, userData.steamid, userData.name, userData.balance, userData.rank, "Стрелок", secondClass, userData.medals, false, false, 0, 0, 0, 0, 'N']);
  USERS_SHEET.getRange(USERS_SHEET.getLastRow()-1,16,1,2).copyTo(USERS_SHEET.getRange(USERS_SHEET.getLastRow(),16,1,2), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

  FIRED_USERS_SHEET.deleteRow(getUserRow(callsign, "Демобилизованные"));

  createLogEntry("Восстановление оперативника", callsign);

  return true;
};