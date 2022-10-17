//
function getVehiclesFromEncyclopedia() {
    let divider = getColoumnData("Класснейм", "Энциклопедия техники").findIndex(text => { return text === "Комплекты" }) + 2;
    let vehiclesSheetData = ENCYCLOPEDIA_SHEET.getRange(2, 1, divider - 2, 7).getValues().filter(row => {return row[1] !== ""});

    let vehiclesArray = [];
    for (vehicleRow of vehiclesSheetData) {
        let vehicle = new Object;

        vehicle.classname = vehicleRow[0];
        vehicle.name = vehicleRow[1];
        vehicle.type = vehicleRow[2];
        vehicle.cost = vehicleRow[5];

        vehiclesArray.push(vehicle);
    };

    return vehiclesArray;
};

function getBuyVehiclesCompanyData() {
    let vehiclesEncyclopedia = getVehiclesFromEncyclopedia();

    let funds = COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), COMPANY_SHEET.getLastColumn()).getValue();
    funds -= 3000000;
    if (funds < 0) {funds = 0};

    let vehiclesSlots = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).getValues().filter(row => {return row[0] === ""}).length;

    let companyData = {
        prevMissionDate: getPrevMissionDate(),
        companyFunds: funds,
        freeSlots: vehiclesSlots,
        vehiclesEncyclopedia: vehiclesEncyclopedia
    };

    return companyData;
};

function buyVehiclesCompany(vehiclesNamesToBuy) {

    if (vehiclesNamesToBuy.length < 1) {
        throw 'Empty array';
    };

    let vehiclesNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).getValues();
    let vehiclesStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).getValues();

    if (vehiclesNames.filter(row => {return row[0] === ""}).length < vehiclesNamesToBuy.length) {
        throw 'Too many vehicles';
    };

    let vehicles = getVehiclesFromEncyclopedia();
    let vehiclesToBuy = [];

    for (vehicleName of vehiclesNamesToBuy) {
        let vehicle = vehicles.find(veh => {return veh.name === vehicleName});
        if (vehicle) {
            vehiclesToBuy.push(vehicle);
        } else {
            throw 'Data missmatch';
        };
    };

    let companyData = getBuyVehiclesCompanyData();
    let funds = companyData.companyFunds;
    let total = vehiclesToBuy.reduce((sum, vehicle) => sum + parseInt(vehicle.cost), 0);
    if (funds < total) {
        throw 'Insufficient funds to buy vehicles.';
    };

    let buyDate = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy");

    // TODO: Re-write logic someday
    let vehiclesToBuyCopy = [...vehiclesToBuy];

    for (let i = 0; i < vehiclesNames.length; i++) {
        if (vehiclesNames[i][0] === "") {
            let vehicle = vehiclesToBuyCopy.shift();
            vehiclesNames[i][0] = vehicle.name;
            vehiclesStatuses[i] = [
                "Куплено (" + buyDate + ")", 
                "В резерве"
            ];
            if (vehiclesToBuyCopy.length < 1) {break}; 
        };
    };

    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).setValues(vehiclesNames);
    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).setValues(vehiclesStatuses);
    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 8).sort([{column: 4, ascending: true}, {column: 1, ascending: true}]);

    // WRITE TO COMPANY SHEET
    let columnExpenses =  getHeaderColoumnNum("Прочие расходы", "Компания");
    let expensesRange = COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), columnExpenses);
    let cellValue = expensesRange.getValue();
    let cellComment = expensesRange.getNote();

    if (cellValue === "") {cellValue = 0}; 
    cellValue += total;

    let comment = "";

    for (vehicle of vehiclesToBuy) {
        comment += vehicle.name;
        comment += " - ";
        comment += vehicle.cost.toLocaleString('ru-RU') + " $\n";
    };

    if (cellComment.indexOf("Покупка") < 0) {
        comment = " Покупка: \n" + comment;
        if (cellComment !== "") {comment += "\n"};
        cellComment = comment + cellComment;
    } else {
        if (cellComment.indexOf("Модернизация") < 0) {
            cellComment += comment;
        } else {
            let modernIndex = cellComment.indexOf("Модернизация");
            Logger.log(["modernIndex", modernIndex]);
            let lastDollarIndex = cellComment.lastIndexOf("$", modernIndex - 1) + 2;
            cellComment = cellComment.slice(0, lastDollarIndex) + comment + cellComment.slice(lastDollarIndex);
        };
    };
    
    expensesRange.setValue(cellValue);
    expensesRange.setNote(cellComment);

    // CREATE LOG
    createLogEntry("Покупка техники", vehiclesNamesToBuy.join(", ") + " \n(Сумма: " + total.toLocaleString('ru-RU') + " $" + ")");

    SpreadsheetApp.flush();
};