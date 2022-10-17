function addMail(callsign, gmail) {

  let row = getUserRow(callsign, "Пользователи");
  let col = getHeaderColoumnNum("Mail", "Пользователи");

  if (row < 2 || col < 1) {
    Logger.log([callsign, gmail]);
    throw 'Invalid data provided';
  };

  USERS_SHEET.getRange(row, col).setValue(gmail.toLowerCase());

  return true;
};