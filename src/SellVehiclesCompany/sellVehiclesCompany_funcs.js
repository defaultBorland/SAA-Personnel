//
function getVehiclesFromBase() {
    vehiclesSheetData = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 8).getValues().filter(array => { return (array[0] !== "" && array[3] === "В резерве") });

    let vehiclesArray = [];
    for (vehicleRow of vehiclesSheetData) {
        let vehicle = new Object;

        vehicle.name = vehicleRow[0];
        vehicle.type = vehicleRow[1];
        vehicle.status = vehicleRow[3];
        vehicle.cost = vehicleRow[6];

        vehiclesArray.push(vehicle);
    };

    return vehiclesArray;
};

//
function sellVehiclesCompany(vehiclesNamesToSell) {
    if (vehiclesNamesToSell.length < 1) {
        throw 'Empty array';
    };

    let vehiclesNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).getValues();
    let vehiclesStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).getValues();
    let vehiclesData = getVehiclesFromEncyclopedia();
    let date = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy");

    let vehiclesToSell = [];

    for (vehicleName of vehiclesNamesToSell) {
        let vehicle = vehiclesData.find(veh => {return veh.name === vehicleName});
        if (vehicle) {
            vehiclesToSell.push(vehicle);
        } else {
            throw 'Data missmatch';
        };

        let index = vehiclesNames.findIndex((row, index) => {return row[0] === vehicleName && vehiclesStatuses[index][1] === "В резерве"});
        if (index > -1) {
            vehiclesStatuses[index][1] = "Продано (" + date + ")";
        } else {
            throw 'Data missmatch';
        };
    };

    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).setValues(vehiclesNames);
    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).setValues(vehiclesStatuses);
    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 8).sort([{column: 4, ascending: true}, {column: 1, ascending: true}]);


    let total = vehiclesToSell.reduce((sum, vehicle) => sum + Math.floor(parseInt(vehicle.cost) * 0.2), 0);
    
    // WRITE TO COMPANY SHEET
    let columnIncome =  getHeaderColoumnNum("Доход К.", "Компания");
    let incomeRange = COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), columnIncome);
    let cellValue = incomeRange.getValue();
    let cellComment = incomeRange.getNote();
    if (cellValue === "") {cellValue = 0}; 
    if (cellComment === "") {cellComment = " Продажа: \n"}; 

    cellValue += total;
    for (vehicle of vehiclesToSell) {
        cellComment += vehicle.name;
        cellComment += " - ";
        cellComment += Math.floor(vehicle.cost * 0.2).toLocaleString('ru-RU') + " $\n";
    };
    
    incomeRange.setValue(cellValue);
    incomeRange.setNote(cellComment);

    // CREATE LOG
    createLogEntry("Продажа техники", vehiclesNamesToSell.join(", ") + " \n(Сумма: " + total.toLocaleString('ru-RU') + " $" + ")");

    SpreadsheetApp.flush();

    removeLostSoldVehicles("Base");
};