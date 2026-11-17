package com.unicare.dispensary.medication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PrescriptionRepository extends JpaRepository<Prescription,Long>{List<Prescription> findByStudentIdOrderByCreatedAtDesc(Long studentId);}
