package com.example.blogservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommentResponse {

    private final UUID id;
    private final UUID blogPostId;
    private final String authorId;
    private final String content;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public CommentResponse(UUID id, UUID blogPostId, String authorId, String content, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.blogPostId = blogPostId;
        this.authorId = authorId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public UUID getBlogPostId() { return blogPostId; }
    public String getAuthorId() { return authorId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
