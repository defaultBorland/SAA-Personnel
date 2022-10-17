//
// Set new vehicles getBy field

function getCapturedVehiclesCompanyData() {
    let today = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy").split(".").reverse();

    let vehiclesShop = getVehiclesFromEncyclopedia();
    let vehiclesFob = getVehiclesSlotsFromFob();

    return [today, vehiclesShop, vehiclesFob];
};

function regCapturedVehiclesCompany(vehiclesFob) {

    function vehicleSorter(a, b) {
        if (a.name === "Пусто") { return 1 };
        if (b.name === "Пусто") { return -1 };

        if (a.type && b.type) {
            if (a.type.localeCompare(b.type)) { return a.type.localeCompare(b.type) };
        };
        if (a.name.localeCompare(b.name) !== 0) { return a.name.localeCompare(b.name) };
        return b.status.localeCompare(a.status)
    };

    if (vehiclesFob.length !== VEHICLES_SHEET_FOB_SLOTS) {
        Logger.log(vehiclesFob.length);
        throw 'Fob vehicles slots and count missmatch.';
    };

    // FOB
    const vehiclesTypes = ["Автомобиль", "КШМ", "БТР", "БМП", "Танк", "Вертолёт", "Судно", "БПЛА / Мотоцикл / Турель"];
    let typeIndex = -1;

    let vehiclesFobNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 1, VEHICLES_SHEET_FOB_ROWS, 1).getValues(); // Col is header for category or classname
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
    if (vehiclesFob.filter(vehicle => { return vehicle.isCaptured }).length > 0) {
        string += "Захваченная техника:" + "\n" + vehiclesFob.filter(vehicle => { return vehicle.isCaptured }).map(vehicle => {return vehicle.name}).join(", ");
    };

    createLogEntry("Оформление захваченной техники", string);

    SpreadsheetApp.flush();
};