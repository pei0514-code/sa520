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
          faqs: getSheetData("常見問題", ["問題", "回答"]),
          promotions: getSheetData("活動與優惠", ["類型", "活動日期", "圖片網址", "標題", "內容"])
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
  var data = getSheetData("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "點數"]);
  var member = data.find(row => row.lineId === lineUserId);
  return member || null;
}

function getSheetData(sheetName, headers) {
    var sheet = getOrCreateSheet(sheetName, headers);
    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) return [];
    var headerRow = values[0];
    var jsonData = [];
    for (var i = 1; i < values.length; i++) {
        var row = values[i];
        var obj = {};
        for (var j = 0; j < headerRow.length; j++) {
            var key = headerRow[j].toLowerCase().replace(/\s/g, ''); // Simple key conversion
             if(key === 'lineid') key = 'lineId'; // consistency
            obj[key] = row[j];
        }
        jsonData.push(obj);
    }
    return jsonData;
}

function getUserDataByLineId(lineUserId, sheetName) {
    if (!lineUserId) return [];
    var data = getSheetData(sheetName, []); // Headers should already exist
    return data.filter(row => row.lineId === lineUserId);
}

function getStampCardStatus(lineUserId) {
    if (!lineUserId) return { stamps: 0 };
    var data = getSheetData("集點卡", ["LINE ID", "點數"]);
    var userStamps = data.find(row => row.lineId === lineUserId);
    return userStamps ? userStamps.點數 : 0;
}


// ========================
// Data Modification Functions
// ========================
function registerMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  sheet.appendRow([ new Date(), data.lineUserId, data.name, data.phone, data.birthday, 100 ]);
  // Add initial points to history
  addPoints(data.lineUserId, 100, "新會員註冊禮");
  // Create stamp card
  getOrCreateSheet("集點卡").appendRow([data.lineUserId, 0]);
  return { status: 'success', member: getMemberByLineId(data.lineUserId) };
}

function saveBooking(data) {
  var sheet = getOrCreateSheet("訂位紀錄", ["建立時間", "LINE ID", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "素食", "座位偏好", "用餐目的", "姓名", "電話", "備註", "預點餐"]);
  sheet.appendRow([ new Date(), data.lineUserId, data.date, data.time, data.adults, data.children, data.highChairs, data.vegetarian, data.seating, data.occasion, data.name, data.phone, data.notes, '' ]);
  return { status: 'success', bookingId: sheet.getLastRow() };
}

function updateMember(data) {
  // ... (Implementation to find row by lineUserId and update values)
  return { status: 'success', member: getMemberByLineId(data.lineUserId) };
}

function deleteMember(data) {
  // ... (Implementation to find and delete row by lineUserId)
  return { status: 'success' };
}

function savePreOrder(data) {
  var sheet = getOrCreateSheet("訂位紀錄");
  var orderSummary = data.order.map(item => `${item.n} x${item.qty}`).join('; ');
  sheet.getRange(data.bookingId, 14).setValue(orderSummary); // 14th column is '預點餐'
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