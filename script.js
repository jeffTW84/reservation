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
// 匿名登入
firebase.auth().signInAnonymously().catch(function(error) {
  console.error("登入失敗:", error);
});
// 監聽登入狀態變化
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("使用者已登入，UID:", user.uid);
  } else {
    console.log("無使用者登入");
  }
});
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
    "2025-08-15",
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
// 當前日期（基於系統時間）
const now = new Date();
const currentDateStr = now.toISOString().split('T')[0]; // 例如 "2025-08-09"

// 生成日曆
function generateCalendar() {
    const tbody = document.getElementById('calendar-body');
    let row = tbody.insertRow();
    let dayIndex = 0;
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
        cell.innerHTML = `<strong>${dayObj.day}</strong><br>`;
        const dateStr = `2025-08-${String(dayObj.day).padStart(2, '0')}`;
        const slots = availableSlotsPerDay[dayObj.weekday] || [];
       
        // 檢查日期是否在disabledDates中或已過期
        if (disabledDates.includes(dateStr)) {
            slots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('slot');
                slotDiv.textContent = `${slot} (無空)`;
                slotDiv.style.backgroundColor = '#ccc'; // 灰色表示不可用
                slotDiv.style.cursor = 'not-allowed'; // 不可點擊
                cell.appendChild(slotDiv);
            });
        } else if (dateStr < currentDateStr) {
            slots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('slot');
                slotDiv.textContent = `${slot} (過期)`;
                slotDiv.style.backgroundColor = '#111'; // 灰色表示不可用
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
const nameInput = document.getElementById('name'); // 添加name輸入框參考
let currentAction, currentDate, currentTime;

function openModal(action, date, time) {
    currentAction = action;
    currentDate = date;
    currentTime = time;
    title.textContent = action === 'book' ? `預約 ${date} ${time}` : `取消 ${date} ${time}`;
    submitBtn.textContent = action === 'book' ? '確認預約' : '確認取消';
    
    // 動態管理name輸入框
    if (action === 'cancel') {
        nameInput.style.display = 'none';
        nameInput.removeAttribute('required'); // 移除required屬性
    } else {
        nameInput.style.display = 'block';
        nameInput.setAttribute('required', 'required'); // 添加required屬性
    }
    modal.style.display = 'block';
}

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };

// 表單提交
form.onsubmit = (e) => {
    e.preventDefault();
    const name = nameInput.value;
    const email = document.getElementById('email').value;
    const user = firebase.auth().currentUser;
    const ref = db.ref(`appointments/${currentDate}/${currentTime}`);
    console.log(`Submitting ${currentAction} for ${currentDate} ${currentTime}, email: ${email}, user: ${user ? user.uid : 'null'}`);

    if (currentAction === 'book') {
        if (!name || !email) {
            alert('請填寫姓名和電子郵件！');
            return;
        }
        if (!user) {
            alert('請先登入！');
            return;
        }
        ref.set({ booked: true, name, email })
            .then(() => {
                console.log('Booking successful');
                alert('預約成功！');
                location.reload();
            })
            .catch(error => {
                console.error('Booking failed:', error);
                alert('預約失敗：' + error.message);
            });
    } else if (currentAction === 'cancel') {
        if (!email) {
            alert('請填寫電子郵件！');
            return;
        }
        if (!user) {
            alert('請先登入！');
            return;
        }
        ref.once('value')
            .then(snapshot => {
                console.log('Checking cancellation data:', snapshot.val());
                if (snapshot.exists()) {
                    const bookingData = snapshot.val();
                    if (bookingData.email.toLowerCase() === email.toLowerCase()) {
                        ref.remove()
                            .then(() => {
                                console.log('Cancellation successful');
                                alert('取消成功！');
                                location.reload();
                            })
                            .catch(error => {
                                console.error('Cancellation failed:', error);
                                alert('取消失敗：' + error.message);
                            });
                    } else {
                        console.log('Email mismatch:', bookingData.email, email);
                        alert('Email不匹配，無法取消。請輸入與預約時相同的email。');
                    }
                } else {
                    console.log('No booking found for this slot');
                    alert('此時段未被預約，無需取消。');
                }
            })
            .catch(error => {
                console.error('Error checking cancellation:', error);
                alert('取消時發生錯誤：' + error.message);
            });
    }
    console.log('Closing modal');
    modal.style.display = 'none';
};
// 初始化
document.addEventListener('DOMContentLoaded', generateCalendar);