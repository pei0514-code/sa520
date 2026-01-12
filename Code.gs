// 薩諾瓦義式廚房 - Google Apps Script 後端
var SPREADSHEET_ID = '1euqf6Hx1TKc858ZU9063jVU2qIoz4L6tUrldDT1g9h8';

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    var result = {};
    var lineUserId = params.lineUserId;

    switch (action) {
      case 'getInitialData':
        // 為了讓前端有資料，若試算表是空的，這裡回傳一個預設的 Menu 結構
        // 但實務上還是會嘗試讀取 Sheet
        var menuData = getSheetDataAsJson("本店餐點", ["類別", "子類別", "產品名稱", "產品價格", "圖片網址", "說明", "標籤"]);
        if (menuData.length === 0) {
           // Fallback menu data for demo purposes if sheet is empty
           menuData = getFallbackMenu();
        }

        result = {
          status: 'success',
          member: getMemberByLineId(lineUserId),
          faqs: getSheetDataAsJson("常見問題", ["問題", "回答"]),
          promotions: getSheetDataAsJson("活動與優惠", ["類型", "活動日期", "圖片網址", "標題", "內容"]),
          restaurantMenu: menuData,
          bookingsSummary: getBookingsSummary()
        };
        break;
      case 'getAdminData': result = getAdminData(params); break;
      case 'register': result = registerMember(params); break;
      case 'booking': result = saveBooking(params); break;
      case 'updateBooking': result = updateBooking(params); break;
      case 'cancelBooking': result = cancelBooking(params); break;
      case 'updateMember': result = updateMember(params); break;
      case 'deleteMember': result = deleteMember(params); break;
      case 'savePreOrder': result = savePreOrder(params); break; // Legacy support
      default:
        result = { status: 'error', message: '無效的操作' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 產生 SA + 4位數字 訂位代號
function generateBookingCode() {
  var nums = '0123456789';
  var code = 'SA';
  for (var i = 0; i < 4; i++) {
    code += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return code;
}

// ========================
// Data Retrieval
// ========================
function getMemberByLineId(lineUserId) {
  if (!lineUserId) return null;
  var data = getSheetDataAsJson("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "點數", "性別", "Email"]);
  return data.find(row => row['LINE ID'] === lineUserId) || null;
}

function getSheetDataAsJson(sheetName, headers) {
    var sheet = getOrCreateSheet(sheetName, headers);
    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) return [];
    var headerRow = values[0];
    var jsonData = [];
    for (var i = 1; i < values.length; i++) {
        var rowData = values[i];
        var obj = {};
        for (var j = 0; j < headerRow.length; j++) {
            if (rowData[j] instanceof Date) {
                var yyyy = rowData[j].getFullYear();
                var mm = String(rowData[j].getMonth() + 1).padStart(2, '0');
                var dd = String(rowData[j].getDate()).padStart(2, '0');
                obj[headerRow[j]] = yyyy + '-' + mm + '-' + dd;
            } else {
                obj[headerRow[j]] = rowData[j];
            }
        }
        jsonData.push(obj);
    }
    return jsonData;
}

function getBookingsSummary() {
    var sheet = getOrCreateSheet("訂位紀錄", ["訂位代號", "建立時間", "LINE ID", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "素食", "姓名", "電話", "備註", "預點餐"]);
    var data = sheet.getDataRange().getValues();
    var summary = [];
    var today = new Date();
    today.setHours(0,0,0,0);
    
    for (var i = 1; i < data.length; i++) {
        var date = new Date(data[i][3]);
        if (date >= today) {
            summary.push({ date: data[i][3], time: data[i