package vn.careermate.aiservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "vn.careermate.common.client")
@EnableJpaAuditing
@EntityScan("vn.careermate.aiservice.model")
@EnableJpaRepositories("vn.careermate.aiservice.repository")
public class AIServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AIServiceApplication.class, args);
    }
}
