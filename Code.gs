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
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
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
      return { name: data[i][2], phone: data[i][3], points: data[i][8] || 0 };
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
  var sheet = getOrCreateSheet("最新優惠", ["ID", "標題", "內容", "圖片", "期限"]);
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][1]) list.push({ id: data[i][0], title: data[i][1], desc: data[i][2], image: data[i][3] });
  }
  return list.length ? list : [{title:"歡迎光臨薩諾瓦", desc:"加入會員即享積點優惠", image:"https://picsum.photos/400/200"}];
}

function registerMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  var dateStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  sheet.appendRow([dateStr, data.lineUserId || '', data.name, data.phone, '', '', '', '', 100]);
  return { status: 'success', member: { name: data.name, phone: data.phone, points: 100 } };
}

function saveBooking(data) {
  var sheet = getOrCreateSheet("訂位紀錄", ["建立時間", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "姓名", "電話", "備註", "LINE ID"]);
  var dateStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  sheet.appendRow([dateStr, data.date, data.time, data.adults, 0, 0, data.name, data.phone, '', data.lineUserId || '']);
  return { status: 'success' };
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers) sheet.appendRow(headers);
  }
  return sheet;
}