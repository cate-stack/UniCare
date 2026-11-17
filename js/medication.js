document.addEventListener("DOMContentLoaded", async () => {
    const api=window.UniCare,student=api.requireRole("student"); if(!student)return;
    const el=id=>document.getElementById(id);
    el("profileName").textContent=student.name;
    el("profileInitial").textContent=(student.name||"S").trim().charAt(0).toUpperCase();
    const list=el("medicationList"),empty=el("emptyMedication"),filter=el("medicationFilter");
    let records=[];
    function render(){
        list.replaceChildren();
        const shown=records.filter(item=>filter.value==="All"||item.status===filter.value).sort((a,b)=>String(b.startDate).localeCompare(String(a.startDate)));
        empty.hidden=shown.length>0;
        el("activeCount").textContent=records.filter(item=>item.status==="Active").length;
        el("totalCount").textContent=records.length;
        const dates=records.map(item=>item.startDate).filter(Boolean).sort();
        el("lastUpdated").textContent=dates.length?new Date(dates.at(-1)+"T00:00:00").toLocaleDateString("en-KE"):"—";
        shown.forEach(item=>{
            const card=document.createElement("article");card.className="medication-card";
            const title=document.createElement("h3");title.textContent=item.name||"Medication";
            const badge=document.createElement("span");badge.className="badge "+String(item.status||"Active").toLowerCase();badge.textContent=item.status||"Active";
            const details=document.createElement("dl");
            [["Dose / instructions",item.dose],["Frequency",item.frequency],["Quantity",item.quantity],["Prescribed by",item.prescribedBy],["Start date",item.startDate],["End date",item.endDate],["Notes",item.notes]].forEach(([label,value])=>{if(!value)return;const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=label;dd.textContent=value;details.append(dt,dd);});
            card.append(title,badge,details);list.append(card);
        });
    }
    try{records=await api.apiRequest("/medications/my");render();}
    catch(error){empty.hidden=false;empty.textContent=error.message;}
    filter.addEventListener("change",render);
    el("logoutButton").addEventListener("click",event=>{event.preventDefault();api.logout();});
});
