// 設定您的 Gemini API Key
var GEMINI_API_KEY = 'AIzaSyCHE3QBBqwCEGWtDxMeQiydp9eX1O7aCgU';
// 設定您的試算表 ID
var SPREADSHEET_ID = '1euqf6Hx1TKc858ZU9063jVU2qIoz4L6tUrldDT1g9h8';

var RESTAURANT_NAME = "薩諾瓦義式廚房";
var MENU_CONTEXT = `
你是一家位於金門的溫馨家庭式義大利餐廳 "薩諾瓦義式廚房" (Sanowa Kitchen) 的虛擬主廚 Luigi。
你的個性：非常熱情、友善，喜歡在講中文時穿插一點義大利語感嘆詞 (如 Ciao, Buono, Grazie, Mamma Mia!)。
你的任務是協助顧客挑選餐點，或者說服他們按下「立即訂位」按鈕。
請保持回答簡潔 (80字以內)。
`;

// ================= HTTP 請求處理 (API) =================

function doGet(e) {
  if (e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter);
  }
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle(RESTAURANT_NAME + ' 訂位系統')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    return handleApiRequest(params);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: 'Invalid JSON: ' + error.toString() });
  }
}

function handleApiRequest(params) {
  var action = params.action;
  var result = {};

  if (action === 'getInitialData') {
    result = getInitialData(params.lineUserId);
  } else if (action === 'register') {
    result = registerMember(params);
  } else if (action === 'booking') {
    result = saveBooking(params);
  } else if (action === 'chat') {
    result = callChefAI(params.message);
  } else if (action === 'preorder') { // 新增預點餐處理
    result = savePreorder(params);
  } else {
    result = { status: 'error', message: 'Unknown action' };
  }

  return createJsonResponse(result);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================= 核心邏輯 =================

function getInitialData(lineUserId) {
  try {
    return {
      status: 'success',
      member: getMemberByLineId(lineUserId),
      faqs: getFaqList(),
      promotions: getPromotionsList()
    };
  } catch (e) {
    Logger.log("getInitialData Error: " + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

function getPromotionsList() {
  try {
    var sheet = getOrCreateSheet("最新優惠", ["ID", "標題", "內容", "圖片網址", "期限"]);
    var data = sheet.getDataRange().getValues();
    var promos = [];

    if (data.length <= 1) {
      var defaults = [
        [1, "歡慶APP啟動", "全面加入會員，完成會員任務即贈送薯條一份！趕快邀請朋友一起來薩諾瓦相聚。", "https://images.unsplash.com/photo-1573080496987-a199f8cd4058?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "限時活動"],
        [2, "會員積點送", "加入會員即贈送 100 點購物金，點數可用於兌換商品，讓您越吃越划算。", "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "長期活動"]
      ];
      defaults.forEach(function(row) { sheet.appendRow(row); });
      data = sheet.getDataRange().getValues();
    }

    for (var i = 1; i < data.length; i++) {
      if (data[i][1]) {
        promos.push({
          id: data[i][0],
          title: data[i][1],
          desc: data[i][2],
          image: data[i][3],
          validUntil: data[i][4]
        });
      }
    }
    return promos;
  } catch (e) {
    return [];
  }
}

function registerMember(data) {
  var lock = LockService.getScriptLock();
  if (lock.tryLock(10000)) {
    try {
      if (!data.name || !data.phone) {
        return { status: 'error', message: '姓名與電話為必填' };
      }
      var headers = ["建立時間", "LINE ID", "姓名", "電話", "生日", "性別", "信箱", "地址", "點數", "得知管道", "飲食偏好"];
      var sheet = getOrCreateSheet("會員資料", headers);
      
      if (data.lineUserId && getMemberByLineId(data.lineUserId)) {
        return { status: 'error', message: '您已經是會員了' };
      }

      var initialPoints = 100;
      var dateStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
      
      sheet.appendRow([
        dateStr, data.lineUserId || '', String(data.name), String(data.phone), data.birthday || '',
        data.gender || '', data.email || '', data.address || '', initialPoints,
        data.source || '', data.dietary || ''
      ]);

      return { 
        status: 'success', 
        member: { name: data.name, points: initialPoints, phone: data.phone, birthday: data.birthday }
      };
    } catch (e) {
      return { status: 'error', message: "系統錯誤: " + e.toString() };
    } finally {
      lock.releaseLock();
    }
  } else {
    return { status: 'error', message: "系統繁忙，請稍後再試" };
  }
}

function saveBooking(data) {
  var lock = LockService.getScriptLock();
  if (lock.tryLock(10000)) {
    try {
      var headers = ["建立時間", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "姓名", "電話", "備註", "LINE ID"];
      var sheet = getOrCreateSheet("訂位紀錄", headers);
      var dateStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

      sheet.appendRow([
        dateStr, String(data.date), String(data.time), String(data.adults || 0),
        String(data.children || 0), String(data.highChairs || 0), String(data.name),
        String(data.phone), String(data.notes), data.lineUserId || ''
      ]);
      
      return { status: 'success', message: '預約成功' };
    } catch (e) {
      return { status: 'error', message: "系統錯誤: " + e.toString() };
    } finally {
      lock.releaseLock();
    }
  } else {
    return { status: 'error', message: "系統繁忙，請稍後再試" };
  }
}

function savePreorder(data) {
  var lock = LockService.getScriptLock();
  if (lock.tryLock(10000)) {
    try {
      var headers = ["訂單時間", "姓名", "電話", "預約日期", "預約時間", "餐點內容", "總金額", "LINE ID"];
      var sheet = getOrCreateSheet("預點訂單", headers);
      var dateStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
      
      var itemsStr = "";
      if (data.items && Array.isArray(data.items)) {
        itemsStr = data.items.map(function(item) {
          var detail = item.name + " x" + item.quantity;
          if (item.noodleType && item.noodleType !== "正常 (直麵)") detail += " [" + item.noodleType + "]";
          if (item.setOption && item.setOption !== "無") detail += " [" + item.setOption + "]";
          return detail;
        }).join("\n");
      }

      sheet.appendRow([
        dateStr, String(data.name), String(data.phone), String(data.bookingDate),
        String(data.bookingTime), itemsStr, data.totalAmount, data.lineUserId || ''
      ]);

      return { status: 'success', message: '預點成功' };
    } catch (e) {
      return { status: 'error', message: "預點失敗: " + e.toString() };
    } finally {
      lock.releaseLock();
    }
  } else {
    return { status: 'error', message: "系統繁忙，請稍後再試" };
  }
}

function callChefAI(userMessage) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_GEMINI_API_KEY')) {
    return { status: 'success', reply: "Mi scusi! 主廚現在在忙。請稍後再試。" };
  }
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;
  var payload = {
    "contents": [{ "parts": [{ "text": MENU_CONTEXT + "\n\nUser: " + userMessage }] }],
    "generationConfig": { "temperature": 0.7, "maxOutputTokens": 150 }
  };
  var options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
    var reply = "Mamma mia! 我好像聽不太懂。";
    if (json.candidates && json.candidates.length > 0 && json.candidates[0].content.parts.length > 0) {
      reply = json.candidates[0].content.parts[0].text;
    }
    return { status: 'success', reply: reply };
  } catch (e) {
    return { status: 'success', reply: "Scusi, 網路連線有點問題。" };
  }
}

// ================= 資料庫輔助函式 =================

function getMemberByLineId(lineUserId) {
  if (!lineUserId) return null;
  try {
    var sheet = getOrCreateSheet("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "性別", "信箱", "地址", "點數"]);
    var data = sheet.getDataRange().getValues();
    for (var i = data.length - 1; i > 0; i--) { // 從後往前找，找到最新的
      if (String(data[i][1]) === String(lineUserId)) {
        return {
          name: data[i][2], phone: data[i][3], birthday: data[i][4], points: data[i][8] || 0
        };
      }
    }
  } catch (e) { }
  return null;
}

function getFaqList() {
  try {
    var sheet = getOrCreateSheet("常見問題", ["問題", "回答"]);
    var data = sheet.getDataRange().getValues();
    var faqs = [];
    if (data.length <= 1) {
      var defaults = [
        ["有停車場嗎？", "路邊可停車，或至太湖路收費停車場。"],
        ["可以帶寵物嗎？", "可以，請使用寵物籃，不落地為主。"],
        ["當月壽星優惠？", "出示證件招待精緻甜點一份。"],
        ["營業時間？", "週二至週日 11:00-14:00, 17:00-20:30。"]
      ];
      defaults.forEach(function(row) { sheet.appendRow(row); });
      data = sheet.getDataRange().getValues();
    }
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) {
        faqs.push({ q: data[i][0], a: data[i][1] });
      }
    }
    return faqs;
  } catch (e) { return []; }
}

function getOrCreateSheet(sheetName, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}
