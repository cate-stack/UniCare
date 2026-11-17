package com.unicare.dispensary.medication;

import com.unicare.dispensary.student.Student;
import com.unicare.dispensary.student.StudentRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service public class PrescriptionService {
    private final PrescriptionRepository prescriptions; private final StudentRepository students;
    public PrescriptionService(PrescriptionRepository prescriptions,StudentRepository students){this.prescriptions=prescriptions;this.students=students;}
    @Transactional public PrescriptionResponse issue(PrescriptionRequest r,String staff){
        if(r.endDate().isBefore(r.startDate())||r.startDate().isBefore(LocalDate.now()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Prescription dates are invalid.");
        Student s=students.findById(r.studentId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Student not found."));
        return PrescriptionResponse.from(prescriptions.save(new Prescription(s,r.name().trim(),r.dose().trim(),r.frequency().trim(),r.startDate(),r.endDate(),clean(r.quantity()),clean(r.notes()),staff)));
    }
    @Transactional(readOnly=true) public List<PrescriptionResponse> forStudent(String email){Student s=students.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Student not found."));return prescriptions.findByStudentIdOrderByCreatedAtDesc(s.getId()).stream().map(PrescriptionResponse::from).toList();}
    @Transactional(readOnly=true) public List<PrescriptionResponse> all(){return prescriptions.findAll().stream().map(PrescriptionResponse::from).toList();}
    @Transactional public PrescriptionResponse status(Long id,PrescriptionStatus status){Prescription p=prescriptions.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Prescription not found."));p.setStatus(status);return PrescriptionResponse.from(p);}
    private static String clean(String x){return x==null||x.isBlank()?null:x.trim();}
}
