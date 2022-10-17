function getClientsCells() {
    let isAdmin = checkIsAdmin();

    if (!isAdmin) {
        Logger.log(Session.getActiveUser().getEmail());
        throw 'Ваш уровень доступа не позволяет вам делать это.';
    };

    let clients = [];
    for (let formNum = 0; formNum < SHOP_FORMS_COUNT; formNum++) {
        clients.push(SHOP_SHEET.getRange(5, 4 + formNum * 8));
    };

    return clients;
};

function getStatusCells() {
    var isAdmin = checkIsAdmin();

    if (!isAdmin) {
        Logger.log(Session.getActiveUser().getEmail());
        throw 'Ваш уровень доступа не позволяет вам делать это.';
    };

    let statuses = [];
    for (let formNum = 0; formNum < SHOP_FORMS_COUNT; formNum++) {
        statuses.push(SHOP_SHEET.getRange(59, 3 + formNum * 8));
    };

    return statuses;
};

function getTotalCells() {
    let totals = [];
    for (let formNum = 0; formNum < SHOP_FORMS_COUNT; formNum++) {
        totals.push(SHOP_SHEET.getRange(59, 7 + formNum * 8));
    };

    return totals;
};

function getItemnamesRanges() {
    let itemnames = [];
    for (let formNum = 0; formNum < SHOP_FORMS_COUNT; formNum++) {
        itemnames.push(SHOP_SHEET.getRange(9, 2 + formNum * 8, SHOP_FORMS_ROWS, 1));
    };

    return itemnames;
};

function getFormsRanges() {

    let forms = [];

    for (let formNum = 0; formNum < SHOP_FORMS_COUNT; formNum++) {
        let classnames = SHOP_SHEET.getRange(9, 3 + formNum * 8, SHOP_FORMS_ROWS, 1);
        let counts = SHOP_SHEET.getRange(9, 4 + formNum * 8, SHOP_FORMS_ROWS, 1);
        forms.push([classnames, counts]);
    };

    return forms;
};

function getDiscountRanges() {
    let discounts = [];
    for (let formNum = 0; formNum < SHOP_FORMS_COUNT; formNum++) {
        discounts.push(SHOP_SHEET.getRange(9, 6 + formNum * 8, SHOP_FORMS_ROWS, 1));
    };

    return discounts;
};

function getOverallFormsRanges() {
    let forms = [];
    for (let i = 0; i < SHOP_FORMS_COUNT; i++) {
        forms.push(SHOP_SHEET.getRange(9, 2 + 8 * i, SHOP_FORMS_ROWS, 6));
    };

    return forms;
};

function clearShopLists() {

    var clients = getClientsCells();
    var forms = getFormsRanges();
    var statuses = getStatusCells();

    clients.forEach((cell, index) => {
        cell.clearContent();
        forms[index][0].clearContent();
        forms[index][1].setValue(1);

        statuses[index].setValue("На рассмотрении");
    });

    SpreadsheetApp.flush();
};

function clearDoneRequests() {

    var clients = getClientsCells();
    var forms = getFormsRanges();
    var statuses = getStatusCells();

    statuses.forEach((cell, index) => {
        if (cell.getValue() == "Выполнено") {
            clients[index].clearContent();
            forms[index][0].clearContent();
            forms[index][1].setValue(1);

            cell.setValue("На рассмотрении");
        };
    });

    SpreadsheetApp.flush();
};

function setRequestsApproved() {

    const clients = getClientsCells();
    const forms = getFormsRanges();
    const statuses = getStatusCells();
    const discounts = getDiscountRanges();
    const totals = getTotalCells();
    const users = getUsersData();

    let clientsNames = clients.map(cell => cell.getValue());
    let usersWithSeveralOrders = [];

    clients.forEach((cell, index) => {
        let clientName = clientsNames[index];

        if (!clientName) return; // Making sure that client name is not empty string (blank orders lists with name presents)

        if (forms[index][0].isBlank()) { // Making sure that list is not blank
            cell.setValue(""); // Emptying cell if so
            clientsNames[index] = "";
            return;
        }; 
        if (statuses[index].getValue() === "Отказано") return; // Making sure that order was not declined earlier
        
        if (usersWithSeveralOrders.includes(clientName)) { // If user already has processed order - delay
            statuses[index].setValue("Отложено");
            return;
        };
        if (clientsNames.indexOf(clientName) !== clientsNames.lastIndexOf(clientName)) {usersWithSeveralOrders.push(clientName)};

        let hasErrors = ["Н/Д", "Н/С"].some(error => {
            let array = simplifiedArray(discounts[index].getValues());
            return array.includes(error);
        });

        if (!hasErrors) { // Making sure that list have no problems
            let userMoney = users.find(user => user.name === clientName)?.balance;
            if (!userMoney) return; // User was not found

            let orderCost = totals[index].getValue();

            if (userMoney >= orderCost) { // Making sure that user have enough money to pay
                statuses[index].setValue("Одобрено");
            } else {
                statuses[index].setValue("Отказано");
            };
        } else {
            statuses[index].setValue("Отказано");
        };
    });

    SpreadsheetApp.flush();
};

function processOrders() {
    const customersNames = getClientsCells().map(cell => cell.getValue());
    const statuses = getStatusCells().map(cell => cell.getValue());
    const totals = getTotalCells().map(cell => cell.getValue());

    let customers = getUsersData('Пользователи').filter((user, userIndex) => {
        let index = customersNames.findIndex(customer => customer === user.name);
        if (index < 0) return false;
        if (statuses[index] !== 'Одобрено') return false;

        user.balance = Math.floor(user.balance - totals[index]);
        user.index = userIndex;

        return true;
    });

    if (customers.length < 1) return;

    let usersMoneyRange = USERS_SHEET.getRange(2, getHeaderColoumnNum("Balance", "Пользователи"), USERS_SHEET.getLastRow(), 1);
    let usersMoney = usersMoneyRange.getValues();
    usersMoney.forEach(([money], index) => {
        let user = customers.find(user => user.index === index);
        if (user) {
            usersMoney[index] = [user.balance];
        };
    });

    usersMoneyRange.setValues(usersMoney);
    SpreadsheetApp.flush();
};

function approvedToCompleted() {
    processOrders();
    changeStatus("Одобрено", "Выполнено");
    createLogEntry("Исполнение заказов снаряжения", "Заказчики снаряжения");
};

function onreviewToDelayed() {
    changeStatus("На рассмотрении", "Отложено");
};

function delayedToOnreview() {
    changeStatus("Отложено", "На рассмотрении");
};

function changeStatus(searchStatus, newStatus) {

    let statuses = getStatusCells();
    statuses = statuses.filter(cell => cell.getValue() === searchStatus);

    SHOP_SHEET.getRangeList(statuses.map(cell => cell.getA1Notation())).setValue(newStatus);

    SpreadsheetApp.flush();
};

function databaseOrders() {

    const clients = getClientsCells().map(cell => cell.getValue());
    const forms = getFormsRanges();
    const statuses = getStatusCells().map(cell => cell.getValue());

    const anyOrderComplete = statuses.some(status => status === "Выполнено");
    if (!anyOrderComplete) { return '' };

    let multipleOrders = false;
    let text = 'INSERT INTO orders (uid, name, list) VALUES \\n\\n';

    statuses.forEach((status, index) => {
        if (status === "Выполнено") { // If order was marked as "Completed"
            if (!forms[index][0].isBlank()) { // If order list isNot Blank
                
                let classnames = forms[index][0].getValues();
                let counts =  forms[index][1].getValues();
                let list = [];

                for (let i = 0; i < classnames.length; i++) {
                    if (classnames[i][0] !== "" && counts[i][0] !== "" && counts[i][0] > 0) {
                        list.push([`["${classnames[i]}", ${counts[i]}]`]);
                    };
                };

                let uid = SHOP_SHEET.getRange(6, 2 + index * 8).getValue(); 

                if (multipleOrders) { text = text + ', \\n' }
                text += `('${uid}', "${clients[index]}", '[${list}]')`;
                multipleOrders = true;
            };
        };
    });

    text = text + ';\\n\\n';

    return text;
};

function databaseRanksAndClassesUpdate() {

    function classSwitch(specialisation) {
        switch (specialisation) {
            case "Снайпер":
                specialisation = "Sniper";
                break;
            case "Марксман":
                specialisation = "Marksman";
                break;
            case "Медик":
                specialisation = "Medic";
                break;
            case "ПТ/ПВО-Специалист":
                specialisation = "AT";
                break;
            case "Сапёр-инженер":
                specialisation = "Engineer";
                break;
            case "Гренадёр":
                specialisation = "Grenadier";
                break;
            case "Пулемётчик":
                specialisation = "Machinegunner";
                break;
            case "Стрелок":
                specialisation = "Rifleman";
                break;
            case "N/A":
            default:
                specialisation = "None";
                break;
        };

        return specialisation;
    };

    function makeString(string) {
        return "'" + '"' + string + '"' + "'";
    };

    let usersObjects = getUsersData("Пользователи");
    usersObjects = usersObjects.filter(user => user.name !== "");

    let text = '';
    usersObjects.forEach(user => {
        text = text + 'UPDATE playersinfo \\n SET rank = ' + makeString(user.rank) + ', pclass = ' + makeString(classSwitch(user.primclass)) + ', sclass = ' + makeString(classSwitch(user.secclass)) + '\\n WHERE uid = ' + user.steamid + ';\\n\\n';
    });

    return text;
};

function databaseRemoveInactive() {

    const uids = getColoumnData("SteamID", "Пользователи").filter(uid => uid !== '');
    const text = 'DELETE FROM playersinfo WHERE uid not in (' + uids.toString() + '); \\n\\n';

    return text;
};

function databaseUpdateFobVehicles() {

    function makeString(string) {
        return "'" + '"' + string + '"' + "'";
    };

    let text = 'DELETE FROM garagevehicles; \\n';

    let vehiclesFob = getVehiclesCompany("FOB");
    vehiclesFob = vehiclesFob.filter(vehicle => vehicle.status.includes("В резерве"));

    if (vehiclesFob.length < 1) return text;

    let vehiclesEncyclopedia = getVehiclesFromEncyclopedia();

    text += 'INSERT INTO garagevehicles (classname, tablename, type) VALUES \\n'

    let vehiclesTexts = [];
    vehiclesFob.forEach(vehicleFob => {
        let vehicleEncy = vehiclesEncyclopedia.find(vehicle => vehicle.name === vehicleFob.name);

        vehiclesTexts.push("(" + [makeString(vehicleEncy.classname), makeString(vehicleEncy.name), makeString(vehicleEncy.type)].join(", ") + ")");
    });
    text += vehiclesTexts.join(",\\n") + ";";

    return text;
};

function composeDatabaseExpression() {

    var text = '';
    text = text.concat(
        databaseOrders(),
        '\\n', databaseRanksAndClassesUpdate(),
        '\\n', databaseRemoveInactive(),
        '\\n', databaseUpdateFobVehicles()
    );

    Browser.msgBox(text);
};