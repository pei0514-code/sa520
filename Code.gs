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
          settings: getSystemSettings(),
          bookingsSummary: getBookingsSummary()
        };
        break;
      case 'register': result = registerMember(params); break;
      case 'booking': result = saveBooking(params); break;
      case 'updateMember': result = updateMember(params); break;
      case 'deleteMember': result = deleteMember(params); break;
      case 'savePreOrder': result = savePreOrder(params); break;
      case 'submitFeedback': result = submitFeedback(params); break;
      case 'getUserBookings': result = { status: 'success', bookings: getUserDataByLineId(lineUserId, "訂位紀錄") }; break;
      case 'getPointHistory': result = { status: 'success', history: getUserDataByLineId(lineUserId, "點數紀錄") }; break;
      case 'getMemberCoupons': result = { status: 'success', coupons: getUserDataByLineId(lineUserId, "優惠券") }; break;
      case 'getStampCardStatus': result = { status: 'success', stamps: getStampCardStatus(lineUserId) }; break;
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

// ========================
// Data Retrieval Functions
// ========================
function getMemberByLineId(lineUserId) {
  if (!lineUserId) return null;
  var data = getSheetDataAsJson("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "點數", "性別", "Email"]);
  return data.find(row => row['lineid'] === lineUserId) || null;
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
            obj[headerRow[j]] = rowData[j];
        }
        jsonData.push(obj);
    }
    return jsonData;
}

function getUserDataByLineId(lineUserId, sheetName) {
    if (!lineUserId) return [];
    var data = getSheetDataAsJson(sheetName, []); // Headers should already exist
    return data.filter(row => row['LINE ID'] === lineUserId);
}

function getStampCardStatus(lineUserId) {
    if (!lineUserId) return { stamps: 0 };
    var data = getSheetDataAsJson("集點卡", ["LINE ID", "點數"]);
    var userStamps = data.find(row => row['LINE ID'] === lineUserId);
    return userStamps ? userStamps.點數 : 0;
}

function getSystemSettings() {
    var sheet = getOrCreateSheet("系統設定", ["Key", "Value"]);
    var data = sheet.getDataRange().getValues();
    var settings = {};
    for (var i = 1; i < data.length; i++) {
        settings[data[i][0]] = data[i][1];
    }
    // Default setting if not present
    if (!settings["MaxCapacity"]) {
        settings["MaxCapacity"] = 30;
        sheet.appendRow(["MaxCapacity", 30]);
    }
    return settings;
}

function getBookingsSummary() {
    var sheet = getOrCreateSheet("訂位紀錄", ["建立時間", "LINE ID", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "素食", "座位偏好", "用餐目的", "姓名", "電話", "備註", "預點餐"]);
    var data = sheet.getDataRange().getValues();
    var summary = [];
    
    // Skip header
    for (var i = 1; i < data.length; i++) {
        var date = data[i][2];
        var time = data[i][3];
        var adults = Number(data[i][4]) || 0;
        var children = Number(data[i][5]) || 0;
        
        // Simple date check: only summarize future dates or today
        var d = new Date(date);
        var today = new Date();
        today.setHours(0,0,0,0);
        
        if (d >= today) {
            var dateStr = d.toISOString().split('T')[0];
            summary.push({ date: dateStr, time: time, count: adults + children });
        }
    }
    return summary;
}

// ========================
// Data Modification Functions
// ========================
function registerMember(data) {
  var sheet = getOrCreateSheet("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "點數", "性別", "Email"]);
  sheet.appendRow([ new Date(), data.lineUserId, data.name, data.phone, data.birthday, 100, data.gender, data.email ]);
  addPoints(data.lineUserId, 100, "新會員註冊禮");
  getOrCreateSheet("集點卡", ["LINE ID", "點數"]).appendRow([data.lineUserId, 0]);
  return { status: 'success', member: getMemberByLineId(data.lineUserId) };
}

function saveBooking(data) {
  var sheet = getOrCreateSheet("訂位紀錄", ["建立時間", "LINE ID", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "素食", "座位偏好", "用餐目的", "姓名", "電話", "備註", "預點餐"]);
  sheet.appendRow([ new Date(), data.lineUserId, data.date, data.time, data.adults, data.children, data.highChairs, data.vegetarian ? '是' : '否', data.seating, data.occasion, data.name, data.phone, data.notes, '' ]);
  return { status: 'success', bookingId: sheet.getLastRow() };
}

function updateMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][1] === data.lineUserId) {
      sheet.getRange(i + 1, 3).setValue(data.name);
      sheet.getRange(i + 1, 4).setValue(data.phone);
      sheet.getRange(i + 1, 5).setValue(data.birthday);
      // Update gender and email if columns exist
      if (values[0].length > 6) sheet.getRange(i + 1, 7).setValue(data.gender);
      if (values[0].length > 7) sheet.getRange(i + 1, 8).setValue(data.email);
      
      return { status: 'success', member: getMemberByLineId(data.lineUserId) };
    }
  }
  return { status: 'error', message: '會員不存在' };
}

function deleteMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  var values = sheet.getDataRange().getValues();
  for (var i = values.length - 1; i > 0; i--) {
    if (values[i][1] === data.lineUserId) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: '會員不存在' };
}

function savePreOrder(data) {
  var sheet = getOrCreateSheet("訂位紀錄");
  var orderSummary = data.order.map(item => `${item.n} x${item.qty}`).join('; ');
  sheet.getRange(data.bookingId, 14).setValue(orderSummary);
  return { status: 'success' };
}

function submitFeedback(params) {
    var sheet = getOrCreateSheet("顧客回饋", ["時間", "LINE ID", "姓名", "評分", "意見"]);
    sheet.appendRow([ new Date(), params.lineUserId, params.name, params.rating, params.comment ]);
    return { status: 'success' };
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

// ========================
// Utility Function
// ========================
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0 && sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}
