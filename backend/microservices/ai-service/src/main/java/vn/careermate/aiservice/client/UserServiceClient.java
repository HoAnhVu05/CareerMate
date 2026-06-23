package vn.careermate.aiservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import vn.careermate.aiservice.dto.CVDTO;

import java.util.UUID;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/users/cvs/{cvId}")
    CVDTO getCVById(@PathVariable("cvId") UUID cvId);
}
