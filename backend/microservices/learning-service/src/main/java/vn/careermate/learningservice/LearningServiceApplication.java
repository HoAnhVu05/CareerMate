package vn.careermate.learningservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "vn.careermate.common.client")
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
@EntityScan("vn.careermate.learningservice.model")
@EnableJpaRepositories("vn.careermate.learningservice.repository")
public class LearningServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LearningServiceApplication.class, args);
    }
}
