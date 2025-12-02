// js/dashboard.js
// Simple dashboard demo behavior: auth check, demo data, logout

(function () {
  // Auth check: expects localStorage.user (JSON) or localStorage.loggedIn === "true"
  const userJson = localStorage.getItem('user');
  const loggedIn = localStorage.getItem('loggedIn');

  if (!userJson && loggedIn !== 'true') {
    // not logged in -> redirect to login
    window.location.href = 'login.html';
    return;
  }

  const user = userJson ? JSON.parse(userJson) : { name: 'User' };

  // personalize welcome
  const welcomeTitle = document.getElementById('welcomeTitle');
  const welcomeSubtitle = document.getElementById('welcomeSubtitle');
  if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${user.name || user.username || 'User'}`;
  if (welcomeSubtitle) welcomeSubtitle.textContent = `Logged in — last seen: just now`;

  // Demo stats & appointment data (replace with real data fetch later)
  const demoStats = {
    patients: 1240,
    doctors: 56,
    todayAppts: 18,
    alerts: 2
  };

  document.getElementById('totalPatients').textContent = demoStats.patients;
  document.getElementById('totalDoctors').textContent = demoStats.doctors;
  document.getElementById('todayAppointments').textContent = demoStats.todayAppts;
  document.getElementById('activeAlerts').textContent = demoStats.alerts;

  // Demo appointments list
  const appts = [
    { time: '09:00', patient: 'Ravi K', doctor: 'Dr. Sharma', status: 'Confirmed' },
    { time: '09:30', patient: 'Anita P', doctor: 'Dr. Kumar', status: 'Pending' },
    { time: '10:00', patient: 'Sunita R', doctor: 'Dr. Mehra', status: 'Confirmed' },
    { time: '11:30', patient: 'Prakash L', doctor: 'Dr. Sharma', status: 'Emergency' }
  ];

  const tbody = document.querySelector('#apptTable tbody');
  appts.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.time}</td><td>${a.patient}</td><td>${a.doctor}</td><td>${a.status}</td>`;
    tbody.appendChild(tr);
  });

  // Demo recent activity
  const activity = [
    'Patient Ravi K checked in (09:00).',
    'New lab report available for Anita P.',
    'Dr. Sharma marked appointment as completed.'
  ];
  const activityList = document.getElementById('activityList');
  activity.forEach(it => {
    const li = document.createElement('li');
    li.textContent = it;
    activityList.appendChild(li);
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      localStorage.removeItem('loggedIn');
      window.location.href = 'login.html';
    });
  }

  // Quick action handlers
  document.querySelectorAll('.action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;
      alert('Quick action: ' + action + '\n(This is a demo — integrate AI endpoints to run real actions.)');
    });
  });

  // New appointment demo button
  const newApptBtn = document.getElementById('newAppointmentBtn');
  if (newApptBtn) {
    newApptBtn.addEventListener('click', () => {
      alert('Open new appointment modal (demo) — implement actual form here.');
    });
  }
})();

/* ======= Appointment edit/delete + add (robust unified handler) ======= */
(function () {
  const modal = document.getElementById("apptModal");
  const newBtn = document.getElementById("newAppointmentBtn");
  const saveBtn = document.getElementById("saveAppt");
  const cancelBtn = document.getElementById("cancelAppt");
  const apptTableBody = document.querySelector("#apptTable tbody");
  const todayCountEl = document.getElementById('todayAppointments');

  if (!modal || !newBtn || !saveBtn || !cancelBtn || !apptTableBody) {
    console.warn("Appointment module: required elements not found. Skipping.");
    return;
  }

  // In-memory state for editing
  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  let editingIndex = null; // null => creating new; number => editing that index

  // Utility: create row element for an appointment
  function createRow(appt, index) {
    const tr = document.createElement('tr');
    tr.dataset.index = index; // store index for easy lookup
    tr.innerHTML = `
      <td>${appt.time}</td>
      <td class="appt-name">${escapeHtml(appt.name)}</td>
      <td>${escapeHtml(appt.doctor)}</td>
      <td>${escapeHtml(appt.status || 'Scheduled')}</td>
      <td>
        <button class="action-btn edit-btn">✏️ Edit</button>
        <button class="action-btn delete-btn">🗑️ Delete</button>
      </td>
    `;
    return tr;
  }

  // Escape simple html to avoid injection when writing into innerHTML
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Render full table from appointments array
  function renderTable() {
    apptTableBody.innerHTML = '';
    appointments.forEach((a, i) => {
      apptTableBody.appendChild(createRow(a, i));
    });
  }

  // Persist appointments to localStorage
  function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }

  // Update today's appointment counter (simple sum; you can refine by date)
  function updateTodayCount() {
    if (!todayCountEl) return;
    const current = appointments.length;
    todayCountEl.textContent = String(current);
  }

  // Reset modal fields and editing state
  function openModalForNew() {
    editingIndex = null;
    document.getElementById("apptName").value = "";
    document.getElementById("apptAge").value = "";
    document.getElementById("apptGender").value = "Male";
    document.getElementById("apptSymptoms").value = "";
    document.getElementById("apptDoctor").value = "Dr. Sharma";
    document.getElementById("apptDate").value = "";
    document.getElementById("apptTime").value = "";
    modal.style.display = "flex";
  }

  // Open modal pre-filled for editing
  function openModalForEdit(index) {
    editingIndex = index;
    const appt = appointments[index];
    document.getElementById("apptName").value = appt.name;
    document.getElementById("apptAge").value = appt.age || '';
    document.getElementById("apptGender").value = appt.gender || 'Male';
    document.getElementById("apptSymptoms").value = appt.symptoms || '';
    document.getElementById("apptDoctor").value = appt.doctor || 'Dr. Sharma';
    document.getElementById("apptDate").value = appt.date || '';
    document.getElementById("apptTime").value = appt.time || '';
    modal.style.display = "flex";
  }

  // Close modal
  function closeModal() {
    modal.style.display = "none";
    editingIndex = null;
  }

  // Core save handler (handles both create and edit)
  function handleSaveAppointment() {
    const name = document.getElementById("apptName").value.trim();
    const age = document.getElementById("apptAge").value.trim();
    const gender = document.getElementById("apptGender").value;
    const symptoms = document.getElementById("apptSymptoms").value.trim();
    const doctor = document.getElementById("apptDoctor").value;
    const date = document.getElementById("apptDate").value;
    const time = document.getElementById("apptTime").value;

    if (!name || !date || !time) {
      alert("Patient name, date and time are required!");
      return;
    }

    const apptObj = { name, age, gender, symptoms, doctor, date, time, status: 'Scheduled' };

    if (editingIndex === null) {
      // create
      appointments.push(apptObj);
      saveAppointments();
      renderTable();
      updateTodayCount();
      closeModal();
      alert("Appointment added!");
    } else {
      // edit existing
      appointments[editingIndex] = apptObj;
      saveAppointments();
      renderTable();
      updateTodayCount();
      closeModal();
      alert("Appointment updated!");
    }
  }

  // Attach event listeners
  newBtn.addEventListener('click', openModalForNew);
  cancelBtn.addEventListener('click', closeModal);

  // Close modal when clicking backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Single save handler bound once
  saveBtn.addEventListener('click', handleSaveAppointment);

  // Table-level delegation for edit / delete
  apptTableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const index = Number(row.dataset.index);

    if (e.target.classList.contains('delete-btn')) {
      if (!confirm('Delete this appointment?')) return;
      // remove from in-memory array and re-render
      appointments.splice(index, 1);
      saveAppointments();
      renderTable();
      updateTodayCount();
      return;
    }

    if (e.target.classList.contains('edit-btn')) {
      openModalForEdit(index);
      return;
    }
  });

  // Initial render on load
  renderTable();
  updateTodayCount();
})();
