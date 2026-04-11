package com.example.blogservice.service;

import com.example.blogservice.dto.CommentRequest;
import com.example.blogservice.dto.CommentResponse;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    CommentResponse addComment(UUID blogPostId, String authorId, CommentRequest request);
    List<CommentResponse> getComments(UUID blogPostId);
}
