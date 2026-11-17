document.addEventListener("DOMContentLoaded", async () => {
    const api=window.UniCare,staff=api.requireRole("staff");if(!staff)return;
    const el=id=>document.getElementById(id),readable=value=>value==null||value===""?"—":String(value);
    el("profileName").textContent=staff.name;el("profileInitial").textContent=(staff.name||"S").trim().charAt(0).toUpperCase();
    el("todayLabel").textContent=new Date().toLocaleDateString("en-KE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    let students=[],appointments=[],messages=[],screenings=[];
    function feedback(id,text,type="success"){el(id).textContent=text;el(id).className=`message ${type}`;}
    function button(label,handler){const b=document.createElement("button");b.type="button";b.className="table-action";b.textContent=label;b.addEventListener("click",handler);return b;}
    function stats(){el("studentCount").textContent=students.length;el("pendingAppointments").textContent=appointments.filter(a=>["Pending","Reschedule Requested"].includes(a.status)).length;el("unreadMessages").textContent=messages.filter(m=>m.status!=="Closed").length;}
    function renderStudents(){
        const q=el("studentSearch").value.trim().toLowerCase(),tbody=el("studentRows"),select=el("prescriptionStudent");tbody.replaceChildren();
        const filtered=students.filter(s=>[s.name,s.studentNumber,s.email].some(v=>String(v||"").toLowerCase().includes(q)));
        select.replaceChildren();const first=document.createElement("option");first.value="";first.textContent="Select a student";select.append(first);
        students.forEach(s=>{const option=document.createElement("option");option.value=s.id;option.textContent=`${s.name} (${s.studentNumber||s.email})`;select.append(option);});
        if(!filtered.length){const row=tbody.insertRow(),cell=row.insertCell();cell.colSpan=5;cell.className="empty-state";cell.textContent="No matching students.";return;}
        filtered.forEach(s=>{const row=tbody.insertRow();[s.name,s.studentNumber,s.email,s.course,s.yearOfStudy].forEach(v=>row.insertCell().textContent=readable(v));});
    }
    function renderAppointments(){
        const tbody=el("staffAppointmentRows");tbody.replaceChildren();const filter=el("appointmentFilter").value;
        const filtered=appointments.filter(a=>filter==="All"||(filter==="Open"&&["Pending","Reschedule Requested"].includes(a.status))||a.status===filter);
        if(!filtered.length){const row=tbody.insertRow(),cell=row.insertCell();cell.colSpan=6;cell.className="empty-state";cell.textContent="No appointments in this view.";return;}
        filtered.forEach(a=>{
            const row=tbody.insertRow(),student=row.insertCell(),details=row.insertCell(),schedule=row.insertCell();
            student.textContent=`${a.studentName||"Student"}\n${a.studentNumber||""}`;
            details.textContent=`${a.service||"—"} · ${a.visitType||"—"}\n${a.reason||"—"}`;
            const req=a.rescheduleRequest;schedule.textContent=`${a.date||"—"} ${String(a.time||"").slice(0,5)}${req?` → Requested: ${req.requestedDate} ${String(req.requestedTime).slice(0,5)}`:""}`;
            row.insertCell().textContent=a.status;
            const note=row.insertCell(),input=document.createElement("input");input.maxLength=300;input.placeholder="Private staff note";input.value=a.staffNotes||"";
            note.append(input,button("Save note",()=>updateAppointment(a.id,a.status,input.value.trim())));
            const actions=row.insertCell();
            if(a.status==="Pending")actions.append(button("Confirm",()=>updateAppointment(a.id,"Confirmed")),button("Cancel",()=>updateAppointment(a.id,"Cancelled")));
            if(a.status==="Confirmed")actions.append(button("Complete",()=>updateAppointment(a.id,"Completed")),button("Cancel",()=>updateAppointment(a.id,"Cancelled")));
            if(a.status==="Reschedule Requested")actions.append(button("Approve new time",()=>updateAppointment(a.id,"Confirmed")),button("Decline request",()=>updateAppointment(a.id,"Reschedule Declined")));
            if(!actions.childElementCount)actions.textContent="—";
        });
    }
    async function updateAppointment(id,status,staffNotes){
        try{await api.apiRequest(`/staff/appointments/${id}`,{method:"PATCH",body:JSON.stringify({status,staffNotes})});feedback("staffFeedback","Appointment updated.");await loadAll();}
        catch(error){feedback("staffFeedback",error.message,"error");}
    }
    function renderMessages(){
        const list=el("staffMessageList");list.replaceChildren();el("emptyStaffMessages").hidden=messages.length>0;
        messages.forEach(m=>{
            const card=document.createElement("article");card.className="message-card";
            const h=document.createElement("h3"),p=document.createElement("p"),meta=document.createElement("small");
            h.textContent=`${m.subject} · ${m.studentName||"Student"} (${m.studentNumber||""})`;p.textContent=m.body;meta.textContent=`${new Date(m.createdAt).toLocaleString("en-KE")} · ${m.status}`;card.append(h,p,meta);
            (m.replies||[]).forEach(rep=>{const reply=document.createElement("p");reply.textContent=`${rep.by||"Staff"}: ${rep.body}`;card.append(reply);});
            if(m.status!=="Closed"){
                const form=document.createElement("form"),input=document.createElement("textarea"),send=document.createElement("button");input.required=true;input.maxLength=2000;input.placeholder="Write a reply";send.type="submit";send.className="secondary-btn";send.textContent="Reply";form.append(input,send);
                form.addEventListener("submit",async event=>{event.preventDefault();try{await api.apiRequest(`/staff/messages/${m.id}/reply`,{method:"POST",body:JSON.stringify({body:input.value.trim()})});await loadAll();}catch(error){feedback("staffFeedback",error.message,"error");}});
                card.append(form,button("Close conversation",async()=>{try{await api.apiRequest(`/staff/messages/${m.id}/close`,{method:"PATCH"});await loadAll();}catch(error){feedback("staffFeedback",error.message,"error");}}));
            }
            list.append(card);
        });
    }
    function renderScreenings(){
        const tbody=el("screeningRows");tbody.replaceChildren();
        if(!screenings.length){const row=tbody.insertRow(),cell=row.insertCell();cell.colSpan=6;cell.className="empty-state";cell.textContent="No screening forms submitted.";return;}
        screenings.forEach(s=>{const row=tbody.insertRow();[`${s.studentName||"Student"} (${s.studentNumber||""})`,s.date,s.wellbeing,s.allergies,s.conditions,s.symptoms].forEach(v=>row.insertCell().textContent=readable(v));});
    }
    async function loadAll(){
        try{
            [students,appointments,messages,screenings]=await Promise.all([
                api.apiRequest("/staff/students"),api.apiRequest("/staff/appointments"),api.apiRequest("/staff/messages"),api.apiRequest("/staff/screenings")
            ]);
            stats();renderStudents();renderAppointments();renderMessages();renderScreenings();
        }catch(error){feedback("staffFeedback",error.message,"error");}
    }
    el("appointmentFilter").addEventListener("change",renderAppointments);
    el("studentSearch").addEventListener("input",renderStudents);
    el("prescriptionForm").addEventListener("submit",async event=>{
        event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
        const start=el("medicineStart").value,end=el("medicineEnd").value;if(end<start){feedback("prescriptionFeedback","End date must be on or after the start date.","error");return;}
        const payload={studentId:Number(el("prescriptionStudent").value),name:el("medicineName").value.trim(),dose:el("medicineDose").value.trim(),frequency:el("medicineFrequency").value.trim(),startDate:start,endDate:end,quantity:el("medicineQuantity").value.trim(),notes:el("medicineNotes").value.trim()};
        try{await api.apiRequest("/staff/medications",{method:"POST",body:JSON.stringify(payload)});form.reset();feedback("prescriptionFeedback","Prescription record saved.");}
        catch(error){feedback("prescriptionFeedback",error.message,"error");}
    });
    el("logoutButton").addEventListener("click",event=>{event.preventDefault();api.logout();});
    await loadAll();
});
