function userformUpgradeVehicleCompany() {

  const template = HtmlService.createTemplateFromFile("UpgradeVehicleCompany/upgradeVehicleCompany_userform");
  const html = template.evaluate().setWidth(800).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Модернизация техники");
};

function userformRegCapturedVehiclesCompany() {

  const template = HtmlService.createTemplateFromFile("RegCapturedVehiclesCompany/regCapturedVehiclesCompany_userform");
  const html = template.evaluate().setWidth(800).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Оформление захваченной техники");
};

function userformMoveVehiclesCompany() {

  const template = HtmlService.createTemplateFromFile("MoveVehiclesCompany/moveVehiclesCompany_userform");
  const html = template.evaluate().setWidth(800).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Передислокация техники");
};

function userformBuyVehiclesCompany() {

  const template = HtmlService.createTemplateFromFile("BuyVehiclesCompany/buyVehiclesCompany_userform");
  const html = template.evaluate().setWidth(900).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Приобретение техники");
};

function userformSellVehiclesCompany() {

  const template = HtmlService.createTemplateFromFile("SellVehiclesCompany/sellVehiclesCompany_userform");
  const html = template.evaluate().setWidth(800).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Продажа техники");
};

function userformSetQualification() {

  const template = HtmlService.createTemplateFromFile("SetQualification/setQualification_userform");
  const html = template.evaluate().setWidth(500).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Управление квалификациями");
};

function userformRegMissionCompany() {

  const template = HtmlService.createTemplateFromFile("RegMissionCompany/regMissionCompany_userform");
  const html = template.evaluate().setWidth(800).setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, "Регистрация миссии в компании");
};

function userformSetMissionParticipation() {

  const template = HtmlService.createTemplateFromFile("SetMissionParticipation/setMissionParticipation_userform");
  const html = template.evaluate().setWidth(500).setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, "Участие в миссии");
};

function userformSetUserClass() {

  const template = HtmlService.createTemplateFromFile("SetUserClass/setUserClass_userform");
  const html = template.evaluate().setWidth(500).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Смена специализации");
};

function userformSetUserRank() {

  const template = HtmlService.createTemplateFromFile("SetUserRank/setUserRank_userform");
  const html = template.evaluate().setWidth(500).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, "Присвоение звания");
};

function userformRehireUser() {

  const template = HtmlService.createTemplateFromFile("RehireUser/reHireUser_userform");
  const html = template.evaluate().setWidth(600).setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, "Восстановление оперативника");
};

function userformFireUser() {

  const template = HtmlService.createTemplateFromFile("FireUser/fireUser_userform");
  const html = template.evaluate().setWidth(600).setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, "Увольнение оперативника");
};

function userformAddNewUser() {

  const template = HtmlService.createTemplateFromFile("AddUser/addNewUser_userform");
  const html = template.evaluate();

  SpreadsheetApp.getUi().showModalDialog(html, "Найм нового оперативника");
};

function userformChangeNickname() {

  const template = HtmlService.createTemplateFromFile("ChangeNick/changeNick_userform");
  const html = template.evaluate();

  SpreadsheetApp.getUi().showModalDialog(html, "Смена позывного");
};

function userformMoneyTransfer() {

  const template = HtmlService.createTemplateFromFile("MoneyTransfer/moneyTransf_userform");
  const html = template.evaluate();

  SpreadsheetApp.getUi().showModalDialog(html, "Перевод средств");
};

function userformAddMail() {

  const template = HtmlService.createTemplateFromFile("RegMail/regMail_userform");
  const html = template.evaluate();

  SpreadsheetApp.getUi().showModalDialog(html, "Регистрация GMail");
};

function placeholder() {
  Browser.msgBox("Данный функционал ещё не реализован.");
};

function tempDisabled() {
  Browser.msgBox("Функция временно отключена.");
};

function help() {
  Browser.msgBox("Эти действия позволяют пользователям с определённым уровнем доступа выполнять операции через интерфейс, что автоматизирует многие процессы и упрощает управление таблицой. \\n\\nПользовательские функции, такие как Перевод Средств и Смена Специализации, были отключены в виду необходимости согласия каждого пользователя на беспрепятственный доступ прилагающегося скрипта, которому требуется разрешение, как сообщает Гугл, на *Создание, просмотр, изменение и удаление ваших таблиц*, хотя единственное, что запрашивается скриптом - ваш адрес GMail, для удостоверения личности.\\n\\nВ виду того, что не каждый пользователь готов довериться автору скрипта (Borland), как и без гайда дать скрипту доступ или отозвать его, действия будут доступны только администрации и инструкторам.");
};

function accessLevel() {
  Browser.msgBox("Указывает на требуемый уровень доступа для использования функций из данного раздела.");
};

function createMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('ЧВК')
    .addItem('Справка', 'help')
    .addSeparator()
    .addItem('Уровень доступа: Администратор', 'accessLevel')
    .addSubMenu(ui.createMenu('Личный состав')
      .addItem('Нанять оперативника', 'userformAddNewUser')
      .addItem('Уволить оперативника', 'userformFireUser')
      .addItem('Восстановить оперативника', 'userformRehireUser')
      .addItem('Сменить специализацию', 'userformSetUserClass')
      .addItem('Присвоить звание', 'userformSetUserRank')
      .addItem('Выдать заслугу', 'placeholder')
      .addItem('Выдать выговор', 'placeholder')
      .addItem('Зарегистрировать GMail оперативника', 'userformAddMail'))
    .addSubMenu(ui.createMenu('Учёт активности')
      .addItem('Проставить участие', 'userformSetMissionParticipation')
      .addItem('Зарегистрировать миссию', 'userformRegMissionCompany')
      .addItem('Засчитать участие', 'regUsersParticipation'))
    .addSubMenu(ui.createMenu('Заказ снаряжения')
      .addItem('Проверить заказы', 'setRequestsApproved')
      .addItem('Выполнить заказы', 'approvedToCompleted')
      .addItem('Запрос в БД', 'composeDatabaseExpression')
      .addItem('Отложить заказы', 'onreviewToDelayed')
      .addItem('Отменить задержку', 'delayedToOnreview')
      .addItem('Очистить выполненные', 'clearDoneRequests')
      .addItem('Очистить все формы', 'clearShopLists'))
    .addSeparator()
    .addItem('Уровень доступа: Инструктор', 'accessLevel')
    .addItem('Управление квалификациями', 'userformSetQualification')
    .addSubMenu(ui.createMenu('Управление техникой')
      .addItem('Заказать технику', 'userformBuyVehiclesCompany')
      .addItem('Продать технику', 'userformSellVehiclesCompany')
      .addItem('Передислоцировать технику', 'userformMoveVehiclesCompany')
      .addItem('Оформление захваченной техники', 'userformRegCapturedVehiclesCompany')
      .addItem('Модернизировать единицу', 'userformUpgradeVehicleCompany'))
    .addToUi();
};


function onOpen() {

  createMenu();
};