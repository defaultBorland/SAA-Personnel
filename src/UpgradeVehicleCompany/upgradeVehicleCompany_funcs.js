//
function getUpgradeVehicleCompanyData() {
  let today = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy").split(".").reverse();

  let vehiclesBase = getVehiclesFromBase().filter(vehicle => { return vehicle.status === "В резерве" });
  let vehiclesEncyclopedia = getVehiclesFromEncyclopedia();

  let funds = COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), COMPANY_SHEET.getLastColumn()).getValue();
  funds -= 3000000;
  if (funds < 0) { funds = 0 };

  return [vehiclesBase, vehiclesEncyclopedia, funds, today]
};

function upgradeVehicleBase(upgradeData) {
  let [initialVehicles, cost, duration, resultVehicleName] = upgradeData;

  if (initialVehicles.length < 1) {
    throw 'Not enough initial vehicles';
  };

  let vehicles = getVehiclesFromEncyclopedia();
  if (!vehicles.find(vehicle => vehicle.name === resultVehicleName)) {
    throw 'Data missmatch';
  };

  let companyData = getBuyVehiclesCompanyData();
  let funds = companyData.companyFunds;
  if (funds < cost) {
    throw 'Insufficient funds to buy vehicles.';
  };


  let today = new Date();
  
  function setModifiedVehicles(vehiclesNames, date) {
    let vehiclesSheetNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).getValues();
    vehiclesSheetNames = simplifiedArray(vehiclesSheetNames);
    let vehiclesSheetStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 4, VEHICLES_SHEET_BASE_SLOTS, 1).getValues();

    for (vehicleName of vehiclesNames) {
      let index = vehiclesSheetNames.findIndex(function (name, index) {
        return vehicleName === name && vehiclesSheetStatuses[index][0] === "В резерве";
      });
      if (index > -1) {
        vehiclesSheetStatuses[index][0] = "Модифицировано (" + Utilities.formatDate(date, "GMT+3", "dd.MM.yyyy") + ")";
      };
    };

    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 4, VEHICLES_SHEET_BASE_SLOTS, 1).setValues(vehiclesSheetStatuses);

    return true;
  };

  setModifiedVehicles(initialVehicles, today);

  removeLostSoldVehicles("Base");

  let vehiclesSheetNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).getValues();
  let vehiclesSheetStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).getValues();


  // ADD NEW VEHICLE
  let newVehicle = vehicles.find(vehicle => vehicle.name === resultVehicleName);
  let emptySlotIndex = simplifiedArray(vehiclesSheetNames).findIndex(nameCell => nameCell === "");
  if (emptySlotIndex > -1) {
    let upgradeDate = new Date();
    upgradeDate.setDate(today.getDate() + duration);
    let status = "Модернизация (" + Utilities.formatDate(upgradeDate, "GMT+3", "dd.MM.yyyy") + ")";

    vehiclesSheetNames[emptySlotIndex][0] = newVehicle.name;
    vehiclesSheetStatuses[emptySlotIndex] = [
      "Модифицировано (" + Utilities.formatDate(upgradeDate, "GMT+3", "dd.MM.yyyy") + ")",
      status
    ];
  } else {
    throw 'No empty slot to store new vehicle.';
  };

  VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).setValues(vehiclesSheetNames);
  VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).setValues(vehiclesSheetStatuses);

  // WRITE TO COMPANY SHEET
  let columnExpenses = getHeaderColoumnNum("Прочие расходы", "Компания");
  let expensesRange = COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), columnExpenses);

  let cellValue = expensesRange.getValue();
  let cellComment = expensesRange.getNote();
  if (cellValue === "") { cellValue = 0 };
  if (cellComment.indexOf("Модернизация") < 0) {
    if (cellComment !== "") {cellComment += "\n"};
    cellComment += " Модернизация: \n"
  };
  cellComment += initialVehicles.join(" + ");
  cellComment += " ➝ ";
  cellComment += newVehicle.name;
  cellComment += " - ";
  cellComment += cost.toLocaleString('ru-RU') + " $\n";

  cellValue += cost;

  expensesRange.setValue(cellValue);
  expensesRange.setNote(cellComment);

  let logMsg = initialVehicles.join(" + ");
  if (cost > 0) {
    logMsg += " + " + cost.toLocaleString('ru-RU') + " $";
  };

  createLogEntry("Модернизация техники", logMsg + "\n➝\n" + resultVehicleName);

  checkVehiclesStatuses();

  VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 8).sort([{ column: 4, ascending: true }, { column: 1, ascending: true }]);
};