package vn.careermate.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.careermate.userservice.model.StudentSkill;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillDTO {
    private UUID id;
    private String skillName;
    private StudentSkill.ProficiencyLevel proficiencyLevel;
    private BigDecimal yearsOfExperience;
}

