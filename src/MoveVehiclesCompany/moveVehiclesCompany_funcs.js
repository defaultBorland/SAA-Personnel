//
function checkVehiclesStatuses() {
    let vehiclesSheetFobStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 4, VEHICLES_SHEET_FOB_ROWS, 1).getValues();
    let vehiclesSheetBaseStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 4, VEHICLES_SHEET_BASE_SLOTS, 1).getValues();

    function isDayHasCome(string_with_date) {
        let today = new Date();
        let targetDate = string_with_date.slice(string_with_date.indexOf("(") + 1, string_with_date.indexOf(")"));
        targetDate = new Date(targetDate.split(".").reverse());

        return today >= targetDate;
    };

    for (row of vehiclesSheetFobStatuses) {
        if (row[0] !== "") {
            if (isDayHasCome(row[0])) {
                row[0] = "В резерве";
            };
        };
    };

    VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 4, VEHICLES_SHEET_FOB_ROWS, 1).setValues(vehiclesSheetFobStatuses);

    for (row of vehiclesSheetBaseStatuses) {
        if (row[0] !== "") {
            if (isDayHasCome(row[0])) {
                row[0] = "В резерве";
            };
        };
    };

    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 4, VEHICLES_SHEET_BASE_SLOTS, 1).setValues(vehiclesSheetBaseStatuses);

    SpreadsheetApp.flush();
};

//
function removeLostSoldVehicles(place) {

    if (!place) { place = "Fob" };

    let namesRange, statusesRange, placeRange = "";
    if (place === "Fob") {
        namesRange = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 1, VEHICLES_SHEET_FOB_ROWS, 1);
        statusesRange = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 3, VEHICLES_SHEET_FOB_ROWS, 2);
    } else { // Base
        namesRange = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1);
        statusesRange = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2);
    };

    let vehiclesSheetFobNames = namesRange.getValues();
    let vehiclesSheetFobStatuses = statusesRange.getValues();

    let lostVehiclesNames = [];
    let lostVehiclesStatuses = [];

    for (let i = 0; i < vehiclesSheetFobNames.length; i++) {
        if (vehiclesSheetFobNames[i][0] !== "") {
            if (["Потеряно", "Продано", "Модифицировано"].includes(vehiclesSheetFobStatuses[i][1].split(" ")[0])) {
                lostVehiclesNames.push([vehiclesSheetFobNames[i][0]]);
                lostVehiclesStatuses.push([vehiclesSheetFobStatuses[i][0], vehiclesSheetFobStatuses[i][1]]);

                vehiclesSheetFobNames[i][0] = vehiclesSheetFobStatuses[i][0] = vehiclesSheetFobStatuses[i][1] = "";
            };
        };
    };

    if (lostVehiclesNames.length > 0) {
        let lastRowLostVehiclesIndex = VEHICLES_SHEET.getLastRow();

        namesRange.setValues(vehiclesSheetFobNames);
        statusesRange.setValues(vehiclesSheetFobStatuses);

        for (let i = 0; i < lostVehiclesNames.length; i++) {
            VEHICLES_SHEET.appendRow([lostVehiclesNames[i][0], "", lostVehiclesStatuses[i][0], lostVehiclesStatuses[i][1], "", "", "", ""]);
        };

        SpreadsheetApp.flush();

        VEHICLES_SHEET.getRange(lastRowLostVehiclesIndex, 2, 1, 1).copyTo(VEHICLES_SHEET.getRange(lastRowLostVehiclesIndex + 1, 2, VEHICLES_SHEET.getLastRow() - lastRowLostVehiclesIndex, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
        VEHICLES_SHEET.getRange(lastRowLostVehiclesIndex, 5, 1, 4).copyTo(VEHICLES_SHEET.getRange(lastRowLostVehiclesIndex + 1, 5, VEHICLES_SHEET.getLastRow() - lastRowLostVehiclesIndex, 4), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
    };
};

function getVehiclesSlotsFromFob() {
    const vehiclesTypes = ["Автомобиль", "КШМ", "БТР", "БМП", "Танк", "Вертолёт", "Судно", "БПЛА / Мотоцикл / Турель"];
    let typeIndex = -1;
    let vehicles = [];

    let vehiclesSheetData = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 1, VEHICLES_SHEET_FOB_ROWS, 4).getValues(); // Col #0 is header for category or vehicle name

    for (let i = 0; i < VEHICLES_SHEET_FOB_ROWS; i++) {
        if (vehiclesSheetData[i][0] !== "" && vehiclesTypes.some(type => type.includes(vehiclesSheetData[i][0].split(" ")[0]))) {
            typeIndex += 1;
        } else {
            let vehicle = new Object;
            if (vehiclesSheetData[i][0] !== "") {
                vehicle.name = vehiclesSheetData[i][0];
                vehicle.type = vehiclesTypes[typeIndex];
                vehicle.getBy = vehiclesSheetData[i][2];
                vehicle.status = vehiclesSheetData[i][3];
            } else {
                vehicle.name = "Пусто";
                vehicle.type = vehiclesTypes[typeIndex];
                vehicle.status = "";
            };
            vehicles.push(vehicle);
        };
    };

    return vehicles;
};

function getVehiclesSlotsFromBase() {
    vehiclesSheetData = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 4).getValues();

    let vehicles = [];
    for (vehicleRow of vehiclesSheetData) {
        let vehicle = new Object;
        if (vehicleRow[0] !== "") {
            vehicle.name = vehicleRow[0];
            vehicle.type = vehicleRow[1];
            vehicle.getBy = vehicleRow[2];
            vehicle.status = vehicleRow[3];
        } else {
            vehicle.name = "Пусто";
        };
        vehicles.push(vehicle);
    };

    return vehicles;
};

function getMoveVehiclesCompanyData() {
    let today = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy").split(".").reverse();

    let vehiclesFob = getVehiclesSlotsFromFob();
    let vehiclesBase = getVehiclesSlotsFromBase();
    for (vehicle of vehiclesBase) {
        if (["БПЛА", "Мотоцикл", "Турель"].includes(vehicle.type)) {
            vehicle.type = "БПЛА / Мотоцикл / Турель";
        };
    };

    return [today, vehiclesFob, vehiclesBase];
};

function moveVehiclesCompany(vehiclesFob, vehiclesBase) {

    function vehicleSorter(a, b) {
        if (a.name === "Пусто") { return 1 };
        if (b.name === "Пусто") { return -1 };

        if (a.type && b.type) {
            if (a.type.localeCompare(b.type)) { return a.type.localeCompare(b.type) };
        };
        if (a.name.localeCompare(b.name) !== 0) { return a.name.localeCompare(b.name) };
        return b.status.localeCompare(a.status)
    };

    if (vehiclesBase.length !== VEHICLES_SHEET_BASE_SLOTS) {
        Logger.log(vehiclesBase.length);
        throw 'Base vehicles slots and count missmatch.';
    };

    if (vehiclesFob.length !== VEHICLES_SHEET_FOB_SLOTS) {
        Logger.log(vehiclesFob.length);
        throw 'Fob vehicles slots and count missmatch.';
    };

    vehiclesBase = vehiclesBase.sort(vehicleSorter);

    // BASE
    let vehiclesBaseNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).getValues();
    let vehiclesBaseStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).getValues();

    for (let i = 0, k = vehiclesBase.length; i < k; i++) {
        if (vehiclesBase[i].name !== "Пусто") {
            vehiclesBaseNames[i][0] = vehiclesBase[i].name;
            vehiclesBaseStatuses[i] = [vehiclesBase[i].getBy, vehiclesBase[i].status];
        } else {
            vehiclesBaseNames[i][0] = "";
            vehiclesBaseStatuses[i] = ["", ""];
        };
    };

    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 1).setValues(vehiclesBaseNames);
    VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 3, VEHICLES_SHEET_BASE_SLOTS, 2).setValues(vehiclesBaseStatuses);


    // FOB
    const vehiclesTypes = ["Автомобиль", "КШМ", "БТР", "БМП", "Танк", "Вертолёт", "Судно", "БПЛА / Мотоцикл / Турель"];
    let typeIndex = -1;

    let vehiclesFobNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 1, VEHICLES_SHEET_FOB_ROWS, 1).getValues(); // Col is header for category or vehicle name
    let vehiclesFobStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 3, VEHICLES_SHEET_FOB_ROWS, 2).getValues();
    let vehicles = [];

    for (let i = 0, k = 0; i < VEHICLES_SHEET_FOB_ROWS; i++) {
        if (vehiclesFobNames[i][0] !== "" && vehiclesTypes.some(type => type.includes(vehiclesFobNames[i][0].split(" ")[0]))) {
            typeIndex += 1;
            vehicles = vehiclesFob.filter(vehicle => { return vehicle.type === vehiclesTypes[typeIndex] }).sort(vehicleSorter);
            k = 0;
        } else {
            if (vehicles[k].name !== "Пусто") {
                vehiclesFobNames[i][0] = vehicles[k].name;
                vehiclesFobStatuses[i] = [vehicles[k].getBy, vehicles[k].status];
                k++;
            } else {
                vehiclesFobNames[i][0] = "";
                vehiclesFobStatuses[i] = ["", ""];
            };
        };
    };

    VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 1, VEHICLES_SHEET_FOB_ROWS, 1).setValues(vehiclesFobNames);
    VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 3, VEHICLES_SHEET_FOB_ROWS, 2).setValues(vehiclesFobStatuses);


    // Logging
    let string = "";
    if (vehiclesBase.filter(vehicle => { return vehicle.isMoved }).length > 0) {
        string += "ФОБ ➝ База:" + "\n" + vehiclesBase.filter(vehicle => { return vehicle.isMoved }).map(vehicle => {return vehicle.name}).join(", ");
    };

    if (vehiclesFob.filter(vehicle => { return vehicle.isMoved }).length > 0) {
        if (string !== "") { string += "\n\n" };
        string += "База ➝ ФОБ:" + "\n" + vehiclesFob.filter(vehicle => { return vehicle.isMoved }).map(vehicle => {return vehicle.name}).join(", ");
    };

    createLogEntry("Передислокация техники", string);

    SpreadsheetApp.flush();
};