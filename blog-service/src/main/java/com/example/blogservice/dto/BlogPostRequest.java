package com.example.blogservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class BlogPostRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private List<String> imageUrls;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
