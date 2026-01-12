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
        result = {
          status: 'success',
          member: getMemberByLineId(lineUserId),
          faqs: getSheetDataAsJson("常見問題", ["問題", "回答"]),
          promotions: getSheetDataAsJson("活動與優惠", ["類型", "活動日期", "圖片網址", "標題", "內容"]),
          restaurantMenu: getSheetDataAsJson("本店餐點", ["類別", "子類別", "產品名稱", "產品價格", "圖片網址", "說明", "標籤"]),
          bookingsSummary: getBookingsSummary()
        };
        break;
      case 'getAdminData': result = getAdminData(params); break;
      case 'register': result = registerMember(params); break;
      case 'booking': result = saveBooking(params); break;
      case 'updateBooking': result = updateBooking(params); break;
      case 'cancelBooking': result = cancelBooking(params); break;
      case 'findBooking': result = findBooking(params); break;
      case 'updateMember': result = updateMember(params); break;
      case 'deleteMember': result = deleteMember(params); break;
      case 'savePreOrder': result = savePreOrder(params); break;
      case 'getUserBookings': result = { status: 'success', bookings: getUserDataByLineId(lineUserId, "訂位紀錄") }; break;
      case 'getPointHistory': result = { status: 'success', history: getUserDataByLineId(lineUserId, "點數紀錄") }; break;
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

function getUserDataByLineId(lineUserId, sheetName) {
    if (!lineUserId) return [];
    var sheet = getOrCreateSheet(sheetName);
    var data = getSheetDataAsJson(sheetName, []);
    return data.filter(row => row['LINE ID'] === lineUserId);
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
             var timeStr = data[i][4];
             if (timeStr instanceof Date) timeStr = timeStr.getHours() + ':' + (timeStr.getMinutes()<10?'0':'') + timeStr.getMinutes();
             summary.push({ date: data[i][3], time: timeStr, count: (Number(data[i][5])||0) + (Number(data[i][6])||0) });
        }
    }
    return summary;
}

// ========================
// Admin
// ========================
function getAdminData(params) {
    var member = getMemberByLineId(params.lineUserId);
    var admins = ['0937942582', '0978375273', '0978375592'];
    var userPhone = member ? String(member['電話']).replace(/^'/, '').replace(/-/g, '') : '';
    
    if (!member || !admins.includes(userPhone)) {
        return { status: 'error', message: '無權限存取後台' };
    }
    var sheet = getOrCreateSheet("訂位紀錄");
    var data = getSheetDataAsJson("訂位紀錄", []);
    // Filter today and future
    var today = new Date();
    today.setHours(0,0,0,0);
    var results = data.filter(row => new Date(row['預約日期']) >= today);
    return { status: 'success', bookings: results };
}

// ========================
// Actions
// ========================

function registerMember(data) {
  var sheet = getOrCreateSheet("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "點數", "性別", "Email"]);
  
  // Check duplicate
  var members = getSheetDataAsJson("會員資料", []);
  if(members.find(m => m['LINE ID'] === data.lineUserId)) {
      return { status: 'error', message: '您已是會員' };
  }

  sheet.appendRow([ new Date(), data.lineUserId, data.name, "'" + data.phone, data.birthday, 100, data.gender, data.email ]);
  addPoints(data.lineUserId, 100, "新會員註冊禮");
  getOrCreateSheet("集點卡", ["LINE ID", "點數"]).appendRow([data.lineUserId, 0]);
  
  return { status: 'success' };
}

function saveBooking(data) {
  var sheet = getOrCreateSheet("訂位紀錄", ["訂位代號", "建立時間", "LINE ID", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "素食", "姓名", "電話", "備註", "預點餐"]);
  var bookingCode = generateBookingCode();
  sheet.appendRow([ 
      bookingCode, new Date(), data.lineUserId, data.date, data.time, 
      data.adults, data.children, data.highChairs, data.vegetarian ? '是' : '否', 
      data.name, "'" + data.phone, data.notes, data.preOrder || '' 
  ]);
  return { status: 'success', bookingCode: bookingCode };
}

function updateMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][1] === data.lineUserId) {
      sheet.getRange(i + 1, 3).setValue(data.姓名);
      sheet.getRange(i + 1, 4).setValue("'" + data.電話);
      sheet.getRange(i + 1, 5).setValue(data.生日);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: '會員不存在' };
}

function deleteMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  var values = sheet.getDataRange().getValues();
  var found = false;
  // Delete from Member Sheet
  for (var i = values.length - 1; i > 0; i--) {
    if (values[i][1] === data.lineUserId) {
      sheet.deleteRow(i + 1);
      found = true;
    }
  }
  // Optional: Delete from Point History or Booking History could be added here
  return found ? { status: 'success' } : { status: 'error', message: '會員不存在' };
}

function addPoints(lineUserId, points, reason) {
    var historySheet = getOrCreateSheet("點數紀錄", ["時間", "LINE ID", "說明", "點數變化"]);
    historySheet.appendRow([new Date(), lineUserId, reason, points]);
    
    var memberSheet = getOrCreateSheet("會員資料");
    var data = memberSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
        if (data[i][1] === lineUserId) {
            var currentPoints = Number(data[i][5]) || 0;
            memberSheet.getRange(i + 1, 6).setValue(currentPoints + points);
            break;
        }
    }
}

// Helper
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}
