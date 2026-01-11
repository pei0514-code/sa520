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
          chefRecommendations: getSheetDataAsJson("主廚推薦", ["產品名稱", "產品價格", "產品說明", "圖片網址"]),
          restaurantMenu: getSheetDataAsJson("本店餐點", ["類別", "子類別", "產品名稱", "產品價格", "圖片網址", "說明", "標籤"]), 
          slotSettings: getSlotSettings(), 
          bookingsSummary: getBookingsSummary(),
          seatInventory: getSheetDataAsJson("訂位資訊", ["日期", "時段", "可訂位人數", "已訂位人數", "剩餘空位"])
        };
        break;
      case 'getAdminData': result = getAdminData(params); break; // New Admin Action
      case 'register': result = registerMember(params); break;
      case 'booking': result = saveBooking(params); break;
      case 'updateBooking': result = updateBooking(params); break;
      case 'cancelBooking': result = cancelBooking(params); break;
      case 'findBooking': result = findBooking(params); break;
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
    var data = getSheetDataAsJson(sheetName, []);
    return data.filter(row => row['LINE ID'] === lineUserId);
}

function getStampCardStatus(lineUserId) {
    if (!lineUserId) return { stamps: 0 };
    var data = getSheetDataAsJson("集點卡", ["LINE ID", "點數"]);
    var userStamps = data.find(row => row['LINE ID'] === lineUserId);
    return userStamps ? userStamps.點數 : 0;
}

function getSlotSettings() {
    var sheet = getOrCreateSheet("系統設定", ["時段", "可訂位人數", "已訂位人數", "剩餘空位", "低消設定"]);
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
        var defaults = [
            ["11:00", 30, "", "", 180], ["11:30", 30, "", "", 180], ["12:00", 30, "", "", 180], 
            ["12:30", 30, "", "", 180], ["13:00", 30, "", "", 180],
            ["17:00", 30, "", "", 180], ["17:30", 30, "", "", 180], ["18:00", 30, "", "", 180], 
            ["18:30", 30, "", "", 180], ["19:00", 30, "", "", 180], ["19:30", 30, "", "", 180]
        ];
        defaults.forEach(row => sheet.appendRow(row));
        data = sheet.getDataRange().getValues();
    }

    var settings = {};
    for (var i = 1; i < data.length; i++) {
        var time = data[i][0];
        if (time instanceof Date) {
            time = time.getHours() + ':' + (time.getMinutes()<10?'0':'') + time.getMinutes();
        } else {
             time = String(time).substring(0, 5);
        }
        
        settings[time] = {
            max: Number(data[i][1]) || 30,
            minCharge: Number(data[i][4]) || 0
        };
    }
    return settings;
}

function getBookingsSummary() {
    var sheet = getOrCreateSheet("訂位紀錄", ["訂位代號", "建立時間", "LINE ID", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "素食", "姓名", "電話", "備註", "預點餐"]);
    var data = sheet.getDataRange().getValues();
    var summary = [];
    
    for (var i = 1; i < data.length; i++) {
        var date = data[i][3]; 
        var time = data[i][4]; 
        var adults = Number(data[i][5]) || 0;
        var children = Number(data[i][6]) || 0;
        
        var d = new Date(date);
        var today = new Date();
        today.setHours(0,0,0,0);
        
        if (d >= today) {
            var dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
            var timeStr = time;
            if (time instanceof Date) {
                 timeStr = time.getHours() + ':' + (time.getMinutes()<10?'0':'') + time.getMinutes();
            } else {
                 timeStr = String(time).substring(0, 5);
            }
            summary.push({ date: dateStr, time: timeStr, count: adults + children });
        }
    }
    return summary;
}

function findBooking(params) {
    var sheet = getOrCreateSheet("訂位紀錄");
    var data = sheet.getDataRange().getValues();
    var results = [];
    var today = new Date();
    today.setHours(0,0,0,0);

    for (var i = 1; i < data.length; i++) {
        var rowDate = new Date(data[i][3]);
        var rowName = data[i][9];
        var rowPhone = String(data[i][10]);
        if (!rowPhone.startsWith('0') && rowPhone.length === 9) rowPhone = '0' + rowPhone;
        rowPhone = rowPhone.replace(/^'/, '');
        
        if (rowDate >= today && rowName == params.name && rowPhone == params.phone) {
            var dateStr = rowDate.getFullYear() + '-' + String(rowDate.getMonth()+1).padStart(2,'0') + '-' + String(rowDate.getDate()).padStart(2,'0');
            var timeStr = data[i][4]; 
            if (timeStr instanceof Date) {
               timeStr = timeStr.getHours() + ':' + (timeStr.getMinutes()<10?'0':'') + timeStr.getMinutes();
            } else {
               timeStr = String(timeStr).substring(0, 5);
            }

            results.push({
                id: i + 1,
                bookingCode: data[i][0],
                date: dateStr,
                time: timeStr,
                adults: data[i][5],
                children: data[i][6],
                highChairs: data[i][7],
                vegetarian: data[i][8] === '是',
                name: rowName,
                phone: rowPhone,
                notes: data[i][11],
                preOrder: data[i][12]
            });
        }
    }
    return { status: 'success', bookings: results };
}

// ========================
// Admin Functions
// ========================
function getAdminData(params) {
    var member = getMemberByLineId(params.lineUserId);
    var admins = ['0937942582', '0978375273', '0978375592'];
    
    // Normalize phone numbers: remove quotes and dashes
    var userPhone = member ? String(member['電話']).replace(/^'/, '').replace(/-/g, '') : '';
    
    if (!member || !admins.includes(userPhone)) {
        return { status: 'error', message: '無權限存取後台' };
    }

    var sheet = getOrCreateSheet("訂位紀錄");
    var data = sheet.getDataRange().getValues();
    var results = [];
    var today = new Date();
    today.setHours(0,0,0,0);

    for (var i = 1; i < data.length; i++) {
        var rowDate = new Date(data[i][3]);
        
        // Return today and future bookings
        if (rowDate >= today) {
            var dateStr = rowDate.getFullYear() + '-' + String(rowDate.getMonth()+1).padStart(2,'0') + '-' + String(rowDate.getDate()).padStart(2,'0');
            var timeStr = data[i][4]; 
            if (timeStr instanceof Date) {
               timeStr = timeStr.getHours() + ':' + (timeStr.getMinutes()<10?'0':'') + timeStr.getMinutes();
            } else {
               timeStr = String(timeStr).substring(0, 5);
            }
            
            var phone = String(data[i][10]).replace(/^'/, '');

            results.push({
                id: i + 1,
                bookingCode: data[i][0],
                date: dateStr,
                time: timeStr,
                adults: data[i][5],
                children: data[i][6],
                highChairs: data[i][7],
                vegetarian: data[i][8] === '是',
                name: data[i][9],
                phone: phone,
                notes: data[i][11],
                preOrder: data[i][12]
            });
        }
    }
    return { status: 'success', bookings: results };
}

// ========================
// Data Modification Functions
// ========================
function registerMember(data) {
  var sheet = getOrCreateSheet("會員資料", ["建立時間", "LINE ID", "姓名", "電話", "生日", "點數", "性別", "Email"]);
  sheet.appendRow([ new Date(), data.lineUserId, data.name, "'" + data.phone, data.birthday, 100, data.gender, data.email ]);
  addPoints(data.lineUserId, 100, "新會員註冊禮");
  getOrCreateSheet("集點卡", ["LINE ID", "點數"]).appendRow([data.lineUserId, 0]);
  
  var newMember = {
    'LINE ID': data.lineUserId, '姓名': data.name, '電話': data.phone, '生日': data.birthday, '點數': 100, '性別': data.gender, 'Email': data.email
  };
  return { status: 'success', member: newMember };
}

function generateBookingCode() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var nums = '0123456789';
  var code = '';
  // 2 Random Letters
  for (var i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // 4 Random Numbers
  for (var i = 0; i < 4; i++) {
    code += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return code;
}

// Manage Inventory in "訂位資訊" sheet
function updateSeatInventory(date, time, deltaPeople) {
    var sheet = getOrCreateSheet("訂位資訊", ["日期", "時段", "可訂位人數", "已訂位人數", "剩餘空位"]);
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    var maxSeats = 30; // Default max capacity
    var currentBooked = 0;

    // Standardize date string for comparison
    var targetDateStr = date; // Expecting 'YYYY-MM-DD' from frontend
    // If backend logic needs to parse:
    var targetDateObj = new Date(date);
    // Ensure we are comparing simple date strings
    
    // Find existing row
    for (var i = 1; i < data.length; i++) {
        var rowDate = data[i][0];
        var rowDateStr = "";
        if (rowDate instanceof Date) {
            rowDateStr = rowDate.getFullYear() + '-' + String(rowDate.getMonth()+1).padStart(2,'0') + '-' + String(rowDate.getDate()).padStart(2,'0');
        } else {
            rowDateStr = String(rowDate);
        }
        
        var rowTime = data[i][1];
        if (rowTime instanceof Date) {
            rowTime = rowTime.getHours() + ':' + (rowTime.getMinutes()<10?'0':'') + rowTime.getMinutes();
        } else {
            rowTime = String(rowTime).substring(0, 5);
        }

        if (rowDateStr === targetDateStr && rowTime === time) {
            rowIndex = i + 1;
            maxSeats = Number(data[i][2]);
            currentBooked = Number(data[i][3]);
            break;
        }
    }

    if (rowIndex !== -1) {
        var newBooked = currentBooked + deltaPeople;
        if (newBooked < 0) newBooked = 0;
        var remaining = maxSeats - newBooked;
        sheet.getRange(rowIndex, 4).setValue(newBooked);
        sheet.getRange(rowIndex, 5).setValue(remaining);
    } else {
        var newBooked = deltaPeople > 0 ? deltaPeople : 0;
        var remaining = maxSeats - newBooked;
        sheet.appendRow([targetDateStr, time, maxSeats, newBooked, remaining]);
    }
}

function saveBooking(data) {
  var sheet = getOrCreateSheet("訂位紀錄", ["訂位代號", "建立時間", "LINE ID", "預約日期", "預約時間", "大人", "小孩", "兒童椅", "素食", "姓名", "電話", "備註", "預點餐"]);
  
  var bookingCode = generateBookingCode();
  
  sheet.appendRow([ 
      bookingCode, 
      new Date(), 
      data.lineUserId, 
      data.date, 
      data.time, 
      data.adults, 
      data.children, 
      data.highChairs, 
      data.vegetarian ? '是' : '否', 
      data.name, 
      "'" + data.phone, 
      data.notes, 
      '' 
  ]);

  var totalPeople = Number(data.adults) + Number(data.children);
  updateSeatInventory(data.date, data.time, totalPeople);

  return { status: 'success', bookingId: sheet.getLastRow(), bookingCode: bookingCode };
}

function updateBooking(data) {
    var sheet = getOrCreateSheet("訂位紀錄");
    var row = Number(data.bookingId);
    if (row > 1 && row <= sheet.getLastRow()) {
        var oldDate = sheet.getRange(row, 4).getValue();
        var oldDateStr = "";
        if (oldDate instanceof Date) {
             oldDateStr = oldDate.getFullYear() + '-' + String(oldDate.getMonth()+1).padStart(2,'0') + '-' + String(oldDate.getDate()).padStart(2,'0');
        }
        
        var oldTime = sheet.getRange(row, 5).getValue();
        if (oldTime instanceof Date) {
             oldTime = oldTime.getHours() + ':' + (oldTime.getMinutes()<10?'0':'') + oldTime.getMinutes();
        } else {
             oldTime = String(oldTime).substring(0, 5);
        }
        var oldPeople = Number(sheet.getRange(row, 6).getValue()) + Number(sheet.getRange(row, 7).getValue());

        sheet.getRange(row, 4).setValue(data.date);       
        sheet.getRange(row, 5).setValue(data.time);       
        sheet.getRange(row, 6).setValue(data.adults);     
        sheet.getRange(row, 7).setValue(data.children);   
        sheet.getRange(row, 8).setValue(data.highChairs); 
        sheet.getRange(row, 9).setValue(data.vegetarian ? '是' : '否'); 
        sheet.getRange(row, 10).setValue(data.name);      
        sheet.getRange(row, 11).setValue("'" + data.phone); 
        sheet.getRange(row, 12).setValue(data.notes);     
        
        var bookingCode = sheet.getRange(row, 1).getValue();

        var newPeople = Number(data.adults) + Number(data.children);
        
        if (oldDateStr === data.date && oldTime === data.time) {
            updateSeatInventory(data.date, data.time, newPeople - oldPeople);
        } else {
            updateSeatInventory(oldDateStr, oldTime, -oldPeople);
            updateSeatInventory(data.date, data.time, newPeople);
        }

        return { status: 'success', bookingId: row, bookingCode: bookingCode };
    }
    return { status: 'error', message: '訂位資料找不到' };
}

function cancelBooking(data) {
    var sheet = getOrCreateSheet("訂位紀錄");
    var row = Number(data.bookingId);
    if (row > 1 && row <= sheet.getLastRow()) {
        var date = sheet.getRange(row, 4).getValue();
        var dateStr = "";
        if (date instanceof Date) {
             dateStr = date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
        }

        var time = sheet.getRange(row, 5).getValue();
         if (time instanceof Date) {
             time = time.getHours() + ':' + (time.getMinutes()<10?'0':'') + time.getMinutes();
        } else {
             time = String(time).substring(0, 5);
        }
        var people = Number(sheet.getRange(row, 6).getValue()) + Number(sheet.getRange(row, 7).getValue());

        sheet.deleteRow(row);

        updateSeatInventory(dateStr, time, -people);

        return { status: 'success' };
    }
    return { status: 'error', message: '訂位資料找不到' };
}

function updateMember(data) {
  var sheet = getOrCreateSheet("會員資料");
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][1] === data.lineUserId) {
      sheet.getRange(i + 1, 3).setValue(data.name);
      sheet.getRange(i + 1, 4).setValue("'" + data.phone);
      sheet.getRange(i + 1, 5).setValue(data.birthday);
      if (values[0].length > 6) sheet.getRange(i + 1, 7).setValue(data.gender);
      if (values[0].length > 7) sheet.getRange(i + 1, 8).setValue(data.email);
      return { 
          status: 'success', 
          member: {
            'LINE ID': data.lineUserId, '姓名': data.name, '電話': data.phone, '生日': data.birthday, '性別': data.gender, 'Email': data.email,
            '點數': Number(values[i][5])
          }
      };
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
  // 將點餐內容字串化儲存
  var orderSummary = data.order.map(item => {
      let desc = `${item.n}`;
      if(item.noodle) desc += `(${item.noodle})`;
      if(item.spice) desc += `[${item.spice}]`;
      if(item.combo) desc += `+${item.combo}`;
      if(item.drink) desc += `/${item.drink}`;
      desc += ` x${item.qty}`;
      return desc;
  }).join('; ');
  
  sheet.getRange(data.bookingId, 13).setValue(orderSummary);
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
