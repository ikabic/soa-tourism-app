package com.example.blogservice.service;

import com.example.blogservice.dto.CommentRequest;
import com.example.blogservice.dto.CommentResponse;

import java.util.List;

public interface CommentService {
    CommentResponse addComment(String blogPostId, String authorId, CommentRequest request);
    List<CommentResponse> getComments(String blogPostId);
}
