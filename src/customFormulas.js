/**
* Return string representaion of provided number in Roman-style notation
*
*@param {Number} num Number to be converted
*@returns {String} Roman-style number notation
*/
function romanize(num) {
    var lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }, roman = '', i;
    for (i in lookup) {
        while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
}

/**
* Get string with played mission count and format as Rome-Arabian style
*
*@param {Array} arrayMissionsCounts Array of two-columns missions counts as PMC and Zeus
*@customfunction
*/
function ROMANIZEPLAYEDMISSIONS(arrayMissionsCounts) {

    function missionsFormat(missionsAsPmc, missionsAsZeus) {

        if (missionsAsPmc === '') return '';

        var result = "";
        let missionAsPmcTens = missionsAsPmc / 10;
        let missionAsPmcOnes = missionsAsPmc % 10;

        if (missionsAsPmc > 0) {
            if (missionAsPmcOnes > 0) {
                result = result + missionAsPmcOnes;

                if (missionAsPmcTens >= 1) {
                    result = " " + result;
                };
            };

            if (missionAsPmcTens >= 1) {
                result = romanize(missionAsPmcTens) + result;
            };
        } else {
            result = result + 0;
        };

        if (missionsAsZeus > 0) {
            result = result + " / ";
            let resultZeus = "";

            let missionAsZeusEights = missionsAsZeus / 8;
            let missionAsZeusOnes = missionsAsZeus % 8;

            if (missionAsZeusOnes > 0) {
                resultZeus = resultZeus + missionAsZeusOnes;

                if (missionAsZeusEights >= 1) {
                    resultZeus = " " + resultZeus;
                };
            };

            if (missionAsZeusEights >= 1) {
                resultZeus = romanize(missionAsZeusEights) + resultZeus;
            };

            result = result + resultZeus;
        };

        return [result];
    };

    return arrayMissionsCounts.map(([pmc, zeus]) => missionsFormat(pmc, zeus));
};

/**
* 
*@param {String} item Item classname to search for
*@param {String} primclass User first class
*@param {String} [secclass] User second class
*@return {Number | String} Discount, Number can be positive or negative, String can be empty, 'N/A' or 'N/E'
*@customfunction
*/
function CALCDISCOUNT(item, primClass, secClass = 'Н/Д') {
    if (!item) return ''; // No item passed
    if (!primClass) return ''; // No primary class passed
    const discountTableSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Таблица скидок');

    const itemRow = discountTableSheet.getRange('B4:B').getValues().findIndex(curItem => curItem[0] === item);
    if (itemRow < 0) return 'N/E'; // Item not found
    
    const classesCols = discountTableSheet.getRange('C3:P').getValues()[0];

    const primClassCol = classesCols.findIndex(curClass => curClass === primClass + ' [Основной]');
    if (primClassCol < 0) return 'N/E'; // Primary class not found
    const primClassDisc = discountTableSheet.getRange(itemRow + 4, primClassCol + 3).getValue();

    const secClassCol = classesCols.findIndex(curClass => curClass === secClass + ' [Дополнительный]');
    let secClassDisc = '-';
    if (secClassCol > -1) {
        secClassDisc = discountTableSheet.getRange(itemRow + 4, secClassCol + 3).getValue();
    };
    
    if (primClassDisc !== '-') {
        if (secClassDisc === '-') return primClassDisc; // Only primary class has discount

        if (primClassDisc >= 0) {
            if (secClassDisc >= 0) {
                return primClassDisc > secClassDisc ? primClassDisc : secClassDisc;
            } else {
                return primClassDisc + secClassDisc;
            };
        } else {
            if (secClassDisc >= 0) {
                return primClassDisc + secClassDisc;
            } else {
                return primClassDisc < secClassDisc ? primClassDisc : secClassDisc;
            };
        };
    } else {
        if (secClassDisc === '-') return 'N/A'; // Item has no discounts both classes
        return secClassDisc * 100; // Only secondary class has discount
    };
};