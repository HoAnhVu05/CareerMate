package vn.careermate.contentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(
    basePackages = "vn.careermate.common.client",
    defaultConfiguration = vn.careermate.common.config.FeignClientConfiguration.class
)
@EnableJpaAuditing
@EntityScan("vn.careermate.contentservice.model")
@EnableJpaRepositories("vn.careermate.contentservice.repository")
public class ContentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContentServiceApplication.class, args);
    }
}
