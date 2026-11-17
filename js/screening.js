document.addEventListener("DOMContentLoaded", () => {
    const api = window.UniCare;
    const student = api.requireRole("student");
    if (!student) return;
    const el = id => document.getElementById(id);
    const form = el("screeningForm"), date = el("screeningDate"), body = el("screeningHistory"), message = el("screeningMessage");
    const today = new Date().toISOString().slice(0, 10);
    date.value = today; date.max = today;
    el("profileName").textContent = student.name;
    el("profileInitial").textContent = (student.name || "S").trim().charAt(0).toUpperCase();

    function render(records) {
        body.replaceChildren();
        if (!records.length) {
            const row=body.insertRow(), cell=row.insertCell();
            cell.colSpan=4; cell.className="empty-state"; cell.textContent="No screening forms submitted.";
            return;
        }
        records.forEach(item => {
            const row=body.insertRow();
            [item.date,item.wellbeing,item.symptoms||"—",item.updatedAt?new Date(item.updatedAt).toLocaleDateString("en-KE"):"—"]
                .forEach(value => row.insertCell().textContent=value);
        });
    }
    async function load() {
        try { render(await api.apiRequest("/screening/my")); }
        catch (error) { message.textContent=error.message; message.className="message error"; }
    }
    form.addEventListener("submit", async event => {
        event.preventDefault(); if (!form.reportValidity()) return;
        const payload={date:date.value,allergies:el("allergies").value.trim(),conditions:el("conditions").value.trim(),currentMedication:el("currentMedication").value.trim(),wellbeing:form.querySelector('input[name="wellbeing"]:checked')?.value,symptoms:el("symptoms").value.trim(),notes:el("screeningNotes").value.trim(),consent:el("screeningConsent").checked};
        try {
            await api.apiRequest("/screening",{method:"POST",body:JSON.stringify(payload)});
            message.textContent="Screening information saved."; message.className="message success"; await load();
        } catch (error) { message.textContent=error.message; message.className="message error"; }
    });
    el("logoutButton").addEventListener("click",event=>{event.preventDefault();api.logout();});
    load();
});
