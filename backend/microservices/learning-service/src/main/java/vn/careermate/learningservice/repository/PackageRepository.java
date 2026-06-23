package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.Package;

import java.util.UUID;

@Repository
public interface PackageRepository extends JpaRepository<Package, UUID> {
}
