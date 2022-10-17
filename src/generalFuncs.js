//
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}

/**
* Return one-dimensional array of elements combined from two-dimensial array 
*
* @param {Array} twoDimArr Two-dimensial Array kind of [["A"],["B"],["C"]]
* @returns {Array} One-dimensial array
*/
function simplifiedArray(twoDimArr) {

  var array = [];
  for (var row in twoDimArr) {
    for (var col in twoDimArr[row]) {
      array.push(twoDimArr[row][col]);
    };
  };

  return array;
};

/**
* 
* @param {String} sheetName Name of the sheet where data will be extracted. Possible values are "Пользователи", "Демобилизованные" and "Квалификации".
* @returns {Array.<User>} Array of objects, which properties depends on passed sheetName 
*
* @typedef {Object} User
*/
function getUsersData(sheetName = 'Пользователи') {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  let sheetData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  let resultArray = [];

  if (sheetName === "Пользователи") {
    for (let userRow of sheetData) {
      let user = new Object;
      [
        user.mail = '',
        user.steamid,
        user.name,
        user.balance = 2000,
        user.rank = 'PVT',
        user.primclass = '',
        user.secclass,
        user.medals = '',
        user.isAdmin = false,
        user.isInstructor = false,
        user.missionsAsPmc = 0,
        user.missionsAsZeus = 0,
        user.missionAsCom = 0,
        user.missionTotal = 0,
        user.missionParticipation = 'N'
      ] = userRow;
      resultArray.push(user);
    };
  } else { // "Демобилизованные"
    for (let userRow of sheetData) {
      let user = new Object;
      [
        user.mail = '',
        user.steamid = '',
        user.name,
        user.balance = 0,
        user.rank = 'PVT',
        user.medals = '',
        user.comment = '',
        user.modified = ''
      ] = userRow;
      resultArray.push(user);
    };
  };

  return resultArray;
};

/**
* Return one-based index of user in selected sheet
*
*@param {String} datatype headername for search (Callsign, Позывной and Квалифицируемый are aliases)
*@param {String} sheetName exact sheet name for search
*
*@returns {Number} Column number of datatype on provided sheet
*/
function getHeaderColoumnNum(datatype, sheetName) {

  var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0];

  var headerIndex = 0;
  let nameColoumns = ["Callsign", "Позывной", "Квалифицируемый"];
  if (nameColoumns.includes(datatype)) {
    for (let nameColoumn of nameColoumns) {
      let index = headers.findIndex(function (header) { return nameColoumn === header });
      if (index > -1) {
        headerIndex = index + 1;
        break;
      };
    };
    if (headerIndex < 0) {
      Logger.log([datatype, sheetName]);
      throw "getHeaderColoumnNum: No coloumn found";
    };
  } else {
    headerIndex = headers.indexOf(datatype) + 1;
  };

  return headerIndex;
};

/**
* Return string, composed from current user callsign and server date-time
*@returns {String} String of date and current logged in user name
*/
function createTimestamp() {
  var user = getUserData(getGMail()).name;
  var date = Utilities.formatDate(new Date(), "GMT+3", "HH:mm:ss dd/MM/yy")

  return String(date) + " [" + user + "]";
};

/**
* Set timestamp on provided sheet and row
*@param row List-based index of user on corresponding sheet
*@param sheetName exact sheet name for writing log entry
*/
function modifiedLog(row, sheetName) {

  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var date = createTimestamp();

  ws.getRange(row, getHeaderColoumnNum("Modified", sheetName)).setValue(date);
};

/**
* Return all users selected data from Active or Demobilized sheet
*@param datatype headername for data extraction (Callsign, Позывной and Квалифицируемый are aliases)
*@param sheetName exact sheet name for data extraction
*/
function getColoumnData(datatype, sheetName) {

  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = [];

  var headerIndex = getHeaderColoumnNum(datatype, sheetName);
  if (headerIndex > -1) {

    data = ws.getRange(2, headerIndex, ws.getLastRow() - 1).getValues();
    data = simplifiedArray(data);
  } else {
    Logger.log([datatype, sheetName]);
    throw "getColoumnData: No data found";
  };

  return data;
};

/**
* Return list-based index of user
*
*@param {String} callsign name of user (Callsign, Позывной and Квалифицируемый are aliases)
*@param {String} sheetName exact sheet name for data extraction
*
*@returns {Number} index of user row on provided sheet
*/
function getUserRow(callsign, sheetName) {

  var users = getColoumnData("Callsign", sheetName);
  var index = users.indexOf(callsign) + 2;

  return index;
};

/**
* Return object of user
*
*@param {String} userIdentity1 String containing Mail, SteamID or Callsign to search for
*@param {String} [userIdentity2] Optional: String containing Mail, SteamID or Callsign to search for
*@param {String} [userIdentity3] Optional: String containing Mail, SteamID or Callsign to search for
*@returns {User} Object with user or undefined
*/
function getUserData(userIdentity1, userIdentity2, userIdentity3) { // Mail, SteamID, Callsign

  let targetUser;
  let userIdentities = [];
  if (userIdentity1) {userIdentities.push(userIdentity1)};
  if (userIdentity2) {userIdentities.push(userIdentity2)};
  if (userIdentity3) {userIdentities.push(userIdentity3)};

  if (userIdentities.length < 1) throw 'fnc_getUserData | Error: No valid user data to search for';

  let users = getUsersData("Пользователи");

  targetUser = users.find(function (user) {
    return (
      userIdentities.includes(user.name) ||
      userIdentities.includes(user.steamid) ||
      userIdentities.includes(user.mail)
    );
  });

  if (typeof targetUser === "undefined") {
    users = getUsersData("Демобилизованные");
    targetUser = users.find(function (user) {
      return (
        userIdentities.includes(user.name) ||
        userIdentities.includes(user.steamid) ||
        userIdentities.includes(user.mail)
      );
    });
  };

  return targetUser;
};

/**
* Return user gmail
*
*@returns {String} GMail
*/
function getGMail() {

  return Session.getActiveUser().getEmail();
};

/**
* Return true if current logged in user is admin
*
*@returns {Boolean} IsAdmin
*/
function checkIsAdmin() {

  var user = getUserData(getGMail());

  return user.isAdmin;
};

/**
* Return true if current logged in user is instructor
*
*@returns {Boolean} IsInstructor
*/
function checkIsInstructor() {

  var user = getUserData(getGMail());

  return user.isInstructor || user.isAdmin;
};



/**
 * Insert row in sheet by index with provided rowData
 * @param {*} sheet 
 * @param {Array} rowData 
 * @param {Number} optIndex 
 */
function insertRow(sheet, rowData, optIndex = 2) {
  var lock = LockService.getScriptLock(); // To make our function concurrent safe (it can be triggered multiple times in parallel and won't mess up) you have to lock it.
  lock.waitLock(30000);
  try { 
    sheet.insertRowBefore(optIndex).getRange(optIndex, 1, 1, rowData.length).setValues([rowData]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
};

/**
* Creates new entry on Log sheet
*@param {String} action String to be written in "Событие" column
*@param {String} target String to be written in "Цель" column
*
*@returns {Boolean} Is Successfully created
*/
function createLogEntry(action, target) {

  var timestamp = createTimestamp();

  insertRow(LOGS_SHEET, [action, target, timestamp]);

  var range = LOGS_SHEET.getRange(2, 1, 1, 3);

  //setBorder(top, left, bottom, right, vertical, horizontal, color, style)
  range.setBorder(null, null, true, null, null, null, "black", SpreadsheetApp.BorderStyle.DASHED);
  range.setBorder(null, null, null, null, true, null, "black", SpreadsheetApp.BorderStyle.SOLID);
  range.setBorder(null, true, null, true, null, null, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  return true;
};