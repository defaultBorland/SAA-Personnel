
// Shop sheet
const SHOP_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Заказ снаряжения');
const SHOP_FORMS_COUNT = 18;
const SHOP_FORMS_ROWS = 50;

// Main sheet
const MAIN_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Главная');

// Ops sheet
const OPS_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Оперативники");

// Qualification sheet
const QUALIFICATIONS_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Квалификации");

// Company sheet
const COMPANY_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Компания");

// Vehicles sheet
const VEHICLES_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Техника компании");
const VEHICLES_SHEET_FOB_START_ROW = 5;
const VEHICLES_SHEET_FOB_ROWS = 39;
const VEHICLES_SHEET_FOB_SLOTS = VEHICLES_SHEET_FOB_ROWS - 8;
const VEHICLES_SHEET_BASE_START_ROW = 51;
const VEHICLES_SHEET_BASE_SLOTS = 20;

// Encyclopedia sheet
const ENCYCLOPEDIA_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Энциклопедия техники");

// Logs sheet
const LOGS_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Логи");

// Users sheet
const USERS_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Пользователи");

// Fired users sheet
const FIRED_USERS_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Демобилизованные");