
/* ==========================================
   UNICARE STUDENT DASHBOARD MODULE
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // ======================================
    // 1. CHECK AUTHENTICATION
    // ======================================

    const sessionData =
        localStorage.getItem("dispensarySession");

    if (!sessionData) {
        window.location.href = "../index.html";
        return;
    }

    const session = JSON.parse(sessionData);

    if (session.role !== "student") {
        window.location.href = "../index.html";
        return;
    }


    // ======================================
    // 2. RETRIEVE STUDENT INFORMATION
    // ======================================

    const users = JSON.parse(
        localStorage.getItem("dispensaryUsers") || "[]"
    );

    const student = users.find(function (user) {
        return user.id === session.id;
    });

    if (!student) {
        localStorage.removeItem("dispensarySession");
        window.location.href = "../index.html";
        return;
    }


    // ======================================
    // 3. DISPLAY STUDENT PROFILE
    // ======================================

    document.getElementById("welcomeName").textContent =
        "Welcome back, " + student.name.split(" ")[0] + "!";

    document.getElementById("profileName").textContent =
        student.name;

    document.getElementById("profileInitial").textContent =
        student.name.charAt(0).toUpperCase();

    document.getElementById("studentNumber").textContent =
        student.studentNumber;

    document.getElementById("studentCourse").textContent =
        student.course;

    document.getElementById("studentYear").textContent =
        student.yearOfStudy;


    // ======================================
    // 4. DISPLAY CURRENT DATE
    // ======================================

    const currentDate = new Date();

    document.getElementById("currentDate").textContent =
        currentDate.toLocaleDateString("en-KE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });


    // ======================================
    // 5. RETRIEVE STUDENT APPOINTMENTS
    // ======================================

    const allAppointments = JSON.parse(
        localStorage.getItem("dispensaryAppointments") || "[]"
    );

    const appointments = allAppointments.filter(function (item) {
        return item.studentId === student.id;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = appointments.filter(function (item) {

        const appointmentDate = new Date(item.date + "T00:00:00");

        return appointmentDate >= today &&
               ["Pending", "Confirmed"].includes(item.status);

    });


    // ======================================
    // 6. RETRIEVE MEDICATION RECORDS
    // ======================================

    const allMedications = JSON.parse(
        localStorage.getItem("dispensaryMedications") || "[]"
    );

    const medications = allMedications.filter(function (item) {
        return item.studentId === student.id &&
               item.status === "Active";
    });


    // ======================================
    // 7. UPDATE STATISTICS
    // ======================================

    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("upcomingAppointments").textContent =
        upcoming.length;

    document.getElementById("activePrescriptions").textContent =
        medications.length;


    // ======================================
    // 8. DISPLAY RECENT APPOINTMENTS
    // ======================================

    const appointmentTable =
        document.getElementById("appointmentTable");

    appointmentTable.innerHTML = "";

    const recentAppointments = [...appointments]
        .sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        })
        .slice(0, 5);

    if (recentAppointments.length === 0) {

        appointmentTable.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No appointments have been booked yet.
                    <br>
                    Visit the Appointments section to make a booking.
                </td>
            </tr>
        `;

    } else {

        recentAppointments.forEach(function (appointment) {

            const row = document.createElement("tr");

            const cells = [
                appointment.id,
                appointment.service,
                new Date(appointment.date + "T00:00:00")
                    .toLocaleDateString("en-KE"),
                appointment.time,
                appointment.status
            ];

            cells.forEach(function (value, index) {

                const cell = document.createElement("td");

                if (index === 4) {

                    const status = document.createElement("span");

                    status.className =
                        "status-badge " +
                        String(value).toLowerCase();

                    status.textContent = value;

                    cell.appendChild(status);

                } else {

                    cell.textContent = value;

                }

                row.appendChild(cell);

            });

            appointmentTable.appendChild(row);

        });

    }


    // ======================================
    // 9. LOGOUT FUNCTIONALITY
    // ======================================

    const logoutButton =
        document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function (event) {

        event.preventDefault();

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if (confirmLogout) {

            localStorage.removeItem("dispensarySession");

            window.location.href = "../index.html";

        }

    });

});
