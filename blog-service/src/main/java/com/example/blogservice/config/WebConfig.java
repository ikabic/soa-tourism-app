package com.example.blogservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Path UPLOAD_DIR = Paths.get("uploads", "blog-images");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/blogs/images/**")
                .addResourceLocations(UPLOAD_DIR.toAbsolutePath().toUri().toString())
                .setCachePeriod(3600);
    }
}
