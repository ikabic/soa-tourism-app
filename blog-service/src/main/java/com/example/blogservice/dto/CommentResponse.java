package com.example.blogservice.dto;

import java.time.LocalDateTime;

public class CommentResponse {

    private final String id;
    private final String blogPostId;
    private final String authorId;
    private final String content;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public CommentResponse(String id, String blogPostId, String authorId, String content, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.blogPostId = blogPostId;
        this.authorId = authorId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public String getBlogPostId() { return blogPostId; }
    public String getAuthorId() { return authorId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
