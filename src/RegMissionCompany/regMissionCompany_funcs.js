/**
* @typedef {Object} missionData
* @returns {missionData}
*/
function getMissionCompanyData() {
    let usersCount = 0;
    let commanders = "";
    let zeuses = "";

    let usersNames = getColoumnData("Callsign", "Пользователи");
    let usersLMS = getColoumnData("LMS", "Пользователи");

    commanders = usersNames.filter(function (name, index) {
        return usersLMS[index] === "C";
    }).join(", ");

    zeuses = usersNames.filter(function (name, index) {
        return usersLMS[index] === "Z";
    }).join(", ");

    usersCount = usersLMS.filter(function (type, index) { return (usersLMS[index] !== "N" && usersLMS[index] !== "Z") }).length;

    let prevMissDate = getPrevMissionDate();
    let today = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy").split(".").reverse();

    let missionData = {
        usersCount: usersCount,
        commanders: commanders,
        zeuses: zeuses,
        prevMissionDate: prevMissDate,
        today: today
    };

    return missionData;
};

function getPrevMissionDate() {
    let prevMissDate = COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), 1).getDisplayValue().split(".").reverse();
    return prevMissDate;
};

/**
 * 
 * @param {String} place "FOB" or "Base"
 * @returns Array of Objects
 */
function getVehiclesCompany(place) {
    let vehiclesSheetData = [];
    if (place === "FOB") {
        vehiclesSheetData = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 1, VEHICLES_SHEET_FOB_ROWS, 8).getValues().filter(array => { return (array[0] !== "" && array[3] === "В резерве") });
    } else {
        vehiclesSheetData = VEHICLES_SHEET.getRange(VEHICLES_SHEET_BASE_START_ROW, 1, VEHICLES_SHEET_BASE_SLOTS, 8).getValues().filter(array => { return (array[0] !== "" && array[3] === "В резерве") });
    };

    let vehNames = vehiclesSheetData.map(array => { return array[0] });
    let vehLoadouts = getVehicleAmmunitionSets(vehNames);
    let vehicles = [];

    vehiclesSheetData.forEach(function (vehicle, index) {
        let vehicleObject = new Object;

        vehicleObject.name = vehicle[0];
        vehicleObject.type = vehicle[1];
        vehicleObject.getBy = vehicle[2];
        vehicleObject.status = vehicle[3];
        vehicleObject.ammunitionSets = vehLoadouts[index];
        vehicleObject.unitCost = vehicle[6];
        vehicleObject.maintenanceCost = vehicle[7];

        vehicles.push(vehicleObject);
    });

    return vehicles;
};

function getVehicleAmmunitionSets(vehiclesNames) {
    let divider = getColoumnData("Класснейм", "Энциклопедия техники").findIndex(text => { return text === "Комплекты" }) + 2;
    let vehicles = ENCYCLOPEDIA_SHEET.getRange(2, 1, divider - 2, 7).getValues();
    let complects = ENCYCLOPEDIA_SHEET.getRange(divider + 1, 1, ENCYCLOPEDIA_SHEET.getLastRow() - divider, 7).getValues();
    let vehiclesLoadouts = [];

    for (vehicleName of vehiclesNames) {
        let row = vehicles.findIndex(array => { return array[1] === vehicleName });
        let loadouts = [];

        if (vehicles[row][3] === "Комплекты") {
            row = complects.findIndex(array => { return array[1] === vehicleName });
            if (row > -1) {
                row += 1;
                while (row < complects.length && complects[row][1] === "" && complects[row][3] !== "") { // not eof && not new name && not empty complect line
                    loadouts.push(complects[row][3]);
                    row += 1;
                };
            };
        } else {
            loadouts.push([vehicles[row][3]]);
        };

        vehiclesLoadouts.push(loadouts);
    };

    return vehiclesLoadouts;
};

function getLoadoutsCosts(loadouts) {
    let costs = [];
    let _allLoadoutsAndCosts = ENCYCLOPEDIA_SHEET.getRange(2, 4, ENCYCLOPEDIA_SHEET.getLastRow() - 1, 2).getValues().filter(row => { return row[0] !== "" && row[1] > 0 });

    for (loadout of loadouts) {
        let _loadoutRow = _allLoadoutsAndCosts.find(row => { return row[0] === loadout });
        if (typeof _loadoutRow !== 'undefined') {
            costs.push(_loadoutRow[1]);
        } else {
            costs.push(0);
        };
    };

    return costs;
};

function getDailyMaintenanceCost() {
    let _vehiclesFOB = getVehiclesCompany("FOB");
    let _vehiclesBase = getVehiclesCompany("Base");

    let _vehiclesFOBMaintaince = _vehiclesFOB.reduce((sum, vehicle) => sum + parseInt(vehicle.maintenanceCost), 0);
    let _vehiclesBaseMaintaince = _vehiclesBase.reduce((sum, vehicle) => sum + parseInt(vehicle.maintenanceCost), 0);
    _vehiclesBaseMaintaince = Math.ceil(_vehiclesBaseMaintaince * 0, 5);

    return (_vehiclesFOBMaintaince + _vehiclesBaseMaintaince + 50000)
};

function regMissionCompany(missionData, vehiclesData) {

    function composeDeployedVehiclesData(vehicles) {
        if (vehicles.length < 1) { return ["", ""] };

        let vehiclesLoadoutsCosts = getLoadoutsCosts(vehicles.map(vehicle => { return vehicle.loadout }));
        let vehiclesLoadoutCost = 0;
        let vehString = " Развёртывание: \n";
        let vehRearmsString = "";

        if (vehicles.some(vehicle => { return vehicle.rearms > 0 })) {
            vehRearmsString = "Перевооружение: \n";
        };

        for (let i = 0; i < vehicles.length; i++) {
            vehiclesLoadoutCost += vehiclesLoadoutsCosts[i];

            vehString += vehicles[i].name;
            vehString += " - ";
            vehString += vehiclesLoadoutsCosts[i].toLocaleString('ru-RU') + " $\n";

            if (vehicles[i].rearms > 0) {
                vehiclesLoadoutCost += vehicles[i].rearms * vehiclesLoadoutsCosts[i];
                vehRearmsString += vehicles[i].name;
                vehRearmsString += " - ";
                vehRearmsString += vehiclesLoadoutsCosts[i].toLocaleString('ru-RU') + " $";
                vehRearmsString += " х" + vehicles[i].rearms + "\n";
            };
        };

        if (vehRearmsString != "") { vehString = vehString + "\n " + vehRearmsString };


        return [vehiclesLoadoutCost, vehString]
    };

    function setLostVehicles(vehicles, date) {
        let vehiclesSheetNames = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 1, VEHICLES_SHEET_FOB_ROWS, 1).getValues();
        vehiclesSheetNames = simplifiedArray(vehiclesSheetNames);
        let vehiclesSheetStatuses = VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 4, VEHICLES_SHEET_FOB_ROWS, 1).getValues();

        for (vehicle of vehicles) {
            if (vehicle.isLost) {
                let index = vehiclesSheetNames.findIndex(function (name, index) {
                    return vehicle.name === name && vehiclesSheetStatuses[index][0] === "В резерве";
                });
                if (index > -1) {
                    vehiclesSheetStatuses[index][0] = "Потеряно (" + date + ")";
                };
            };
        };

        VEHICLES_SHEET.getRange(VEHICLES_SHEET_FOB_START_ROW, 4, VEHICLES_SHEET_FOB_ROWS, 1).setValues(vehiclesSheetStatuses);

        return true;
    };

    let prevMissionDate = new Date(COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), 1).getDisplayValue().split(".").reverse());
    let currentDate = new Date(missionData.date.split(".").reverse());
    var dayDiff = Math.floor((currentDate - prevMissionDate) / 86400000);

    let maintenanceCost = (getDailyMaintenanceCost() + missionData.usersCount * 2500) * dayDiff + missionData.usersCount * 1000;

    let dateString = "Командиры: " + missionData.commanders + "\n" + "Зевсы: " + missionData.zeuses + "\n" + "Карта: " + missionData.map;

    let infantryCost = missionData.alliedInf * 3000;
    if (infantryCost === 0) { infantryCost = "" };

    let vehicles = vehiclesData.filter(vehicle => { return ["Автомобиль", "КШМ", "БТР", "БМП", "Танк", "Судно", "БПЛА / Мотоцикл / Турель"].includes(vehicle.type) });
    let [groundVehiclesCost, groundVehiclesText] = composeDeployedVehiclesData(vehicles);

    vehicles = vehiclesData.filter(vehicle => { return ["Вертолёт"].includes(vehicle.type) });
    let [airVehiclesCost, airVehiclesText] = composeDeployedVehiclesData(vehicles);

    let infantryString = "";
    if (infantryCost > 0) {
        infantryString = " Развертывание: \n" + missionData.alliedInf + " пех. x 3 000 $";
    };

    let incomeString = "Аванс: " + missionData.prepayment.toLocaleString('ru-RU') + " $\n"
        + "Контракт: " + missionData.payment.toLocaleString('ru-RU') + " $\n\n";
    if (missionData.expenses > 0) {
        incomeString += "Снижение оплаты: " + missionData.expenses.toLocaleString('ru-RU') + " $\n";

        if (missionData.comment !== "") {
            incomeString += "Причина: " + missionData.comment;
        };
    };

    COMPANY_SHEET.appendRow([
        missionData.date,
        "",
        infantryCost,
        groundVehiclesCost,
        airVehiclesCost,
        "",
        "",
        (missionData.prepayment + missionData.payment - missionData.expenses),
        maintenanceCost,
        "",
        "",
        "",
        missionData.usersCount,
        "",
        ""
    ]);

    COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow() - 1, 2, 1, 1).copyTo(COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), 2, 1, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

    COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow() - 1, 10, 1, 3).copyTo(COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), 10, 1, 3), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

    COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow() - 1, 14, 1, 2).copyTo(COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), 14, 1, 2), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

    COMPANY_SHEET.getRange(COMPANY_SHEET.getLastRow(), 1, 1, 8).setNotes([[
        dateString,
        "",
        infantryString,
        groundVehiclesText,
        airVehiclesText,
        "",
        "",
        incomeString
    ]]);

    setLostVehicles(vehiclesData, missionData.date);

    createLogEntry("Регистрация миссии в компании", "Компания");

    SpreadsheetApp.flush();

    removeLostSoldVehicles("Fob");
    return true;
};