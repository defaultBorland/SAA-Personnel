function addUser (userData) {

  let user = getUserData(userData.name, userData.steamid, userData.mail);
  if (typeof user !== 'undefined') {throw 'UserPresentAlready'};

  OPS_SHEET.appendRow([""]);
  USERS_SHEET.appendRow([userData.mail.toLowerCase(),userData.steamid,userData.name,2000,"PV1","Стрелок","Н/Д",'',false,false,0,0,0,0,'N']);
  USERS_SHEET.getRange(USERS_SHEET.getLastRow()-1,16,1,2).copyTo(USERS_SHEET.getRange(USERS_SHEET.getLastRow(),16,1,2), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

  QUALIFICATIONS_SHEET.appendRow([userData.steamid, userData.name]);
  QUALIFICATIONS_SHEET.getRange(QUALIFICATIONS_SHEET.getLastRow()-1,1,1,QUALIFICATIONS_SHEET.getLastColumn()).copyTo(QUALIFICATIONS_SHEET.getRange(QUALIFICATIONS_SHEET.getLastRow(),1,1,QUALIFICATIONS_SHEET.getLastColumn()), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);

  createLogEntry("Найм оперативника", userData.name);
  
  return true;
};