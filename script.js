// 替換成您的Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyDrCKxWMeY_7WRQKw1pLB2lMktKK8U_XnQ",
  authDomain: "reservation-ecfcf.firebaseapp.com",
  databaseURL: "https://reservation-ecfcf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "reservation-ecfcf",
  storageBucket: "reservation-ecfcf.firebasestorage.app",
  messagingSenderId: "401737381919",
  appId: "1:401737381919:web:e4b69a8d2f293e20d0bd2a",
  measurementId: "G-4R6H0NDHKS"
};
// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// 定義可用時段（您可以在這裡設定有空的日期時間）
// 格式：{ 'weekday': ['09:00', '10:00', '11:00'] }
// weekday: 'Monday', 'Tuesday', etc.
const availableSlotsPerDay = {
    'Sunday': ['19:00', '20:00'],
    'Tuesday': ['17:00', '18:00'],
    'Wednesday': ['17:00', '18:00'],
    'Friday': ['17:00', '18:00'],
    'Saturday': ['19:00', '20:00']
};
// 定義關閉預約的特定日期（格式: "2025-08-DD"）
const disabledDates = [
    "2025-08-26",
    "2025-08-27",
    "2025-08-28",
    "2025-08-29",
    "2025-08-30"
    // 添加您想關閉的其他日期
];
// 2025年8月日子和星期
const daysInAugust = [
    { day: 1, weekday: 'Friday' },
    { day: 2, weekday: 'Saturday' },
    { day: 3, weekday: 'Sunday' },
    { day: 4, weekday: 'Monday' },
    { day: 5, weekday: 'Tuesday' },
    { day: 6, weekday: 'Wednesday' },
    { day: 7, weekday: 'Thursday' },
    { day: 8, weekday: 'Friday' },
    { day: 9, weekday: 'Saturday' },
    { day: 10, weekday: 'Sunday' },
    { day: 11, weekday: 'Monday' },
    { day: 12, weekday: 'Tuesday' },
    { day: 13, weekday: 'Wednesday' },
    { day: 14, weekday: 'Thursday' },
    { day: 15, weekday: 'Friday' },
    { day: 16, weekday: 'Saturday' },
    { day: 17, weekday: 'Sunday' },
    { day: 18, weekday: 'Monday' },
    { day: 19, weekday: 'Tuesday' },
    { day: 20, weekday: 'Wednesday' },
    { day: 21, weekday: 'Thursday' },
    { day: 22, weekday: 'Friday' },
    { day: 23, weekday: 'Saturday' },
    { day: 24, weekday: 'Sunday' },
    { day: 25, weekday: 'Monday' },
    { day: 26, weekday: 'Tuesday' },
    { day: 27, weekday: 'Wednesday' },
    { day: 28, weekday: 'Thursday' },
    { day: 29, weekday: 'Friday' },
    { day: 30, weekday: 'Saturday' },
    { day: 31, weekday: 'Sunday' }
];
// 生成日曆
function generateCalendar() {
    const tbody = document.getElementById('calendar-body');
    let row = tbody.insertRow();
    let dayIndex = 0;
    // 第一週的空位（8/1是Friday，所以前4格空）
    const firstDayWeekday = daysInAugust[0].weekday;
    const weekdaysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startOffset = weekdaysOrder.indexOf(firstDayWeekday);
    for (let i = 0; i < startOffset; i++) {
        row.insertCell();
    }
    daysInAugust.forEach(dayObj => {
        if (row.cells.length === 7) {
            row = tbody.insertRow();
        }
        const cell = row.insertCell();
        cell.innerHTML = `<strong>${dayObj.day}</strong><br>${dayObj.weekday}`;
       
        const dateStr = `2025-08-${String(dayObj.day).padStart(2, '0')}`;
        const slots = availableSlotsPerDay[dayObj.weekday] || [];
       
        // 檢查日期是否在disabledDates中
        if (disabledDates.includes(dateStr)) {
            slots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('slot');
                slotDiv.textContent = `${slot} (無空)`;
                slotDiv.style.backgroundColor = '#ccc'; // 灰色表示不可用
                slotDiv.style.cursor = 'not-allowed'; // 不可點擊
                cell.appendChild(slotDiv);
            });
        } else {
            slots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('slot');
                slotDiv.dataset.date = dateStr;
                slotDiv.dataset.time = slot;
                slotDiv.textContent = slot;
                cell.appendChild(slotDiv);
               
                // 檢查DB狀態
                checkSlotStatus(dateStr, slot, slotDiv);
            });
        }
    });
}
// 檢查時段狀態
function checkSlotStatus(date, time, slotDiv) {
    const ref = db.ref(`appointments/${date}/${time}`);
    ref.once('value').then(snapshot => {
        if (snapshot.exists()) {
            slotDiv.classList.add('booked');
            slotDiv.textContent = `${time} (已預約)`;
            slotDiv.onclick = () => openModal('cancel', date, time);
        } else {
            slotDiv.classList.add('available');
            slotDiv.onclick = () => openModal('book', date, time);
        }
    });
}
// 開啟模態
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('booking-form');
const title = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-btn');
let currentAction, currentDate, currentTime;
function openModal(action, date, time) {
    currentAction = action;
    currentDate = date;
    currentTime = time;
    title.textContent = action === 'book' ? `預約 ${date} ${time}` : `取消 ${date} ${time}`;
    submitBtn.textContent = action === 'book' ? '確認預約' : '確認取消';
    if (action === 'cancel') {
        document.getElementById('name').style.display = 'none';
        document.querySelector('label[for="name"]').style.display = 'none';
    } else {
        document.getElementById('name').style.display = 'block';
        document.querySelector('label[for="name"]').style.display = 'block';
    }
    modal.style.display = 'block';
}
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };
// 表單提交
form.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const ref = db.ref(`appointments/${currentDate}/${currentTime}`);
   
    if (currentAction === 'book') {
        ref.set({ booked: true, name, email }).then(() => {
            alert('預約成功！');
            location.reload(); // 重新載入更新日曆
        });
    } else if (currentAction === 'cancel') {
        ref.once('value').then(snapshot => {
            if (snapshot.exists()) {
                const bookingData = snapshot.val();
                if (bookingData.email === email) {
                    ref.remove().then(() => {
                        alert('取消成功！');
                        location.reload();
                    }).catch(error => {
                        alert('取消失敗，請稍後再試。錯誤：' + error.message);
                    });
                } else {
                    alert('Email不匹配，無法取消。請輸入與預約時相同的email。');
                }
            } else {
                alert('此時段未被預約，無需取消。');
            }
        }).catch(error => {
            alert('取消時發生錯誤：' + error.message);
        });
    }
    modal.style.display = 'none';
};
// 初始化
document.addEventListener('DOMContentLoaded', generateCalendar);