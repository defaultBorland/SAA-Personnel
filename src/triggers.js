
function triggerAddRemoveEditors() {

  let editors = SpreadsheetApp.getActiveSpreadsheet().getEditors().map(user => { return user.getEmail() });
  let mailsActive = getColoumnData("Mail", "Пользователи").filter(mail => { return mail !== "" });
  let mailsInactive = editors.filter(mail => { return !mailsActive.includes(mail) });

  SpreadsheetApp.getActiveSpreadsheet().addEditors(mailsActive);

  for (mail of mailsInactive) {
    SpreadsheetApp.getActiveSpreadsheet().removeEditor(mail);
  };

  return true;
};

function triggerCalendarUpdate() {

  var firstWeekRange = MAIN_SHEET.getRange(4, 3, 7, 2);
  var secondWeekRange = MAIN_SHEET.getRange(4, 6, 7, 2);

  firstWeekRange.clearContent();
  firstWeekRange.setValues(secondWeekRange.getValues());
  secondWeekRange.clearContent();

  var date = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yy");
  date = date + " [ПН]";
  MAIN_SHEET.getRange(4, 2, 1, 1).setValue(date);

  SpreadsheetApp.flush();
};

function triggerUpdateSheetsAccess() {

  function updateAccess(editors, protection) {
    let protectionEditors = protection.getEditors().map(user => { return user.getEmail() });

    let irrelevantEditors = protectionEditors.filter(mail => { return !editors.includes(mail) });
    if (irrelevantEditors.length > 0) { protection.removeEditors(irrelevantEditors) };

    let newEditors = editors.filter(editor => { return !protectionEditors.includes(editor) });
    if (newEditors.length > 0) { protection.addEditors(newEditors) };
  };

  let users = getUsersData("Пользователи").filter(user => { return user.isInstructor || user.isAdmin });
  let instructorsSheets = ["Компания", "Техника компании", "Энциклопедия техники", "Логи"];
  let adminsSheets = ["Главная", "Оперативники", "Пользователи", "Демобилизованные"];

  instructorsSheets.forEach(sheet => {
    let protection = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet).protect();
    updateAccess(users.map(user => { return user.mail }), protection); // Add ADMINS AND INSTRUCTORS to INSTRUCTORS SHEETS
  });

  adminsSheets.forEach(sheet => {
    let protection = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet).protect();
    updateAccess(users.filter(user => { return user.isAdmin }).map(user => { return user.mail }), protection); // Add ONLY ADMINS to ADMINS SHEETS
  });
  
  SpreadsheetApp.flush();
};

function triggerRepairRangesFormatting() {

  let namesRangeList = SHOP_SHEET.getRangeList(getItemnamesRanges().map(range => range.getA1Notation()));

  let formsRanges = getFormsRanges();
  let formsClassnamesRangeList = SHOP_SHEET.getRangeList(formsRanges.map(array => array[0].getA1Notation()));
  let formsCountsRangeList = SHOP_SHEET.getRangeList(formsRanges.map(array => array[1].getA1Notation()));

  namesRangeList.setBorder(null, null, null, true, null, null, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  formsCountsRangeList.setBorder(true, null, true, true, null, null, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  formsCountsRangeList.setBorder(null, true, null, null, null, null, 'black', SpreadsheetApp.BorderStyle.DASHED);
  formsCountsRangeList.setBorder(null, null, null, null, null, true, '#b7b7b7', SpreadsheetApp.BorderStyle.DOTTED);

  formsClassnamesRangeList.setBorder(true, true, true, null, null, null, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  formsClassnamesRangeList.setBorder(null, null, null, null, null, true, '#b7b7b7', SpreadsheetApp.BorderStyle.DOTTED);

  [formsCountsRangeList, formsClassnamesRangeList].forEach(rangeList => {
    rangeList.setBackground('white');
    rangeList.setFontSize(10);
    rangeList.setFontColor('black');
    rangeList.setFontFamily('Sans Serif');
    rangeList.setHorizontalAlignment("center");
    rangeList.setVerticalAlignment("middle");
  });
};