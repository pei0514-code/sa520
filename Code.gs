// 薩諾瓦義式廚房 - Google Apps Script 後端
var SPREADSHEET_ID = '1euqf6Hx1TKc858ZU9063jVU2qIoz4L6tUrldDT1g9h8';

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    var result = {};

    if (action === 'getInitialData') {
      result = {
        status: 'success',
        member: getMemberByLineId(params.lineUserId),
        faqs: getFaqList(),
        promotions: getPromotionsList()
      };
    } else if (action === 'register') {
      result = registerMember(params);
    } else if (action === 'booking') {
      result = saveBooking(params);
    } else if (action === 'updateMember') {
      result = updateMember(params);
    } else if (action === 'deleteMember') {
      result = deleteMember(params);
    } else if (action === 'savePreOrder') {
      result = savePreOrder(params);
    }


    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getMemberByLineId(lineUserId) {
  if (!lineUserId) return null;
  var sheet = getOrCreateSheet("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "性別", "信箱", "地址", "點數"]);
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i > 0; i--) {
    if (String(data[i][1]) === String(lineUserId)) {
      return { 
        name: data[i][2], 
        phone: data[i][3], 
        birthday: data[i][4] ? new Date(data[i][4]).toISOString().split('T')[0] : '',
        gender: data[i][5],
        email: data[i][6],
        address: data[i][7],
        points: data[i][8] || 0 
      };
    }
  }
  return null;
}

function getFaqList() {
  var sheet = getOrCreateSheet("常見問題", ["問題", "回答"]);
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) list.push({ q: data[i][0], a: data[i][1] });
  }
  return list.length ? list : [{q:"營業時間?", a:"週二至週日 11:00-14:00, 17:00-20:30。"}];
}

function getPromotionsList() {
  var sheet = getOrCreateSheet("最新優惠", ["圖片網址", "標題", "內容", "備註"]);
  var data = sheet.getDataRange().getValues();
  var list = [];
  if (data.length <= 1) {
    // 預設內容
    var defaultPromo = ["https://i.ibb.co/qLFg7gSk/Gemini-Generated-Image-cmj4yzcmj4yzcmj4.png", "歡慶APP啟動", "全面加入會員，完成會員任務即贈送薯條一份。", "限內用"];
    sheet.appendRow(defaultPromo);
    list.push({ image: defaultPromo[0], title: defaultPromo[1], desc: defaultPromo[2] });
  } else {
    for (var i = 1; i < data.length; i++) {
      if (data[i][1]) list.push({ image: data[i][0], title: data[i][1], desc: data[i][2] });
    }
  }
  return list;
}

function registerMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  var dateStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  var newMember = {
    name: data.name,
    phone: data.phone,
    birthday: data.birthday,
    points: 100
  };
  sheet.appendRow([
    dateStr, 
    data.lineUserId || '', 
    data.name, 
    data.phone, 
    data.birthday || '', 
    data.gender || '', 
    data.email || '', 
    data.address || '', 
    100
  ]);
  return { 
    status: 'success', 
    member: newMember
  };
}

function saveBooking(data) {
  var sheet = getOrCreateSheet("訂位紀錄", ["建立時間", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "姓名", "電話", "備註", "LINE ID", "預點餐"]);
  var dateStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  sheet.appendRow([
    dateStr, 
    data.date, 
    data.time, 
    data.adults, 
    data.children || 0, 
    data.highChairs || 0, 
    data.name, 
    data.phone, 
    data.notes || '', 
    data.lineUserId || '',
    ''
  ]);
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
      // You can add more fields to update here
      var updatedMember = getMemberByLineId(data.lineUserId);
      return { status: 'success', member: updatedMember };
    }
  }
  return { status: 'error', message: '會員不存在' };
}

function deleteMember(data) {
    var sheet = getOrCreateSheet("會員資料");
    var values = sheet.getDataRange().getValues();
    // Iterate backwards when deleting rows to avoid index shifting issues
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
  var bookingId = data.bookingId;
  var orderData = data.order;
  var orderSummary = orderData.map(function(item) {
    return item.n + ' x' + item.qty;
  }).join(', ');

  // Column K is the 11th column
  sheet.getRange(bookingId, 11).setValue(orderSummary);
  return { status: 'success' };
}


function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}