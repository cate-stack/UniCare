
/* ==================================================
   UNICARE - APPOINTMENT MANAGEMENT MODULE
   Student Booking, Cancellation, Rescheduling
================================================== */

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------------
    // 1. AUTHENTICATION AND SESSION VALIDATION
    // ------------------------------------------

    const sessionData = localStorage.getItem("dispensarySession");

    if (!sessionData) {
        window.location.href = "../index.html";
        return;
    }

    const session = JSON.parse(sessionData);

    if (session.role !== "student") {
        window.location.href = "../index.html";
        return;
    }

    const users = JSON.parse(
        localStorage.getItem("dispensaryUsers") || "[]"
    );

    const student = users.find(user => user.id === session.id);

    if (!student) {
        localStorage.removeItem("dispensarySession");
        window.location.href = "../index.html";
        return;
    }


    // ------------------------------------------
    // 2. STORAGE FUNCTIONS
    // ------------------------------------------

    function getAppointments() {
        return JSON.parse(
            localStorage.getItem("dispensaryAppointments") || "[]"
        );
    }

    function saveAppointments(appointments) {
        localStorage.setItem(
            "dispensaryAppointments",
            JSON.stringify(appointments)
        );
    }

    function showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);

        element.textContent = message;
        element.className = "message " + type;
    }

    function getToday() {
        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    // ------------------------------------------
    // 3. DISPLAY STUDENT PROFILE
    // ------------------------------------------

    document.getElementById("profileName").textContent =
        student.name;

    document.getElementById("profileInitial").textContent =
        student.name.charAt(0).toUpperCase();


    // ------------------------------------------
    // 4. SET MINIMUM APPOINTMENT DATE
    // ------------------------------------------

    const appointmentDate =
        document.getElementById("appointmentDate");

    const newAppointmentDate =
        document.getElementById("newAppointmentDate");

    appointmentDate.min = getToday();
    newAppointmentDate.min = getToday();


    // ------------------------------------------
    // 5. CHECK APPOINTMENT SLOT AVAILABILITY
    // ------------------------------------------

    function isSlotAvailable(date, time, ignoredId = null) {

        const appointments = getAppointments();

        return !appointments.some(function (item) {

            const isAnotherBooking = item.id !== ignoredId;

            const occupiesSlot = [
                "Pending",
                "Confirmed",
                "Reschedule Requested"
            ].includes(item.status);

            return isAnotherBooking &&
                   occupiesSlot &&
                   item.date === date &&
                   item.time === time;

        });

    }


    // ------------------------------------------
    // 6. UPDATE APPOINTMENT STATISTICS
    // ------------------------------------------

    function updateStatistics() {

        const appointments = getAppointments().filter(function (item) {
            return item.studentId === student.id;
        });

        const pending = appointments.filter(function (item) {
            return item.status === "Pending";
        });

        const confirmed = appointments.filter(function (item) {
            return item.status === "Confirmed";
        });

        document.getElementById("totalBookings").textContent =
            appointments.length;

        document.getElementById("pendingBookings").textContent =
            pending.length;

        document.getElementById("confirmedBookings").textContent =
            confirmed.length;

    }


    // ------------------------------------------
    // 7. DISPLAY APPOINTMENT RECORDS
    // ------------------------------------------

    function displayAppointments() {

        const tableBody =
            document.getElementById("appointmentsTableBody");

        const filter =
            document.getElementById("statusFilter").value;

        const appointments = getAppointments()
            .filter(function (item) {
                return item.studentId === student.id;
            })
            .filter(function (item) {
                return filter === "All" || item.status === filter;
            })
            .sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

        tableBody.innerHTML = "";

        if (appointments.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.className = "empty-state";
            cell.textContent = "No appointments found.";

            row.appendChild(cell);
            tableBody.appendChild(row);

            return;
        }

        appointments.forEach(function (appointment) {

            const row = document.createElement("tr");

            const values = [
                appointment.id,
                appointment.service,
                formatDate(appointment.date),
                formatTime(appointment.time)
            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");
                cell.textContent = value;

                row.appendChild(cell);

            });


            // STATUS COLUMN

            const statusCell = document.createElement("td");

            const statusBadge = document.createElement("span");

            statusBadge.className =
                "status-badge " +
                appointment.status.toLowerCase().replaceAll(" ", "-");

            statusBadge.textContent = appointment.status;

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);


            // ACTION COLUMN

            const actionCell = document.createElement("td");

            if (["Pending", "Confirmed"].includes(appointment.status)) {

                const rescheduleButton =
                    document.createElement("button");

                rescheduleButton.type = "button";
                rescheduleButton.textContent = "Reschedule";
                rescheduleButton.className = "table-action reschedule-action";

                rescheduleButton.addEventListener("click", function () {
                    openRescheduleModal(appointment.id);
                });

                const cancelButton =
                    document.createElement("button");

                cancelButton.type = "button";
                cancelButton.textContent = "Cancel";
                cancelButton.className = "table-action cancel-action";

                cancelButton.addEventListener("click", function () {
                    cancelAppointment(appointment.id);
                });

                actionCell.append(
                    rescheduleButton,
                    cancelButton
                );

            } else {

                actionCell.textContent = "No actions available";

            }

            row.appendChild(actionCell);

            tableBody.appendChild(row);

        });

    }


    // ------------------------------------------
    // 8. DATE AND TIME FORMATTING
    // ------------------------------------------

    function formatDate(date) {

        return new Date(date + "T00:00:00")
            .toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

    }

    function formatTime(time) {

        const [hours, minutes] = time.split(":");

        const date = new Date();

        date.setHours(Number(hours), Number(minutes));

        return date.toLocaleTimeString("en-KE", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });

    }


    // ------------------------------------------
    // 9. BOOK A NEW APPOINTMENT
    // ------------------------------------------

    const appointmentForm =
        document.getElementById("appointmentForm");

    appointmentForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const service =
            document.getElementById("appointmentService").value;

        const date =
            document.getElementById("appointmentDate").value;

        const time =
            document.getElementById("appointmentTime").value;

        const visitType =
            document.getElementById("appointmentType").value;

        const reason =
            document.getElementById("appointmentReason").value.trim();

        const notes =
            document.getElementById("additionalNotes").value.trim();

        if (!service || !date || !time || !visitType || !reason) {

            showMessage(
                "appointmentMessage",
                "Please complete all required fields.",
                "error"
            );

            return;
        }

        if (date < getToday()) {

            showMessage(
                "appointmentMessage",
                "You cannot book an appointment for a past date.",
                "error"
            );

            return;
        }

        if (!isSlotAvailable(date, time)) {

            showMessage(
                "appointmentMessage",
                "This time slot is already booked. Please choose another time.",
                "error"
            );

            return;
        }

        const appointments = getAppointments();

        const newAppointment = {

            id: "APT-" + Date.now(),

            studentId: student.id,

            studentName: student.name,

            studentNumber: student.studentNumber,

            service: service,

            date: date,

            time: time,

            visitType: visitType,

            reason: reason,

            notes: notes,

            status: "Pending",

            createdAt: new Date().toISOString(),

            rescheduleRequest: null,

            reviewedBy: null,

            staffNotes: ""

        };

        appointments.push(newAppointment);

        saveAppointments(appointments);

        appointmentForm.reset();

        showMessage(
            "appointmentMessage",
            "Appointment request submitted successfully! Await staff approval.",
            "success"
        );

        updateStatistics();
        displayAppointments();

    });


    // ------------------------------------------
    // 10. CANCEL AN APPOINTMENT
    // ------------------------------------------

    function cancelAppointment(appointmentId) {

        const confirmed = confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmed) return;

        const appointments = getAppointments();

        const appointment = appointments.find(function (item) {
            return item.id === appointmentId &&
                   item.studentId === student.id;
        });

        if (!appointment) return;

        if (!["Pending", "Confirmed"].includes(appointment.status)) {
            alert("This appointment cannot be cancelled.");
            return;
        }

        appointment.status = "Cancelled";
        appointment.cancelledAt = new Date().toISOString();

        saveAppointments(appointments);

        updateStatistics();
        displayAppointments();

        alert("Your appointment has been cancelled successfully.");

    }


    // ------------------------------------------
    // 11. OPEN RESCHEDULE MODAL
    // ------------------------------------------

    const rescheduleModal =
        document.getElementById("rescheduleModal");

    function openRescheduleModal(appointmentId) {

        const appointments = getAppointments();

        const appointment = appointments.find(function (item) {
            return item.id === appointmentId &&
                   item.studentId === student.id;
        });

        if (!appointment) return;

        if (!["Pending", "Confirmed"].includes(appointment.status)) {
            alert("This appointment cannot be rescheduled.");
            return;
        }

        document.getElementById("rescheduleAppointmentId").value =
            appointment.id;

        document.getElementById("newAppointmentDate").value = "";

        document.getElementById("newAppointmentTime").value = "";

        document.getElementById("rescheduleMessage").textContent = "";

        rescheduleModal.classList.add("active");

    }


    // ------------------------------------------
    // 12. CLOSE RESCHEDULE MODAL
    // ------------------------------------------

    function closeRescheduleModal() {
        rescheduleModal.classList.remove("active");
    }

    document.getElementById("closeModal")
        .addEventListener("click", closeRescheduleModal);

    rescheduleModal.addEventListener("click", function (event) {

        if (event.target === rescheduleModal) {
            closeRescheduleModal();
        }

    });


    // ------------------------------------------
    // 13. SUBMIT RESCHEDULE REQUEST
    // ------------------------------------------

    const rescheduleForm =
        document.getElementById("rescheduleForm");

    rescheduleForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const appointmentId =
            document.getElementById("rescheduleAppointmentId").value;

        const newDate =
            document.getElementById("newAppointmentDate").value;

        const newTime =
            document.getElementById("newAppointmentTime").value;

        if (!newDate || !newTime) {

            showMessage(
                "rescheduleMessage",
                "Please select a new date and time.",
                "error"
            );

            return;
        }

        if (newDate < getToday()) {

            showMessage(
                "rescheduleMessage",
                "Please select a future date.",
                "error"
            );

            return;
        }

        const appointments = getAppointments();

        const appointment = appointments.find(function (item) {
            return item.id === appointmentId &&
                   item.studentId === student.id;
        });

        if (!appointment ||
            !["Pending", "Confirmed"].includes(appointment.status)) {

            showMessage(
                "rescheduleMessage",
                "This appointment is no longer available for rescheduling.",
                "error"
            );

            return;
        }

        if (!isSlotAvailable(newDate, newTime, appointmentId)) {

            showMessage(
                "rescheduleMessage",
                "The selected time slot is unavailable.",
                "error"
            );

            return;
        }

        appointment.rescheduleRequest = {
            requestedDate: newDate,
            requestedTime: newTime,
            requestedAt: new Date().toISOString()
        };

        appointment.status = "Reschedule Requested";

        saveAppointments(appointments);

        rescheduleForm.reset();

        showMessage(
            "rescheduleMessage",
            "Your rescheduling request has been submitted for staff review.",
            "success"
        );

        updateStatistics();
        displayAppointments();

        setTimeout(closeRescheduleModal, 1300);

    });


    // ------------------------------------------
    // 14. FILTER APPOINTMENTS
    // ------------------------------------------

    document.getElementById("statusFilter")
        .addEventListener("change", function () {

            displayAppointments();

        });


    // ------------------------------------------
    // 15. LOGOUT
    // ------------------------------------------

    document.getElementById("logoutButton")
        .addEventListener("click", function (event) {

            event.preventDefault();

            if (confirm("Are you sure you want to log out?")) {

                localStorage.removeItem("dispensarySession");

                window.location.href = "../index.html";

            }

        });


    // ------------------------------------------
    // 16. INITIALIZE MODULE
    // ------------------------------------------

    updateStatistics();
    displayAppointments();

});
