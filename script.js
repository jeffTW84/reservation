// Replace with your Firebase configuration
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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// Define available time slots (you can set available dates and times here)
// Format: { 'weekday': ['09:00', '10:00', '11:00'] }
// weekday: 'Sunday', 'Monday', etc.
const availableSlotsPerDay = {
    'Sunday': ['19:00', '20:00'],
    'Tuesday': ['17:00', '18:00'],
    'Wednesday': ['17:00', '18:00'],
    'Friday': ['17:00', '18:00'],
    'Saturday': ['19:00', '20:00']
};
// Define specific dates to disable booking (format: "2025-MM-DD")
const disabledDates = [
    "2025-09-05",
    "2025-09-15",
    "2025-09-16"
    // Add other dates you want to disable
];
// Dynamically generate days and weekdays for September 2025
const daysInSeptember = [];
const startDateSeptember = new Date(2025, 8, 1); // September 1, 2025
const endDateSeptember = new Date(2025, 8, 30);  // September 30, 2025
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

for (let d = new Date(startDateSeptember); d <= endDateSeptember; d.setDate(d.getDate() + 1)) {
    daysInSeptember.push({
        day: d.getDate(),
        weekday: weekdays[d.getDay()]
    });
}
// Current date (based on system time)
const now = new Date();
const currentDateStr = now.toISOString().split('T')[0]; // e.g., "2025-09-02"
// Generate calendar
function generateCalendar(month, tbodyId, startDate) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) {
        console.error(`Table body with ID ${tbodyId} not found.`);
        return;
    }
    let row = tbody.insertRow();
    let dayIndex = 0;
    const firstDayWeekday = month[0].weekday;
    const weekdaysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startOffset = weekdaysOrder.indexOf(firstDayWeekday);
    for (let i = 0; i < startOffset; i++) {
        row.insertCell();
    }
    month.forEach(dayObj => {
        if (row.cells.length === 7) {
            row = tbody.insertRow();
        }
        const cell = row.insertCell();
        cell.innerHTML = `<strong>${dayObj.day}</strong><br>`;
        const monthStr = '09';
        const dateStr = `2025-${monthStr}-${String(dayObj.day).padStart(2, '0')}`;
        const slots = availableSlotsPerDay[dayObj.weekday] || [];
        // Skip rendering slots for disabled dates
        if (disabledDates.includes(dateStr)) {
            return; // Do not render any slots for this date
        }
        // Check if the date is expired
        if (dateStr <= currentDateStr) {
            slots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('slot');
                slotDiv.textContent = `${slot} (Expired)`;
                slotDiv.style.backgroundColor = '#111';
                slotDiv.style.cursor = 'not-allowed';
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
// Check slot status
function checkSlotStatus(date, time, slotDiv) {
    const ref = db.ref(`appointments/${date}/${time}`);
    ref.once('value').then(snapshot => {
        if (snapshot.exists()) {
            slotDiv.classList.add('booked');
            slotDiv.textContent = `${time} (Booked)`;
            slotDiv.onclick = () => openModal('cancel', date, time);
        } else {
            slotDiv.classList.add('available');
            slotDiv.onclick = () => openModal('book', date, time);
        }
    });
}
// Open modal
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('booking-form');
const title = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-btn');
const nameInput = document.getElementById('name');
let currentAction, currentDate, currentTime;
function openModal(action, date, time) {
    currentAction = action;
    currentDate = date;
    currentTime = time;
    title.textContent = action === 'book' ? `Book ${date} ${time}` : `Cancel ${date} ${time}`;
    submitBtn.textContent = action === 'book' ? 'Confirm Booking' : 'Confirm Cancellation';
    if (action === 'cancel') {
        nameInput.style.display = 'none';
        nameInput.removeAttribute('required');
    } else {
        nameInput.style.display = 'block';
        nameInput.setAttribute('required', 'required');
    }
    modal.style.display = 'block';
}
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };
// Form submission
form.onsubmit = (e) => {
    e.preventDefault();
    const name = nameInput.value;
    const email = document.getElementById('email').value;
    const ref = db.ref(`appointments/${currentDate}/${currentTime}`);
    console.log(`Submitting ${currentAction} for ${currentDate} ${currentTime}, email: ${email}`);
    if (currentAction === 'book') {
        if (!name || !email) {
            alert('Please fill in name and email!');
            return;
        }
        ref.set({ booked: true, name, email })
            .then(() => {
                console.log('Booking successful');
                alert('Booking successful!');
                location.reload();
            })
            .catch(error => {
                console.error('Booking failed:', error);
                alert('Booking failed: ' + error.message);
            });
    } else if (currentAction === 'cancel') {
        if (!email) {
            alert('Please fill in email!');
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
                                alert('Cancellation successful!');
                                location.reload();
                            })
                            .catch(error => {
                                console.error('Cancellation failed:', error);
                                alert('Cancellation failed: ' + error.message);
                            });
                    } else {
                        console.log('Email mismatch:', bookingData.email, email);
                        alert('Email does not match. Please enter the same email used for booking.');
                    }
                } else {
                    console.log('No booking found for this slot');
                    alert('This time slot is not booked and does not require cancellation.');
                }
            })
            .catch(error => {
                console.error('Error checking cancellation:', error);
                alert('Error during cancellation: ' + error.message);
            });
    }
    console.log('Closing modal');
    modal.style.display = 'none';
};
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar(daysInSeptember, 'calendar-body-september', startDateSeptember);
});