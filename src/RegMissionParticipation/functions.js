function payDay() {
  var isAdmin = checkIsAdmin();

  if (!isAdmin) {
    Logger.log(Session.getActiveUser().getEmail());
    throw 'Ваш уровень доступа не позволяет вам делать это.';
  };

  var lastUserIndex = USERS_SHEET.getLastRow() - 1;

  var allUsersMoneyRange = USERS_SHEET.getRange(2, getHeaderColoumnNum("Balance", "Пользователи"), lastUserIndex, 1).getA1Notation();
  var usersSalarys = USERS_SHEET.getRange(2, getHeaderColoumnNum("Payments", "Пользователи"), lastUserIndex, 1).getValues();

  var usersStartBalance = USERS_SHEET.getRange(allUsersMoneyRange).getValues();
  var usersEndBalance = usersStartBalance.map(function (value, index) {
    return [Math.floor(value[0] + usersSalarys[index][0])]; // value[0] - allUsersMoneyRange return Two Dim Array, where each array is row
  });

  USERS_SHEET.getRange(allUsersMoneyRange).setValues(usersEndBalance);
  
  MAIN_SHEET.getRange(18, 6).setValue("✔");
  USERS_SHEET.getRange(2, getHeaderColoumnNum("LMS", "Пользователи"), USERS_SHEET.getLastRow() - 1, 1).setValue('N');

  createLogEntry("Произведение выплат", "Участники миссии");
  SpreadsheetApp.flush();

  return true;
};

function assignMedal(type, callsign) {

  var row = getUserRow(callsign, "Пользователи");
  var col = getHeaderColoumnNum("Medals", "Пользователи");
  var medal = "";

  switch (type) {
    case "Combat":
      medal = "♦";
      break;
    case "Zeus":
      medal = "🗲";
      break;
    default:
    case "Expirience":
      medal = "★"
      break;
  };

  USERS_SHEET.getRange(row, col).setValue(USERS_SHEET.getRange(row, col).getValue() + medal);

  createLogEntry("Присвоение заслуги", callsign + ' (' + medal + ')');
  SpreadsheetApp.flush();

  return true;
};

function isOfficerRank(rank) {
  let ranks = ["PV1", "PV2", "SPC", "SGT", "SSG", "MSG", "SMC", "WO1", "CWO", "2LT", "1LT", "CPT"];
  let index = ranks.findIndex(function(element) {
      return element == rank;
  });
  if (index > 2) {return true} else {return false};
};

function nextUserRank(callsign) {

  let ranks = ["PV1", "PV2", "SPC", "SGT", "SSG", "MSG", "SMC", "WO1", "CWO", "2LT", "1LT", "CPT"];
  var col = getHeaderColoumnNum("Rank", "Пользователи");
  var row = getUserRow(callsign, "Пользователи");

  var curRank = USERS_SHEET.getRange(row, col).getValue();
  var nextRank = ranks[ranks.indexOf(curRank) + 1];

  return nextRank;
};

/**
 * 
 * @param {String} rank 
 * @param {String} medals 
 * @param {String} missionsAsPmc 
 * @returns {Boolean} returns true if user can be promoted, otherwise - false
 */
function canBePromoted(rank, medals, missionsAsPmc) {

  let ranks = ["PV2", "SPC", "SGT", "SSG", "MSG", "SMC", "WO1", "CWO", "2LT", "1LT", "CPT"];
  let medalsNeeded = [0, 2, 999, 4, 5, 6, 7, 8, 9, 10, 11];

  if (rank === "PV1") {
    if (missionsAsPmc === 3) {
      return true;
    };
  } else {
    let nextRank = ranks[ranks.indexOf(rank) + 1];
    let medalsCount = Array.from(medals).length;

    if (medalsCount >= medalsNeeded[ranks.indexOf(nextRank)]) {
      return true;
    };
  };

  return false;
};

function canSomeoneBePromoted(callsignArray) {
  let callsignsToPromote = [];

  let users = getUsersData("Пользователи");
  users = users.filter(function (user) {
    return callsignArray.includes(user.name);
  });

  users.forEach(function (user) {
    if (canBePromoted(user.rank, user.medals, user.missionsAsPmc)) {
      callsignsToPromote.push(user.name);
    };
  });

  return callsignsToPromote;
};

function promote(callsign) {

  let nextRank = nextUserRank(callsign);
  setRank(callsign, nextRank)

  createLogEntry("Повышение", callsign + ' ( -> ' + nextRank + ')');

  return true;
};

function regUsersParticipation() {
  let isAdmin = checkIsAdmin();

  if (!isAdmin) {
    Logger.log(Session.getActiveUser().getEmail());
    throw 'Ваш уровень доступа не позволяет вам делать это.';
  };

  let confirmation = Browser.msgBox('Было ли проставлено участие?', Browser.Buttons.YES_NO); 
  if (confirmation != 'yes') { return };

  let usersLMS = getColoumnData("LMS", "Пользователи");
  let usersNames = getColoumnData("Callsign", "Пользователи");
  let usersMissionCountRange = USERS_SHEET.getRange(2, getHeaderColoumnNum("MissionAsPMC", "Пользователи"), USERS_SHEET.getLastRow() - 1, 3); // MissionAsPMC, MissionAsZeus, MissionAsCom
  let usersMissionCountArrays = usersMissionCountRange.getValues();

  let today = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy")
  let usersLastPartDatesRange = USERS_SHEET.getRange(2, getHeaderColoumnNum("LastMissionDate", "Пользователи"), USERS_SHEET.getLastRow() - 1);
  let usersLastPartDatesValues = usersLastPartDatesRange.getValues();

  usersMissionCountArrays.forEach(function (userCountMissions, userRow) {

    if (usersLMS[userRow] === 'N') return;

    usersLastPartDatesValues[userRow][0] = today;

    switch (usersLMS[userRow]) {
      case "C":
        userCountMissions[2] = userCountMissions[2] + 1;
      case "R":
      case "F":
      case "O":
      case "Y":
        userCountMissions[0] = userCountMissions[0] + 1;
        if (userCountMissions[0] % 10 === 0) {
          let callsign = usersNames[userRow];
          assignMedal("Expirience", callsign);
        };
        break;
      case "Z":
        userCountMissions[1] = userCountMissions[1] + 1;
        if (userCountMissions[1] % 8 === 0) {
          let callsign = usersNames[userRow];
          assignMedal("Zeus", callsign);
        };
        break;
      default:
      case "N":
        break;
    };
  });
  usersMissionCountRange.setValues(usersMissionCountArrays);
  usersLastPartDatesRange.setValues(usersLastPartDatesValues);

  usersNames = usersNames.filter(function (element, index) {
    return usersLMS[index] !== "N";
  });

  let usersCount = usersNames.length;

  usersNames = canSomeoneBePromoted(usersNames);
  usersNames.forEach(function (callsign) {
    promote(callsign);
  });

  let zeusCount = usersLMS.filter(function(element) {return element == "Z"}).length;
  usersCount -= zeusCount;
  
  createLogEntry("Зарегистрировано участие в миссии", "Участники миссии"  + ' (' + usersCount + ' + ' + zeusCount + ')');
  payDay();

  SpreadsheetApp.flush();
  return true;
};