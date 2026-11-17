document.addEventListener("DOMContentLoaded", () => {
    const api=window.UniCare,student=api.requireRole("student"); if(!student)return;
    const el=id=>document.getElementById(id),list=el("messageList"),empty=el("emptyMessages");
    el("profileName").textContent=student.name;
    el("profileInitial").textContent=(student.name||"S").trim().charAt(0).toUpperCase();
    function render(records){
        list.replaceChildren(); empty.hidden=records.length>0;
        records.forEach(m=>{
            const card=document.createElement("article");card.className="message-card";
            const h=document.createElement("h3"),p=document.createElement("p"),meta=document.createElement("small");
            h.textContent=m.subject;p.textContent=m.body;meta.textContent=`${new Date(m.createdAt).toLocaleString("en-KE")} · ${m.status||"Open"}`;card.append(h,p,meta);
            (m.replies||[]).forEach(reply=>{const r=document.createElement("p");r.className="staff-reply";r.textContent=`Staff reply (${new Date(reply.createdAt).toLocaleString("en-KE")}): ${reply.body}`;card.append(r);});
            list.append(card);
        });
    }
    async function load(){try{render(await api.apiRequest("/messages/my"));}catch(error){const f=el("messageFeedback");f.textContent=error.message;f.className="message error";}}
    el("messageForm").addEventListener("submit",async event=>{
        event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
        const feedback=el("messageFeedback");
        try{
            await api.apiRequest("/messages",{method:"POST",body:JSON.stringify({subject:el("messageSubject").value.trim(),body:el("messageBody").value.trim()})});
            form.reset();feedback.textContent="Message sent to the dispensary.";feedback.className="message success";await load();
        }catch(error){feedback.textContent=error.message;feedback.className="message error";}
    });
    el("logoutButton").addEventListener("click",event=>{event.preventDefault();api.logout();});
    load();
});
